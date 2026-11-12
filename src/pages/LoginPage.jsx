import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRequests } from '../context/RequestContext';
import {
  HeartHandshake,
  ShieldCheck,
  UserCheck,
  Heart,
  ArrowRight,
  Sparkles,
  Lock,
  Mail,
  AlertCircle
} from 'lucide-react';

export const LoginPage = () => {
  const { login, quickDemoLogin, demoCredentials } = useAuth();
  const { showToast } = useRequests();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('donor');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleQuickLogin = async (roleKey) => {
    setError('');
    setLoading(true);
    try {
      const user = await quickDemoLogin(roleKey);
      showToast(`Authenticated as ${user.name} (${user.role.toUpperCase()})`, 'success');
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'beneficiary') navigate('/beneficiary');
      else navigate('/donor');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const user = await login({ email, password, role: selectedRole });
      showToast(`Welcome back, ${user.name}!`, 'success');
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'beneficiary') navigate('/beneficiary');
      else navigate('/donor');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Authentication failed. Please check credentials.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 flex items-center justify-center p-4 py-12">
      <div className="max-w-md w-full space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center space-x-2">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-teal-400 shadow-sm">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
              NeedBridge <span className="text-teal-600">AI</span>
            </span>
          </Link>
          <h2 className="text-xl font-bold text-slate-900">Sign in to your account</h2>
          <p className="text-xs text-slate-500">
            Choose a demo persona or enter credentials below
          </p>
        </div>

        {/* 1-Click Quick Demo Sign In Box */}
        <div className="bg-white rounded-2xl p-5 border border-teal-200/90 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-teal-900 uppercase tracking-wider flex items-center">
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-teal-600" />
              1-Click Demo Evaluation Roles
            </span>
            <span className="text-[10px] bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full font-bold">
              Instant
            </span>
          </div>

          <p className="text-[11px] text-slate-500 mb-3">
            Quickly test the platform from any user perspective without typing:
          </p>

          <div className="grid grid-cols-1 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('donor')}
              className="w-full text-left p-2.5 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/40 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-100/60 text-teal-700 flex items-center justify-center">
                  <Heart className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 group-hover:text-teal-700">
                    Donor Persona <span className="text-slate-500 font-normal">(Dr. Jane Chen)</span>
                  </div>
                  <div className="text-[10px] text-slate-400">Browse & fund urgent needs with PayPal</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-0.5 transition-all" />
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('beneficiary')}
              className="w-full text-left p-2.5 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/40 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100/60 text-emerald-700 flex items-center justify-center">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 group-hover:text-teal-700">
                    Beneficiary Persona <span className="text-slate-500 font-normal">(Elena Rostova)</span>
                  </div>
                  <div className="text-[10px] text-slate-400">Submit aid requests & track AI score</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-0.5 transition-all" />
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('admin')}
              className="w-full text-left p-2.5 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/40 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 group-hover:text-teal-700">
                    Admin Auditor <span className="text-slate-500 font-normal">(Sarah Al-Mansoor)</span>
                  </div>
                  <div className="text-[10px] text-slate-400">Review intake queue & approve requests</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-0.5 transition-all" />
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-slate-50 px-3 text-slate-400 font-medium tracking-wider">
              Or sign in with custom credentials
            </span>
          </div>
        </div>

        {/* Standard Credentials Form */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-subtle">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Role Tab Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Sign in Role
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['donor', 'beneficiary', 'admin'].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      setSelectedRole(r);
                      if (demoCredentials && demoCredentials[r]) {
                        setEmail(demoCredentials[r].email);
                        setPassword(demoCredentials[r].password);
                      }
                    }}
                    className={`py-1.5 text-xs font-bold capitalize rounded-lg border transition-all ${
                      selectedRole === r
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="email"
                  placeholder="e.g. user@needbridge.ai"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors flex items-center justify-center space-x-2"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In as {selectedRole.toUpperCase()}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold text-teal-600 hover:text-teal-700">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
