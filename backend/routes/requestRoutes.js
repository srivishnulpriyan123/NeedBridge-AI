import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  createRequest,
  getRequests,
  getRequestById,
  updateRequest,
  updateRequestStatus,
  getMyRequests
} from '../controllers/requestController.js';
import { protect, authorize, optionalAuth } from '../middleware/authMiddleware.js';

const router = Router();

// GET /api/requests - Public & Donors (approved by default), Admins can filter all
router.get('/', optionalAuth, getRequests);

// GET /api/requests/my-requests - Beneficiaries only
router.get('/my-requests', protect, authorize('beneficiary', 'admin'), getMyRequests);

// GET /api/requests/:id - Single request details
router.get(
  '/:id',
  optionalAuth,
  [param('id').isInt().withMessage('Request ID must be a valid integer.')],
  getRequestById
);

// POST /api/requests - Beneficiaries submit new requests
router.post(
  '/',
  protect,
  authorize('beneficiary', 'admin'),
  [
    body('title')
      .trim()
      .notEmpty()
      .withMessage('Title is required.')
      .isLength({ max: 255 })
      .withMessage('Title must not exceed 255 characters.'),
    body('description')
      .trim()
      .notEmpty()
      .withMessage('Description is required.')
      .isLength({ min: 15 })
      .withMessage('Description must be at least 15 characters long.'),
    body('category')
      .trim()
      .notEmpty()
      .withMessage('Category is required.'),
    body('quantity')
      .trim()
      .notEmpty()
      .withMessage('Quantity and unit are required.'),
    body('beneficiaries_count')
      .isInt({ min: 1 })
      .withMessage('Beneficiaries count must be a positive integer of at least 1.'),
    body('location')
      .trim()
      .notEmpty()
      .withMessage('Location is required.'),
    body('urgency')
      .optional()
      .isIn(['low', 'medium', 'high', 'critical'])
      .withMessage('Urgency must be one of: low, medium, high, critical.'),
    body('estimated_budget')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Estimated budget must be a positive number.')
  ],
  createRequest
);

// PUT /api/requests/:id - Update pending request
router.put(
  '/:id',
  protect,
  authorize('beneficiary', 'admin'),
  [
    param('id').isInt().withMessage('Request ID must be a valid integer.'),
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty.'),
    body('description').optional().trim().isLength({ min: 15 }).withMessage('Description must be at least 15 characters.'),
    body('beneficiaries_count').optional().isInt({ min: 1 }).withMessage('Beneficiaries count must be at least 1.'),
    body('estimated_budget').optional().isFloat({ min: 0 }).withMessage('Budget must be positive.')
  ],
  updateRequest
);

// PATCH /api/requests/:id/status - Admin status review (approve/reject)
router.patch(
  '/:id/status',
  protect,
  authorize('admin'),
  [
    param('id').isInt().withMessage('Request ID must be a valid integer.'),
    body('status')
      .isIn(['pending', 'approved', 'rejected', 'fulfilled'])
      .withMessage('Status must be one of: pending, approved, rejected, fulfilled.'),
    body('admin_notes').optional().trim()
  ],
  updateRequestStatus
);

export default router;

