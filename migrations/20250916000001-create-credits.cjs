'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Credits', {
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
        onDelete: 'RESTRICT', // No permitir eliminar cliente si tiene créditos
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      creditDate: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_DATE'),
      },
      dueDate: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('active', 'paid', 'overdue', 'cancelled'),
        defaultValue: 'active',
      },
      interestRate: {
        type: Sequelize.DECIMAL(5, 2),
        defaultValue: 0.0,
      },
      description: {
        type: Sequelize.TEXT,
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

    // Crear índices para optimizar las consultas
    await queryInterface.addIndex('Credits', ['clientId'], {
      name: 'credits_client_id_index',
    });

    await queryInterface.addIndex('Credits', ['status'], {
      name: 'credits_status_index',
    });

    await queryInterface.addIndex('Credits', ['creditDate'], {
      name: 'credits_credit_date_index',
    });

    await queryInterface.addIndex('Credits', ['dueDate'], {
      name: 'credits_due_date_index',
    });

    // Índice compuesto para consultas de créditos vencidos
    await queryInterface.addIndex('Credits', ['status', 'dueDate'], {
      name: 'credits_status_due_date_index',
    });

    // Índice compuesto para consultas de créditos por cliente
    await queryInterface.addIndex('Credits', ['clientId', 'status'], {
      name: 'credits_client_status_index',
    });
  },

  async down(queryInterface, Sequelize) {
    // Eliminar índices primero
    await queryInterface.removeIndex('Credits', 'credits_client_id_index');
    await queryInterface.removeIndex('Credits', 'credits_status_index');
    await queryInterface.removeIndex('Credits', 'credits_credit_date_index');
    await queryInterface.removeIndex('Credits', 'credits_due_date_index');
    await queryInterface.removeIndex('Credits', 'credits_status_due_date_index');
    await queryInterface.removeIndex('Credits', 'credits_client_status_index');

    // Eliminar tabla
    await queryInterface.dropTable('Credits');
  },
};
