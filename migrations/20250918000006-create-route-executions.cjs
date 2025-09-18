'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('RouteExecutions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      routeId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Routes',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      executionDate: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      executorName: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('planned', 'in_progress', 'completed', 'cancelled', 'postponed'),
        defaultValue: 'planned',
      },
      startTime: {
        type: Sequelize.TIME,
        allowNull: true,
      },
      endTime: {
        type: Sequelize.TIME,
        allowNull: true,
      },
      estimatedStartTime: {
        type: Sequelize.TIME,
        allowNull: true,
      },
      estimatedEndTime: {
        type: Sequelize.TIME,
        allowNull: true,
      },
      totalClientsPlanned: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      clientsVisited: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      totalCollected: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      totalExpenses: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      observations: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      weatherConditions: {
        type: Sequelize.STRING,
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
    await queryInterface.addIndex('RouteExecutions', ['routeId', 'executionDate'], {
      unique: true,
      name: 'unique_route_execution_date',
    });
    await queryInterface.addIndex('RouteExecutions', ['routeId']);
    await queryInterface.addIndex('RouteExecutions', ['executionDate']);
    await queryInterface.addIndex('RouteExecutions', ['status']);
    await queryInterface.addIndex('RouteExecutions', ['executorName']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('RouteExecutions');
  },
};
