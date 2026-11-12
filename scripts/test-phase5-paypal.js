import { query, testConnection } from '../backend/config/db.js';

const API_URL = 'http://127.0.0.1:5000/api';

async function runPhase5PayPalVerification() {
  console.log('================================================================');
  console.log(' NEEDBRIDGE AI: PHASE 5 PAYPAL SANDBOX INTEGRATION TEST SUITE');
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
    // STEP 1: Verify Database & Health
    console.log('--- STEP 1: Database & Health Check ---');
    const dbStatus = await testConnection();
    assert(dbStatus.connected, 'PostgreSQL database connection is alive');

    // STEP 2: Verify PayPal Configuration Endpoint
    console.log('\n--- STEP 2: PayPal Public Config Endpoint ---');
    const configRes = await fetch(`${API_URL}/payments/config`);
    const configJson = await configRes.json();
    assert(configRes.status === 200, 'GET /api/payments/config returns 200 OK');
    assert(!!configJson.data?.clientId, `Config returns safe clientId: "${configJson.data?.clientId}"`);
    assert(configJson.data?.currency === 'USD', `Config returns currency: "${configJson.data?.currency}"`);
    assert(configJson.data?.isSandbox === true, 'Config identifies Sandbox environment');
    assert(configJson.data?.clientSecret === undefined, 'Client secret is NEVER exposed to client');

    // STEP 3: Authenticate Test Users
    console.log('\n--- STEP 3: User Authentication (Donor & Beneficiary) ---');
    // Donor 1 (Dr. Jane Chen)
    const donor1LoginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'dr.jane@healthtrust.org', password: 'DonorPass123!' })
    });
    const donor1Login = await donor1LoginRes.json();
    const donor1Token = donor1Login.data?.token;
    const donor1Id = donor1Login.data?.user?.id;
    assert(donor1LoginRes.status === 200 && !!donor1Token, 'Donor 1 (Dr. Jane Chen) logged in');

    // Donor 2 (Sarah Jenkins)
    const donor2LoginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'sarah.j@greenleaf.org', password: 'DonorPass123!' })
    });
    const donor2Login = await donor2LoginRes.json();
    const donor2Token = donor2Login.data?.token;
    assert(donor2LoginRes.status === 200 && !!donor2Token, 'Donor 2 (Sarah Jenkins) logged in');

    // Beneficiary (Elena Rostova)
    const benLoginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'elena@communityaid.org', password: 'BeneficiaryPass123!' })
    });
    const benLogin = await benLoginRes.json();
    const benToken = benLogin.data?.token;
    assert(benLoginRes.status === 200 && !!benToken, 'Beneficiary (Elena) logged in');

    // STEP 4: Setup Target Approved Aid Request
    console.log('\n--- STEP 4: Target Aid Request Verification ---');
    // Query an approved request from DB
    const reqQuery = await query(
      `SELECT id, title, status, estimated_budget, funds_raised 
       FROM aid_requests 
       WHERE status = 'approved' 
       ORDER BY id ASC LIMIT 1`
    );
    assert(reqQuery.rows.length > 0, `Found approved aid request #${reqQuery.rows[0]?.id} ("${reqQuery.rows[0]?.title.slice(0, 40)}...")`);
    const targetRequest = reqQuery.rows[0];
    const initialFundsRaised = parseFloat(targetRequest.funds_raised || 0);

    // STEP 5: Security & Negative Order Creation Cases
    console.log('\n--- STEP 5: Security & Order Creation Negative Tests ---');
    // 5a. Unauthenticated order creation
    const unauthOrderRes = await fetch(`${API_URL}/payments/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ request_id: targetRequest.id, amount: 50.00 })
    });
    assert(unauthOrderRes.status === 401, 'Unauthenticated order creation blocked (401 Unauthorized)');

    // 5b. Beneficiary attempting to create donation order
    const benOrderRes = await fetch(`${API_URL}/payments/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${benToken}`
      },
      body: JSON.stringify({ request_id: targetRequest.id, amount: 50.00 })
    });
    assert(benOrderRes.status === 403, 'Beneficiary role blocked from creating donation order (403 Forbidden)');

    // 5c. Invalid / negative / zero donation amount
    const invalidAmtRes = await fetch(`${API_URL}/payments/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${donor1Token}`
      },
      body: JSON.stringify({ request_id: targetRequest.id, amount: -25.00 })
    });
    assert(invalidAmtRes.status === 400, 'Negative donation amount rejected (400 Bad Request)');

    // 5d. Non-existent request ID
    const notFoundReqRes = await fetch(`${API_URL}/payments/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${donor1Token}`
      },
      body: JSON.stringify({ request_id: 999999, amount: 50.00 })
    });
    assert(notFoundReqRes.status === 404, 'Non-existent aid request rejected (404 Not Found)');

    // STEP 6: Successful PayPal Sandbox Order Creation
    console.log('\n--- STEP 6: Valid PayPal Sandbox Order Creation ---');
    const pledgeAmount = 150.00;
    const createRes = await fetch(`${API_URL}/payments/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${donor1Token}`
      },
      body: JSON.stringify({
        request_id: targetRequest.id,
        amount: pledgeAmount
      })
    });
    const createJson = await createRes.json();
    assert(createRes.status === 201, 'POST /api/payments/create-order returns 201 Created');
    assert(!!createJson.data?.orderId, `PayPal order ID generated: "${createJson.data?.orderId}"`);
    assert(createJson.data?.status === 'pending', 'Donation initial status is "pending"');
    assert(parseFloat(createJson.data?.amount) === pledgeAmount, `Order amount recorded as $${pledgeAmount}`);
    assert(createJson.data?.currency === 'USD', 'Order currency is "USD"');

    const createdOrderId = createJson.data?.orderId;
    const donationDbId = createJson.data?.donationId;

    // Verify PostgreSQL pending record
    const dbDonationCheck = await query(
      `SELECT * FROM donations WHERE id = $1`,
      [donationDbId]
    );
    assert(dbDonationCheck.rows.length === 1, 'Donation row persisted in PostgreSQL');
    const dbDonation = dbDonationCheck.rows[0];
    assert(dbDonation.payment_status === 'pending', 'PostgreSQL donation payment_status is "pending"');
    assert(dbDonation.paypal_order_id === createdOrderId, 'PostgreSQL paypal_order_id matches API output');
    assert(dbDonation.currency === 'USD', 'PostgreSQL currency recorded as "USD"');

    // STEP 7: Security & Unauthorized Capture Prevention
    console.log('\n--- STEP 7: Security - Unauthorized Capture Prevention ---');
    // Donor 2 attempts to capture Donor 1's order
    const stolenCaptureRes = await fetch(`${API_URL}/payments/capture-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${donor2Token}`
      },
      body: JSON.stringify({ order_id: createdOrderId })
    });
    assert(stolenCaptureRes.status === 403, 'Unauthorized donor capture blocked with 403 Forbidden');

    // Invalid non-existent order ID
    const fakeOrderCaptureRes = await fetch(`${API_URL}/payments/capture-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${donor1Token}`
      },
      body: JSON.stringify({ order_id: 'PAYID-NONEXISTENT-99999' })
    });
    assert(fakeOrderCaptureRes.status === 404, 'Non-existent order ID rejected with 404 Not Found');

    // STEP 8: Valid PayPal Sandbox Capture & Settlement
    console.log('\n--- STEP 8: Authorized PayPal Sandbox Capture & Settlement ---');
    const captureRes = await fetch(`${API_URL}/payments/capture-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${donor1Token}`
      },
      body: JSON.stringify({ order_id: createdOrderId })
    });
    const captureJson = await captureRes.json();
    assert(captureRes.status === 200, 'POST /api/payments/capture-order returns 200 OK');
    assert(captureJson.data?.capture?.status === 'COMPLETED', 'PayPal capture status verified as "COMPLETED"');
    assert(!!captureJson.data?.capture?.captureId, `PayPal captureId generated: "${captureJson.data?.capture?.captureId}"`);
    assert(captureJson.data?.donation?.payment_status === 'completed', 'Donation record status updated to "completed"');

    // STEP 9: Database Verification & Funds Raised Increment
    console.log('\n--- STEP 9: Database Integrity & Funds Accounting ---');
    const dbSettledCheck = await query(
      `SELECT * FROM donations WHERE id = $1`,
      [donationDbId]
    );
    const settledDonation = dbSettledCheck.rows[0];
    assert(settledDonation.payment_status === 'completed', 'PostgreSQL payment_status successfully set to "completed"');
    assert(!!settledDonation.paypal_capture_id, `PostgreSQL paypal_capture_id recorded: "${settledDonation.paypal_capture_id}"`);

    const updatedReqQuery = await query(
      `SELECT id, funds_raised, estimated_budget, status FROM aid_requests WHERE id = $1`,
      [targetRequest.id]
    );
    const updatedReq = updatedReqQuery.rows[0];
    const expectedFunds = initialFundsRaised + pledgeAmount;
    assert(
      Math.abs(parseFloat(updatedReq.funds_raised) - expectedFunds) < 0.01,
      `Aid request funds_raised accurately incremented from $${initialFundsRaised} to $${updatedReq.funds_raised}`
    );

    // STEP 10: Idempotent Capture (Prevent Double-Credit Attack)
    console.log('\n--- STEP 10: Idempotency & Replay Defense ---');
    const replayCaptureRes = await fetch(`${API_URL}/payments/capture-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${donor1Token}`
      },
      body: JSON.stringify({ order_id: createdOrderId })
    });
    const replayJson = await replayCaptureRes.json();
    assert(replayCaptureRes.status === 200, 'Re-capturing already completed order returns 200 gracefully');
    assert(replayJson.data?.already_completed === true, 'Response identifies order was already completed');

    const verifyNoDoubleCredit = await query(
      `SELECT funds_raised FROM aid_requests WHERE id = $1`,
      [targetRequest.id]
    );
    assert(
      Math.abs(parseFloat(verifyNoDoubleCredit.rows[0].funds_raised) - expectedFunds) < 0.01,
      'Duplicate capture attempt did NOT double-credit request funds (Idempotency confirmed)'
    );

    // STEP 11: Order Cancellation Flow
    console.log('\n--- STEP 11: Order Cancellation Handling ---');
    const cancelPledgeRes = await fetch(`${API_URL}/payments/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${donor1Token}`
      },
      body: JSON.stringify({
        request_id: targetRequest.id,
        amount: 30.00
      })
    });
    const cancelPledgeJson = await cancelPledgeRes.json();
    const orderToCancel = cancelPledgeJson.data?.orderId;

    const cancelRes = await fetch(`${API_URL}/payments/cancel-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${donor1Token}`
      },
      body: JSON.stringify({ order_id: orderToCancel })
    });
    assert(cancelRes.status === 200, 'POST /api/payments/cancel-order returns 200 OK');

    const dbCancelledCheck = await query(
      `SELECT payment_status FROM donations WHERE paypal_order_id = $1`,
      [orderToCancel]
    );
    assert(dbCancelledCheck.rows[0]?.payment_status === 'cancelled', 'PostgreSQL donation marked as "cancelled"');

    // Attempting to capture cancelled order must fail
    const captureCancelledRes = await fetch(`${API_URL}/payments/capture-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${donor1Token}`
      },
      body: JSON.stringify({ order_id: orderToCancel })
    });
    assert(captureCancelledRes.status === 400, 'Capturing cancelled order rejected (400 Bad Request)');

    // STEP 12: Donor History & Transparency Ledger
    console.log('\n--- STEP 12: Donor History & Transparency Ledger Verification ---');
    const myDonationsRes = await fetch(`${API_URL}/donations/my-donations`, {
      headers: { Authorization: `Bearer ${donor1Token}` }
    });
    const myDonationsJson = await myDonationsRes.json();
    assert(myDonationsRes.status === 200, 'GET /api/donations/my-donations returns 200 OK');
    const matchedMyDonation = myDonationsJson.data?.find(d => d.paypal_order_id === createdOrderId);
    assert(!!matchedMyDonation, 'Completed PayPal donation appears in donor personal history');
    assert(matchedMyDonation?.payment_status === 'completed', 'History shows payment_status "completed"');
    assert(!!matchedMyDonation?.paypal_capture_id, `History displays PayPal capture ID "${matchedMyDonation?.paypal_capture_id}"`);

    // Public Transparency Ledger
    const transparencyRes = await fetch(`${API_URL}/donations`);
    const transparencyJson = await transparencyRes.json();
    assert(transparencyRes.status === 200, 'GET /api/donations public ledger returns 200 OK');
    const matchedLedger = transparencyJson.data?.find(d => d.paypal_order_id === createdOrderId);
    assert(!!matchedLedger, 'Completed donation is listed on public transparency ledger');
    assert(matchedLedger?.donor_name === 'Dr. Jane Chen (HealthTrust)', 'Ledger correctly links donor identity');

    console.log('\n================================================================');
    console.log(` RESULTS: ${passed} PASSED | ${failed} FAILED`);
    console.log('================================================================');

    if (failed > 0) {
      process.exit(1);
    } else {
      console.log('ALL PHASE 5 PAYPAL SANDBOX REQUIREMENTS VERIFIED SUCCESSFULLY!');
      process.exit(0);
    }
  } catch (err) {
    console.error('Fatal test error:', err);
    process.exit(1);
  }
}

runPhase5PayPalVerification();

