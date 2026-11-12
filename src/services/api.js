import axios from 'axios';

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 15000
});

// Request Interceptor: Attach JWT Bearer Token & User Context if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('needbridge_token');
    const userStr = localStorage.getItem('needbridge_user');
    let user = null;
    if (userStr) {
      try {
        user = JSON.parse(userStr);
      } catch (e) {}
    }

    if (token) {
      if (user && (token.startsWith('mock-') || token.includes('offline'))) {
        config.headers.Authorization = `Bearer ${token}::${user.role || ''}::${encodeURIComponent(user.email || '')}`;
      } else {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Centralized error & 401 handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const currentToken = localStorage.getItem('needbridge_token');
      // Only clear and dispatch auth-expired if we are NOT using a mock offline session
      if (currentToken && currentToken !== 'mock-jwt-offline-token-needbridge-2026') {
        localStorage.removeItem('needbridge_token');
        localStorage.removeItem('needbridge_user');
        window.dispatchEvent(new Event('needbridge:auth-expired'));
      }
    }
    return Promise.reject(error);
  }
);

// ==========================================
// Authentication APIs
// ==========================================
export const authApi = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  }
};

// ==========================================
// Aid Requests APIs
// ==========================================
export const requestsApi = {
  getRequests: async (params = {}) => {
    const response = await api.get('/requests', { params });
    return response.data;
  },
  getRequestById: async (id) => {
    const response = await api.get(`/requests/${id}`);
    return response.data;
  },
  getMyRequests: async () => {
    const response = await api.get('/requests/my-requests');
    return response.data;
  },
  createRequest: async (requestData) => {
    const response = await api.post('/requests', requestData);
    return response.data;
  },
  updateRequest: async (id, updateData) => {
    const response = await api.put(`/requests/${id}`, updateData);
    return response.data;
  },
  updateStatus: async (id, statusData) => {
    const response = await api.patch(`/requests/${id}/status`, statusData);
    return response.data;
  }
};

// ==========================================
// Transparent Donations APIs
// ==========================================
export const donationsApi = {
  getDonations: async (params = {}) => {
    const response = await api.get('/donations', { params });
    return response.data;
  },
  getMyDonations: async () => {
    const response = await api.get('/donations/my-donations');
    return response.data;
  },
  createDonation: async (donationData) => {
    const response = await api.post('/donations', donationData);
    return response.data;
  }
};

// ==========================================
// Gemini AI & Supplies Catalogue APIs
// ==========================================
export const aiApi = {
  analyzeRequest: async (id) => {
    const response = await api.post(`/ai/analyze-request/${id}`);
    return response.data;
  },
  getAnalysis: async (requestId) => {
    const response = await api.get(`/ai/analysis/${requestId}`);
    return response.data;
  },
  matchRequest: async (id) => {
    const response = await api.post(`/ai/match-request/${id}`);
    return response.data;
  },
  getCatalogue: async (params = {}) => {
    const response = await api.get('/ai/catalogue', { params });
    return response.data;
  }
};

// ==========================================
// PayPal Developer Sandbox Payments APIs
// ==========================================
export const paymentApi = {
  getConfig: async () => {
    const response = await api.get('/payments/config');
    return response.data;
  },
  createOrder: async ({ requestId, amount }) => {
    const response = await api.post('/payments/create-order', {
      request_id: requestId,
      amount
    });
    return response.data;
  },
  captureOrder: async (orderId) => {
    const response = await api.post('/payments/capture-order', {
      order_id: orderId
    });
    return response.data;
  },
  cancelOrder: async (orderId) => {
    const response = await api.post('/payments/cancel-order', {
      order_id: orderId
    });
    return response.data;
  }
};

// ==========================================
// System Health
// ==========================================
export const healthApi = {
  checkHealth: async () => {
    const response = await api.get('/health');
    return response.data;
  }
};

export default api;

