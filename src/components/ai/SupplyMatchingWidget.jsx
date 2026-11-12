import React, { useState, useEffect } from 'react';
import { aiApi } from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import {
  Boxes,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  PackageCheck,
  RefreshCw,
  Warehouse,
  ExternalLink
} from 'lucide-react';

export const SupplyMatchingWidget = ({ requestId, isApproved }) => {
  const [matchingData, setMatchingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMatching = async () => {
    if (!requestId || !isApproved) return;
    setLoading(true);
    setError(null);
    try {
      const res = await aiApi.matchRequest(requestId);
      if (res.success && res.data) {
        setMatchingData(res.data);
      }
    } catch (err) {
      console.warn('Could not load supply matching:', err.message);
      setError(err.response?.data?.message || 'Matching is only available for approved requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatching();
  }, [requestId, isApproved]);

  if (!isApproved) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-teal-200/90 shadow-card space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
            <Warehouse className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-extrabold text-slate-900">
                Verified Catalogue Supply Matching
              </h3>
              <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                PostgreSQL Inventory
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Live matching against available humanitarian warehouse inventory
            </p>
          </div>
        </div>

        <button
          onClick={fetchMatching}
          disabled={loading}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-teal-400 text-slate-700 hover:text-teal-700 text-xs font-semibold transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-teal-600' : ''}`} />
          <span>{loading ? 'Matching...' : 'Sync Stock'}</span>
        </button>
      </div>

      {loading && !matchingData ? (
        <div className="py-8 flex flex-col items-center justify-center text-slate-400 space-y-2">
          <RefreshCw className="w-6 h-6 animate-spin text-teal-600" />
          <p className="text-xs">Evaluating catalogue stock and pricing...</p>
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start space-x-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
          <span>{error}</span>
        </div>
      ) : matchingData ? (
        <div className="space-y-4">
          {/* Readiness Banner */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2.5">
              <PackageCheck className="w-5 h-5 text-emerald-600" />
              <div>
                <span className="text-xs text-slate-500 block">Fulfillment Readiness</span>
                <span className="text-sm font-bold text-slate-900">
                  {matchingData.fulfillment_readiness}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 block">Total Matched Supplies Cost</span>
              <span className="text-base font-extrabold text-teal-700 font-mono">
                {formatCurrency(matchingData.total_matched_supplies_cost)}
              </span>
            </div>
          </div>

          {/* Matched Items Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Catalogue Supply</th>
                  <th className="py-2.5 px-3 text-center">Required</th>
                  <th className="py-2.5 px-3 text-center">In Stock</th>
                  <th className="py-2.5 px-3 text-center">Fulfilled</th>
                  <th className="py-2.5 px-3 text-right">Unit Rate</th>
                  <th className="py-2.5 px-3 text-right">Matched Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {matchingData.matched_supplies?.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900">{item.product_name}</div>
                      <div className="text-[10px] text-slate-400">{item.category}</div>
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono">
                      {item.quantity_required} {item.unit}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        item.quantity_available_in_stock > 10
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : item.quantity_available_in_stock > 0
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {item.quantity_available_in_stock}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-teal-700">
                      {item.quantity_fulfilled_from_stock}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-500">
                      {formatCurrency(item.unit_price)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                      {formatCurrency(item.matched_estimated_cost)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Shortfall or Unmatched Warnings if any */}
          {matchingData.unmatched_requirements?.length > 0 && (
            <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-1.5">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-900">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>Procurement Shortfall Notice ({matchingData.unmatched_requirements.length} item(s)):</span>
              </div>
              <ul className="text-[11px] text-amber-800 space-y-1 list-disc list-inside">
                {matchingData.unmatched_requirements.map((u, i) => (
                  <li key={i}>
                    <strong>{u.item_name}</strong>: Shortfall of {u.quantity_shortfall} unit(s). {u.reason}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default SupplyMatchingWidget;

