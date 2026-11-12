import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRequests } from '../context/RequestContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatters';
import { AID_CATEGORIES } from '../data/mockCategories';
import { ProgressBar } from '../components/common/ProgressBar';
import { UrgencyBadge } from '../components/common/Badge';
import { AiScoreBadge } from '../components/ai/AiScoreBadge';
import {
  HeartHandshake,
  Sparkles,
  ShieldCheck,
  CreditCard,
  Layers,
  ArrowRight,
  TrendingUp,
  Users,
  CheckCircle2,
  FileText,
  Clock,
  Compass,
  Building,
  Heart,
  ChevronRight,
  FilePlus2,
  Lock
} from 'lucide-react';

export const LandingPage = () => {
  const { requests } = useRequests();
  const { switchRole } = useAuth();
  const navigate = useNavigate();

  // Top urgent approved requests for preview
  const featuredRequests = requests.filter(r => r.status === 'Approved').slice(0, 3);

  const handleRoleExplore = async (role, path) => {
    try {
      if (typeof switchRole === 'function') {
        await switchRole(role);
      }
    } catch (err) {
      console.warn('handleRoleExplore warning:', err);
    }
    navigate(path);
  };

  return (
    <div className="bg-slate-50 min-h-screen overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white border-b border-slate-200/80 pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-teal-100/40 rounded-full blur-3xl pointer-events-none -z-10"></div>
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-slate-200/50 rounded-full blur-2xl pointer-events-none -z-10"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headline & CTAs */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/80 text-teal-800 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
                <span>AI-Driven Community Aid & Transparent Payment Gateway</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
                Connecting Critical Needs with Compassionate Donors —{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-teal-500">
                  Powered by AI.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                NeedBridge AI bridges the gap between verified community emergencies and generous donors. Gemini AI analyzes and prioritizes urgent supply requests, while PayPal and a transparent public ledger ensure every dollar delivers essential relief.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                <button
                  onClick={() => handleRoleExplore('donor', '/donor')}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-all shadow-md flex items-center justify-center space-x-2 group"
                >
                  <Compass className="w-4 h-4 text-teal-400" />
                  <span>Explore Aid Requests</span>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <button
                  onClick={() => handleRoleExplore('beneficiary', '/beneficiary/new-request')}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white border border-slate-300 text-slate-800 font-bold text-sm hover:bg-slate-50 hover:border-slate-400 transition-all shadow-subtle flex items-center justify-center space-x-2"
                >
                  <FilePlus2 className="w-4 h-4 text-teal-600" />
                  <span>Submit Need Request</span>
                </button>

                <Link
                  to="/transparency"
                  className="w-full sm:w-auto px-5 py-3.5 rounded-xl text-teal-700 hover:text-teal-800 font-bold text-sm flex items-center justify-center space-x-1.5 transition-colors"
                >
                  <Layers className="w-4 h-4" />
                  <span>Audit Ledger</span>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-500">
                <div className="flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-teal-600" />
                  <span className="font-medium text-slate-700">100% Vendor Pass-Through</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  <span className="font-medium text-slate-700">Gemini AI Urgency Scoring</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Lock className="w-4 h-4 text-teal-600" />
                  <span className="font-medium text-slate-700">Cryptographic Transparency</span>
                </div>
              </div>
            </div>

            {/* Right Column: Live AI Matching Card Demo */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-6 space-y-5 relative">
                {/* Header tag */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-ping"></span>
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Live AI Dispatch Preview
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md font-bold">
                    Score: 94/100
                  </span>
                </div>

                {/* Simulated Request Card */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                      Shelter & Bedding
                    </span>
                    <UrgencyBadge urgency="Critical" size="xs" />
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    Emergency Winter Heating & Thermal Bedding for Sheltered Seniors
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-2">
                    38 elderly residents facing sub-zero freeze after secondary furnace outage. Immediate heavy thermal wool blankets and safe heating pads requested.
                  </p>

                  {/* AI Match Callout */}
                  <div className="p-3 bg-slate-900 text-white rounded-xl text-xs space-y-1.5">
                    <div className="flex items-center text-teal-400 font-semibold">
                      <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                      <span>Gemini AI Priority Evaluation</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-normal">
                      High demographic vulnerability match. Cross-validated against weather advisory & local emergency health unit.
                    </p>
                  </div>

                  {/* Progress bar */}
                  <div className="pt-1">
                    <ProgressBar raised={1200} target={1450} size="md" />
                  </div>

                  {/* Donor quick pledge simulation */}
                  <div className="pt-2 flex items-center justify-between">
                    <div className="flex -space-x-2">
                      <div className="w-7 h-7 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px] font-bold border-2 border-white">
                        SJ
                      </div>
                      <div className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px] font-bold border-2 border-white">
                        AF
                      </div>
                      <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold border-2 border-white">
                        +3
                      </div>
                    </div>
                    <Link
                      to={featuredRequests[0] ? `/donor/requests/${featuredRequests[0].id}` : '/donor'}
                      className="px-3 py-1.5 text-xs font-bold rounded-lg bg-teal-600 hover:bg-teal-700 text-white transition-colors"
                    >
                      Inspect & Support &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Statistics Counter (Clearly Labelled Demo Data) */}
      <section className="bg-slate-900 text-white py-12 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-[11px] uppercase tracking-widest font-extrabold text-teal-400 bg-teal-950/80 px-3 py-1 rounded-full border border-teal-800/80">
              Community Impact Metrics (Demonstration Data)
            </span>
            <h2 className="text-2xl font-bold text-white mt-3">
              Transparency, Efficiency & Real-Time Accountability
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-slate-800/60 p-5 rounded-2xl border border-slate-700/60 text-center">
              <span className="text-3xl lg:text-4xl font-black text-teal-400 block">$48,520</span>
              <span className="text-xs font-semibold text-slate-300 mt-1 block">Aid Delivered to Vendors</span>
              <span className="text-[10px] text-slate-400 mt-1 block font-mono">100% Escrow Direct</span>
            </div>

            <div className="bg-slate-800/60 p-5 rounded-2xl border border-slate-700/60 text-center">
              <span className="text-3xl lg:text-4xl font-black text-white block">1,240+</span>
              <span className="text-xs font-semibold text-slate-300 mt-1 block">Families & Seniors Assisted</span>
              <span className="text-[10px] text-slate-400 mt-1 block font-mono">Verified Intake Sheets</span>
            </div>

            <div className="bg-slate-800/60 p-5 rounded-2xl border border-slate-700/60 text-center">
              <span className="text-3xl lg:text-4xl font-black text-teal-400 block">2.4 hrs</span>
              <span className="text-xs font-semibold text-slate-300 mt-1 block">Avg AI Match Speed</span>
              <span className="text-[10px] text-slate-400 mt-1 block font-mono">82% faster than manual</span>
            </div>

            <div className="bg-slate-800/60 p-5 rounded-2xl border border-slate-700/60 text-center">
              <span className="text-3xl lg:text-4xl font-black text-white block">100%</span>
              <span className="text-xs font-semibold text-slate-300 mt-1 block">Audit Proof on Ledger</span>
              <span className="text-[10px] text-slate-400 mt-1 block font-mono">SHA-256 Receipts</span>
            </div>
          </div>
        </div>
      </section>

      {/* Problem vs. Solution Section */}
      <section className="py-16 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
            The Problem & The NeedBridge Solution
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3">
            Why Traditional Community Relief Struggles — And How We Fix It
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-3">
            Conventional fundraising suffers from slow approvals, administrative overhead, and lack of visibility into where money actually goes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Traditional Challenges */}
          <div className="bg-white rounded-2xl p-7 border border-rose-200/80 shadow-subtle space-y-4">
            <div className="flex items-center space-x-2 text-rose-600 font-bold text-sm uppercase tracking-wider">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <span>Traditional Aid Bottlenecks</span>
            </div>
            <ul className="space-y-3 text-sm text-slate-600">
              <li className="flex items-start">
                <span className="text-rose-500 font-bold mr-2 text-base">&times;</span>
                <span><strong>Opaque cash donations:</strong> Donors rarely know if cash reached the affected families or was absorbed in admin overhead.</span>
              </li>
              <li className="flex items-start">
                <span className="text-rose-500 font-bold mr-2 text-base">&times;</span>
                <span><strong>Manual intake backlogs:</strong> Nonprofits take weeks to triage applications during emergencies.</span>
              </li>
              <li className="flex items-start">
                <span className="text-rose-500 font-bold mr-2 text-base">&times;</span>
                <span><strong>Supply mismatch:</strong> Excess unsolicited goods arrive while critical items (baby formula, medicines) stay unfulfilled.</span>
              </li>
            </ul>
          </div>

          {/* NeedBridge AI Solution */}
          <div className="bg-white rounded-2xl p-7 border border-teal-200/90 shadow-card space-y-4 ring-1 ring-teal-500/20">
            <div className="flex items-center space-x-2 text-teal-700 font-bold text-sm uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-teal-600" />
              <span>NeedBridge AI Innovation</span>
            </div>
            <ul className="space-y-3 text-sm text-slate-700">
              <li className="flex items-start">
                <CheckCircle2 className="w-4 h-4 text-teal-600 mr-2 flex-shrink-0 mt-0.5" />
                <span><strong>Automated AI Urgency Prioritization:</strong> Gemini instantly analyzes vulnerability, urgency, and documentation validity.</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-4 h-4 text-teal-600 mr-2 flex-shrink-0 mt-0.5" />
                <span><strong>Direct Wholesale Item Procurement:</strong> Funds flow straight to certified wholesale merchants—zero cash diversion.</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-4 h-4 text-teal-600 mr-2 flex-shrink-0 mt-0.5" />
                <span><strong>Cryptographic Audit Ledger:</strong> Every PayPal transaction, order ref, and receipt hash is publicly verifiable.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* How It Works 4-Step Pipeline */}
      <section className="bg-slate-100/70 py-16 lg:py-24 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              End-to-End Workflow
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-3">
              How NeedBridge AI Works in 4 Simple Steps
            </h2>
            <p className="text-slate-600 text-sm mt-2">
              From emergency community submission to certified vendor delivery and public ledger record.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-subtle hover:shadow-card transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-teal-400 flex items-center justify-center font-bold text-base mb-4">
                1
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">Beneficiary Submits Need</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Community coordinators or individuals submit requested supplies, quantity, beneficiaries count, and intake proofs.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-subtle hover:shadow-card transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-base mb-4">
                2
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">AI Analyzes & Prioritizes</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Gemini AI computes an algorithmic Need Score (1-100), validates urgency, and matches local certified suppliers.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-subtle hover:shadow-card transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-teal-400 flex items-center justify-center font-bold text-base mb-4">
                3
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">Donors Support with PayPal</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Donors browse verified requests and fund exact line items via integrated PayPal checkout in secure escrow.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-subtle hover:shadow-card transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-base mb-4">
                4
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">Transparent Ledger Audit</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Supplies dispatch directly to beneficiaries. Every purchase order, payment status, and delivery receipt is cryptographically logged.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Active Needs Preview */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              Verified Urgent Requests
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
              Needs Requiring Immediate Support
            </h2>
          </div>
          <Link
            to="/donor"
            className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center space-x-1"
          >
            <span>View All Active Needs ({requests.length})</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredRequests.map((req) => (
            <div
              key={req.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-subtle hover:shadow-card transition-all flex flex-col justify-between p-5"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                    {req.category}
                  </span>
                  <UrgencyBadge urgency={req.urgency} size="xs" />
                </div>

                <Link
                  to={`/donor/requests/${req.id}`}
                  className="block group"
                >
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-teal-700 transition-colors line-clamp-2 mb-2 leading-snug">
                    {req.title}
                  </h3>
                </Link>

                <p className="text-xs text-slate-500 line-clamp-2 mb-4">
                  {req.description}
                </p>

                <div className="flex items-center justify-between text-xs text-slate-600 mb-3 py-2 border-y border-slate-100">
                  <span>Beneficiaries: <strong className="text-slate-900">{req.beneficiariesCount} people</strong></span>
                  <AiScoreBadge score={req.aiScore} size="sm" />
                </div>
              </div>

              <div>
                <ProgressBar raised={req.fundsRaised} target={req.estimatedBudget} size="sm" />
                <div className="mt-4 flex gap-2">
                  <Link
                    to={`/donor/requests/${req.id}`}
                    className="w-full py-2 rounded-xl text-center font-bold text-xs bg-slate-900 hover:bg-slate-800 text-white transition-colors"
                  >
                    View Details & Support
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="bg-slate-900 py-16 text-white border-t border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Join the Next Generation of Philanthropy</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Experience Transparent, AI-Matched Community Aid?
          </h2>

          <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
            Test the interactive hackathon demonstration today. Submit an emergency need as a beneficiary, inspect AI scoring, fund as a donor with PayPal, and audit the public ledger.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
            <button
              onClick={() => handleRoleExplore('donor', '/donor')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm transition-all shadow-md"
            >
              Start as Donor Demo
            </button>
            <button
              onClick={() => handleRoleExplore('beneficiary', '/beneficiary/new-request')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm border border-slate-700 transition-all"
            >
              Start as Beneficiary Demo
            </button>
            <Link
              to="/admin"
              className="w-full sm:w-auto px-6 py-3 rounded-xl text-slate-400 hover:text-white font-bold text-sm transition-colors"
            >
              Inspect Admin Queue &rarr;
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
