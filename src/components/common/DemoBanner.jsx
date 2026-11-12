import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRequests } from '../../context/RequestContext';
import { RotateCcw, ShieldCheck, UserCheck, Heart, Compass } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DemoBanner = () => {
  const { role, quickDemoLogin, logout } = useAuth();
  const { refreshData } = useRequests();
  const navigate = useNavigate();
  const [isSwitching, setIsSwitching] = useState(false);

  const handleRoleClick = async (newRole) => {
    setIsSwitching(true);
    try {
      await quickDemoLogin(newRole);
      if (newRole === 'beneficiary') navigate('/beneficiary');
      else if (newRole === 'donor') navigate('/donor');
      else if (newRole === 'admin') navigate('/admin');
    } catch (e) {
      console.error('Quick demo login error:', e);
    } finally {
      setIsSwitching(false);
    }
  };

  const handleOverviewClick = () => {
    if (logout) logout();
    navigate('/');
  };

  return (
    <div className="bg-slate-900 text-slate-200 border-b border-slate-800 text-xs py-1.5 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2 text-slate-400">
          <span className="font-semibold text-slate-300">Switch Persona:</span>
          <span className="text-[11px] hidden sm:inline text-slate-500">
            Select a role to preview only that portal & hide other content
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Public Overview (Shown when no persona chosen, or to reset) */}
          <button
            type="button"
            disabled={isSwitching}
            onClick={handleOverviewClick}
            className={`px-3 py-1 rounded-md font-medium text-xs transition-colors flex items-center space-x-1.5 cursor-pointer ${
              !role
                ? 'bg-teal-600 text-white shadow-xs font-semibold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Public Overview</span>
          </button>

          {/* Beneficiary */}
          <button
            type="button"
            disabled={isSwitching}
            onClick={() => handleRoleClick('beneficiary')}
            className={`px-3 py-1 rounded-md font-medium text-xs transition-colors flex items-center space-x-1.5 cursor-pointer ${
              role === 'beneficiary'
                ? 'bg-teal-600 text-white shadow-xs font-semibold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Beneficiary</span>
          </button>

          {/* Donor */}
          <button
            type="button"
            disabled={isSwitching}
            onClick={() => handleRoleClick('donor')}
            className={`px-3 py-1 rounded-md font-medium text-xs transition-colors flex items-center space-x-1.5 cursor-pointer ${
              role === 'donor'
                ? 'bg-teal-600 text-white shadow-xs font-semibold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            <span>Donor</span>
          </button>

          {/* Admin */}
          <button
            type="button"
            disabled={isSwitching}
            onClick={() => handleRoleClick('admin')}
            className={`px-3 py-1 rounded-md font-medium text-xs transition-colors flex items-center space-x-1.5 cursor-pointer ${
              role === 'admin'
                ? 'bg-teal-600 text-white shadow-xs font-semibold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>

          <button
            type="button"
            onClick={() => refreshData()}
            title="Refresh Live Data"
            className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors ml-1 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
