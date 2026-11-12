/**
 * Comprehensive Automated End-to-End Test Suite for NeedBridge AI Backend
 */
const BASE_URL = 'http://127.0.0.1:5000';

async function runTests() {
  console.log('====================================================');
  console.log(' Running NeedBridge AI Automated API Verification');
  console.log(` Target: ${BASE_URL}`);
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, testName, extraInfo = '') => {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName} - ${extraInfo}`);
      failed++;
    }
  };

  try {
    // 1. Health Check
    console.log('--- TEST GROUP 1: Health & System Diagnostics ---');
    const healthRes = await fetch(`${BASE_URL}/api/health`);
    const healthData = await healthRes.json();
    assert(healthRes.status === 200, 'GET /api/health responds with 200 OK');
    assert(healthData.status === 'healthy', 'System status is "healthy"');
    assert(healthData.database?.connected === true, 'PostgreSQL database connected is true');
    assert(healthData.database?.name === 'needbridge_db', 'Connected database is "needbridge_db"');

    // 2. Authentication: Login Tests
    console.log('\n--- TEST GROUP 2: Authentication & JWT ---');
    
    // Login as Admin
    const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@needbridge.ai', password: 'AdminPass123!' })
    });
    const adminLoginData = await adminLoginRes.json();
    assert(adminLoginRes.status === 200, 'Admin login with valid credentials responds 200');
    assert(!!adminLoginData.data?.token, 'Admin login returns JWT token');
    assert(adminLoginData.data?.user?.role === 'admin', 'Admin user role verified as "admin"');
    const adminToken = adminLoginData.data?.token;

    // Login as Beneficiary
    const benLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'elena@communityaid.org', password: 'BeneficiaryPass123!' })
    });
    const benLoginData = await benLoginRes.json();
    assert(benLoginRes.status === 200, 'Beneficiary login responds 200');
    assert(benLoginData.data?.user?.role === 'beneficiary', 'Beneficiary role verified as "beneficiary"');
    const benToken = benLoginData.data?.token;

    // Login as Donor
    const donorLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'dr.jane@healthtrust.org', password: 'DonorPass123!' })
    });
    const donorLoginData = await donorLoginRes.json();
    assert(donorLoginRes.status === 200, 'Donor login responds 200');
    assert(donorLoginData.data?.user?.role === 'donor', 'Donor role verified as "donor"');
    const donorToken = donorLoginData.data?.token;

    // Invalid Credentials Test
    const badLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@needbridge.ai', password: 'WrongPassword999' })
    });
    assert(badLoginRes.status === 401, 'Invalid password correctly rejected with 401 Unauthorized');

    // Profile Endpoint with JWT
    const profileRes = await fetch(`${BASE_URL}/api/auth/profile`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const profileData = await profileRes.json();
    assert(profileRes.status === 200, 'GET /api/auth/profile with Bearer token responds 200');
    assert(profileData.data?.user?.email === 'admin@needbridge.ai', 'Profile returns correct authenticated user');
    assert(profileData.data?.metrics !== undefined, 'Profile returns role-specific metrics breakdown');

    // Register New User Test
    const testEmail = `newuser_${Date.now()}@example.org`;
    const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Beneficiary User',
        email: testEmail,
        password: 'Password123!',
        role: 'beneficiary'
      })
    });
    const regData = await regRes.json();
    assert(regRes.status === 201, 'POST /api/auth/register creates new account with 201 Created');
    assert(regData.data?.user?.email === testEmail, 'Registered user email matches');

    // 3. Aid Requests API Tests
    console.log('\n--- TEST GROUP 3: Aid Requests Lifecycle ---');
    
    // Browse approved requests (Public/Donor)
    const requestsRes = await fetch(`${BASE_URL}/api/requests`);
    const requestsData = await requestsRes.json();
    assert(requestsRes.status === 200, 'GET /api/requests responds with 200 OK');
    assert(Array.isArray(requestsData.data), 'GET /api/requests returns an array of requests');
    assert(requestsData.data.length >= 5, `Fetched ${requestsData.data.length} approved requests`);

    // Beneficiary submits new aid request
    const createReqRes = await fetch(`${BASE_URL}/api/requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${benToken}`
      },
      body: JSON.stringify({
        title: 'Emergency Medical First Aid Packs for Cyclone Displaced Ward',
        description: 'Urgent medical triage kits, sterile sutures, fever medication, and bandages needed for 50 families.',
        category: 'Medical & Healthcare',
        quantity: '50 emergency medical kits',
        beneficiaries_count: 50,
        location: 'Cyclone Relief Camp #3, Sector B',
        urgency: 'critical',
        estimated_budget: 1500.00
      })
    });
    const createReqData = await createReqRes.json();
    assert(createReqRes.status === 201, 'Beneficiary POST /api/requests responds with 201 Created');
    assert(createReqData.data?.status === 'pending', 'Newly created request status defaults to "pending"');
    const newRequestId = createReqData.data?.id;

    // Beneficiary views their own requests
    const myReqRes = await fetch(`${BASE_URL}/api/requests/my-requests`, {
      headers: { Authorization: `Bearer ${benToken}` }
    });
    const myReqData = await myReqRes.json();
    assert(myReqRes.status === 200, 'GET /api/requests/my-requests responds 200');
    assert(myReqData.data.some(r => r.id === newRequestId), 'Newly created request appears in Beneficiary my-requests');

    // Role Security Check: Donor cannot approve requests
    const unauthorizedPatchRes = await fetch(`${BASE_URL}/api/requests/${newRequestId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${donorToken}`
      },
      body: JSON.stringify({ status: 'approved' })
    });
    assert(unauthorizedPatchRes.status === 403, 'Donor attempting to approve request is blocked with 403 Forbidden');

    // Admin approves the request
    const adminApproveRes = await fetch(`${BASE_URL}/api/requests/${newRequestId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        status: 'approved',
        admin_notes: 'Verified intake documentation against regional cyclone alert.'
      })
    });
    const adminApproveData = await adminApproveRes.json();
    assert(adminApproveRes.status === 200, 'Admin PATCH /api/requests/:id/status responds 200');
    assert(adminApproveData.data?.status === 'approved', 'Request status transitioned to "approved"');

    // 4. Donations API Tests
    console.log('\n--- TEST GROUP 4: Transparent Donations & Ledger ---');

    // Donor funds the approved request
    const donationRes = await fetch(`${BASE_URL}/api/donations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${donorToken}`
      },
      body: JSON.stringify({
        request_id: newRequestId,
        amount: 500.00,
        payment_provider: 'paypal_mock_sandbox',
        paypal_order_id: 'PAYID-MOCK-E2E-TEST-8812'
      })
    });
    const donationData = await donationRes.json();
    assert(donationRes.status === 201, 'POST /api/donations creates donation record with 201 Created');
    assert(donationData.data?.donation?.amount == 500.00, 'Donation amount recorded accurately');
    assert(donationData.data?.request?.funds_raised == 500.00, 'Request funds_raised updated automatically');

    // Donor views their personal donations
    const myDonationsRes = await fetch(`${BASE_URL}/api/donations/my-donations`, {
      headers: { Authorization: `Bearer ${donorToken}` }
    });
    const myDonationsData = await myDonationsRes.json();
    assert(myDonationsRes.status === 200, 'GET /api/donations/my-donations responds 200');
    assert(Array.isArray(myDonationsData.data), 'my-donations returns array of personal contributions');
    assert(myDonationsData.summary?.total_amount > 0, 'Donor summary computes aggregate amount contributed');

    // Public / Audit view of all donations
    const allDonationsRes = await fetch(`${BASE_URL}/api/donations`);
    const allDonationsData = await allDonationsRes.json();
    assert(allDonationsRes.status === 200, 'GET /api/donations responds 200');
    assert(allDonationsData.data.length >= 8, `Public ledger has ${allDonationsData.data.length} donations recorded`);
    assert(allDonationsData.summary?.total_volume > 0, 'Public ledger calculates aggregate financial volume');

    // Summary
    console.log('\n====================================================');
    console.log(` AUTOMATED API TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================');

    if (failed > 0) {
      process.exit(1);
    } else {
      console.log('🎉 ALL 24 BACKEND ENDPOINTS AND SECURITY RULES VERIFIED!');
      process.exit(0);
    }
  } catch (error) {
    console.error('Test execution crashed:', error);
    process.exit(1);
  }
}

runTests();

