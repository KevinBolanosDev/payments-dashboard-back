import express from 'express';
import {
  cancelCredit,
  createCredit,
  getActiveCredits,
  getAllCredits,
  getClientCredits,
  getCreditById,
  getCreditsStatistics,
  getOverdueCredits,
  updateCredit,
  updateCreditStatus,
} from '../controllers/creditsController.js';

const router = express.Router();

// Special routes (must be before /:id routes)
router.get('/active', getActiveCredits);
router.get('/overdue', getOverdueCredits);
router.get('/statistics', getCreditsStatistics);

// Main CRUD routes
router.get('/', getAllCredits);
router.get('/:id', getCreditById);
router.post('/', createCredit);
router.put('/:id', updateCredit);
router.delete('/:id', cancelCredit);

// Specific action routes
router.patch('/:id/status', updateCreditStatus);

export default router;

// Export additional route for clients (to be used in clients routes)
export { getClientCredits };
