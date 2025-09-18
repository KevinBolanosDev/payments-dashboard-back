'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Obtener la fecha actual
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const lastWeek = new Date(today);
    lastWeek.setDate(today.getDate() - 7);

    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    const nextMonth = new Date(today);
    nextMonth.setMonth(today.getMonth() + 1);

    const lastMonth = new Date(today);
    lastMonth.setMonth(today.getMonth() - 1);

    const overdue = new Date(today);
    overdue.setDate(today.getDate() - 15);

    await queryInterface.bulkInsert(
      'Credits',
      [
        // Créditos para Ana García (ID: 1)
        {
          clientId: 1,
          amount: 75000.0,
          creditDate: lastWeek.toISOString().split('T')[0],
          dueDate: nextMonth.toISOString().split('T')[0],
          status: 'active',
          interestRate: 2.5,
          description: 'Crédito para compra de mercancía',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          clientId: 1,
          amount: 50000.0,
          creditDate: yesterday.toISOString().split('T')[0],
          dueDate: nextWeek.toISOString().split('T')[0],
          status: 'active',
          interestRate: 1.8,
          description: 'Crédito adicional para inventario',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          clientId: 1,
          amount: 25000.0,
          creditDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 3)
            .toISOString()
            .split('T')[0],
          dueDate: new Date(today.getFullYear(), today.getMonth() + 2, today.getDate())
            .toISOString()
            .split('T')[0],
          status: 'active',
          interestRate: 1.9,
          description: 'Crédito a largo plazo',
          createdAt: new Date(),
          updatedAt: new Date(),
        },

        // Créditos para Carlos Rodríguez (ID: 2)
        {
          clientId: 2,
          amount: 30000.0,
          creditDate: lastWeek.toISOString().split('T')[0],
          dueDate: nextMonth.toISOString().split('T')[0],
          status: 'active',
          interestRate: 2.0,
          description: 'Primer crédito del cliente',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          clientId: 2,
          amount: 15000.0,
          creditDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 5)
            .toISOString()
            .split('T')[0],
          dueDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 10)
            .toISOString()
            .split('T')[0],
          status: 'active',
          interestRate: 2.3,
          description: 'Crédito de emergencia',
          createdAt: new Date(),
          updatedAt: new Date(),
        },

        // Créditos para María López (ID: 3)
        {
          clientId: 3,
          amount: 120000.0,
          creditDate: lastMonth.toISOString().split('T')[0],
          dueDate: nextWeek.toISOString().split('T')[0],
          status: 'active',
          interestRate: 1.5,
          description: 'Crédito VIP con condiciones preferenciales',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          clientId: 3,
          amount: 85000.0,
          creditDate: today.toISOString().split('T')[0],
          dueDate: nextMonth.toISOString().split('T')[0],
          status: 'active',
          interestRate: 1.7,
          description: 'Crédito adicional VIP',
          createdAt: new Date(),
          updatedAt: new Date(),
        },

        // Créditos para Luis Martínez (ID: 4)
        {
          clientId: 4,
          amount: 45000.0,
          creditDate: today.toISOString().split('T')[0],
          dueDate: nextMonth.toISOString().split('T')[0],
          status: 'active',
          interestRate: 2.2,
          description: 'Crédito para expansión de negocio',
          createdAt: new Date(),
          updatedAt: new Date(),
        },

        // Créditos para Sandra Hernández (ID: 5)
        {
          clientId: 5,
          amount: 95000.0,
          creditDate: lastWeek.toISOString().split('T')[0],
          dueDate: nextMonth.toISOString().split('T')[0],
          status: 'active',
          interestRate: 1.8,
          description: 'Crédito empresarial',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          clientId: 5,
          amount: 60000.0,
          creditDate: yesterday.toISOString().split('T')[0],
          dueDate: new Date(today.getFullYear(), today.getMonth() + 1, today.getDate() + 15)
            .toISOString()
            .split('T')[0],
          status: 'active',
          interestRate: 2.0,
          description: 'Crédito para nueva línea de productos',
          createdAt: new Date(),
          updatedAt: new Date(),
        },

        // Créditos para Diego Morales (ID: 10)
        {
          clientId: 10,
          amount: 55000.0,
          creditDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 2)
            .toISOString()
            .split('T')[0],
          dueDate: new Date(today.getFullYear(), today.getMonth() + 1, today.getDate() + 15)
            .toISOString()
            .split('T')[0],
          status: 'active',
          interestRate: 2.0,
          description: 'Crédito confiable',
          createdAt: new Date(),
          updatedAt: new Date(),
        },

        // Créditos para Fernando Castro (ID: 12)
        {
          clientId: 12,
          amount: 150000.0,
          creditDate: lastMonth.toISOString().split('T')[0],
          dueDate: nextMonth.toISOString().split('T')[0],
          status: 'active',
          interestRate: 1.2,
          description: 'Crédito premium alto volumen',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          clientId: 12,
          amount: 80000.0,
          creditDate: today.toISOString().split('T')[0],
          dueDate: new Date(today.getFullYear(), today.getMonth() + 2, today.getDate())
            .toISOString()
            .split('T')[0],
          status: 'active',
          interestRate: 1.5,
          description: 'Segundo crédito premium',
          createdAt: new Date(),
          updatedAt: new Date(),
        },

        // Créditos para Javier Ortiz (ID: 14)
        {
          clientId: 14,
          amount: 70000.0,
          creditDate: lastWeek.toISOString().split('T')[0],
          dueDate: nextMonth.toISOString().split('T')[0],
          status: 'active',
          interestRate: 1.9,
          description: 'Crédito mayorista',
          createdAt: new Date(),
          updatedAt: new Date(),
        },

        // Algunos créditos pagados para historial
        {
          clientId: 1,
          amount: 80000.0,
          creditDate: lastMonth.toISOString().split('T')[0],
          dueDate: lastWeek.toISOString().split('T')[0],
          status: 'paid',
          interestRate: 2.0,
          description: 'Crédito pagado completamente',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          clientId: 2,
          amount: 25000.0,
          creditDate: new Date(today.getFullYear(), today.getMonth() - 2, 15)
            .toISOString()
            .split('T')[0],
          dueDate: new Date(today.getFullYear(), today.getMonth() - 1, 15)
            .toISOString()
            .split('T')[0],
          status: 'paid',
          interestRate: 1.8,
          description: 'Primer crédito pagado satisfactoriamente',
          createdAt: new Date(),
          updatedAt: new Date(),
        },

        // Algunos créditos vencidos
        {
          clientId: 8, // Miguel Torres (suspended)
          amount: 60000.0,
          creditDate: new Date(today.getFullYear(), today.getMonth() - 1, 1)
            .toISOString()
            .split('T')[0],
          dueDate: overdue.toISOString().split('T')[0],
          status: 'overdue',
          interestRate: 3.0,
          description: 'Crédito vencido - cliente suspendido',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          clientId: 9, // Carmen Vargas (suspended)
          amount: 40000.0,
          creditDate: new Date(today.getFullYear(), today.getMonth() - 2, 10)
            .toISOString()
            .split('T')[0],
          dueDate: new Date(today.getFullYear(), today.getMonth() - 1, 10)
            .toISOString()
            .split('T')[0],
          status: 'overdue',
          interestRate: 2.5,
          description: 'Crédito con retraso en el pago',
          createdAt: new Date(),
          updatedAt: new Date(),
        },

        // Crédito cancelado
        {
          clientId: 6, // Roberto González (inactive)
          amount: 35000.0,
          creditDate: new Date(today.getFullYear(), today.getMonth() - 3, 1)
            .toISOString()
            .split('T')[0],
          dueDate: new Date(today.getFullYear(), today.getMonth() - 2, 1)
            .toISOString()
            .split('T')[0],
          status: 'cancelled',
          interestRate: 2.0,
          description: 'Crédito cancelado por inactividad del cliente',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Credits', null, {});
  },
};
