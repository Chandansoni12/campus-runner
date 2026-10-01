import React, { useState } from 'react';
import { useAppStore } from '../../store';
import { OrderStatus } from '../../types';
import { formatRupees, calculateCommission } from '../../business-logic';
import { OrderStatusBadge } from '../common/OrderStatusBadge';
import { SlotBadge } from '../common/SlotBadge';
import {
  Store,
  CookingPot,
  PackageCheck,
  Clock,
  ChefHat,
  ReceiptText,
  ChevronDown,
  CheckCircle2,
  Flame,
  LogOut,
  Search,
} from 'lucide-react';

export const VendorView: React.FC = () => {
  const {
    vendors,
    activeVendorId,
    setActiveVendorId,
    orders,
    logout,
    acceptOrder,
    rejectOrder,
    markOrderReady,
    toggleMenuItemStock,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'queue' | 'menu' | 'settlement'>('queue');
  const [queueFilter, setQueueFilter] = useState<'all' | 'active' | 'ready' | 'completed'>('active');
  const [queuePage, setQueuePage] = useState(0);
  const [menuPage, setMenuPage] = useState(0);
  const [ledgerPage, setLedgerPage] = useState(0);
  const [menuSearch, setMenuSearch] = useState('');

  const activeVendor = vendors.find((v) => v.id === activeVendorId) || vendors[0];

  // Filter orders for this specific vendor
  const vendorOrders = orders
    .filter((o) => o.vendorId === activeVendor.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Metrics for settlement & live dashboard
  const todayOrders = vendorOrders.filter((o) => o.status !== OrderStatus.CANCELLED);
  const grossSales = todayOrders.reduce((sum, o) => sum + o.subtotalAmount, 0);
  const commissionOwed = todayOrders.reduce(
    (sum, o) => sum + calculateCommission(o.subtotalAmount, activeVendor.commissionPct),
    0
  );
  const netEarnings = grossSales - commissionOwed;

  // Filter queue orders
  const filteredQueue = vendorOrders.filter((o) => {
    if (queueFilter === 'active') {
      return (
        o.status === OrderStatus.PLACED ||
        o.status === OrderStatus.ACCEPTED ||
        o.status === OrderStatus.PREPARING
      );
    }
    if (queueFilter === 'ready') {
      return o.status === OrderStatus.READY || o.status === OrderStatus.OUT_FOR_DELIVERY;
    }
    if (queueFilter === 'completed') {
      return o.status === OrderStatus.DELIVERED || o.status === OrderStatus.CANCELLED;
    }
    return true;
  });

  // Filter menu items
  const filteredMenuItems = activeVendor.menuItems.filter((item) =>
    item.name.toLowerCase().includes(menuSearch.toLowerCase()) ||
    item.category.toLowerCase().includes(menuSearch.toLowerCase())
  );

  const QUEUE_PAGE_SIZE = 4;
  const MENU_PAGE_SIZE = 6;
  const LEDGER_PAGE_SIZE = 5;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', overflow: 'hidden', position: 'relative' }}>
      
      {/* ─── 1. SIGNATURE DELIVO COMPACT ORANGE HEADER ─── */}
      <header className="home-header">
        <div className="header-content">
          <div className="header-top">
            
            {/* Stall Selector & Live Badge */}
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
                <Store size={15} style={{ flexShrink: 0 }} />
                <select
                  value={activeVendorId}
                  onChange={(e) => {
                    setActiveVendorId(e.target.value);
                    setQueuePage(0);
                    setMenuPage(0);
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
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id} style={{ background: '#18181D', color: '#FFFFFF' }}>
                      {v.name}
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
                <span>LIVE</span>
              </div>
            </div>

            {/* Fee Pill & Logout Button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              <div
                style={{
                  background: 'rgba(0, 0, 0, 0.25)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#FFFFFF',
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '4px 9px',
                  borderRadius: '9999px',
                }}
              >
                Fee: {activeVendor.commissionPct}%
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

          {/* Compact 4-KPI Row (Obsidian Glass Chips) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginTop: '6px' }}>
            <div className="portal-kpi-glass">
              <div className="portal-kpi-label">Orders</div>
              <div className="portal-kpi-val">{todayOrders.length}</div>
            </div>
            <div className="portal-kpi-glass">
              <div className="portal-kpi-label">Sales</div>
              <div className="portal-kpi-val">₹{grossSales}</div>
            </div>
            <div className="portal-kpi-glass">
              <div className="portal-kpi-label">Fee ({activeVendor.commissionPct}%)</div>
              <div className="portal-kpi-val" style={{ color: '#FED7AA' }}>-₹{commissionOwed}</div>
            </div>
            <div className="portal-kpi-glass" style={{ background: 'rgba(16, 185, 129, 0.2)', borderColor: 'rgba(16, 185, 129, 0.4)' }}>
              <div className="portal-kpi-label" style={{ color: '#A7F3D0' }}>Net Payable</div>
              <div className="portal-kpi-val" style={{ color: '#6EE7B7' }}>₹{netEarnings}</div>
            </div>
          </div>
        </div>
      </header>

      {/* ─── 2. MAIN SCROLLABLE CONTENT WITH SILKY PAGE TRANSITION ─── */}
      <div className="flex-1 overflow-y-auto hide-scrollbar px-4 pt-3.5 pb-28">
        
        {/* TAB 1: KITCHEN ORDER QUEUE */}
        {activeTab === 'queue' && (
          <div className="page-transition">
            {/* Filter Pills */}
            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-3">
              {[
                { id: 'active', label: 'Action Needed', icon: Flame },
                { id: 'ready', label: 'Ready for Runner', icon: PackageCheck },
                { id: 'completed', label: 'Completed', icon: CheckCircle2 },
                { id: 'all', label: 'All Orders', icon: Store },
              ].map((f) => {
                const isSelected = queueFilter === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => {
                      setQueueFilter(f.id as any);
                      setQueuePage(0);
                    }}
                    style={{
                      borderRadius: '9999px',
                      padding: '7px 14px',
                      fontSize: '12px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      whiteSpace: 'nowrap',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      background: isSelected
                        ? 'linear-gradient(135deg, rgba(253, 105, 49, 0.28), rgba(255, 120, 60, 0.12))'
                        : 'rgba(26, 26, 26, 0.7)',
                      color: isSelected ? '#FD6931' : '#9CA3AF',
                      border: isSelected
                        ? '1px solid rgba(253, 105, 49, 0.6)'
                        : '1px solid rgba(255, 255, 255, 0.08)',
                      boxShadow: isSelected ? '0 4px 12px rgba(253, 105, 49, 0.2)' : 'none',
                    }}
                    className="active:scale-95"
                  >
                    <f.icon size={13} />
                    <span>{f.label}</span>
                  </button>
                );
              })}
            </div>

            {filteredQueue.length === 0 ? (
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
                  <CookingPot size={32} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF', marginBottom: '6px' }}>
                  Queue is Clear!
                </h3>
                <p style={{ fontSize: '13px', color: '#9CA3AF', maxWidth: '280px', lineHeight: 1.5 }}>
                  No orders in this status right now. New student orders will instantly show up here.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {filteredQueue
                  .slice(queuePage * QUEUE_PAGE_SIZE, (queuePage + 1) * QUEUE_PAGE_SIZE)
                  .map((order) => {
                    const isIncoming = order.status === OrderStatus.PLACED;
                    const isCooking =
                      order.status === OrderStatus.ACCEPTED || order.status === OrderStatus.PREPARING;
                    const isReady = order.status === OrderStatus.READY;

                    return (
                      <div
                        key={order.id}
                        style={{
                          background: 'rgba(26, 26, 26, 0.72)',
                          backdropFilter: 'blur(20px)',
                          borderRadius: '26px',
                          border: isIncoming
                            ? '1.5px solid rgba(253, 105, 49, 0.65)'
                            : isCooking
                            ? '1px solid rgba(99, 102, 241, 0.45)'
                            : '1px solid rgba(255, 255, 255, 0.08)',
                          boxShadow: isIncoming
                            ? '0 8px 24px rgba(253, 105, 49, 0.2)'
                            : '0 8px 20px rgba(0, 0, 0, 0.4)',
                          padding: '16px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px',
                        }}
                      >
                        {/* Order Header */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                              <span style={{ fontFamily: 'monospace', fontSize: '16px', fontWeight: 900, color: '#FFFFFF' }}>
                                {order.id}
                              </span>
                              <OrderStatusBadge status={order.status} size="sm" />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: '#9CA3AF' }}>
                              <Clock size={12} />
                              <span>{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              <span>•</span>
                              <SlotBadge slot={order.slot} size="sm" />
                            </div>
                          </div>

                          <div style={{ fontSize: '19px', fontWeight: 900, color: '#FFFFFF' }}>
                            {formatRupees(order.subtotalAmount)}
                          </div>
                        </div>

                        {/* Customer & Location Box */}
                        <div
                          style={{
                            background: 'rgba(0, 0, 0, 0.35)',
                            borderRadius: '18px',
                            padding: '10px 14px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                          }}
                        >
                          <div>
                            <div style={{ fontSize: '9.5px', fontWeight: 800, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                              Customer
                            </div>
                            <div style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF', marginTop: '1px' }}>
                              {order.studentName}
                            </div>
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '9.5px', fontWeight: 800, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                              Hostel Drop
                            </div>
                            <div style={{ fontSize: '13px', fontWeight: 800, color: '#FD6931', marginTop: '1px' }}>
                              {order.hostelBlock.split(' ')[0]} • Rm {order.roomNumber}
                            </div>
                          </div>
                        </div>

                        {/* Items Checklist */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <div style={{ fontSize: '9.5px', fontWeight: 800, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            Items To Cook
                          </div>
                          {order.items.map((it) => (
                            <div
                              key={it.id}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                fontSize: '13px',
                                padding: '4px 0',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div
                                  style={{
                                    width: '14px',
                                    height: '14px',
                                    borderRadius: '3px',
                                    border: `1.5px solid ${it.isVeg ? '#10B981' : '#EF4444'}`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                >
                                  <div
                                    style={{
                                      width: '6px',
                                      height: '6px',
                                      borderRadius: '50%',
                                      backgroundColor: it.isVeg ? '#10B981' : '#EF4444',
                                    }}
                                  />
                                </div>
                                <span style={{ fontWeight: 800, color: '#FFFFFF' }}>{it.quantity}x</span>
                                <span style={{ color: '#E5E7EB', fontWeight: 600 }}>{it.name}</span>
                              </div>
                              <span style={{ fontFamily: 'monospace', color: '#9CA3AF', fontWeight: 700 }}>
                                {formatRupees(it.priceEach * it.quantity)}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Action Buttons (Extra Rounded Pills) */}
                        <div style={{ paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                          {isIncoming && (
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                type="button"
                                onClick={() => rejectOrder(order.id)}
                                style={{
                                  padding: '11px 18px',
                                  borderRadius: '9999px',
                                  background: 'rgba(255, 255, 255, 0.08)',
                                  border: '1px solid rgba(255, 255, 255, 0.12)',
                                  color: '#FFFFFF',
                                  fontWeight: 700,
                                  fontSize: '13px',
                                  cursor: 'pointer',
                                }}
                                className="active:scale-95"
                              >
                                Reject
                              </button>
                              <button
                                type="button"
                                onClick={() => acceptOrder(order.id)}
                                style={{
                                  flex: 1,
                                  padding: '11px 20px',
                                  borderRadius: '9999px',
                                  background: 'linear-gradient(135deg, #FD6931 0%, #F85013 100%)',
                                  color: '#FFFFFF',
                                  fontWeight: 800,
                                  fontSize: '13px',
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
                                <CookingPot size={16} />
                                <span>Accept & Cook</span>
                              </button>
                            </div>
                          )}

                          {isCooking && (
                            <button
                              type="button"
                              onClick={() => markOrderReady(order.id)}
                              style={{
                                width: '100%',
                                padding: '12px 20px',
                                borderRadius: '9999px',
                                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                                color: '#FFFFFF',
                                fontWeight: 800,
                                fontSize: '13.5px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                border: 'none',
                                boxShadow: '0 4px 16px rgba(16, 185, 129, 0.35)',
                                cursor: 'pointer',
                              }}
                              className="active:scale-95"
                            >
                              <PackageCheck size={18} />
                              <span>Mark Ready for Pickup</span>
                            </button>
                          )}

                          {isReady && (
                            <div
                              style={{
                                width: '100%',
                                padding: '11px',
                                borderRadius: '9999px',
                                background: 'rgba(99, 102, 241, 0.15)',
                                border: '1px solid rgba(99, 102, 241, 0.3)',
                                color: '#A5B4FC',
                                fontSize: '13px',
                                fontWeight: 700,
                                textAlign: 'center',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                              }}
                            >
                              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#818CF8' }} className="animate-pulse" />
                              <span>Waiting for Runner Pickup</span>
                            </div>
                          )}

                          {order.status === OrderStatus.OUT_FOR_DELIVERY && (
                            <div
                              style={{
                                width: '100%',
                                padding: '11px',
                                borderRadius: '9999px',
                                background: 'rgba(0, 0, 0, 0.4)',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                color: '#D1D5DB',
                                fontSize: '13px',
                                textAlign: 'center',
                              }}
                            >
                              Out with runner <strong style={{ color: '#FFFFFF' }}>{order.runnerName}</strong>
                            </div>
                          )}

                          {order.status === OrderStatus.DELIVERED && (
                            <div
                              style={{
                                width: '100%',
                                padding: '10px',
                                color: '#34D399',
                                fontSize: '13px',
                                fontWeight: 800,
                                textAlign: 'center',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                              }}
                            >
                              <CheckCircle2 size={16} />
                              <span>Delivered successfully</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                {/* Pagination Controls */}
                {filteredQueue.length > QUEUE_PAGE_SIZE && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setQueuePage((p) => Math.max(0, p - 1))}
                      disabled={queuePage === 0}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '9999px',
                        fontWeight: 700,
                        fontSize: '12px',
                        background: queuePage === 0 ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.1)',
                        color: queuePage === 0 ? '#4B5563' : '#FFFFFF',
                        border: 'none',
                        cursor: queuePage === 0 ? 'not-allowed' : 'pointer',
                      }}
                    >
                      Prev
                    </button>
                    <div style={{ fontSize: '11px', fontFamily: 'monospace', color: '#9CA3AF' }}>
                      Page {queuePage + 1} / {Math.ceil(filteredQueue.length / QUEUE_PAGE_SIZE)}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setQueuePage((p) => Math.min(Math.ceil(filteredQueue.length / QUEUE_PAGE_SIZE) - 1, p + 1))
                      }
                      disabled={queuePage >= Math.ceil(filteredQueue.length / QUEUE_PAGE_SIZE) - 1}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '9999px',
                        fontWeight: 700,
                        fontSize: '12px',
                        background:
                          queuePage >= Math.ceil(filteredQueue.length / QUEUE_PAGE_SIZE) - 1
                            ? 'rgba(255, 255, 255, 0.04)'
                            : '#FD6931',
                        color:
                          queuePage >= Math.ceil(filteredQueue.length / QUEUE_PAGE_SIZE) - 1 ? '#4B5563' : '#FFFFFF',
                        border: 'none',
                        cursor:
                          queuePage >= Math.ceil(filteredQueue.length / QUEUE_PAGE_SIZE) - 1
                            ? 'not-allowed'
                            : 'pointer',
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

        {/* TAB 2: MENU STOCK MANAGEMENT */}
        {activeTab === 'menu' && (
          <div className="page-transition">
            {/* Header info banner */}
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(253, 105, 49, 0.16) 0%, rgba(26, 26, 26, 0.8) 100%)',
                border: '1px solid rgba(253, 105, 49, 0.3)',
                borderRadius: '26px',
                padding: '16px',
                marginBottom: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#FFFFFF', marginBottom: '2px' }}>
                  Live Stock POS
                </h2>
                <p style={{ fontSize: '12px', color: '#9CA3AF' }}>
                  Items toggled off instantly disappear from student app.
                </p>
              </div>
              <div
                style={{
                  background: 'rgba(0, 0, 0, 0.4)',
                  padding: '6px 12px',
                  borderRadius: '9999px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  fontSize: '12px',
                  fontWeight: 800,
                  color: '#FD6931',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <ChefHat size={14} />
                <span>{activeVendor.menuItems.length} Items</span>
              </div>
            </div>

            {/* Search Input Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: 'rgba(26, 26, 26, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '9999px',
                padding: '8px 14px',
                gap: '8px',
                marginBottom: '14px',
              }}
            >
              <Search size={16} color="#9CA3AF" />
              <input
                type="text"
                placeholder="Search dish or category..."
                value={menuSearch}
                onChange={(e) => {
                  setMenuSearch(e.target.value);
                  setMenuPage(0);
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  width: '100%',
                  outline: 'none',
                }}
              />
            </div>

            {/* Menu Items Grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {filteredMenuItems
                .slice(menuPage * MENU_PAGE_SIZE, (menuPage + 1) * MENU_PAGE_SIZE)
                .map((item) => (
                  <div
                    key={item.id}
                    style={{
                      background: 'rgba(26, 26, 26, 0.72)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '24px',
                      padding: '12px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                    }}
                  >
                    {/* Item Thumbnail */}
                    <div
                      style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '18px',
                        overflow: 'hidden',
                        position: 'relative',
                        background: '#18181D',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        flexShrink: 0,
                      }}
                    >
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            opacity: item.isAvailable ? 1 : 0.35,
                            filter: item.isAvailable ? 'none' : 'grayscale(1)',
                            transition: 'all 0.3s ease',
                          }}
                        />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}>
                          <ChefHat size={24} />
                        </div>
                      )}
                      {/* Veg indicator badge */}
                      <div
                        style={{
                          position: 'absolute',
                          bottom: '4px',
                          right: '4px',
                          width: '12px',
                          height: '12px',
                          borderRadius: '2px',
                          background: 'rgba(0, 0, 0, 0.75)',
                          border: `1.5px solid ${item.isVeg ? '#10B981' : '#EF4444'}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <div
                          style={{
                            width: '4px',
                            height: '4px',
                            borderRadius: '50%',
                            backgroundColor: item.isVeg ? '#10B981' : '#EF4444',
                          }}
                        />
                      </div>
                    </div>

                    {/* Item Details */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3
                        style={{
                          fontSize: '14px',
                          fontWeight: 800,
                          color: item.isAvailable ? '#FFFFFF' : '#6B7280',
                          textDecoration: item.isAvailable ? 'none' : 'line-through',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {item.name}
                      </h3>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#FD6931', marginTop: '2px' }}>
                        {formatRupees(item.price)}
                      </div>
                      <div
                        style={{
                          display: 'inline-block',
                          fontSize: '10px',
                          fontWeight: 700,
                          textTransform: 'capitalize',
                          color: '#9CA3AF',
                          background: 'rgba(255, 255, 255, 0.06)',
                          padding: '2px 8px',
                          borderRadius: '9999px',
                          marginTop: '3px',
                        }}
                      >
                        {item.category}
                      </div>
                    </div>

                    {/* Stock Switch Button */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
                      <button
                        type="button"
                        onClick={() => toggleMenuItemStock(activeVendor.id, item.id)}
                        style={{
                          position: 'relative',
                          width: '48px',
                          height: '28px',
                          borderRadius: '9999px',
                          background: item.isAvailable ? '#10B981' : '#374151',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'background-color 0.3s ease',
                          boxShadow: item.isAvailable ? '0 0 12px rgba(16, 185, 129, 0.5)' : 'none',
                        }}
                        className="active:scale-95"
                      >
                        <div
                          style={{
                            position: 'absolute',
                            top: '3px',
                            left: item.isAvailable ? '23px' : '3px',
                            width: '22px',
                            height: '22px',
                            borderRadius: '50%',
                            backgroundColor: '#FFFFFF',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                            transition: 'left 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                          }}
                        />
                      </button>
                      <span
                        style={{
                          fontSize: '9.5px',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          color: item.isAvailable ? '#34D399' : '#6B7280',
                        }}
                      >
                        {item.isAvailable ? 'In Stock' : 'Sold Out'}
                      </span>
                    </div>
                  </div>
                ))}
            </div>

            {/* Menu Pagination */}
            {filteredMenuItems.length > MENU_PAGE_SIZE && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setMenuPage((p) => Math.max(0, p - 1))}
                  disabled={menuPage === 0}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '9999px',
                    fontWeight: 700,
                    fontSize: '12px',
                    background: menuPage === 0 ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.1)',
                    color: menuPage === 0 ? '#4B5563' : '#FFFFFF',
                    border: 'none',
                    cursor: menuPage === 0 ? 'not-allowed' : 'pointer',
                  }}
                >
                  Prev
                </button>
                <div style={{ fontSize: '11px', fontFamily: 'monospace', color: '#9CA3AF' }}>
                  Page {menuPage + 1} / {Math.ceil(filteredMenuItems.length / MENU_PAGE_SIZE)}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setMenuPage((p) => Math.min(Math.ceil(filteredMenuItems.length / MENU_PAGE_SIZE) - 1, p + 1))
                  }
                  disabled={menuPage >= Math.ceil(filteredMenuItems.length / MENU_PAGE_SIZE) - 1}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '9999px',
                    fontWeight: 700,
                    fontSize: '12px',
                    background:
                      menuPage >= Math.ceil(filteredMenuItems.length / MENU_PAGE_SIZE) - 1
                        ? 'rgba(255, 255, 255, 0.04)'
                        : '#FD6931',
                    color:
                      menuPage >= Math.ceil(filteredMenuItems.length / MENU_PAGE_SIZE) - 1 ? '#4B5563' : '#FFFFFF',
                    border: 'none',
                    cursor:
                      menuPage >= Math.ceil(filteredMenuItems.length / MENU_PAGE_SIZE) - 1 ? 'not-allowed' : 'pointer',
                  }}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: DAILY SETTLEMENT LEDGER */}
        {activeTab === 'settlement' && (
          <div className="page-transition">
            {/* Top Settlement Summary Card */}
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
                  Today's Net Payout
                </div>
                <div style={{ fontSize: '26px', fontWeight: 900, color: '#34D399', lineHeight: 1.1, marginTop: '2px' }}>
                  {formatRupees(netEarnings)}
                </div>
                <div style={{ fontSize: '11.5px', color: '#9CA3AF', marginTop: '4px' }}>
                  Settled automatically via UPI
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '11px', color: '#9CA3AF' }}>Gross: <strong style={{ color: '#FFFFFF' }}>₹{grossSales}</strong></div>
                <div style={{ fontSize: '11px', color: '#FD6931', marginTop: '2px' }}>Fee: <strong>-₹{commissionOwed}</strong></div>
              </div>
            </div>

            {/* Ledger Records Table Card */}
            <div
              style={{
                background: 'rgba(26, 26, 26, 0.72)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '26px',
                padding: '16px',
                overflow: 'hidden',
              }}
            >
              <h3 style={{ fontSize: '14.5px', fontWeight: 800, color: '#FFFFFF', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ReceiptText size={16} color="#34D399" />
                <span>Orders Settlement Log</span>
              </h3>

              <div style={{ overflowX: 'auto' }} className="hide-scrollbar">
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12.5px' }}>
                  <thead>
                    <tr style={{ color: '#6B7280', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                      <th style={{ padding: '8px 4px', fontWeight: 800 }}>Order</th>
                      <th style={{ padding: '8px 4px', fontWeight: 800 }}>Customer</th>
                      <th style={{ padding: '8px 4px', fontWeight: 800, textAlign: 'right' }}>Gross</th>
                      <th style={{ padding: '8px 4px', fontWeight: 800, textAlign: 'right', color: '#F97316' }}>Fee</th>
                      <th style={{ padding: '8px 4px', fontWeight: 800, textAlign: 'right', color: '#34D399' }}>Net</th>
                    </tr>
                  </thead>
                  <tbody>
                    {todayOrders
                      .slice(ledgerPage * LEDGER_PAGE_SIZE, (ledgerPage + 1) * LEDGER_PAGE_SIZE)
                      .map((ord) => {
                        const comm = calculateCommission(ord.subtotalAmount, activeVendor.commissionPct);
                        const net = ord.subtotalAmount - comm;
                        return (
                          <tr key={ord.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                            <td style={{ padding: '10px 4px' }}>
                              <div style={{ fontFamily: 'monospace', fontWeight: 800, color: '#FFFFFF' }}>{ord.id}</div>
                              <div style={{ fontSize: '10px', color: '#6B7280' }}>
                                {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </td>
                            <td style={{ padding: '10px 4px' }}>
                              <div style={{ fontWeight: 700, color: '#E5E7EB' }}>{ord.studentName}</div>
                              <div style={{ fontSize: '10px', color: '#9CA3AF' }}>{ord.hostelBlock.split(' ')[0]}</div>
                            </td>
                            <td style={{ padding: '10px 4px', textAlign: 'right', color: '#E5E7EB', fontWeight: 700 }}>
                              {formatRupees(ord.subtotalAmount)}
                            </td>
                            <td style={{ padding: '10px 4px', textAlign: 'right', color: '#FD6931', fontWeight: 700 }}>
                              -{formatRupees(comm)}
                            </td>
                            <td style={{ padding: '10px 4px', textAlign: 'right', color: '#34D399', fontWeight: 800 }}>
                              {formatRupees(net)}
                            </td>
                          </tr>
                        );
                      })}
                    {todayOrders.length === 0 && (
                      <tr>
                        <td colSpan={5} style={{ padding: '32px 0', textAlign: 'center', color: '#6B7280', fontSize: '13px' }}>
                          No completed orders today yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Ledger Pagination */}
              {todayOrders.length > LEDGER_PAGE_SIZE && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setLedgerPage((p) => Math.max(0, p - 1))}
                    disabled={ledgerPage === 0}
                    style={{
                      padding: '7px 14px',
                      borderRadius: '9999px',
                      fontWeight: 700,
                      fontSize: '11.5px',
                      background: ledgerPage === 0 ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.1)',
                      color: ledgerPage === 0 ? '#4B5563' : '#FFFFFF',
                      border: 'none',
                      cursor: ledgerPage === 0 ? 'not-allowed' : 'pointer',
                    }}
                  >
                    Prev
                  </button>
                  <div style={{ fontSize: '10.5px', fontFamily: 'monospace', color: '#9CA3AF' }}>
                    Page {ledgerPage + 1} / {Math.ceil(todayOrders.length / LEDGER_PAGE_SIZE)}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setLedgerPage((p) => Math.min(Math.ceil(todayOrders.length / LEDGER_PAGE_SIZE) - 1, p + 1))
                    }
                    disabled={ledgerPage >= Math.ceil(todayOrders.length / LEDGER_PAGE_SIZE) - 1}
                    style={{
                      padding: '7px 14px',
                      borderRadius: '9999px',
                      fontWeight: 700,
                      fontSize: '11.5px',
                      background:
                        ledgerPage >= Math.ceil(todayOrders.length / LEDGER_PAGE_SIZE) - 1
                          ? 'rgba(255, 255, 255, 0.04)'
                          : '#10B981',
                      color:
                        ledgerPage >= Math.ceil(todayOrders.length / LEDGER_PAGE_SIZE) - 1 ? '#4B5563' : '#FFFFFF',
                      border: 'none',
                      cursor:
                        ledgerPage >= Math.ceil(todayOrders.length / LEDGER_PAGE_SIZE) - 1 ? 'not-allowed' : 'pointer',
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
          onClick={() => setActiveTab('queue')}
          className={`dock-tab ${activeTab === 'queue' ? 'active' : ''}`}
        >
          <CookingPot size={20} />
          <span className="dock-tab-label">Queue</span>
          {filteredQueue.length > 0 && (
            <span className="dock-badge-count">{filteredQueue.length}</span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('menu')}
          className={`dock-tab ${activeTab === 'menu' ? 'active' : ''}`}
        >
          <ChefHat size={20} />
          <span className="dock-tab-label">Menu Stock</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('settlement')}
          className={`dock-tab ${activeTab === 'settlement' ? 'active' : ''}`}
        >
          <ReceiptText size={20} />
          <span className="dock-tab-label">Ledger</span>
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
    </div>
  );
};
