import express from 'express';
import {
  createClient,
  deleteClient,
  getActiveClients,
  getAllClients,
  getClientById,
  getClientsStats,
  updateClient,
  updateClientBalance,
} from '../controllers/clientsController.js';
import { getClientCredits } from './credits.js';

const router = express.Router();

// Main routes
router.get('/', getAllClients);
router.get('/active', getActiveClients); // Must be before /:id
router.get('/stats', getClientsStats); // Must be before /:id
router.get('/:id', getClientById);
router.post('/', createClient);
router.put('/:id', updateClient);
router.delete('/:id', deleteClient);

// Specific routes
router.patch('/:id/balance', updateClientBalance);
router.get('/:id/credits', getClientCredits);

export default router;
