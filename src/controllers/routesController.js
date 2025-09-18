import {
  Clients,
  Credits,
  DailyInterests,
  PaymentReceipts,
  Payments,
  RouteClients,
  RouteExecutions,
  Routes,
} from '../../models/index.js';

// ============= GESTIÓN DE RUTAS =============

/**
 * Obtener todas las rutas
 */
export const getAllRoutes = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, dayOfWeek, priority } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};

    // Filtros
    if (search) {
      whereClause[Routes.sequelize.Sequelize.Op.or] = [
        { name: { [Routes.sequelize.Sequelize.Op.like]: `%${search}%` } },
        { description: { [Routes.sequelize.Sequelize.Op.like]: `%${search}%` } },
      ];
    }
    if (status) whereClause.status = status;
    if (dayOfWeek) whereClause.dayOfWeek = dayOfWeek;
    if (priority) whereClause.priority = priority;

    const routes = await Routes.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Clients,
          as: 'clients',
          attributes: ['id', 'firstName', 'lastName', 'identificationNumber'],
          through: {
            attributes: ['visitOrder', 'priority', 'status', 'estimatedCollectionAmount'],
          },
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
    });

    const totalPages = Math.ceil(routes.count / limit);

    res.json({
      success: true,
      data: routes.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: routes.count,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Error getting routes:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
};

/**
 * Obtener una ruta por ID
 */
export const getRouteById = async (req, res) => {
  try {
    const { id } = req.params;

    const route = await Routes.findByPk(id, {
      include: [
        {
          model: Clients,
          as: 'clients',
          attributes: [
            'id',
            'firstName',
            'lastName',
            'identificationNumber',
            'phone',
            'address',
            'currentBalance',
          ],
          through: {
            attributes: [
              'visitOrder',
              'priority',
              'status',
              'estimatedCollectionAmount',
              'observations',
            ],
          },
          include: [
            {
              model: Credits,
              as: 'credits',
              where: { status: 'active' },
              required: false,
              attributes: [
                'id',
                'amount',
                'currentBalance',
                'interestRate',
                'dueDate',
                'totalPaid',
              ],
            },
          ],
        },
        {
          model: RouteExecutions,
          as: 'executions',
          limit: 5,
          order: [['executionDate', 'DESC']],
          attributes: [
            'id',
            'executionDate',
            'status',
            'totalCollected',
            'clientsVisited',
            'totalClientsPlanned',
          ],
        },
      ],
    });

    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Ruta no encontrada',
      });
    }

    res.json({
      success: true,
      data: route,
    });
  } catch (error) {
    console.error('Error getting route:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
};

/**
 * Crear nueva ruta
 */
export const createRoute = async (req, res) => {
  try {
    const {
      name,
      description,
      dayOfWeek,
      startTime,
      estimatedDuration,
      priority = 'medium',
      color,
      observations,
      clientIds = [],
    } = req.body;

    // Validaciones básicas
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'El nombre de la ruta es requerido',
      });
    }

    // Crear la ruta
    const route = await Routes.create({
      name,
      description,
      dayOfWeek,
      startTime,
      estimatedDuration,
      priority,
      color,
      observations,
    });

    // Agregar clientes a la ruta si se proporcionaron
    if (clientIds.length > 0) {
      const routeClients = clientIds.map((clientId, index) => ({
        routeId: route.id,
        clientId,
        visitOrder: index + 1,
        priority: 'medium',
        status: 'active',
      }));

      await RouteClients.bulkCreate(routeClients);
    }

    // Obtener la ruta completa para respuesta
    const completeRoute = await Routes.findByPk(route.id, {
      include: [
        {
          model: Clients,
          as: 'clients',
          attributes: ['id', 'firstName', 'lastName', 'identificationNumber'],
          through: { attributes: ['visitOrder', 'priority', 'status'] },
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: 'Ruta creada exitosamente',
      data: completeRoute,
    });
  } catch (error) {
    console.error('Error creating route:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
};

/**
 * Actualizar ruta
 */
export const updateRoute = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const route = await Routes.findByPk(id);
    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Ruta no encontrada',
      });
    }

    await route.update(updateData);

    const updatedRoute = await Routes.findByPk(id, {
      include: [
        {
          model: Clients,
          as: 'clients',
          attributes: ['id', 'firstName', 'lastName', 'identificationNumber'],
          through: { attributes: ['visitOrder', 'priority', 'status'] },
        },
      ],
    });

    res.json({
      success: true,
      message: 'Ruta actualizada exitosamente',
      data: updatedRoute,
    });
  } catch (error) {
    console.error('Error updating route:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
};

// ============= GESTIÓN DE CLIENTES EN RUTAS =============

/**
 * Agregar cliente a ruta
 */
export const addClientToRoute = async (req, res) => {
  try {
    const { routeId, clientId } = req.params;
    const { visitOrder, priority = 'medium', observations, estimatedCollectionAmount } = req.body;

    // Verificar que la ruta existe
    const route = await Routes.findByPk(routeId);
    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Ruta no encontrada',
      });
    }

    // Verificar que el cliente existe y tiene créditos activos
    const client = await Clients.findByPk(clientId, {
      include: [
        {
          model: Credits,
          as: 'credits',
          where: { status: 'active' },
          required: false,
        },
      ],
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado',
      });
    }

    if (!client.credits || client.credits.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'El cliente no tiene créditos activos',
      });
    }

    // Verificar si ya está en la ruta
    const existing = await RouteClients.findOne({
      where: { routeId, clientId },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'El cliente ya está asignado a esta ruta',
      });
    }

    // Determinar orden de visita si no se especifica
    let finalVisitOrder = visitOrder;
    if (!finalVisitOrder) {
      const maxOrder = await RouteClients.max('visitOrder', {
        where: { routeId },
      });
      finalVisitOrder = (maxOrder || 0) + 1;
    }

    // Agregar cliente a la ruta
    const routeClient = await RouteClients.create({
      routeId,
      clientId,
      visitOrder: finalVisitOrder,
      priority,
      observations,
      estimatedCollectionAmount: estimatedCollectionAmount || 0,
      status: 'active',
    });

    // Obtener información completa del cliente agregado
    const clientWithCredits = await RouteClients.findByPk(routeClient.id, {
      include: [
        {
          model: Clients,
          as: 'client',
          attributes: ['id', 'firstName', 'lastName', 'identificationNumber', 'phone'],
          include: [
            {
              model: Credits,
              as: 'credits',
              where: { status: 'active' },
              attributes: ['id', 'amount', 'currentBalance', 'interestRate'],
            },
          ],
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: 'Cliente agregado a la ruta exitosamente',
      data: clientWithCredits,
    });
  } catch (error) {
    console.error('Error adding client to route:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
};

/**
 * Remover cliente de ruta
 */
export const removeClientFromRoute = async (req, res) => {
  try {
    const { routeId, clientId } = req.params;

    const routeClient = await RouteClients.findOne({
      where: { routeId, clientId },
    });

    if (!routeClient) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado en esta ruta',
      });
    }

    await routeClient.destroy();

    res.json({
      success: true,
      message: 'Cliente removido de la ruta exitosamente',
    });
  } catch (error) {
    console.error('Error removing client from route:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
};

// ============= EJECUCIÓN DIARIA DE RUTAS =============

/**
 * Iniciar ejecución diaria de ruta
 */
export const startDailyExecution = async (req, res) => {
  try {
    const { routeId } = req.params;
    const { executionDate, executorName, estimatedStartTime, estimatedEndTime, observations } =
      req.body;

    const date = executionDate || new Date().toISOString().split('T')[0];

    // Verificar que la ruta existe
    const route = await Routes.findByPk(routeId);
    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Ruta no encontrada',
      });
    }

    // Verificar si ya existe una ejecución para esta fecha
    const existingExecution = await RouteExecutions.findOne({
      where: { routeId, executionDate: date },
    });

    if (existingExecution) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe una ejecución para esta ruta en esta fecha',
      });
    }

    // Generar intereses diarios para todos los clientes de la ruta
    await DailyInterests.generateDailyInterestsForRoute(routeId, date);

    // Crear ejecución
    const execution = await RouteExecutions.createExecution(routeId, date, {
      executorName,
      estimatedStartTime,
      estimatedEndTime,
      observations,
    });

    // Obtener información completa de la ejecución
    const completeExecution = await RouteExecutions.findByPk(execution.id, {
      include: [
        {
          model: Routes,
          as: 'route',
          attributes: ['id', 'name', 'color', 'priority'],
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: 'Ejecución diaria iniciada exitosamente',
      data: completeExecution,
    });
  } catch (error) {
    console.error('Error starting daily execution:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
};

/**
 * Obtener información de ejecución diaria
 */
export const getDailyExecution = async (req, res) => {
  try {
    const { routeId } = req.params;
    const { date } = req.query;

    const executionDate = date || new Date().toISOString().split('T')[0];

    const execution = await RouteExecutions.findOne({
      where: { routeId, executionDate },
      include: [
        {
          model: Routes,
          as: 'route',
          attributes: ['id', 'name', 'color', 'priority'],
        },
        {
          model: Payments,
          as: 'payments',
          attributes: ['id', 'amount', 'paymentType', 'status', 'clientId'],
        },
      ],
    });

    if (!execution) {
      return res.status(404).json({
        success: false,
        message: 'No se encontró ejecución para esta fecha',
      });
    }

    // Obtener clientes de la ruta con información de intereses diarios
    const routeClients = await RouteClients.getRouteClients(routeId);

    // Agregar información de intereses diarios para cada cliente
    const clientsWithDailyInfo = await Promise.all(
      routeClients.map(async routeClient => {
        const dailyTotal = await DailyInterests.getClientDailyTotal(
          routeClient.clientId,
          executionDate
        );

        return {
          ...routeClient.toJSON(),
          dailyTotal,
        };
      })
    );

    res.json({
      success: true,
      data: {
        execution,
        clients: clientsWithDailyInfo,
      },
    });
  } catch (error) {
    console.error('Error getting daily execution:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
};

// ============= GESTIÓN DE PAGOS EN RUTAS =============

/**
 * Procesar pago en ruta
 */
export const processRoutePayment = async (req, res) => {
  try {
    const { routeId, executionId } = req.params;
    const {
      clientId,
      creditId,
      amount,
      paymentType = 'full',
      paymentMethod = 'cash',
      collectorName,
      observations,
      latitude,
      longitude,
    } = req.body;

    // Validaciones
    if (!clientId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Cliente y monto son requeridos',
      });
    }

    // Verificar que la ejecución existe
    const execution = await RouteExecutions.findByPk(executionId);
    if (!execution) {
      return res.status(404).json({
        success: false,
        message: 'Ejecución no encontrada',
      });
    }

    // Crear el pago
    const payment = await Payments.createPayment({
      clientId,
      creditId,
      routeId,
      routeExecutionId: executionId,
      amount,
      paymentType,
      paymentMethod,
      collectorName,
      observations,
      latitude,
      longitude,
    });

    // Generar recibo automáticamente
    const receipt = await PaymentReceipts.generateReceipt(payment.id);

    // Actualizar estadísticas de la ejecución
    await execution.update({
      totalCollected: execution.totalCollected + parseFloat(amount),
      clientsVisited: execution.clientsVisited + 1,
    });

    res.status(201).json({
      success: true,
      message: 'Pago procesado exitosamente',
      data: {
        payment,
        receipt,
      },
    });
  } catch (error) {
    console.error('Error processing route payment:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
};

// ============= REPORTES Y ESTADÍSTICAS =============

/**
 * Obtener estadísticas de rutas
 */
export const getRoutesStats = async (req, res) => {
  try {
    const stats = await Routes.getStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error getting routes stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
};

/**
 * Obtener ejecuciones de hoy
 */
export const getTodayExecutions = async (req, res) => {
  try {
    const executions = await RouteExecutions.getTodayExecutions();

    res.json({
      success: true,
      data: executions,
    });
  } catch (error) {
    console.error('Error getting today executions:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
};
