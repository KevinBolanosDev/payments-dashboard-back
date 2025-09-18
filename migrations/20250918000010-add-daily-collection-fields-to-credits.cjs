'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Agregar nuevos campos para cobro diario
    await queryInterface.addColumn('Credits', 'currentBalance', {
      type: Sequelize.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0.0,
    });

    await queryInterface.addColumn('Credits', 'totalPaid', {
      type: Sequelize.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0.0,
    });

    await queryInterface.addColumn('Credits', 'lastInterestDate', {
      type: Sequelize.DATEONLY,
      allowNull: true,
    });

    await queryInterface.addColumn('Credits', 'lastPaymentDate', {
      type: Sequelize.DATEONLY,
      allowNull: true,
    });

    await queryInterface.addColumn('Credits', 'collectionType', {
      type: Sequelize.ENUM('daily', 'weekly', 'monthly'),
      defaultValue: 'daily',
    });

    // Inicializar currentBalance con el valor de amount para créditos existentes
    await queryInterface.sequelize.query(`
      UPDATE Credits
      SET currentBalance = amount
      WHERE currentBalance = 0 AND status = 'active'
    `);

    // Crear índices para los nuevos campos
    await queryInterface.addIndex('Credits', ['currentBalance'], {
      name: 'credits_current_balance_idx',
    });
    await queryInterface.addIndex('Credits', ['lastInterestDate'], {
      name: 'credits_last_interest_date_idx',
    });
    await queryInterface.addIndex('Credits', ['lastPaymentDate'], {
      name: 'credits_last_payment_date_idx',
    });
    await queryInterface.addIndex('Credits', ['collectionType'], {
      name: 'credits_collection_type_idx',
    });
  },

  async down(queryInterface, Sequelize) {
    // Remover índices
    await queryInterface.removeIndex('Credits', 'credits_current_balance_idx');
    await queryInterface.removeIndex('Credits', 'credits_last_interest_date_idx');
    await queryInterface.removeIndex('Credits', 'credits_last_payment_date_idx');
    await queryInterface.removeIndex('Credits', 'credits_collection_type_idx');

    // Remover columnas
    await queryInterface.removeColumn('Credits', 'currentBalance');
    await queryInterface.removeColumn('Credits', 'totalPaid');
    await queryInterface.removeColumn('Credits', 'lastInterestDate');
    await queryInterface.removeColumn('Credits', 'lastPaymentDate');
    await queryInterface.removeColumn('Credits', 'collectionType');
  },
};
