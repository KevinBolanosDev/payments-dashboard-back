import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class RouteClients extends Model {
    /**
     * Helper method for defining associations.
     */
    static associate(models) {
      // Pertenece a una ruta
      RouteClients.belongsTo(models.Routes, {
        foreignKey: 'routeId',
        as: 'route',
      });

      // Pertenece a un cliente
      RouteClients.belongsTo(models.Clients, {
        foreignKey: 'clientId',
        as: 'client',
      });
    }

    // Instance methods
    isActive() {
      return this.status === 'active';
    }

    // Static methods
    static async getRouteClients(routeId) {
      return this.findAll({
        where: { routeId },
        include: [
          {
            model: sequelize.models.Clients,
            as: 'client',
            attributes: [
              'id',
              'firstName',
              'lastName',
              'identificationNumber',
              'phone',
              'address',
              'currentBalance',
            ],
            include: [
              {
                model: sequelize.models.Credits,
                as: 'credits',
                where: { status: 'active' },
                required: false,
                attributes: ['id', 'amount', 'dueDate', 'interestRate'],
              },
            ],
          },
        ],
        order: [['visitOrder', 'ASC']],
      });
    }

    static async addClientToRoute(routeId, clientId, options = {}) {
      const { visitOrder, priority = 'medium', observations } = options;

      // Verificar si ya existe la relación
      const existing = await this.findOne({
        where: { routeId, clientId },
      });

      if (existing) {
        throw new Error('El cliente ya está asignado a esta ruta');
      }

      // Si no se especifica orden, asignar el siguiente disponible
      let finalVisitOrder = visitOrder;
      if (!finalVisitOrder) {
        const maxOrder = await this.max('visitOrder', {
          where: { routeId },
        });
        finalVisitOrder = (maxOrder || 0) + 1;
      }

      return this.create({
        routeId,
        clientId,
        visitOrder: finalVisitOrder,
        priority,
        observations,
        status: 'active',
      });
    }
  }

  RouteClients.init(
    {
      routeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Routes',
          key: 'id',
        },
        validate: {
          notNull: {
            msg: 'Route ID is required',
          },
        },
      },
      clientId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Clients',
          key: 'id',
        },
        validate: {
          notNull: {
            msg: 'Client ID is required',
          },
        },
      },
      visitOrder: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
          min: {
            args: [1],
            msg: 'Visit order must be at least 1',
          },
        },
        comment: 'Orden de visita del cliente en la ruta',
      },
      priority: {
        type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
        defaultValue: 'medium',
        comment: 'Prioridad específica del cliente en esta ruta',
      },
      status: {
        type: DataTypes.ENUM('active', 'inactive', 'completed'),
        defaultValue: 'active',
      },
      lastVisitDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: 'Última fecha en que se visitó este cliente en esta ruta',
      },
      observations: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Observaciones específicas para este cliente en esta ruta',
      },
      estimatedCollectionAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0.0,
        get() {
          const value = this.getDataValue('estimatedCollectionAmount');
          return value ? parseFloat(value) : 0;
        },
        comment: 'Monto estimado a cobrar en esta ruta',
      },
    },
    {
      sequelize,
      modelName: 'RouteClients',

      // Constraints
      indexes: [
        {
          unique: true,
          fields: ['routeId', 'clientId'],
          name: 'unique_route_client',
        },
        { fields: ['routeId'] },
        { fields: ['clientId'] },
        { fields: ['visitOrder'] },
        { fields: ['priority'] },
        { fields: ['status'] },
      ],

      // Scopes
      scopes: {
        active: {
          where: { status: 'active' },
        },
        byRoute: routeId => ({
          where: { routeId },
        }),
        ordered: {
          order: [['visitOrder', 'ASC']],
        },
      },
    }
  );

  return RouteClients;
};
