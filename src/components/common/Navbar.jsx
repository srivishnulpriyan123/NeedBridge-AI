import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldAlert,
  Compass,
  FilePlus2,
  FileCheck2,
  LogOut,
  LogIn,
  Menu,
  X,
  Sparkles,
  HeartHandshake,
  Layers,
  Boxes,
  ChevronDown
} from 'lucide-react';

export const Navbar = () => {
  const { currentUser, role, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
    setUserDropdownOpen(false);
  };

  const getDashboardPath = () => {
    if (role === 'admin') return '/admin';
    if (role === 'beneficiary') return '/beneficiary';
    return '/donor';
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-teal-400 group-hover:scale-105 transition-transform shadow-sm">
              <HeartHandshake className="w-5 h-5 text-teal-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-extrabold tracking-tight text-slate-900 flex items-center">
                NeedBridge <span className="ml-1 text-teal-600">AI</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 -mt-1">
                Transparent Community Aid
              </span>
            </div>
          </Link>

          {/* Desktop Navigation - Filtered by active persona */}
          <nav className="hidden lg:flex items-center space-x-1 lg:space-x-2">
            {/* Beneficiary Portal Links */}
            {role === 'beneficiary' && (
              <>
                <Link
                  to="/beneficiary"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                    isActive('/beneficiary')
                      ? 'bg-teal-50 text-teal-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <FileCheck2 className="w-4 h-4 text-teal-600" />
                  <span>My Aid Requests</span>
                </Link>

                <Link
                  to="/beneficiary/new-request"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                    isActive('/beneficiary/new-request')
                      ? 'bg-teal-50 text-teal-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <FilePlus2 className="w-4 h-4 text-teal-600" />
                  <span>Submit Need Request</span>
                </Link>
              </>
            )}

            {/* Donor Portal Links */}
            {role === 'donor' && (
              <Link
                to="/donor"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                  isActive('/donor')
                    ? 'bg-teal-50 text-teal-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <Compass className="w-4 h-4 text-teal-600" />
                <span>Explore & Fund Needs</span>
              </Link>
            )}

            {/* Admin Portal Links */}
            {role === 'admin' && (
              <>
                <Link
                  to="/admin"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                    isActive('/admin')
                      ? 'bg-teal-50 text-teal-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4 text-teal-600" />
                  <span>Admin Audit Queue</span>
                </Link>
                <Link
                  to="/donor"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                    isActive('/donor')
                      ? 'bg-teal-50 text-teal-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <Compass className="w-4 h-4 text-teal-600" />
                  <span>All Active Requests</span>
                </Link>
              </>
            )}

            {/* Visitor (No Role) Links */}
            {!role && (
              <Link
                to="/donor"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                  isActive('/donor')
                    ? 'bg-teal-50 text-teal-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <Compass className="w-4 h-4 text-teal-600" />
                <span>Explore Needs</span>
              </Link>
            )}

            {/* Shared Transparency Ledger */}
            <Link
              to="/transparency"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                isActive('/transparency')
                  ? 'bg-teal-50 text-teal-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <Layers className="w-4 h-4 text-teal-600" />
              <span>Transparency Ledger</span>
            </Link>

            {/* Supplies Catalogue */}
            <Link
              to="/catalogue"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                isActive('/catalogue')
                  ? 'bg-teal-50 text-teal-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <Boxes className="w-4 h-4 text-teal-600" />
              <span>Supplies Catalogue</span>
            </Link>
          </nav>

          {/* Desktop Right Side / Profile */}
          <div className="hidden lg:flex items-center space-x-3">
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2.5 p-1.5 rounded-xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
                >
                  <img
                    src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-teal-500/40"
                  />
                  <div className="text-left text-xs">
                    <div className="font-semibold text-slate-800 leading-tight">{currentUser.name}</div>
                    <div className="capitalize text-slate-400 font-medium text-[11px] flex items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mr-1"></span>
                      {role}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-card border border-slate-200/90 py-1.5 z-50 animate-in fade-in slide-in-from-top-2"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-900">{currentUser.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                      <span className="mt-1 inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-teal-50 text-teal-700">
                        {role} Mode
                      </span>
                    </div>

                    <Link
                      to={getDashboardPath()}
                      onClick={() => setUserDropdownOpen(false)}
                      className="block px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-teal-700"
                    >
                      Open {role ? role.charAt(0).toUpperCase() + role.slice(1) : ''} Dashboard
                    </Link>

                    <Link
                      to="/transparency"
                      onClick={() => setUserDropdownOpen(false)}
                      className="block px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-teal-700"
                    >
                      Audit Ledger & Receipts
                    </Link>

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center space-x-1.5"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 rounded-lg text-sm font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-sm"
                >
                  Join NeedBridge
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2">
          {/* Beneficiary Links */}
          {role === 'beneficiary' && (
            <>
              <Link
                to="/beneficiary"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 p-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <FileCheck2 className="w-4 h-4 text-teal-600" />
                <span>My Aid Requests</span>
              </Link>
              <Link
                to="/beneficiary/new-request"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 p-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <FilePlus2 className="w-4 h-4 text-teal-600" />
                <span>Submit Need Request</span>
              </Link>
            </>
          )}

          {/* Donor Links */}
          {role === 'donor' && (
            <Link
              to="/donor"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-2 p-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <Compass className="w-4 h-4 text-teal-600" />
              <span>Explore & Fund Needs</span>
            </Link>
          )}

          {/* Admin Links */}
          {role === 'admin' && (
            <>
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 p-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <ShieldAlert className="w-4 h-4 text-teal-600" />
                <span>Admin Review Queue</span>
              </Link>
              <Link
                to="/donor"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 p-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <Compass className="w-4 h-4 text-teal-600" />
                <span>All Active Requests</span>
              </Link>
            </>
          )}

          {/* Visitor Links */}
          {!role && (
            <Link
              to="/donor"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-2 p-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <Compass className="w-4 h-4 text-teal-600" />
              <span>Explore Aid Needs</span>
            </Link>
          )}

          {/* Shared Links */}
          <Link
            to="/transparency"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center space-x-2 p-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Layers className="w-4 h-4 text-teal-600" />
            <span>Transparency Ledger</span>
          </Link>
          <Link
            to="/catalogue"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center space-x-2 p-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Boxes className="w-4 h-4 text-teal-600" />
            <span>Supplies Catalogue</span>
          </Link>

          <div className="pt-3 border-t border-slate-100">
            {currentUser ? (
              <div className="space-y-2">
                <div className="flex items-center space-x-3 px-2 py-1">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm font-bold text-slate-900">{currentUser.name}</p>
                    <p className="text-xs text-slate-500 capitalize">{role} Role</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left p-2 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-lg flex items-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 rounded-lg bg-teal-600 text-sm font-semibold text-white"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

