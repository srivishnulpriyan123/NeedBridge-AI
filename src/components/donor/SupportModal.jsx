import React, { useState, useMemo } from 'react';
import { Modal } from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useRequests } from '../../context/RequestContext';
import { PayPalButton } from './PayPalButton';
import {
  formatCurrency,
  SUPPORTED_CURRENCIES,
  getCurrencyInfo,
  convertFromUSD,
  convertToUSD
} from '../../utils/formatters';
import {
  CreditCard,
  CheckCircle2,
  Lock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building2,
  AlertTriangle,
  Info,
  Globe2
} from 'lucide-react';

export const SupportModal = ({ isOpen, onClose, request }) => {
  const { currentUser } = useAuth();
  const { refreshData, showToast, recordSuccessfulDonation } = useRequests();

  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const currencyInfo = getCurrencyInfo(selectedCurrency);

  const remainingGapUSD = request ? Math.max(0, request.estimatedBudget - (request.fundsRaised || 0)) : 0;
  const remainingGapInCurrency = Math.max(0, Math.round(convertFromUSD(remainingGapUSD, selectedCurrency)));

  // Dynamic clean presets based on currency rate
  const presets = useMemo(() => {
    const basePresets = [25, 50, 100, 250];
    if (selectedCurrency === 'USD') return basePresets;

    const rate = currencyInfo.rate || 1;
    return basePresets.map((usd) => {
      const raw = usd * rate;
      if (raw >= 1000) {
        return Math.round(raw / 500) * 500;
      } else if (raw >= 100) {
        return Math.round(raw / 50) * 50;
      } else if (raw >= 20) {
        return Math.round(raw / 5) * 5;
      }
      return Math.round(raw);
    });
  }, [selectedCurrency, currencyInfo.rate]);

  const [amount, setAmount] = useState(() => {
    return Math.min(100, remainingGapUSD > 0 ? remainingGapUSD : 50);
  });
  const [customInput, setCustomInput] = useState('');
  const [successDetails, setSuccessDetails] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // When donor changes currency dropdown
  const handleCurrencyChange = (newCode) => {
    const oldCode = selectedCurrency;
    setSelectedCurrency(newCode);

    // Convert current amount to new currency
    const amountInUSD = convertToUSD(amount, oldCode);
    const converted = Math.round(convertFromUSD(amountInUSD, newCode));
    const finalAmt = converted > 0 ? converted : (presets[1] || 50);
    setAmount(finalAmt);
    if (customInput) {
      setCustomInput(finalAmt.toString());
    }
    setErrorMessage(null);
  };

  if (!request) return null;

  const handlePresetClick = (val) => {
    setAmount(val);
    setCustomInput('');
    setErrorMessage(null);
  };

  const handleCustomChange = (e) => {
    const val = parseFloat(e.target.value) || 0;
    setCustomInput(e.target.value);
    setAmount(val);
    setErrorMessage(null);
  };

  const handleFillRemaining = () => {
    if (remainingGapInCurrency > 0) {
      setAmount(remainingGapInCurrency);
      setCustomInput(remainingGapInCurrency.toString());
      setErrorMessage(null);
    }
  };

  const handlePaymentSuccess = async (captureData) => {
    try {
      const donation = captureData.donation || {};
      const capture = captureData.capture || {};
      const paidAmt = parseFloat(donation.amount || amount);
      const paidCurrency = donation.currency || selectedCurrency;

      // Equivalent USD for updating the request's funding goal
      const equivalentUSD = convertToUSD(paidAmt, paidCurrency);

      setSuccessDetails({
        amount: paidAmt,
        currency: paidCurrency,
        equivalentUSD: Math.round(equivalentUSD),
        receiptNumber: `NB-RCP-2026-${1000 + (donation.id || 1)}`,
        orderId: capture.orderId || donation.paypal_order_id,
        captureId: capture.captureId || donation.paypal_capture_id,
        vendor: request.assignedSupplier || 'Metro Regional Logistics Hub',
        fundsRaised: captureData.request?.funds_raised || ((request.fundsRaised || 0) + equivalentUSD),
        status: 'Settled & Escrowed'
      });

      setErrorMessage(null);
      showToast(`PayPal Sandbox payment of ${formatCurrency(paidAmt, paidCurrency)} captured successfully!`, 'success');

      if (recordSuccessfulDonation) {
        recordSuccessfulDonation({
          requestId: request.rawId || request.id,
          amount: paidAmt,
          currency: paidCurrency,
          equivalentUSD,
          donationData: captureData
        });
      }
    } catch (err) {
      console.error('Error refreshing post-payment:', err);
    }
  };

  const handlePaymentError = (errMsg) => {
    setErrorMessage(errMsg);
    showToast(errMsg, 'error');
  };

  const handlePaymentCancel = () => {
    showToast('PayPal payment was cancelled by donor.', 'info');
  };

  const handleClose = () => {
    setSuccessDetails(null);
    setErrorMessage(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={successDetails ? 'Contribution Verified' : 'Support Verified Aid Need'}
      maxWidth="max-w-xl"
    >
      {successDetails ? (
        <div className="text-center py-4 space-y-4">
          <div className="w-16 h-16 rounded-full bg-teal-50 border-2 border-teal-500 text-teal-600 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <h4 className="text-xl font-bold text-slate-900">
              Thank You, {currentUser?.name || 'Generous Donor'}!
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Your contribution of <strong className="text-slate-900">{formatCurrency(successDetails.amount, successDetails.currency)}</strong>
              {successDetails.currency !== 'USD' && (
                <span className="text-slate-400"> (≈ {formatCurrency(successDetails.equivalentUSD, 'USD')})</span>
              )} has been captured via PayPal Sandbox and recorded to the public ledger.
            </p>
          </div>

          {/* Transaction Receipt Card */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-left text-xs space-y-2 font-mono">
            <div className="flex justify-between">
              <span className="text-slate-500 font-sans">Official Receipt:</span>
              <span className="font-bold text-slate-900">{successDetails.receiptNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-sans">Contribution Amount:</span>
              <span className="font-bold text-teal-700 font-sans">
                {formatCurrency(successDetails.amount, successDetails.currency)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-sans">PayPal Order ID:</span>
              <span className="text-slate-800 text-[11px]">{successDetails.orderId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-sans">PayPal Capture ID:</span>
              <span className="text-teal-700 font-bold text-[11px]">{successDetails.captureId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-sans">Settlement Channel:</span>
              <span className="text-emerald-700 font-bold">PayPal Sandbox REST API v2</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-sans">Escrow Allocation:</span>
              <span className="text-slate-800">{successDetails.vendor}</span>
            </div>
          </div>

          {/* Delivery Transparency Disclosure */}
          <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200/80 text-[11px] text-blue-900 text-left flex items-start space-x-2">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Transparency Disclosure:</strong> Payment is securely held in escrow for certified wholesale procurement. Supplies are only recorded as fulfilled after verified on-site warehouse dispatch.
            </p>
          </div>

          <button
            onClick={handleClose}
            className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 transition-colors"
          >
            Done & Return
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Need Summary */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                {request.category}
              </span>
              <span className="text-xs font-mono text-slate-400">
                ID: REQ-#{request.rawId || request.id}
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-900 mt-1.5 leading-snug">
              {request.title}
            </h4>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
              <span>Goal: {formatCurrency(request.estimatedBudget, 'USD')}</span>
              <span>
                Remaining Gap:{' '}
                <strong className="text-slate-900">
                  {selectedCurrency === 'USD'
                    ? formatCurrency(remainingGapUSD, 'USD')
                    : `${formatCurrency(remainingGapInCurrency, selectedCurrency)} (~$${remainingGapUSD})`}
                </strong>
              </span>
            </div>
          </div>

          {/* Currency Selection Dropdown */}
          <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-200/80 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Globe2 className="w-4 h-4 text-teal-700" />
              <div>
                <label className="text-xs font-bold text-slate-900 block leading-tight">
                  Your Country / Payment Currency
                </label>
                <span className="text-[10px] text-slate-500">
                  Pay in your local money via PayPal
                </span>
              </div>
            </div>

            <div className="relative">
              <select
                value={selectedCurrency}
                onChange={(e) => handleCurrencyChange(e.target.value)}
                className="pl-2.5 pr-7 py-1.5 text-xs font-bold rounded-lg border border-teal-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 cursor-pointer shadow-xs"
              >
                {SUPPORTED_CURRENCIES.map((curr) => (
                  <option key={curr.code} value={curr.code}>
                    {curr.flag} {curr.code} ({curr.symbol}) — {curr.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Amount selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700">
                Select Pledge Amount ({selectedCurrency})
              </label>
              {selectedCurrency !== 'USD' && (
                <span className="text-[10px] text-teal-700 font-semibold bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  1 USD ≈ {currencyInfo.rate} {selectedCurrency}
                </span>
              )}
            </div>

            <div className="grid grid-cols-4 gap-2 mb-3">
              {presets.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handlePresetClick(val)}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                    amount === val && !customInput
                      ? 'border-teal-600 bg-teal-50 text-teal-900 ring-2 ring-teal-500/20'
                      : 'border-slate-200 text-slate-700 hover:border-slate-300 bg-white'
                  }`}
                >
                  {formatCurrency(val, selectedCurrency)}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-2.5 text-slate-400 text-xs font-semibold">
                  {currencyInfo.symbol}
                </span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  placeholder={`Custom amount in ${selectedCurrency}`}
                  value={customInput}
                  onChange={handleCustomChange}
                  className="w-full pl-9 pr-3 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>
              {remainingGapInCurrency > 0 && (
                <button
                  type="button"
                  onClick={handleFillRemaining}
                  className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors whitespace-nowrap"
                >
                  Fund Entire Gap ({formatCurrency(remainingGapInCurrency, selectedCurrency)})
                </button>
              )}
            </div>

            {selectedCurrency !== 'USD' && amount > 0 && (
              <p className="text-[11px] text-slate-500 mt-1.5">
                ≈ {formatCurrency(convertToUSD(amount, selectedCurrency), 'USD', { decimals: 2 })} USD allocated directly towards wholesale procurement.
              </p>
            )}
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Trust & Guarantee Banner */}
          <div className="p-3 bg-teal-50/60 rounded-xl border border-teal-100 text-[11px] text-teal-900 flex items-start space-x-2.5">
            <ShieldCheck className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>NeedBridge Zero-Diversion Guarantee:</strong> 100% of your pledge is escrowed and paid directly to certified wholesale vendors.
            </p>
          </div>

          {/* PayPal Checkout Button Component */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Checkout with PayPal Sandbox ({selectedCurrency})
            </label>
            <PayPalButton
              requestId={request.rawId || request.id}
              requestTitle={request.title}
              amount={amount}
              currency={selectedCurrency}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
              onCancel={handlePaymentCancel}
              disabled={amount <= 0}
            />
          </div>
        </div>
      )}
    </Modal>
  );
};

export default SupportModal;
