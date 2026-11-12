import { Router } from 'express';
import { param } from 'express-validator';
import {
  analyzeRequest,
  getAnalysis,
  matchRequest,
  getCatalogue
} from '../controllers/aiController.js';
import { protect, authorize, optionalAuth } from '../middleware/authMiddleware.js';

const router = Router();

// GET /api/ai/catalogue - Browse verified supplies catalogue (accessible to all)
router.get('/catalogue', optionalAuth, getCatalogue);

// POST /api/ai/analyze-request/:id - Run Gemini AI triage analysis (Beneficiary owner or Admin)
router.post(
  '/analyze-request/:id',
  protect,
  [param('id').isInt().withMessage('Request ID must be a valid integer.')],
  analyzeRequest
);

// GET /api/ai/analysis/:requestId - Fetch saved AI analysis for an aid request
router.get(
  '/analysis/:requestId',
  protect,
  [param('requestId').isInt().withMessage('Request ID must be a valid integer.')],
  getAnalysis
);

// POST /api/ai/match-request/:id - Match approved request with catalogue supplies (Donor or Admin)
router.post(
  '/match-request/:id',
  protect,
  authorize('donor', 'admin'),
  [param('id').isInt().withMessage('Request ID must be a valid integer.')],
  matchRequest
);

export default router;

