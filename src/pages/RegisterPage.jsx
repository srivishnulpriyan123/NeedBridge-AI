import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRequests } from '../context/RequestContext';
import {
  HeartHandshake,
  UserCheck,
  Heart,
  ArrowRight,
  ShieldCheck,
  Lock,
  Mail,
  User,
  AlertCircle
} from 'lucide-react';

export const RegisterPage = () => {
  const { register } = useAuth();
  const { showToast } = useRequests();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('donor');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please provide your full or organization name.');
      return;
    }

    if (!email || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }

    if (!password || password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const user = await register({
        name: name.trim(),
        email: email.trim(),
        password,
        role
      });
      showToast(`Account created successfully! Welcome to NeedBridge AI, ${user.name}.`, 'success');
      if (user.role === 'beneficiary') navigate('/beneficiary');
      else navigate('/donor');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Registration failed';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 flex items-center justify-center p-4 py-12">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center space-x-2">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-teal-400 shadow-sm">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
              NeedBridge <span className="text-teal-600">AI</span>
            </span>
          </Link>
          <h2 className="text-xl font-bold text-slate-900">Create your community account</h2>
          <p className="text-xs text-slate-500">
            Join as a verified beneficiary coordinator or a supporting donor
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-card">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Role Switcher Cards */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                I am joining NeedBridge AI as:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div
                  onClick={() => setRole('donor')}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    role === 'donor'
                      ? 'border-teal-600 bg-teal-50/50 ring-2 ring-teal-500/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <Heart className="w-5 h-5 text-teal-600 mb-1" />
                  <p className="text-xs font-bold text-slate-900">Donor / Sponsor</p>
                  <p className="text-[10px] text-slate-500">Fund verified community needs</p>
                </div>

                <div
                  onClick={() => setRole('beneficiary')}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    role === 'beneficiary'
                      ? 'border-teal-600 bg-teal-50/50 ring-2 ring-teal-500/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <UserCheck className="w-5 h-5 text-teal-600 mb-1" />
                  <p className="text-xs font-bold text-slate-900">Beneficiary / NGO</p>
                  <p className="text-[10px] text-slate-500">Request essential relief supplies</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Full Name or Organization Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. Elena Rostova or Hope Center"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
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
                  placeholder="name@example.org"
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
                  placeholder="At least 6 characters"
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
                <span>Registering Account...</span>
              ) : (
                <>
                  <span>Create {role === 'donor' ? 'Donor' : 'Beneficiary'} Account</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            Already registered?{' '}
            <Link to="/login" className="font-bold text-teal-600 hover:text-teal-700">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
