'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('RouteClients', {
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
      visitOrder: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      priority: {
        type: Sequelize.ENUM('low', 'medium', 'high', 'urgent'),
        defaultValue: 'medium',
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive', 'completed'),
        defaultValue: 'active',
      },
      lastVisitDate: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      observations: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      estimatedCollectionAmount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0.0,
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
    await queryInterface.addIndex('RouteClients', ['routeId', 'clientId'], {
      unique: true,
      name: 'unique_route_client',
    });
    await queryInterface.addIndex('RouteClients', ['routeId']);
    await queryInterface.addIndex('RouteClients', ['clientId']);
    await queryInterface.addIndex('RouteClients', ['visitOrder']);
    await queryInterface.addIndex('RouteClients', ['priority']);
    await queryInterface.addIndex('RouteClients', ['status']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('RouteClients');
  },
};
