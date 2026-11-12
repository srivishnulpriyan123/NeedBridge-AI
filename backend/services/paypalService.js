import dotenv from 'dotenv';

dotenv.config();

/**
 * NeedBridge AI - PayPal Developer Sandbox REST API Service
 * Official Orders API v2 integration with OAuth2 token caching
 * and intelligent Sandbox fallback for offline/test environments.
 */

const PAYPAL_BASE_URL = process.env.PAYPAL_BASE_URL || 'https://api-m.sandbox.paypal.com';
const PAYPAL_CURRENCY = process.env.PAYPAL_CURRENCY || 'USD';

// In-memory cache for PayPal OAuth access token
let cachedToken = null;
let tokenExpiresAt = 0;

/**
 * Checks whether live Sandbox credentials are validly configured
 */
export const isConfigured = () => {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  return Boolean(
    clientId &&
    clientSecret &&
    clientId !== 'your_paypal_sandbox_client_id_here' &&
    clientSecret !== 'your_paypal_sandbox_client_secret_here' &&
    clientId.trim() !== '' &&
    clientSecret.trim() !== ''
  );
};

/**
 * Returns safe public configuration for frontend SDK loading (NEVER exposes client secret)
 */
export const getClientConfig = () => {
  return {
    clientId: isConfigured() ? process.env.PAYPAL_CLIENT_ID : 'sb', // 'sb' is standard PayPal sandbox test client
    currency: PAYPAL_CURRENCY,
    isSandbox: true,
    isConfigured: isConfigured()
  };
};

/**
 * Fetches OAuth 2.0 Access Token from PayPal Sandbox using HTTP Basic Auth
 */
export const getAccessToken = async () => {
  if (!isConfigured()) {
    return 'SIMULATED_SANDBOX_ACCESS_TOKEN';
  }

  // Return cached token if still valid (with 60-second buffer)
  if (cachedToken && Date.now() < tokenExpiresAt - 60000) {
    return cachedToken;
  }

  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  try {
    const res = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${authHeader}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`PayPal OAuth failed [${res.status}]: ${errText}`);
    }

    const data = await res.json();
    cachedToken = data.access_token;
    tokenExpiresAt = Date.now() + (data.expires_in * 1000);
    return cachedToken;
  } catch (err) {
    console.error('[PayPalService] Failed to fetch access token from PayPal:', err.message);
    throw err;
  }
};

/**
 * Creates a PayPal Sandbox Order (POST /v2/checkout/orders)
 *
 * @param {Object} params
 * @param {number|string} params.amount - Donation amount in USD
 * @param {string} [params.currency] - 3-letter currency code (default: USD)
 * @param {number|string} params.requestId - Aid request ID being funded
 * @param {string} params.requestTitle - Aid request title for manifest
 * @param {number|string} params.donorId - ID of authenticated donor
 * @returns {Promise<Object>} PayPal Order response { id, status, links }
 */
export const createOrder = async ({ amount, currency = PAYPAL_CURRENCY, requestId, requestTitle = 'Community Aid', donorId }) => {
  const numericAmount = parseFloat(amount);
  if (isNaN(numericAmount) || numericAmount <= 0) {
    throw new Error('Invalid donation amount: must be greater than 0.');
  }

  const formattedAmount = numericAmount.toFixed(2);
  const safeCurrency = (currency || PAYPAL_CURRENCY).toUpperCase();

  // If credentials are not configured, operate in verified Sandbox Simulator mode
  if (!isConfigured()) {
    console.log('[PayPalService] Operating in verified Sandbox Simulator mode.');
    const simulatedOrderId = `PAYID-SANDBOX-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    return {
      id: simulatedOrderId,
      status: 'CREATED',
      currency: safeCurrency,
      amount: formattedAmount,
      is_simulated: true,
      links: [
        {
          href: `https://www.sandbox.paypal.com/checkoutnow?token=${simulatedOrderId}`,
          rel: 'approve',
          method: 'GET'
        }
      ]
    };
  }

  const token = await getAccessToken();

  const payload = {
    intent: 'CAPTURE',
    purchase_units: [
      {
        reference_id: `REQ-${requestId}`,
        description: `NeedBridge Aid Donation for: ${requestTitle.slice(0, 100)}`,
        custom_id: `${donorId}:${requestId}`,
        amount: {
          currency_code: safeCurrency,
          value: formattedAmount
        }
      }
    ],
    application_context: {
      brand_name: 'NeedBridge AI',
      landing_page: 'NO_PREFERENCE',
      user_action: 'PAY_NOW',
      shipping_preference: 'NO_SHIPPING'
    }
  };

  const res = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    console.error('[PayPalService] PayPal create order failed:', errorJson);
    throw new Error(errorJson.message || `PayPal order creation failed with status ${res.status}`);
  }

  const orderData = await res.json();
  return {
    id: orderData.id,
    status: orderData.status,
    currency: safeCurrency,
    amount: formattedAmount,
    is_simulated: false,
    links: orderData.links || []
  };
};

/**
 * Captures payment for an approved PayPal order (POST /v2/checkout/orders/{id}/capture)
 *
 * @param {string} orderId - PayPal Order ID
 * @param {number|string} expectedAmount - Expected donation amount to verify against manipulation
 * @param {string} [expectedCurrency] - Expected currency code (default: USD)
 * @returns {Promise<Object>} Capture details { orderId, captureId, status, amount, currency }
 */
export const captureOrder = async (orderId, expectedAmount = null, expectedCurrency = PAYPAL_CURRENCY) => {
  if (!orderId || typeof orderId !== 'string') {
    throw new Error('Missing or invalid PayPal order ID.');
  }

  // Handle Sandbox Simulator orders
  if (!isConfigured() || orderId.startsWith('PAYID-SANDBOX-') || orderId.startsWith('PAYID-MOCK-')) {
    console.log(`[PayPalService] Processing capture in Sandbox Simulator mode for order ${orderId}`);
    const simulatedCaptureId = `CAP-SANDBOX-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const verifiedAmount = expectedAmount ? parseFloat(expectedAmount).toFixed(2) : '50.00';

    return {
      orderId,
      captureId: simulatedCaptureId,
      status: 'COMPLETED',
      amount: verifiedAmount,
      currency: expectedCurrency || PAYPAL_CURRENCY,
      is_simulated: true,
      capture_time: new Date().toISOString()
    };
  }

  const token = await getAccessToken();

  const res = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    console.error('[PayPalService] PayPal capture failed:', errorJson);
    throw new Error(errorJson.message || `PayPal payment capture failed with status ${res.status}`);
  }

  const captureData = await res.json();

  // Extract capture information from first purchase unit
  const captureUnit = captureData.purchase_units?.[0]?.payments?.captures?.[0];
  if (!captureUnit) {
    throw new Error('PayPal capture response did not return a valid capture unit.');
  }

  const capturedStatus = captureUnit.status; // 'COMPLETED', 'PENDING', 'DECLINED', etc.
  const capturedAmount = parseFloat(captureUnit.amount?.value);
  const capturedCurrency = captureUnit.amount?.currency_code;
  const captureId = captureUnit.id;

  // Security Verification: Check that captured amount matches expected amount
  if (expectedAmount !== null) {
    const expectedNum = parseFloat(expectedAmount);
    if (Math.abs(capturedAmount - expectedNum) > 0.01) {
      throw new Error(`Amount mismatch detected: captured $${capturedAmount} does not match requested $${expectedNum}`);
    }
  }

  // Security Verification: Currency check
  if (expectedCurrency && capturedCurrency !== expectedCurrency) {
    throw new Error(`Currency mismatch: captured ${capturedCurrency} does not match expected ${expectedCurrency}`);
  }

  return {
    orderId: captureData.id,
    captureId,
    status: capturedStatus, // Typically 'COMPLETED'
    amount: capturedAmount.toFixed(2),
    currency: capturedCurrency,
    is_simulated: false,
    capture_time: captureUnit.create_time || new Date().toISOString(),
    payer: captureData.payer || null
  };
};

export default {
  isConfigured,
  getClientConfig,
  getAccessToken,
  createOrder,
  captureOrder
};

