import { validationResult } from 'express-validator';
import { query } from '../config/db.js';

export const createDonation = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map(err => ({ field: err.path, message: err.msg }))
      });
    }

    const {
      request_id,
      amount,
      currency = 'USD',
      payment_provider = 'paypal_mock_sandbox',
      paypal_order_id
    } = req.body;

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Donation amount must be a positive number greater than 0.'
      });
    }

    // Verify target aid request
    const requestResult = await query(
      'SELECT id, title, status, estimated_budget, funds_raised FROM aid_requests WHERE id = $1',
      [request_id]
    );

    if (requestResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Target aid request with ID ${request_id} does not exist.`
      });
    }

    const targetRequest = requestResult.rows[0];

    if (targetRequest.status !== 'approved' && targetRequest.status !== 'fulfilled') {
      return res.status(400).json({
        success: false,
        message: `Cannot donate to a request with status '${targetRequest.status}'. Only approved requests accept funding.`
      });
    }

    // Generate mock PayPal order ID if not provided
    const mockOrderId = paypal_order_id || `PAYID-MOCK-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const validCurrency = (currency || 'USD').toUpperCase();

    // Insert donation record
    const donationResult = await query(
      `INSERT INTO donations 
        (donor_id, request_id, amount, currency, payment_status, payment_provider, paypal_order_id)
       VALUES ($1, $2, $3, $4, 'completed', $5, $6)
       RETURNING *`,
      [req.user.id, request_id, numAmount, validCurrency, payment_provider, mockOrderId]
    );

    const newDonation = donationResult.rows[0];

    // Reference exchange rates relative to 1 USD
    const exchangeRates = {
      USD: 1.0, INR: 86.0, EUR: 0.92, GBP: 0.79, CAD: 1.38,
      AUD: 1.55, JPY: 154.0, AED: 3.67, SGD: 1.34, CHF: 0.88, MYR: 4.45, BRL: 5.75
    };
    const rate = exchangeRates[validCurrency] || 1.0;
    const amountInUSD = rate > 0 ? (numAmount / rate) : numAmount;

    // Update funds_raised on the request
    const newFundsRaised = parseFloat(targetRequest.funds_raised) + amountInUSD;
    const shouldMarkFulfilled = newFundsRaised >= parseFloat(targetRequest.estimated_budget);
    const newStatus = shouldMarkFulfilled ? 'fulfilled' : targetRequest.status;

    await query(
      `UPDATE aid_requests 
       SET funds_raised = $1, status = $2 
       WHERE id = $3`,
      [newFundsRaised, newStatus, request_id]
    );

    res.status(201).json({
      success: true,
      message: 'Donation successfully recorded and allocated to wholesale escrow.',
      data: {
        donation: newDonation,
        request: {
          id: targetRequest.id,
          title: targetRequest.title,
          funds_raised: newFundsRaised,
          estimated_budget: targetRequest.estimated_budget,
          status: newStatus
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getDonations = async (req, res, next) => {
  try {
    const { request_id, status, limit = 50, page = 1 } = req.query;

    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (request_id) {
      conditions.push(`d.request_id = $${paramIndex++}`);
      params.push(request_id);
    }

    if (status && status !== 'All') {
      conditions.push(`d.payment_status = $${paramIndex++}`);
      params.push(status);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const queryString = `
      SELECT 
        d.id,
        d.amount,
        d.currency,
        d.payment_status,
        d.payment_provider,
        d.paypal_order_id,
        d.paypal_capture_id,
        d.created_at,
        d.updated_at,
        u.id AS donor_id,
        u.name AS donor_name,
        r.id AS request_id,
        r.title AS request_title,
        r.category AS request_category
      FROM donations d
      JOIN users u ON d.donor_id = u.id
      JOIN aid_requests r ON d.request_id = r.id
      ${whereClause}
      ORDER BY d.created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex}
    `;

    params.push(parseInt(limit, 10));
    params.push(offset);

    const result = await query(queryString, params);

    // Summary statistics
    const statsResult = await query(
      `SELECT 
        COUNT(*)::int AS total_count,
        COALESCE(SUM(amount), 0)::numeric AS total_amount
       FROM donations
       WHERE payment_status = 'completed'`
    );

    res.status(200).json({
      success: true,
      data: result.rows,
      summary: {
        total_donations: statsResult.rows[0]?.total_count || 0,
        total_volume: statsResult.rows[0]?.total_amount || 0
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getMyDonations = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT 
        d.id,
        d.amount,
        d.currency,
        d.payment_status,
        d.payment_provider,
        d.paypal_order_id,
        d.paypal_capture_id,
        d.created_at,
        d.updated_at,
        r.id AS request_id,
        r.title AS request_title,
        r.category AS request_category,
        r.status AS request_status
       FROM donations d
       JOIN aid_requests r ON d.request_id = r.id
       WHERE d.donor_id = $1
       ORDER BY d.created_at DESC`,
      [req.user.id]
    );

    const totalDonated = result.rows.reduce(
      (sum, row) => sum + parseFloat(row.amount || 0),
      0
    );

    res.status(200).json({
      success: true,
      data: result.rows,
      summary: {
        count: result.rows.length,
        total_amount: totalDonated
      }
    });
  } catch (error) {
    next(error);
  }
};

