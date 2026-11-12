import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRequests } from '../context/RequestContext';
import { AID_CATEGORIES, URGENCY_LEVELS } from '../data/mockCategories';
import { calculateAiScore } from '../utils/aiScorer';
import { formatCurrency } from '../utils/formatters';
import {
  FilePlus2,
  Sparkles,
  Upload,
  FileText,
  X,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Building,
  HelpCircle,
  Layers
} from 'lucide-react';

export const SubmitAidRequestPage = () => {
  const { currentUser } = useAuth();
  const { submitAidRequest } = useRequests();
  const navigate = useNavigate();

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(AID_CATEGORIES[0].name);
  const [urgency, setUrgency] = useState('High');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState('25');
  const [beneficiariesCount, setBeneficiariesCount] = useState('40');
  const [location, setLocation] = useState('Northside Community Ward 3');
  const [estimatedBudget, setEstimatedBudget] = useState('850');
  const [files, setFiles] = useState([
    { name: 'community_intake_roster.pdf', size: '1.4 MB' }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Dynamic real-time AI Scoring computation as inputs change
  const liveAiScore = useMemo(() => {
    return calculateAiScore({
      urgency,
      beneficiaries: beneficiariesCount,
      category,
      description
    });
  }, [urgency, beneficiariesCount, category, description]);

  // Handle mock file upload
  const handleFileUpload = (e) => {
    const uploadedFiles = Array.from(e.target.files);
    if (uploadedFiles.length > 0) {
      const formatted = uploadedFiles.map(f => ({
        name: f.name,
        size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`
      }));
      setFiles(prev => [...prev, ...formatted]);
    }
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    const errors = {};
    if (!title.trim()) errors.title = 'Title is required.';
    if (!description.trim() || description.length < 20) {
      errors.description = 'Please describe the situation in at least 20 characters.';
    }
    if (!beneficiariesCount || parseInt(beneficiariesCount, 10) <= 0) {
      errors.beneficiariesCount = 'Enter a valid number of beneficiaries.';
    }
    if (!estimatedBudget || parseFloat(estimatedBudget) <= 0) {
      errors.estimatedBudget = 'Enter a valid estimated budget in USD.';
    }
    if (!location.trim()) errors.location = 'Location or shelter zone is required.';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      await submitAidRequest({
        title,
        category,
        categoryId: AID_CATEGORIES.find(c => c.name === category)?.id || 'food',
        urgency,
        description,
        quantity: `${quantity || 1} units`,
        beneficiariesCount,
        location,
        estimatedBudget,
        documents: files
      });

      navigate('/beneficiary');
    } catch (err) {
      console.error('Submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-64px)] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center space-x-2 text-xs text-slate-500">
          <Link to="/beneficiary" className="hover:text-teal-600">Beneficiary Dashboard</Link>
          <span>/</span>
          <span className="text-slate-900 font-semibold">Submit Aid Request</span>
        </div>

        {/* Heading Header */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold mb-2">
              <Sparkles className="w-3 h-3 text-teal-600" />
              <span>AI-Assisted Intake Form</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Request Emergency Community Supplies
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-xl">
              Specify requested items, urgency, and affected family count. Gemini AI will evaluate vulnerability and prioritize your request for verified donors.
            </p>
          </div>

          <div className="hidden lg:block text-right">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Intake Queue</span>
            <span className="text-xs font-semibold text-emerald-600 flex items-center justify-end mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
              Fast-Track Triage Online
            </span>
          </div>
        </div>

        {/* 2-Column Grid: Form + Live AI Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Form */}
          <div className="lg:col-span-8 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-card">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Request Title */}
              <div>
                <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
                  Request Headline / Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Urgent Warm Jackets & Blankets for 35 Children in Ward 4"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`w-full px-3.5 py-2.5 text-xs font-medium rounded-xl border ${
                    formErrors.title ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                  } focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500`}
                />
                {formErrors.title && (
                  <p className="text-rose-600 text-[11px] mt-1">{formErrors.title}</p>
                )}
              </div>

              {/* Category & Urgency */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
                    Category of Aid <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs font-medium rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  >
                    {AID_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
                    Urgency Level <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs font-medium rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  >
                    {URGENCY_LEVELS.map((u) => (
                      <option key={u.value} value={u.value}>
                        {u.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
                  Detailed Situation & Need Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="Explain why the supplies are needed, current living conditions, and specific requirements for the items..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={`w-full px-3.5 py-2.5 text-xs font-medium rounded-xl border ${
                    formErrors.description ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                  } focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500`}
                />
                {formErrors.description && (
                  <p className="text-rose-600 text-[11px] mt-1">{formErrors.description}</p>
                )}
              </div>

              {/* Quantity, Beneficiaries, Budget */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
                    Quantity <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 25"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
                    Beneficiaries Count <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 40"
                    value={beneficiariesCount}
                    onChange={(e) => setBeneficiariesCount(e.target.value)}
                    className={`w-full px-3 py-2 text-xs font-medium rounded-xl border ${
                      formErrors.beneficiariesCount ? 'border-rose-400' : 'border-slate-200'
                    } focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500`}
                  />
                  {formErrors.beneficiariesCount && (
                    <p className="text-rose-600 text-[11px] mt-1">{formErrors.beneficiariesCount}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
                    Estimated Budget ($) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="10"
                    step="10"
                    placeholder="e.g. 850"
                    value={estimatedBudget}
                    onChange={(e) => setEstimatedBudget(e.target.value)}
                    className={`w-full px-3 py-2 text-xs font-medium rounded-xl border ${
                      formErrors.estimatedBudget ? 'border-rose-400' : 'border-slate-200'
                    } focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500`}
                  />
                  {formErrors.estimatedBudget && (
                    <p className="text-rose-600 text-[11px] mt-1">{formErrors.estimatedBudget}</p>
                  )}
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
                  Location / Community Ward <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Eastside Community Shelter, Sector 5"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className={`w-full px-3.5 py-2.5 text-xs font-medium rounded-xl border ${
                    formErrors.location ? 'border-rose-400' : 'border-slate-200'
                  } focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500`}
                />
                {formErrors.location && (
                  <p className="text-rose-600 text-[11px] mt-1">{formErrors.location}</p>
                )}
              </div>

              {/* Verification Document Upload (Mock) */}
              <div>
                <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
                  Verification Documents (Intake Manifest, ID Proof, Utility Notice)
                </label>
                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-5 text-center hover:border-teal-500 transition-colors bg-slate-50/50">
                  <Upload className="w-8 h-8 text-teal-600 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-800">
                    Drag and drop files here, or <span className="text-teal-600 cursor-pointer">browse</span>
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    PDF, JPG, PNG up to 10MB (Simulated upload)
                  </p>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    id="mock-file-input"
                  />
                  <label
                    htmlFor="mock-file-input"
                    className="mt-3 inline-block px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
                  >
                    Select File from Computer
                  </label>
                </div>

                {/* Uploaded File List */}
                {files.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {files.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                      >
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-teal-600" />
                          <span className="font-medium text-slate-800">{file.name}</span>
                          <span className="text-[10px] text-slate-400">({file.size})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(idx)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit CTA */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
                <Link
                  to="/beneficiary"
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center space-x-2 shadow-md"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Simulating Gemini AI Triage...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Request for Verification</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Real-Time AI Scoring Estimate Widget */}
          <div className="lg:col-span-4 space-y-5">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white border border-slate-700/80 shadow-card">
              <div className="flex items-center space-x-2 mb-3">
                <Sparkles className="w-4 h-4 text-teal-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Real-Time AI Need Estimator
                </h3>
              </div>

              <div className="flex items-baseline justify-between mb-2">
                <span className="text-3xl font-black text-teal-400">{liveAiScore.score}</span>
                <span className="text-xs text-slate-400">/ 100 Prioritization Index</span>
              </div>

              <div className="p-3 bg-slate-800/90 rounded-xl border border-slate-700 text-xs text-slate-300 space-y-1.5 mb-4">
                <div className="flex items-center justify-between font-semibold text-white">
                  <span>Assigned Tier:</span>
                  <span className="text-teal-400">{liveAiScore.priorityLevel}</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {liveAiScore.summaryReason}
                </p>
              </div>

              <div className="space-y-2 text-xs border-t border-slate-700 pt-3">
                <div className="flex justify-between text-slate-400">
                  <span>Vulnerability Factor:</span>
                  <span className="font-semibold text-white">{liveAiScore.vulnerabilityIndex}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Urgency Weighting:</span>
                  <span className="font-semibold text-white">{urgency}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Supplier Proximity:</span>
                  <span className="font-semibold text-teal-300">Active Wholesalers Ready</span>
                </div>
              </div>
            </div>

            {/* Zero-Diversion Policy Note */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-subtle text-xs space-y-2">
              <div className="flex items-center space-x-2 text-slate-900 font-bold">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                <span>Verification Policy Notice</span>
              </div>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                NeedBridge AI ensures donor trust by procuring exact supply packages from vetted vendors. Requests are reviewed by system auditors and cross-checked for duplicate relief claims.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
