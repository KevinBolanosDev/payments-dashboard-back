'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const routeClients = [];

    const priorities = ['low', 'medium', 'high', 'urgent'];
    const statuses = ['active', 'active', 'active', 'inactive', 'completed'];

    const observations = [
      'Cliente preferencial - cobrar temprano',
      'Requiere cita previa',
      'Pago solo en efectivo',
      'Cliente con historial de pago puntual',
      'Verificar disponibilidad antes de visitar',
      'Cliente nuevo en la ruta',
      'Pago parcial autorizado',
      'Contactar por teléfono antes',
      'Cliente con restricciones de horario',
      'Priorizar por monto alto',
    ];

    // Asignar clientes a rutas de manera realista
    // Cada ruta tendrá entre 5-15 clientes
    for (let routeId = 1; routeId <= 40; routeId++) {
      const clientsInRoute = Math.floor(Math.random() * 10) + 5; // 5-15 clientes por ruta
      const usedClients = new Set();

      for (let i = 1; i <= clientsInRoute; i++) {
        let clientId;

        // Asegurar que no se repita el mismo cliente en la misma ruta
        do {
          clientId = Math.floor(Math.random() * 55) + 1; // Usar el rango correcto de clientes
        } while (usedClients.has(clientId));

        usedClients.add(clientId);

        const priority = priorities[Math.floor(Math.random() * priorities.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];

        // Monto estimado de cobro (basado en créditos activos)
        const estimatedCollectionAmount = Math.floor(Math.random() * 200000) + 50000; // 50k - 250k

        // Fecha de última visita (algunos clientes)
        const lastVisitDate =
          Math.random() > 0.5
            ? new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000))
                .toISOString()
                .split('T')[0]
            : null;

        routeClients.push({
          routeId,
          clientId,
          visitOrder: i,
          priority,
          status,
          lastVisitDate,
          observations:
            Math.random() > 0.7
              ? observations[Math.floor(Math.random() * observations.length)]
              : null,
          estimatedCollectionAmount,
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 60 * 24 * 60 * 60 * 1000)), // Últimos 2 meses
          updatedAt: new Date(),
        });
      }
    }

    await queryInterface.bulkInsert('RouteClients', routeClients, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('RouteClients', null, {});
  },
};
