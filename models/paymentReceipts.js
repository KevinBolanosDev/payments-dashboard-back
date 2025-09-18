import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class PaymentReceipts extends Model {
    /**
     * Helper method for defining associations.
     */
    static associate(models) {
      // Pertenece a un pago
      PaymentReceipts.belongsTo(models.Payments, {
        foreignKey: 'paymentId',
        as: 'payment',
      });
    }

    // Instance methods
    isGenerated() {
      return this.status === 'generated';
    }

    getReceiptData() {
      return {
        receiptNumber: this.receiptNumber,
        clientName: this.clientName,
        clientId: this.clientIdentification,
        amount: this.amount,
        paymentDate: this.paymentDate,
        paymentMethod: this.paymentMethod,
        collectorName: this.collectorName,
        observations: this.observations,
      };
    }

    // Static methods
    static async generateReceipt(paymentId) {
      // Obtener información del pago
      const payment = await sequelize.models.Payments.findByPk(paymentId, {
        include: [
          {
            model: sequelize.models.Clients,
            as: 'client',
            attributes: ['firstName', 'lastName', 'identificationNumber', 'phone', 'address'],
          },
          {
            model: sequelize.models.Credits,
            as: 'credit',
            attributes: ['amount', 'dueDate', 'interestRate'],
          },
        ],
      });

      if (!payment) {
        throw new Error('Pago no encontrado');
      }

      // Verificar si ya existe un recibo
      const existingReceipt = await this.findOne({
        where: { paymentId },
      });

      if (existingReceipt) {
        return existingReceipt;
      }

      // Crear el recibo
      const receipt = await this.create({
        paymentId,
        receiptNumber: payment.receiptNumber,
        clientName: `${payment.client.firstName} ${payment.client.lastName}`,
        clientIdentification: payment.client.identificationNumber,
        clientPhone: payment.client.phone,
        clientAddress: payment.client.address,
        amount: payment.amount,
        paymentDate: payment.paymentDate,
        paymentMethod: payment.paymentMethod,
        paymentType: payment.paymentType,
        collectorName: payment.collectorName,
        observations: payment.observations,
        creditAmount: payment.credit?.amount,
        creditDueDate: payment.credit?.dueDate,
        creditInterestRate: payment.credit?.interestRate,
        status: 'generated',
      });

      return receipt;
    }

    static async getReceiptsByDateRange(startDate, endDate) {
      const { Op } = sequelize.Sequelize;

      return this.findAll({
        where: {
          paymentDate: {
            [Op.between]: [startDate, endDate],
          },
        },
        order: [['paymentDate', 'DESC']],
      });
    }
  }

  PaymentReceipts.init(
    {
      paymentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: 'Payments',
          key: 'id',
        },
        validate: {
          notNull: {
            msg: 'Payment ID is required',
          },
        },
      },
      receiptNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        comment: 'Número único del recibo',
      },
      // Datos del cliente (snapshot)
      clientName: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Nombre completo del cliente al momento del pago',
      },
      clientIdentification: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Identificación del cliente',
      },
      clientPhone: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Teléfono del cliente',
      },
      clientAddress: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Dirección del cliente',
      },
      // Datos del pago (snapshot)
      amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        get() {
          const value = this.getDataValue('amount');
          return value ? parseFloat(value) : 0;
        },
        comment: 'Monto del pago',
      },
      paymentDate: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: 'Fecha del pago',
      },
      paymentMethod: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Método de pago utilizado',
      },
      paymentType: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Tipo de pago (completo, abono, etc.)',
      },
      collectorName: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Nombre del cobrador',
      },
      observations: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Observaciones del pago',
      },
      // Datos del crédito (si aplica)
      creditAmount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
        get() {
          const value = this.getDataValue('creditAmount');
          return value ? parseFloat(value) : null;
        },
        comment: 'Monto original del crédito',
      },
      creditDueDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: 'Fecha de vencimiento del crédito',
      },
      creditInterestRate: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        get() {
          const value = this.getDataValue('creditInterestRate');
          return value ? parseFloat(value) : null;
        },
        comment: 'Tasa de interés del crédito',
      },
      status: {
        type: DataTypes.ENUM('generated', 'printed', 'sent', 'cancelled'),
        defaultValue: 'generated',
      },
      // Metadatos del recibo
      generatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: 'Fecha de generación del recibo',
      },
      printedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Fecha de impresión del recibo',
      },
      sentAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Fecha de envío del recibo (email/SMS)',
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
      formattedDate: {
        type: DataTypes.VIRTUAL,
        get() {
          return new Intl.DateTimeFormat('es-CO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }).format(new Date(this.paymentDate));
        },
      },
    },
    {
      sequelize,
      modelName: 'PaymentReceipts',

      // Indexes
      indexes: [
        { fields: ['paymentId'], unique: true },
        { fields: ['receiptNumber'], unique: true },
        { fields: ['clientIdentification'] },
        { fields: ['paymentDate'] },
        { fields: ['status'] },
        { fields: ['generatedAt'] },
      ],

      // Scopes
      scopes: {
        generated: {
          where: { status: 'generated' },
        },
        printed: {
          where: { status: 'printed' },
        },
        byClient: clientId => ({
          where: { clientIdentification: clientId },
        }),
        byDateRange: (startDate, endDate) => ({
          where: {
            paymentDate: {
              [sequelize.Sequelize.Op.between]: [startDate, endDate],
            },
          },
        }),
        recent: {
          order: [['generatedAt', 'DESC']],
          limit: 50,
        },
      },
    }
  );

  return PaymentReceipts;
};
