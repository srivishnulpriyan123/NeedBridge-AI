import { query } from '../config/db.js';
import {
  analyzeAidRequestWithGemini,
  matchRequestWithSupplies
} from '../services/geminiService.js';

/**
 * POST /api/ai/analyze-request/:id
 * Analyzes an aid request with Gemini AI, computes deterministic catalogue budget,
 * identifies priority, missing info, and stores results in PostgreSQL.
 */
export const analyzeRequest = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 1. Fetch the aid request
    const reqResult = await query(
      `SELECT r.*, u.name AS beneficiary_name, u.email AS beneficiary_email 
       FROM aid_requests r
       JOIN users u ON r.beneficiary_id = u.id
       WHERE r.id = $1`,
      [id]
    );

    if (reqResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Aid request #${id} not found.`
      });
    }

    const aidRequest = reqResult.rows[0];

    // 2. Authorization check: Owner beneficiary or Admin
    const isOwner = req.user && req.user.id === aidRequest.beneficiary_id;
    const isAdmin = req.user && req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to trigger AI analysis for this request.'
      });
    }

    // 3. Fetch verified supplies catalogue from PostgreSQL
    const catResult = await query(
      `SELECT * FROM supplies_catalogue ORDER BY id ASC`
    );
    const catalogueItems = catResult.rows;

    // 4. Run Gemini AI analysis & deterministic budget calculation
    const analysis = await analyzeAidRequestWithGemini(aidRequest, catalogueItems);

    // 5. Save analysis to database
    const insertResult = await query(
      `INSERT INTO ai_analyses (request_id, model_name, analysis_result)
       VALUES ($1, $2, $3)
       RETURNING id, request_id, model_name, analysis_result, created_at`,
      [id, analysis.model_name, JSON.stringify(analysis)]
    );

    const savedRow = insertResult.rows[0];

    // 6. If request has zero estimated budget and AI computed a budget, update request budget
    if (
      parseFloat(aidRequest.estimated_budget) === 0 &&
      analysis.budget_summary?.total_estimated_budget > 0
    ) {
      await query(
        `UPDATE aid_requests SET estimated_budget = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
        [analysis.budget_summary.total_estimated_budget, id]
      );
    }

    res.status(200).json({
      success: true,
      message: 'AI aid request analysis completed successfully.',
      analysis_id: savedRow.id,
      request_id: aidRequest.id,
      model_name: savedRow.model_name,
      created_at: savedRow.created_at,
      data: savedRow.analysis_result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/ai/analysis/:requestId
 * Retrieves the latest stored AI analysis for a given aid request.
 */
export const getAnalysis = async (req, res, next) => {
  try {
    const { requestId } = req.params;

    // Fetch the request to verify access
    const reqResult = await query(
      `SELECT id, beneficiary_id, status FROM aid_requests WHERE id = $1`,
      [requestId]
    );

    if (reqResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Aid request #${requestId} not found.`
      });
    }

    const aidRequest = reqResult.rows[0];

    // Access control:
    // Admin can view any; Owner can view their own; Donors can view if request is approved
    const isOwner = req.user && req.user.id === aidRequest.beneficiary_id;
    const isAdmin = req.user && req.user.role === 'admin';
    const isApproved = aidRequest.status === 'approved' || aidRequest.status === 'fulfilled';

    if (!isAdmin && !isOwner && !isApproved) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this analysis until the request is approved.'
      });
    }

    const result = await query(
      `SELECT id, request_id, model_name, analysis_result, created_at
       FROM ai_analyses
       WHERE request_id = $1
       ORDER BY created_at DESC
       LIMIT 1`,
      [requestId]
    );

    if (result.rows.length === 0) {
      return res.status(200).json({
        success: true,
        data: null,
        message: 'No AI analysis records found for this aid request.'
      });
    }

    const record = result.rows[0];

    res.status(200).json({
      success: true,
      data: {
        analysis_id: record.id,
        request_id: record.request_id,
        model_name: record.model_name,
        created_at: record.created_at,
        ...record.analysis_result
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/ai/match-request/:id
 * Matches an approved aid request with inventory from the supplies catalogue.
 */
export const matchRequest = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 1. Fetch the aid request
    const reqResult = await query(
      `SELECT * FROM aid_requests WHERE id = $1`,
      [id]
    );

    if (reqResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Aid request #${id} not found.`
      });
    }

    const aidRequest = reqResult.rows[0];

    // 2. Only approved requests can be matched for fulfillment
    if (aidRequest.status !== 'approved' && aidRequest.status !== 'fulfilled') {
      return res.status(400).json({
        success: false,
        message: 'Only approved aid requests can be matched with warehouse inventory.'
      });
    }

    // 3. Fetch latest AI analysis if available
    const analysisResult = await query(
      `SELECT analysis_result FROM ai_analyses WHERE request_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [id]
    );
    const previousAnalysis = analysisResult.rows[0]?.analysis_result || null;

    // 4. Fetch verified supplies catalogue
    const catResult = await query(
      `SELECT * FROM supplies_catalogue ORDER BY category ASC, product_name ASC`
    );
    const catalogueItems = catResult.rows;

    // 5. Run matching algorithm
    const matchingData = matchRequestWithSupplies(aidRequest, catalogueItems, previousAnalysis);

    res.status(200).json({
      success: true,
      message: 'Catalogue supplies matching completed successfully.',
      data: matchingData
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/ai/catalogue
 * Returns active relief items from the verified PostgreSQL supplies catalogue.
 */
export const getCatalogue = async (req, res, next) => {
  try {
    const { category, availability } = req.query;

    const conditions = [];
    const params = [];

    if (category && category !== 'All') {
      params.push(`%${category}%`);
      conditions.push(`LOWER(category) LIKE LOWER($${params.length})`);
    }

    if (availability && availability !== 'All') {
      params.push(availability);
      conditions.push(`availability_status = $${params.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await query(
      `SELECT 
        id,
        product_name,
        category,
        description,
        unit_price,
        unit,
        available_quantity,
        availability_status,
        created_at
       FROM supplies_catalogue
       ${whereClause}
       ORDER BY category ASC, product_name ASC`,
      params
    );

    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

export default {
  analyzeRequest,
  getAnalysis,
  matchRequest,
  getCatalogue
};

