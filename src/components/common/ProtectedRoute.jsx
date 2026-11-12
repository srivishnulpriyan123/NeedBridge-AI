import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sparkles } from 'lucide-react';

export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, role, currentUser, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center bg-slate-50 space-y-3">
        <div className="w-10 h-10 border-3 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-semibold text-slate-500 animate-pulse">
          Verifying security credentials...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const effectiveRole = role || currentUser?.role;

  if (allowedRoles.length > 0 && effectiveRole && !allowedRoles.includes(effectiveRole)) {
    // Redirect to the appropriate home dashboard for their actual role
    if (effectiveRole === 'admin') return <Navigate to="/admin" replace />;
    if (effectiveRole === 'beneficiary') return <Navigate to="/beneficiary" replace />;
    return <Navigate to="/donor" replace />;
  }

  return children;
};

