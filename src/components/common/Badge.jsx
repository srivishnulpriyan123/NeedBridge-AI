import React from 'react';

export const UrgencyBadge = ({ urgency, size = 'sm' }) => {
  const sizeClasses = size === 'xs' ? 'text-xs px-2 py-0.5' : size === 'lg' ? 'text-sm px-3.5 py-1' : 'text-xs px-2.5 py-1';

  switch (urgency) {
    case 'Critical':
      return (
        <span className={`inline-flex items-center font-semibold rounded-full bg-rose-50 text-rose-700 border border-rose-200/80 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-rose-500 animate-pulse"></span>
          Critical (24-48h)
        </span>
      );
    case 'High':
      return (
        <span className={`inline-flex items-center font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200/80 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-amber-500"></span>
          High Priority
        </span>
      );
    case 'Medium':
      return (
        <span className={`inline-flex items-center font-semibold rounded-full bg-sky-50 text-sky-700 border border-sky-200/80 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-sky-500"></span>
          Medium Priority
        </span>
      );
    case 'Low':
    default:
      return (
        <span className={`inline-flex items-center font-semibold rounded-full bg-slate-100 text-slate-700 border border-slate-200 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-slate-400"></span>
          Standard
        </span>
      );
  }
};

export const StatusBadge = ({ status, size = 'sm' }) => {
  const sizeClasses = size === 'xs' ? 'text-xs px-2 py-0.5' : size === 'lg' ? 'text-sm px-3.5 py-1' : 'text-xs px-2.5 py-1';

  switch (status) {
    case 'Approved':
      return (
        <span className={`inline-flex items-center font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-emerald-500"></span>
          Approved for Donors
        </span>
      );
    case 'Pending Review':
      return (
        <span className={`inline-flex items-center font-semibold rounded-full bg-amber-50 text-amber-800 border border-amber-200 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-amber-500 animate-ping"></span>
          Pending Verification
        </span>
      );
    case 'Funded & In Fulfillment':
    case 'Fulfilled':
      return (
        <span className={`inline-flex items-center font-semibold rounded-full bg-teal-50 text-teal-700 border border-teal-200 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-teal-600"></span>
          100% Funded
        </span>
      );
    case 'Rejected':
      return (
        <span className={`inline-flex items-center font-semibold rounded-full bg-slate-100 text-slate-600 border border-slate-300 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-slate-400"></span>
          Needs Revision
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center font-semibold rounded-full bg-slate-100 text-slate-700 border border-slate-200 ${sizeClasses}`}>
          {status}
        </span>
      );
  }
};

