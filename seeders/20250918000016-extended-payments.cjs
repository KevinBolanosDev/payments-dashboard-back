'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const payments = [];

    const paymentTypes = ['full', 'partial', 'advance', 'interest_only'];
    const paymentMethods = ['cash', 'transfer', 'check', 'card', 'digital_wallet'];
    const statuses = ['paid', 'paid', 'paid', 'pending', 'cancelled'];

    const collectorNames = [
      'Juan Pérez',
      'María González',
      'Carlos Rodríguez',
      'Ana López',
      'Luis Martínez',
      'Carmen Sánchez',
      'José Ramírez',
      'Luz Herrera',
      'Miguel Vargas',
      'Rosa Castillo',
    ];

    const observations = [
      'Pago realizado sin inconvenientes',
      'Cliente solicitó recibo físico',
      'Pago parcial autorizado por gerencia',
      'Cliente prefiere pagos semanales',
      'Excelente disposición de pago',
      'Pago realizado en presencia de familiar',
      'Cliente solicitó prórroga',
      'Pago adelantado por viaje',
      'Abono extraordinario',
      'Pago de intereses únicamente',
    ];

    // Coordenadas aproximadas de Bogotá para geolocalización
    const bogotaCoordinates = [
      { lat: 4.711, lng: -74.0721 }, // Centro
      { lat: 4.6486, lng: -74.0574 }, // Chapinero
      { lat: 4.6951, lng: -74.0308 }, // Usaquén
      { lat: 4.7569, lng: -74.0817 }, // Suba
      { lat: 4.6682, lng: -74.1313 }, // Engativá
      { lat: 4.6434, lng: -74.1378 }, // Fontibón
      { lat: 4.628, lng: -74.1376 }, // Kennedy
      { lat: 4.6097, lng: -74.1817 }, // Bosa
      { lat: 4.5736, lng: -74.1378 }, // Ciudad Bolívar
      { lat: 4.5736, lng: -74.0817 }, // San Cristóbal
    ];

    let receiptCounter = 1;

    // Generar pagos para los últimos 30 días
    const today = new Date();

    for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
      const paymentDate = new Date(today.getTime() - dayOffset * 24 * 60 * 60 * 1000);

      // Entre 10-25 pagos por día
      const paymentsPerDay = Math.floor(Math.random() * 16) + 10;

      for (let i = 0; i < paymentsPerDay; i++) {
        const clientId = Math.floor(Math.random() * 55) + 1; // 1-55
        const creditId = Math.floor(Math.random() * 59) + 20; // 20-78
        const routeId = Math.floor(Math.random() * 40) + 1; // 1-40

        // Algunos pagos están asociados a ejecuciones de rutas (usar IDs más conservadores)
        const routeExecutionId = null; // Simplificar por ahora

        const paymentType = paymentTypes[Math.floor(Math.random() * paymentTypes.length)];
        const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];

        // Montos realistas según el tipo de pago
        let amount;
        switch (paymentType) {
          case 'full':
            amount = Math.floor(Math.random() * 500000) + 100000; // 100k-600k
            break;
          case 'partial':
            amount = Math.floor(Math.random() * 200000) + 50000; // 50k-250k
            break;
          case 'advance':
            amount = Math.floor(Math.random() * 300000) + 100000; // 100k-400k
            break;
          case 'interest_only':
            amount = Math.floor(Math.random() * 50000) + 10000; // 10k-60k
            break;
        }

        const collectorName = collectorNames[Math.floor(Math.random() * collectorNames.length)];

        // Generar número de recibo
        const dateStr = paymentDate.toISOString().split('T')[0].replace(/-/g, '');
        const receiptNumber = `REC-${dateStr}-${String(receiptCounter).padStart(4, '0')}`;
        receiptCounter++;

        // Coordenadas GPS aleatorias en Bogotá
        const coords = bogotaCoordinates[Math.floor(Math.random() * bogotaCoordinates.length)];
        const latitude = coords.lat + (Math.random() - 0.5) * 0.02; // Variación de ~1km
        const longitude = coords.lng + (Math.random() - 0.5) * 0.02;

        // Hora aleatoria durante el día
        const hour = Math.floor(Math.random() * 12) + 8; // 8 AM - 8 PM
        const minute = Math.floor(Math.random() * 60);
        const paymentDateTime = new Date(paymentDate);
        paymentDateTime.setHours(hour, minute, 0, 0);

        payments.push({
          clientId,
          creditId: Math.random() > 0.5 ? creditId : null, // 50% asociados a crédito específico
          routeId: Math.random() > 0.5 ? routeId : null, // 50% asociados a ruta
          routeExecutionId,
          amount,
          paymentDate: paymentDateTime,
          paymentType,
          paymentMethod,
          status,
          receiptNumber,
          collectorName,
          observations:
            Math.random() > 0.6
              ? observations[Math.floor(Math.random() * observations.length)]
              : null,
          latitude: Math.round(latitude * 100000) / 100000, // 5 decimales
          longitude: Math.round(longitude * 100000) / 100000,
          createdAt: paymentDateTime,
          updatedAt: new Date(),
        });
      }
    }

    await queryInterface.bulkInsert('Payments', payments, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Payments', null, {});
  },
};
