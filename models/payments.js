import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Payments extends Model {
    /**
     * Helper method for defining associations.
     */
    static associate(models) {
      // Pertenece a un cliente
      Payments.belongsTo(models.Clients, {
        foreignKey: 'clientId',
        as: 'client',
      });

      // Pertenece a un crédito (opcional, puede ser pago general)
      Payments.belongsTo(models.Credits, {
        foreignKey: 'creditId',
        as: 'credit',
      });

      // Pertenece a una ruta (opcional)
      Payments.belongsTo(models.Routes, {
        foreignKey: 'routeId',
        as: 'route',
      });

      // Pertenece a una ejecución de ruta (opcional)
      Payments.belongsTo(models.RouteExecutions, {
        foreignKey: 'routeExecutionId',
        as: 'routeExecution',
      });

      // Tiene un recibo
      Payments.hasOne(models.PaymentReceipts, {
        foreignKey: 'paymentId',
        as: 'receipt',
      });
    }

    // Instance methods
    isPaid() {
      return this.status === 'paid';
    }

    isPending() {
      return this.status === 'pending';
    }

    isPartialPayment() {
      return this.paymentType === 'partial';
    }

    getFormattedAmount() {
      return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
      }).format(this.amount);
    }

    // Static methods
    static async createPayment(paymentData) {
      const {
        clientId,
        creditId,
        routeId,
        routeExecutionId,
        amount,
        paymentType = 'full',
        paymentMethod = 'cash',
        observations,
        collectorName,
      } = paymentData;

      // Validar que el cliente existe
      const client = await sequelize.models.Clients.findByPk(clientId);
      if (!client) {
        throw new Error('Cliente no encontrado');
      }

      // Si es pago de crédito específico, validar que existe
      if (creditId) {
        const credit = await sequelize.models.Credits.findByPk(creditId);
        if (!credit) {
          throw new Error('Crédito no encontrado');
        }
        if (credit.clientId !== clientId) {
          throw new Error('El crédito no pertenece al cliente especificado');
        }
      }

      const payment = await this.create({
        clientId,
        creditId,
        routeId,
        routeExecutionId,
        amount: parseFloat(amount),
        paymentType,
        paymentMethod,
        paymentDate: new Date(),
        status: 'paid',
        collectorName,
        observations,
      });

      // Actualizar balance del cliente
      await client.update({
        currentBalance: client.currentBalance - parseFloat(amount),
      });

      // Si es pago completo de un crédito, marcar como pagado
      if (creditId && paymentType === 'full') {
        await sequelize.models.Credits.update({ status: 'paid' }, { where: { id: creditId } });
      }

      return payment;
    }

    static async getPaymentsByRoute(routeId, startDate, endDate) {
      const { Op } = sequelize.Sequelize;

      return this.findAll({
        where: {
          routeId,
          paymentDate: {
            [Op.between]: [startDate, endDate],
          },
        },
        include: [
          {
            model: sequelize.models.Clients,
            as: 'client',
            attributes: ['id', 'firstName', 'lastName', 'identificationNumber'],
          },
          {
            model: sequelize.models.Credits,
            as: 'credit',
            attributes: ['id', 'amount', 'dueDate'],
          },
        ],
        order: [['paymentDate', 'DESC']],
      });
    }

    static async getDailyCollectionStats(date) {
      const { Op } = sequelize.Sequelize;

      const payments = await this.findAll({
        where: {
          paymentDate: {
            [Op.gte]: new Date(date + ' 00:00:00'),
            [Op.lte]: new Date(date + ' 23:59:59'),
          },
          status: 'paid',
        },
        attributes: [
          'paymentMethod',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
          [sequelize.fn('SUM', sequelize.col('amount')), 'total'],
        ],
        group: ['paymentMethod'],
      });

      return payments;
    }
  }

  Payments.init(
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
      creditId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'Credits',
          key: 'id',
        },
        comment: 'ID del crédito específico (opcional para pagos generales)',
      },
      routeId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'Routes',
          key: 'id',
        },
        comment: 'ID de la ruta donde se realizó el cobro',
      },
      routeExecutionId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'RouteExecutions',
          key: 'id',
        },
        comment: 'ID de la ejecución específica de la ruta',
      },
      amount: {
        type: DataTypes.DECIMAL(12, 2),
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
      paymentDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        validate: {
          notNull: {
            msg: 'Payment date is required',
          },
          isDate: {
            msg: 'Must be a valid date',
          },
        },
      },
      paymentType: {
        type: DataTypes.ENUM('full', 'partial', 'advance', 'interest_only'),
        defaultValue: 'full',
        comment: 'Tipo de pago: completo, abono, adelanto, solo intereses',
      },
      paymentMethod: {
        type: DataTypes.ENUM('cash', 'transfer', 'check', 'card', 'digital_wallet'),
        defaultValue: 'cash',
        comment: 'Método de pago utilizado',
      },
      status: {
        type: DataTypes.ENUM('pending', 'paid', 'cancelled', 'refunded'),
        defaultValue: 'pending',
      },
      receiptNumber: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
        comment: 'Número de recibo generado automáticamente',
      },
      collectorName: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          len: [2, 100],
        },
        comment: 'Nombre de la persona que realizó el cobro',
      },
      observations: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Observaciones del pago',
      },
      latitude: {
        type: DataTypes.DECIMAL(10, 8),
        allowNull: true,
        comment: 'Latitud donde se realizó el pago (GPS)',
      },
      longitude: {
        type: DataTypes.DECIMAL(11, 8),
        allowNull: true,
        comment: 'Longitud donde se realizó el pago (GPS)',
      },
      // Campos virtuales
      formattedAmount: {
        type: DataTypes.VIRTUAL,
        get() {
          return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
          }).format(this.amount);
        },
      },
    },
    {
      sequelize,
      modelName: 'Payments',

      // Hooks
      hooks: {
        beforeCreate: async payment => {
          // Generar número de recibo automáticamente
          if (!payment.receiptNumber) {
            const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
            const count = await Payments.count({
              where: {
                createdAt: {
                  [sequelize.Sequelize.Op.gte]: new Date().setHours(0, 0, 0, 0),
                },
              },
            });
            payment.receiptNumber = `REC-${today}-${String(count + 1).padStart(4, '0')}`;
          }
        },
      },

      // Indexes
      indexes: [
        { fields: ['clientId'] },
        { fields: ['creditId'] },
        { fields: ['routeId'] },
        { fields: ['routeExecutionId'] },
        { fields: ['paymentDate'] },
        { fields: ['status'] },
        { fields: ['paymentMethod'] },
        { fields: ['paymentType'] },
        { fields: ['receiptNumber'], unique: true },
      ],

      // Scopes
      scopes: {
        paid: {
          where: { status: 'paid' },
        },
        pending: {
          where: { status: 'pending' },
        },
        today: {
          where: {
            paymentDate: {
              [sequelize.Sequelize.Op.gte]: new Date().setHours(0, 0, 0, 0),
            },
          },
        },
        byClient: clientId => ({
          where: { clientId },
        }),
        byRoute: routeId => ({
          where: { routeId },
        }),
        byDateRange: (startDate, endDate) => ({
          where: {
            paymentDate: {
              [sequelize.Sequelize.Op.between]: [startDate, endDate],
            },
          },
        }),
      },
    }
  );

  return Payments;
};
