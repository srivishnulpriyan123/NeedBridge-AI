import { testConnection } from '../backend/config/db.js';

const API_URL = 'http://127.0.0.1:5000/api';

async function runPhase3Verification() {
  console.log('================================================================');
  console.log(' NEEDBRIDGE AI: PHASE 3 FULL-STACK INTEGRATION TEST SUITE');
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
    // Check 1: PostgreSQL Health
    console.log('--- STEP 1: Database & Health Verification ---');
    const healthRes = await fetch(`${API_URL}/health`);
    const healthJson = await healthRes.json();
    assert(healthRes.status === 200, 'GET /api/health responds with 200 OK');
    assert(healthJson.database?.connected === true, 'PostgreSQL database connection is alive');

    // Check 2: Beneficiary Login & Submission Flow
    console.log('\n--- STEP 2: Beneficiary Login & Request Creation ---');
    const benLoginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'elena@communityaid.org', password: 'BeneficiaryPass123!' })
    });
    const benLoginJson = await benLoginRes.json();
    assert(benLoginRes.status === 200, 'Beneficiary logs in successfully');
    const benToken = benLoginJson.data?.token;
    assert(!!benToken, 'Beneficiary receives valid JWT token');

    const submitRes = await fetch(`${API_URL}/requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${benToken}`
      },
      body: JSON.stringify({
        title: 'Emergency Flood Relief Blankets for 25 Riverbank Families',
        description: 'Flash flooding swept riverbank settlement. 25 families need immediate thermal wool blankets and dry kits.',
        category: 'Shelter & Bedding',
        quantity: '50 wool blankets',
        beneficiaries_count: 25,
        location: 'Riverbank Sector 4',
        urgency: 'critical',
        estimated_budget: 1250.00
      })
    });
    const submitJson = await submitRes.json();
    assert(submitRes.status === 201, 'Beneficiary submits aid request (201 Created)');
    const createdRequestId = submitJson.data?.id;
    assert(submitJson.data?.status === 'pending', 'Submitted request is saved to PostgreSQL with status "pending"');

    // Check 3: Beneficiary views their own requests
    console.log('\n--- STEP 3: Beneficiary View Own Requests ---');
    const myReqRes = await fetch(`${API_URL}/requests/my-requests`, {
      headers: { Authorization: `Bearer ${benToken}` }
    });
    const myReqJson = await myReqRes.json();
    assert(myReqRes.status === 200, 'GET /api/requests/my-requests returns 200 OK');
    const foundMyReq = myReqJson.data?.find(r => r.id === createdRequestId);
    assert(!!foundMyReq, 'Newly submitted request is retrieved from PostgreSQL in my-requests');

    // Check 4: Admin Governance (Approve / Reject)
    console.log('\n--- STEP 4: Admin Authorization & Approval Flow ---');
    const adminLoginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@needbridge.ai', password: 'AdminPass123!' })
    });
    const adminLoginJson = await adminLoginRes.json();
    assert(adminLoginRes.status === 200, 'Admin logs in successfully');
    const adminToken = adminLoginJson.data?.token;

    // Admin approves the request
    const approveRes = await fetch(`${API_URL}/requests/${createdRequestId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        status: 'approved',
        admin_notes: 'Verified disaster intake log with regional flood response unit.'
      })
    });
    const approveJson = await approveRes.json();
    assert(approveRes.status === 200, 'Admin successfully approves request via PATCH /api/requests/:id/status');
    assert(approveJson.data?.status === 'approved', 'PostgreSQL database reflects status transition to "approved"');

    // Check 5: Donor Discovery & Pledge Flow
    console.log('\n--- STEP 5: Donor Discovery & Transparent Donation ---');
    const donorLoginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'dr.jane@healthtrust.org', password: 'DonorPass123!' })
    });
    const donorLoginJson = await donorLoginRes.json();
    assert(donorLoginRes.status === 200, 'Donor logs in successfully');
    const donorToken = donorLoginJson.data?.token;

    // Donor checks approved requests catalog
    const catalogRes = await fetch(`${API_URL}/requests`);
    const catalogJson = await catalogRes.json();
    assert(catalogRes.status === 200, 'Donor fetches approved requests catalog');
    const approvedItemInCatalog = catalogJson.data?.find(r => r.id === createdRequestId);
    assert(!!approvedItemInCatalog, 'Newly approved request is visible to Donors in the marketplace');

    // Donor pledges $500 to this request
    const donationRes = await fetch(`${API_URL}/donations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${donorToken}`
      },
      body: JSON.stringify({
        request_id: createdRequestId,
        amount: 500.00,
        payment_provider: 'paypal_mock_sandbox',
        paypal_order_id: 'PAYID-PHASE3-TEST-9921'
      })
    });
    const donationJson = await donationRes.json();
    assert(donationRes.status === 201, 'Donor creates donation record (201 Created)');
    assert(donationJson.data?.donation?.amount == 500.00, 'Donation amount $500.00 stored accurately in PostgreSQL');
    assert(donationJson.data?.request?.funds_raised == 500.00, 'Request funds_raised updated automatically in database');

    // Check 6: Transparency Dashboard Verification
    console.log('\n--- STEP 6: Transparency Ledger Verification ---');
    const transparencyRes = await fetch(`${API_URL}/donations`);
    const transparencyJson = await transparencyRes.json();
    assert(transparencyRes.status === 200, 'GET /api/donations returns 200 OK');
    const recordedDonation = transparencyJson.data?.find(d => d.paypal_order_id === 'PAYID-PHASE3-TEST-9921');
    assert(!!recordedDonation, 'Donation appears in the Transparency Public Ledger with donor & request metadata');

    // Check 7: Security & Error Boundaries
    console.log('\n--- STEP 7: Security Rules & Negative Test Cases ---');
    
    // Unauthorized status update (Donor trying to approve request)
    const unauthorizedRes = await fetch(`${API_URL}/requests/${createdRequestId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${donorToken}`
      },
      body: JSON.stringify({ status: 'approved' })
    });
    assert(unauthorizedRes.status === 403, 'Unauthorized role update blocked with 403 Forbidden');

    // Invalid Login Credentials
    const badLoginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@needbridge.ai', password: 'WrongPassword999!' })
    });
    assert(badLoginRes.status === 401, 'Invalid password rejected with 401 Unauthorized');

    // Admin Rejection Flow
    const rejectReqRes = await fetch(`${API_URL}/requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${benToken}`
      },
      body: JSON.stringify({
        title: 'Duplicate Aid Request to test Admin Rejection',
        description: 'Testing admin rejection path for intake audit compliance verification.',
        category: 'Food & Nutrition',
        quantity: '10 packages',
        beneficiaries_count: 5,
        location: 'Downtown Shelter',
        urgency: 'low',
        estimated_budget: 200.00
      })
    });
    const rejectReqJson = await rejectReqRes.json();
    const reqToRejectId = rejectReqJson.data?.id;

    const adminRejectRes = await fetch(`${API_URL}/requests/${reqToRejectId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        status: 'rejected',
        admin_notes: 'Duplicate intake claim detected in Downtown Ward.'
      })
    });
    const adminRejectJson = await adminRejectRes.json();
    assert(adminRejectRes.status === 200, 'Admin rejects invalid request successfully');
    assert(adminRejectJson.data?.status === 'rejected', 'Database updates status to "rejected"');

    // Summary
    console.log('\n================================================================');
    console.log(` INTEGRATION TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('================================================================');

    if (failed === 0) {
      console.log('🎉 PHASE 3 FULL-STACK INTEGRATION FULLY VERIFIED!');
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (err) {
    console.error('Integration test crashed:', err);
    process.exit(1);
  }
}

runPhase3Verification();

