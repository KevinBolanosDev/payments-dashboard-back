'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Renombrar columnas a inglés y agregar campos faltantes
    await queryInterface.renameColumn('Clients', 'name', 'firstName');
    await queryInterface.renameColumn('Clients', 'lastname', 'lastName');
    await queryInterface.renameColumn('Clients', 'state', 'status');

    // Cambiar valores del ENUM de español a inglés
    await queryInterface.changeColumn('Clients', 'status', {
      type: Sequelize.ENUM('active', 'inactive', 'suspended'),
      defaultValue: 'active',
    });

    // Actualizar valores existentes
    await queryInterface.sequelize.query(
      "UPDATE Clients SET status = 'active' WHERE status = 'activo'"
    );
    await queryInterface.sequelize.query(
      "UPDATE Clients SET status = 'inactive' WHERE status = 'inactivo'"
    );
    await queryInterface.sequelize.query(
      "UPDATE Clients SET status = 'suspended' WHERE status = 'suspendido'"
    );

    // Agregar campo de identificación
    await queryInterface.addColumn('Clients', 'identificationNumber', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: '0000000000', // Valor temporal
    });

    // Actualizar registros existentes con valores únicos
    const [results] = await queryInterface.sequelize.query('SELECT id FROM Clients ORDER BY id');

    for (let i = 0; i < results.length; i++) {
      const uniqueId = String(1000000000 + results[i].id).padStart(10, '0');
      await queryInterface.sequelize.query(
        'UPDATE Clients SET identificationNumber = ? WHERE id = ?',
        {
          replacements: [uniqueId, results[i].id],
        }
      );
    }

    // Crear índice único para identificación
    await queryInterface.addIndex('Clients', ['identificationNumber'], {
      unique: true,
      name: 'clients_identification_number_unique',
    });
  },

  async down(queryInterface, Sequelize) {
    // Revertir cambios
    await queryInterface.removeIndex('Clients', 'clients_identification_number_unique');
    await queryInterface.removeColumn('Clients', 'identificationNumber');

    // Revertir valores del ENUM
    await queryInterface.sequelize.query(
      "UPDATE Clients SET status = 'activo' WHERE status = 'active'"
    );
    await queryInterface.sequelize.query(
      "UPDATE Clients SET status = 'inactivo' WHERE status = 'inactive'"
    );
    await queryInterface.sequelize.query(
      "UPDATE Clients SET status = 'suspendido' WHERE status = 'suspended'"
    );

    // Cambiar ENUM de vuelta a español
    await queryInterface.changeColumn('Clients', 'status', {
      type: Sequelize.ENUM('activo', 'inactivo', 'suspendido'),
      defaultValue: 'activo',
    });

    // Renombrar columnas de vuelta a español
    await queryInterface.renameColumn('Clients', 'status', 'state');
    await queryInterface.renameColumn('Clients', 'lastName', 'lastname');
    await queryInterface.renameColumn('Clients', 'firstName', 'name');
  },
};
