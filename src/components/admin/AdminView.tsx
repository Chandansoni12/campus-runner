import React, { useState } from 'react';
import { useAppStore } from '../../store';
import { Role, OrderStatus, MenuItem } from '../../types';
import { formatRupees } from '../../business-logic';
import { OrderStatusBadge } from '../common/OrderStatusBadge';
import {
  ShieldAlert,
  Store,
  FileText,
  ToggleLeft,
  ToggleRight,
  Plus,
  Send,
  Bike,
  TrendingUp,
  X,
  Power,
  ShieldCheck,
  Package,
  LogOut,
  Zap,
  ChevronDown,
  Clock,
  Building,
  CheckCircle2,
} from 'lucide-react';

export const AdminView: React.FC = () => {
  const {
    hostels,
    vendors,
    users,
    orders,
    settings,
    logout,
    toggleGlobalKillSwitch,
    toggleHostelKillSwitch,
    updateCutoffTime,
    onboardVendor,
    onboardRunner,
    toggleRunnerVerification,
    batchAssignOrders,
    updateVendorCommission,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'killswitch' | 'dispatch' | 'roster' | 'vendors' | 'reports'>('killswitch');
  const [dispatchPage, setDispatchPage] = useState(0);
  const [rosterPage, setRosterPage] = useState(0);
  const [vendorPage, setVendorPage] = useState(0);
  const [reportPage, setReportPage] = useState(0);

  // Manual Dispatch State
  const [selectedHostelFilter, setSelectedHostelFilter] = useState<string>('all');
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [targetRunnerId, setTargetRunnerId] = useState<string>('');

  // Modals
  const [showAddRunnerModal, setShowAddRunnerModal] = useState(false);
  const [showAddVendorModal, setShowAddVendorModal] = useState(false);

  // Forms
  const [newRunnerForm, setNewRunnerForm] = useState({ name: '', phone: '', hostelBlock: 'Aryabhatta Hall' });
  const [newVendorForm, setNewVendorForm] = useState({
    name: '',
    location: '',
    ownerPhone: '',
    commissionPct: 10,
    cuisineTag: '',
    prepTimeMinutes: 15,
    itemName1: '',
    itemPrice1: 60,
    itemIsVeg1: true,
  });

  const studentRunners = users.filter((u) => u.role === Role.RUNNER);

  const dispatchableOrders = orders.filter(
    (o) =>
      (o.status === OrderStatus.PLACED ||
        o.status === OrderStatus.ACCEPTED ||
        o.status === OrderStatus.PREPARING ||
        o.status === OrderStatus.READY) &&
      !o.runnerId
  );

  const filteredDispatchOrders = dispatchableOrders.filter(
    (o) => selectedHostelFilter === 'all' || o.hostelBlock.includes(selectedHostelFilter)
  );

  const totalOrders = orders.length;
  const completedOrders = orders.filter((o) => o.status === OrderStatus.DELIVERED);
  const totalGrossRevenue = orders.reduce((sum, o) => sum + o.subtotalAmount, 0);
  const totalCommissionCollected = orders.reduce((sum, o) => sum + o.commissionAmt, 0);
  const totalRunnerPayouts = completedOrders.length * 18;
  const cancelledOrders = orders.filter((o) => o.status === OrderStatus.CANCELLED);
  const refundRate = totalOrders > 0 ? Math.round((cancelledOrders.length / totalOrders) * 100) : 0;

  const handleSelectAllOrders = () => {
    setSelectedOrderIds(
      selectedOrderIds.length === filteredDispatchOrders.length ? [] : filteredDispatchOrders.map((o) => o.id)
    );
  };

  const handleToggleOrderSelection = (id: string) => {
    setSelectedOrderIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const handleBatchDispatchSubmit = () => {
    if (selectedOrderIds.length > 0 && targetRunnerId) {
      batchAssignOrders(selectedOrderIds, targetRunnerId);
      setSelectedOrderIds([]);
    }
  };

  const handleCreateRunner = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRunnerForm.name && newRunnerForm.phone) {
      onboardRunner(newRunnerForm);
      setNewRunnerForm({ name: '', phone: '', hostelBlock: 'Aryabhatta Hall' });
      setShowAddRunnerModal(false);
    }
  };

  const handleCreateVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (newVendorForm.name && newVendorForm.location) {
      const initialItems: MenuItem[] = [
        {
          id: '',
          vendorId: '',
          name: newVendorForm.itemName1 || 'Special Snack',
          price: Number(newVendorForm.itemPrice1) || 50,
          isVeg: newVendorForm.itemIsVeg1,
          isAvailable: true,
          category: 'snacks',
        },
      ];
      onboardVendor({
        name: newVendorForm.name,
        location: newVendorForm.location,
        ownerPhone: newVendorForm.ownerPhone || '9870000000',
        commissionPct: Number(newVendorForm.commissionPct) || 10,
        cuisineTag: newVendorForm.cuisineTag || 'Quick Bites',
        bannerColor: 'from-orange-500/20 to-amber-500/10',
        prepTimeMinutes: Number(newVendorForm.prepTimeMinutes) || 15,
        menuItems: initialItems,
      });
      setShowAddVendorModal(false);
    }
  };

  const DISPATCH_PAGE_SIZE = 4;
  const ROSTER_PAGE_SIZE = 5;
  const VENDOR_PAGE_SIZE = 4;
  const REPORT_PAGE_SIZE = 5;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', overflow: 'hidden', position: 'relative' }}>
      
      {/* ─── 1. SIGNATURE DELIVO COMPACT ORANGE HEADER ─── */}
      <header className="home-header">
        <div className="header-content">
          <div className="header-top">
            
            {/* Admin Command Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(255, 255, 255, 0.22)',
                  border: '1.5px solid rgba(255, 255, 255, 0.5)',
                  padding: '5px 12px',
                  borderRadius: '9999px',
                  color: '#FFFFFF',
                }}
              >
                <ShieldCheck size={16} style={{ flexShrink: 0 }} />
                <span style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '0.02em' }}>
                  University Command
                </span>
              </div>

              {/* Global System Status Pill */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  background: settings.globalOrderingPaused ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.25)',
                  border: `1px solid ${settings.globalOrderingPaused ? 'rgba(239, 68, 68, 0.6)' : 'rgba(16, 185, 129, 0.6)'}`,
                  color: '#FFFFFF',
                  fontSize: '10.5px',
                  fontWeight: 900,
                  padding: '3px 10px',
                  borderRadius: '9999px',
                }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: settings.globalOrderingPaused ? '#EF4444' : '#10B981',
                    boxShadow: settings.globalOrderingPaused ? '0 0 8px #EF4444' : '0 0 8px #10B981',
                  }}
                />
                <span>{settings.globalOrderingPaused ? 'PAUSED' : 'ONLINE'}</span>
              </div>
            </div>

            {/* Logout Button */}
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
                flexShrink: 0,
              }}
              className="active:scale-90"
              title="Log out of Admin"
            >
              <LogOut size={16} />
            </button>
          </div>

          {/* Compact 4-KPI Row (Obsidian Glass Chips) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginTop: '6px' }}>
            <div className="portal-kpi-glass">
              <div className="portal-kpi-label">Gross Vol</div>
              <div className="portal-kpi-val">₹{totalGrossRevenue}</div>
            </div>
            <div className="portal-kpi-glass">
              <div className="portal-kpi-label">Total Orders</div>
              <div className="portal-kpi-val">{totalOrders}</div>
            </div>
            <div className="portal-kpi-glass" style={{ background: 'rgba(253, 105, 49, 0.2)', borderColor: 'rgba(253, 105, 49, 0.4)' }}>
              <div className="portal-kpi-label" style={{ color: '#FED7AA' }}>To Dispatch</div>
              <div className="portal-kpi-val" style={{ color: '#FFFFFF' }}>{dispatchableOrders.length}</div>
            </div>
            <div className="portal-kpi-glass" style={{ background: 'rgba(16, 185, 129, 0.2)', borderColor: 'rgba(16, 185, 129, 0.4)' }}>
              <div className="portal-kpi-label" style={{ color: '#A7F3D0' }}>Runners</div>
              <div className="portal-kpi-val" style={{ color: '#6EE7B7' }}>{studentRunners.length}</div>
            </div>
          </div>
        </div>
      </header>

      {/* ─── 2. MAIN SCROLLABLE CONTENT WITH SILKY PAGE TRANSITION ─── */}
      <div className="flex-1 overflow-y-auto hide-scrollbar px-4 pt-3.5 pb-28">
        
        {/* TAB 1: EMERGENCY CONTROLS */}
        {activeTab === 'killswitch' && (
          <div className="page-transition" style={{ gap: '14px' }}>
            
            {/* Master Emergency Kill Switch Card */}
            <div
              style={{
                background: settings.globalOrderingPaused
                  ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.25) 0%, rgba(26, 26, 26, 0.85) 100%)'
                  : 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(26, 26, 26, 0.85) 100%)',
                border: settings.globalOrderingPaused
                  ? '1.5px solid rgba(239, 68, 68, 0.5)'
                  : '1.5px solid rgba(16, 185, 129, 0.35)',
                borderRadius: '26px',
                padding: '18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                boxShadow: settings.globalOrderingPaused ? '0 8px 30px rgba(239, 68, 68, 0.2)' : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h2 style={{ fontSize: '17px', fontWeight: 900, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Power size={20} color={settings.globalOrderingPaused ? '#EF4444' : '#10B981'} />
                    <span>Campus Kill-Switch</span>
                  </h2>
                  <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '3px', lineHeight: 1.4 }}>
                    Instantly halts checkout for all campus students. Existing active orders complete normally.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => toggleGlobalKillSwitch(!settings.globalOrderingPaused)}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '9999px',
                  background: settings.globalOrderingPaused
                    ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                    : 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                  color: '#FFFFFF',
                  fontWeight: 900,
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  border: 'none',
                  boxShadow: settings.globalOrderingPaused
                    ? '0 4px 18px rgba(16, 185, 129, 0.4)'
                    : '0 4px 18px rgba(239, 68, 68, 0.4)',
                  cursor: 'pointer',
                  letterSpacing: '0.02em',
                }}
                className="active:scale-95"
              >
                {settings.globalOrderingPaused ? (
                  <>
                    <ToggleRight size={20} />
                    <span>RESUME CAMPUS ORDERING</span>
                  </>
                ) : (
                  <>
                    <ToggleLeft size={20} />
                    <span>EMERGENCY PAUSE ALL ORDERS</span>
                  </>
                )}
              </button>
            </div>

            {/* Hostel Delivery Controls Card */}
            <div
              style={{
                background: 'rgba(26, 26, 26, 0.72)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '26px',
                padding: '16px',
              }}
            >
              <h2 style={{ fontSize: '15px', fontWeight: 800, color: '#FFFFFF', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Building size={16} color="#FD6931" />
                <span>Per-Hostel Delivery Zones</span>
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {hostels.map((h) => {
                  const isPaused = settings.pausedHostelBlocks.includes(h.name);
                  return (
                    <div
                      key={h.id}
                      style={{
                        background: isPaused ? 'rgba(239, 68, 68, 0.1)' : 'rgba(0, 0, 0, 0.35)',
                        border: isPaused ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(255, 255, 255, 0.05)',
                        borderRadius: '20px',
                        padding: '12px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#FFFFFF' }}>{h.name}</div>
                        <div
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            color: isPaused ? '#EF4444' : '#10B981',
                            marginTop: '2px',
                          }}
                        >
                          {isPaused ? 'Deliveries Paused' : 'Ordering Active'}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleHostelKillSwitch(h.name, !isPaused)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '9999px',
                          fontSize: '12px',
                          fontWeight: 800,
                          background: isPaused ? '#10B981' : 'rgba(255, 255, 255, 0.08)',
                          color: '#FFFFFF',
                          border: isPaused ? 'none' : '1px solid rgba(255, 255, 255, 0.15)',
                          cursor: 'pointer',
                        }}
                        className="active:scale-95"
                      >
                        {isPaused ? 'Unpause' : 'Pause Zone'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Night Kitchen Cutoff Time Card */}
            <div
              style={{
                background: 'rgba(26, 26, 26, 0.72)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '26px',
                padding: '16px',
              }}
            >
              <h2 style={{ fontSize: '15px', fontWeight: 800, color: '#FFFFFF', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={16} color="#FD6931" />
                <span>Night Kitchen Cutoff</span>
              </h2>
              <p style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '12px' }}>
                Set platform cutoff hour when late night checkout ceases.
              </p>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  background: 'rgba(0, 0, 0, 0.35)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '20px',
                  padding: '10px 14px',
                }}
              >
                <input
                  type="time"
                  value={settings.cutoffTime}
                  onChange={(e) => updateCutoffTime(e.target.value)}
                  style={{
                    background: '#18181D',
                    border: '1.5px solid rgba(253, 105, 49, 0.5)',
                    color: '#FFFFFF',
                    padding: '8px 14px',
                    borderRadius: '14px',
                    fontSize: '18px',
                    fontFamily: 'monospace',
                    fontWeight: 900,
                    outline: 'none',
                  }}
                />
                <div style={{ fontSize: '12px', color: '#9CA3AF' }}>
                  Current active cutoff: <strong style={{ color: '#FFFFFF' }}>{settings.cutoffTime} IST</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MANUAL BATCH DISPATCH */}
        {activeTab === 'dispatch' && (
          <div className="page-transition">
            
            {/* Batch Action Bar Card */}
            <div
              style={{
                background: 'rgba(26, 26, 26, 0.72)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '26px',
                padding: '16px',
                marginBottom: '14px',
              }}
            >
              <div style={{ marginBottom: '12px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Send size={16} color="#FD6931" />
                  <span>Manual Batch Dispatcher</span>
                </h2>
                <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px' }}>
                  Assign multiple unassigned orders to one runner to bundle delivery trips.
                </p>
              </div>

              {/* Runner Picker & Dispatch Button */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <select
                  value={targetRunnerId}
                  onChange={(e) => setTargetRunnerId(e.target.value)}
                  style={{
                    flex: 1,
                    minWidth: '160px',
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '9999px',
                    padding: '10px 14px',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: 700,
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <option value="" style={{ background: '#18181D' }}>Select Courier Runner...</option>
                  {studentRunners.map((r) => (
                    <option key={r.id} value={r.id} style={{ background: '#18181D' }}>
                      {r.name} ({r.hostelBlock?.split(' ')[0]})
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  disabled={selectedOrderIds.length === 0 || !targetRunnerId}
                  onClick={handleBatchDispatchSubmit}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '9999px',
                    background:
                      selectedOrderIds.length > 0 && targetRunnerId
                        ? 'linear-gradient(135deg, #FD6931 0%, #F85013 100%)'
                        : 'rgba(255, 255, 255, 0.05)',
                    color: selectedOrderIds.length > 0 && targetRunnerId ? '#FFFFFF' : '#4B5563',
                    fontSize: '13px',
                    fontWeight: 800,
                    border: 'none',
                    boxShadow:
                      selectedOrderIds.length > 0 && targetRunnerId ? '0 4px 14px rgba(253, 105, 49, 0.4)' : 'none',
                    cursor: selectedOrderIds.length > 0 && targetRunnerId ? 'pointer' : 'not-allowed',
                    whiteSpace: 'nowrap',
                  }}
                  className={selectedOrderIds.length > 0 && targetRunnerId ? 'active:scale-95' : ''}
                >
                  🚀 Dispatch ({selectedOrderIds.length})
                </button>
              </div>

              {/* Filter Chips Bar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '14px', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <select
                  value={selectedHostelFilter}
                  onChange={(e) => {
                    setSelectedHostelFilter(e.target.value);
                    setDispatchPage(0);
                  }}
                  style={{
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '9999px',
                    padding: '5px 12px',
                    color: '#9CA3AF',
                    fontSize: '12px',
                    fontWeight: 700,
                    outline: 'none',
                  }}
                >
                  <option value="all" style={{ background: '#18181D' }}>All Hostels</option>
                  <option value="Aryabhatta" style={{ background: '#18181D' }}>Aryabhatta Hall</option>
                  <option value="Bhaskara" style={{ background: '#18181D' }}>Bhaskara Hall</option>
                </select>

                <button
                  type="button"
                  onClick={handleSelectAllOrders}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#FD6931',
                    fontSize: '12px',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  {selectedOrderIds.length === filteredDispatchOrders.length && filteredDispatchOrders.length > 0
                    ? 'Deselect All'
                    : 'Select All Filtered'}
                </button>
              </div>
            </div>

            {/* Orders Waiting List */}
            {filteredDispatchOrders.length === 0 ? (
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
                    background: 'rgba(253, 105, 49, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FD6931',
                    marginBottom: '16px',
                  }}
                >
                  <Package size={32} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF', marginBottom: '6px' }}>
                  No Pending Orders
                </h3>
                <p style={{ fontSize: '13px', color: '#9CA3AF', maxWidth: '280px', lineHeight: 1.5 }}>
                  All placed orders have been assigned to couriers or completed.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {filteredDispatchOrders
                  .slice(dispatchPage * DISPATCH_PAGE_SIZE, (dispatchPage + 1) * DISPATCH_PAGE_SIZE)
                  .map((ord) => {
                    const isChecked = selectedOrderIds.includes(ord.id);
                    return (
                      <div
                        key={ord.id}
                        onClick={() => handleToggleOrderSelection(ord.id)}
                        style={{
                          background: isChecked ? 'rgba(253, 105, 49, 0.15)' : 'rgba(26, 26, 26, 0.72)',
                          backdropFilter: 'blur(20px)',
                          border: isChecked ? '1.5px solid #FD6931' : '1px solid rgba(255, 255, 255, 0.08)',
                          borderRadius: '24px',
                          padding: '14px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          boxShadow: isChecked ? '0 4px 16px rgba(253, 105, 49, 0.25)' : 'none',
                        }}
                        className="active:scale-[0.99]"
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '7px',
                              border: isChecked ? 'none' : '1.5px solid rgba(255, 255, 255, 0.3)',
                              background: isChecked ? '#FD6931' : 'transparent',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#FFFFFF',
                              flexShrink: 0,
                            }}
                          >
                            {isChecked && <ShieldCheck size={16} />}
                          </div>

                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                              <span style={{ fontFamily: 'monospace', fontWeight: 900, color: '#FFFFFF', fontSize: '14px' }}>
                                {ord.id}
                              </span>
                              <OrderStatusBadge status={ord.status} size="sm" />
                            </div>
                            <div style={{ fontSize: '12px', color: '#9CA3AF' }}>
                              Stall: <strong style={{ color: '#E5E7EB' }}>{ord.vendorName}</strong>
                            </div>
                            <div style={{ fontSize: '12px', color: '#FD6931', fontWeight: 700, marginTop: '1px' }}>
                              Drop: {ord.hostelBlock.split(' ')[0]} • Rm {ord.roomNumber}
                            </div>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '16px', fontWeight: 900, color: '#FFFFFF' }}>
                            {formatRupees(ord.totalAmount)}
                          </div>
                          <div style={{ fontSize: '10.5px', color: '#6B7280', fontFamily: 'monospace', marginTop: '2px' }}>
                            {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                {/* Dispatch Pagination */}
                {filteredDispatchOrders.length > DISPATCH_PAGE_SIZE && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setDispatchPage((p) => Math.max(0, p - 1))}
                      disabled={dispatchPage === 0}
                      style={{
                        padding: '7px 14px',
                        borderRadius: '9999px',
                        fontWeight: 700,
                        fontSize: '11.5px',
                        background: dispatchPage === 0 ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.1)',
                        color: dispatchPage === 0 ? '#4B5563' : '#FFFFFF',
                        border: 'none',
                        cursor: dispatchPage === 0 ? 'not-allowed' : 'pointer',
                      }}
                    >
                      Prev
                    </button>
                    <div style={{ fontSize: '10.5px', fontFamily: 'monospace', color: '#9CA3AF' }}>
                      Page {dispatchPage + 1} / {Math.ceil(filteredDispatchOrders.length / DISPATCH_PAGE_SIZE)}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setDispatchPage((p) => Math.min(Math.ceil(filteredDispatchOrders.length / DISPATCH_PAGE_SIZE) - 1, p + 1))
                      }
                      disabled={dispatchPage >= Math.ceil(filteredDispatchOrders.length / DISPATCH_PAGE_SIZE) - 1}
                      style={{
                        padding: '7px 14px',
                        borderRadius: '9999px',
                        fontWeight: 700,
                        fontSize: '11.5px',
                        background:
                          dispatchPage >= Math.ceil(filteredDispatchOrders.length / DISPATCH_PAGE_SIZE) - 1
                            ? 'rgba(255, 255, 255, 0.04)'
                            : '#FD6931',
                        color:
                          dispatchPage >= Math.ceil(filteredDispatchOrders.length / DISPATCH_PAGE_SIZE) - 1 ? '#4B5563' : '#FFFFFF',
                        border: 'none',
                        cursor:
                          dispatchPage >= Math.ceil(filteredDispatchOrders.length / DISPATCH_PAGE_SIZE) - 1 ? 'not-allowed' : 'pointer',
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

        {/* TAB 3: RUNNER ROSTER */}
        {activeTab === 'roster' && (
          <div className="page-transition">
            {/* Header info & Add runner button */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '14px',
              }}
            >
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#FFFFFF' }}>Courier Roster</h2>
                <p style={{ fontSize: '12px', color: '#9CA3AF' }}>Verify student IDs & onboard new runners.</p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddRunnerModal(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'linear-gradient(135deg, #FD6931 0%, #F85013 100%)',
                  padding: '8px 14px',
                  borderRadius: '9999px',
                  color: '#FFFFFF',
                  fontSize: '12px',
                  fontWeight: 800,
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(253, 105, 49, 0.3)',
                }}
                className="active:scale-95"
              >
                <Plus size={14} />
                <span>Add Runner</span>
              </button>
            </div>

            {/* Runner Roster Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {studentRunners
                .slice(rosterPage * ROSTER_PAGE_SIZE, (rosterPage + 1) * ROSTER_PAGE_SIZE)
                .map((r) => (
                  <div
                    key={r.id}
                    style={{
                      background: 'rgba(26, 26, 26, 0.72)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '24px',
                      padding: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 800, color: '#FFFFFF' }}>{r.name}</span>
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 800,
                            padding: '2px 8px',
                            borderRadius: '9999px',
                            background: r.isVerified ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                            color: r.isVerified ? '#34D399' : '#FBBF24',
                            border: `1px solid ${r.isVerified ? 'rgba(16, 185, 129, 0.4)' : 'rgba(245, 158, 11, 0.4)'}`,
                          }}
                        >
                          {r.isVerified ? '✓ Verified' : 'Pending ID'}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#9CA3AF' }}>
                        {r.hostelBlock} • <span style={{ fontFamily: 'monospace' }}>{r.phone}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleRunnerVerification(r.id)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '9999px',
                        fontSize: '11px',
                        fontWeight: 800,
                        background: r.isVerified ? 'rgba(255, 255, 255, 0.06)' : 'rgba(99, 102, 241, 0.2)',
                        border: `1px solid ${r.isVerified ? 'rgba(255, 255, 255, 0.12)' : 'rgba(99, 102, 241, 0.4)'}`,
                        color: r.isVerified ? '#9CA3AF' : '#818CF8',
                        cursor: 'pointer',
                      }}
                      className="active:scale-95"
                    >
                      {r.isVerified ? 'Revoke' : 'Verify ID'}
                    </button>
                  </div>
                ))}

              {/* Roster Pagination */}
              {studentRunners.length > ROSTER_PAGE_SIZE && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setRosterPage((p) => Math.max(0, p - 1))}
                    disabled={rosterPage === 0}
                    style={{
                      padding: '7px 14px',
                      borderRadius: '9999px',
                      fontWeight: 700,
                      fontSize: '11.5px',
                      background: rosterPage === 0 ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.1)',
                      color: rosterPage === 0 ? '#4B5563' : '#FFFFFF',
                      border: 'none',
                      cursor: rosterPage === 0 ? 'not-allowed' : 'pointer',
                    }}
                  >
                    Prev
                  </button>
                  <div style={{ fontSize: '10.5px', fontFamily: 'monospace', color: '#9CA3AF' }}>
                    Page {rosterPage + 1} / {Math.ceil(studentRunners.length / ROSTER_PAGE_SIZE)}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setRosterPage((p) => Math.min(Math.ceil(studentRunners.length / ROSTER_PAGE_SIZE) - 1, p + 1))
                    }
                    disabled={rosterPage >= Math.ceil(studentRunners.length / ROSTER_PAGE_SIZE) - 1}
                    style={{
                      padding: '7px 14px',
                      borderRadius: '9999px',
                      fontWeight: 700,
                      fontSize: '11.5px',
                      background:
                        rosterPage >= Math.ceil(studentRunners.length / ROSTER_PAGE_SIZE) - 1
                          ? 'rgba(255, 255, 255, 0.04)'
                          : '#FD6931',
                      color:
                        rosterPage >= Math.ceil(studentRunners.length / ROSTER_PAGE_SIZE) - 1 ? '#4B5563' : '#FFFFFF',
                      border: 'none',
                      cursor:
                        rosterPage >= Math.ceil(studentRunners.length / ROSTER_PAGE_SIZE) - 1 ? 'not-allowed' : 'pointer',
                    }}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: VENDORS / STALLS */}
        {activeTab === 'vendors' && (
          <div className="page-transition">
            {/* Header info & Onboard stall button */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '14px',
              }}
            >
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#FFFFFF' }}>Campus Stalls</h2>
                <p style={{ fontSize: '12px', color: '#9CA3AF' }}>Manage commissions & onboard partners.</p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddVendorModal(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'linear-gradient(135deg, #FD6931 0%, #F85013 100%)',
                  padding: '8px 14px',
                  borderRadius: '9999px',
                  color: '#FFFFFF',
                  fontSize: '12px',
                  fontWeight: 800,
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(253, 105, 49, 0.3)',
                }}
                className="active:scale-95"
              >
                <Plus size={14} />
                <span>Onboard Stall</span>
              </button>
            </div>

            {/* Vendor Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {vendors
                .slice(vendorPage * VENDOR_PAGE_SIZE, (vendorPage + 1) * VENDOR_PAGE_SIZE)
                .map((v) => (
                  <div
                    key={v.id}
                    style={{
                      background: 'rgba(26, 26, 26, 0.72)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '26px',
                      padding: '14px',
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'center',
                    }}
                  >
                    <div
                      style={{
                        width: '72px',
                        height: '72px',
                        borderRadius: '20px',
                        overflow: 'hidden',
                        background: '#18181D',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        flexShrink: 0,
                      }}
                    >
                      {v.coverImage ? (
                        <img src={v.coverImage} alt={v.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}>
                          <Store size={26} />
                        </div>
                      )}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                        <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {v.name}
                        </h3>
                        <span style={{ fontSize: '11px', fontWeight: 800, color: '#FBBF24', background: 'rgba(245, 158, 11, 0.15)', padding: '2px 7px', borderRadius: '9999px', flexShrink: 0 }}>
                          ★ {v.rating}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px' }}>{v.location}</div>
                      
                      {/* Commission split adjustment */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px', paddingTop: '6px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                        <span style={{ fontSize: '11px', color: '#6B7280' }}>{v.menuItems.length} menu items</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '10.5px', fontWeight: 800, color: '#9CA3AF', textTransform: 'uppercase' }}>Comm:</span>
                          <select
                            value={v.commissionPct}
                            onChange={(e) => updateVendorCommission(v.id, Number(e.target.value))}
                            style={{
                              background: 'rgba(0, 0, 0, 0.4)',
                              border: '1px solid rgba(253, 105, 49, 0.4)',
                              borderRadius: '9999px',
                              padding: '2px 8px',
                              color: '#FD6931',
                              fontSize: '11px',
                              fontWeight: 800,
                              outline: 'none',
                            }}
                          >
                            {[8, 10, 12, 15, 20].map((pct) => (
                              <option key={pct} value={pct} style={{ background: '#18181D', color: '#FFFFFF' }}>
                                {pct}%
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

              {/* Vendor Pagination */}
              {vendors.length > VENDOR_PAGE_SIZE && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setVendorPage((p) => Math.max(0, p - 1))}
                    disabled={vendorPage === 0}
                    style={{
                      padding: '7px 14px',
                      borderRadius: '9999px',
                      fontWeight: 700,
                      fontSize: '11.5px',
                      background: vendorPage === 0 ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.1)',
                      color: vendorPage === 0 ? '#4B5563' : '#FFFFFF',
                      border: 'none',
                      cursor: vendorPage === 0 ? 'not-allowed' : 'pointer',
                    }}
                  >
                    Prev
                  </button>
                  <div style={{ fontSize: '10.5px', fontFamily: 'monospace', color: '#9CA3AF' }}>
                    Page {vendorPage + 1} / {Math.ceil(vendors.length / VENDOR_PAGE_SIZE)}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setVendorPage((p) => Math.min(Math.ceil(vendors.length / VENDOR_PAGE_SIZE) - 1, p + 1))
                    }
                    disabled={vendorPage >= Math.ceil(vendors.length / VENDOR_PAGE_SIZE) - 1}
                    style={{
                      padding: '7px 14px',
                      borderRadius: '9999px',
                      fontWeight: 700,
                      fontSize: '11.5px',
                      background:
                        vendorPage >= Math.ceil(vendors.length / VENDOR_PAGE_SIZE) - 1
                          ? 'rgba(255, 255, 255, 0.04)'
                          : '#FD6931',
                      color:
                        vendorPage >= Math.ceil(vendors.length / VENDOR_PAGE_SIZE) - 1 ? '#4B5563' : '#FFFFFF',
                      border: 'none',
                      cursor:
                        vendorPage >= Math.ceil(vendors.length / VENDOR_PAGE_SIZE) - 1 ? 'not-allowed' : 'pointer',
                    }}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: REPORTS & FINANCIAL AUDIT */}
        {activeTab === 'reports' && (
          <div className="page-transition">
            {/* 4 Financial Metric Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '14px' }}>
              <div
                style={{
                  background: 'rgba(26, 26, 26, 0.72)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '24px',
                  padding: '14px',
                }}
              >
                <div style={{ fontSize: '9.5px', fontWeight: 800, color: '#6B7280', textTransform: 'uppercase' }}>Gross Volume</div>
                <div style={{ fontSize: '20px', fontWeight: 900, color: '#FFFFFF', marginTop: '2px' }}>{formatRupees(totalGrossRevenue)}</div>
                <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '2px' }}>{totalOrders} campus orders</div>
              </div>

              <div
                style={{
                  background: 'rgba(16, 185, 129, 0.12)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '24px',
                  padding: '14px',
                }}
              >
                <div style={{ fontSize: '9.5px', fontWeight: 800, color: '#A7F3D0', textTransform: 'uppercase' }}>Platform Rev</div>
                <div style={{ fontSize: '20px', fontWeight: 900, color: '#34D399', marginTop: '2px' }}>{formatRupees(totalCommissionCollected)}</div>
                <div style={{ fontSize: '11px', color: '#6EE7B7', marginTop: '2px' }}>Net fee retained</div>
              </div>

              <div
                style={{
                  background: 'rgba(253, 105, 49, 0.12)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(253, 105, 49, 0.3)',
                  borderRadius: '24px',
                  padding: '14px',
                }}
              >
                <div style={{ fontSize: '9.5px', fontWeight: 800, color: '#FED7AA', textTransform: 'uppercase' }}>Courier Payouts</div>
                <div style={{ fontSize: '20px', fontWeight: 900, color: '#FD6931', marginTop: '2px' }}>{formatRupees(totalRunnerPayouts)}</div>
                <div style={{ fontSize: '11px', color: '#FDBA74', marginTop: '2px' }}>₹18/deliv + batch</div>
              </div>

              <div
                style={{
                  background: 'rgba(26, 26, 26, 0.72)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '24px',
                  padding: '14px',
                }}
              >
                <div style={{ fontSize: '9.5px', fontWeight: 800, color: '#6B7280', textTransform: 'uppercase' }}>Cancel Rate</div>
                <div style={{ fontSize: '20px', fontWeight: 900, color: '#FFFFFF', marginTop: '2px' }}>{refundRate}%</div>
                <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '2px' }}>{cancelledOrders.length} cancelled</div>
              </div>
            </div>

            {/* Audit Log Table Card */}
            <div
              style={{
                background: 'rgba(26, 26, 26, 0.72)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '26px',
                padding: '16px',
              }}
            >
              <h3 style={{ fontSize: '14.5px', fontWeight: 800, color: '#FFFFFF', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FileText size={16} color="#FD6931" />
                <span>Master Campus Audit Log</span>
              </h3>

              <div style={{ overflowX: 'auto' }} className="hide-scrollbar">
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ color: '#6B7280', fontSize: '9.5px', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                      <th style={{ padding: '8px 4px', fontWeight: 800 }}>ID</th>
                      <th style={{ padding: '8px 4px', fontWeight: 800 }}>Stall</th>
                      <th style={{ padding: '8px 4px', fontWeight: 800 }}>Student</th>
                      <th style={{ padding: '8px 4px', fontWeight: 800, textAlign: 'right' }}>Total</th>
                      <th style={{ padding: '8px 4px', fontWeight: 800, textAlign: 'right' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders
                      .slice(reportPage * REPORT_PAGE_SIZE, (reportPage + 1) * REPORT_PAGE_SIZE)
                      .map((o) => (
                        <tr key={o.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                          <td style={{ padding: '10px 4px', fontFamily: 'monospace', fontWeight: 800, color: '#FFFFFF' }}>
                            {o.id}
                          </td>
                          <td style={{ padding: '10px 4px', color: '#E5E7EB' }}>
                            {o.vendorName}
                          </td>
                          <td style={{ padding: '10px 4px' }}>
                            <div style={{ color: '#FFFFFF', fontWeight: 700 }}>{o.studentName}</div>
                            <div style={{ fontSize: '10px', color: '#9CA3AF' }}>{o.hostelBlock.split(' ')[0]}</div>
                          </td>
                          <td style={{ padding: '10px 4px', textAlign: 'right', fontWeight: 800, color: '#FFFFFF' }}>
                            {formatRupees(o.totalAmount)}
                          </td>
                          <td style={{ padding: '10px 4px', textAlign: 'right' }}>
                            <OrderStatusBadge status={o.status} size="sm" />
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {/* Reports Pagination */}
              {orders.length > REPORT_PAGE_SIZE && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setReportPage((p) => Math.max(0, p - 1))}
                    disabled={reportPage === 0}
                    style={{
                      padding: '7px 14px',
                      borderRadius: '9999px',
                      fontWeight: 700,
                      fontSize: '11.5px',
                      background: reportPage === 0 ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.1)',
                      color: reportPage === 0 ? '#4B5563' : '#FFFFFF',
                      border: 'none',
                      cursor: reportPage === 0 ? 'not-allowed' : 'pointer',
                    }}
                  >
                    Prev
                  </button>
                  <div style={{ fontSize: '10.5px', fontFamily: 'monospace', color: '#9CA3AF' }}>
                    Page {reportPage + 1} / {Math.ceil(orders.length / REPORT_PAGE_SIZE)}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setReportPage((p) => Math.min(Math.ceil(orders.length / REPORT_PAGE_SIZE) - 1, p + 1))
                    }
                    disabled={reportPage >= Math.ceil(orders.length / REPORT_PAGE_SIZE) - 1}
                    style={{
                      padding: '7px 14px',
                      borderRadius: '9999px',
                      fontWeight: 700,
                      fontSize: '11.5px',
                      background:
                        reportPage >= Math.ceil(orders.length / REPORT_PAGE_SIZE) - 1
                          ? 'rgba(255, 255, 255, 0.04)'
                          : '#FD6931',
                      color:
                        reportPage >= Math.ceil(orders.length / REPORT_PAGE_SIZE) - 1 ? '#4B5563' : '#FFFFFF',
                      border: 'none',
                      cursor:
                        reportPage >= Math.ceil(orders.length / REPORT_PAGE_SIZE) - 1 ? 'not-allowed' : 'pointer',
                    }}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ─── 3. FLOATING ISLAND GLASS DOCK WITH ACTIVE CAPSULE ─── */}
      <nav className="floating-glass-dock">
        <button
          type="button"
          onClick={() => setActiveTab('killswitch')}
          className={`dock-tab ${activeTab === 'killswitch' ? 'active' : ''}`}
        >
          <Power size={19} />
          <span className="dock-tab-label">Controls</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('dispatch')}
          className={`dock-tab ${activeTab === 'dispatch' ? 'active' : ''}`}
        >
          <Send size={19} />
          <span className="dock-tab-label">Dispatch</span>
          {dispatchableOrders.length > 0 && (
            <span className="dock-badge-count">{dispatchableOrders.length}</span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('roster')}
          className={`dock-tab ${activeTab === 'roster' ? 'active' : ''}`}
        >
          <Bike size={19} />
          <span className="dock-tab-label">Runners</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('vendors')}
          className={`dock-tab ${activeTab === 'vendors' ? 'active' : ''}`}
        >
          <Store size={19} />
          <span className="dock-tab-label">Stalls</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reports')}
          className={`dock-tab ${activeTab === 'reports' ? 'active' : ''}`}
        >
          <FileText size={19} />
          <span className="dock-tab-label">Reports</span>
        </button>
      </nav>

      {/* ─── 4. ADD RUNNER MODAL SHEET ─── */}
      {showAddRunnerModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 150,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            padding: '16px',
          }}
          className="animate-in fade-in"
        >
          <div
            style={{
              width: '100%',
              maxWidth: '380px',
              background: '#141419',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '28px',
              padding: '24px',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)',
            }}
            className="animate-in zoom-in-95"
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#FFFFFF' }}>Add Courier Runner</h3>
              <button
                type="button"
                onClick={() => setShowAddRunnerModal(false)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateRunner} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: '#6B7280', display: 'block', marginBottom: '4px' }}>
                  Student Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={newRunnerForm.name}
                  onChange={(e) => setNewRunnerForm({ ...newRunnerForm, name: e.target.value })}
                  style={{
                    width: '100%',
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '16px',
                    padding: '12px 14px',
                    color: '#FFFFFF',
                    fontSize: '13.5px',
                    fontWeight: 700,
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: '#6B7280', display: 'block', marginBottom: '4px' }}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9876543210"
                  value={newRunnerForm.phone}
                  onChange={(e) => setNewRunnerForm({ ...newRunnerForm, phone: e.target.value })}
                  style={{
                    width: '100%',
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '16px',
                    padding: '12px 14px',
                    color: '#FFFFFF',
                    fontSize: '13.5px',
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: '#6B7280', display: 'block', marginBottom: '4px' }}>
                  Hostel Base
                </label>
                <select
                  value={newRunnerForm.hostelBlock}
                  onChange={(e) => setNewRunnerForm({ ...newRunnerForm, hostelBlock: e.target.value })}
                  style={{
                    width: '100%',
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '16px',
                    padding: '12px 14px',
                    color: '#FFFFFF',
                    fontSize: '13.5px',
                    fontWeight: 700,
                    outline: 'none',
                  }}
                >
                  {hostels.map((h) => (
                    <option key={h.id} value={h.name} style={{ background: '#18181D' }}>
                      {h.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '9999px',
                  background: 'linear-gradient(135deg, #FD6931 0%, #F85013 100%)',
                  color: '#FFFFFF',
                  fontWeight: 900,
                  fontSize: '14px',
                  border: 'none',
                  boxShadow: '0 4px 16px rgba(253, 105, 49, 0.4)',
                  cursor: 'pointer',
                  marginTop: '10px',
                }}
                className="active:scale-95"
              >
                Enroll Runner To Roster
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ─── 5. ONBOARD STALL MODAL SHEET ─── */}
      {showAddVendorModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 150,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            padding: '16px',
          }}
          className="animate-in fade-in"
        >
          <div
            style={{
              width: '100%',
              maxWidth: '420px',
              maxHeight: '90vh',
              overflowY: 'auto',
              background: '#141419',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '28px',
              padding: '24px',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)',
            }}
            className="animate-in zoom-in-95 hide-scrollbar"
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#FFFFFF' }}>Onboard Campus Stall</h3>
              <button
                type="button"
                onClick={() => setShowAddVendorModal(false)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateVendor} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: '#6B7280', display: 'block', marginBottom: '4px' }}>
                  Stall Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chai & Snacks Hub"
                  value={newVendorForm.name}
                  onChange={(e) => setNewVendorForm({ ...newVendorForm, name: e.target.value })}
                  style={{
                    width: '100%',
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '16px',
                    padding: '12px 14px',
                    color: '#FFFFFF',
                    fontSize: '13.5px',
                    fontWeight: 700,
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: '#6B7280', display: 'block', marginBottom: '4px' }}>
                  Location / Zone
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Student Center, Ground Floor"
                  value={newVendorForm.location}
                  onChange={(e) => setNewVendorForm({ ...newVendorForm, location: e.target.value })}
                  style={{
                    width: '100%',
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '16px',
                    padding: '12px 14px',
                    color: '#FFFFFF',
                    fontSize: '13.5px',
                    fontWeight: 700,
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: '#6B7280', display: 'block', marginBottom: '4px' }}>
                    Comm. %
                  </label>
                  <input
                    type="number"
                    required
                    value={newVendorForm.commissionPct}
                    onChange={(e) => setNewVendorForm({ ...newVendorForm, commissionPct: Number(e.target.value) })}
                    style={{
                      width: '100%',
                      background: 'rgba(0, 0, 0, 0.4)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '16px',
                      padding: '12px 14px',
                      color: '#FFFFFF',
                      fontSize: '13.5px',
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      outline: 'none',
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: '#6B7280', display: 'block', marginBottom: '4px' }}>
                    Prep Time (min)
                  </label>
                  <input
                    type="number"
                    required
                    value={newVendorForm.prepTimeMinutes}
                    onChange={(e) => setNewVendorForm({ ...newVendorForm, prepTimeMinutes: Number(e.target.value) })}
                    style={{
                      width: '100%',
                      background: 'rgba(0, 0, 0, 0.4)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '16px',
                      padding: '12px 14px',
                      color: '#FFFFFF',
                      fontSize: '13.5px',
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              {/* Initial Menu Item */}
              <div style={{ paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#FD6931', marginBottom: '6px' }}>
                  Signature Dish
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    required
                    placeholder="Item Name (e.g. Masala Dosa)"
                    value={newVendorForm.itemName1}
                    onChange={(e) => setNewVendorForm({ ...newVendorForm, itemName1: e.target.value })}
                    style={{
                      flex: 1,
                      background: 'rgba(0, 0, 0, 0.4)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '16px',
                      padding: '10px 12px',
                      color: '#FFFFFF',
                      fontSize: '13px',
                      fontWeight: 700,
                      outline: 'none',
                    }}
                  />
                  <input
                    type="number"
                    required
                    placeholder="₹ Price"
                    value={newVendorForm.itemPrice1}
                    onChange={(e) => setNewVendorForm({ ...newVendorForm, itemPrice1: Number(e.target.value) })}
                    style={{
                      width: '80px',
                      background: 'rgba(0, 0, 0, 0.4)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '16px',
                      padding: '10px 12px',
                      color: '#FFFFFF',
                      fontSize: '13px',
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '9999px',
                  background: 'linear-gradient(135deg, #FD6931 0%, #F85013 100%)',
                  color: '#FFFFFF',
                  fontWeight: 900,
                  fontSize: '14px',
                  border: 'none',
                  boxShadow: '0 4px 16px rgba(253, 105, 49, 0.4)',
                  cursor: 'pointer',
                  marginTop: '10px',
                }}
                className="active:scale-95"
              >
                Onboard Stall & Publish
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
