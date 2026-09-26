import React from 'react';
import { Order, OrderStatus } from '../../types';
import {
  X,
  CheckCircle2,
  Clock,
  Flame,
  PackageCheck,
  Bike,
  ShieldCheck,
  Phone,
  MapPin,
  ChevronRight,
  Sparkles,
  KeyRound,
} from 'lucide-react';

interface OrderTrackingModalProps {
  isOpen: boolean;
  order: Order | null;
  onClose: () => void;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({ isOpen, order, onClose }) => {
  if (!isOpen || !order) return null;

  const steps = [
    { key: OrderStatus.PLACED, label: 'Order Placed', desc: 'Received by Stall', icon: Clock },
    { key: OrderStatus.PREPARING, label: 'Kitchen Preparing', desc: 'Chef cooking fresh', icon: Flame },
    { key: OrderStatus.READY, label: 'Ready for Runner', desc: 'Dispatched to queue', icon: PackageCheck },
    { key: OrderStatus.OUT_FOR_DELIVERY, label: 'Out for Delivery', desc: 'Runner on campus route', icon: Bike },
    { key: OrderStatus.DELIVERED, label: 'Handed Over', desc: 'Verified with OTP', icon: ShieldCheck },
  ];

  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PLACED:
        return 0;
      case OrderStatus.ACCEPTED:
      case OrderStatus.PREPARING:
        return 1;
      case OrderStatus.READY:
        return 2;
      case OrderStatus.OUT_FOR_DELIVERY:
        return 3;
      case OrderStatus.DELIVERED:
        return 4;
      default:
        return 0;
    }
  };

  const currentStepIdx = getStepIndex(order.status);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#12151C] border border-white/15 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 bg-[#161920] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Bike className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white">Live Delivery Tracker</h3>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-white/10 text-slate-300">
                  #{order.id}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Stall: {order.vendorName}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-5">
          {/* Secret OTP Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#FF5E3A]/20 to-[#FF9500]/20 border border-[#FF5E3A]/30 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FF5E3A] text-white flex items-center justify-center glow-orange-sm">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] uppercase font-mono font-bold text-[#FF9500] tracking-wider block">
                  Handover OTP Security
                </span>
                <span className="text-xs text-slate-200 font-medium">Show code to runner at gate</span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-2xl font-mono font-extrabold tracking-widest text-white bg-black/40 px-3 py-1 rounded-xl border border-white/20">
                {order.otpCode}
              </div>
            </div>
          </div>

          {/* Mini-Map Visual Simulation */}
          <div className="relative h-44 rounded-2xl bg-[#1A1E27] border border-white/10 overflow-hidden flex flex-col justify-between p-4">
            {/* Background SVG Grid / Route Representation */}
            <svg className="absolute inset-0 w-full h-full opacity-25 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-slate-500" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#grid)" />
              {/* Animated Route Line */}
              <path
                d="M 40 120 Q 150 40 320 100"
                fill="none"
                stroke="#FF5E3A"
                strokeWidth="4"
                strokeDasharray="6 6"
                className="animate-pulse"
              />
            </svg>

            <div className="relative z-10 flex justify-between items-start text-xs">
              <div className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 text-slate-200 font-bold flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#FF5E3A]" />
                <span>Food Court Stall A</span>
              </div>

              <div className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 text-slate-200 font-bold flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>{order.hostelBlock} • Rm {order.roomNumber}</span>
              </div>
            </div>

            {/* Runner Moving Marker */}
            <div className="relative z-10 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 bg-[#FF5E3A]/20 border border-[#FF5E3A]/40 px-3 py-1.5 rounded-xl text-white font-bold backdrop-blur-md">
                <Bike className="w-4 h-4 text-[#FF5E3A] animate-bounce" />
                <span>
                  {order.status === OrderStatus.OUT_FOR_DELIVERY
                    ? 'Runner En Route (~8 mins)'
                    : order.status === OrderStatus.PREPARING
                    ? 'Kitchen Cooking...'
                    : 'Order Placed'}
                </span>
              </div>

              <span className="text-[11px] font-mono text-slate-400 bg-black/50 px-2 py-1 rounded-lg border border-white/10">
                Gated Route
              </span>
            </div>
          </div>

          {/* Stepper Timeline Progress */}
          <div className="space-y-3 py-1">
            <h4 className="text-xs font-extrabold uppercase font-mono tracking-wider text-slate-400">
              Live Status Timeline
            </h4>

            <div className="space-y-2.5">
              {steps.map((step, idx) => {
                const Icon = step.icon;
                const isDone = idx <= currentStepIdx;
                const isCurrent = idx === currentStepIdx;

                return (
                  <div
                    key={step.key}
                    className={`flex items-center gap-3 p-2.5 rounded-2xl border transition-all ${
                      isCurrent
                        ? 'bg-[#FF5E3A]/15 border-[#FF5E3A]/40 text-white glow-orange-sm'
                        : isDone
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-slate-200'
                        : 'bg-white/5 border-white/5 text-slate-500 opacity-60'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-bold ${
                        isCurrent
                          ? 'bg-[#FF5E3A] text-white'
                          : isDone
                          ? 'bg-emerald-500 text-black'
                          : 'bg-white/10 text-slate-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">{step.label}</span>
                        {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                      </div>
                      <p className="text-[11px] text-slate-400 font-medium truncate">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Runner Contact Card */}
          {order.runnerName && (
            <div className="glass-card p-3.5 rounded-2xl border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden border border-white/20">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200"
                    alt={order.runnerName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-white">{order.runnerName}</h5>
                  <p className="text-[11px] text-slate-400 font-medium">Assigned Student Runner</p>
                </div>
              </div>

              <a
                href={`tel:${order.runnerPhone || '9811122233'}`}
                className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Runner</span>
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#161920] border-t border-white/10 text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 font-bold text-xs transition-colors"
          >
            Close Tracker
          </button>
        </div>
      </div>
    </div>
  );
};
