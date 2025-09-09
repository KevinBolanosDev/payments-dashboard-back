import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { syncDatabase, testConnection } from './database.js';
import clientesRoutes from './routes/clientes.js';
import apiRoutes from './routes/index.js';

// Configurar variables de entorno
dotenv.config();

// Crear aplicación Express
const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rutas básicas
app.get('/', (req, res) => {
  res.json({
    message: '🎉 API de Gestión de Cobros',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      api: '/api',
    },
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: 'connected',
  });
});

// Rutas de la API
app.use('/api', apiRoutes);
app.use('/api/clientes', clientesRoutes);

// Middleware de manejo de errores
app.use((err, req, res) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Error interno del servidor',
    message: err.message,
  });
});

// Middleware para rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    path: req.originalUrl,
  });
});

// Función para iniciar el servidor
const startServer = async () => {
  try {
    // Probar conexión a la base de datos
    await testConnection();

    // Sincronizar modelos (solo en desarrollo)
    if (process.env.NODE_ENV === 'development') {
      await syncDatabase();
    }

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`\n🚀 Servidor ejecutándose en http://localhost:${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📁 Base de datos: SQLite`);
      console.log(`\n📋 Rutas disponibles:`);
      console.log(`   GET  /           - Información de la API`);
      console.log(`   GET  /health     - Estado del servidor`);
      console.log(`   GET  /api        - Rutas de la API`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

// Manejo de cierre graceful
process.on('SIGINT', () => {
  console.log('\n⏹️  Cerrando servidor...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n⏹️  Cerrando servidor...');
  process.exit(0);
});

// Iniciar servidor
startServer();
