import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Modal } from './Modal';
import {
  Compass,
  FilePlus2,
  ShieldCheck,
  Heart,
  Layers,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Award
} from 'lucide-react';

const TOUR_STEPS = [
  {
    step: 1,
    title: 'Beneficiary Aid Intake & Real-Time Gemini AI Estimator',
    role: 'beneficiary',
    route: '/beneficiary/new-request',
    badge: 'Step 1: Intake & AI',
    description: 'Community coordinators submit emergency supply needs. Watch the live Gemini AI Need Estimator dynamically calculate vulnerability scores (1-100) and urgency tiers as you adjust inputs.',
    actionLabel: 'Go to Submit Aid Request'
  },
  {
    step: 2,
    title: 'Admin Verification Queue & Governance',
    role: 'admin',
    route: '/admin',
    badge: 'Step 2: Governance',
    description: 'Auditors inspect submitted requests, review attached intake manifests, examine AI anomaly flags, and execute 1-click "Authorize for Donor Portal" or "Reject".',
    actionLabel: 'Go to Admin Review Queue'
  },
  {
    step: 3,
    title: 'Donor Discovery Marketplace & Multi-Filters',
    role: 'donor',
    route: '/donor',
    badge: 'Step 3: Discovery',
    description: 'Donors explore verified community needs filtered by category, urgency tier, and location. Toggle between responsive Card Grid and Table views.',
    actionLabel: 'Go to Donor Marketplace'
  },
  {
    step: 4,
    title: 'Direct PayPal Escrow Funding Experience',
    role: 'donor',
    route: '/donor/requests/REQ-2024-101',
    badge: 'Step 4: PayPal Checkout',
    description: 'Inspect full situation manifests and pledge support through simulated PayPal Express Sandbox checkout. 100% of pledges are locked for certified wholesale item dispatch.',
    actionLabel: 'View Featured Request & Support'
  },
  {
    step: 5,
    title: 'Public Cryptographic Ledger & Audit Receipts',
    role: 'donor',
    route: '/transparency',
    badge: 'Step 5: Transparency',
    description: 'Every settled transaction is linked to wholesale purchase orders and chained with SHA-256 ledger hashes. Review and print official non-profit audit receipts.',
    actionLabel: 'Inspect Public Ledger'
  }
];

export const JudgeGuideModal = ({ isOpen, onClose }) => {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const { switchRole } = useAuth();
  const navigate = useNavigate();

  const currentStep = TOUR_STEPS[activeStepIndex];

  const handleTeleport = () => {
    switchRole(currentStep.role);
    navigate(currentStep.route);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="🏆 Hackathon Judging Demonstration Tour"
      maxWidth="max-w-xl"
    >
      <div className="space-y-5">
        {/* Step Tabs */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 overflow-x-auto">
          {TOUR_STEPS.map((s, idx) => (
            <button
              key={s.step}
              onClick={() => setActiveStepIndex(idx)}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                activeStepIndex === idx
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${
                activeStepIndex === idx ? 'bg-teal-400 text-slate-900' : 'bg-slate-200 text-slate-700'
              }`}>
                {s.step}
              </span>
              <span className="hidden sm:inline">Step {s.step}</span>
            </button>
          ))}
        </div>

        {/* Step Highlight Box */}
        <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl border border-slate-700 shadow-card space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
              {currentStep.badge}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Role: <strong className="text-white capitalize">{currentStep.role}</strong>
            </span>
          </div>

          <h3 className="text-base font-bold text-white leading-snug">
            {currentStep.title}
          </h3>

          <p className="text-xs text-slate-300 leading-relaxed">
            {currentStep.description}
          </p>

          <div className="pt-2 flex items-center justify-between text-xs">
            <button
              onClick={handleTeleport}
              className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold flex items-center space-x-1.5 transition-colors shadow-sm"
            >
              <span>{currentStep.actionLabel}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <span className="text-slate-400 text-[11px]">
              Step {activeStepIndex + 1} of {TOUR_STEPS.length}
            </span>
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between pt-2">
          <button
            disabled={activeStepIndex === 0}
            onClick={() => setActiveStepIndex(prev => Math.max(0, prev - 1))}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              activeStepIndex === 0
                ? 'text-slate-300 cursor-not-allowed'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            &larr; Previous Step
          </button>

          <button
            disabled={activeStepIndex === TOUR_STEPS.length - 1}
            onClick={() => setActiveStepIndex(prev => Math.min(TOUR_STEPS.length - 1, prev + 1))}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              activeStepIndex === TOUR_STEPS.length - 1
                ? 'text-slate-300 cursor-not-allowed'
                : 'text-slate-900 hover:bg-slate-100'
            }`}
          >
            Next Step &rarr;
          </button>
        </div>
      </div>
    </Modal>
  );
};

