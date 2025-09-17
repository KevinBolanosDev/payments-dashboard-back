'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Clients', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING,
      },
      lastname: {
        type: Sequelize.STRING,
      },
      phone: {
        type: Sequelize.STRING,
      },
      address: {
        type: Sequelize.TEXT,
      },
      email: {
        type: Sequelize.STRING,
      },
      state: {
        type: Sequelize.ENUM('activo', 'inactivo', 'suspendido'),
        defaultValue: 'activo',
      },
      currentBalance: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.0,
      },
      maxCredit: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.0,
      },
      basePrice: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.0,
      },
      observations: {
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
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Clients');
  },
};
