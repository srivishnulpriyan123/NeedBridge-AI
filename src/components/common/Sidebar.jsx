import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  FilePlus2,
  ListOrdered,
  Layers,
  Heart,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ExternalLink
} from 'lucide-react';

export const Sidebar = ({ roleOverride }) => {
  const { role: currentRole, currentUser } = useAuth();
  const role = roleOverride || currentRole || 'donor';

  const beneficiaryLinks = [
    { to: '/beneficiary', label: 'My Requests', icon: LayoutDashboard, end: true },
    { to: '/beneficiary/new-request', label: 'Submit Aid Need', icon: FilePlus2 },
    { to: '/donor', label: 'Explore Community', icon: Heart },
    { to: '/transparency', label: 'Ledger Audit', icon: Layers }
  ];

  const donorLinks = [
    { to: '/donor', label: 'Active Aid Requests', icon: LayoutDashboard, end: true },
    { to: '/transparency', label: 'Public Ledger & Proof', icon: Layers },
    { to: '/beneficiary/new-request', label: 'Refer a Need', icon: FilePlus2 },
    { to: '/admin', label: 'Review Queue', icon: ShieldCheck }
  ];

  const adminLinks = [
    { to: '/admin', label: 'Verification Queue', icon: ShieldCheck, end: true },
    { to: '/donor', label: 'Approved Requests', icon: ListOrdered },
    { to: '/transparency', label: 'Financial Audit', icon: Layers }
  ];

  const links = role === 'admin' ? adminLinks : role === 'beneficiary' ? beneficiaryLinks : donorLinks;

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 min-h-[calc(100vh-64px)] hidden md:flex flex-col justify-between p-4">
      <div className="space-y-6">
        {/* User Card */}
        <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
          <div className="flex items-center space-x-3">
            <img
              src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
              alt={currentUser?.name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-teal-500/30"
            />
            <div className="overflow-hidden">
              <h4 className="text-xs font-bold text-slate-900 truncate">{currentUser?.name}</h4>
              <p className="text-[11px] text-slate-500 truncate">{currentUser?.organization || currentUser?.email}</p>
              <div className="mt-1 flex items-center">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded">
                  {role} portal
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Workspace Navigation
          </p>
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`
                }
              >
                <Icon className="w-4 h-4 text-teal-400" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Demo AI Matching Status widget */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-teal-50/60 to-slate-50 border border-teal-100">
          <div className="flex items-center justify-between text-xs font-semibold text-teal-900 mb-1.5">
            <span className="flex items-center">
              <span className="w-2 h-2 rounded-full bg-teal-500 mr-1.5"></span>
              AI Matching Engine
            </span>
            <span className="text-[10px] bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded font-mono">v1.4 Live</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Gemini priority engine running with 98.2% validation accuracy.
          </p>
          <div className="mt-3 pt-2.5 border-t border-teal-100/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>Avg Match Time:</span>
            <span className="font-bold text-teal-700">2.4h</span>
          </div>
        </div>
      </div>

      {/* Footer support note */}
      <div className="text-[11px] text-slate-400 pt-4 border-t border-slate-100">
        <p className="font-semibold text-slate-500">NeedBridge Platform v1.0</p>
        <p className="text-[10px] mt-0.5">Phase 1 Hackathon Showcase</p>
      </div>
    </aside>
  );
};

