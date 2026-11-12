import React from 'react';
import { Sparkles } from 'lucide-react';

export const AiScoreBadge = ({ score = 85, priorityLevel = 'High Priority', size = 'md' }) => {
  const isHigh = score >= 80;
  const isMedium = score >= 60 && score < 80;

  const colorStyles = isHigh
    ? {
        bg: 'bg-rose-50',
        border: 'border-rose-200',
        text: 'text-rose-700',
        accent: 'bg-rose-600',
        indicator: 'border-rose-500'
      }
    : isMedium
    ? {
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        text: 'text-amber-700',
        accent: 'bg-amber-600',
        indicator: 'border-amber-500'
      }
    : {
        bg: 'bg-teal-50',
        border: 'border-teal-200',
        text: 'text-teal-700',
        accent: 'bg-teal-600',
        indicator: 'border-teal-500'
      };

  if (size === 'sm') {
    return (
      <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-semibold ${colorStyles.bg} ${colorStyles.text} border ${colorStyles.border}`}>
        <Sparkles className="w-3 h-3 text-teal-600" />
        <span>AI Score: {score}/100</span>
      </span>
    );
  }

  return (
    <div className={`inline-flex items-center space-x-3 px-3 py-1.5 rounded-xl border ${colorStyles.bg} ${colorStyles.border}`}>
      <div className="relative flex items-center justify-center">
        <div className={`w-10 h-10 rounded-full border-2 ${colorStyles.indicator} flex items-center justify-center bg-white shadow-xs`}>
          <span className={`text-sm font-extrabold ${colorStyles.text}`}>{score}</span>
        </div>
      </div>
      <div>
        <div className="flex items-center space-x-1">
          <Sparkles className="w-3 h-3 text-teal-600" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">AI Need Index</span>
        </div>
        <p className={`text-xs font-bold ${colorStyles.text} leading-tight`}>{priorityLevel}</p>
      </div>
    </div>
  );
};

