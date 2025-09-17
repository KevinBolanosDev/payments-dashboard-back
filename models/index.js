import { DataTypes, Sequelize } from 'sequelize';

// Configuración directa para desarrollo
const config = {
  storage: './database.sqlite',
  dialect: 'sqlite',
};

// Inicializar Sequelize
const sequelize = new Sequelize(config);

// Importar modelos
import clientsModel from './clients.js';
import creditsModel from './credits.js';

// Inicializar modelos
const Clients = clientsModel(sequelize, DataTypes);
const Credits = creditsModel(sequelize, DataTypes);

// Crear objeto db
const db = {
  Clients,
  Credits,
  sequelize,
  Sequelize,
};

// Configurar asociaciones
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

export default db;
export { Clients, Credits };
