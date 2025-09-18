'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Payments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      clientId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Clients',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      creditId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Credits',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      routeId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Routes',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      routeExecutionId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'RouteExecutions',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },
      paymentDate: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      paymentType: {
        type: Sequelize.ENUM('full', 'partial', 'advance', 'interest_only'),
        defaultValue: 'full',
      },
      paymentMethod: {
        type: Sequelize.ENUM('cash', 'transfer', 'check', 'card', 'digital_wallet'),
        defaultValue: 'cash',
      },
      status: {
        type: Sequelize.ENUM('pending', 'paid', 'cancelled', 'refunded'),
        defaultValue: 'pending',
      },
      receiptNumber: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
      },
      collectorName: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      observations: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      latitude: {
        type: Sequelize.DECIMAL(10, 8),
        allowNull: true,
      },
      longitude: {
        type: Sequelize.DECIMAL(11, 8),
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
    await queryInterface.addIndex('Payments', ['clientId']);
    await queryInterface.addIndex('Payments', ['creditId']);
    await queryInterface.addIndex('Payments', ['routeId']);
    await queryInterface.addIndex('Payments', ['routeExecutionId']);
    await queryInterface.addIndex('Payments', ['paymentDate']);
    await queryInterface.addIndex('Payments', ['status']);
    await queryInterface.addIndex('Payments', ['paymentMethod']);
    await queryInterface.addIndex('Payments', ['paymentType']);
    await queryInterface.addIndex('Payments', ['receiptNumber'], { unique: true });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Payments');
  },
};
