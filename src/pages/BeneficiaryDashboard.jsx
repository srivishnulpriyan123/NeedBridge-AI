import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRequests } from '../context/RequestContext';
import { StatCard } from '../components/common/StatCard';
import { UrgencyBadge, StatusBadge } from '../components/common/Badge';
import { ProgressBar } from '../components/common/ProgressBar';
import { AiScoreBadge } from '../components/ai/AiScoreBadge';
import { formatCurrency, formatDate } from '../utils/formatters';
import { calculateAiScore } from '../utils/aiScorer';
import {
  FilePlus2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Eye,
  ExternalLink,
  Sparkles,
  Layers,
  ArrowRight,
  RefreshCw
} from 'lucide-react';

export const BeneficiaryDashboard = () => {
  const { currentUser } = useAuth();
  const { requests, isLoading: loading } = useRequests();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Live beneficiary requests directly linked with context & localStorage (updates live with donor pledges!)
  const userRequests = useMemo(() => {
    return requests.map(r => {
      const raised = parseFloat(r.fundsRaised !== undefined ? r.fundsRaised : r.funds_raised || 0);
      const budget = parseFloat(r.estimatedBudget !== undefined ? r.estimatedBudget : r.estimated_budget || 0);
      return {
        ...r,
        fundsRaised: raised,
        funds_raised: raised,
        estimatedBudget: budget,
        estimated_budget: budget
      };
    });
  }, [requests]);

  // Filter requests submitted by this beneficiary
  const myRequests = userRequests.filter(req => {
    const matchesSearch = (req.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (req.category || '').toLowerCase().includes(searchQuery.toLowerCase());
    const reqStatusLower = (req.status || '').toLowerCase();
    const matchesStatus = statusFilter === 'All' ? true :
                          statusFilter === 'Pending Review' ? reqStatusLower.includes('pending') :
                          statusFilter === 'Approved' ? (reqStatusLower.includes('approved') || reqStatusLower.includes('funded')) :
                          reqStatusLower.includes(statusFilter.toLowerCase());
    return matchesSearch && matchesStatus;
  });

  const pendingCount = userRequests.filter(r => (r.status || '').toLowerCase().includes('pending')).length;
  const approvedCount = userRequests.filter(r => (r.status || '').toLowerCase().includes('approved') || (r.status || '').toLowerCase().includes('funded')).length;
  const fulfilledCount = userRequests.filter(r => (r.status || '').toLowerCase().includes('fulfilled')).length;
  const totalValue = userRequests.reduce((acc, curr) => acc + (curr.fundsRaised || 0), 0);

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-64px)] overflow-x-hidden">
      <main className="min-w-0 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        {/* Welcome Banner */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                Beneficiary Portal
              </span>
              <span className="text-xs text-slate-400">ID: {currentUser?.id || 'USR-BEN-101'}</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Community Relief Dashboard
            </h1>
            <p className="text-xs text-slate-500">
              Manage your submitted aid needs, track Gemini AI priority scoring, and view live donor allocations.
            </p>
          </div>

          <Link
            to="/beneficiary/new-request"
            className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-md active:scale-95 whitespace-nowrap"
          >
            <FilePlus2 className="w-4 h-4 text-teal-400" />
            <span>Submit New Aid Request</span>
          </Link>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Active Requests"
            value={userRequests.length}
            subtitle="Total in pipeline"
            iconName="FileText"
          />
          <StatCard
            title="Pending Verification"
            value={pendingCount}
            subtitle="AI & Admin triage"
            iconName="Clock"
            badgeText="Triage"
          />
          <StatCard
            title="Approved & Funded"
            value={approvedCount + fulfilledCount}
            subtitle="Matching with donors"
            iconName="CheckCircle2"
            change="+2 this week"
            isPositive={true}
          />
          <StatCard
            title="Total Aid Raised"
            value={formatCurrency(totalValue)}
            subtitle="Direct donor funding"
            iconName="Sparkles"
            isPositive={true}
          />
        </div>

        {/* Requests Management Section */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card overflow-hidden">
          {/* Header & Filters */}
          <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Your Community Aid Requests</h2>
              <p className="text-xs text-slate-500">
                Track verification, AI scores, and fulfillment updates
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* Search */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search needs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              {/* Status filter tabs */}
              <div className="flex bg-slate-100 p-1 rounded-xl text-xs w-full sm:w-auto">
                {['All', 'Pending Review', 'Approved'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                      statusFilter === status
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table / List */}
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs font-semibold text-slate-500">Loading your community requests...</p>
            </div>
          ) : myRequests.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">No requests found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                There are no requests matching your filter criteria. Try clearing search or submit a new need.
              </p>
              <Link
                to="/beneficiary/new-request"
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-teal-600 text-white font-bold text-xs"
              >
                <FilePlus2 className="w-4 h-4" />
                <span>Create Request Now</span>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3.5 px-5">Request & Category</th>
                    <th className="py-3.5 px-4">Urgency & AI Index</th>
                    <th className="py-3.5 px-4">Beneficiaries</th>
                    <th className="py-3.5 px-4">Funding Progress</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {myRequests.map((req) => {
                    const reqUrgency = (req.urgency || 'high').charAt(0).toUpperCase() + (req.urgency || 'high').slice(1);
                    const reqStatus = req.status === 'pending' ? 'Pending Review' :
                                      req.status === 'approved' ? 'Approved' :
                                      req.status === 'fulfilled' ? 'Funded & In Fulfillment' : req.status;
                    const reqRaised = parseFloat(req.funds_raised || req.fundsRaised || 0);
                    const reqBudget = parseFloat(req.estimated_budget || req.estimatedBudget || 0);
                    const reqBenCount = req.beneficiaries_count || req.beneficiariesCount || 1;
                    const reqDate = req.created_at || req.createdAt;
                    const aiScore = req.aiScore || calculateAiScore({
                      urgency: reqUrgency,
                      beneficiaries: reqBenCount,
                      category: req.category,
                      description: req.description
                    }).score;

                    return (
                      <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-4 px-5 max-w-xs">
                          <div className="font-bold text-slate-900 line-clamp-1">{req.title}</div>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                              {req.category}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              REQ-#{req.id} • {formatDate(reqDate)}
                            </span>
                          </div>
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="space-y-1">
                            <UrgencyBadge urgency={reqUrgency} size="xs" />
                            <div className="flex items-center text-[11px] text-slate-500">
                              <Sparkles className="w-3 h-3 text-teal-600 mr-1" />
                              <span>AI Score: <strong>{aiScore}/100</strong></span>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap text-slate-700 font-medium">
                          {reqBenCount} individuals
                        </td>

                        <td className="py-4 px-4 min-w-[200px]">
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-extrabold text-teal-700 font-mono text-sm">
                                {formatCurrency(reqRaised)}
                              </span>
                              <span className="text-slate-500 font-medium text-[11px]">
                                Goal: {formatCurrency(reqBudget)}
                              </span>
                            </div>
                            <ProgressBar
                              raised={reqRaised}
                              target={reqBudget}
                              showLabels={false}
                              size="sm"
                            />
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="font-bold text-teal-700">
                                {Math.round((reqRaised / (reqBudget || 1)) * 100)}% Funded
                              </span>
                              <span className="text-slate-400">
                                {reqBudget - reqRaised > 0 
                                  ? `${formatCurrency(reqBudget - reqRaised)} remaining` 
                                  : 'Fully Funded!'}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap">
                          <StatusBadge status={reqStatus} size="xs" />
                        </td>

                        <td className="py-4 px-5 text-right whitespace-nowrap">
                          <Link
                            to={`/donor/requests/${req.id}`}
                            className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 text-slate-700 hover:text-teal-700 font-semibold transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Inspect</span>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
