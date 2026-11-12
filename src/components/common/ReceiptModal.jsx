import React from 'react';
import { Modal } from './Modal';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import {
  Printer,
  Download,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Building,
  QrCode
} from 'lucide-react';

export const ReceiptModal = ({ isOpen, onClose, txn }) => {
  if (!txn) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const receiptText = `
============================================================
              NEEDBRIDGE AI RELIEF FOUNDATION
        Official Non-Profit Tax-Deductible Donation Receipt
============================================================
Receipt Number:       ${txn.receiptNumber}
Date & Time:          ${formatDateTime(txn.timestamp)}
Payment Status:       ${txn.paymentStatus}
Payment Gateway:      ${txn.paymentMethod}
PayPal Auth Ref:      ${txn.payPalTransactionId || 'PAYID-MOCK-SANDBOX'}

DONOR INFORMATION:
Donor Name:           ${txn.donorName}
Donor Type:           ${txn.donorType}

HUMANITARIAN ALLOCATION:
Request ID:           ${txn.requestId}
Cause Title:          ${txn.requestTitle}
Aid Category:         ${txn.category}
Contribution Amount:  ${formatCurrency(txn.amount, txn.currency)}

SUPPLY ESCROW & DISPATCH:
Vendor Partner:       ${txn.vendorPartner}
Purchase Order Ref:   ${txn.purchaseOrderRef}
Items Procured:       ${txn.itemsFunded}

CRYPTOGRAPHIC AUDIT PROOF:
Ledger Hash:          ${txn.ledgerHash}
Previous Block:       ${txn.previousHash}

NeedBridge AI Zero-Diversion Guarantee:
100% of this contribution was escrowed and disbursed directly
to certified logistics suppliers for tangible relief supplies.
============================================================
    `.trim();

    const element = document.createElement('a');
    const file = new Blob([receiptText], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${txn.receiptNumber}_Audit_Receipt.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Official Non-Profit Audit Receipt"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6 print:p-0">
        {/* Printable Card */}
        <div id="printable-receipt" className="p-6 bg-white border border-slate-200 rounded-2xl shadow-subtle space-y-5 print:border-none print:shadow-none">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-200 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-teal-400 flex items-center justify-center font-bold text-sm">
                  NB
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">NeedBridge AI Relief Foundation</h3>
                  <p className="text-[11px] text-slate-500">501(c)(3) Simulated Non-Profit Organization</p>
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-mono font-bold text-slate-900 block">{txn.receiptNumber}</span>
              <span className="text-[10px] text-slate-400">{formatDateTime(txn.timestamp)}</span>
            </div>
          </div>

          {/* Amount Callout */}
          <div className="p-4 bg-teal-50/70 border border-teal-200/90 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-teal-800 block">
                Total Contribution Allocated
              </span>
              <span className="text-2xl font-black text-slate-900 font-mono">
                {formatCurrency(txn.amount, txn.currency)}
              </span>
            </div>
            <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-700 bg-emerald-100/60 px-3 py-1 rounded-full">
              <CheckCircle2 className="w-4 h-4" />
              <span>Settled via PayPal Escrow</span>
            </div>
          </div>

          {/* Donor & Need Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Contributor</span>
              <p className="font-bold text-slate-900">{txn.donorName}</p>
              <p className="text-slate-500 text-[11px]">{txn.donorType}</p>
              <p className="text-slate-500 text-[11px]">{txn.paymentMethod}</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Beneficiary Target</span>
              <p className="font-bold text-slate-900 truncate">{txn.requestTitle}</p>
              <p className="text-teal-700 font-semibold text-[11px]">{txn.category}</p>
              <p className="text-slate-400 font-mono text-[11px]">Request: {txn.requestId}</p>
            </div>
          </div>

          {/* Supply Dispatch Manifest */}
          <div className="border border-slate-200 rounded-xl p-3.5 text-xs space-y-2">
            <div className="flex items-center justify-between text-slate-900 font-bold border-b border-slate-100 pb-2">
              <span className="flex items-center">
                <Building className="w-3.5 h-3.5 mr-1.5 text-teal-600" />
                Wholesale Procurement Dispatch
              </span>
              <span className="font-mono text-slate-600">{txn.purchaseOrderRef}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-slate-400 block">Assigned Supplier:</span>
                <span className="font-semibold text-slate-800">{txn.vendorPartner}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Escrow Allocation:</span>
                <span className="font-semibold text-slate-800">{txn.itemsFunded}</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 italic pt-1 border-t border-slate-100">
              *Funds securely held in wholesale escrow. Tangible supplies are confirmed fulfilled following on-site logistics hub audit.
            </p>
          </div>

          {/* Cryptographic Ledger Verification */}
          <div className="p-3 bg-slate-900 text-white rounded-xl font-mono text-[11px] space-y-1.5">
            <div className="flex items-center text-teal-400 font-sans font-bold text-xs">
              <Lock className="w-3.5 h-3.5 mr-1.5" />
              <span>Cryptographic Block Verification</span>
            </div>
            <div className="truncate text-slate-300">
              <span className="text-slate-500 font-sans">Hash: </span>{txn.ledgerHash}
            </div>
            <div className="truncate text-slate-400 text-[10px]">
              <span className="text-slate-600 font-sans">Previous: </span>{txn.previousHash}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-2 pt-2 print:hidden">
          <button
            onClick={handleDownload}
            className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center space-x-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Audit Copy</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center space-x-1.5 transition-colors shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Receipt</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};

