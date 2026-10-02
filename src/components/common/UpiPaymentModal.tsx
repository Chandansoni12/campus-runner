import React, { useState } from 'react';
import { generateUpiLink, formatRupees } from '../../business-logic';
import { QrCode, Smartphone, ExternalLink, CheckCircle, ShieldCheck, X, Copy, Check } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirmPayment: () => void;
  amount: number;
  subtotal: number;
  deliveryFee: number;
  vpa: string;
  upiName: string;
  hostelBlock: string;
  roomNumber: string;
  slotLabel: string;
  vendorName: string;
  isProcessing?: boolean;
}

export const UpiPaymentModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onConfirmPayment,
  amount,
  subtotal,
  deliveryFee,
  vpa,
  upiName,
  hostelBlock,
  roomNumber,
  slotLabel,
  vendorName,
  isProcessing = false,
}) => {
  const [copied, setCopied] = useState(false);
  const tempOrderId = `TMP-${Math.floor(1000 + Math.random() * 9000)}`;

  if (!isOpen) return null;

  const upiLink = generateUpiLink({
    vpa,
    name: upiName,
    amount,
    orderId: tempOrderId,
  });

  const handleCopyVpa = () => {
    navigator.clipboard.writeText(vpa);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      id="upi-payment-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in"
    >
      <div
        id="upi-payment-modal-card"
        className="delivo-card-glass w-full max-w-md overflow-hidden shadow-2xl flex flex-col"
        style={{ borderRadius: '28px', border: '1px solid rgba(255, 255, 255, 0.15)', borderTop: '1px solid rgba(255, 255, 255, 0.3)' }}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-[#FD6931] flex items-center justify-center font-extrabold font-mono text-xs border border-orange-500/35 shadow-[0_0_12px_rgba(253,105,49,0.25)]">
              UPI
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base tracking-tight">Scan & Pay via UPI</h3>
              <p className="text-xs text-neutral-400">Direct campus settlement — Zero gateway fees</p>
            </div>
          </div>
          <button
            id="close-upi-modal-btn"
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto hide-scrollbar">
          {/* Amount Due Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-500/15 to-transparent border border-orange-500/30 text-center shadow-[0_8px_20px_rgba(253,105,49,0.1)]">
            <div className="text-[11px] text-orange-200 uppercase tracking-widest font-mono font-bold">Total Payable</div>
            <div className="text-3xl font-extrabold text-white mt-1 font-mono tracking-tight text-[#FD6931]">
              {formatRupees(amount)}
            </div>
            <div className="text-[11px] text-neutral-300 mt-2 flex items-center justify-center gap-3 font-medium">
              <span>Food: {formatRupees(subtotal)}</span>
              <span>•</span>
              <span>Delivery: {formatRupees(deliveryFee)}</span>
            </div>
          </div>

          {/* QR Code and VPA details */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col items-center text-center">
            {/* Styled QR Code Simulator */}
            <div className="w-36 h-36 bg-white p-2.5 rounded-2xl flex items-center justify-center shadow-xl relative group">
              {/* QR Image representation using SVG patterns */}
              <svg className="w-full h-full text-neutral-900" viewBox="0 0 100 100" fill="currentColor">
                <rect x="0" y="0" width="30" height="30" rx="3" />
                <rect x="5" y="5" width="20" height="20" fill="white" />
                <rect x="9" y="9" width="12" height="12" />
                
                <rect x="70" y="0" width="30" height="30" rx="3" />
                <rect x="75" y="5" width="20" height="20" fill="white" />
                <rect x="79" y="9" width="12" height="12" />

                <rect x="0" y="70" width="30" height="30" rx="3" />
                <rect x="5" y="75" width="20" height="20" fill="white" />
                <rect x="9" y="79" width="12" height="12" />

                <circle cx="50" cy="50" r="8" fill="#FD6931" />
                <rect x="40" y="10" width="6" height="20" />
                <rect x="52" y="15" width="10" height="6" />
                <rect x="35" y="75" width="15" height="6" />
                <rect x="65" y="45" width="8" height="18" />
                <rect x="45" y="65" width="18" height="6" />
                <rect x="75" y="75" width="15" height="15" />
              </svg>
            </div>
            <p className="text-[11px] text-neutral-400 mt-2 font-medium">Scan with Google Pay, PhonePe, Paytm, or BHIM</p>

            {/* VPA ID with copy */}
            <div className="mt-3 flex items-center justify-between w-full max-w-xs bg-black/40 px-3.5 py-2 rounded-xl border border-white/10 text-xs font-mono">
              <span className="text-neutral-200 truncate">{vpa}</span>
              <button
                id="copy-vpa-btn"
                onClick={handleCopyVpa}
                className="text-[#FD6931] hover:text-orange-300 ml-2 flex items-center gap-1 font-sans text-[11px] font-bold"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Delivery Target Details */}
          <div className="text-xs space-y-2 p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
            <div className="flex justify-between text-neutral-300">
              <span className="text-neutral-400 font-medium">Vendor:</span>
              <span className="font-bold text-white">{vendorName}</span>
            </div>
            <div className="flex justify-between text-neutral-300">
              <span className="text-neutral-400 font-medium">Delivery To:</span>
              <span className="font-bold text-white">{hostelBlock}, Rm {roomNumber}</span>
            </div>
            <div className="flex justify-between text-neutral-300">
              <span className="text-neutral-400 font-medium">Slot Window:</span>
              <span className="font-bold text-[#FD6931]">{slotLabel}</span>
            </div>
          </div>

          {/* Direct UPI App Deep Link for Mobile */}
          <a
            id="upi-deep-link-anchor"
            href={upiLink}
            className="w-full py-3 px-4 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/15 text-white flex items-center justify-center gap-2 text-xs font-semibold transition-all active:scale-[0.98]"
          >
            <Smartphone className="w-4 h-4 text-[#FD6931]" />
            <span>Open in Phone UPI App</span>
            <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
          </a>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-white/10 bg-white/[0.02] flex flex-col gap-2.5">
          <button
            id="confirm-upi-payment-btn"
            disabled={isProcessing}
            onClick={onConfirmPayment}
            className="delivo-btn-primary w-full h-[52px] text-sm flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            <span>{isProcessing ? 'Verifying & Placing Order...' : 'I Have Paid — Place Order'}</span>
          </button>
          <p className="text-[10px] text-center text-neutral-400 flex items-center justify-center gap-1 font-medium">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>Pilot Ledger Mode: Handover OTP is generated upon kitchen ready</span>
          </p>
        </div>
      </div>
    </div>
  );
};
