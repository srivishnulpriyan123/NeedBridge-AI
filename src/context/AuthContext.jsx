import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

// Preset demo credentials corresponding to the PostgreSQL seeded accounts
export const DEMO_CREDENTIALS = {
  admin: {
    email: 'admin@needbridge.ai',
    password: 'AdminPass123!',
    role: 'admin',
    name: 'Sarah Al-Mansoor (Lead Auditor)'
  },
  beneficiary: {
    email: 'elena@communityaid.org',
    password: 'BeneficiaryPass123!',
    role: 'beneficiary',
    name: 'Elena Rostova (Senior Haven Rep)'
  },
  donor: {
    email: 'dr.jane@healthtrust.org',
    password: 'DonorPass123!',
    role: 'donor',
    name: 'Dr. Jane Chen (HealthTrust)'
  }
};

// ─── Offline / Mock fallback users ───────────────────────────────────────────
const MOCK_USERS = [
  { id: 1, name: 'Sarah Al-Mansoor (Lead Auditor)',   email: 'admin@needbridge.ai',       password: 'AdminPass123!',       role: 'admin' },
  { id: 2, name: 'Elena Rostova (Senior Haven Rep)',  email: 'elena@communityaid.org',    password: 'BeneficiaryPass123!', role: 'beneficiary' },
  { id: 3, name: 'Marcus Vance (Riverside Community)',email: 'marcus@riverside.org',      password: 'BeneficiaryPass123!', role: 'beneficiary' },
  { id: 4, name: 'Dr. Jane Chen (HealthTrust)',       email: 'dr.jane@healthtrust.org',   password: 'DonorPass123!',       role: 'donor' },
  { id: 5, name: 'Sarah Jenkins (Greenleaf Trust)',   email: 'sarah.j@greenleaf.org',     password: 'DonorPass123!',       role: 'donor' },
];

const MOCK_TOKEN = 'mock-jwt-offline-token-needbridge-2026';

// Returns true when the error is a network or database connection error
const isNetworkError = (err) => {
  if (!err) return false;
  if (!err.response) return true; // Network error (server offline)
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

const getRoleAvatar = (role, name) => {
  if (role === 'admin') {
    return 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80';
  }
  if (role === 'beneficiary') {
    return 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80';
  }
  return 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('needbridge_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('needbridge_token') || null;
  });

  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  // Synchronize and re-verify session with backend on initial load
  const verifySession = useCallback(async () => {
    const savedToken = localStorage.getItem('needbridge_token');
    if (!savedToken) {
      setCurrentUser(null);
      setToken(null);
      setIsLoading(false);
      return;
    }

    // Offline mock token — restore session from localStorage directly
    if (savedToken === MOCK_TOKEN) {
      const savedUser = localStorage.getItem('needbridge_user');
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
        setToken(savedToken);
        setIsOfflineMode(true);
      } else {
        localStorage.removeItem('needbridge_token');
        setToken(null);
      }
      setIsLoading(false);
      return;
    }

    try {
      const res = await authApi.getProfile();
      if (res.success && res.data?.user) {
        const enrichedUser = {
          ...res.data.user,
          avatar: getRoleAvatar(res.data.user.role, res.data.user.name)
        };
        setCurrentUser(enrichedUser);
        setMetrics(res.data.metrics || null);
        setIsOfflineMode(false);
        localStorage.setItem('needbridge_user', JSON.stringify(enrichedUser));
      }
    } catch (err) {
      if (isNetworkError(err)) {
        // Backend is down — keep the saved user session alive in offline mode
        const savedUser = localStorage.getItem('needbridge_user');
        if (savedUser) {
          console.warn('[NeedBridge] Backend unreachable. Restoring offline session.');
          setCurrentUser(JSON.parse(savedUser));
          setToken(savedToken);
          setIsOfflineMode(true);
        } else {
          localStorage.removeItem('needbridge_token');
          localStorage.removeItem('needbridge_user');
          setCurrentUser(null);
          setToken(null);
        }
      } else {
        console.warn('Session verification failed or token expired:', err.message);
        localStorage.removeItem('needbridge_token');
        localStorage.removeItem('needbridge_user');
        setCurrentUser(null);
        setToken(null);
        setMetrics(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    verifySession();

    // Listen to token expiration dispatched by axios interceptor
    const handleExpired = () => {
      setCurrentUser(null);
      setToken(null);
      setMetrics(null);
      setIsOfflineMode(false);
    };

    window.addEventListener('needbridge:auth-expired', handleExpired);
    return () => window.removeEventListener('needbridge:auth-expired', handleExpired);
  }, [verifySession]);

  // ── Mock login helper (used when backend or database is offline) ─────────
  const mockLogin = ({ email, password, role: explicitRole }) => {
    const normalizedEmail = email.toLowerCase().trim();
    let user = MOCK_USERS.find(
      (u) => u.email === normalizedEmail && u.password === password
    );

    if (user && explicitRole) {
      user = { ...user, role: explicitRole };
    }

    if (!user) {
      // Check DEMO_CREDENTIALS
      const demoEntry = Object.values(DEMO_CREDENTIALS).find(d => d.email.toLowerCase() === normalizedEmail);
      if (demoEntry) {
        user = {
          id: Math.floor(Math.random() * 1000) + 1,
          name: demoEntry.name,
          email: demoEntry.email,
          role: explicitRole || demoEntry.role
        };
      } else if (password && password.length >= 6) {
        // Fallback for custom user credentials entered in form
        const role = explicitRole || (normalizedEmail.includes('admin')
          ? 'admin'
          : normalizedEmail.includes('elena') || normalizedEmail.includes('beneficiary') || normalizedEmail.includes('community')
          ? 'beneficiary'
          : 'donor');
        const rawName = normalizedEmail.split('@')[0];
        const formattedName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
        user = {
          id: Date.now(),
          name: formattedName,
          email: normalizedEmail,
          role
        };
      }
    }

    if (!user) {
      throw new Error('Invalid email or password.');
    }

    const { password: _pw, ...safeUser } = user;
    const enrichedUser = { ...safeUser, avatar: getRoleAvatar(safeUser.role, safeUser.name) };

    localStorage.setItem('needbridge_token', MOCK_TOKEN);
    localStorage.setItem('needbridge_user', JSON.stringify(enrichedUser));
    setToken(MOCK_TOKEN);
    setCurrentUser(enrichedUser);
    setIsOfflineMode(true);
    return enrichedUser;
  };

  // ── Mock register helper ──────────────────────────────────────────────────
  const mockRegister = ({ name, email, password, role }) => {
    const normalizedEmail = email.toLowerCase().trim();
    const existing = MOCK_USERS.find((u) => u.email === normalizedEmail);
    if (existing) throw new Error('An account with this email already exists.');

    const newUser = { id: Date.now(), name: name.trim(), email: normalizedEmail, role: role || 'beneficiary' };
    const enrichedUser = { ...newUser, avatar: getRoleAvatar(role || 'beneficiary', name) };

    localStorage.setItem('needbridge_token', MOCK_TOKEN);
    localStorage.setItem('needbridge_user', JSON.stringify(enrichedUser));
    setToken(MOCK_TOKEN);
    setCurrentUser(enrichedUser);
    setIsOfflineMode(true);
    return enrichedUser;
  };

  // Real backend login — falls back to mock if backend is unreachable
  const login = async ({ email, password, role }) => {
    try {
      const res = await authApi.login({ email, password });
      if (res.success && res.data) {
        const { user, token: jwtToken } = res.data;
        const userRole = role || user.role;
        const enrichedUser = {
          ...user,
          role: userRole,
          avatar: getRoleAvatar(userRole, user.name)
        };

        localStorage.setItem('needbridge_token', jwtToken);
        localStorage.setItem('needbridge_user', JSON.stringify(enrichedUser));
        setToken(jwtToken);
        setCurrentUser(enrichedUser);
        setIsOfflineMode(false);

        // Fetch profile metrics asynchronously
        try {
          const profileRes = await authApi.getProfile();
          if (profileRes.success && profileRes.data?.metrics) {
            setMetrics(profileRes.data.metrics);
          }
        } catch (e) {}

        return enrichedUser;
      }
      throw new Error(res.message || 'Login failed');
    } catch (err) {
      if (isNetworkError(err)) {
        console.warn('[NeedBridge] Backend offline — using mock login.');
        return mockLogin({ email, password, role });
      }
      throw err;
    }
  };

  // Real backend registration — falls back to mock if backend is unreachable
  const register = async ({ name, email, password, role }) => {
    try {
      const res = await authApi.register({ name, email, password, role });
      if (res.success && res.data) {
        const { user, token: jwtToken } = res.data;
        const enrichedUser = {
          ...user,
          avatar: getRoleAvatar(user.role, user.name)
        };

        localStorage.setItem('needbridge_token', jwtToken);
        localStorage.setItem('needbridge_user', JSON.stringify(enrichedUser));
        setToken(jwtToken);
        setCurrentUser(enrichedUser);
        setIsOfflineMode(false);
        return enrichedUser;
      }
      throw new Error(res.message || 'Registration failed');
    } catch (err) {
      if (isNetworkError(err)) {
        console.warn('[NeedBridge] Backend offline — using mock register.');
        return mockRegister({ name, email, password, role });
      }
      throw err;
    }
  };

  // Quick 1-click Demo Login for Hackathon Judges
  const quickDemoLogin = async (roleKey = 'donor') => {
    const creds = DEMO_CREDENTIALS[roleKey] || DEMO_CREDENTIALS.donor;
    return await login({ email: creds.email, password: creds.password, role: creds.role });
  };

  // Switch demo persona or explore as role
  const switchRole = async (roleKey = 'donor') => {
    try {
      return await quickDemoLogin(roleKey);
    } catch (err) {
      console.warn('switchRole fallback error:', err);
    }
  };

  const logout = () => {
    localStorage.removeItem('needbridge_token');
    localStorage.removeItem('needbridge_user');
    setCurrentUser(null);
    setToken(null);
    setMetrics(null);
    setIsOfflineMode(false);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role: currentUser?.role || null,
        token,
        isAuthenticated: !!currentUser && !!token,
        isLoading,
        isOfflineMode,
        metrics,
        login,
        register,
        quickDemoLogin,
        switchRole,
        logout,
        verifySession,
        demoCredentials: DEMO_CREDENTIALS
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
