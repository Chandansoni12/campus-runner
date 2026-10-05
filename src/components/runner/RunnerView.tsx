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
  Phone,
  ChevronDown,
  Navigation,
  LogOut,
  Zap,
  Sparkles,
  AlertCircle,
  MapPin,
  Store,
  ArrowRight,
  ShieldCheck,
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
    runnerClaimOrder,
  } = useAppStore();

  const [otpModalOrderId, setOtpModalOrderId] = useState<string | null>(null);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'mission' | 'available' | 'completed'>('mission');
  const [missionPage, setMissionPage] = useState(0);
  const [availablePage, setAvailablePage] = useState(0);
  const [completedPage, setCompletedPage] = useState(0);

  const runners = users.filter((u) => u.role === 'RUNNER');
  const activeRunner = users.find((u) => u.id === activeRunnerId) || currentUser;

  // Orders assigned to this runner
  const runnerOrders = orders.filter((o) => o.runnerId === activeRunner.id);

  // Active batch (orders assigned to runner and not yet delivered)
  const activeBatch = runnerOrders.filter(
    (o) =>
      o.status === OrderStatus.READY ||
      o.status === OrderStatus.OUT_FOR_DELIVERY ||
      o.status === OrderStatus.PREPARING ||
      o.status === OrderStatus.ACCEPTED ||
      o.status === OrderStatus.PLACED
  );

  // Available orders pool (confirmed by kitchen vendor, waiting for courier)
  const availableOrders = orders.filter(
    (o) =>
      !o.runnerId &&
      (o.status === OrderStatus.PREPARING ||
        o.status === OrderStatus.READY ||
        o.status === OrderStatus.ACCEPTED)
  );

  // Completed deliveries today
  const completedOrders = runnerOrders.filter((o) => o.status === OrderStatus.DELIVERED);

  // Payout calculation: Base ₹18/delivery + ₹25 batch bonus if batch size >= 6
  const totalDeliveriesCount = completedOrders.length;
  const runnerEarnings = calculateRunnerPayout(totalDeliveriesCount);
  const baseEarnings = totalDeliveriesCount * 18;
  const batchBonus = totalDeliveriesCount >= 6 ? 25 : 0;

  const handleClaimOrder = (orderId: string) => {
    const res = runnerClaimOrder(orderId, activeRunner.id);
    if (res.success) {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FD6931', '#10B981', '#6366F1'],
      });
      setActiveTab('mission');
      setMissionPage(0);
    }
  };

  const handleOpenOtpModal = (orderId: string) => {
    setOtpModalOrderId(orderId);
    setEnteredOtp('');
    setOtpError(null);
  };

  const handleVerifyOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpModalOrderId) return;

    if (!enteredOtp || enteredOtp.trim().length !== 4) {
      setOtpError('Please enter the 4-digit numeric OTP provided by the student.');
      return;
    }

    const res = runnerDeliverOrder(otpModalOrderId, enteredOtp.trim());
    if (res.success) {
      confetti({
        particleCount: 75,
        spread: 80,
        origin: { y: 0.65 },
        colors: ['#FD6931', '#10B981', '#6366F1', '#F59E0B'],
      });
      setOtpModalOrderId(null);
      setEnteredOtp('');
      setOtpError(null);
    } else {
      setOtpError(res.error || 'Incorrect OTP code. Ask student to check their tracking screen.');
    }
  };

  const MISSION_PAGE_SIZE = 4;
  const AVAILABLE_PAGE_SIZE = 4;
  const COMPLETED_PAGE_SIZE = 5;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', overflow: 'hidden', position: 'relative' }}>
      
      {/* ─── 1. COMPACT ORANGE HEADER ─── */}
      <header className="home-header">
        <div className="header-content">
          <div className="header-top">
            
            {/* Courier Profile & Switcher */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(255, 255, 255, 0.22)',
                  border: '1.5px solid rgba(255, 255, 255, 0.5)',
                  padding: '6px 12px',
                  borderRadius: '9999px',
                  color: '#FFFFFF',
                  maxWidth: '75%',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                }}
              >
                <Bike size={15} style={{ flexShrink: 0 }} />
                <select
                  value={activeRunner.id}
                  onChange={(e) => {
                    setActiveRunnerId(e.target.value);
                    setMissionPage(0);
                    setAvailablePage(0);
                    setCompletedPage(0);
                  }}
                  style={{
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    background: 'transparent',
                    border: 'none',
                    color: '#FFFFFF',
                    fontWeight: 800,
                    fontSize: '12.5px',
                    outline: 'none',
                    cursor: 'pointer',
                    width: '100%',
                  }}
                >
                  {runners.map((r) => (
                    <option key={r.id} value={r.id} style={{ background: '#18181D', color: '#FFFFFF' }}>
                      {r.name}
                    </option>
                  ))}
                </select>
                <ChevronDown size={12} style={{ flexShrink: 0, opacity: 0.8 }} />
              </div>

              <div className="portal-badge-live">
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: '#10B981',
                    boxShadow: '0 0 10px #10B981',
                  }}
                  className="animate-pulse"
                />
                <span>ON DUTY</span>
              </div>
            </div>

            {/* Shift Payout & Logout Button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              <div
                style={{
                  background: 'rgba(16, 185, 129, 0.28)',
                  border: '1px solid rgba(16, 185, 129, 0.55)',
                  color: '#A7F3D0',
                  fontSize: '11.5px',
                  fontWeight: 900,
                  padding: '5px 11px',
                  borderRadius: '9999px',
                  boxShadow: '0 2px 8px rgba(16, 185, 129, 0.2)',
                }}
              >
                {formatRupees(runnerEarnings)}
              </div>

              <button
                type="button"
                onClick={logout}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: 'rgba(0, 0, 0, 0.28)',
                  border: '1.5px solid rgba(255, 255, 255, 0.35)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
                }}
                className="active:scale-90"
                title="Log out"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>

          {/* Compact 3-KPI Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '8px' }}>
            <div className="portal-kpi-glass">
              <div className="portal-kpi-label">Shift Earnings</div>
              <div className="portal-kpi-val" style={{ color: '#6EE7B7' }}>{formatRupees(runnerEarnings)}</div>
            </div>

            <div
              className="portal-kpi-glass cursor-pointer"
              onClick={() => setActiveTab('mission')}
              style={{
                background: activeTab === 'mission' ? 'rgba(99, 102, 241, 0.35)' : 'rgba(255, 255, 255, 0.1)',
                borderColor: activeTab === 'mission' ? 'rgba(99, 102, 241, 0.6)' : 'rgba(255, 255, 255, 0.12)',
              }}
            >
              <div className="portal-kpi-label">My Run</div>
              <div className="portal-kpi-val">{activeBatch.length} missions</div>
            </div>

            <div
              className="portal-kpi-glass cursor-pointer"
              onClick={() => setActiveTab('available')}
              style={{
                background: availableOrders.length > 0 ? 'rgba(253, 105, 49, 0.35)' : 'rgba(255, 255, 255, 0.1)',
                borderColor: availableOrders.length > 0 ? 'rgba(253, 105, 49, 0.6)' : 'rgba(255, 255, 255, 0.12)',
              }}
            >
              <div className="portal-kpi-label" style={{ color: availableOrders.length > 0 ? '#FED7AA' : 'rgba(255,255,255,0.75)' }}>
                Available
              </div>
              <div className="portal-kpi-val" style={{ color: '#FFFFFF' }}>
                {availableOrders.length} pools
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ─── 2. MAIN SCROLLABLE CONTENT WITH GENEROUS SPACING ─── */}
      <div className="flex-1 overflow-y-auto hide-scrollbar px-4 pt-4" style={{ paddingBottom: '130px' }}>
        
        {/* INCOMING BROADCAST BANNER IF AVAILABLE ORDERS EXIST */}
        {availableOrders.length > 0 && activeTab !== 'available' && (
          <div
            onClick={() => setActiveTab('available')}
            className="delivo-card-glass mb-4 p-4 rounded-2xl cursor-pointer flex items-center justify-between transition-all hover:scale-[1.01] active:scale-[0.99]"
            style={{
              background: 'linear-gradient(135deg, rgba(253, 105, 49, 0.25) 0%, rgba(20, 21, 28, 0.9) 100%)',
              borderColor: 'rgba(253, 105, 49, 0.55)',
              borderTopColor: 'rgba(255, 180, 150, 0.7)',
              boxShadow: '0 8px 24px rgba(253, 105, 49, 0.25)',
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl bg-orange-500/20 text-[#FD6931] flex items-center justify-center border border-orange-500/40 shrink-0"
              >
                <Zap size={20} className="animate-pulse" />
              </div>
              <div>
                <div className="text-sm font-extrabold text-white flex items-center gap-2">
                  <span>{availableOrders.length} New Delivery Available!</span>
                  <span className="text-[10px] bg-[#FD6931] text-white font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                    Ready to Claim
                  </span>
                </div>
                <div className="text-xs text-neutral-300 mt-0.5">
                  Vendor confirmed order! Tap to accept and start delivery (+₹18).
                </div>
              </div>
            </div>

            <button
              type="button"
              className="px-3.5 py-1.5 rounded-xl bg-[#FD6931] hover:bg-[#E04B28] text-white text-xs font-bold shrink-0 flex items-center gap-1 shadow-md"
            >
              <span>Take Order</span>
              <ArrowRight size={13} />
            </button>
          </div>
        )}

        {/* ─── TAB 1: ACTIVE MISSIONS (MY RUN) ─── */}
        {activeTab === 'mission' && (
          <div className="page-transition">
            {/* Top Mission Briefing Banner */}
            <div
              className="delivo-card-glass"
              style={{
                padding: '18px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(20, 21, 28, 0.8) 100%)',
                borderColor: 'rgba(99, 102, 241, 0.4)',
                borderTopColor: 'rgba(165, 180, 252, 0.6)',
              }}
            >
              <div>
                <h2 style={{ fontSize: '16.5px', fontWeight: 800, color: '#FFFFFF', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Navigation size={18} color="#818CF8" />
                  <span>My Active Run</span>
                </h2>
                <p style={{ fontSize: '12px', color: '#9CA3AF' }}>
                  Collect from stall and hand over to student with OTP.
                </p>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: 'rgba(0, 0, 0, 0.45)',
                    padding: '5px 12px',
                    borderRadius: '9999px',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    fontSize: '11.5px',
                    fontWeight: 800,
                    color: '#818CF8',
                  }}
                >
                  Rate: ₹18 / drop
                </div>
                {totalDeliveriesCount < 6 ? (
                  <div style={{ fontSize: '10.5px', color: '#9CA3AF', marginTop: '3px' }}>
                    {6 - totalDeliveriesCount} more for ₹25 bonus
                  </div>
                ) : (
                  <div style={{ fontSize: '10.5px', color: '#34D399', fontWeight: 800, marginTop: '3px' }}>
                    ★ ₹25 Bonus Unlocked!
                  </div>
                )}
              </div>
            </div>

            {/* Empty State or Missions List */}
            {activeBatch.length === 0 ? (
              <div
                className="delivo-card-glass"
                style={{
                  padding: '48px 24px',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div
                  style={{
                    width: '68px',
                    height: '68px',
                    borderRadius: '50%',
                    background: 'rgba(99, 102, 241, 0.15)',
                    border: '1px solid rgba(99, 102, 241, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#818CF8',
                    marginBottom: '16px',
                    boxShadow: '0 0 24px rgba(99, 102, 241, 0.25)',
                  }}
                >
                  <Package size={34} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF', marginBottom: '6px' }}>
                  No Active Missions Claimed
                </h3>
                <p style={{ fontSize: '13px', color: '#9CA3AF', maxWidth: '290px', lineHeight: 1.5, marginBottom: '18px' }}>
                  {availableOrders.length > 0
                    ? `There are ${availableOrders.length} order(s) confirmed by vendors ready to be picked up!`
                    : 'When campus stall owners accept student orders, they appear in Available Orders.'}
                </p>

                {availableOrders.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('available')}
                    className="delivo-btn-primary"
                    style={{ padding: '12px 24px', fontSize: '13.5px' }}
                  >
                    <Zap size={16} />
                    <span>View & Claim Available Orders ({availableOrders.length})</span>
                  </button>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {activeBatch
                  .slice(missionPage * MISSION_PAGE_SIZE, (missionPage + 1) * MISSION_PAGE_SIZE)
                  .map((order) => {
                    const isReadyForPickup = order.status === OrderStatus.READY;
                    const isOutForDelivery = order.status === OrderStatus.OUT_FOR_DELIVERY;
                    const isKitchenCooking =
                      order.status === OrderStatus.PREPARING ||
                      order.status === OrderStatus.PLACED ||
                      order.status === OrderStatus.ACCEPTED;

                    return (
                      <div
                        key={order.id}
                        className="delivo-card-glass"
                        style={{
                          padding: '20px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '16px',
                          border: isReadyForPickup
                            ? '1.5px solid rgba(253, 105, 49, 0.7)'
                            : isOutForDelivery
                            ? '1.5px solid rgba(99, 102, 241, 0.7)'
                            : '1px solid rgba(255, 255, 255, 0.14)',
                          boxShadow: isReadyForPickup
                            ? '0 12px 32px rgba(253, 105, 49, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.25)'
                            : isOutForDelivery
                            ? '0 12px 32px rgba(99, 102, 241, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.25)'
                            : '0 12px 30px -4px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.16)',
                        }}
                      >
                        {/* Top: Order ID & Slot */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontFamily: 'monospace', fontSize: '16px', fontWeight: 900, color: '#FFFFFF' }}>
                              {order.id}
                            </span>
                            <OrderStatusBadge status={order.status} size="sm" />
                          </div>
                          <SlotBadge slot={order.slot} size="sm" />
                        </div>

                        {/* Route Timeline with comfortable spacing */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingLeft: '4px' }}>
                          
                          {/* Step 1: Pickup Point */}
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                            <div
                              style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                background: isReadyForPickup || isOutForDelivery ? '#FD6931' : '#374151',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#FFFFFF',
                                fontSize: '12px',
                                fontWeight: 900,
                                flexShrink: 0,
                                marginTop: '2px',
                                boxShadow: isReadyForPickup ? '0 0 14px rgba(253, 105, 49, 0.7)' : 'none',
                              }}
                            >
                              1
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: '10px', fontWeight: 800, color: '#FD6931', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                Stall Pickup Counter
                              </div>
                              <div style={{ fontSize: '15px', fontWeight: 800, color: '#FFFFFF', marginTop: '1px' }}>
                                {order.vendorName}
                              </div>
                              <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px' }}>
                                {order.items.reduce((acc, i) => acc + i.quantity, 0)} items ({order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')})
                              </div>
                            </div>
                          </div>

                          {/* Connector Line */}
                          <div style={{ width: '2px', height: '18px', background: 'rgba(255, 255, 255, 0.16)', marginLeft: '13px' }} />

                          {/* Step 2: Dropoff Point */}
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                            <div
                              style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                background: isOutForDelivery ? '#6366F1' : '#374151',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#FFFFFF',
                                fontSize: '12px',
                                fontWeight: 900,
                                flexShrink: 0,
                                marginTop: '2px',
                                boxShadow: isOutForDelivery ? '0 0 14px rgba(99, 102, 241, 0.7)' : 'none',
                              }}
                            >
                              2
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: '10px', fontWeight: 800, color: '#818CF8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                Hostel Gate Drop
                              </div>
                              <div style={{ fontSize: '15px', fontWeight: 800, color: '#FFFFFF', marginTop: '1px' }}>
                                {order.hostelBlock} • <span style={{ color: '#FD6931' }}>Room {order.roomNumber}</span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
                                <span style={{ fontSize: '13px', color: '#E5E7EB', fontWeight: 700 }}>
                                  {order.studentName}
                                </span>
                                {order.studentPhone && (
                                  <a
                                    href={`tel:${order.studentPhone}`}
                                    className="delivo-btn-glass"
                                    style={{
                                      padding: '5px 14px',
                                      minHeight: '32px',
                                      fontSize: '11.5px',
                                      fontWeight: 800,
                                      textDecoration: 'none',
                                      gap: '4px',
                                    }}
                                  >
                                    <Phone size={12} />
                                    <span>Call</span>
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>

                        </div>

                        {/* Action Buttons (Ergonomic 50px Height) */}
                        <div style={{ paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                          {isKitchenCooking && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              <div
                                style={{
                                  width: '100%',
                                  padding: '10px 14px',
                                  borderRadius: '16px',
                                  background: 'rgba(255, 255, 255, 0.05)',
                                  border: '1px solid rgba(255, 255, 255, 0.1)',
                                  color: '#9CA3AF',
                                  fontSize: '12px',
                                  fontWeight: 700,
                                  textAlign: 'center',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '8px',
                                }}
                              >
                                <Clock size={15} />
                                <span>Kitchen is preparing items... Head to stall counter</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => runnerPickUpOrder(order.id)}
                                className="delivo-btn-primary"
                                style={{ width: '100%', minHeight: '48px', fontSize: '13.5px' }}
                              >
                                <Package size={17} />
                                <span>Confirm Stall Pickup</span>
                              </button>
                            </div>
                          )}

                          {isReadyForPickup && (
                            <button
                              type="button"
                              onClick={() => runnerPickUpOrder(order.id)}
                              className="delivo-btn-primary"
                              style={{ width: '100%', minHeight: '50px', fontSize: '14px' }}
                            >
                              <Package size={18} />
                              <span>Pick Up Order from Stall</span>
                            </button>
                          )}

                          {isOutForDelivery && (
                            <button
                              type="button"
                              onClick={() => handleOpenOtpModal(order.id)}
                              className="delivo-btn-indigo"
                              style={{ width: '100%', minHeight: '50px', fontSize: '14px' }}
                            >
                              <KeyRound size={18} />
                              <span>Deliver to Student & Verify OTP (+₹18)</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}

                {/* Pagination Controls */}
                {activeBatch.length > MISSION_PAGE_SIZE && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setMissionPage((p) => Math.max(0, p - 1))}
                      disabled={missionPage === 0}
                      className="delivo-btn-glass"
                      style={{
                        padding: '8px 18px',
                        fontSize: '12px',
                        minHeight: '38px',
                        opacity: missionPage === 0 ? 0.35 : 1,
                        cursor: missionPage === 0 ? 'not-allowed' : 'pointer',
                      }}
                    >
                      Prev
                    </button>
                    <div style={{ fontSize: '11px', fontFamily: 'monospace', color: '#9CA3AF' }}>
                      Page {missionPage + 1} / {Math.ceil(activeBatch.length / MISSION_PAGE_SIZE)}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setMissionPage((p) => Math.min(Math.ceil(activeBatch.length / MISSION_PAGE_SIZE) - 1, p + 1))
                      }
                      disabled={missionPage >= Math.ceil(activeBatch.length / MISSION_PAGE_SIZE) - 1}
                      className="delivo-btn-indigo"
                      style={{
                        padding: '8px 18px',
                        fontSize: '12px',
                        minHeight: '38px',
                        opacity:
                          missionPage >= Math.ceil(activeBatch.length / MISSION_PAGE_SIZE) - 1 ? 0.35 : 1,
                        cursor:
                          missionPage >= Math.ceil(activeBatch.length / MISSION_PAGE_SIZE) - 1 ? 'not-allowed' : 'pointer',
                      }}
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ─── TAB 2: AVAILABLE DELIVERIES (CLAIM ORDERS) ─── */}
        {activeTab === 'available' && (
          <div className="page-transition">
            {/* Briefing Banner */}
            <div
              className="delivo-card-glass"
              style={{
                padding: '18px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'linear-gradient(135deg, rgba(253, 105, 49, 0.22) 0%, rgba(20, 21, 28, 0.8) 100%)',
                borderColor: 'rgba(253, 105, 49, 0.45)',
                borderTopColor: 'rgba(255, 180, 150, 0.7)',
              }}
            >
              <div>
                <h2 style={{ fontSize: '16.5px', fontWeight: 800, color: '#FFFFFF', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Zap size={18} color="#FD6931" />
                  <span>Available Delivery Pool</span>
                </h2>
                <p style={{ fontSize: '12px', color: '#9CA3AF' }}>
                  Orders confirmed by stalls. Claim to deliver and earn ₹18/drop.
                </p>
              </div>

              <div
                style={{
                  background: 'rgba(253, 105, 49, 0.2)',
                  border: '1px solid rgba(253, 105, 49, 0.4)',
                  padding: '6px 12px',
                  borderRadius: '9999px',
                  color: '#FD6931',
                  fontWeight: 800,
                  fontSize: '12px',
                }}
              >
                {availableOrders.length} Ready
              </div>
            </div>

            {/* List of Available Orders */}
            {availableOrders.length === 0 ? (
              <div
                className="delivo-card-glass"
                style={{
                  padding: '52px 24px',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div
                  style={{
                    width: '68px',
                    height: '68px',
                    borderRadius: '50%',
                    background: 'rgba(253, 105, 49, 0.15)',
                    border: '1px solid rgba(253, 105, 49, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FD6931',
                    marginBottom: '16px',
                    boxShadow: '0 0 24px rgba(253, 105, 49, 0.2)',
                  }}
                >
                  <Sparkles size={34} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF', marginBottom: '6px' }}>
                  All Caught Up!
                </h3>
                <p style={{ fontSize: '13px', color: '#9CA3AF', maxWidth: '280px', lineHeight: 1.5 }}>
                  No unassigned orders right now. When students order and stalls confirm, they will appear here instantly.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {availableOrders
                  .slice(availablePage * AVAILABLE_PAGE_SIZE, (availablePage + 1) * AVAILABLE_PAGE_SIZE)
                  .map((order) => (
                    <div
                      key={order.id}
                      className="delivo-card-glass"
                      style={{
                        padding: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '14px',
                        border: '1.5px solid rgba(253, 105, 49, 0.4)',
                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
                      }}
                    >
                      {/* Top Header */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontFamily: 'monospace', fontSize: '15px', fontWeight: 900, color: '#FFFFFF' }}>
                            {order.id}
                          </span>
                          <OrderStatusBadge status={order.status} size="sm" />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <SlotBadge slot={order.slot} size="sm" />
                          <span
                            style={{
                              background: 'rgba(16, 185, 129, 0.2)',
                              color: '#34D399',
                              border: '1px solid rgba(16, 185, 129, 0.4)',
                              fontSize: '11px',
                              fontWeight: 800,
                              padding: '2px 8px',
                              borderRadius: '9999px',
                            }}
                          >
                            +₹18.00 Payout
                          </span>
                        </div>
                      </div>

                      {/* Pickup & Drop Details */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div
                          style={{
                            background: 'rgba(253, 105, 49, 0.08)',
                            border: '1px solid rgba(253, 105, 49, 0.25)',
                            borderRadius: '16px',
                            padding: '10px 12px',
                          }}
                        >
                          <div style={{ fontSize: '9px', fontWeight: 800, color: '#FD6931', textTransform: 'uppercase' }}>
                            Pickup Stall
                          </div>
                          <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#FFFFFF', marginTop: '2px' }}>
                            {order.vendorName}
                          </div>
                          <div style={{ fontSize: '11px', color: '#9CA3AF' }}>
                            {order.items.length} items • ₹{order.totalAmount}
                          </div>
                        </div>

                        <div
                          style={{
                            background: 'rgba(99, 102, 241, 0.08)',
                            border: '1px solid rgba(99, 102, 241, 0.25)',
                            borderRadius: '16px',
                            padding: '10px 12px',
                          }}
                        >
                          <div style={{ fontSize: '9px', fontWeight: 800, color: '#818CF8', textTransform: 'uppercase' }}>
                            Drop Destination
                          </div>
                          <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#FFFFFF', marginTop: '2px' }}>
                            {order.hostelBlock.split(' ')[0]} Rm {order.roomNumber}
                          </div>
                          <div style={{ fontSize: '11px', color: '#9CA3AF' }}>
                            Customer: {order.studentName}
                          </div>
                        </div>
                      </div>

                      {/* Items Summary */}
                      <div style={{ fontSize: '12px', color: '#D1D5DB', padding: '4px 0' }}>
                        <span style={{ color: '#9CA3AF' }}>Items: </span>
                        {order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                      </div>

                      {/* Claim Button */}
                      <button
                        type="button"
                        onClick={() => handleClaimOrder(order.id)}
                        className="delivo-btn-primary"
                        style={{ width: '100%', minHeight: '48px', fontSize: '14px', gap: '8px' }}
                      >
                        <Bike size={18} />
                        <span>Take Order & Start Delivery (+₹18)</span>
                      </button>
                    </div>
                  ))}

                {/* Pagination */}
                {availableOrders.length > AVAILABLE_PAGE_SIZE && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setAvailablePage((p) => Math.max(0, p - 1))}
                      disabled={availablePage === 0}
                      className="delivo-btn-glass"
                      style={{ padding: '8px 18px', fontSize: '12px' }}
                    >
                      Prev
                    </button>
                    <div style={{ fontSize: '11px', fontFamily: 'monospace', color: '#9CA3AF' }}>
                      Page {availablePage + 1} / {Math.ceil(availableOrders.length / AVAILABLE_PAGE_SIZE)}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setAvailablePage((p) => Math.min(Math.ceil(availableOrders.length / AVAILABLE_PAGE_SIZE) - 1, p + 1))
                      }
                      disabled={availablePage >= Math.ceil(availableOrders.length / AVAILABLE_PAGE_SIZE) - 1}
                      className="delivo-btn-primary"
                      style={{ padding: '8px 18px', fontSize: '12px' }}
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ─── TAB 3: COMPLETED DROPS LOG ─── */}
        {activeTab === 'completed' && (
          <div className="page-transition">
            {/* Shift Earnings Breakdown Card */}
            <div
              className="delivo-card-glass"
              style={{
                padding: '20px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(20, 21, 28, 0.8) 100%)',
                borderColor: 'rgba(16, 185, 129, 0.4)',
                borderTopColor: 'rgba(167, 243, 208, 0.6)',
                boxShadow: '0 16px 36px rgba(16, 185, 129, 0.15)',
              }}
            >
              <div>
                <div style={{ fontSize: '10px', fontWeight: 800, color: '#A7F3D0', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Total Completed Earnings
                </div>
                <div style={{ fontSize: '28px', fontWeight: 900, color: '#34D399', lineHeight: 1.1, marginTop: '2px' }}>
                  {formatRupees(runnerEarnings)}
                </div>
                <div style={{ fontSize: '11.5px', color: '#9CA3AF', marginTop: '4px' }}>
                  Base: ₹{baseEarnings} {batchBonus > 0 && `+ Batch Bonus: ₹${batchBonus}`}
                </div>
              </div>

              <div
                style={{
                  background: 'rgba(0, 0, 0, 0.45)',
                  padding: '10px 16px',
                  borderRadius: '20px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '20px', fontWeight: 900, color: '#FFFFFF' }}>{completedOrders.length}</div>
                <div style={{ fontSize: '9.5px', fontWeight: 800, color: '#9CA3AF', textTransform: 'uppercase' }}>Drops Done</div>
              </div>
            </div>

            {/* Completed Orders List */}
            {completedOrders.length === 0 ? (
              <div
                className="delivo-card-glass"
                style={{
                  padding: '52px 24px',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div
                  style={{
                    width: '68px',
                    height: '68px',
                    borderRadius: '50%',
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#34D399',
                    marginBottom: '16px',
                  }}
                >
                  <CheckCircle2 size={34} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF', marginBottom: '6px' }}>
                  No Completed Drops Yet
                </h3>
                <p style={{ fontSize: '13px', color: '#9CA3AF', maxWidth: '280px', lineHeight: 1.5 }}>
                  Deliver your active orders and verify student OTPs to populate your earnings history log.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {completedOrders
                  .slice(completedPage * COMPLETED_PAGE_SIZE, (completedPage + 1) * COMPLETED_PAGE_SIZE)
                  .map((ord) => (
                    <div
                      key={ord.id}
                      className="delivo-card-glass"
                      style={{
                        padding: '16px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                          <span style={{ fontFamily: 'monospace', fontWeight: 900, color: '#FFFFFF', fontSize: '14.5px' }}>
                            {ord.id}
                          </span>
                          <span
                            style={{
                              background: 'rgba(16, 185, 129, 0.22)',
                              color: '#34D399',
                              fontSize: '10px',
                              fontWeight: 800,
                              padding: '2px 8px',
                              borderRadius: '9999px',
                              border: '1px solid rgba(16, 185, 129, 0.45)',
                            }}
                          >
                            OTP Verified ✓
                          </span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#9CA3AF' }}>
                          {ord.hostelBlock.split(' ')[0]} • Room {ord.roomNumber}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '17px', fontWeight: 900, color: '#34D399' }}>+₹18.00</div>
                        <div style={{ fontSize: '10px', color: '#6B7280' }}>
                          {ord.deliveredAt ? new Date(ord.deliveredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Delivered'}
                        </div>
                      </div>
                    </div>
                  ))}

                {/* Pagination */}
                {completedOrders.length > COMPLETED_PAGE_SIZE && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px' }}>
                    <button
                      type="button"
                      onClick={() => setCompletedPage((p) => Math.max(0, p - 1))}
                      disabled={completedPage === 0}
                      className="delivo-btn-glass"
                      style={{
                        padding: '8px 18px',
                        fontSize: '11.5px',
                        minHeight: '38px',
                        opacity: completedPage === 0 ? 0.35 : 1,
                        cursor: completedPage === 0 ? 'not-allowed' : 'pointer',
                      }}
                    >
                      Prev
                    </button>
                    <div style={{ fontSize: '10.5px', fontFamily: 'monospace', color: '#9CA3AF' }}>
                      Page {completedPage + 1} / {Math.ceil(completedOrders.length / COMPLETED_PAGE_SIZE)}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setCompletedPage((p) => Math.min(Math.ceil(completedOrders.length / COMPLETED_PAGE_SIZE) - 1, p + 1))
                      }
                      disabled={completedPage >= Math.ceil(completedOrders.length / COMPLETED_PAGE_SIZE) - 1}
                      className="delivo-btn-success"
                      style={{
                        padding: '8px 18px',
                        fontSize: '11.5px',
                        minHeight: '38px',
                        opacity:
                          completedPage >= Math.ceil(completedOrders.length / COMPLETED_PAGE_SIZE) - 1 ? 0.35 : 1,
                        cursor:
                          completedPage >= Math.ceil(completedOrders.length / COMPLETED_PAGE_SIZE) - 1 ? 'not-allowed' : 'pointer',
                      }}
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── 3. FLOATING ISLAND GLASS DOCK WITH 3 TABS ─── */}
      <nav className="floating-glass-dock" style={{ zIndex: 40 }}>
        <button
          type="button"
          onClick={() => setActiveTab('mission')}
          className={`dock-tab ${activeTab === 'mission' ? 'active' : ''}`}
        >
          <Navigation size={20} />
          <span className="dock-tab-label">My Run</span>
          {activeBatch.length > 0 && (
            <span className="dock-badge-count">{activeBatch.length}</span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('available')}
          className={`dock-tab ${activeTab === 'available' ? 'active' : ''}`}
        >
          <Zap size={20} />
          <span className="dock-tab-label">Available</span>
          {availableOrders.length > 0 && (
            <span className="dock-badge-count" style={{ background: '#FD6931' }}>{availableOrders.length}</span>
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

      {/* ─── 4. STUDENT HANDOVER OTP MODAL SHEET ─── */}
      {otpModalOrderId && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 150,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.78)',
            backdropFilter: 'blur(12px)',
            padding: 0,
          }}
          className="animate-in fade-in duration-200"
        >
          <div
            style={{
              width: '100%',
              maxWidth: '480px',
              background: 'linear-gradient(180deg, rgba(26, 27, 36, 0.96) 0%, rgba(14, 15, 20, 0.98) 100%)',
              backdropFilter: 'blur(32px) saturate(200%)',
              borderTop: '1px solid rgba(255, 255, 255, 0.25)',
              borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
              borderRight: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '28px 28px 0 0',
              padding: '24px 20px',
              paddingBottom: 'calc(26px + var(--sab, 0px))',
              boxShadow: '0 -16px 48px rgba(0, 0, 0, 0.85), inset 0 1px 1px rgba(255, 255, 255, 0.2)',
            }}
            className="animate-in slide-in-from-bottom duration-300"
          >
            {/* Drag Pill */}
            <div style={{ width: '48px', height: '4px', background: 'rgba(255, 255, 255, 0.3)', borderRadius: '9999px', margin: '0 auto 20px auto' }} />

            <div style={{ textAlign: 'center', marginBottom: '22px' }}>
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'rgba(99, 102, 241, 0.18)',
                  border: '1.5px solid rgba(99, 102, 241, 0.45)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#818CF8',
                  margin: '0 auto 12px auto',
                  boxShadow: '0 0 24px rgba(99, 102, 241, 0.3)',
                }}
              >
                <KeyRound size={30} />
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#FFFFFF', marginBottom: '4px' }}>
                Verify Student OTP
              </h2>
              <p style={{ fontSize: '13px', color: '#9CA3AF', lineHeight: 1.4 }}>
                Ask student for the 4-digit code shown on their order tracking screen.
              </p>
            </div>

            <form onSubmit={handleVerifyOtpSubmit}>
              <div style={{ marginBottom: '18px' }}>
                <input
                  type="text"
                  maxLength={4}
                  autoFocus
                  placeholder="----"
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                  style={{
                    width: '100%',
                    background: 'rgba(0, 0, 0, 0.55)',
                    border: '2px solid rgba(99, 102, 241, 0.5)',
                    borderRadius: '22px',
                    padding: '16px',
                    textAlign: 'center',
                    fontSize: '34px',
                    fontFamily: 'monospace',
                    letterSpacing: '0.6em',
                    paddingLeft: '0.6em',
                    color: '#FFFFFF',
                    fontWeight: 900,
                    outline: 'none',
                    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.5), 0 0 16px rgba(99, 102, 241, 0.2)',
                  }}
                />
              </div>

              {otpError && (
                <div
                  style={{
                    marginBottom: '16px',
                    padding: '12px 16px',
                    borderRadius: '16px',
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.35)',
                    color: '#F87171',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <span>{otpError}</span>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  type="submit"
                  disabled={enteredOtp.length !== 4}
                  className="delivo-btn-indigo"
                  style={{
                    width: '100%',
                    minHeight: '52px',
                    fontSize: '14.5px',
                    opacity: enteredOtp.length === 4 ? 1 : 0.45,
                    cursor: enteredOtp.length === 4 ? 'pointer' : 'not-allowed',
                  }}
                >
                  <CheckCircle2 size={19} />
                  <span>Confirm Handover (+₹18)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setOtpModalOrderId(null)}
                  className="delivo-btn-glass"
                  style={{ width: '100%', minHeight: '46px' }}
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
