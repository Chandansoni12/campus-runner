import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Copy, Check, Smartphone, ExternalLink, Sparkles, ShieldCheck } from 'lucide-react';
import { formatRupees } from '../../business-logic';

interface UpiQrCodeProps {
  vpa: string;
  upiName?: string;
  amount: number;
  orderId?: string;
  note?: string;
  size?: number;
  showDetails?: boolean;
}

export const UpiQrCode: React.FC<UpiQrCodeProps> = ({
  vpa,
  upiName = 'CampusRunner',
  amount,
  orderId = `ORD-${Date.now().toString().slice(-4)}`,
  note = 'Campus Food Delivery',
  size = 220,
  showDetails = true,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  // Standard UPI URI format per NPCI specification
  const encodedName = encodeURIComponent(upiName);
  const encodedNote = encodeURIComponent(`${note} #${orderId}`);
  const upiUri = `upi://pay?pa=${vpa}&pn=${encodedName}&am=${amount}&cu=INR&tn=${encodedNote}`;

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    QRCode.toDataURL(upiUri, {
      width: Math.max(size, 200),
      margin: 1,
      color: {
        dark: '#0A0B10',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => {
        if (isMounted) {
          setQrDataUrl(url);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to generate UPI QR Code:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [upiUri, size]);

  const handleCopy = () => {
    navigator.clipboard.writeText(vpa);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto">
      {/* QR Container Frame with generous spacing & clean shadows */}
      <div className="relative group p-4 bg-gradient-to-b from-white/10 to-white/5 rounded-3xl border border-white/15 shadow-2xl backdrop-blur-xl flex flex-col items-center w-full">
        {/* Top Badges */}
        <div className="flex items-center justify-between w-full px-2 mb-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500/20 border border-orange-500/40 text-[#FD6931] text-[11px] font-bold">
            <Sparkles size={12} />
            <span>Instant UPI Scan</span>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full">
            <ShieldCheck size={12} />
            <span>0% Fee</span>
          </div>
        </div>

        {/* QR Canvas Box */}
        <div
          className="relative bg-white p-3 rounded-2xl shadow-xl flex items-center justify-center overflow-hidden"
          style={{ width: `${size}px`, height: `${size}px` }}
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-2 text-neutral-600">
              <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-[11px] font-bold">Rendering QR...</span>
            </div>
          ) : qrDataUrl ? (
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={qrDataUrl}
                alt="UPI Payment QR Code"
                className="w-full h-full object-contain rounded-lg select-none"
              />
              {/* Centered subtle UPI icon overlay */}
              <div className="absolute inset-0 m-auto w-9 h-9 bg-white rounded-lg shadow-md border border-neutral-200 flex items-center justify-center pointer-events-none">
                <span className="text-[9px] font-black tracking-tight text-neutral-900 bg-orange-500/10 px-1 py-0.5 rounded text-[#FD6931]">
                  UPI
                </span>
              </div>
            </div>
          ) : (
            <div className="text-rose-500 text-xs text-center font-medium p-4">
              Unable to generate QR code. Use the UPI ID below.
            </div>
          )}
        </div>

        {/* Supported Apps Row */}
        <div className="flex items-center justify-center gap-2 mt-3 pt-3 border-t border-white/10 w-full text-[10.5px] font-medium text-neutral-400">
          <span>GPay</span>
          <span>•</span>
          <span>PhonePe</span>
          <span>•</span>
          <span>Paytm</span>
          <span>•</span>
          <span>BHIM</span>
          <span>•</span>
          <span>Cred</span>
        </div>

        {/* Amount Pill */}
        {amount > 0 && (
          <div className="mt-3 w-full text-center py-2 px-4 rounded-xl bg-orange-500/10 border border-orange-500/30">
            <div className="text-[10px] uppercase font-bold text-orange-300 tracking-wider">
              Exact Amount to Pay
            </div>
            <div className="text-2xl font-black text-white font-mono mt-0.5 text-[#FD6931]">
              {formatRupees(amount)}
            </div>
          </div>
        )}
      </div>

      {showDetails && (
        <div className="w-full space-y-2.5 mt-3">
          {/* Copyable VPA Bar */}
          <div className="flex items-center justify-between bg-black/50 border border-white/12 px-3.5 py-2.5 rounded-2xl w-full">
            <div className="min-w-0 pr-2">
              <div className="text-[9.5px] uppercase font-bold text-neutral-400">University UPI ID</div>
              <div className="text-xs font-mono font-bold text-white truncate">{vpa}</div>
            </div>

            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-[11px] font-bold transition-all active:scale-95 shrink-0 border border-white/15"
            >
              {copied ? (
                <>
                  <Check size={13} className="text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={13} className="text-orange-400" />
                  <span>Copy UPI</span>
                </>
              )}
            </button>
          </div>

          {/* Deep link for mobile users */}
          <a
            href={upiUri}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-2xl bg-white/8 hover:bg-white/12 border border-white/15 text-white text-xs font-bold transition-all active:scale-98"
          >
            <Smartphone size={14} className="text-[#FD6931]" />
            <span>Open in Installed UPI App</span>
            <ExternalLink size={12} className="text-neutral-400" />
          </a>
        </div>
      )}
    </div>
  );
};
