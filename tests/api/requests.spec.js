import { test, expect } from '@playwright/test';

const API_BASE = 'http://127.0.0.1:5000/api';

test.describe('API Suite: Aid Requests Workflow & Validation', () => {
  let beneficiaryToken;
  let adminToken;
  let donorToken;
  let createdRequestId;

  test.beforeAll(async ({ request }) => {
    // Login as beneficiary
    const benRes = await request.post(`${API_BASE}/auth/login`, {
      data: { email: 'elena@communityaid.org', password: 'BeneficiaryPass123!' }
    });
    beneficiaryToken = (await benRes.json()).data.token;

    // Login as admin
    const adminRes = await request.post(`${API_BASE}/auth/login`, {
      data: { email: 'admin@needbridge.ai', password: 'AdminPass123!' }
    });
    adminToken = (await adminRes.json()).data.token;

    // Login as donor
    const donorRes = await request.post(`${API_BASE}/auth/login`, {
      data: { email: 'dr.jane@healthtrust.org', password: 'DonorPass123!' }
    });
    donorToken = (await donorRes.json()).data.token;
  });

  test('POST /api/requests - Beneficiary submits valid aid request', async ({ request }) => {
    const res = await request.post(`${API_BASE}/requests`, {
      headers: { Authorization: `Bearer ${beneficiaryToken}` },
      data: {
        title: 'Emergency Clean Water Rations for Flood Shelter',
        description: 'Over 20 families displaced by flash flooding require clean potable water canisters and purification tabs.',
        category: 'Clean Water & Sanitation',
        quantity: '40 water canisters',
        beneficiaries_count: 20,
        location: 'Riverbank Community Center Sector 2',
        urgency: 'critical',
        estimated_budget: 1600.00
      }
    });

    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.status).toBe('pending');
    createdRequestId = body.data.id;
  });

  test('POST /api/requests - Rejects missing required fields', async ({ request }) => {
    const res = await request.post(`${API_BASE}/requests`, {
      headers: { Authorization: `Bearer ${beneficiaryToken}` },
      data: {
        title: '',
        description: 'Too short',
        category: '',
        quantity: '',
        beneficiaries_count: -5
      }
    });

    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.errors.length).toBeGreaterThan(0);
  });

  test('GET /api/requests/my-requests - Beneficiary retrieves submitted request', async ({ request }) => {
    const res = await request.get(`${API_BASE}/requests/my-requests`, {
      headers: { Authorization: `Bearer ${beneficiaryToken}` }
    });

    expect(res.status()).toBe(200);
    const body = await res.json();
    const found = body.data.find(r => r.id === createdRequestId);
    expect(found).toBeDefined();
    expect(found.status).toBe('pending');
  });

  test('PATCH /api/requests/:id/status - Donor blocked from approving request (403 Forbidden)', async ({ request }) => {
    const res = await request.patch(`${API_BASE}/requests/${createdRequestId}/status`, {
      headers: { Authorization: `Bearer ${donorToken}` },
      data: { status: 'approved' }
    });

    expect(res.status()).toBe(403);
  });

  test('PATCH /api/requests/:id/status - Admin successfully approves request', async ({ request }) => {
    const res = await request.patch(`${API_BASE}/requests/${createdRequestId}/status`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: {
        status: 'approved',
        admin_notes: 'Audited and verified against local emergency intake.'
      }
    });

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.data.status).toBe('approved');
  });

  test('GET /api/requests/:id - Single request details returns approved request', async ({ request }) => {
    const res = await request.get(`${API_BASE}/requests/${createdRequestId}`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.data.id).toBe(createdRequestId);
    expect(body.data.status).toBe('approved');
  });
});

