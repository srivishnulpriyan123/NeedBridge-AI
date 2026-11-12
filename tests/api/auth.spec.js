import { test, expect } from '@playwright/test';

const API_BASE = 'http://127.0.0.1:5000/api';

test.describe('API Suite: Authentication & Role-Based Access Control', () => {
  test('POST /api/auth/login - Admin authentication succeeds with valid credentials', async ({ request }) => {
    const res = await request.post(`${API_BASE}/auth/login`, {
      data: {
        email: 'admin@needbridge.ai',
        password: 'AdminPass123!'
      }
    });

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.user.role).toBe('admin');
    expect(body.data.token).toBeTruthy();
  });

  test('POST /api/auth/login - Rejects invalid password with 401 Unauthorized', async ({ request }) => {
    const res = await request.post(`${API_BASE}/auth/login`, {
      data: {
        email: 'admin@needbridge.ai',
        password: 'WrongPassword!'
      }
    });

    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body.success).toBe(false);
  });

  test('POST /api/auth/register - Rejects duplicate email registration', async ({ request }) => {
    const res = await request.post(`${API_BASE}/auth/register`, {
      data: {
        name: 'Elena Duplicate',
        email: 'elena@communityaid.org',
        password: 'TestPassword123!',
        role: 'beneficiary'
      }
    });

    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.message).toContain('already exists');
  });

  test('GET /api/auth/profile - Returns user profile and metrics with valid JWT', async ({ request }) => {
    const loginRes = await request.post(`${API_BASE}/auth/login`, {
      data: { email: 'dr.jane@healthtrust.org', password: 'DonorPass123!' }
    });
    const { token } = (await loginRes.json()).data;

    const profileRes = await request.get(`${API_BASE}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    expect(profileRes.status()).toBe(200);
    const body = await profileRes.json();
    expect(body.data.user.email).toBe('dr.jane@healthtrust.org');
    expect(body.data.metrics).toBeDefined();
  });

  test('GET /api/auth/profile - Rejects unauthenticated request with 401', async ({ request }) => {
    const res = await request.get(`${API_BASE}/auth/profile`);
    expect(res.status()).toBe(401);
  });
});

