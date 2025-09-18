'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const routeExecutions = [];

    const executorNames = [
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
      'David Jiménez',
      'Patricia Morales',
      'Fernando Ortega',
      'Gloria Delgado',
      'Ricardo Castro',
    ];

    const statuses = [
      'completed',
      'completed',
      'completed',
      'in_progress',
      'cancelled',
      'postponed',
    ];

    const weatherConditions = [
      'Soleado',
      'Parcialmente nublado',
      'Nublado',
      'Lluvia ligera',
      'Lluvia fuerte',
      'Despejado',
      'Brumoso',
      'Ventoso',
      'Caluroso',
      'Fresco',
    ];

    const observations = [
      'Ruta completada sin inconvenientes',
      'Algunos clientes no estaban disponibles',
      'Tráfico pesado en la zona',
      'Excelente colaboración de los clientes',
      'Se requiere reprogramar 2 visitas',
      'Ruta ejecutada según lo planificado',
      'Dificultades de acceso en algunos sectores',
      'Muy buena recepción por parte de los clientes',
      'Se logró superar la meta de cobro',
      'Algunos pagos parciales autorizados',
    ];

    // Generar ejecuciones para los últimos 30 días
    const today = new Date();

    // Crear ejecuciones para diferentes rutas en diferentes días
    for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
      const executionDate = new Date(today.getTime() - dayOffset * 24 * 60 * 60 * 1000);
      const dateString = executionDate.toISOString().split('T')[0];

      // Ejecutar entre 3-8 rutas por día
      const routesToExecute = Math.floor(Math.random() * 6) + 3;
      const usedRoutes = new Set();

      for (let i = 0; i < routesToExecute; i++) {
        let routeId;

        // Seleccionar ruta aleatoria que no se haya usado hoy
        do {
          routeId = Math.floor(Math.random() * 40) + 1;
        } while (usedRoutes.has(routeId));

        usedRoutes.add(routeId);

        const executorName = executorNames[Math.floor(Math.random() * executorNames.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];

        // Horarios realistas
        const startHour = Math.floor(Math.random() * 4) + 7; // 7-10 AM
        const startMinute = Math.floor(Math.random() * 4) * 15; // 0, 15, 30, 45
        const startTime = `${String(startHour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')}`;

        const endHour = startHour + Math.floor(Math.random() * 6) + 4; // 4-9 horas después
        const endMinute = Math.floor(Math.random() * 4) * 15;
        const endTime = `${String(Math.min(endHour, 23)).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;

        const estimatedStartTime = startTime;
        const estimatedEndTime = `${String(startHour + 6).padStart(2, '0')}:${String(startMinute).padStart(2, '0')}`;

        // Estadísticas realistas basadas en el estado
        let totalClientsPlanned = Math.floor(Math.random() * 10) + 5; // 5-15 clientes
        let clientsVisited = 0;
        let totalCollected = 0;
        let totalExpenses = Math.floor(Math.random() * 50000) + 20000; // 20k-70k gastos

        if (status === 'completed') {
          clientsVisited = Math.floor(totalClientsPlanned * (0.7 + Math.random() * 0.3)); // 70-100% visitados
          totalCollected = Math.floor(Math.random() * 2000000) + 500000; // 500k-2.5M cobrado
        } else if (status === 'in_progress') {
          clientsVisited = Math.floor(totalClientsPlanned * Math.random() * 0.6); // 0-60% visitados
          totalCollected = Math.floor(Math.random() * 1000000) + 100000; // 100k-1.1M cobrado
        } else if (status === 'cancelled' || status === 'postponed') {
          clientsVisited = Math.floor(totalClientsPlanned * Math.random() * 0.3); // 0-30% visitados
          totalCollected = Math.floor(Math.random() * 300000); // 0-300k cobrado
        }

        routeExecutions.push({
          routeId,
          executionDate: dateString,
          executorName,
          status,
          startTime: status === 'completed' ? startTime : null,
          endTime: status === 'completed' ? endTime : null,
          estimatedStartTime,
          estimatedEndTime,
          totalClientsPlanned,
          clientsVisited,
          totalCollected,
          totalExpenses,
          observations: observations[Math.floor(Math.random() * observations.length)],
          weatherConditions:
            weatherConditions[Math.floor(Math.random() * weatherConditions.length)],
          createdAt: new Date(
            executionDate.getTime() + Math.floor(Math.random() * 12 * 60 * 60 * 1000)
          ), // Creado durante el día
          updatedAt: new Date(),
        });
      }
    }

    await queryInterface.bulkInsert('RouteExecutions', routeExecutions, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('RouteExecutions', null, {});
  },
};
