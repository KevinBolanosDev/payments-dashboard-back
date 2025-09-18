'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('PaymentReceipts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      paymentId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: 'Payments',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      receiptNumber: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      // Datos del cliente (snapshot)
      clientName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      clientIdentification: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      clientPhone: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      clientAddress: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      // Datos del pago (snapshot)
      amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },
      paymentDate: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      paymentMethod: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      paymentType: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      collectorName: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      observations: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      // Datos del crédito (si aplica)
      creditAmount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true,
      },
      creditDueDate: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      creditInterestRate: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('generated', 'printed', 'sent', 'cancelled'),
        defaultValue: 'generated',
      },
      // Metadatos del recibo
      generatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      printedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      sentAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    // Crear índices
    await queryInterface.addIndex('PaymentReceipts', ['paymentId'], { unique: true });
    await queryInterface.addIndex('PaymentReceipts', ['receiptNumber'], { unique: true });
    await queryInterface.addIndex('PaymentReceipts', ['clientIdentification']);
    await queryInterface.addIndex('PaymentReceipts', ['paymentDate']);
    await queryInterface.addIndex('PaymentReceipts', ['status']);
    await queryInterface.addIndex('PaymentReceipts', ['generatedAt']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('PaymentReceipts');
  },
};
