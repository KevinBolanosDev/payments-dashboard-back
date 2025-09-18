'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Routes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive', 'archived'),
        defaultValue: 'active',
      },
      dayOfWeek: {
        type: Sequelize.ENUM(
          'monday',
          'tuesday',
          'wednesday',
          'thursday',
          'friday',
          'saturday',
          'sunday'
        ),
        allowNull: true,
      },
      startTime: {
        type: Sequelize.TIME,
        allowNull: true,
      },
      estimatedDuration: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      priority: {
        type: Sequelize.ENUM('low', 'medium', 'high', 'urgent'),
        defaultValue: 'medium',
      },
      color: {
        type: Sequelize.STRING(7),
        allowNull: true,
      },
      observations: {
        type: Sequelize.TEXT,
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
    await queryInterface.addIndex('Routes', ['status'], {
      name: 'routes_status_idx',
    });
    await queryInterface.addIndex('Routes', ['dayOfWeek'], {
      name: 'routes_day_of_week_idx',
    });
    await queryInterface.addIndex('Routes', ['priority'], {
      name: 'routes_priority_idx',
    });
    await queryInterface.addIndex('Routes', ['createdAt'], {
      name: 'routes_created_at_idx',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Routes');
  },
};
