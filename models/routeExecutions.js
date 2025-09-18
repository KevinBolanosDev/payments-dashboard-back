import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class RouteExecutions extends Model {
    /**
     * Helper method for defining associations.
     */
    static associate(models) {
      // Pertenece a una ruta
      RouteExecutions.belongsTo(models.Routes, {
        foreignKey: 'routeId',
        as: 'route',
      });

      // Tiene muchos pagos
      RouteExecutions.hasMany(models.Payments, {
        foreignKey: 'routeExecutionId',
        as: 'payments',
      });
    }

    // Instance methods
    isCompleted() {
      return this.status === 'completed';
    }

    isInProgress() {
      return this.status === 'in_progress';
    }

    getTotalCollected() {
      if (!this.payments) return 0;
      return this.payments.reduce((sum, payment) => {
        return sum + (payment.amount || 0);
      }, 0);
    }

    getCompletionPercentage() {
      if (!this.totalClientsPlanned || this.totalClientsPlanned === 0) return 0;
      return Math.round((this.clientsVisited / this.totalClientsPlanned) * 100);
    }

    // Static methods
    static async createExecution(routeId, executionDate, options = {}) {
      const { executorName, observations, estimatedStartTime, estimatedEndTime } = options;

      // Verificar si ya existe una ejecución para esta ruta en esta fecha
      const existing = await this.findOne({
        where: {
          routeId,
          executionDate: executionDate,
        },
      });

      if (existing) {
        throw new Error('Ya existe una ejecución para esta ruta en esta fecha');
      }

      // Contar clientes activos en la ruta
      const totalClients = await sequelize.models.RouteClients.count({
        where: {
          routeId,
          status: 'active',
        },
      });

      return this.create({
        routeId,
        executionDate,
        executorName,
        status: 'planned',
        totalClientsPlanned: totalClients,
        clientsVisited: 0,
        totalCollected: 0.0,
        estimatedStartTime,
        estimatedEndTime,
        observations,
      });
    }

    static async getTodayExecutions() {
      const today = new Date().toISOString().split('T')[0];

      return this.findAll({
        where: { executionDate: today },
        include: [
          {
            model: sequelize.models.Routes,
            as: 'route',
            attributes: ['id', 'name', 'color', 'priority'],
          },
          {
            model: sequelize.models.Payments,
            as: 'payments',
            attributes: ['id', 'amount', 'paymentType', 'status'],
          },
        ],
        order: [['estimatedStartTime', 'ASC']],
      });
    }

    static async getExecutionStats(routeId, startDate, endDate) {
      const { Op } = sequelize.Sequelize;

      const executions = await this.findAll({
        where: {
          routeId,
          executionDate: {
            [Op.between]: [startDate, endDate],
          },
        },
        include: [
          {
            model: sequelize.models.Payments,
            as: 'payments',
            attributes: ['amount', 'paymentType', 'status'],
          },
        ],
      });

      const stats = {
        totalExecutions: executions.length,
        completedExecutions: executions.filter(e => e.status === 'completed').length,
        totalCollected: executions.reduce((sum, e) => sum + parseFloat(e.totalCollected || 0), 0),
        averageClientsVisited:
          executions.length > 0
            ? executions.reduce((sum, e) => sum + e.clientsVisited, 0) / executions.length
            : 0,
        successRate:
          executions.length > 0
            ? (executions.filter(e => e.status === 'completed').length / executions.length) * 100
            : 0,
      };

      return stats;
    }
  }

  RouteExecutions.init(
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
      executionDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
          notNull: {
            msg: 'Execution date is required',
          },
          isDate: {
            msg: 'Must be a valid date',
          },
        },
        comment: 'Fecha de ejecución de la ruta',
      },
      executorName: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          len: [2, 100],
        },
        comment: 'Nombre de la persona que ejecuta la ruta',
      },
      status: {
        type: DataTypes.ENUM('planned', 'in_progress', 'completed', 'cancelled', 'postponed'),
        defaultValue: 'planned',
      },
      startTime: {
        type: DataTypes.TIME,
        allowNull: true,
        comment: 'Hora real de inicio de la ruta',
      },
      endTime: {
        type: DataTypes.TIME,
        allowNull: true,
        comment: 'Hora real de finalización de la ruta',
      },
      estimatedStartTime: {
        type: DataTypes.TIME,
        allowNull: true,
        comment: 'Hora estimada de inicio',
      },
      estimatedEndTime: {
        type: DataTypes.TIME,
        allowNull: true,
        comment: 'Hora estimada de finalización',
      },
      totalClientsPlanned: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Total de clientes planificados para visitar',
      },
      clientsVisited: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Total de clientes efectivamente visitados',
      },
      totalCollected: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0.0,
        get() {
          const value = this.getDataValue('totalCollected');
          return value ? parseFloat(value) : 0;
        },
        comment: 'Total cobrado en esta ejecución',
      },
      totalExpenses: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
        get() {
          const value = this.getDataValue('totalExpenses');
          return value ? parseFloat(value) : 0;
        },
        comment: 'Total de gastos de la ruta (combustible, etc.)',
      },
      observations: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Observaciones generales de la ejecución',
      },
      weatherConditions: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Condiciones climáticas durante la ejecución',
      },
      // Campos virtuales calculados
      completionPercentage: {
        type: DataTypes.VIRTUAL,
        get() {
          if (!this.totalClientsPlanned || this.totalClientsPlanned === 0) return 0;
          return Math.round((this.clientsVisited / this.totalClientsPlanned) * 100);
        },
      },
      duration: {
        type: DataTypes.VIRTUAL,
        get() {
          if (!this.startTime || !this.endTime) return null;

          const start = new Date(`2000-01-01 ${this.startTime}`);
          const end = new Date(`2000-01-01 ${this.endTime}`);
          const diffMs = end - start;
          const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
          const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

          return `${diffHours}h ${diffMinutes}m`;
        },
      },
    },
    {
      sequelize,
      modelName: 'RouteExecutions',

      // Constraints
      indexes: [
        {
          unique: true,
          fields: ['routeId', 'executionDate'],
          name: 'unique_route_execution_date',
        },
        { fields: ['routeId'] },
        { fields: ['executionDate'] },
        { fields: ['status'] },
        { fields: ['executorName'] },
      ],

      // Scopes
      scopes: {
        today: {
          where: {
            executionDate: new Date().toISOString().split('T')[0],
          },
        },
        completed: {
          where: { status: 'completed' },
        },
        inProgress: {
          where: { status: 'in_progress' },
        },
        byRoute: routeId => ({
          where: { routeId },
        }),
        byDateRange: (startDate, endDate) => ({
          where: {
            executionDate: {
              [sequelize.Sequelize.Op.between]: [startDate, endDate],
            },
          },
        }),
      },
    }
  );

  return RouteExecutions;
};
