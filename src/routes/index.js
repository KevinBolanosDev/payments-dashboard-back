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
      routes: '/api/routes',
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
      // Routes endpoints
      routesStats: '/api/routes/stats',
      todayExecutions: '/api/routes/today',
      startExecution: 'POST /api/routes/:id/execute',
      processPayment: 'POST /api/routes/:routeId/executions/:executionId/payments',
    },
  });
});

export default router;
