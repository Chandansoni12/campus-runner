import React, { useState } from 'react';
import { useAppStore } from '../../store';
import { OrderStatus } from '../../types';
import { calculateRunnerPayout, formatRupees } from '../../business-logic';
import { OrderStatusBadge } from '../common/OrderStatusBadge';
import { SlotBadge } from '../common/SlotBadge';
import confetti from 'canvas-confetti';
import {
  Bike,
  Package,
  KeyRound,
  CheckCircle2,
  Clock,
  MapPin,
  TrendingUp,
  AlertCircle,
  Phone,
  ShieldCheck,
  X,
  ChevronDown,
  Navigation,
  ArrowRight,
  LogOut,
  Zap,
} from 'lucide-react';

export const RunnerView: React.FC = () => {
  const {
    currentUser,
    activeRunnerId,
    setActiveRunnerId,
    users,
    orders,
    logout,
    runnerPickUpOrder,
    runnerDeliverOrder,
  } = useAppStore();

  const [otpModalOrderId, setOtpModalOrderId] = useState<string | null>(null);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'mission' | 'completed'>('mission');
  const [missionPage, setMissionPage] = useState(0);
  const [completedPage, setCompletedPage] = useState(0);

  const runners = users.filter((u) => u.role === 'RUNNER');
  const activeRunner = users.find((u) => u.id === activeRunnerId) || currentUser;

  // Orders assigned to this runner
  const runnerOrders = orders.filter((o) => o.runnerId === activeRunner.id);

  // Active batch (orders not yet delivered)
  const activeBatch = runnerOrders.filter(
    (o) =>
      o.status === OrderStatus.READY ||
      o.status === OrderStatus.OUT_FOR_DELIVERY ||
      o.status === OrderStatus.PREPARING
  );

  // Completed deliveries today
  const completedOrders = runnerOrders.filter((o) => o.status === OrderStatus.DELIVERED);

  // Payout calculation using Section 6 pure function:
  // Base ₹18/delivery + ₹25 batch bonus if batch size >= 6
  const totalDeliveriesCount = completedOrders.length;
  const runnerEarnings = calculateRunnerPayout(totalDeliveriesCount);
  const baseEarnings = totalDeliveriesCount * 18;
  const batchBonus = totalDeliveriesCount >= 6 ? 25 : 0;

  const handleOpenOtpModal = (orderId: string) => {
    setOtpModalOrderId(orderId);
    setEnteredOtp('');
    setOtpError(null);
  };

  const handleVerifyOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpModalOrderId) return;

    if (!enteredOtp || enteredOtp.trim().length !== 4) {
      setOtpError('Please enter a valid 4-digit numeric OTP provided by the student.');
      return;
    }

    const res = runnerDeliverOrder(otpModalOrderId, enteredOtp.trim());
    if (res.success) {
      // Confetti celebration
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
      setOtpModalOrderId(null);
      setEnteredOtp('');
      setOtpError(null);
    } else {
      setOtpError(res.error || 'Incorrect OTP code. Ask student to check active order screen.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', overflow: 'hidden', position: 'relative' }}>
      
      {/* ─── 1. COMPACT MODERN RUNNER HEADER ─── */}
      <header className="modern-header">
        <div className="modern-header-top">
          {/* Runner Shift Selector Chip */}
          <div className="location-chip-btn">
            <span className="delivery-speed-badge">
              <Zap size={11} fill="#34D399" color="#34D399" />
              <span>ON DUTY</span>
            </span>
            <div className="relative flex items-center gap-1">
              <select
                value={activeRunner.id}
                onChange={(e) => setActiveRunnerId(e.target.value)}
                className="appearance-none bg-transparent text-white text-xs font-bold pr-4 focus:outline-none cursor-pointer"
              >
                {runners.map((r) => (
                  <option key={r.id} value={r.id} className="bg-neutral-900 text-white">
                    {r.name}
                  </option>
                ))}
              </select>
              <ChevronDown size={12} color="#9CA3AF" />
            </div>
          </div>

          {/* Shift Payout & Logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
              <span>{formatRupees(runnerEarnings)}</span>
            </div>

            <button
              type="button"
              onClick={logout}
              className="w-9 h-9 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center hover:bg-rose-500/25 transition-all cursor-pointer"
              title="Log out of Runner Fleet"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>

        {/* Compact 3-KPI Metric Row */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-2 text-center">
            <div className="text-[9.5px] text-neutral-400 font-bold uppercase tracking-wider">Shift Payout</div>
            <div className="text-sm font-black text-white">{formatRupees(runnerEarnings)}</div>
          </div>
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-2 text-center">
            <div className="text-[9.5px] text-neutral-400 font-bold uppercase tracking-wider">Delivered</div>
            <div className="text-sm font-black text-emerald-400">{completedOrders.length}</div>
          </div>
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-2 text-center">
            <div className="text-[9.5px] text-orange-400 font-bold uppercase tracking-wider">Active Run</div>
            <div className="text-sm font-black text-orange-400">{activeBatch.length}</div>
          </div>
        </div>
      </header>

      {/* ─── 2. MAIN SCROLLABLE CONTENT ─── */}
      <div className="flex-1 overflow-y-auto hide-scrollbar px-4 pt-3" style={{ paddingBottom: '96px' }}>
        {/* ACTIVE DELIVERIES */}
        {activeTab === 'mission' && (
        <div className="flex-1 flex flex-col min-h-0 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Navigation className="w-5 h-5 text-indigo-400" />
                Current Mission
              </h2>
              <p className="text-sm text-neutral-400">Assigned pick-ups and drop-offs for this run.</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-xs font-bold text-neutral-300">
              Rate: ₹18/drop
            </div>
          </div>

          {activeBatch.length === 0 ? (
            <div className="bg-neutral-900/40 border border-dashed border-white/10 rounded-3xl p-10 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-neutral-800/50 flex items-center justify-center mb-4 text-neutral-500">
                <Package className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">No Active Deliveries</h3>
              <p className="text-sm text-neutral-400 max-w-sm">You're currently idle. Orders will appear here once dispatched by the admin.</p>
            </div>
          ) : (
            <>
            <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-4">
              {activeBatch.slice(missionPage * 2, (missionPage + 1) * 2).map((order) => {
                const isReadyForPickup = order.status === OrderStatus.READY;
                const isOutForDelivery = order.status === OrderStatus.OUT_FOR_DELIVERY;
                const isKitchenCooking = order.status === OrderStatus.PREPARING || order.status === OrderStatus.PLACED;

                return (
                  <div key={order.id} className="bg-neutral-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-1.5 overflow-hidden shadow-xl transition-all">
                    <div className="p-4">
                      {/* Card Top: Status & ID */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-base font-black text-white">{order.id}</span>
                          <OrderStatusBadge status={order.status} size="sm" />
                        </div>
                        <SlotBadge slot={order.slot} size="sm" />
                      </div>

                      {/* Timeline / Route Visualization */}
                      <div className="relative pl-6 py-2 space-y-6 before:absolute before:inset-y-4 before:left-2.5 before:w-0.5 before:bg-white/10">
                        
                        {/* Step 1: Pickup */}
                        <div className="relative">
                          <div className={`absolute left-[-22px] top-1 w-3 h-3 rounded-full border-2 border-black z-10 ${isReadyForPickup || isOutForDelivery ? 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.8)]' : 'bg-neutral-600'}`} />
                          <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">Pick up from</div>
                          <div className="text-base font-bold text-white leading-tight mb-1">{order.vendorName}</div>
                          <div className="text-xs text-neutral-400">
                            {order.items.reduce((acc, i) => acc + i.quantity, 0)} items • {order.items.map(i => i.name).join(', ')}
                          </div>
                        </div>

                        {/* Step 2: Dropoff */}
                        <div className="relative">
                          <div className={`absolute left-[-22px] top-1 w-3 h-3 rounded-full border-2 border-black z-10 ${isOutForDelivery ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]' : 'bg-neutral-600'}`} />
                          <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">Deliver to</div>
                          <div className="flex items-center justify-between">
                            <div className="text-base font-bold text-white leading-tight">
                              {order.hostelBlock} <span className="text-indigo-400 mx-1">•</span> Room {order.roomNumber}
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                             <div className="text-xs text-neutral-400 font-medium">Customer: {order.studentName}</div>
                             <a href={`tel:${order.studentPhone}`} className="bg-white/10 hover:bg-white/20 transition-colors rounded-full p-2 flex items-center justify-center text-white">
                               <Phone className="w-3.5 h-3.5" />
                             </a>
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Actions Area */}
                    <div className="bg-black/30 p-2 rounded-2xl">
                      {isKitchenCooking && (
                        <div className="py-3 px-4 text-center text-sm font-bold text-neutral-500 flex items-center justify-center gap-2">
                           <Clock className="w-4 h-4 animate-spin-slow" /> Kitchen is preparing items...
                        </div>
                      )}

                      {isReadyForPickup && (
                        <button
                          onClick={() => runnerPickUpOrder(order.id)}
                          className="w-full py-4 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-900/30 transition-all active:scale-[0.98]"
                        >
                          <Package className="w-5 h-5" />
                          Confirm Pickup From Vendor
                        </button>
                      )}

                      {isOutForDelivery && (
                        <button
                          onClick={() => handleOpenOtpModal(order.id)}
                          className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/30 transition-all active:scale-[0.98]"
                        >
                          <KeyRound className="w-5 h-5" />
                          Handover & Enter OTP
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Pagination Controls */}
            {activeBatch.length > 2 && (
              <div className="flex items-center justify-between pt-3 mt-auto border-t border-white/5">
                <button
                  onClick={() => setMissionPage(p => Math.max(0, p - 1))}
                  disabled={missionPage === 0}
                  className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 ${missionPage === 0 ? 'opacity-30 cursor-not-allowed text-neutral-500' : 'bg-white/10 text-white hover:bg-white/20'}`}
                >
                  Prev
                </button>
                <div className="text-[10px] font-mono text-neutral-400">
                  Page {missionPage + 1} / {Math.ceil(activeBatch.length / 2)}
                </div>
                <button
                  onClick={() => setMissionPage(p => Math.min(Math.ceil(activeBatch.length / 2) - 1, p + 1))}
                  disabled={missionPage >= Math.ceil(activeBatch.length / 2) - 1}
                  className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 ${missionPage >= Math.ceil(activeBatch.length / 2) - 1 ? 'opacity-30 cursor-not-allowed text-neutral-500' : 'bg-indigo-500 text-white hover:bg-indigo-400'}`}
                >
                  Next
                </button>
              </div>
            )}
            </>
          )}
        </div>
        )}

        {/* COMPLETED LOG */}
        {activeTab === 'completed' && (
          <div className="flex-1 flex flex-col min-h-0 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {completedOrders.length === 0 ? (
              <div className="bg-neutral-900/40 border border-dashed border-white/10 rounded-3xl p-10 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-neutral-800/50 flex items-center justify-center mb-4 text-neutral-500">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">No Completed Drops</h3>
                <p className="text-sm text-neutral-400 max-w-sm">Complete some deliveries to see your history here.</p>
              </div>
            ) : (
              <>
                <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-3">
                  {completedOrders.slice(completedPage * 4, (completedPage + 1) * 4).map((ord) => (
                    <div key={ord.id} className="bg-neutral-900/60 backdrop-blur-sm border border-emerald-500/10 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-neutral-900/80 transition-colors">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono font-bold text-white">{ord.id}</span>
                          <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/20">OTP Verified ✓</span>
                        </div>
                        <div className="text-xs text-neutral-400">
                          {ord.hostelBlock} • Rm {ord.roomNumber}
                        </div>
                      </div>
                      <div className="flex items-center sm:items-end justify-between sm:flex-col sm:text-right w-full sm:w-auto border-t sm:border-0 border-white/5 pt-2 sm:pt-0 mt-1 sm:mt-0">
                        <div className="font-mono text-base font-black text-emerald-400">+₹18</div>
                        <div className="text-[10px] text-neutral-500 font-medium">
                          {ord.deliveredAt ? new Date(ord.deliveredAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Delivered'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {completedOrders.length > 4 && (
                  <div className="flex items-center justify-between pt-3 mt-auto border-t border-white/5">
                    <button
                      onClick={() => setCompletedPage(p => Math.max(0, p - 1))}
                      disabled={completedPage === 0}
                      className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 ${completedPage === 0 ? 'opacity-30 cursor-not-allowed text-neutral-500' : 'bg-white/10 text-white hover:bg-white/20'}`}
                    >
                      Prev
                    </button>
                    <div className="text-[10px] font-mono text-neutral-400">
                      Page {completedPage + 1} / {Math.ceil(completedOrders.length / 4)}
                    </div>
                    <button
                      onClick={() => setCompletedPage(p => Math.min(Math.ceil(completedOrders.length / 4) - 1, p + 1))}
                      disabled={completedPage >= Math.ceil(completedOrders.length / 4) - 1}
                      className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 ${completedPage >= Math.ceil(completedOrders.length / 4) - 1 ? 'opacity-30 cursor-not-allowed text-neutral-500' : 'bg-emerald-500 text-white hover:bg-emerald-400'}`}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
        </div>

      {/* ─── 3. FLOATING ISLAND GLASS DOCK WITH ACTIVE CAPSULE ─── */}
      <nav className="floating-glass-dock">
        <button
          type="button"
          onClick={() => setActiveTab('mission')}
          className={`dock-tab ${activeTab === 'mission' ? 'active' : ''}`}
        >
          <Navigation size={20} />
          <span className="dock-tab-label">Mission</span>
          {activeBatch.length > 0 && (
            <span className="dock-badge-count">{activeBatch.length}</span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('completed')}
          className={`dock-tab ${activeTab === 'completed' ? 'active' : ''}`}
        >
          <CheckCircle2 size={20} />
          <span className="dock-tab-label">Completed</span>
          {completedOrders.length > 0 && (
            <span className="dock-badge-count" style={{ background: '#10B981' }}>{completedOrders.length}</span>
          )}
        </button>

        <button
          type="button"
          onClick={logout}
          className="dock-tab"
        >
          <LogOut size={20} />
          <span className="dock-tab-label">Logout</span>
        </button>
      </nav>

      {/* OTP MODAL */}
      {otpModalOrderId && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-0 sm:p-4">
          <div className="bg-neutral-900 border border-white/10 sm:rounded-3xl rounded-t-3xl p-6 w-full max-w-sm shadow-2xl animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-4 duration-300">
            
            <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6 sm:hidden" />
            
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center border border-indigo-500/30 mb-4">
                <KeyRound className="w-8 h-8 text-indigo-400" />
              </div>
              <h2 className="text-xl font-black text-white mb-2">Student Handover OTP</h2>
              <p className="text-sm text-neutral-400 px-2">Ask the student for the 4-digit code shown on their tracking screen to complete delivery.</p>
            </div>

            <form onSubmit={handleVerifyOtpSubmit}>
              <div className="mb-6">
                <input
                  type="text"
                  maxLength={4}
                  autoFocus
                  placeholder="----"
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-black/50 border-2 border-neutral-800 focus:border-indigo-500 rounded-2xl py-4 text-center text-4xl font-mono tracking-[0.5em] text-white outline-none font-black transition-colors"
                  style={{ letterSpacing: '0.7em', paddingLeft: '0.7em' }}
                />
              </div>

              {otpError && (
                <div className="mb-6 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{otpError}</span>
                </div>
              )}

              <div className="flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={enteredOtp.length !== 4}
                  className="w-full py-4 rounded-xl bg-indigo-600 disabled:bg-neutral-800 hover:bg-indigo-500 disabled:text-neutral-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg disabled:shadow-none transition-all active:scale-[0.98]"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  Verify & Complete Delivery
                </button>
                <button
                  type="button"
                  onClick={() => setOtpModalOrderId(null)}
                  className="w-full py-3 rounded-xl bg-transparent hover:bg-white/5 text-neutral-400 hover:text-white font-bold text-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
