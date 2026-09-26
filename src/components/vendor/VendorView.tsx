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
  MapPin,
  ToggleLeft,
  ToggleRight,
  ChefHat,
  ReceiptText,
  ChevronDown,
  Star,
  CheckCircle2,
  Flame,
  LogOut,
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

  return (
    <div className="w-full h-full bg-black text-white flex flex-col relative overflow-hidden pb-4">
      {/* Dynamic Header with Cover Image */}
      <div className="relative h-48 md:h-64 w-full bg-neutral-900 shrink-0">
        {activeVendor.coverImage ? (
          <img
            src={activeVendor.coverImage}
            alt={activeVendor.name}
            className="w-full h-full object-cover opacity-60"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-orange-900 to-black opacity-80" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        
        {/* Top Right Controls (Stall Switcher & Logout) */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
          <div className="relative group">
            <select
              value={activeVendorId}
              onChange={(e) => setActiveVendorId(e.target.value)}
              className="appearance-none bg-black/50 backdrop-blur-md border border-white/10 text-white text-sm rounded-full pl-4 pr-10 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer transition-all"
            >
              {vendors.map((v) => (
                <option key={v.id} value={v.id} className="bg-neutral-900 text-white">
                  {v.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/70 pointer-events-none" />
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 font-bold text-xs transition-all backdrop-blur-md active:scale-95 shadow-sm"
            title="Log out of Vendor Kitchen"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>
        </div>

        {/* Vendor Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <div className="bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                  Kitchen Live
                </div>
                {activeVendor.rating && (
                  <div className="bg-black/50 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Star className="w-3 h-3 text-orange-400 fill-orange-400" />
                    {activeVendor.rating.toFixed(1)}
                  </div>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-1">
                {activeVendor.name}
              </h1>
              <div className="flex items-center gap-3 text-sm text-neutral-300 font-medium">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-orange-500" />
                  {activeVendor.location}
                </span>
                <span className="text-neutral-600">•</span>
                <span className="text-neutral-400 text-xs">FSSAI: {activeVendor.fssaiNumber || '20822003001421'}</span>
              </div>
            </div>
            
            <div className="hidden sm:block text-right">
              <div className="text-xs text-neutral-400 font-medium">Platform Fee</div>
              <div className="text-lg font-bold text-white bg-black/40 backdrop-blur-md border border-white/10 px-3 py-1 rounded-xl mt-1">
                {activeVendor.commissionPct}%
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-4 relative z-10 flex-1 flex flex-col min-h-0 space-y-4 w-full">
        
        {/* Glassmorphic KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <div className="bg-neutral-900/80 backdrop-blur-xl border border-white/5 rounded-2xl p-4 shadow-xl">
            <div className="text-[11px] text-neutral-400 font-medium uppercase tracking-wider mb-1">Orders Today</div>
            <div className="text-2xl font-black text-white">{todayOrders.length}</div>
          </div>
          <div className="bg-neutral-900/80 backdrop-blur-xl border border-white/5 rounded-2xl p-4 shadow-xl">
            <div className="text-[11px] text-neutral-400 font-medium uppercase tracking-wider mb-1">Gross Sales</div>
            <div className="text-2xl font-black text-white">{formatRupees(grossSales)}</div>
          </div>
          <div className="bg-neutral-900/80 backdrop-blur-xl border border-white/5 rounded-2xl p-4 shadow-xl">
            <div className="text-[11px] text-neutral-400 font-medium uppercase tracking-wider mb-1">Commission</div>
            <div className="text-2xl font-black text-orange-400">-{formatRupees(commissionOwed)}</div>
          </div>
          <div className="bg-neutral-900/80 backdrop-blur-xl border border-white/5 rounded-2xl p-4 shadow-xl relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl"></div>
            <div className="text-[11px] text-neutral-400 font-medium uppercase tracking-wider mb-1">Net Earnings</div>
            <div className="text-2xl font-black text-emerald-400">{formatRupees(netEarnings)}</div>
          </div>
        </div>

        {/* Floating Segment Control */}
        <div className="bg-neutral-900/60 backdrop-blur-xl border border-white/5 p-1.5 rounded-full flex overflow-x-auto hide-scrollbar sticky top-4 z-20 shadow-2xl">
          <button
            onClick={() => setActiveTab('queue')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'queue'
                ? 'bg-white text-black shadow-lg scale-[0.98]'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <CookingPot className="w-4 h-4" />
            Kitchen Queue ({filteredQueue.length})
          </button>
          <button
            onClick={() => setActiveTab('menu')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'menu'
                ? 'bg-white text-black shadow-lg scale-[0.98]'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <ChefHat className="w-4 h-4" />
            Menu Stock
          </button>
          <button
            onClick={() => setActiveTab('settlement')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'settlement'
                ? 'bg-white text-black shadow-lg scale-[0.98]'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <ReceiptText className="w-4 h-4" />
            Ledger
          </button>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 min-h-0 flex flex-col pt-1">
          
          {/* TAB 1: KITCHEN ORDER QUEUE */}
          {activeTab === 'queue' && (
            <div className="flex-1 flex flex-col min-h-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Filter Pills */}
              <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
                {[
                  { id: 'active', label: 'Action Needed', icon: Flame },
                  { id: 'ready', label: 'Ready/Waiting', icon: PackageCheck },
                  { id: 'completed', label: 'Completed', icon: CheckCircle2 },
                  { id: 'all', label: 'All Orders', icon: Store },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setQueueFilter(f.id as any)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                      queueFilter === f.id
                        ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30 shadow-[0_0_15px_rgba(249,115,22,0.15)]'
                        : 'bg-neutral-900 text-neutral-400 hover:text-white border border-white/5 hover:bg-neutral-800'
                    }`}
                  >
                    <f.icon className="w-3.5 h-3.5" />
                    {f.label}
                  </button>
                ))}
              </div>

              {filteredQueue.length === 0 ? (
                <div className="bg-neutral-900/40 backdrop-blur-sm border border-white/5 rounded-3xl p-12 text-center flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center mb-4 text-neutral-500">
                    <CookingPot className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Queue is Clear</h3>
                  <p className="text-sm text-neutral-400 max-w-sm">No orders matching this filter right now. You're all caught up!</p>
                </div>
              ) : (
                <div className="flex-1 min-h-0 flex flex-col">
                  <div className="flex-1 overflow-y-auto no-scrollbar space-y-4">
                  {filteredQueue.slice(queuePage * 2, (queuePage + 1) * 2).map((order) => {
                    const isIncoming = order.status === OrderStatus.PLACED;
                    const isCooking = order.status === OrderStatus.ACCEPTED || order.status === OrderStatus.PREPARING;
                    const isReady = order.status === OrderStatus.READY;
                    
                    return (
                      <div
                        key={order.id}
                        className={`bg-neutral-900/60 backdrop-blur-xl rounded-3xl p-5 border transition-all flex flex-col justify-between ${
                          isIncoming
                            ? 'border-orange-500/50 shadow-[0_0_20px_rgba(249,115,22,0.1)]'
                            : isCooking
                            ? 'border-indigo-500/30'
                            : 'border-white/5 hover:border-white/10'
                        }`}
                      >
                        <div>
                          {/* Order Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <div className="flex items-center gap-2 mb-1.5">
                                <span className="font-mono text-lg font-black text-white">{order.id}</span>
                                <OrderStatusBadge status={order.status} size="sm" />
                              </div>
                              <div className="text-xs text-neutral-400 flex items-center gap-2 font-medium">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                                <span>•</span>
                                <SlotBadge slot={order.slot} size="sm" />
                              </div>
                            </div>
                            <div className="text-xl font-black text-white">
                              {formatRupees(order.subtotalAmount)}
                            </div>
                          </div>

                          {/* Customer Info Card */}
                          <div className="bg-black/40 rounded-2xl p-3 mb-4 flex items-center justify-between border border-white/5">
                            <div>
                              <div className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider mb-0.5">Customer</div>
                              <div className="text-sm font-bold text-white">{order.studentName}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider mb-0.5">Location</div>
                              <div className="text-sm font-medium text-orange-400">
                                {order.hostelBlock.split(' ')[0]} • {order.roomNumber}
                              </div>
                            </div>
                          </div>

                          {/* Items List */}
                          <div className="space-y-2 mb-6">
                            <div className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Order Items</div>
                            {order.items.map((it) => (
                              <div key={it.id} className="flex items-start justify-between gap-3 text-sm">
                                <div className="flex items-start gap-2">
                                  <div className={`mt-1 flex-shrink-0 w-3 h-3 rounded-sm border flex items-center justify-center ${it.isVeg ? 'border-emerald-500' : 'border-rose-500'}`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${it.isVeg ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                  </div>
                                  <div>
                                    <span className="font-bold text-white mr-2">{it.quantity}x</span>
                                    <span className="text-neutral-300 font-medium">{it.name}</span>
                                  </div>
                                </div>
                                <span className="text-neutral-400 font-mono whitespace-nowrap">
                                  {formatRupees(it.priceEach * it.quantity)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-auto pt-4 border-t border-white/5">
                          {isIncoming && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => rejectOrder(order.id)}
                                className="px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold text-sm border border-white/10 transition-colors"
                              >
                                Reject
                              </button>
                              <button
                                onClick={() => acceptOrder(order.id)}
                                className="flex-1 py-3 px-4 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-900/20 transition-all active:scale-[0.98]"
                              >
                                <CookingPot className="w-4 h-4" />
                                Accept & Cook
                              </button>
                            </div>
                          )}

                          {isCooking && (
                            <button
                              onClick={() => markOrderReady(order.id)}
                              className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 transition-all active:scale-[0.98]"
                            >
                              <PackageCheck className="w-5 h-5" />
                              Mark as Ready
                            </button>
                          )}

                          {isReady && (
                            <div className="w-full py-3 px-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium text-center flex items-center justify-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
                              Waiting for Runner
                            </div>
                          )}

                          {order.status === OrderStatus.OUT_FOR_DELIVERY && (
                            <div className="w-full py-3 px-4 rounded-2xl bg-black/40 border border-white/5 text-neutral-300 text-sm text-center">
                              Out with runner <strong className="text-white">{order.runnerName}</strong>
                            </div>
                          )}

                          {order.status === OrderStatus.DELIVERED && (
                            <div className="w-full py-3 text-center text-sm text-emerald-400 font-bold flex items-center justify-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4" />
                              Delivered successfully
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  </div>
                  
                  {/* Pagination Controls */}
                  {filteredQueue.length > 2 && (
                    <div className="flex items-center justify-between pt-3 mt-auto">
                      <button
                        onClick={() => setQueuePage(p => Math.max(0, p - 1))}
                        disabled={queuePage === 0}
                        className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 ${queuePage === 0 ? 'opacity-30 cursor-not-allowed text-neutral-500' : 'bg-white/10 text-white hover:bg-white/20'}`}
                      >
                        Prev
                      </button>
                      <div className="text-[10px] font-mono text-neutral-400">
                        Page {queuePage + 1} / {Math.ceil(filteredQueue.length / 2)}
                      </div>
                      <button
                        onClick={() => setQueuePage(p => Math.min(Math.ceil(filteredQueue.length / 2) - 1, p + 1))}
                        disabled={queuePage >= Math.ceil(filteredQueue.length / 2) - 1}
                        className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 ${queuePage >= Math.ceil(filteredQueue.length / 2) - 1 ? 'opacity-30 cursor-not-allowed text-neutral-500' : 'bg-orange-500 text-white hover:bg-orange-400'}`}
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
            <div className="flex-1 min-h-0 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-gradient-to-r from-orange-900/20 to-transparent border border-orange-500/20 rounded-3xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-black text-white mb-1">Live Menu Management</h2>
                  <p className="text-sm text-neutral-400">Toggle items to instantly hide them from the student app when you run out of stock.</p>
                </div>
                <div className="bg-black/50 px-4 py-2 rounded-2xl border border-white/5 text-sm font-bold text-white flex items-center gap-2">
                  <ChefHat className="w-4 h-4 text-orange-400" />
                  {activeVendor.menuItems.length} Items Configured
                </div>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar mt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeVendor.menuItems.slice(menuPage * 4, (menuPage + 1) * 4).map((item) => (
                  <div key={item.id} className="bg-neutral-900/60 backdrop-blur-md border border-white/5 rounded-3xl p-4 flex items-center gap-4 transition-all hover:bg-neutral-800/60 hover:border-white/10">
                    
                    {/* Item Image */}
                    <div className="w-20 h-20 rounded-2xl bg-neutral-800 overflow-hidden flex-shrink-0 relative border border-white/10">
                      {item.image ? (
                         <img src={item.image} alt={item.name} className={`w-full h-full object-cover transition-opacity ${!item.isAvailable && 'opacity-30 grayscale'}`} />
                      ) : (
                         <div className="w-full h-full flex items-center justify-center text-neutral-600"><ChefHat className="w-8 h-8" /></div>
                      )}
                      <div className={`absolute bottom-1 right-1 w-3.5 h-3.5 rounded-sm border bg-black/50 backdrop-blur-sm flex items-center justify-center ${item.isVeg ? 'border-emerald-500' : 'border-rose-500'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${item.isVeg ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className={`text-base font-bold truncate ${item.isAvailable ? 'text-white' : 'text-neutral-500 line-through'}`}>{item.name}</h3>
                      <div className="text-sm font-medium text-orange-400 mb-1">{formatRupees(item.price)}</div>
                      <div className="text-xs text-neutral-400 capitalize bg-white/5 inline-block px-2 py-0.5 rounded-md">{item.category}</div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <button
                        onClick={() => toggleMenuItemStock(activeVendor.id, item.id)}
                        className="relative"
                      >
                        <div className={`w-12 h-7 rounded-full transition-colors duration-300 ease-in-out ${item.isAvailable ? 'bg-emerald-500' : 'bg-neutral-700'}`}>
                          <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform duration-300 ease-in-out shadow-sm ${item.isAvailable ? 'left-6' : 'left-1'}`} />
                        </div>
                      </button>
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${item.isAvailable ? 'text-emerald-400' : 'text-neutral-500'}`}>
                        {item.isAvailable ? 'In Stock' : 'Sold Out'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              </div>

              {/* Menu Pagination */}
              {activeVendor.menuItems.length > 4 && (
                <div className="flex items-center justify-between pt-3 mt-auto">
                  <button
                    onClick={() => setMenuPage(p => Math.max(0, p - 1))}
                    disabled={menuPage === 0}
                    className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 ${menuPage === 0 ? 'opacity-30 cursor-not-allowed text-neutral-500' : 'bg-white/10 text-white hover:bg-white/20'}`}
                  >
                    Prev
                  </button>
                  <div className="text-[10px] font-mono text-neutral-400">
                    Page {menuPage + 1} / {Math.ceil(activeVendor.menuItems.length / 4)}
                  </div>
                  <button
                    onClick={() => setMenuPage(p => Math.min(Math.ceil(activeVendor.menuItems.length / 4) - 1, p + 1))}
                    disabled={menuPage >= Math.ceil(activeVendor.menuItems.length / 4) - 1}
                    className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 ${menuPage >= Math.ceil(activeVendor.menuItems.length / 4) - 1 ? 'opacity-30 cursor-not-allowed text-neutral-500' : 'bg-orange-500 text-white hover:bg-orange-400'}`}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: DAILY SETTLEMENT LEDGER */}
          {activeTab === 'settlement' && (
            <div className="flex-1 min-h-0 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex-1 min-h-0 flex flex-col bg-neutral-900/80 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-2xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 pb-6 border-b border-white/10 relative z-10">
                  <div>
                    <h2 className="text-xl font-black text-white mb-1 flex items-center gap-2">
                      <ReceiptText className="w-5 h-5 text-emerald-400" />
                      Daily Settlement Sheet
                    </h2>
                    <p className="text-sm text-neutral-400">All completed orders for today. Automatically settled to linked VPA.</p>
                  </div>
                  <div className="bg-emerald-500/10 border border-emerald-500/20 px-5 py-3 rounded-2xl text-right">
                    <div className="text-xs text-emerald-500/70 font-bold uppercase tracking-wider mb-0.5">Net Payable</div>
                    <div className="text-2xl font-black text-emerald-400 leading-none">{formatRupees(netEarnings)}</div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar mt-2 -mx-6 px-6 sm:mx-0 sm:px-0">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-neutral-500 text-xs uppercase tracking-wider font-bold border-b border-white/5">
                        <th className="py-4 px-2 font-medium">Order details</th>
                        <th className="py-4 px-2 font-medium">Customer</th>
                        <th className="py-4 px-2 font-medium text-right">Gross</th>
                        <th className="py-4 px-2 font-medium text-right text-orange-400/70">Comm ({activeVendor.commissionPct}%)</th>
                        <th className="py-4 px-2 font-medium text-right text-emerald-400/70">Net</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {todayOrders.slice(ledgerPage * 4, (ledgerPage + 1) * 4).map((ord) => {
                        const comm = calculateCommission(ord.subtotalAmount, activeVendor.commissionPct);
                        const net = ord.subtotalAmount - comm;
                        return (
                          <tr key={ord.id} className="hover:bg-white/[0.02] transition-colors group">
                            <td className="py-4 px-2">
                              <div className="font-mono text-sm font-bold text-white mb-0.5">{ord.id}</div>
                              <div className="text-xs text-neutral-500 font-medium">
                                {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </td>
                            <td className="py-4 px-2">
                              <div className="text-sm font-bold text-neutral-300">{ord.studentName}</div>
                              <div className="text-xs text-neutral-500">{ord.hostelBlock.split(' ')[0]}</div>
                            </td>
                            <td className="py-4 px-2 text-right text-sm font-medium text-neutral-300">
                              {formatRupees(ord.subtotalAmount)}
                            </td>
                            <td className="py-4 px-2 text-right text-sm font-medium text-orange-400">
                              -{formatRupees(comm)}
                            </td>
                            <td className="py-4 px-2 text-right text-sm font-bold text-emerald-400">
                              {formatRupees(net)}
                            </td>
                          </tr>
                        );
                      })}
                      {todayOrders.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-12 text-center text-sm text-neutral-500">
                            No completed orders today yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Ledger Pagination */}
                {todayOrders.length > 4 && (
                  <div className="flex items-center justify-between pt-4 mt-auto border-t border-white/10 z-10 relative">
                    <button
                      onClick={() => setLedgerPage(p => Math.max(0, p - 1))}
                      disabled={ledgerPage === 0}
                      className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 ${ledgerPage === 0 ? 'opacity-30 cursor-not-allowed text-neutral-500' : 'bg-white/10 text-white hover:bg-white/20'}`}
                    >
                      Prev
                    </button>
                    <div className="text-[10px] font-mono text-neutral-400">
                      Page {ledgerPage + 1} / {Math.ceil(todayOrders.length / 4)}
                    </div>
                    <button
                      onClick={() => setLedgerPage(p => Math.min(Math.ceil(todayOrders.length / 4) - 1, p + 1))}
                      disabled={ledgerPage >= Math.ceil(todayOrders.length / 4) - 1}
                      className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 ${ledgerPage >= Math.ceil(todayOrders.length / 4) - 1 ? 'opacity-30 cursor-not-allowed text-neutral-500' : 'bg-emerald-500 text-white hover:bg-emerald-400'}`}
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
