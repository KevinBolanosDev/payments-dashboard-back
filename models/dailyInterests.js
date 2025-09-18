import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class DailyInterests extends Model {
    /**
     * Helper method for defining associations.
     */
    static associate(models) {
      // Pertenece a un crédito
      DailyInterests.belongsTo(models.Credits, {
        foreignKey: 'creditId',
        as: 'credit',
      });

      // Pertenece a un cliente
      DailyInterests.belongsTo(models.Clients, {
        foreignKey: 'clientId',
        as: 'client',
      });
    }

    // Instance methods
    isPaid() {
      return this.status === 'paid';
    }

    isPending() {
      return this.status === 'pending';
    }

    getFormattedAmount() {
      return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
      }).format(this.dailyInterest);
    }

    // Static methods
    static async calculateDailyInterest(creditId, date) {
      const credit = await sequelize.models.Credits.findByPk(creditId);
      if (!credit || credit.status !== 'active') {
        return null;
      }

      // Verificar si ya existe el interés para esta fecha
      const existing = await this.findOne({
        where: {
          creditId,
          interestDate: date,
        },
      });

      if (existing) {
        return existing;
      }

      // Calcular interés diario
      const dailyRate = credit.interestRate / 100; // Convertir porcentaje
      const dailyInterest = credit.currentBalance * dailyRate;

      // Crear registro de interés diario
      const dailyInterestRecord = await this.create({
        creditId,
        clientId: credit.clientId,
        interestDate: date,
        dailyInterest: dailyInterest,
        currentBalance: credit.currentBalance,
        interestRate: credit.interestRate,
        status: 'pending',
      });

      // Actualizar balance del crédito
      await credit.update({
        currentBalance: credit.currentBalance + dailyInterest,
        lastInterestDate: date,
      });

      return dailyInterestRecord;
    }

    static async generateDailyInterestsForRoute(routeId, date) {
      // Obtener todos los clientes de la ruta con créditos activos
      const routeClients = await sequelize.models.RouteClients.findAll({
        where: {
          routeId,
          status: 'active',
        },
        include: [
          {
            model: sequelize.models.Clients,
            as: 'client',
            include: [
              {
                model: sequelize.models.Credits,
                as: 'credits',
                where: { status: 'active' },
                required: true,
              },
            ],
          },
        ],
      });

      const dailyInterests = [];

      for (const routeClient of routeClients) {
        for (const credit of routeClient.client.credits) {
          const dailyInterest = await this.calculateDailyInterest(credit.id, date);
          if (dailyInterest) {
            dailyInterests.push(dailyInterest);
          }
        }
      }

      return dailyInterests;
    }

    static async getClientDailyTotal(clientId, date) {
      const { fn, col } = sequelize;

      const result = await this.findOne({
        where: {
          clientId,
          interestDate: date,
        },
        attributes: [
          [fn('SUM', col('dailyInterest')), 'totalDailyInterest'],
          [fn('COUNT', col('id')), 'activeCreditsCount'],
        ],
      });

      return {
        totalDailyInterest: parseFloat(result?.getDataValue('totalDailyInterest') || 0),
        activeCreditsCount: parseInt(result?.getDataValue('activeCreditsCount') || 0),
      };
    }
  }

  DailyInterests.init(
    {
      creditId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Credits',
          key: 'id',
        },
        validate: {
          notNull: {
            msg: 'Credit ID is required',
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
      interestDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
          notNull: {
            msg: 'Interest date is required',
          },
          isDate: {
            msg: 'Must be a valid date',
          },
        },
        comment: 'Fecha para la cual se calcula el interés',
      },
      dailyInterest: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        validate: {
          notNull: {
            msg: 'Daily interest amount is required',
          },
          min: {
            args: [0],
            msg: 'Daily interest must be greater than or equal to 0',
          },
        },
        get() {
          const value = this.getDataValue('dailyInterest');
          return value ? parseFloat(value) : 0;
        },
        comment: 'Monto del interés diario calculado',
      },
      currentBalance: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        get() {
          const value = this.getDataValue('currentBalance');
          return value ? parseFloat(value) : 0;
        },
        comment: 'Balance del crédito al momento del cálculo',
      },
      interestRate: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        get() {
          const value = this.getDataValue('interestRate');
          return value ? parseFloat(value) : 0;
        },
        comment: 'Tasa de interés aplicada',
      },
      status: {
        type: DataTypes.ENUM('pending', 'paid', 'cancelled'),
        defaultValue: 'pending',
        comment: 'Estado del interés diario',
      },
      paymentId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'Payments',
          key: 'id',
        },
        comment: 'ID del pago que cubre este interés (si aplica)',
      },
      // Campos virtuales
      formattedAmount: {
        type: DataTypes.VIRTUAL,
        get() {
          return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
          }).format(this.dailyInterest);
        },
      },
    },
    {
      sequelize,
      modelName: 'DailyInterests',

      // Constraints
      indexes: [
        {
          unique: true,
          fields: ['creditId', 'interestDate'],
          name: 'unique_credit_daily_interest',
        },
        { fields: ['creditId'] },
        { fields: ['clientId'] },
        { fields: ['interestDate'] },
        { fields: ['status'] },
        { fields: ['paymentId'] },
      ],

      // Scopes
      scopes: {
        pending: {
          where: { status: 'pending' },
        },
        paid: {
          where: { status: 'paid' },
        },
        byClient: clientId => ({
          where: { clientId },
        }),
        byCredit: creditId => ({
          where: { creditId },
        }),
        byDate: date => ({
          where: { interestDate: date },
        }),
        byDateRange: (startDate, endDate) => ({
          where: {
            interestDate: {
              [sequelize.Sequelize.Op.between]: [startDate, endDate],
            },
          },
        }),
      },
    }
  );

  return DailyInterests;
};
