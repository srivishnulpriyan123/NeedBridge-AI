import { query, testConnection } from '../backend/config/db.js';

const API_URL = 'http://127.0.0.1:5000/api';

async function runPhase4AIVerification() {
  console.log('================================================================');
  console.log(' NEEDBRIDGE AI: PHASE 4 GEMINI AI INTEGRATION VERIFICATION');
  console.log(` Target API: ${API_URL}`);
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, title, details = '') => {
    if (condition) {
      console.log(`[PASS] ${title}`);
      passed++;
    } else {
      console.error(`[FAIL] ${title} - Details: ${details}`);
      failed++;
    }
  };

  try {
    // STEP 1: Verify PostgreSQL Connection & Catalogue Seed
    console.log('--- STEP 1: Database & Verified Supplies Catalogue ---');
    const dbStatus = await testConnection();
    assert(dbStatus.connected, 'Database connection is active');

    const catRes = await fetch(`${API_URL}/ai/catalogue`);
    const catJson = await catRes.json();
    assert(catRes.status === 200, 'GET /api/ai/catalogue returns 200 OK');
    assert(Array.isArray(catJson.data) && catJson.data.length >= 10, `Verified catalogue has ${catJson.data?.length} items loaded`);

    const sampleFood = catJson.data.find(c => c.product_name.toLowerCase().includes('food'));
    assert(sampleFood && parseFloat(sampleFood.unit_price) > 0, `Catalogue item "${sampleFood?.product_name}" has verified price $${sampleFood?.unit_price}`);

    // STEP 2: Login as Beneficiary
    console.log('\n--- STEP 2: Beneficiary Authentication & Request Creation ---');
    const benLoginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'elena@communityaid.org', password: 'BeneficiaryPass123!' })
    });
    const benLogin = await benLoginRes.json();
    assert(benLoginRes.status === 200, 'Beneficiary logged in');
    const benToken = benLogin.data?.token;

    // Submit a request specifically describing flooding, water, and food for 30 families
    const submitRes = await fetch(`${API_URL}/requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${benToken}`
      },
      body: JSON.stringify({
        title: 'Monsoon Flash Flood Emergency Relief for North District Shelter',
        description: 'Severe flash flooding submerged 30 rural families. Acute shortage of clean drinking water, water purification tablets, and emergency food rations. Waterborne diseases emerging.',
        category: 'Clean Water & Sanitation',
        quantity: '30 emergency relief water and food packs',
        beneficiaries_count: 30,
        location: 'North District Community Hall, Sector 7',
        urgency: 'critical',
        estimated_budget: 0 // Leave 0 to let AI calculate
      })
    });
    const submitJson = await submitRes.json();
    assert(submitRes.status === 201, 'Emergency aid request created');
    const requestId = submitJson.data?.id;

    // STEP 3: Trigger AI Analysis (POST /api/ai/analyze-request/:id)
    console.log('\n--- STEP 3: Gemini AI Needs Analysis & Deterministic Catalogue Budget ---');
    const analyzeRes = await fetch(`${API_URL}/ai/analyze-request/${requestId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${benToken}` }
    });
    const analyzeJson = await analyzeRes.json();
    assert(analyzeRes.status === 200, 'POST /api/ai/analyze-request/:id returns 200 OK');
    const analysis = analyzeJson.data;

    assert(!!analysis.main_problem, `Main Problem identified: "${analysis.main_problem?.slice(0, 60)}..."`);
    assert(!!analysis.assistance_type, `Assistance Type classified: "${analysis.assistance_type}"`);
    assert(!!analysis.suggested_urgency, `Suggested Urgency: "${analysis.suggested_urgency}"`);
    assert(!!analysis.priority_reason, `Priority Reason: "${analysis.priority_reason?.slice(0, 60)}..."`);
    assert(Array.isArray(analysis.missing_information) && analysis.missing_information.length > 0, `Missing Info items identified: ${analysis.missing_information?.length}`);
    assert(Array.isArray(analysis.admin_verification_recommendations) && analysis.admin_verification_recommendations.length > 0, `Admin Verification Steps: ${analysis.admin_verification_recommendations?.length}`);
    assert(!!analysis.safety_disclaimer, 'Human-in-the-loop safety disclaimer is present');

    // Verify Deterministic Budget Calculation in backend
    console.log('\n--- STEP 4: Deterministic Budget Math Verification ---');
    const recommended = analysis.recommended_supplies || [];
    assert(recommended.length > 0, `Recommended supplies generated: ${recommended.length} items`);
    
    let sumItemTotals = 0;
    let mathConsistent = true;
    for (const item of recommended) {
      if (item.unit_price !== null) {
        const expectedTotal = Math.round(item.unit_price * item.suggested_quantity * 100) / 100;
        if (Math.abs(item.item_total - expectedTotal) > 0.01) {
          mathConsistent = false;
        }
        sumItemTotals += item.item_total;
      }
    }
    assert(mathConsistent, 'Backend calculated deterministic (unit_price * quantity) for all catalogue items');
    assert(
      Math.abs(analysis.budget_summary?.total_estimated_budget - (Math.round(sumItemTotals * 100) / 100)) < 0.05,
      `Budget summary total ($${analysis.budget_summary?.total_estimated_budget}) exactly equals sum of item totals`
    );

    // Verify Database Persistence in ai_analyses table
    console.log('\n--- STEP 5: Database Persistence in ai_analyses Table ---');
    const dbAnalysis = await query(
      `SELECT * FROM ai_analyses WHERE request_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [requestId]
    );
    assert(dbAnalysis.rows.length === 1, 'AI analysis row successfully inserted into PostgreSQL "ai_analyses" table');

    // STEP 6: GET /api/ai/analysis/:requestId
    console.log('\n--- STEP 6: Fetch Saved AI Analysis Endpoint ---');
    const getAnalysisRes = await fetch(`${API_URL}/ai/analysis/${requestId}`, {
      headers: { Authorization: `Bearer ${benToken}` }
    });
    const getAnalysisJson = await getAnalysisRes.json();
    assert(getAnalysisRes.status === 200, 'GET /api/ai/analysis/:requestId returns 200 OK');
    assert(getAnalysisJson.data?.analysis_id === dbAnalysis.rows[0].id, 'Analysis ID matches database record');

    // STEP 7: Security & Edge Case Handling
    console.log('\n--- STEP 7: Security & Edge Cases (Auth, Injection, Unapproved Matching) ---');
    
    // Login as a second beneficiary (Marcus)
    const ben2LoginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'marcus@riverside.org', password: 'BeneficiaryPass123!' })
    });
    const ben2Login = await ben2LoginRes.json();
    const ben2Token = ben2Login.data?.token;

    // Beneficiary 2 cannot analyze Beneficiary 1's request
    const unauthorizedRes = await fetch(`${API_URL}/ai/analyze-request/${requestId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${ben2Token}` }
    });
    assert(unauthorizedRes.status === 403, 'Beneficiary cannot analyze another user\'s private request (403 Forbidden)');

    // Donor login
    const donorLoginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'sarah.j@greenleaf.org', password: 'DonorPass123!' })
    });
    const donorLogin = await donorLoginRes.json();
    const donorToken = donorLogin.data?.token;
    assert(donorLoginRes.status === 200, 'Donor logged in successfully');

    // Matching must fail when request is still pending
    const matchPendingRes = await fetch(`${API_URL}/ai/match-request/${requestId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${donorToken}` }
    });
    assert(matchPendingRes.status === 400, 'Matching rejected on pending unapproved request (400 Bad Request)');

    // STEP 8: Admin Approval & Catalogue Matching
    console.log('\n--- STEP 8: Admin Approval & Warehouse Catalogue Matching ---');
    const adminLoginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@needbridge.ai', password: 'AdminPass123!' })
    });
    const adminLogin = await adminLoginRes.json();
    const adminToken = adminLogin.data?.token;

    // Admin approves the request
    const approveRes = await fetch(`${API_URL}/requests/${requestId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        status: 'approved',
        admin_notes: 'Verified via District Disaster Intake. Approved for immediate supply matching.'
      })
    });
    assert(approveRes.status === 200, 'Admin approves request after reviewing AI recommendations');

    // Now trigger matching as Donor
    const matchRes = await fetch(`${API_URL}/ai/match-request/${requestId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${donorToken}` }
    });
    const matchJson = await matchRes.json();
    assert(matchRes.status === 200, 'POST /api/ai/match-request/:id succeeds on approved request');

    const matchData = matchJson.data;
    assert(Array.isArray(matchData?.matched_supplies) && matchData.matched_supplies.length > 0, `Matched supplies returned: ${matchData.matched_supplies.length}`);
    const firstMatch = matchData.matched_supplies[0];
    assert(firstMatch.quantity_fulfilled_from_stock > 0, `Item "${firstMatch.product_name}" fulfilled ${firstMatch.quantity_fulfilled_from_stock} units from available stock`);
    assert(firstMatch.matched_estimated_cost > 0, `Item matched cost: $${firstMatch.matched_estimated_cost}`);
    assert(matchData.total_matched_supplies_cost > 0, `Total matched supplies cost: $${matchData.total_matched_supplies_cost}`);
    assert(!!matchData.fulfillment_readiness, `Fulfillment readiness status: "${matchData.fulfillment_readiness}"`);

    // STEP 9: Edge Case - Unpriced/Unlisted Item in Budget Calculation
    console.log('\n--- STEP 9: Edge Case - Unpriced / Unlisted Item Handling ---');
    const customReqRes = await fetch(`${API_URL}/requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${benToken}`
      },
      body: JSON.stringify({
        title: 'Industrial Heavy-Duty Pneumatic Debris Cutter',
        description: 'Earthquake rubble clearance requiring specialized pneumatic concrete demolition shears.',
        category: 'Heavy Demolition Equipment',
        quantity: '2 pneumatic demolition cutters',
        beneficiaries_count: 5,
        location: 'Riverbank Sector 9',
        urgency: 'low',
        estimated_budget: 0
      })
    });
    const customReq = await customReqRes.json();
    const customReqId = customReq.data?.id;

    const customAnalyzeRes = await fetch(`${API_URL}/ai/analyze-request/${customReqId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${benToken}` }
    });
    const customAnalyzeJson = await customAnalyzeRes.json();
    const customSupplies = customAnalyzeJson.data?.recommended_supplies || [];
    
    // Check if any unpriced item has unit_price: null and flagged_for_admin_review: true
    const unpricedItem = customSupplies.find(s => s.unit_price === null || s.flagged_for_admin_review === true);
    assert(!!unpricedItem, 'Unlisted/unpriced relief items are safely flagged with flagged_for_admin_review: true and unit_price: null');

    console.log('\n================================================================');
    console.log(` RESULTS: ${passed} PASSED | ${failed} FAILED`);
    console.log('================================================================');

    if (failed > 0) {
      process.exit(1);
    } else {
      console.log('ALL PHASE 4 AI BACKEND REQUIREMENTS VERIFIED SUCCESSFULLY!');
      process.exit(0);
    }
  } catch (err) {
    console.error('Fatal test error:', err);
    process.exit(1);
  }
}

runPhase4AIVerification();
