import { Router } from 'express';
import { body } from 'express-validator';
import {
  getPaymentConfig,
  createPaymentOrder,
  capturePaymentOrder,
  cancelPaymentOrder,
  handleWebhook
} from '../controllers/paymentController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = Router();

// GET /api/payments/config - Public configuration (Client ID & Currency) for PayPal SDK
router.get('/config', getPaymentConfig);

// POST /api/payments/create-order - Authenticated Donor creates a PayPal Sandbox order
router.post(
  '/create-order',
  protect,
  authorize('donor', 'admin'),
  [
    body('request_id')
      .notEmpty()
      .withMessage('Aid request ID (request_id) is required.')
      .isInt()
      .withMessage('Aid request ID must be a valid integer.'),
    body('amount')
      .notEmpty()
      .withMessage('Donation amount is required.')
      .isFloat({ gt: 0 })
      .withMessage('Donation amount must be a number greater than 0.')
  ],
  createPaymentOrder
);

// POST /api/payments/capture-order - Authenticated Donor captures approved PayPal payment
router.post(
  '/capture-order',
  protect,
  authorize('donor', 'admin'),
  [
    body('order_id')
      .trim()
      .notEmpty()
      .withMessage('PayPal order ID (order_id) is required.')
  ],
  capturePaymentOrder
);

// POST /api/payments/cancel-order - Marks order as cancelled if buyer exits checkout
router.post(
  '/cancel-order',
  protect,
  authorize('donor', 'admin'),
  cancelPaymentOrder
);

// POST /api/payments/webhook - PayPal Webhook Event Receiver
router.post('/webhook', handleWebhook);

export default router;

