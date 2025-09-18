'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('DailyInterests', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      creditId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Credits',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      clientId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Clients',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      interestDate: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      dailyInterest: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },
      currentBalance: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },
      interestRate: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('pending', 'paid', 'cancelled'),
        defaultValue: 'pending',
      },
      paymentId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Payments',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
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
    await queryInterface.addIndex('DailyInterests', ['creditId', 'interestDate'], {
      unique: true,
      name: 'unique_credit_daily_interest',
    });
    await queryInterface.addIndex('DailyInterests', ['creditId']);
    await queryInterface.addIndex('DailyInterests', ['clientId']);
    await queryInterface.addIndex('DailyInterests', ['interestDate']);
    await queryInterface.addIndex('DailyInterests', ['status']);
    await queryInterface.addIndex('DailyInterests', ['paymentId']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('DailyInterests');
  },
};
