import { Op } from 'sequelize';
import { Clients, Credits } from '../../models/index.js';

// GET /api/clients - Get all clients
export const getAllClients = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status = '',
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = req.query;

    const offset = (page - 1) * limit;

    // Build filters
    const whereClause = {};

    if (search) {
      whereClause[Op.or] = [
        { firstName: { [Op.like]: `%${search}%` } },
        { lastName: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { identificationNumber: { [Op.like]: `%${search}%` } },
      ];
    }

    if (status) {
      whereClause.status = status;
    }

    // Consultar la base de datos con los filtros y paginación
    const clients = await Clients.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, sortOrder]],
      attributes: {
        include: [
          'fullName', // Include virtual field
          [
            Credits.sequelize.literal(`(
              SELECT COUNT(*)
              FROM Credits
              WHERE Credits.clientId = Clients.id
              AND Credits.status = 'active'
            )`),
            'activeCreditsCount',
          ],
        ],
      },
    });

    res.json({
      success: true,
      data: clients.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(clients.count / limit),
        totalItems: clients.count,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Error getting clients:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// GET /api/clients/:id - Get client by ID
export const getClientById = async (req, res) => {
  try {
    const { id } = req.params;

    const client = await Clients.findByPk(id, {
      attributes: {
        include: ['fullName'],
      },
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found',
      });
    }

    res.json({
      success: true,
      data: client,
    });
  } catch (error) {
    console.error('Error getting client:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// POST /api/clients - Create new client
export const createClient = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      identificationNumber,
      phone,
      address,
      email,
      status = 'inactive',
      maxCredit = 0,
      basePrice = 0,
      observations,
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !identificationNumber) {
      return res.status(400).json({
        success: false,
        message: 'First name, last name and identification number are required fields',
      });
    }

    // Check if identification number already exists
    const existingClientByIdentification = await Clients.findOne({
      where: { identificationNumber },
    });
    if (existingClientByIdentification) {
      return res.status(400).json({
        success: false,
        message: 'A client with this identification number already exists',
      });
    }

    // Check if email already exists (only if provided)
    if (email && email.trim() !== '') {
      const existingClient = await Clients.findByEmail(email);
      if (existingClient) {
        return res.status(400).json({
          success: false,
          message: 'A client with this email already exists',
        });
      }
    }

    const client = await Clients.create({
      firstName,
      lastName,
      identificationNumber,
      phone,
      address,
      email,
      status,
      currentBalance: 0.0,
      maxCredit,
      basePrice,
      observations,
    });

    res.status(201).json({
      success: true,
      message: 'Client created successfully',
      data: client,
    });
  } catch (error) {
    console.error('Error creating client:', error);

    // Handle Sequelize validation errors
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map(err => ({
          field: err.path,
          message: err.message,
        })),
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// PUT /api/clients/:id - Actualizar cliente
export const updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const client = await Clients.findByPk(id);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado',
      });
    }

    // Si se está actualizando el email, verificar que no exista (solo si no está vacío)
    if (updateData.email && updateData.email.trim() !== '' && updateData.email !== client.email) {
      const existingClient = await Clients.findByEmail(updateData.email);
      if (existingClient) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe un cliente con este email',
        });
      }
    }

    // Si se está actualizando el número de identificación, verificar que no exista
    if (
      updateData.identificationNumber &&
      updateData.identificationNumber !== client.identificationNumber
    ) {
      const existingClientByIdentification = await Clients.findOne({
        where: { identificationNumber: updateData.identificationNumber },
      });
      if (existingClientByIdentification) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe un cliente con este número de identificación',
        });
      }
    }

    await client.update(updateData);

    res.json({
      success: true,
      message: 'Cliente actualizado exitosamente',
      data: client,
    });
  } catch (error) {
    console.error('Error updating client:', error);

    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors: error.errors.map(err => ({
          field: err.path,
          message: err.message,
        })),
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
};

// DELETE /api/clients/:id - Eliminar cliente
export const deleteClient = async (req, res) => {
  try {
    const { id } = req.params;

    const client = await Clients.findByPk(id);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado',
      });
    }

    // Verificar si el cliente tiene balance pendiente
    if (client.currentBalance > 0) {
      return res.status(400).json({
        success: false,
        message: 'No se puede eliminar un cliente con balance pendiente',
      });
    }

    await client.destroy();

    res.json({
      success: true,
      message: 'Cliente eliminado exitosamente',
    });
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
};

// GET /api/clients/active - Obtener solo clientes activos
export const getActiveClients = async (req, res) => {
  try {
    const clients = await Clients.findActive();

    res.json({
      success: true,
      data: clients,
    });
  } catch (error) {
    console.error('Error getting active clients:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
};

// PATCH /api/clients/:id/balance - Actualizar balance del cliente
export const updateClientBalance = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, operation } = req.body; // operation: 'add' | 'subtract' | 'set'

    if (!amount || !operation) {
      return res.status(400).json({
        success: false,
        message: 'Monto y operación son requeridos',
      });
    }

    const client = await Clients.findByPk(id);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado',
      });
    }

    let newBalance = client.currentBalance;

    switch (operation) {
      case 'add':
        newBalance += parseFloat(amount);
        break;
      case 'subtract':
        newBalance -= parseFloat(amount);
        break;
      case 'set':
        newBalance = parseFloat(amount);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Operación no válida. Use: add, subtract, o set',
        });
    }

    // Verificar límite de crédito
    if (newBalance > client.maxCredit) {
      return res.status(400).json({
        success: false,
        message: `El balance excede el límite de crédito (${client.maxCredit})`,
      });
    }

    await client.update({ currentBalance: newBalance });

    res.json({
      success: true,
      message: 'Balance actualizado exitosamente',
      data: {
        previousBalance: client.currentBalance,
        newBalance: newBalance,
        operation: operation,
        amount: amount,
      },
    });
  } catch (error) {
    console.error('Error updating client balance:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
};

// GET /api/clients/stats - Obtener estadísticas de clientes
export const getClientsStats = async (req, res) => {
  try {
    const stats = await Clients.getStats();

    res.json({
      success: true,
      data: stats,
      message: 'Estadísticas obtenidas exitosamente',
    });
  } catch (error) {
    console.error('Error getting clients stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
};
