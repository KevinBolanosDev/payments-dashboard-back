'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const clients = [];

    // Nombres y apellidos colombianos variados
    const firstNames = [
      'María',
      'Carlos',
      'Ana',
      'Luis',
      'Carmen',
      'José',
      'Luz',
      'Miguel',
      'Rosa',
      'David',
      'Patricia',
      'Fernando',
      'Gloria',
      'Ricardo',
      'Sandra',
      'Andrés',
      'Claudia',
      'Jorge',
      'Mónica',
      'Alejandro',
      'Diana',
      'Sergio',
      'Esperanza',
      'Óscar',
      'Beatriz',
      'Javier',
      'Adriana',
      'Mauricio',
      'Liliana',
      'Hernán',
      'Yolanda',
      'Rubén',
      'Pilar',
      'Édgar',
      'Norma',
      'Iván',
      'Teresa',
      'Guillermo',
      'Amparo',
      'Fabián',
    ];

    const lastNames = [
      'García',
      'Rodríguez',
      'López',
      'Martínez',
      'González',
      'Pérez',
      'Sánchez',
      'Ramírez',
      'Cruz',
      'Flores',
      'Herrera',
      'Vargas',
      'Castillo',
      'Jiménez',
      'Morales',
      'Ortega',
      'Delgado',
      'Castro',
      'Ortiz',
      'Rubio',
      'Marín',
      'Soto',
      'Contreras',
      'Silva',
      'Sepúlveda',
      'Mendoza',
      'Guerrero',
      'Medina',
      'Rojas',
      'Campos',
      'Vásquez',
      'Romero',
      'Álvarez',
      'Torres',
      'Domínguez',
      'Gil',
      'Aguilar',
      'Moreno',
      'Gutiérrez',
      'Díaz',
    ];

    const neighborhoods = [
      'Centro',
      'La Candelaria',
      'Chapinero',
      'Zona Rosa',
      'Usaquén',
      'Suba',
      'Engativá',
      'Fontibón',
      'Kennedy',
      'Bosa',
      'Ciudad Bolívar',
      'San Cristóbal',
      'Usme',
      'Tunjuelito',
      'Rafael Uribe',
      'Puente Aranda',
      'La Macarena',
      'Teusaquillo',
      'Barrios Unidos',
      'Santafé',
      'Los Mártires',
      'Antonio Nariño',
      'Villa del Río',
      'Minuto de Dios',
      'Salitre',
      'Modelia',
      'Hayuelos',
      'Tintal',
      'Patio Bonito',
      'Las Ferias',
      'Quiroga',
      'San Rafael',
      'Villa Luz',
      'El Recreo',
      'Diana Turbay',
      'Marruecos',
      'El Tunal',
      'Venecia',
      'Bosa Centro',
      'Villa Alsacia',
    ];

    const streets = ['Calle', 'Carrera', 'Avenida', 'Diagonal', 'Transversal'];

    // Generar 40 clientes
    for (let i = 1; i <= 40; i++) {
      const firstName = firstNames[i - 1];
      const lastName = lastNames[i - 1];
      const identificationNumber = String(1000000000 + i * 123456).substring(0, 10);

      // Generar teléfono colombiano
      const phonePrefix = [
        '300',
        '301',
        '302',
        '310',
        '311',
        '312',
        '313',
        '314',
        '315',
        '316',
        '317',
        '318',
        '319',
        '320',
        '321',
        '322',
        '323',
        '324',
        '350',
        '351',
      ];
      const phone = `${phonePrefix[i % phonePrefix.length]}${String(Math.floor(Math.random() * 9000000) + 1000000)}`;

      // Generar dirección colombiana
      const street = streets[i % streets.length];
      const streetNumber = Math.floor(Math.random() * 200) + 1;
      const houseNumber = Math.floor(Math.random() * 99) + 1;
      const neighborhood = neighborhoods[i % neighborhoods.length];
      const address = `${street} ${streetNumber} # ${houseNumber}-${Math.floor(Math.random() * 99) + 1}, ${neighborhood}`;

      // Generar email
      const email = `${firstName.toLowerCase().replace('á', 'a').replace('é', 'e').replace('í', 'i').replace('ó', 'o').replace('ú', 'u')}.${lastName.toLowerCase().replace('á', 'a').replace('é', 'e').replace('í', 'i').replace('ó', 'o').replace('ú', 'u')}${i}@email.com`;

      // Estados variados
      const statuses = ['active', 'active', 'active', 'active', 'inactive', 'suspended']; // Más activos
      const status = statuses[i % statuses.length];

      // Límites de crédito variados
      const creditLimits = [500000, 1000000, 1500000, 2000000, 3000000, 5000000];
      const maxCredit = creditLimits[i % creditLimits.length];

      clients.push({
        firstName,
        lastName,
        identificationNumber,
        email,
        phone,
        address,
        status,
        maxCredit,
        currentBalance: 0, // Se actualizará con los créditos
        observations: i % 5 === 0 ? `Cliente ${i} - Observaciones especiales` : null,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)), // Fechas aleatorias del último año
        updatedAt: new Date(),
      });
    }

    await queryInterface.bulkInsert('Clients', clients, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Clients', null, {});
  },
};
