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
import dailyInterestsModel from './dailyInterests.js';
import paymentReceiptsModel from './paymentReceipts.js';
import paymentsModel from './payments.js';
import routeClientsModel from './routeClients.js';
import routeExecutionsModel from './routeExecutions.js';
import routesModel from './routes.js';

// Inicializar modelos
const Clients = clientsModel(sequelize, DataTypes);
const Credits = creditsModel(sequelize, DataTypes);
const DailyInterests = dailyInterestsModel(sequelize, DataTypes);
const Routes = routesModel(sequelize, DataTypes);
const RouteClients = routeClientsModel(sequelize, DataTypes);
const RouteExecutions = routeExecutionsModel(sequelize, DataTypes);
const Payments = paymentsModel(sequelize, DataTypes);
const PaymentReceipts = paymentReceiptsModel(sequelize, DataTypes);

// Crear objeto db
const db = {
  Clients,
  Credits,
  DailyInterests,
  Routes,
  RouteClients,
  RouteExecutions,
  Payments,
  PaymentReceipts,
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
export {
  Clients,
  Credits,
  DailyInterests,
  PaymentReceipts,
  Payments,
  RouteClients,
  RouteExecutions,
  Routes,
};
