import React from 'react';
import { Link } from 'react-router-dom';
import { HeartHandshake, ShieldCheck, Heart, Sparkles } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Info */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                NeedBridge <span className="text-teal-400">AI</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Empowering communities by connecting real human needs with generous donors through intelligent AI prioritization and transparent cryptographic tracking.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/donor" className="hover:text-teal-400 transition-colors">
                  Explore Active Needs
                </Link>
              </li>
              <li>
                <Link to="/beneficiary/new-request" className="hover:text-teal-400 transition-colors">
                  Submit Aid Request
                </Link>
              </li>
              <li>
                <Link to="/transparency" className="hover:text-teal-400 transition-colors">
                  Public Ledger & Proof
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-teal-400 transition-colors">
                  Admin Verification Queue
                </Link>
              </li>
            </ul>
          </div>

          {/* Core Pillars */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Platform Pillars</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0" />
                <span>AI Automated Urgency & Fraud Scoring</span>
              </li>
              <li className="flex items-center space-x-2">
                <Heart className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Direct Supplier Matching (No Cash Diversion)</span>
              </li>
              <li className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Cryptographically Hashed Payment Ledger</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <div>
            &copy; {new Date().getFullYear()} NeedBridge AI. All rights reserved. Open-source community aid infrastructure.
          </div>
          <div className="flex space-x-4">
            <span className="hover:text-slate-300 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-300 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-300 cursor-pointer">Security Ledger</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
