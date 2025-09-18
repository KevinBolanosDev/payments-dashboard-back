'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const credits = [];

    // Montos de crédito variados (en pesos colombianos)
    const creditAmounts = [
      50000, 100000, 150000, 200000, 250000, 300000, 400000, 500000, 600000, 750000, 800000,
      1000000, 1200000, 1500000, 1800000, 2000000, 2500000, 3000000, 3500000, 4000000, 4500000,
      5000000, 300000, 450000, 650000, 850000, 950000, 1100000, 1300000, 1400000, 1600000, 1700000,
      1900000, 2200000, 2300000, 2400000, 2600000, 2700000, 2800000, 2900000,
    ];

    // Tasas de interés diarias variadas (%)
    const interestRates = [
      0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0, 1.2, 1.8, 2.2, 2.8, 3.2, 3.8, 4.2, 4.8, 5.2,
      5.5, 0.8, 1.3, 1.7, 2.3, 2.7, 3.3, 3.7, 4.3, 4.7, 5.3, 0.7, 1.1, 1.4, 1.6, 1.9, 2.1, 2.4, 2.6,
      2.9, 3.1,
    ];

    const descriptions = [
      'Crédito para capital de trabajo',
      'Préstamo para mejoras del hogar',
      'Crédito para educación',
      'Préstamo para vehículo',
      'Crédito comercial',
      'Préstamo personal',
      'Crédito para inventario',
      'Préstamo para emergencias',
      'Crédito para equipos',
      'Préstamo familiar',
      'Crédito microempresarial',
      'Préstamo para salud',
      'Crédito agrícola',
      'Préstamo para vivienda',
      'Crédito rotativo',
    ];

    const statuses = ['active', 'active', 'active', 'active', 'active', 'paid', 'overdue'];

    // Generar 40 créditos
    for (let i = 1; i <= 40; i++) {
      const clientId = Math.floor(Math.random() * 40) + 1; // Asignar a clientes aleatorios
      const amount = creditAmounts[i - 1];
      const interestRate = interestRates[i - 1];
      const status = statuses[i % statuses.length];

      // Fechas de crédito variadas (últimos 6 meses)
      const creditDate = new Date(
        Date.now() - Math.floor(Math.random() * 180 * 24 * 60 * 60 * 1000)
      );

      // Fecha de vencimiento (30-90 días después del crédito)
      const daysToAdd = Math.floor(Math.random() * 60) + 30;
      const dueDate = new Date(creditDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000);

      // Calcular currentBalance y totalPaid basado en el estado
      let currentBalance = amount;
      let totalPaid = 0;
      let lastPaymentDate = null;
      let lastInterestDate = null;

      if (status === 'paid') {
        // Crédito pagado completamente
        currentBalance = 0;
        totalPaid = amount + amount * (interestRate / 100) * Math.floor(Math.random() * 30); // Con algunos intereses
        lastPaymentDate = new Date(
          creditDate.getTime() + Math.floor(Math.random() * daysToAdd * 24 * 60 * 60 * 1000)
        );
      } else if (status === 'active' || status === 'overdue') {
        // Crédito activo con pagos parciales
        const paymentPercentage = Math.random() * 0.7; // 0-70% pagado
        totalPaid = amount * paymentPercentage;

        // Calcular intereses acumulados
        const daysSinceCredit = Math.floor(
          (Date.now() - creditDate.getTime()) / (24 * 60 * 60 * 1000)
        );
        const accumulatedInterest =
          (amount - totalPaid) * (interestRate / 100) * Math.min(daysSinceCredit, 60);

        currentBalance = amount - totalPaid + accumulatedInterest;

        if (totalPaid > 0) {
          lastPaymentDate = new Date(
            creditDate.getTime() + Math.floor(Math.random() * daysSinceCredit * 24 * 60 * 60 * 1000)
          );
        }

        if (daysSinceCredit > 0) {
          lastInterestDate = new Date(
            Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)
          ); // Última semana
        }
      }

      credits.push({
        clientId,
        amount,
        currentBalance: Math.round(currentBalance),
        totalPaid: Math.round(totalPaid),
        creditDate: creditDate.toISOString().split('T')[0],
        dueDate: dueDate.toISOString().split('T')[0],
        status,
        interestRate,
        lastInterestDate: lastInterestDate ? lastInterestDate.toISOString().split('T')[0] : null,
        lastPaymentDate: lastPaymentDate ? lastPaymentDate.toISOString().split('T')[0] : null,
        collectionType: 'daily',
        description: descriptions[i % descriptions.length],
        createdAt: creditDate,
        updatedAt: new Date(),
      });
    }

    await queryInterface.bulkInsert('Credits', credits, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Credits', null, {});
  },
};
