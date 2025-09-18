'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const routes = [];

    // Nombres de rutas por zonas de Bogotá
    const routeNames = [
      'Ruta Centro Histórico',
      'Ruta Chapinero Norte',
      'Ruta Zona Rosa',
      'Ruta Usaquén',
      'Ruta Suba Oriental',
      'Ruta Engativá Centro',
      'Ruta Fontibón',
      'Ruta Kennedy Central',
      'Ruta Bosa Occidental',
      'Ruta Ciudad Bolívar',
      'Ruta San Cristóbal Sur',
      'Ruta Usme',
      'Ruta Tunjuelito',
      'Ruta Rafael Uribe',
      'Ruta Puente Aranda',
      'Ruta La Macarena',
      'Ruta Teusaquillo',
      'Ruta Barrios Unidos',
      'Ruta Santafé',
      'Ruta Los Mártires',
      'Ruta Antonio Nariño',
      'Ruta Minuto de Dios',
      'Ruta Salitre',
      'Ruta Modelia',
      'Ruta Hayuelos',
      'Ruta Tintal Plaza',
      'Ruta Patio Bonito',
      'Ruta Las Ferias',
      'Ruta Quiroga',
      'Ruta San Rafael',
      'Ruta Villa Luz',
      'Ruta El Recreo',
      'Ruta Diana Turbay',
      'Ruta Marruecos',
      'Ruta El Tunal',
      'Ruta Venecia',
      'Ruta Bosa Centro',
      'Ruta Villa Alsacia',
      'Ruta Suba Occidental',
      'Ruta Norte Express',
    ];

    const descriptions = [
      'Ruta de cobro en el centro histórico de la ciudad',
      'Cobertura de la zona comercial del norte',
      'Ruta especializada en sector residencial',
      'Cobros en zona empresarial',
      'Ruta mixta comercial y residencial',
      'Sector de alta densidad poblacional',
      'Zona industrial y comercial',
      'Ruta de barrios populares',
      'Cobertura de conjuntos residenciales',
      'Ruta en desarrollo urbano',
      'Sector de microempresas',
      'Zona comercial tradicional',
      'Ruta de mercados populares',
      'Sector de oficinas y comercio',
      'Ruta residencial estrato medio',
    ];

    const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const priorities = ['low', 'medium', 'high', 'urgent'];
    const statuses = ['active', 'active', 'active', 'active', 'inactive', 'archived'];

    // Colores para identificar visualmente las rutas
    const colors = [
      '#FF5733',
      '#33FF57',
      '#3357FF',
      '#FF33F1',
      '#F1FF33',
      '#33FFF1',
      '#FF8C33',
      '#8C33FF',
      '#33FF8C',
      '#FF3333',
      '#33FFFF',
      '#FFFF33',
      '#FF6B6B',
      '#4ECDC4',
      '#45B7D1',
      '#96CEB4',
      '#FFEAA7',
      '#DDA0DD',
      '#98D8C8',
      '#F7DC6F',
      '#BB8FCE',
      '#85C1E9',
      '#F8C471',
      '#82E0AA',
      '#F1948A',
      '#85C1E9',
      '#F4D03F',
      '#A9DFBF',
      '#D7BDE2',
      '#AED6F1',
      '#FAD7A0',
      '#A3E4D7',
      '#D5A6BD',
      '#AED6F1',
      '#F9E79F',
      '#A9CCE3',
      '#FADBD8',
      '#D1F2EB',
      '#E8DAEF',
      '#D6EAF8',
      '#FCF3CF',
      '#EBDEF0',
    ];

    // Horarios de inicio variados
    const startTimes = [
      '06:00',
      '06:30',
      '07:00',
      '07:30',
      '08:00',
      '08:30',
      '09:00',
      '09:30',
      '10:00',
      '10:30',
      '11:00',
      '11:30',
      '12:00',
      '12:30',
      '13:00',
      '13:30',
      '14:00',
      '14:30',
      '15:00',
      '15:30',
    ];

    // Generar 40 rutas
    for (let i = 1; i <= 40; i++) {
      const name = routeNames[i - 1];
      const description = descriptions[i % descriptions.length];
      const dayOfWeek = daysOfWeek[i % daysOfWeek.length];
      const priority = priorities[i % priorities.length];
      const status = statuses[i % statuses.length];
      const color = colors[i % colors.length];
      const startTime = startTimes[i % startTimes.length];

      // Duración estimada entre 4-8 horas (240-480 minutos)
      const estimatedDuration = Math.floor(Math.random() * 240) + 240;

      const observations = i % 7 === 0 ? `Ruta ${i} requiere coordinación especial` : null;

      routes.push({
        name,
        description,
        status,
        dayOfWeek,
        startTime,
        estimatedDuration,
        priority,
        color,
        observations,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 90 * 24 * 60 * 60 * 1000)), // Últimos 3 meses
        updatedAt: new Date(),
      });
    }

    await queryInterface.bulkInsert('Routes', routes, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Routes', null, {});
  },
};
