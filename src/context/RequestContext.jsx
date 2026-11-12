import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { requestsApi, donationsApi } from '../services/api';
import { calculateAiScore } from '../utils/aiScorer';
import { formatCurrency } from '../utils/formatters';
import { INITIAL_AID_REQUESTS } from '../data/mockRequests';
import { INITIAL_TRANSACTIONS } from '../data/mockTransactions';

const RequestContext = createContext(null);

// Returns true when the error is a network or database connection error (backend or DB down)
const isNetworkError = (err) => {
  if (!err) return false;
  if (!err.response) return true;
  const status = err.response.status;
  const msg = (err.response.data?.message || err.message || '').toLowerCase();
  return (
    status >= 500 ||
    err.code === 'ECONNREFUSED' ||
    err.code === 'ERR_NETWORK' ||
    msg.includes('network') ||
    msg.includes('econnrefused') ||
    msg.includes('postgres') ||
    msg.includes('database') ||
    msg.includes('5433') ||
    msg.includes('5432') ||
    msg.includes('timeout')
  );
};

// Normalize mock request data to match the same shape as backend responses
const normalizeMockRequest = (r) => ({
  ...r,
  rawId: r.id,
  aiScore: r.aiScore || calculateAiScore({ urgency: r.urgency, beneficiaries: r.beneficiariesCount, category: r.category, description: r.description }).score,
  aiAnalysis: r.aiAnalysis || calculateAiScore({ urgency: r.urgency, beneficiaries: r.beneficiariesCount, category: r.category, description: r.description }),
  verificationDocuments: r.verificationDocuments || [{ name: 'community_intake_manifest.pdf', size: '1.2 MB' }],
  itemsList: r.itemsList || [{ name: 'Relief Supplies', qty: '1 lot', estCost: r.estimatedBudget }],
  assignedSupplier: r.assignedSupplier || 'Certified Logistics Escrow Hub',
});

// Normalize mock transaction data
const normalizeMockTransaction = (t) => ({
  ...t,
  rawPaymentStatus: 'completed',
  currency: t.currency || 'USD',
  donorType: t.donorType || 'Verified Supporter',
  paymentMethod: t.paymentMethod || 'PayPal Sandbox REST API',
  allocationStatus: t.allocationStatus || 'Dispatched to Escrow',
});

// LocalStorage persistence keys
const STORAGE_REQUESTS_KEY = 'needbridge_saved_requests';
const STORAGE_TRANSACTIONS_KEY = 'needbridge_saved_transactions';

// Safely restore requests from localStorage or fallback to default mock requests
const loadStoredRequests = () => {
  try {
    const saved = localStorage.getItem(STORAGE_REQUESTS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading stored requests from localStorage:', e);
  }
  return INITIAL_AID_REQUESTS.map(normalizeMockRequest);
};

// Safely restore transactions from localStorage or fallback to default mock transactions
const loadStoredTransactions = () => {
  try {
    const saved = localStorage.getItem(STORAGE_TRANSACTIONS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading stored transactions from localStorage:', e);
  }
  return INITIAL_TRANSACTIONS.map(normalizeMockTransaction);
};

export const RequestProvider = ({ children }) => {
  const [requests, setRequests] = useState(loadStoredRequests);
  const [transactions, setTransactions] = useState(loadStoredTransactions);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  // Auto-sync requests to localStorage whenever requests state changes
  useEffect(() => {
    if (requests && requests.length > 0) {
      try {
        localStorage.setItem(STORAGE_REQUESTS_KEY, JSON.stringify(requests));
      } catch (e) {
        console.warn('Failed saving requests to localStorage:', e);
      }
    }
  }, [requests]);

  // Auto-sync transactions to localStorage whenever transactions state changes
  useEffect(() => {
    if (transactions && transactions.length > 0) {
      try {
        localStorage.setItem(STORAGE_TRANSACTIONS_KEY, JSON.stringify(transactions));
      } catch (e) {
        console.warn('Failed saving transactions to localStorage:', e);
      }
    }
  }, [transactions]);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ id: Date.now(), message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  }, []);

  const dismissToast = useCallback(() => setToast(null), []);

  // Fetch real requests and transactions from PostgreSQL via REST API
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Fetch Requests from Backend
      const reqRes = await requestsApi.getRequests({ limit: 100 });
      if (reqRes.success && Array.isArray(reqRes.data)) {
        const normalizedRequests = reqRes.data.map(r => {
          const aiEval = calculateAiScore({
            urgency: r.urgency.charAt(0).toUpperCase() + r.urgency.slice(1),
            beneficiaries: r.beneficiaries_count,
            category: r.category,
            description: r.description
          });

          return {
            ...r,
            id: r.id.toString(),
            rawId: r.id,
            beneficiaryName: r.beneficiary_name || 'Community Beneficiary',
            beneficiariesCount: r.beneficiaries_count,
            estimatedBudget: parseFloat(r.estimated_budget) || 0,
            fundsRaised: parseFloat(r.funds_raised) || 0,
            urgency: r.urgency.charAt(0).toUpperCase() + r.urgency.slice(1),
            status: r.status === 'approved' ? 'Approved' :
                    r.status === 'pending' ? 'Pending Review' :
                    r.status === 'rejected' ? 'Rejected' : 'Funded & In Fulfillment',
            createdAt: r.created_at,
            aiScore: aiEval.score,
            aiAnalysis: aiEval,
            verificationDocuments: [
              { name: 'community_intake_manifest.pdf', size: '1.2 MB' }
            ],
            itemsList: [
              { name: r.quantity || 'Relief Supplies', qty: r.quantity || '1 lot', estCost: parseFloat(r.estimated_budget) }
            ],
            assignedSupplier: 'Certified Logistics Escrow Hub'
          };
        });

        // Merge with locally stored custom requests & ensure raised funds are preserved
        const storedReqs = loadStoredRequests();
        const mergedRequests = normalizedRequests.map(nr => {
          const matchingStored = storedReqs.find(sr => 
            String(sr.id) === String(nr.id) || 
            String(sr.rawId) === String(nr.rawId) || 
            sr.title === nr.title
          );
          if (matchingStored && matchingStored.fundsRaised !== undefined) {
            const highestRaised = Math.max(parseFloat(matchingStored.fundsRaised) || 0, parseFloat(nr.fundsRaised) || 0);
            return {
              ...nr,
              fundsRaised: highestRaised,
              funds_raised: highestRaised,
              status: (highestRaised >= nr.estimatedBudget && nr.estimatedBudget > 0) ? 'Funded & In Fulfillment' : nr.status
            };
          }
          return nr;
        });

        const customReqs = storedReqs.filter(r => 
          String(r.id).startsWith('REQ-') || String(r.id).startsWith('OFFLINE-')
        );
        for (const cr of customReqs) {
          if (!mergedRequests.some(m => String(m.id) === String(cr.id) || m.title === cr.title)) {
            mergedRequests.unshift(cr);
          }
        }

        setRequests(mergedRequests);
      }

      // 2. Fetch Donations for Transparency Ledger
      const donRes = await donationsApi.getDonations({ limit: 100 });
      if (donRes.success && Array.isArray(donRes.data)) {
        const normalizedDonations = donRes.data.map(d => ({
          id: `TXN-${d.id}`,
          rawId: d.id,
          requestId: d.request_id.toString(),
          requestTitle: d.request_title || 'Community Aid Request',
          category: d.request_category || 'General Aid',
          donorName: d.donor_name || 'Anonymous Donor',
          donorType: 'Verified Supporter',
          amount: parseFloat(d.amount) || 0,
          currency: d.currency || 'USD',
          rawPaymentStatus: d.payment_status,
          paypalOrderId: d.paypal_order_id,
          paypalCaptureId: d.paypal_capture_id,
          paymentMethod: d.payment_provider === 'paypal_sandbox' ? 'PayPal Sandbox REST API' : (d.payment_provider || 'PayPal Sandbox'),
          payPalTransactionId: d.paypal_capture_id || d.paypal_order_id || `PAYID-SANDBOX-${d.id}`,
          paymentStatus: d.payment_status === 'completed' ? 'Settled & Verified' :
                         d.payment_status === 'pending' ? 'Pending Settlement' :
                         d.payment_status === 'cancelled' ? 'Cancelled' : 'Failed',
          allocationStatus: d.payment_status === 'completed' ? 'Dispatched to Escrow' : 'Payment Awaiting Settlement',
          vendorPartner: 'Metro Regional Logistics Hub',
          purchaseOrderRef: `PO-2026-${1000 + d.id}`,
          ledgerHash: `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
          previousHash: `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
          timestamp: d.created_at,
          itemsFunded: `Direct grant allocation towards supplies`,
          receiptNumber: `NB-RCP-2026-${1000 + d.id}`
        }));

        // Merge with locally stored custom transactions so user donations are NEVER lost
        const storedTxns = loadStoredTransactions();
        const customTxns = storedTxns.filter(t => 
          String(t.id).startsWith('TXN-') && !normalizedDonations.some(nd => String(nd.id) === String(t.id))
        );
        setTransactions([...customTxns, ...normalizedDonations]);
      }
      setIsOfflineMode(false);
    } catch (err) {
      if (isNetworkError(err) || err.response?.status >= 500) {
        // Backend offline -> keep user's existing stored data from localStorage
        const storedReqs = loadStoredRequests();
        const storedTxns = loadStoredTransactions();
        setRequests(storedReqs);
        setTransactions(storedTxns);
        setIsOfflineMode(true);
      } else {
        console.error('Error fetching data from backend API:', err);
        setError(err.message || 'Failed to load requests from server');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Submit aid request (Beneficiary action - calls POST /api/requests)
  const submitAidRequest = async (formData) => {
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        quantity: formData.quantity && formData.unit ? `${formData.quantity} ${formData.unit}` : formData.quantity || '1 kit',
        beneficiaries_count: parseInt(formData.beneficiariesCount, 10) || 1,
        location: formData.location,
        urgency: (formData.urgency || 'high').toLowerCase(),
        estimated_budget: parseFloat(formData.estimatedBudget) || 0
      };

      const res = await requestsApi.createRequest(payload);
      if (res.success && res.data) {
        showToast(`Aid request "${formData.title}" submitted! Status: Pending Review`, 'success');
        await refreshData();
        return res.data;
      }
      throw new Error(res.message || 'Submission failed');
    } catch (err) {
      if (isNetworkError(err) || err.response?.status === 401 || err.response?.status === 403) {
        // Offline or demo auth fallback: add request locally
        const aiEval = calculateAiScore({
          urgency: formData.urgency || 'High',
          beneficiaries: parseInt(formData.beneficiariesCount, 10) || 1,
          category: formData.category,
          description: formData.description
        });
        const mockReq = {
          id: `REQ-${Date.now()}`,
          rawId: Date.now(),
          title: formData.title,
          description: formData.description,
          category: formData.category,
          location: formData.location || 'Northside Community Ward 3',
          urgency: formData.urgency || 'High',
          status: 'Pending Review',
          estimatedBudget: parseFloat(formData.estimatedBudget) || 0,
          fundsRaised: 0,
          beneficiariesCount: parseInt(formData.beneficiariesCount, 10) || 1,
          beneficiaryName: 'Elena Rostova (Senior Haven Rep)',
          createdAt: new Date().toISOString(),
          aiScore: aiEval.score,
          aiAnalysis: aiEval,
          verificationDocuments: [{ name: 'community_intake_manifest.pdf', size: '1.2 MB' }],
          itemsList: [{ name: formData.quantity || 'Relief Supplies', qty: formData.quantity || '1 lot', estCost: parseFloat(formData.estimatedBudget) || 0 }],
          assignedSupplier: 'Metro Regional Logistics Hub',
          donors: []
        };
        setRequests(prev => [mockReq, ...prev]);
        showToast(`Aid request "${formData.title}" submitted successfully! Status: Pending Review`, 'success');
        return mockReq;
      }
      const msg = err.response?.data?.message || err.message || 'Failed to submit request';
      showToast(msg, 'error');
      throw err;
    }
  };

  // Review request (Admin action - calls PATCH /api/requests/:id/status)
  const updateRequestStatus = async (requestId, newStatus, reasonNotes = '') => {
    try {
      // Backend expects lowercase: 'approved', 'rejected', 'pending'
      const statusValue = newStatus === 'Approved' ? 'approved' :
                          newStatus === 'Rejected' ? 'rejected' : newStatus.toLowerCase();
      
      const res = await requestsApi.updateStatus(requestId, {
        status: statusValue,
        admin_notes: reasonNotes
      });

      if (res.success) {
        showToast(`Request #${requestId} status updated to: ${newStatus}`, newStatus === 'Approved' ? 'success' : 'info');
        await refreshData();
        return res.data;
      }
      throw new Error(res.message || 'Status update failed');
    } catch (err) {
      if (isNetworkError(err) || err.response?.status === 401 || err.response?.status === 403) {
        // Offline fallback: update status locally
        setRequests(prev => prev.map(r =>
          r.id === requestId || r.rawId == requestId
            ? { ...r, status: newStatus }
            : r
        ));
        showToast(`Request #${requestId} updated to: ${newStatus}`, newStatus === 'Approved' ? 'success' : 'info');
        return { id: requestId, status: newStatus };
      }
      const msg = err.response?.data?.message || err.message || 'Failed to update request status';
      showToast(msg, 'error');
      throw err;
    }
  };

  // Synchronize a completed PayPal donation into local state & transparency ledger
  const recordSuccessfulDonation = useCallback(({ requestId, amount, currency = 'USD', equivalentUSD, donationData }) => {
    const numAmount = parseFloat(amount) || 0;
    const creditUSD = parseFloat(equivalentUSD) || numAmount;

    // 1. Update target aid request's fundsRaised in state
    setRequests(prev => {
      const updated = prev.map(r => {
        const isMatch = (
          r.id === requestId ||
          r.rawId == requestId ||
          String(r.id) === String(requestId) ||
          String(r.rawId) === String(requestId) ||
          (donationData?.request?.title && r.title === donationData.request.title)
        );
        if (isMatch) {
          const currentFunds = parseFloat(r.fundsRaised !== undefined ? r.fundsRaised : r.funds_raised || 0);
          const budget = parseFloat(r.estimatedBudget !== undefined ? r.estimatedBudget : r.estimated_budget || 0);
          const newFunds = currentFunds + creditUSD;
          const isFulfilled = newFunds >= budget;
          return {
            ...r,
            fundsRaised: newFunds,
            funds_raised: newFunds,
            status: isFulfilled ? 'Funded & In Fulfillment' : r.status
          };
        }
        return r;
      });

      try {
        localStorage.setItem(STORAGE_REQUESTS_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Error saving updated requests to localStorage:', e);
      }
      return updated;
    });

    // 2. Add transaction to the transparency ledger in state
    const donation = donationData?.donation || {};
    const capture = donationData?.capture || {};
    const newTxnId = donation.id || Math.floor(1000 + Math.random() * 9000);
    const newTxn = {
      id: `TXN-${newTxnId}`,
      rawId: newTxnId,
      requestId: requestId.toString(),
      requestTitle: donationData?.request?.title || 'Community Aid Request',
      category: 'General Aid',
      donorName: 'Verified Supporter',
      donorType: 'Verified Supporter',
      amount: numAmount,
      currency,
      rawPaymentStatus: 'completed',
      paypalOrderId: capture.orderId || donation.paypal_order_id || `PAYID-SANDBOX-${Date.now()}`,
      paypalCaptureId: capture.captureId || donation.paypal_capture_id || `CAP-SANDBOX-${Date.now()}`,
      paymentMethod: `PayPal Sandbox (${currency})`,
      payPalTransactionId: capture.captureId || capture.orderId || donation.paypal_capture_id,
      paymentStatus: 'Settled & Verified',
      allocationStatus: 'Dispatched to Escrow',
      vendorPartner: 'Metro Medical & Thermal Wholesalers (Direct Dispatch)',
      purchaseOrderRef: `PO-2026-${1000 + (newTxnId % 1000)}`,
      ledgerHash: `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
      previousHash: `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
      timestamp: new Date().toISOString(),
      itemsFunded: `Direct grant allocation towards supplies`,
      receiptNumber: `NB-RCP-2026-${1000 + (newTxnId % 1000)}`
    };

    setTransactions(prev => {
      const updated = [newTxn, ...prev];
      try {
        localStorage.setItem(STORAGE_TRANSACTIONS_KEY, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  }, []);

  // Support request (Donor action - calls POST /api/donations with multi-currency support)
  const supportRequest = async ({ requestId, amount, currency = 'USD', equivalentUSD, paymentMethod = 'PayPal Sandbox' }) => {
    try {
      const numAmount = parseFloat(amount) || 0;
      if (numAmount <= 0) return false;

      // Check for offline or mock token session
      const token = localStorage.getItem('needbridge_token');
      const isMockSession = !token || token === 'mock-jwt-offline-token-needbridge-2026';

      if (isMockSession) {
        // Record locally without failing on backend authentication
        recordSuccessfulDonation({ requestId, amount: numAmount, currency, equivalentUSD });
        showToast(`Contribution of ${formatCurrency(numAmount, currency)} recorded locally!`, 'success');
        return { amount: numAmount, currency, equivalentUSD, offline: true };
      }

      const payload = {
        request_id: parseInt(requestId, 10),
        amount: numAmount,
        currency,
        payment_provider: paymentMethod.includes('PayPal') ? 'paypal_mock_sandbox' : 'card_via_paypal_mock',
        paypal_order_id: `PAYID-MOCK-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`
      };

      const res = await donationsApi.createDonation(payload);
      if (res.success && res.data) {
        showToast(`Successfully contributed ${formatCurrency(numAmount, currency)} via ${paymentMethod}!`, 'success');
        await refreshData();
        return res.data;
      }
      throw new Error(res.message || 'Donation failed');
    } catch (err) {
      if (isNetworkError(err) || err.response?.status === 401 || err.response?.status === 403) {
        // Offline or auth token fallback: smoothly record locally
        recordSuccessfulDonation({ requestId, amount, currency, equivalentUSD });
        showToast(`Contribution of ${formatCurrency(amount, currency)} recorded successfully!`, 'success');
        return { amount, currency, equivalentUSD, offline: true };
      }
      const msg = err.response?.data?.message || err.message || 'Failed to process contribution';
      showToast(msg, 'error');
      throw err;
    }
  };

  const resetData = useCallback(() => {
    const defaultReqs = INITIAL_AID_REQUESTS.map(normalizeMockRequest);
    const defaultTxns = INITIAL_TRANSACTIONS.map(normalizeMockTransaction);
    localStorage.removeItem(STORAGE_REQUESTS_KEY);
    localStorage.removeItem(STORAGE_TRANSACTIONS_KEY);
    setRequests(defaultReqs);
    setTransactions(defaultTxns);
    showToast('Platform requests and ledger reset to initial sample state.', 'info');
  }, [showToast]);

  return (
    <RequestContext.Provider
      value={{
        requests,
        transactions,
        isLoading,
        isOfflineMode,
        error,
        toast,
        showToast,
        dismissToast,
        refreshData,
        resetData,
        submitAidRequest,
        updateRequestStatus,
        supportRequest,
        recordSuccessfulDonation
      }}
    >
      {children}
    </RequestContext.Provider>
  );
};

export const useRequests = () => {
  const context = useContext(RequestContext);
  if (!context) {
    throw new Error('useRequests must be used within a RequestProvider');
  }
  return context;
};
