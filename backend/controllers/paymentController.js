import { validationResult } from 'express-validator';
import { query } from '../config/db.js';
import paypalService from '../services/paypalService.js';

/**
 * GET /api/payments/config
 * Returns public configuration for PayPal SDK (Client ID & Currency)
 * Security rule: NEVER exposes client secret
 */
export const getPaymentConfig = (req, res) => {
  const config = paypalService.getClientConfig();
  res.status(200).json({
    success: true,
    data: config
  });
};

// Supported Global Currency Exchange Rates relative to 1 USD
const EXCHANGE_RATES = {
  USD: 1.0,
  INR: 86.0,
  EUR: 0.92,
  GBP: 0.79,
  CAD: 1.38,
  AUD: 1.55,
  JPY: 154.0,
  AED: 3.67,
  SGD: 1.34,
  CHF: 0.88,
  MYR: 4.45,
  BRL: 5.75
};

/**
 * POST /api/payments/create-order
 * Creates a PayPal Sandbox Order and records a 'pending' donation in PostgreSQL.
 * Security: Validates donor auth, checks request is approved, and validates final amount.
 */
export const createPaymentOrder = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map(err => ({ field: err.path, message: err.msg }))
      });
    }

    const { request_id, amount } = req.body;

    // 1. Validate Amount
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Donation amount must be a positive number greater than 0.'
      });
    }

    if (numericAmount > 100000) {
      return res.status(400).json({
        success: false,
        message: 'Individual donation cannot exceed $100,000 for standard compliance.'
      });
    }

    const finalAmount = numericAmount.toFixed(2);

    // 2. Validate Aid Request existence and status
    const reqResult = await query(
      `SELECT id, title, status, estimated_budget, funds_raised 
       FROM aid_requests 
       WHERE id = $1`,
      [request_id]
    );

    if (reqResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Target aid request #${request_id} does not exist.`
      });
    }

    const aidRequest = reqResult.rows[0];

    // Only approved or fulfilled requests accept donations
    if (aidRequest.status !== 'approved' && aidRequest.status !== 'fulfilled') {
      return res.status(400).json({
        success: false,
        message: `Cannot donate to a request with status '${aidRequest.status}'. Only admin-approved requests accept funding.`
      });
    }

    // 3. Create PayPal Sandbox Order via REST API (supports dynamic donor currency)
    const currency = (req.body.currency || process.env.PAYPAL_CURRENCY || 'USD').toUpperCase();
    const paypalOrder = await paypalService.createOrder({
      amount: finalAmount,
      currency,
      requestId: aidRequest.id,
      requestTitle: aidRequest.title,
      donorId: req.user.id
    });

    // 4. Save Pending Donation in PostgreSQL
    const donationResult = await query(
      `INSERT INTO donations 
        (donor_id, request_id, amount, currency, payment_status, payment_provider, paypal_order_id)
       VALUES ($1, $2, $3, $4, 'pending', 'paypal_sandbox', $5)
       RETURNING *`,
      [req.user.id, aidRequest.id, finalAmount, currency, paypalOrder.id]
    );

    const pendingDonation = donationResult.rows[0];

    res.status(201).json({
      success: true,
      message: 'PayPal Sandbox donation order created successfully.',
      data: {
        orderId: paypalOrder.id,
        donationId: pendingDonation.id,
        amount: pendingDonation.amount,
        currency: pendingDonation.currency,
        status: pendingDonation.payment_status,
        links: paypalOrder.links || [],
        is_simulated: paypalOrder.is_simulated || false,
        request: {
          id: aidRequest.id,
          title: aidRequest.title
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/payments/capture-order
 * Captures PayPal Sandbox Order, verifies amount/currency, and updates PostgreSQL.
 * Security: Verifies donor ownership, prevents unauthorized capture & amount tampering.
 */
export const capturePaymentOrder = async (req, res, next) => {
  try {
    const { order_id } = req.body;

    if (!order_id || typeof order_id !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Valid PayPal order ID (order_id) is required.'
      });
    }

    // 1. Locate matching pending donation in PostgreSQL
    const donationResult = await query(
      `SELECT d.*, r.title AS request_title, r.estimated_budget, r.funds_raised, r.status AS request_status
       FROM donations d
       JOIN aid_requests r ON d.request_id = r.id
       WHERE d.paypal_order_id = $1`,
      [order_id]
    );

    if (donationResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Donation record associated with PayPal order ID '${order_id}' was not found.`
      });
    }

    const donation = donationResult.rows[0];

    // 2. Security Check: Verify donor ownership
    const isOwner = req.user && req.user.id === donation.donor_id;
    const isAdmin = req.user && req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You do not have permission to capture this donation order.'
      });
    }

    // 3. Idempotency Check: If already completed, return existing record without double-crediting
    if (donation.payment_status === 'completed') {
      return res.status(200).json({
        success: true,
        message: 'This payment order has already been captured and verified.',
        data: {
          donation,
          already_completed: true
        }
      });
    }

    if (donation.payment_status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot capture payment for a cancelled order.'
      });
    }

    // 4. Capture Order with PayPal REST API & Verify Amount
    const captureResult = await paypalService.captureOrder(
      order_id,
      donation.amount,
      donation.currency
    );

    if (captureResult.status !== 'COMPLETED') {
      // Mark as failed if PayPal didn't settle
      await query(
        `UPDATE donations SET payment_status = 'failed', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [donation.id]
      );
      return res.status(400).json({
        success: false,
        message: `Payment capture failed. PayPal status: ${captureResult.status}`,
        data: captureResult
      });
    }

    // 5. Atomic Update in PostgreSQL: Mark donation completed and increment aid request funds
    const updatedDonationResult = await query(
      `UPDATE donations 
       SET payment_status = 'completed', 
           paypal_capture_id = $1, 
           updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 
       RETURNING *`,
      [captureResult.captureId, donation.id]
    );
    const completedDonation = updatedDonationResult.rows[0];

    // 6. Update aid_requests funds_raised (converting non-USD donations to base USD)
    const donationAmt = parseFloat(completedDonation.amount);
    const currCode = (completedDonation.currency || 'USD').toUpperCase();
    const rate = EXCHANGE_RATES[currCode] || 1.0;
    const donationAmtInUSD = rate > 0 ? (donationAmt / rate) : donationAmt;
    const newFundsRaised = parseFloat(donation.funds_raised) + donationAmtInUSD;
    const shouldMarkFulfilled = newFundsRaised >= parseFloat(donation.estimated_budget);
    const updatedRequestStatus = shouldMarkFulfilled ? 'fulfilled' : donation.request_status;

    await query(
      `UPDATE aid_requests 
       SET funds_raised = $1, status = $2, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $3`,
      [newFundsRaised, updatedRequestStatus, donation.request_id]
    );

    res.status(200).json({
      success: true,
      message: 'Donation payment captured and verified successfully via PayPal Sandbox.',
      data: {
        donation: completedDonation,
        capture: {
          captureId: captureResult.captureId,
          orderId: captureResult.orderId,
          status: captureResult.status,
          amount: captureResult.amount,
          currency: captureResult.currency,
          capture_time: captureResult.capture_time
        },
        request: {
          id: donation.request_id,
          title: donation.request_title,
          funds_raised: newFundsRaised,
          status: updatedRequestStatus
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/payments/cancel-order
 * Marks a pending donation order as cancelled if buyer abandons checkout.
 */
export const cancelPaymentOrder = async (req, res, next) => {
  try {
    const { order_id } = req.body;

    if (!order_id) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required.'
      });
    }

    const donationResult = await query(
      `SELECT * FROM donations WHERE paypal_order_id = $1`,
      [order_id]
    );

    if (donationResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Order #${order_id} not found.`
      });
    }

    const donation = donationResult.rows[0];

    // Verify ownership
    if (req.user && req.user.id !== donation.donor_id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized.'
      });
    }

    if (donation.payment_status === 'pending') {
      await query(
        `UPDATE donations SET payment_status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [donation.id]
      );
    }

    res.status(200).json({
      success: true,
      message: 'Payment order marked as cancelled.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/payments/webhook
 * PayPal Webhook Event Receiver (idempotent status sync)
 */
export const handleWebhook = async (req, res, next) => {
  try {
    const event = req.body;
    console.log(`[PayPalWebhook] Received event: ${event?.event_type}`);

    // If event is PAYMENT.CAPTURE.COMPLETED
    if (event?.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
      const resource = event.resource;
      const captureId = resource?.id;
      const orderId = resource?.supplementary_data?.related_ids?.order_id;

      if (orderId) {
        await query(
          `UPDATE donations 
           SET payment_status = 'completed', 
               paypal_capture_id = COALESCE($1, paypal_capture_id), 
               updated_at = CURRENT_TIMESTAMP 
           WHERE paypal_order_id = $2 AND payment_status = 'pending'`,
          [captureId, orderId]
        );
      }
    }

    res.status(200).json({ received: true });
  } catch (error) {
    next(error);
  }
};

export default {
  getPaymentConfig,
  createPaymentOrder,
  capturePaymentOrder,
  cancelPaymentOrder,
  handleWebhook
};

