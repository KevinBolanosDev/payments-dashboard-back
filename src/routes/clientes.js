import express from 'express';

const router = express.Router();

// GET /api/clientes - Obtener todos los clientes
router.get('/', async (req, res) => {
  try {
    // TODO: Implementar con Sequelize cuando tengamos los modelos
    res.json({
      message: 'Lista de clientes',
      data: [],
      total: 0,
      page: 1,
      limit: 10,
    });
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    res.status(500).json({
      error: 'Error al obtener clientes',
      message: error.message,
    });
  }
});

// GET /api/clientes/:id - Obtener cliente por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // TODO: Implementar con Sequelize
    res.json({
      message: `Cliente con ID: ${id}`,
      data: null,
    });
  } catch (error) {
    console.error('Error al obtener cliente:', error);
    res.status(500).json({
      error: 'Error al obtener cliente',
      message: error.message,
    });
  }
});

// POST /api/clientes - Crear nuevo cliente
router.post('/', async (req, res) => {
  try {
    const clienteData = req.body;

    // Validación básica
    if (!clienteData.nombre || !clienteData.apellido || !clienteData.telefono) {
      return res.status(400).json({
        error: 'Datos incompletos',
        message: 'Nombre, apellido y teléfono son requeridos',
      });
    }

    // TODO: Implementar con Sequelize
    res.status(201).json({
      message: 'Cliente creado exitosamente',
      data: {
        id: Date.now(), // Temporal
        ...clienteData,
        fechaRegistro: new Date(),
      },
    });
  } catch (error) {
    console.error('Error al crear cliente:', error);
    res.status(500).json({
      error: 'Error al crear cliente',
      message: error.message,
    });
  }
});

// PUT /api/clientes/:id - Actualizar cliente
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const clienteData = req.body;

    // TODO: Implementar con Sequelize
    res.json({
      message: `Cliente ${id} actualizado exitosamente`,
      data: {
        id: parseInt(id),
        ...clienteData,
        fechaActualizacion: new Date(),
      },
    });
  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    res.status(500).json({
      error: 'Error al actualizar cliente',
      message: error.message,
    });
  }
});

// DELETE /api/clientes/:id - Eliminar cliente
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // TODO: Implementar con Sequelize
    res.json({
      message: `Cliente ${id} eliminado exitosamente`,
    });
  } catch (error) {
    console.error('Error al eliminar cliente:', error);
    res.status(500).json({
      error: 'Error al eliminar cliente',
      message: error.message,
    });
  }
});

// PATCH /api/clientes/:id/estado - Cambiar estado del cliente
router.patch('/:id/estado', async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    if (!estado || !['activo', 'inactivo'].includes(estado)) {
      return res.status(400).json({
        error: 'Estado inválido',
        message: 'El estado debe ser "activo" o "inactivo"',
      });
    }

    // TODO: Implementar con Sequelize
    res.json({
      message: `Estado del cliente ${id} cambiado a ${estado}`,
      data: {
        id: parseInt(id),
        estado,
        fechaActualizacion: new Date(),
      },
    });
  } catch (error) {
    console.error('Error al cambiar estado del cliente:', error);
    res.status(500).json({
      error: 'Error al cambiar estado del cliente',
      message: error.message,
    });
  }
});

export default router;
