import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Credits extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Un crédito pertenece a un cliente
      Credits.belongsTo(models.Clients, {
        foreignKey: 'clientId',
        as: 'client',
      });
    }

    // Instance methods
    isActive() {
      return this.status === 'active';
    }

    isPaid() {
      return this.status === 'paid';
    }

    isOverdue() {
      const today = new Date();
      return this.status === 'active' && new Date(this.dueDate) < today;
    }

    getDaysUntilDue() {
      const today = new Date();
      const due = new Date(this.dueDate);
      const diffTime = due - today;
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    getDaysOverdue() {
      if (!this.isOverdue()) return 0;
      const today = new Date();
      const due = new Date(this.dueDate);
      const diffTime = today - due;
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    calculateInterest() {
      if (!this.interestRate || this.interestRate === 0) return 0;
      const daysOverdue = this.getDaysOverdue();
      if (daysOverdue <= 0) return 0;

      // Calcular interés simple diario
      const dailyRate = this.interestRate / 100 / 365;
      return parseFloat((this.amount * dailyRate * daysOverdue).toFixed(2));
    }

    getTotalAmount() {
      return parseFloat((this.amount + this.calculateInterest()).toFixed(2));
    }

    // Static methods
    static async findActive() {
      return this.findAll({
        where: { status: 'active' },
        include: [{ model: sequelize.models.Clients, as: 'client' }],
      });
    }

    static async findOverdue() {
      const today = new Date();
      return this.findAll({
        where: {
          status: 'active',
          dueDate: {
            [sequelize.Sequelize.Op.lt]: today,
          },
        },
        include: [{ model: sequelize.models.Clients, as: 'client' }],
      });
    }

    static async findByClient(clientId) {
      return this.findAll({
        where: { clientId },
        order: [['creditDate', 'DESC']],
      });
    }

    static async getTotalActiveCredits() {
      const result = await this.findAll({
        where: { status: 'active' },
        attributes: [
          [sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'totalCount'],
        ],
      });

      return {
        totalAmount: parseFloat(result[0]?.dataValues?.totalAmount || 0),
        totalCount: parseInt(result[0]?.dataValues?.totalCount || 0),
      };
    }
  }

  Credits.init(
    {
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
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          notNull: {
            msg: 'Amount is required',
          },
          min: {
            args: [0.01],
            msg: 'Amount must be greater than 0',
          },
        },
        get() {
          const value = this.getDataValue('amount');
          return value ? parseFloat(value) : 0;
        },
      },
      creditDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        validate: {
          notNull: {
            msg: 'Credit date is required',
          },
          isDate: {
            msg: 'Must be a valid date',
          },
        },
      },
      dueDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
          notNull: {
            msg: 'Due date is required',
          },
          isDate: {
            msg: 'Must be a valid date',
          },
          isAfterCreditDate(value) {
            if (this.creditDate && new Date(value) <= new Date(this.creditDate)) {
              throw new Error('Due date must be after credit date');
            }
          },
        },
      },
      status: {
        type: DataTypes.ENUM('active', 'paid', 'overdue', 'cancelled'),
        defaultValue: 'active',
        validate: {
          isIn: {
            args: [['active', 'paid', 'overdue', 'cancelled']],
            msg: 'Status must be one of: active, paid, overdue, cancelled',
          },
        },
      },
      interestRate: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0.0,
        validate: {
          min: {
            args: [0],
            msg: 'Interest rate cannot be negative',
          },
          max: {
            args: [100],
            msg: 'Interest rate cannot exceed 100%',
          },
        },
        get() {
          const value = this.getDataValue('interestRate');
          return value ? parseFloat(value) : 0;
        },
      },
      description: {
        type: DataTypes.TEXT,
        validate: {
          len: {
            args: [0, 1000],
            msg: 'Description cannot exceed 1000 characters',
          },
        },
      },
      // Virtual fields
      daysUntilDue: {
        type: DataTypes.VIRTUAL,
        get() {
          return this.getDaysUntilDue();
        },
      },
      daysOverdue: {
        type: DataTypes.VIRTUAL,
        get() {
          return this.getDaysOverdue();
        },
      },
      interestAmount: {
        type: DataTypes.VIRTUAL,
        get() {
          return this.calculateInterest();
        },
      },
      totalAmount: {
        type: DataTypes.VIRTUAL,
        get() {
          return this.getTotalAmount();
        },
      },
      isOverdueFlag: {
        type: DataTypes.VIRTUAL,
        get() {
          return this.isOverdue();
        },
      },
    },
    {
      sequelize,
      modelName: 'Credits',

      // Hooks
      hooks: {
        beforeCreate: async credit => {
          // Verificar que el cliente existe y puede recibir crédito
          const client = await sequelize.models.Clients.findByPk(credit.clientId);
          if (!client) {
            throw new Error('Client not found');
          }

          if (!client.isActive()) {
            throw new Error('Cannot grant credit to inactive client');
          }

          // Verificar límite de crédito si está configurado
          if (client.maxCredit > 0) {
            const currentCredits =
              (await Credits.sum('amount', {
                where: {
                  clientId: credit.clientId,
                  status: 'active',
                },
              })) || 0;

            if (currentCredits + parseFloat(credit.amount) > client.maxCredit) {
              throw new Error('Credit amount exceeds client credit limit');
            }
          }
        },

        beforeUpdate: async credit => {
          // Actualizar status a overdue si es necesario
          if (credit.status === 'active' && credit.isOverdue()) {
            credit.status = 'overdue';
          }
        },
      },

      // Indexes
      indexes: [
        { fields: ['clientId'] },
        { fields: ['status'] },
        { fields: ['creditDate'] },
        { fields: ['dueDate'] },
        { fields: ['status', 'dueDate'] }, // Compound index for overdue queries
        { fields: ['clientId', 'status'] }, // Compound index for client credit queries
      ],

      // Scopes
      scopes: {
        active: {
          where: { status: 'active' },
        },
        paid: {
          where: { status: 'paid' },
        },
        overdue: {
          where: {
            status: 'active',
            dueDate: {
              [sequelize.Sequelize.Op.lt]: new Date(),
            },
          },
        },
        withClient: {
          include: [
            {
              model: sequelize.models.Clients,
              as: 'client',
              attributes: ['id', 'firstName', 'lastName', 'email', 'status'],
            },
          ],
        },
        recent: {
          order: [['creditDate', 'DESC']],
        },
      },
    }
  );

  return Credits;
};
