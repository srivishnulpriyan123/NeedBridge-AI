import React from 'react';
import {
  Activity,
  FileText,
  Clock,
  CheckCircle2,
  Sparkles,
  DollarSign,
  Layers,
  ShieldCheck,
  Building,
  CreditCard,
  Heart,
  Users
} from 'lucide-react';

const ICON_MAP = {
  Activity,
  FileText,
  Clock,
  CheckCircle2,
  Sparkles,
  DollarSign,
  Layers,
  ShieldCheck,
  Building,
  CreditCard,
  Heart,
  Users
};

export const StatCard = ({ title, value, subtitle, iconName, change, isPositive, badgeText }) => {
  const IconComponent = ICON_MAP[iconName] || Activity;

  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-subtle hover:shadow-card transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-slate-500">{title}</span>
        <div className="w-10 h-10 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700">
          <IconComponent className="w-5 h-5" />
        </div>
      </div>
      <div className="flex items-baseline space-x-2">
        <span className="text-2xl font-bold text-slate-900 tracking-tight">{value}</span>
        {badgeText && (
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
            {badgeText}
          </span>
        )}
      </div>
      {(subtitle || change) && (
        <div className="mt-2 flex items-center text-xs text-slate-500">
          {change && (
            <span className={`font-semibold mr-1.5 ${isPositive ? 'text-emerald-600' : 'text-slate-600'}`}>
              {change}
            </span>
          )}
          <span>{subtitle}</span>
        </div>
      )}
    </div>
  );
};
1