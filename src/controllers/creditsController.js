import { Op } from 'sequelize';
import { Clients, Credits } from '../../models/index.js';

// GET /api/credits - Get all credits
export const getAllCredits = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status = '',
      clientId = '',
      sortBy = 'creditDate',
      sortOrder = 'DESC',
      includeClient = 'true',
    } = req.query;

    const offset = (page - 1) * limit;

    // Build filters
    const whereClause = {};

    if (status) {
      whereClause.status = status;
    }

    if (clientId) {
      whereClause.clientId = clientId;
    }

    // Build include clause
    const includeClause = [];
    if (includeClient === 'true') {
      const clientWhere = {};

      if (search) {
        clientWhere[Op.or] = [
          { firstName: { [Op.like]: `%${search}%` } },
          { lastName: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
        ];
      }

      includeClause.push({
        model: Clients,
        as: 'client',
        attributes: ['id', 'firstName', 'lastName', 'email', 'status'],
        where: Object.keys(clientWhere).length > 0 ? clientWhere : undefined,
      });
    }

    // Search in credit description if no client search
    if (search && includeClient !== 'true') {
      whereClause.description = { [Op.like]: `%${search}%` };
    }

    const credits = await Credits.findAndCountAll({
      where: whereClause,
      include: includeClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, sortOrder]],
      attributes: {
        include: ['daysUntilDue', 'daysOverdue', 'interestAmount', 'totalAmount', 'isOverdueFlag'],
      },
    });

    res.json({
      success: true,
      data: credits.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(credits.count / limit),
        totalItems: credits.count,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Error getting credits:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// GET /api/credits/:id - Get credit by ID
export const getCreditById = async (req, res) => {
  try {
    const { id } = req.params;

    const credit = await Credits.findByPk(id, {
      include: [
        {
          model: Clients,
          as: 'client',
          attributes: ['id', 'firstName', 'lastName', 'email', 'status', 'maxCredit'],
        },
      ],
      attributes: {
        include: ['daysUntilDue', 'daysOverdue', 'interestAmount', 'totalAmount', 'isOverdueFlag'],
      },
    });

    if (!credit) {
      return res.status(404).json({
        success: false,
        message: 'Credit not found',
      });
    }

    res.json({
      success: true,
      data: credit,
    });
  } catch (error) {
    console.error('Error getting credit:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// POST /api/credits - Create new credit
export const createCredit = async (req, res) => {
  try {
    const { clientId, amount, creditDate, dueDate, interestRate = 0, description } = req.body;

    // Validate required fields
    if (!clientId || !amount || !dueDate) {
      return res.status(400).json({
        success: false,
        message: 'Client ID, amount, and due date are required fields',
      });
    }

    // Validate amount
    if (parseFloat(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be greater than 0',
      });
    }

    // Validate dates
    const creditDateObj = new Date(creditDate || Date.now());
    const dueDateObj = new Date(dueDate);

    if (dueDateObj <= creditDateObj) {
      return res.status(400).json({
        success: false,
        message: 'Due date must be after credit date',
      });
    }

    const credit = await Credits.create({
      clientId,
      amount: parseFloat(amount),
      creditDate: creditDate || new Date(),
      dueDate,
      interestRate: parseFloat(interestRate),
      description,
    });

    // Fetch the created credit with client info
    const createdCredit = await Credits.findByPk(credit.id, {
      include: [
        {
          model: Clients,
          as: 'client',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
      ],
      attributes: {
        include: ['daysUntilDue', 'interestAmount', 'totalAmount'],
      },
    });

    res.status(201).json({
      success: true,
      message: 'Credit created successfully',
      data: createdCredit,
    });
  } catch (error) {
    console.error('Error creating credit:', error);

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

    // Handle custom validation errors from hooks
    if (
      error.message.includes('Client not found') ||
      error.message.includes('Cannot grant credit') ||
      error.message.includes('Credit amount exceeds')
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// PUT /api/credits/:id - Update credit
export const updateCredit = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const credit = await Credits.findByPk(id);
    if (!credit) {
      return res.status(404).json({
        success: false,
        message: 'Credit not found',
      });
    }

    // Validate amount if being updated
    if (updateData.amount && parseFloat(updateData.amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be greater than 0',
      });
    }

    // Validate dates if being updated
    if (updateData.dueDate || updateData.creditDate) {
      const creditDateObj = new Date(updateData.creditDate || credit.creditDate);
      const dueDateObj = new Date(updateData.dueDate || credit.dueDate);

      if (dueDateObj <= creditDateObj) {
        return res.status(400).json({
          success: false,
          message: 'Due date must be after credit date',
        });
      }
    }

    // Don't allow changing clientId for security reasons
    if (updateData.clientId && updateData.clientId !== credit.clientId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot change client ID of existing credit',
      });
    }

    await credit.update(updateData);

    // Fetch updated credit with client info
    const updatedCredit = await Credits.findByPk(id, {
      include: [
        {
          model: Clients,
          as: 'client',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
      ],
      attributes: {
        include: ['daysUntilDue', 'daysOverdue', 'interestAmount', 'totalAmount', 'isOverdueFlag'],
      },
    });

    res.json({
      success: true,
      message: 'Credit updated successfully',
      data: updatedCredit,
    });
  } catch (error) {
    console.error('Error updating credit:', error);

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

// DELETE /api/credits/:id - Cancel credit (soft delete by changing status)
export const cancelCredit = async (req, res) => {
  try {
    const { id } = req.params;

    const credit = await Credits.findByPk(id);
    if (!credit) {
      return res.status(404).json({
        success: false,
        message: 'Credit not found',
      });
    }

    // Only allow cancelling active credits
    if (credit.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel credit with status: ${credit.status}`,
      });
    }

    await credit.update({ status: 'cancelled' });

    res.json({
      success: true,
      message: 'Credit cancelled successfully',
      data: credit,
    });
  } catch (error) {
    console.error('Error cancelling credit:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// GET /api/credits/active - Get active credits only
export const getActiveCredits = async (req, res) => {
  try {
    const { limit = 50, includeClient = 'true' } = req.query;

    const includeClause =
      includeClient === 'true'
        ? [
            {
              model: Clients,
              as: 'client',
              attributes: ['id', 'firstName', 'lastName', 'email', 'status'],
            },
          ]
        : [];

    const credits = await Credits.findActive();

    // Apply limit and include if specified
    const limitedCredits = await Credits.findAll({
      where: { status: 'active' },
      include: includeClause,
      limit: parseInt(limit),
      order: [['dueDate', 'ASC']],
      attributes: {
        include: ['daysUntilDue', 'interestAmount', 'totalAmount'],
      },
    });

    res.json({
      success: true,
      data: limitedCredits,
      total: credits.length,
    });
  } catch (error) {
    console.error('Error getting active credits:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// GET /api/credits/overdue - Get overdue credits
export const getOverdueCredits = async (req, res) => {
  try {
    const { limit = 50, includeClient = 'true' } = req.query;

    const includeClause =
      includeClient === 'true'
        ? [
            {
              model: Clients,
              as: 'client',
              attributes: ['id', 'firstName', 'lastName', 'email', 'status', 'phone'],
            },
          ]
        : [];

    let credits = await Credits.findOverdue();

    if (includeClause.length > 0) {
      credits = await Credits.findAll({
        where: {
          status: 'active',
          dueDate: {
            [Op.lt]: new Date(),
          },
        },
        include: includeClause,
        limit: parseInt(limit),
        order: [['dueDate', 'ASC']],
        attributes: {
          include: ['daysOverdue', 'interestAmount', 'totalAmount'],
        },
      });
    }

    res.json({
      success: true,
      data: credits,
      total: credits.length,
    });
  } catch (error) {
    console.error('Error getting overdue credits:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// GET /api/credits/statistics - Get credits statistics
export const getCreditsStatistics = async (req, res) => {
  try {
    // Get total active credits
    const activeStats = await Credits.getTotalActiveCredits();

    // Get overdue credits count and total
    const overdueCredits = await Credits.findAll({
      where: {
        status: 'active',
        dueDate: {
          [Op.lt]: new Date(),
        },
      },
      attributes: ['amount', 'interestRate', 'dueDate'],
    });

    const overdueTotal = overdueCredits.reduce((sum, credit) => {
      const creditInstance = Credits.build(credit.dataValues);
      return sum + creditInstance.getTotalAmount();
    }, 0);

    // Get paid credits statistics
    const paidStats = await Credits.findAll({
      where: { status: 'paid' },
      attributes: [
        [Credits.sequelize.fn('COUNT', Credits.sequelize.col('id')), 'count'],
        [Credits.sequelize.fn('SUM', Credits.sequelize.col('amount')), 'total'],
      ],
    });

    // Get credits by status
    const statusStats = await Credits.findAll({
      attributes: [
        'status',
        [Credits.sequelize.fn('COUNT', Credits.sequelize.col('id')), 'count'],
        [Credits.sequelize.fn('SUM', Credits.sequelize.col('amount')), 'total'],
      ],
      group: ['status'],
    });

    res.json({
      success: true,
      data: {
        active: {
          count: activeStats.totalCount,
          totalAmount: activeStats.totalAmount,
        },
        overdue: {
          count: overdueCredits.length,
          totalAmount: parseFloat(overdueTotal.toFixed(2)),
        },
        paid: {
          count: parseInt(paidStats[0]?.dataValues?.count || 0),
          totalAmount: parseFloat(paidStats[0]?.dataValues?.total || 0),
        },
        byStatus: statusStats.map(stat => ({
          status: stat.status,
          count: parseInt(stat.dataValues.count),
          totalAmount: parseFloat(stat.dataValues.total || 0),
        })),
      },
    });
  } catch (error) {
    console.error('Error getting credits statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// PATCH /api/credits/:id/status - Update credit status
export const updateCreditStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required',
      });
    }

    const validStatuses = ['active', 'paid', 'overdue', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const credit = await Credits.findByPk(id);
    if (!credit) {
      return res.status(404).json({
        success: false,
        message: 'Credit not found',
      });
    }

    const previousStatus = credit.status;
    await credit.update({ status });

    res.json({
      success: true,
      message: 'Credit status updated successfully',
      data: {
        id: credit.id,
        previousStatus,
        newStatus: status,
        updatedAt: credit.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error updating credit status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// GET /api/clients/:clientId/credits - Get credits for a specific client
export const getClientCredits = async (req, res) => {
  try {
    const { clientId } = req.params;
    const { status = '', limit = 20, sortBy = 'creditDate', sortOrder = 'DESC' } = req.query;

    // Verify client exists
    const client = await Clients.findByPk(clientId);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found',
      });
    }

    const whereClause = { clientId };
    if (status) {
      whereClause.status = status;
    }

    const credits = await Credits.findAll({
      where: whereClause,
      limit: parseInt(limit),
      order: [[sortBy, sortOrder]],
      attributes: {
        include: ['daysUntilDue', 'daysOverdue', 'interestAmount', 'totalAmount', 'isOverdueFlag'],
      },
    });

    res.json({
      success: true,
      data: credits,
      client: {
        id: client.id,
        name: client.getFullName(),
        status: client.status,
      },
      total: credits.length,
    });
  } catch (error) {
    console.error('Error getting client credits:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};
