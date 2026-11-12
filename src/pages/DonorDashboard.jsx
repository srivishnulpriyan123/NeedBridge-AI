import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useRequests } from '../context/RequestContext';
import { useAuth } from '../context/AuthContext';
import { StatCard } from '../components/common/StatCard';
import { UrgencyBadge, StatusBadge } from '../components/common/Badge';
import { ProgressBar } from '../components/common/ProgressBar';
import { AiScoreBadge } from '../components/ai/AiScoreBadge';
import { SupportModal } from '../components/donor/SupportModal';
import { formatCurrency, formatDate } from '../utils/formatters';
import { AID_CATEGORIES } from '../data/mockCategories';
import {
  Search,
  Filter,
  Heart,
  Eye,
  Sparkles,
  MapPin,
  Users,
  Grid,
  List,
  CheckCircle2,
  DollarSign,
  Layers
} from 'lucide-react';

export const DonorDashboard = () => {
  const { currentUser } = useAuth();
  const { requests, isLoading } = useRequests();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedUrgency, setSelectedUrgency] = useState('All');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [activeModalRequest, setActiveModalRequest] = useState(null);

  // Filter approved requests (plus any active in demo)
  const filteredRequests = requests.filter((req) => {
    const isApproved = (req.status || '').toLowerCase().includes('approved') || (req.status || '').toLowerCase().includes('funded');
    const title = (req.title || '').toLowerCase();
    const desc = (req.description || '').toLowerCase();
    const loc = (req.location || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch = title.includes(query) || desc.includes(query) || loc.includes(query);
    const matchesCategory =
      selectedCategory === 'All' ? true : (req.category || '').toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesUrgency = selectedUrgency === 'All' ? true : (req.urgency || '').toLowerCase() === selectedUrgency.toLowerCase();
    return isApproved && matchesSearch && matchesCategory && matchesUrgency;
  });

  const totalRaised = requests.reduce((acc, r) => acc + (r.fundsRaised || 0), 0);
  const totalTarget = requests.reduce((acc, r) => acc + (r.estimatedBudget || 0), 0);
  const urgentCount = requests.filter(r => r.urgency === 'Critical' && r.status === 'Approved').length;

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-64px)] overflow-x-hidden">
      <main className="min-w-0 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        {/* Donor Header */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                Donor Discovery Portal
              </span>
              <span className="text-xs text-slate-400">Direct Humanitarian Impact</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Verified Community Needs
            </h1>
            <p className="text-xs text-slate-500">
              Select an AI-prioritized request below to pledge direct supplies via PayPal sandbox escrow.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Link
              to="/transparency"
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-700 font-bold text-xs flex items-center space-x-1.5 transition-colors"
            >
              <Layers className="w-4 h-4 text-teal-600" />
              <span>Public Audit Ledger</span>
            </Link>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Available Causes"
            value={filteredRequests.length}
            subtitle="Verified community requests"
            iconName="Heart"
          />
          <StatCard
            title="Critical Urgency (24-48h)"
            value={urgentCount}
            subtitle="Needs rapid funding"
            iconName="Sparkles"
            badgeText="Urgent"
          />
          <StatCard
            title="Funds Mobilized"
            value={formatCurrency(totalRaised)}
            subtitle={`of ${formatCurrency(totalTarget)} goal`}
            iconName="DollarSign"
            isPositive={true}
          />
          <StatCard
            title="Your Impact Score"
            value="920 pts"
            subtitle="Top 5% Supporter Tier"
            iconName="CheckCircle2"
            change="Verified"
            isPositive={true}
          />
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-subtle space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Search input */}
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search by title, location, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>

            <div className="flex items-center space-x-2 w-full md:w-auto justify-between md:justify-end">
              {/* Urgency select */}
              <select
                value={selectedUrgency}
                onChange={(e) => setSelectedUrgency(e.target.value)}
                className="px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              >
                <option value="All">All Urgency Levels</option>
                <option value="Critical">Critical Priority</option>
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
              </select>

              {/* View Toggle */}
              <div className="flex items-center border border-slate-200 rounded-xl p-1 bg-slate-50">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-400 hover:text-slate-700'
                  }`}
                  title="Grid View"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-400 hover:text-slate-700'
                  }`}
                  title="Table View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 pt-1 text-xs">
            <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider whitespace-nowrap mr-1">
              Category:
            </span>
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                selectedCategory === 'All'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Categories
            </button>
            {AID_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat.name
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Requests Catalog Display */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-2xl p-6 border border-slate-200 animate-pulse space-y-4">
                <div className="flex justify-between">
                  <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                </div>
                <div className="h-5 bg-slate-200 rounded w-3/4"></div>
                <div className="h-10 bg-slate-100 rounded"></div>
                <div className="h-2 bg-slate-200 rounded w-full"></div>
                <div className="h-8 bg-slate-100 rounded"></div>
              </div>
            ))}
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-subtle space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No matching requests found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your search query, urgency filter, or category pills.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSelectedUrgency('All');
              }}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs"
            >
              Reset Filters
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRequests.map((req) => (
              <div
                key={req.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between overflow-hidden"
              >
                {/* Card Top */}
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                      {req.category}
                    </span>
                    <UrgencyBadge urgency={req.urgency} size="xs" />
                  </div>

                  <Link
                    to={`/donor/requests/${req.id}`}
                    className="block group"
                  >
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-teal-700 transition-colors line-clamp-2 leading-snug">
                      {req.title}
                    </h3>
                  </Link>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {req.description}
                  </p>

                  <div className="flex items-center space-x-2 text-[11px] text-slate-500 pt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{req.location}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs py-2 border-y border-slate-100">
                    <span className="flex items-center text-slate-600 font-medium">
                      <Users className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      {req.beneficiariesCount} people
                    </span>
                    <AiScoreBadge score={req.aiScore} size="sm" />
                  </div>
                </div>

                {/* Card Bottom */}
                <div className="p-5 bg-slate-50/70 border-t border-slate-100 space-y-3">
                  <ProgressBar
                    raised={req.fundsRaised}
                    target={req.estimatedBudget}
                    size="sm"
                  />

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Link
                      to={`/donor/requests/${req.id}`}
                      className="py-2 px-3 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-700 font-bold text-xs text-center transition-colors bg-white"
                    >
                      Inspect Details
                    </Link>

                    <button
                      type="button"
                      onClick={() => setActiveModalRequest(req)}
                      className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors shadow-sm"
                    >
                      <Heart className="w-3.5 h-3.5 text-teal-400" />
                      <span>Support</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3.5 px-5">Request & Location</th>
                    <th className="py-3.5 px-4">Urgency & AI Index</th>
                    <th className="py-3.5 px-4">Beneficiaries</th>
                    <th className="py-3.5 px-4">Funding Progress</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-5 max-w-sm">
                        <Link
                          to={`/donor/requests/${req.id}`}
                          className="font-bold text-slate-900 hover:text-teal-700 line-clamp-1 block"
                        >
                          {req.title}
                        </Link>
                        <div className="flex items-center space-x-2 mt-1 text-[11px] text-slate-400">
                          <span className="text-teal-700 font-semibold">{req.category}</span>
                          <span>•</span>
                          <span>{req.location}</span>
                        </div>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <UrgencyBadge urgency={req.urgency} size="xs" />
                          <div className="text-[10px] text-slate-400">
                            AI Score: <strong className="text-slate-700">{req.aiScore}/100</strong>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap font-medium text-slate-700">
                        {req.beneficiariesCount} individuals
                      </td>

                      <td className="py-4 px-4 min-w-[160px]">
                        <ProgressBar
                          raised={req.fundsRaised}
                          target={req.estimatedBudget}
                          size="sm"
                        />
                      </td>

                      <td className="py-4 px-5 text-right whitespace-nowrap space-x-2">
                        <Link
                          to={`/donor/requests/${req.id}`}
                          className="inline-flex items-center px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 font-semibold hover:bg-slate-100"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          <span>View</span>
                        </Link>
                        <button
                          onClick={() => setActiveModalRequest(req)}
                          className="inline-flex items-center px-3 py-1.5 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800"
                        >
                          <Heart className="w-3.5 h-3.5 mr-1 text-teal-400" />
                          <span>Support</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal for supporting */}
        <SupportModal
          isOpen={!!activeModalRequest}
          onClose={() => setActiveModalRequest(null)}
          request={activeModalRequest}
        />
      </main>
    </div>
  );
};
