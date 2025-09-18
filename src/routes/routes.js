import express from 'express';
import * as routesController from '../controllers/routesController.js';

const router = express.Router();

// ============= RUTAS PARA GESTIÓN DE RUTAS =============

/**
 * @route GET /api/routes
 * @desc Obtener todas las rutas con filtros y paginación
 * @query {number} page - Página actual (default: 1)
 * @query {number} limit - Elementos por página (default: 10)
 * @query {string} search - Búsqueda por nombre o descripción
 * @query {string} status - Filtro por estado (active, inactive, archived)
 * @query {string} dayOfWeek - Filtro por día de la semana
 * @query {string} priority - Filtro por prioridad
 */
router.get('/', routesController.getAllRoutes);

/**
 * @route GET /api/routes/stats
 * @desc Obtener estadísticas generales de rutas
 */
router.get('/stats', routesController.getRoutesStats);

/**
 * @route GET /api/routes/today
 * @desc Obtener ejecuciones de rutas para el día de hoy
 */
router.get('/today', routesController.getTodayExecutions);

/**
 * @route GET /api/routes/:id
 * @desc Obtener una ruta específica por ID
 * @param {number} id - ID de la ruta
 */
router.get('/:id', routesController.getRouteById);

/**
 * @route POST /api/routes
 * @desc Crear una nueva ruta
 * @body {string} name - Nombre de la ruta (requerido)
 * @body {string} description - Descripción de la ruta
 * @body {string} dayOfWeek - Día de la semana asignado
 * @body {string} startTime - Hora de inicio sugerida (HH:MM)
 * @body {number} estimatedDuration - Duración estimada en minutos
 * @body {string} priority - Prioridad (low, medium, high, urgent)
 * @body {string} color - Color hexadecimal para identificar la ruta
 * @body {string} observations - Observaciones
 * @body {number[]} clientIds - Array de IDs de clientes a agregar
 */
router.post('/', routesController.createRoute);

/**
 * @route PUT /api/routes/:id
 * @desc Actualizar una ruta existente
 * @param {number} id - ID de la ruta
 */
router.put('/:id', routesController.updateRoute);

// ============= RUTAS PARA GESTIÓN DE CLIENTES EN RUTAS =============

/**
 * @route POST /api/routes/:routeId/clients/:clientId
 * @desc Agregar un cliente a una ruta
 * @param {number} routeId - ID de la ruta
 * @param {number} clientId - ID del cliente
 * @body {number} visitOrder - Orden de visita (opcional)
 * @body {string} priority - Prioridad específica para este cliente
 * @body {string} observations - Observaciones específicas
 * @body {number} estimatedCollectionAmount - Monto estimado a cobrar
 */
router.post('/:routeId/clients/:clientId', routesController.addClientToRoute);

/**
 * @route DELETE /api/routes/:routeId/clients/:clientId
 * @desc Remover un cliente de una ruta
 * @param {number} routeId - ID de la ruta
 * @param {number} clientId - ID del cliente
 */
router.delete('/:routeId/clients/:clientId', routesController.removeClientFromRoute);

// ============= RUTAS PARA EJECUCIÓN DIARIA =============

/**
 * @route POST /api/routes/:routeId/execute
 * @desc Iniciar la ejecución diaria de una ruta
 * @param {number} routeId - ID de la ruta
 * @body {string} executionDate - Fecha de ejecución (YYYY-MM-DD, opcional - default: hoy)
 * @body {string} executorName - Nombre de la persona que ejecuta la ruta
 * @body {string} estimatedStartTime - Hora estimada de inicio (HH:MM)
 * @body {string} estimatedEndTime - Hora estimada de finalización (HH:MM)
 * @body {string} observations - Observaciones de la ejecución
 */
router.post('/:routeId/execute', routesController.startDailyExecution);

/**
 * @route GET /api/routes/:routeId/execution
 * @desc Obtener información de la ejecución diaria de una ruta
 * @param {number} routeId - ID de la ruta
 * @query {string} date - Fecha de la ejecución (YYYY-MM-DD, opcional - default: hoy)
 */
router.get('/:routeId/execution', routesController.getDailyExecution);

// ============= RUTAS PARA GESTIÓN DE PAGOS =============

/**
 * @route POST /api/routes/:routeId/executions/:executionId/payments
 * @desc Procesar un pago durante la ejecución de una ruta
 * @param {number} routeId - ID de la ruta
 * @param {number} executionId - ID de la ejecución
 * @body {number} clientId - ID del cliente (requerido)
 * @body {number} creditId - ID del crédito específico (opcional)
 * @body {number} amount - Monto del pago (requerido)
 * @body {string} paymentType - Tipo de pago (full, partial, advance, interest_only)
 * @body {string} paymentMethod - Método de pago (cash, transfer, check, card, digital_wallet)
 * @body {string} collectorName - Nombre del cobrador
 * @body {string} observations - Observaciones del pago
 * @body {number} latitude - Latitud GPS donde se realizó el pago
 * @body {number} longitude - Longitud GPS donde se realizó el pago
 */
router.post('/:routeId/executions/:executionId/payments', routesController.processRoutePayment);

export default router;
