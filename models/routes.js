import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Routes extends Model {
    /**
     * Helper method for defining associations.
     */
    static associate(models) {
      // Una ruta tiene muchos clientes a través de RouteClients
      Routes.belongsToMany(models.Clients, {
        through: models.RouteClients,
        foreignKey: 'routeId',
        otherKey: 'clientId',
        as: 'clients',
      });

      // Una ruta tiene muchas ejecuciones
      Routes.hasMany(models.RouteExecutions, {
        foreignKey: 'routeId',
        as: 'executions',
      });

      // Una ruta tiene muchos pagos a través de las ejecuciones
      Routes.hasMany(models.Payments, {
        foreignKey: 'routeId',
        as: 'payments',
      });
    }

    // Instance methods
    isActive() {
      return this.status === 'active';
    }

    getClientCount() {
      return this.clients ? this.clients.length : 0;
    }

    // Static methods
    static async findActive() {
      return this.findAll({
        where: { status: 'active' },
        include: [
          {
            model: sequelize.models.Clients,
            as: 'clients',
            attributes: ['id', 'firstName', 'lastName', 'identificationNumber'],
          },
        ],
      });
    }

    static async getStats() {
      const { Op } = sequelize.Sequelize;

      // Contar rutas totales
      const totalRoutes = await this.count();

      // Contar rutas activas
      const activeRoutes = await this.count({
        where: { status: 'active' },
      });

      // Contar rutas inactivas
      const inactiveRoutes = await this.count({
        where: { status: 'inactive' },
      });

      // Obtener fecha del primer día del mes actual
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // Contar rutas creadas este mes
      const newRoutesThisMonth = await this.count({
        where: {
          createdAt: {
            [Op.gte]: firstDayOfMonth,
          },
        },
      });

      return {
        totalRoutes,
        activeRoutes,
        inactiveRoutes,
        newRoutesThisMonth,
      };
    }
  }

  Routes.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [3, 100],
        },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM('active', 'inactive', 'archived'),
        defaultValue: 'active',
      },
      dayOfWeek: {
        type: DataTypes.ENUM(
          'monday',
          'tuesday',
          'wednesday',
          'thursday',
          'friday',
          'saturday',
          'sunday'
        ),
        allowNull: true,
        comment: 'Día de la semana asignado para esta ruta',
      },
      startTime: {
        type: DataTypes.TIME,
        allowNull: true,
        comment: 'Hora de inicio sugerida para la ruta',
      },
      estimatedDuration: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Duración estimada en minutos',
      },
      priority: {
        type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
        defaultValue: 'medium',
      },
      color: {
        type: DataTypes.STRING(7),
        allowNull: true,
        validate: {
          is: /^#[0-9A-F]{6}$/i,
        },
        comment: 'Color hexadecimal para identificar la ruta visualmente',
      },
      observations: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      // Campos calculados virtuales
      totalClients: {
        type: DataTypes.VIRTUAL,
        get() {
          return this.clients ? this.clients.length : 0;
        },
      },
      totalActiveCredits: {
        type: DataTypes.VIRTUAL,
        get() {
          if (!this.clients) return 0;
          return this.clients.reduce((sum, client) => {
            return sum + (client.activeCreditsCount || 0);
          }, 0);
        },
      },
    },
    {
      sequelize,
      modelName: 'Routes',

      // Hooks
      hooks: {
        beforeCreate: route => {
          route.name = route.name.trim();
          if (route.description) route.description = route.description.trim();
        },
        beforeUpdate: route => {
          if (route.name) route.name = route.name.trim();
          if (route.description) route.description = route.description.trim();
        },
      },

      // Indexes
      indexes: [
        { fields: ['status'] },
        { fields: ['dayOfWeek'] },
        { fields: ['priority'] },
        { fields: ['createdAt'] },
      ],

      // Scopes
      scopes: {
        active: {
          where: { status: 'active' },
        },
        byDay: day => ({
          where: { dayOfWeek: day },
        }),
        withClients: {
          include: [
            {
              model: sequelize.models.Clients,
              as: 'clients',
              attributes: [
                'id',
                'firstName',
                'lastName',
                'identificationNumber',
                'phone',
                'address',
              ],
            },
          ],
        },
      },
    }
  );

  return Routes;
};
