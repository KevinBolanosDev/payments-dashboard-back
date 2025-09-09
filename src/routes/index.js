import express from 'express';

const router = express.Router();

// Ruta base de la API
router.get('/', (req, res) => {
  res.json({
    message: '🎯 API de Gestión de Cobros',
    version: '1.0.0',
    availableRoutes: {
      clientes: '/api/clientes',
      creditos: '/api/creditos',
      rutas: '/api/rutas',
      cobros: '/api/cobros',
      recibos: '/api/recibos',
    },
  });
});

export default router;
