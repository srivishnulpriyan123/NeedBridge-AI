import { Router } from 'express';
import { body, query as queryParam } from 'express-validator';
import {
  createDonation,
  getDonations,
  getMyDonations
} from '../controllers/donationController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = Router();

// GET /api/donations - Public/audit view of transparent donations
router.get('/', getDonations);

// GET /api/donations/my-donations - Personal history for logged-in donors
router.get('/my-donations', protect, authorize('donor', 'admin'), getMyDonations);

// POST /api/donations - Donor pledges funds towards an approved request
router.post(
  '/',
  protect,
  authorize('donor', 'admin'),
  [
    body('request_id')
      .isInt({ min: 1 })
      .withMessage('Valid request_id integer is required.'),
    body('amount')
      .isFloat({ gt: 0 })
      .withMessage('Donation amount must be greater than 0.'),
    body('payment_provider')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Payment provider cannot be empty.'),
    body('paypal_order_id')
      .optional()
      .trim()
  ],
  createDonation
);

export default router;

