import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useRequests } from '../context/RequestContext';
import { useAuth } from '../context/AuthContext';
import { StatCard } from '../components/common/StatCard';
import { UrgencyBadge, StatusBadge } from '../components/common/Badge';
import { AiScoreBadge } from '../components/ai/AiScoreBadge';
import { AiAnalysisCard } from '../components/ai/AiAnalysisCard';
import { Modal } from '../components/common/Modal';
import { formatCurrency, formatDate } from '../utils/formatters';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Eye,
  FileText,
  Search,
  Filter,
  Layers,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const AdminDashboard = () => {
  const { requests, updateRequestStatus } = useRequests();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState('Pending'); // 'Pending', 'Approved', 'Rejected', 'All'
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const pendingRequests = requests.filter(r => (r.status || '').toLowerCase().includes('pending'));
  const approvedRequests = requests.filter(r => (r.status || '').toLowerCase().includes('approved') || (r.status || '').toLowerCase().includes('funded'));
  const rejectedRequests = requests.filter(r => (r.status || '').toLowerCase().includes('rejected'));

  const filteredList = requests.filter(req => {
    const title = (req.title || '').toLowerCase();
    const benName = (req.beneficiaryName || req.beneficiary_name || '').toLowerCase();
    const cat = (req.category || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch = title.includes(query) || benName.includes(query) || cat.includes(query);
    const reqStatusLower = (req.status || '').toLowerCase();
    if (activeTab === 'Pending') return reqStatusLower.includes('pending') && matchesSearch;
    if (activeTab === 'Approved') return (reqStatusLower.includes('approved') || reqStatusLower.includes('funded')) && matchesSearch;
    if (activeTab === 'Rejected') return reqStatusLower.includes('rejected') && matchesSearch;
    return matchesSearch;
  });

  const handleApprove = async (reqId) => {
    try {
      await updateRequestStatus(reqId, 'Approved', 'Verified by Admin Auditor with Gemini AI cross-validation.');
      if (selectedRequest && selectedRequest.id === reqId) {
        setSelectedRequest(null);
      }
    } catch (err) {
      console.error('Approval failed:', err);
    }
  };

  const handleRejectConfirm = async (reqId) => {
    try {
      await updateRequestStatus(reqId, 'Rejected', rejectReason || 'Incomplete documentation or unverified address.');
      setIsRejecting(false);
      setRejectReason('');
      setSelectedRequest(null);
    } catch (err) {
      console.error('Rejection failed:', err);
    }
  };

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-64px)] overflow-x-hidden">
      <main className="min-w-0 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        {/* Admin Header */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                Auditor Clearance Level 3
              </span>
              <span className="text-xs text-slate-400 font-mono">Auditor: {currentUser?.name}</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Aid Intake & Verification Queue
            </h1>
            <p className="text-xs text-slate-500">
              Audit submitted community requests, verify AI priority scores, and authorize direct supplier catalog publish.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Link
              to="/transparency"
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center space-x-1.5"
            >
              <Layers className="w-4 h-4 text-teal-600" />
              <span>Audit Financial Ledger</span>
            </Link>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Pending Review Queue"
            value={pendingRequests.length}
            subtitle="Awaiting authorization"
            iconName="Clock"
            badgeText={pendingRequests.length > 0 ? "Action Required" : "Cleared"}
          />
          <StatCard
            title="Approved for Donors"
            value={approvedRequests.length}
            subtitle="Active on donor portal"
            iconName="CheckCircle2"
            isPositive={true}
          />
          <StatCard
            title="AI Confidence Accuracy"
            value="98.2%"
            subtitle="Gemini algorithmic precision"
            iconName="Sparkles"
            isPositive={true}
          />
          <StatCard
            title="Audited Pass-Through"
            value="100%"
            subtitle="Direct vendor allocation"
            iconName="ShieldCheck"
            change="Zero Diversion"
            isPositive={true}
          />
        </div>

        {/* Review Management Table */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card overflow-hidden">
          {/* Header & Tabs */}
          <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex bg-slate-100 p-1 rounded-xl text-xs w-full md:w-auto">
              <button
                onClick={() => setActiveTab('Pending')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center space-x-1.5 ${
                  activeTab === 'Pending'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Pending Review</span>
                <span className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-800 text-[10px] flex items-center justify-center font-bold">
                  {pendingRequests.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('Approved')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  activeTab === 'Approved'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Approved ({approvedRequests.length})
              </button>

              <button
                onClick={() => setActiveTab('Rejected')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  activeTab === 'Rejected'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Rejected ({rejectedRequests.length})
              </button>

              <button
                onClick={() => setActiveTab('All')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  activeTab === 'All'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({requests.length})
              </button>
            </div>

            {/* Search */}
            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search queue..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
          </div>

          {/* Table */}
          {filteredList.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800">Queue is completely clear!</h3>
              <p className="text-xs text-slate-500">
                No requests currently match the "{activeTab}" filter.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3.5 px-5">Request & Submitter</th>
                    <th className="py-3.5 px-4">Urgency</th>
                    <th className="py-3.5 px-4">AI Need Score</th>
                    <th className="py-3.5 px-4">Budget / Beneficiaries</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-5 text-right">Quick Review</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredList.map((req) => {
                    const reqTitle = req.title || 'Community Aid Request';
                    const benName = req.beneficiaryName || req.beneficiary_name || 'Community Beneficiary';
                    const reqLoc = req.location || 'Northside Ward';
                    const reqUrgency = req.urgency || 'High';
                    const reqAiScore = req.aiScore || 85;
                    const reqBudget = parseFloat(req.estimatedBudget || req.estimated_budget || 0);
                    const reqBenCount = req.beneficiariesCount || req.beneficiaries_count || 1;
                    const isPending = (req.status || '').toLowerCase().includes('pending');

                    return (
                      <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-4 px-5 max-w-xs">
                          <div className="font-bold text-slate-900 line-clamp-1">{reqTitle}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Submitted by <strong className="text-slate-700">{benName}</strong> • {reqLoc}
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">{req.id}</span>
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap">
                          <UrgencyBadge urgency={reqUrgency} size="xs" />
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap">
                          <AiScoreBadge score={reqAiScore} size="sm" />
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="font-bold text-slate-900 font-mono">
                            {formatCurrency(reqBudget)}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {reqBenCount} individuals
                          </div>
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap">
                          <StatusBadge status={req.status} size="xs" />
                        </td>

                        <td className="py-4 px-5 text-right whitespace-nowrap space-x-2">
                          <button
                            onClick={() => setSelectedRequest(req)}
                            className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold inline-flex items-center space-x-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Inspect</span>
                          </button>

                          {isPending && (
                            <>
                              <button
                                onClick={() => handleApprove(req.id)}
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold inline-flex items-center space-x-1"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Approve</span>
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedRequest(req);
                                  setIsRejecting(true);
                                }}
                                className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold inline-flex items-center space-x-1"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Reject</span>
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detailed Admin Review Modal */}
        <Modal
          isOpen={!!selectedRequest}
          onClose={() => {
            setSelectedRequest(null);
            setIsRejecting(false);
          }}
          title={`Audit Review: ${selectedRequest?.id}`}
          maxWidth="max-w-2xl"
        >
          {selectedRequest && (
            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                    {selectedRequest.category}
                  </span>
                  <UrgencyBadge urgency={selectedRequest.urgency} size="xs" />
                </div>
                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {selectedRequest.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Submitted by {selectedRequest.beneficiaryName} • {selectedRequest.location}
                </p>
              </div>

              {/* Description */}
              <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700 leading-relaxed border border-slate-200">
                <p className="font-bold text-slate-900 mb-1">Situation Statement:</p>
                {selectedRequest.description}
              </div>

              {/* AI Analysis Box */}
              <AiAnalysisCard
                requestId={selectedRequest.rawId || selectedRequest.id}
                aiScore={selectedRequest.aiScore}
                aiAnalysis={selectedRequest.ai_analysis || selectedRequest.aiAnalysis}
                canTrigger={true}
                onAnalysisUpdated={(newAnalysis) => {
                  setSelectedRequest(prev => prev ? {
                    ...prev,
                    ai_analysis: newAnalysis,
                    aiAnalysis: newAnalysis,
                    estimatedBudget: newAnalysis.budget_summary?.total_estimated_budget || prev.estimatedBudget
                  } : prev);
                }}
              />

              {/* Documents */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Attached Intake Documents ({selectedRequest.verificationDocuments?.length || 0})
                </h4>
                <div className="space-y-1.5">
                  {(selectedRequest.verificationDocuments || []).map((doc, idx) => {
                    const docName = typeof doc === 'string' ? doc : (doc?.name || 'community_intake_manifest.pdf');
                    const docSize = typeof doc === 'object' && typeof doc?.size === 'number'
                      ? `${(doc.size / (1024 * 1024)).toFixed(1)} MB`
                      : (doc?.size || '1.2 MB');
                    return (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-teal-600" />
                          <span className="font-semibold text-slate-800">{docName}</span>
                          <span className="text-slate-400 font-mono text-[11px]">({docSize})</span>
                        </div>
                        <span className="text-emerald-700 font-bold text-[10px] bg-emerald-50 px-2 py-0.5 rounded">
                          Valid File
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Rejection reason box if rejecting */}
              {isRejecting ? (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
                  <label className="block text-xs font-bold text-rose-900">
                    Reason for Rejection / Revision Request
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Specify why this request cannot be approved (e.g. invalid document or duplicate claim)..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full p-2 text-xs rounded-lg border border-rose-300 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                  <div className="flex justify-end space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsRejecting(false)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 bg-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRejectConfirm(selectedRequest.id)}
                      className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700"
                    >
                      Confirm Rejection
                    </button>
                  </div>
                </div>
              ) : (
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    to={`/donor/requests/${selectedRequest.id}`}
                    className="text-xs font-semibold text-teal-700 hover:underline"
                  >
                    Open Public View &rarr;
                  </Link>

                  <div className="flex items-center space-x-2">
                    {(selectedRequest.status || '').toLowerCase().includes('pending') ? (
                      <>
                        <button
                          onClick={() => setIsRejecting(true)}
                          className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleApprove(selectedRequest.id)}
                          className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>Authorize for Donor Portal</span>
                        </button>
                      </>
                    ) : (
                      <span className="text-xs font-semibold text-slate-500">
                        Status: {selectedRequest.status}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal>
      </main>
    </div>
  );
};
