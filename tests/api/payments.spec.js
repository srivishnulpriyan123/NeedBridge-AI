import { test, expect } from '@playwright/test';

const API_BASE = 'http://127.0.0.1:5000/api';

test.describe('API Suite: PayPal Developer Sandbox Payments', () => {
  let donor1Token;
  let donor2Token;
  let approvedRequestId;
  let createdOrderId;
  let donationId;

  test.beforeAll(async ({ request }) => {
    // Donor 1
    const d1Res = await request.post(`${API_BASE}/auth/login`, {
      data: { email: 'dr.jane@healthtrust.org', password: 'DonorPass123!' }
    });
    donor1Token = (await d1Res.json()).data.token;

    // Donor 2
    const d2Res = await request.post(`${API_BASE}/auth/login`, {
      data: { email: 'sarah.j@greenleaf.org', password: 'DonorPass123!' }
    });
    donor2Token = (await d2Res.json()).data.token;

    // Get an approved request
    const reqRes = await request.get(`${API_BASE}/requests`);
    const requests = (await reqRes.json()).data;
    const target = requests.find(r => r.status === 'approved');
    approvedRequestId = target.id;
  });

  test('GET /api/payments/config - Returns safe public PayPal configuration', async ({ request }) => {
    const res = await request.get(`${API_BASE}/payments/config`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.data.clientId).toBeTruthy();
    expect(body.data.currency).toBe('USD');
    expect(body.data.isSandbox).toBe(true);
    expect(body.data.clientSecret).toBeUndefined(); // Security: Never expose secret
  });

  test('POST /api/payments/create-order - Creates PayPal Sandbox order & pending PostgreSQL record', async ({ request }) => {
    const res = await request.post(`${API_BASE}/payments/create-order`, {
      headers: { Authorization: `Bearer ${donor1Token}` },
      data: {
        request_id: approvedRequestId,
        amount: 85.00
      }
    });

    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.orderId).toBeTruthy();
    expect(body.data.status).toBe('pending');
    expect(parseFloat(body.data.amount)).toBe(85.00);

    createdOrderId = body.data.orderId;
    donationId = body.data.donationId;
  });

  test('POST /api/payments/capture-order - Unauthorized donor capture blocked with 403 Forbidden', async ({ request }) => {
    const res = await request.post(`${API_BASE}/payments/capture-order`, {
      headers: { Authorization: `Bearer ${donor2Token}` },
      data: { order_id: createdOrderId }
    });
    expect(res.status()).toBe(403);
  });

  test('POST /api/payments/capture-order - Legitimate donor captures order and updates DB', async ({ request }) => {
    const res = await request.post(`${API_BASE}/payments/capture-order`, {
      headers: { Authorization: `Bearer ${donor1Token}` },
      data: { order_id: createdOrderId }
    });

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.donation.payment_status).toBe('completed');
    expect(body.data.capture.captureId).toBeTruthy();
    expect(body.data.request.funds_raised).toBeGreaterThan(0);
  });

  test('POST /api/payments/capture-order - Duplicate capture call is idempotent and safe', async ({ request }) => {
    const res = await request.post(`${API_BASE}/payments/capture-order`, {
      headers: { Authorization: `Bearer ${donor1Token}` },
      data: { order_id: createdOrderId }
    });

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.data.already_completed).toBe(true);
  });

  test('POST /api/payments/cancel-order - Marks order as cancelled on buyer exit', async ({ request }) => {
    // Create new order to cancel
    const newOrderRes = await request.post(`${API_BASE}/payments/create-order`, {
      headers: { Authorization: `Bearer ${donor1Token}` },
      data: {
        request_id: approvedRequestId,
        amount: 25.00
      }
    });
    const { orderId } = (await newOrderRes.json()).data;

    // Cancel it
    const cancelRes = await request.post(`${API_BASE}/payments/cancel-order`, {
      headers: { Authorization: `Bearer ${donor1Token}` },
      data: { order_id: orderId }
    });

    expect(cancelRes.status()).toBe(200);
  });
});

