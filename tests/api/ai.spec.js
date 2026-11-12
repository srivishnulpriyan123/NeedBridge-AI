import { test, expect } from '@playwright/test';

const API_BASE = 'http://127.0.0.1:5000/api';

test.describe('API Suite: Gemini AI Analysis & Verified Catalogue Matching', () => {
  let beneficiaryToken;
  let otherBeneficiaryToken;
  let adminToken;
  let donorToken;
  let testRequestId;

  test.beforeAll(async ({ request }) => {
    // Elena
    const benRes = await request.post(`${API_BASE}/auth/login`, {
      data: { email: 'elena@communityaid.org', password: 'BeneficiaryPass123!' }
    });
    beneficiaryToken = (await benRes.json()).data.token;

    // Marcus
    const ben2Res = await request.post(`${API_BASE}/auth/login`, {
      data: { email: 'marcus@riverside.org', password: 'BeneficiaryPass123!' }
    });
    otherBeneficiaryToken = (await ben2Res.json()).data.token;

    // Admin
    const adminRes = await request.post(`${API_BASE}/auth/login`, {
      data: { email: 'admin@needbridge.ai', password: 'AdminPass123!' }
    });
    adminToken = (await adminRes.json()).data.token;

    // Donor
    const donorRes = await request.post(`${API_BASE}/auth/login`, {
      data: { email: 'dr.jane@healthtrust.org', password: 'DonorPass123!' }
    });
    donorToken = (await donorRes.json()).data.token;

    // Create a flooding request for 20 families
    const newReq = await request.post(`${API_BASE}/requests`, {
      headers: { Authorization: `Bearer ${beneficiaryToken}` },
      data: {
        title: 'Riverbank Inundation: Emergency Water and Blankets for 20 Families',
        description: 'Severe flooding has compromised clean water supplies and left 20 families without warm bedding. Immediate water canisters, purification tablets, and thermal blankets required.',
        category: 'Clean Water & Sanitation',
        quantity: '20 emergency relief kits',
        beneficiaries_count: 20,
        location: 'Riverbank Ward 4',
        urgency: 'critical',
        estimated_budget: 0
      }
    });
    testRequestId = (await newReq.json()).data.id;
  });

  test('GET /api/ai/catalogue - Returns verified catalogue with items, prices and quantities', async ({ request }) => {
    const res = await request.get(`${API_BASE}/ai/catalogue`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThanOrEqual(10);

    const waterItem = body.data.find(i => i.product_name.includes('Water'));
    expect(waterItem).toBeDefined();
    expect(parseFloat(waterItem.unit_price)).toBeGreaterThan(0);
    expect(waterItem.available_quantity).toBeGreaterThanOrEqual(0);
  });

  test('POST /api/ai/analyze-request/:id - Generates structured triage and deterministic budget', async ({ request }) => {
    const res = await request.post(`${API_BASE}/ai/analyze-request/${testRequestId}`, {
      headers: { Authorization: `Bearer ${beneficiaryToken}` }
    });

    expect(res.status()).toBe(200);
    const body = await res.json();
    const data = body.data;

    expect(data.main_problem).toBeTruthy();
    expect(data.assistance_type).toBeTruthy();
    expect(data.suggested_urgency).toBeTruthy();
    expect(data.priority_reason).toBeTruthy();
    expect(Array.isArray(data.missing_information)).toBe(true);
    expect(Array.isArray(data.admin_verification_recommendations)).toBe(true);
    expect(data.safety_disclaimer).toBeTruthy();

    // Verify deterministic budget math
    const supplies = data.recommended_supplies || [];
    expect(supplies.length).toBeGreaterThan(0);
    let sumTotal = 0;
    for (const item of supplies) {
      if (item.unit_price !== null) {
        expect(item.item_total).toBeCloseTo(item.unit_price * item.suggested_quantity, 1);
        sumTotal += item.item_total;
      }
    }
    expect(data.budget_summary.total_estimated_budget).toBeCloseTo(sumTotal, 1);
  });

  test('POST /api/ai/analyze-request/:id - Unauthorized beneficiary blocked with 403 Forbidden', async ({ request }) => {
    const res = await request.post(`${API_BASE}/ai/analyze-request/${testRequestId}`, {
      headers: { Authorization: `Bearer ${otherBeneficiaryToken}` }
    });
    expect(res.status()).toBe(403);
  });

  test('GET /api/ai/analysis/:requestId - Fetches stored analysis record from PostgreSQL', async ({ request }) => {
    const res = await request.get(`${API_BASE}/ai/analysis/${testRequestId}`, {
      headers: { Authorization: `Bearer ${beneficiaryToken}` }
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.data).toBeDefined();
    expect(body.data.request_id).toBe(testRequestId);
  });

  test('POST /api/ai/match-request/:id - Matches approved request with warehouse inventory', async ({ request }) => {
    // Approve request first
    await request.patch(`${API_BASE}/requests/${testRequestId}/status`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: { status: 'approved' }
    });

    // Run matching as Donor
    const res = await request.post(`${API_BASE}/ai/match-request/${testRequestId}`, {
      headers: { Authorization: `Bearer ${donorToken}` }
    });

    expect(res.status()).toBe(200);
    const body = await res.json();
    const data = body.data;

    expect(Array.isArray(data.matched_supplies)).toBe(true);
    expect(data.matched_supplies.length).toBeGreaterThan(0);
    expect(data.total_matched_supplies_cost).toBeGreaterThan(0);
    expect(data.fulfillment_readiness).toBeTruthy();
  });
});

