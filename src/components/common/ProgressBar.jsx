import React from 'react';
import { calculatePercentage, formatCurrency } from '../../utils/formatters';

export const ProgressBar = ({ raised = 0, target = 1, showLabels = true, size = 'md' }) => {
  const percentage = calculatePercentage(raised, target);
  const isComplete = percentage >= 100;

  const heightClass = size === 'sm' ? 'h-1.5' : size === 'lg' ? 'h-3' : 'h-2';

  return (
    <div className="w-full">
      {showLabels && (
        <div className="flex justify-between items-center text-xs mb-1.5">
          <div className="font-semibold text-slate-900">
            {formatCurrency(raised)} <span className="text-slate-500 font-normal">raised of {formatCurrency(target)}</span>
          </div>
          <span className={`font-bold ${isComplete ? 'text-teal-600' : 'text-slate-700'}`}>
            {percentage}%
          </span>
        </div>
      )}
      <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${heightClass}`}>
        <div
          className={`h-full transition-all duration-500 rounded-full ${
            isComplete
              ? 'bg-gradient-to-r from-teal-500 to-emerald-500'
              : 'bg-teal-600'
          }`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

