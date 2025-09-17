import express from 'express';

const router = express.Router();

// Ruta base de la API
router.get('/', (req, res) => {
  res.json({
    message: '🎯 API de Gestión de Cobros',
    version: '1.0.0',
    status: 'active',
    availableRoutes: {
      clients: '/api/clients',
      credits: '/api/credits',
      // Future routes
      payments: '/api/payments (coming soon)',
      reports: '/api/reports (coming soon)',
    },
    specialEndpoints: {
      activeClients: '/api/clients/active',
      clientBalance: '/api/clients/:id/balance',
      clientCredits: '/api/clients/:id/credits',
      activeCredits: '/api/credits/active',
      overdueCredits: '/api/credits/overdue',
      creditsStatistics: '/api/credits/statistics',
      creditStatus: '/api/credits/:id/status',
    },
  });
});

export default router;
