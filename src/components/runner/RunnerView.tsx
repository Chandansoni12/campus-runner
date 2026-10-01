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
  X,
  ChevronDown,
  Navigation,
  LogOut,
  Zap,
  Award,
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
      o.status === OrderStatus.PREPARING ||
      o.status === OrderStatus.ACCEPTED ||
      o.status === OrderStatus.PLACED
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
      setOtpError('Please enter the 4-digit OTP provided by the student.');
      return;
    }

    const res = runnerDeliverOrder(otpModalOrderId, enteredOtp.trim());
    if (res.success) {
      confetti({
        particleCount: 60,
        spread: 70,
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
  const COMPLETED_PAGE_SIZE = 5;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', overflow: 'hidden', position: 'relative' }}>
      
      {/* ─── 1. SIGNATURE DELIVO COMPACT ORANGE HEADER ─── */}
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
                  padding: '5px 10px',
                  borderRadius: '9999px',
                  color: '#FFFFFF',
                  maxWidth: '75%',
                }}
              >
                <Bike size={15} style={{ flexShrink: 0 }} />
                <select
                  value={activeRunner.id}
                  onChange={(e) => {
                    setActiveRunnerId(e.target.value);
                    setMissionPage(0);
                    setCompletedPage(0);
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#FFFFFF',
                    fontWeight: 800,
                    fontSize: '12px',
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
                    boxShadow: '0 0 8px #10B981',
                  }}
                />
                <span>ON DUTY</span>
              </div>
            </div>

            {/* Shift Payout & Logout Button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              <div
                style={{
                  background: 'rgba(16, 185, 129, 0.25)',
                  border: '1px solid rgba(16, 185, 129, 0.5)',
                  color: '#A7F3D0',
                  fontSize: '11.5px',
                  fontWeight: 900,
                  padding: '4px 10px',
                  borderRadius: '9999px',
                }}
              >
                {formatRupees(runnerEarnings)}
              </div>

              <button
                type="button"
                onClick={logout}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'rgba(0, 0, 0, 0.25)',
                  border: '1.5px solid rgba(255, 255, 255, 0.35)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                className="active:scale-90"
                title="Log out"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>

          {/* Compact 3-KPI Row (Obsidian Glass Chips) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginTop: '6px' }}>
            <div className="portal-kpi-glass">
              <div className="portal-kpi-label">Shift Earnings</div>
              <div className="portal-kpi-val" style={{ color: '#6EE7B7' }}>{formatRupees(runnerEarnings)}</div>
            </div>
            <div className="portal-kpi-glass">
              <div className="portal-kpi-label">Delivered</div>
              <div className="portal-kpi-val">{completedOrders.length} drops</div>
            </div>
            <div className="portal-kpi-glass" style={{ background: 'rgba(253, 105, 49, 0.25)', borderColor: 'rgba(253, 105, 49, 0.45)' }}>
              <div className="portal-kpi-label" style={{ color: '#FED7AA' }}>Active Run</div>
              <div className="portal-kpi-val" style={{ color: '#FFFFFF' }}>{activeBatch.length} missions</div>
            </div>
          </div>
        </div>
      </header>

      {/* ─── 2. MAIN SCROLLABLE CONTENT WITH SILKY PAGE TRANSITION ─── */}
      <div className="flex-1 overflow-y-auto hide-scrollbar px-4 pt-3.5 pb-28">
        
        {/* TAB 1: ACTIVE MISSIONS */}
        {activeTab === 'mission' && (
          <div className="page-transition">
            {/* Top Mission Briefing Banner */}
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.18) 0%, rgba(26, 26, 26, 0.8) 100%)',
                border: '1px solid rgba(99, 102, 241, 0.35)',
                borderRadius: '26px',
                padding: '16px',
                marginBottom: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#FFFFFF', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Navigation size={17} color="#818CF8" />
                  <span>Courier Missions</span>
                </h2>
                <p style={{ fontSize: '12px', color: '#9CA3AF' }}>
                  Stall pickups and student hostel drop-offs.
                </p>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: 'rgba(0, 0, 0, 0.4)',
                    padding: '4px 10px',
                    borderRadius: '9999px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    fontSize: '11.5px',
                    fontWeight: 800,
                    color: '#818CF8',
                  }}
                >
                  Rate: ₹18 / drop
                </div>
                {totalDeliveriesCount < 6 ? (
                  <div style={{ fontSize: '10px', color: '#9CA3AF', marginTop: '3px' }}>
                    {6 - totalDeliveriesCount} more for ₹25 bonus
                  </div>
                ) : (
                  <div style={{ fontSize: '10px', color: '#34D399', fontWeight: 800, marginTop: '3px' }}>
                    ★ ₹25 Bonus Unlocked!
                  </div>
                )}
              </div>
            </div>

            {/* Empty State or Missions List */}
            {activeBatch.length === 0 ? (
              <div
                style={{
                  background: 'rgba(26, 26, 26, 0.6)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '26px',
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
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'rgba(99, 102, 241, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#818CF8',
                    marginBottom: '16px',
                  }}
                >
                  <Package size={32} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF', marginBottom: '6px' }}>
                  No Active Deliveries
                </h3>
                <p style={{ fontSize: '13px', color: '#9CA3AF', maxWidth: '280px', lineHeight: 1.5 }}>
                  You're currently idle and ready. When the admin or system dispatches batch orders to you, they'll appear here.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
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
                        style={{
                          background: 'rgba(26, 26, 26, 0.72)',
                          backdropFilter: 'blur(20px)',
                          borderRadius: '26px',
                          border: isReadyForPickup
                            ? '1.5px solid rgba(253, 105, 49, 0.6)'
                            : isOutForDelivery
                            ? '1.5px solid rgba(99, 102, 241, 0.6)'
                            : '1px solid rgba(255, 255, 255, 0.08)',
                          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
                          padding: '16px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '14px',
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

                        {/* Route Timeline */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingLeft: '4px' }}>
                          
                          {/* Step 1: Pickup Point */}
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                            <div
                              style={{
                                width: '22px',
                                height: '22px',
                                borderRadius: '50%',
                                background: isReadyForPickup || isOutForDelivery ? '#FD6931' : '#374151',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#FFFFFF',
                                fontSize: '11px',
                                fontWeight: 900,
                                flexShrink: 0,
                                marginTop: '2px',
                                boxShadow: isReadyForPickup ? '0 0 10px rgba(253, 105, 49, 0.6)' : 'none',
                              }}
                            >
                              1
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: '9.5px', fontWeight: 800, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                Pickup From Stall
                              </div>
                              <div style={{ fontSize: '14px', fontWeight: 800, color: '#FFFFFF', marginTop: '1px' }}>
                                {order.vendorName}
                              </div>
                              <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px' }}>
                                {order.items.reduce((acc, i) => acc + i.quantity, 0)} items ({order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')})
                              </div>
                            </div>
                          </div>

                          {/* Connector Line */}
                          <div style={{ width: '2px', height: '14px', background: 'rgba(255, 255, 255, 0.12)', marginLeft: '10px' }} />

                          {/* Step 2: Dropoff Point */}
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                            <div
                              style={{
                                width: '22px',
                                height: '22px',
                                borderRadius: '50%',
                                background: isOutForDelivery ? '#6366F1' : '#374151',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#FFFFFF',
                                fontSize: '11px',
                                fontWeight: 900,
                                flexShrink: 0,
                                marginTop: '2px',
                                boxShadow: isOutForDelivery ? '0 0 10px rgba(99, 102, 241, 0.6)' : 'none',
                              }}
                            >
                              2
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: '9.5px', fontWeight: 800, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                Deliver To Student
                              </div>
                              <div style={{ fontSize: '14px', fontWeight: 800, color: '#FFFFFF', marginTop: '1px' }}>
                                {order.hostelBlock} • <span style={{ color: '#FD6931' }}>Room {order.roomNumber}</span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                                <span style={{ fontSize: '12px', color: '#E5E7EB', fontWeight: 600 }}>
                                  {order.studentName}
                                </span>
                                {order.studentPhone && (
                                  <a
                                    href={`tel:${order.studentPhone}`}
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '5px',
                                      background: 'rgba(255, 255, 255, 0.1)',
                                      padding: '3px 10px',
                                      borderRadius: '9999px',
                                      fontSize: '11px',
                                      fontWeight: 700,
                                      color: '#FFFFFF',
                                      textDecoration: 'none',
                                    }}
                                    className="active:scale-95"
                                  >
                                    <Phone size={11} />
                                    <span>Call</span>
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>

                        </div>

                        {/* Action Buttons (Full Pill Buttons) */}
                        <div style={{ paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                          {isKitchenCooking && (
                            <div
                              style={{
                                width: '100%',
                                padding: '11px',
                                borderRadius: '9999px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                color: '#9CA3AF',
                                fontSize: '12.5px',
                                fontWeight: 700,
                                textAlign: 'center',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                              }}
                            >
                              <Clock size={15} />
                              <span>Kitchen is preparing items...</span>
                            </div>
                          )}

                          {isReadyForPickup && (
                            <button
                              type="button"
                              onClick={() => runnerPickUpOrder(order.id)}
                              style={{
                                width: '100%',
                                padding: '12px 20px',
                                borderRadius: '9999px',
                                background: 'linear-gradient(135deg, #FD6931 0%, #F85013 100%)',
                                color: '#FFFFFF',
                                fontWeight: 800,
                                fontSize: '13.5px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                border: 'none',
                                boxShadow: '0 4px 16px rgba(253, 105, 49, 0.4)',
                                cursor: 'pointer',
                              }}
                              className="active:scale-95"
                            >
                              <Package size={17} />
                              <span>Confirm Stall Pickup</span>
                            </button>
                          )}

                          {isOutForDelivery && (
                            <button
                              type="button"
                              onClick={() => handleOpenOtpModal(order.id)}
                              style={{
                                width: '100%',
                                padding: '12px 20px',
                                borderRadius: '9999px',
                                background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
                                color: '#FFFFFF',
                                fontWeight: 800,
                                fontSize: '13.5px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                border: 'none',
                                boxShadow: '0 4px 16px rgba(99, 102, 241, 0.4)',
                                cursor: 'pointer',
                              }}
                              className="active:scale-95"
                            >
                              <KeyRound size={17} />
                              <span>Enter Student OTP</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}

                {/* Pagination Controls */}
                {activeBatch.length > MISSION_PAGE_SIZE && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setMissionPage((p) => Math.max(0, p - 1))}
                      disabled={missionPage === 0}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '9999px',
                        fontWeight: 700,
                        fontSize: '12px',
                        background: missionPage === 0 ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.1)',
                        color: missionPage === 0 ? '#4B5563' : '#FFFFFF',
                        border: 'none',
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
                      style={{
                        padding: '8px 16px',
                        borderRadius: '9999px',
                        fontWeight: 700,
                        fontSize: '12px',
                        background:
                          missionPage >= Math.ceil(activeBatch.length / MISSION_PAGE_SIZE) - 1
                            ? 'rgba(255, 255, 255, 0.04)'
                            : '#6366F1',
                        color:
                          missionPage >= Math.ceil(activeBatch.length / MISSION_PAGE_SIZE) - 1 ? '#4B5563' : '#FFFFFF',
                        border: 'none',
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

        {/* TAB 2: COMPLETED DROPS LOG */}
        {activeTab === 'completed' && (
          <div className="page-transition">
            {/* Shift Earnings Breakdown Card */}
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.18) 0%, rgba(26, 26, 26, 0.8) 100%)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                borderRadius: '26px',
                padding: '18px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: '10px', fontWeight: 800, color: '#A7F3D0', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Total Completed Earnings
                </div>
                <div style={{ fontSize: '26px', fontWeight: 900, color: '#34D399', lineHeight: 1.1, marginTop: '2px' }}>
                  {formatRupees(runnerEarnings)}
                </div>
                <div style={{ fontSize: '11.5px', color: '#9CA3AF', marginTop: '4px' }}>
                  Base: ₹{baseEarnings} {batchBonus > 0 && `+ Batch Bonus: ₹${batchBonus}`}
                </div>
              </div>

              <div
                style={{
                  background: 'rgba(0, 0, 0, 0.4)',
                  padding: '8px 14px',
                  borderRadius: '18px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '18px', fontWeight: 900, color: '#FFFFFF' }}>{completedOrders.length}</div>
                <div style={{ fontSize: '9px', fontWeight: 800, color: '#9CA3AF', textTransform: 'uppercase' }}>Drops Done</div>
              </div>
            </div>

            {/* Completed Orders List */}
            {completedOrders.length === 0 ? (
              <div
                style={{
                  background: 'rgba(26, 26, 26, 0.6)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '26px',
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
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'rgba(16, 185, 129, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#34D399',
                    marginBottom: '16px',
                  }}
                >
                  <CheckCircle2 size={32} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF', marginBottom: '6px' }}>
                  No Completed Drops Yet
                </h3>
                <p style={{ fontSize: '13px', color: '#9CA3AF', maxWidth: '280px', lineHeight: 1.5 }}>
                  Deliver your active orders and verify student OTPs to populate your earnings log.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {completedOrders
                  .slice(completedPage * COMPLETED_PAGE_SIZE, (completedPage + 1) * COMPLETED_PAGE_SIZE)
                  .map((ord) => (
                    <div
                      key={ord.id}
                      style={{
                        background: 'rgba(26, 26, 26, 0.72)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                        borderRadius: '22px',
                        padding: '12px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                          <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#FFFFFF', fontSize: '14px' }}>
                            {ord.id}
                          </span>
                          <span
                            style={{
                              background: 'rgba(16, 185, 129, 0.2)',
                              color: '#34D399',
                              fontSize: '10px',
                              fontWeight: 800,
                              padding: '2px 8px',
                              borderRadius: '9999px',
                              border: '1px solid rgba(16, 185, 129, 0.4)',
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
                        <div style={{ fontSize: '16px', fontWeight: 900, color: '#34D399' }}>+₹18.00</div>
                        <div style={{ fontSize: '10px', color: '#6B7280' }}>
                          {ord.deliveredAt ? new Date(ord.deliveredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Delivered'}
                        </div>
                      </div>
                    </div>
                  ))}

                {/* Pagination */}
                {completedOrders.length > COMPLETED_PAGE_SIZE && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setCompletedPage((p) => Math.max(0, p - 1))}
                      disabled={completedPage === 0}
                      style={{
                        padding: '7px 14px',
                        borderRadius: '9999px',
                        fontWeight: 700,
                        fontSize: '11.5px',
                        background: completedPage === 0 ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.1)',
                        color: completedPage === 0 ? '#4B5563' : '#FFFFFF',
                        border: 'none',
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
                      style={{
                        padding: '7px 14px',
                        borderRadius: '9999px',
                        fontWeight: 700,
                        fontSize: '11.5px',
                        background:
                          completedPage >= Math.ceil(completedOrders.length / COMPLETED_PAGE_SIZE) - 1
                            ? 'rgba(255, 255, 255, 0.04)'
                            : '#10B981',
                        color:
                          completedPage >= Math.ceil(completedOrders.length / COMPLETED_PAGE_SIZE) - 1 ? '#4B5563' : '#FFFFFF',
                        border: 'none',
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

      {/* ─── 3. FLOATING ISLAND GLASS DOCK WITH ACTIVE CAPSULE ─── */}
      <nav className="floating-glass-dock">
        <button
          type="button"
          onClick={() => setActiveTab('mission')}
          className={`dock-tab ${activeTab === 'mission' ? 'active' : ''}`}
        >
          <Navigation size={20} />
          <span className="dock-tab-label">Missions</span>
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
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            padding: 0,
          }}
          className="animate-in fade-in duration-200"
        >
          <div
            style={{
              width: '100%',
              maxWidth: '480px',
              background: '#141419',
              borderTop: '1px solid rgba(255, 255, 255, 0.15)',
              borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
              borderRight: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '28px 28px 0 0',
              padding: '24px 20px',
              paddingBottom: 'calc(24px + var(--sab, 0px))',
              boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.8)',
            }}
            className="animate-in slide-in-from-bottom duration-300"
          >
            {/* Drag Pill */}
            <div style={{ width: '44px', height: '4px', background: 'rgba(255, 255, 255, 0.25)', borderRadius: '9999px', margin: '0 auto 18px auto' }} />

            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'rgba(99, 102, 241, 0.15)',
                  border: '1px solid rgba(99, 102, 241, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#818CF8',
                  margin: '0 auto 12px auto',
                }}
              >
                <KeyRound size={28} />
              </div>
              <h2 style={{ fontSize: '19px', fontWeight: 900, color: '#FFFFFF', marginBottom: '4px' }}>
                Verify Student OTP
              </h2>
              <p style={{ fontSize: '13px', color: '#9CA3AF', lineHeight: 1.4 }}>
                Ask student for the 4-digit code shown on their order tracking screen.
              </p>
            </div>

            <form onSubmit={handleVerifyOtpSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <input
                  type="text"
                  maxLength={4}
                  autoFocus
                  placeholder="----"
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                  style={{
                    width: '100%',
                    background: 'rgba(0, 0, 0, 0.5)',
                    border: '2px solid rgba(99, 102, 241, 0.4)',
                    borderRadius: '20px',
                    padding: '16px',
                    textAlign: 'center',
                    fontSize: '32px',
                    fontFamily: 'monospace',
                    letterSpacing: '0.6em',
                    paddingLeft: '0.6em',
                    color: '#FFFFFF',
                    fontWeight: 900,
                    outline: 'none',
                  }}
                />
              </div>

              {otpError && (
                <div
                  style={{
                    marginBottom: '16px',
                    padding: '10px 14px',
                    borderRadius: '16px',
                    background: 'rgba(239, 68, 68, 0.12)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#F87171',
                    fontSize: '12px',
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

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  type="submit"
                  disabled={enteredOtp.length !== 4}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '9999px',
                    background: enteredOtp.length === 4 ? 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)' : '#27272A',
                    color: enteredOtp.length === 4 ? '#FFFFFF' : '#71717A',
                    fontWeight: 800,
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    border: 'none',
                    boxShadow: enteredOtp.length === 4 ? '0 4px 18px rgba(99, 102, 241, 0.4)' : 'none',
                    cursor: enteredOtp.length === 4 ? 'pointer' : 'not-allowed',
                  }}
                  className={enteredOtp.length === 4 ? 'active:scale-95' : ''}
                >
                  <CheckCircle2 size={18} />
                  <span>Confirm Handover (+₹18)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setOtpModalOrderId(null)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '9999px',
                    background: 'transparent',
                    color: '#9CA3AF',
                    fontWeight: 700,
                    fontSize: '13px',
                    border: 'none',
                    cursor: 'pointer',
                  }}
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
