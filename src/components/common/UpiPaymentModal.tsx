import React, { useState } from 'react';
import { formatRupees } from '../../business-logic';
import { CheckCircle, ShieldCheck, X, Sparkles, MapPin, Store, Clock } from 'lucide-react';
import { UpiQrCode } from './UpiQrCode';

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
  const [tempOrderId] = useState(() => `ORD-${Math.floor(1000 + Math.random() * 9000)}`);

  if (!isOpen) return null;

  return (
    <div
      id="upi-payment-modal-backdrop"
      className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in"
    >
      <div
        id="upi-payment-modal-card"
        className="delivo-card-glass w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
        style={{
          borderRadius: '28px',
          border: '1px solid rgba(255, 255, 255, 0.16)',
          borderTop: '1px solid rgba(255, 255, 255, 0.35)',
          background: 'linear-gradient(180deg, #181922 0%, #0F1017 100%)',
        }}
      >
        {/* Header with clean padding and close button */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/[0.03]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#FD6931] to-[#E04B28] text-white flex items-center justify-center font-black font-mono text-xs shadow-[0_4px_16px_rgba(253,105,49,0.35)]">
              UPI
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base tracking-tight flex items-center gap-2">
                <span>Scan & Pay via UPI</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Instant
                </span>
              </h3>
              <p className="text-xs text-neutral-400">Zero surcharge • Direct vendor settlement</p>
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

        {/* Scrollable Content with comfortable spacing */}
        <div className="p-6 space-y-5 overflow-y-auto hide-scrollbar flex-1">
          {/* Order Summary & Destination Card */}
          <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between text-xs text-neutral-300">
              <span className="flex items-center gap-1.5 text-neutral-400 font-medium">
                <Store size={14} className="text-[#FD6931]" />
                <span>Vendor:</span>
              </span>
              <span className="font-extrabold text-white">{vendorName}</span>
            </div>

            <div className="flex items-center justify-between text-xs text-neutral-300">
              <span className="flex items-center gap-1.5 text-neutral-400 font-medium">
                <MapPin size={14} className="text-[#FD6931]" />
                <span>Deliver To:</span>
              </span>
              <span className="font-bold text-white">
                {hostelBlock} • Rm {roomNumber}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-neutral-300">
              <span className="flex items-center gap-1.5 text-neutral-400 font-medium">
                <Clock size={14} className="text-[#FD6931]" />
                <span>Slot Window:</span>
              </span>
              <span className="font-bold text-[#FD6931]">{slotLabel}</span>
            </div>

            <div className="pt-2 border-t border-white/8 flex items-center justify-between text-xs font-semibold text-neutral-300">
              <span>Food: {formatRupees(subtotal)} + Delivery: {formatRupees(deliveryFee)}</span>
              <span className="text-white font-extrabold font-mono text-sm">{formatRupees(amount)}</span>
            </div>
          </div>

          {/* Real Scannable High-Res QR Code Component */}
          <UpiQrCode
            vpa={vpa}
            upiName={upiName}
            amount={amount}
            orderId={tempOrderId}
            size={210}
            showDetails={true}
          />
        </div>

        {/* Footer Actions with generous height and tap area */}
        <div className="p-5 border-t border-white/10 bg-white/[0.02] flex flex-col gap-3">
          <button
            id="confirm-upi-payment-btn"
            disabled={isProcessing}
            onClick={onConfirmPayment}
            className="delivo-btn-primary w-full h-[52px] text-sm font-extrabold flex items-center justify-center gap-2 rounded-2xl shadow-lg transition-transform active:scale-98 disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Placing Order & Notifying Vendor...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                <span>I Have Paid {formatRupees(amount)} — Place Order</span>
              </>
            )}
          </button>

          <p className="text-[11px] text-center text-neutral-400 flex items-center justify-center gap-1.5 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Order goes to kitchen vendor immediately upon confirmation</span>
          </p>
        </div>
      </div>
    </div>
  );
};
