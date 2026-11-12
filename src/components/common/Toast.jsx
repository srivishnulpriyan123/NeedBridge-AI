import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const Toast = ({ toast, onDismiss }) => {
  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-md w-full px-4 sm:px-0">
      <div
        className={`flex items-start p-4 rounded-xl shadow-elevated border backdrop-blur-md transition-all duration-300 ${
          isSuccess
            ? 'bg-emerald-950/95 text-white border-emerald-700/60'
            : isError
            ? 'bg-rose-950/95 text-white border-rose-700/60'
            : 'bg-slate-900/95 text-white border-slate-700/60'
        }`}
      >
        <div className="flex-shrink-0 mt-0.5">
          {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
          {isError && <AlertCircle className="w-5 h-5 text-rose-400" />}
          {!isSuccess && !isError && <Info className="w-5 h-5 text-teal-400" />}
        </div>
        <div className="ml-3 flex-1 text-sm font-medium leading-relaxed">
          {toast.message}
        </div>
        <button
          onClick={onDismiss}
          className="ml-3 flex-shrink-0 text-slate-300 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

