import { validationResult } from 'express-validator';
import { query } from '../config/db.js';

export const createRequest = async (req, res, next) => {
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
      title,
      description,
      category,
      quantity,
      beneficiaries_count,
      location,
      urgency = 'high',
      estimated_budget = 0.00
    } = req.body;

    const result = await query(
      `INSERT INTO aid_requests 
        (beneficiary_id, title, description, category, quantity, beneficiaries_count, location, urgency, estimated_budget, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending')
       RETURNING *`,
      [
        req.user.id,
        title.trim(),
        description.trim(),
        category.trim(),
        quantity.trim(),
        parseInt(beneficiaries_count, 10),
        location.trim(),
        urgency.toLowerCase(),
        parseFloat(estimated_budget) || 0.00
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Aid request submitted successfully and queued for admin verification.',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

export const getRequests = async (req, res, next) => {
  try {
    const { category, urgency, status, search, limit = 50, page = 1 } = req.query;

    const conditions = [];
    const filterParams = [];

    // Access control: non-admins only see 'approved' (or 'fulfilled') requests by default
    const isAdmin = req.user && req.user.role === 'admin';

    if (!isAdmin) {
      if (status && (status === 'approved' || status === 'fulfilled')) {
        filterParams.push(status);
        conditions.push(`r.status = $${filterParams.length}`);
      } else {
        conditions.push(`r.status IN ('approved', 'fulfilled')`);
      }
    } else if (status) {
      filterParams.push(status);
      conditions.push(`r.status = $${filterParams.length}`);
    }

    if (category && category !== 'All') {
      filterParams.push(`%${category}%`);
      conditions.push(`LOWER(r.category) LIKE LOWER($${filterParams.length})`);
    }

    if (urgency && urgency !== 'All') {
      filterParams.push(urgency);
      conditions.push(`LOWER(r.urgency) = LOWER($${filterParams.length})`);
    }

    if (search) {
      filterParams.push(`%${search}%`);
      conditions.push(`(
        LOWER(r.title) LIKE LOWER($${filterParams.length}) OR 
        LOWER(r.description) LIKE LOWER($${filterParams.length}) OR 
        LOWER(r.location) LIKE LOWER($${filterParams.length})
      )`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const numLimit = parseInt(limit, 10);
    const numPage = parseInt(page, 10);
    const offset = (numPage - 1) * numLimit;

    // Count query uses ONLY filterParams
    const countQuery = `
      SELECT COUNT(*)::int AS total
      FROM aid_requests r
      ${whereClause}
    `;
    const countResult = await query(countQuery, filterParams);

    // Main query appends limit and offset
    const queryParams = [...filterParams, numLimit, offset];
    const limitIndex = filterParams.length + 1;
    const offsetIndex = filterParams.length + 2;

    const queryString = `
      SELECT 
        r.*,
        u.name AS beneficiary_name,
        u.email AS beneficiary_email,
        COUNT(d.id)::int AS donors_count,
        CASE 
          WHEN r.estimated_budget > 0 THEN ROUND((r.funds_raised / r.estimated_budget) * 100, 1)
          ELSE 0.0
        END AS percent_funded
      FROM aid_requests r
      JOIN users u ON r.beneficiary_id = u.id
      LEFT JOIN donations d ON r.id = d.request_id AND d.payment_status = 'completed'
      ${whereClause}
      GROUP BY r.id, u.name, u.email
      ORDER BY 
        CASE r.urgency 
          WHEN 'critical' THEN 1 
          WHEN 'high' THEN 2 
          WHEN 'medium' THEN 3 
          ELSE 4 
        END,
        r.created_at DESC
      LIMIT $${limitIndex} OFFSET $${offsetIndex}
    `;

    const result = await query(queryString, queryParams);

    res.status(200).json({
      success: true,
      data: result.rows,
      meta: {
        total: countResult.rows[0]?.total || 0,
        page: numPage,
        limit: numLimit
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getRequestById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const requestResult = await query(
      `SELECT 
        r.*,
        u.name AS beneficiary_name,
        u.email AS beneficiary_email,
        CASE 
          WHEN r.estimated_budget > 0 THEN ROUND((r.funds_raised / r.estimated_budget) * 100, 1)
          ELSE 0.0
        END AS percent_funded
       FROM aid_requests r
       JOIN users u ON r.beneficiary_id = u.id
       WHERE r.id = $1`,
      [id]
    );

    if (requestResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Aid request with ID ${id} not found.`
      });
    }

    const requestData = requestResult.rows[0];

    // Restrict pending/rejected requests to owner or admin
    if (requestData.status !== 'approved' && requestData.status !== 'fulfilled') {
      const isOwner = req.user && req.user.id === requestData.beneficiary_id;
      const isAdmin = req.user && req.user.role === 'admin';
      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'This aid request is pending verification or not publicly visible.'
        });
      }
    }

    // Fetch donors who contributed to this request
    const donorsResult = await query(
      `SELECT 
        d.id,
        d.amount,
        d.payment_status,
        d.created_at,
        u.name AS donor_name,
        u.email AS donor_email
       FROM donations d
       JOIN users u ON d.donor_id = u.id
       WHERE d.request_id = $1 AND d.payment_status = 'completed'
       ORDER BY d.created_at DESC`,
      [id]
    );

    requestData.donations = donorsResult.rows;

    // Fetch latest AI analysis if available
    const analysisResult = await query(
      `SELECT id, model_name, analysis_result, created_at
       FROM ai_analyses
       WHERE request_id = $1
       ORDER BY created_at DESC
       LIMIT 1`,
      [id]
    );

    if (analysisResult.rows.length > 0) {
      requestData.ai_analysis = analysisResult.rows[0].analysis_result;
      requestData.ai_analysis_meta = {
        id: analysisResult.rows[0].id,
        model_name: analysisResult.rows[0].model_name,
        created_at: analysisResult.rows[0].created_at
      };
    } else {
      requestData.ai_analysis = null;
      requestData.ai_analysis_meta = null;
    }

    res.status(200).json({
      success: true,
      data: requestData
    });
  } catch (error) {
    next(error);
  }
};

export const updateRequest = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map(err => ({ field: err.path, message: err.msg }))
      });
    }

    const { id } = req.params;
    const {
      title,
      description,
      category,
      quantity,
      beneficiaries_count,
      location,
      urgency,
      estimated_budget
    } = req.body;

    // Check request existence and ownership
    const existing = await query('SELECT * FROM aid_requests WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Aid request with ID ${id} not found.`
      });
    }

    const reqRecord = existing.rows[0];
    const isOwner = req.user.id === reqRecord.beneficiary_id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this aid request.'
      });
    }

    if (!isAdmin && reqRecord.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot edit request with status '${reqRecord.status}'. Only pending requests can be modified.`
      });
    }

    const updateResult = await query(
      `UPDATE aid_requests
       SET 
         title = COALESCE($1, title),
         description = COALESCE($2, description),
         category = COALESCE($3, category),
         quantity = COALESCE($4, quantity),
         beneficiaries_count = COALESCE($5, beneficiaries_count),
         location = COALESCE($6, location),
         urgency = COALESCE($7, urgency),
         estimated_budget = COALESCE($8, estimated_budget)
       WHERE id = $9
       RETURNING *`,
      [
        title ? title.trim() : null,
        description ? description.trim() : null,
        category ? category.trim() : null,
        quantity ? quantity.trim() : null,
        beneficiaries_count ? parseInt(beneficiaries_count, 10) : null,
        location ? location.trim() : null,
        urgency ? urgency.toLowerCase() : null,
        estimated_budget ? parseFloat(estimated_budget) : null,
        id
      ]
    );

    res.status(200).json({
      success: true,
      message: 'Aid request updated successfully.',
      data: updateResult.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

export const updateRequestStatus = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map(err => ({ field: err.path, message: err.msg }))
      });
    }

    const { id } = req.params;
    const { status, admin_notes } = req.body;

    const existing = await query('SELECT * FROM aid_requests WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Aid request with ID ${id} not found.`
      });
    }

    const result = await query(
      `UPDATE aid_requests
       SET 
         status = $1,
         admin_notes = COALESCE($2, admin_notes)
       WHERE id = $3
       RETURNING *`,
      [status.toLowerCase(), admin_notes || null, id]
    );

    res.status(200).json({
      success: true,
      message: `Aid request status updated to '${status}'.`,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

export const getMyRequests = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT 
        r.*,
        COUNT(d.id)::int AS donors_count,
        CASE 
          WHEN r.estimated_budget > 0 THEN ROUND((r.funds_raised / r.estimated_budget) * 100, 1)
          ELSE 0.0
        END AS percent_funded
       FROM aid_requests r
       LEFT JOIN donations d ON r.id = d.request_id AND d.payment_status = 'completed'
       WHERE r.beneficiary_id = $1
       GROUP BY r.id
       ORDER BY r.created_at DESC`,
      [req.user.id]
    );

    res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};
