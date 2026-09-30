import React, { useState } from 'react';
import { useAppStore } from '../../store';
import { Role, OrderStatus, SlotWindow, MenuItem } from '../../types';
import { formatRupees } from '../../business-logic';
import { OrderStatusBadge } from '../common/OrderStatusBadge';
import { SlotBadge } from '../common/SlotBadge';
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
    name: '', location: '', ownerPhone: '', commissionPct: 10, cuisineTag: '', prepTimeMinutes: 15,
    itemName1: '', itemPrice1: 60, itemIsVeg1: true,
  });

  const studentRunners = users.filter((u) => u.role === Role.RUNNER);

  const dispatchableOrders = orders.filter(
    (o) => (o.status === OrderStatus.PLACED || o.status === OrderStatus.ACCEPTED || o.status === OrderStatus.PREPARING || o.status === OrderStatus.READY) && !o.runnerId
  );

  const filteredDispatchOrders = dispatchableOrders.filter((o) => selectedHostelFilter === 'all' || o.hostelBlock.includes(selectedHostelFilter));

  const totalOrders = orders.length;
  const completedOrders = orders.filter((o) => o.status === OrderStatus.DELIVERED);
  const totalGrossRevenue = orders.reduce((sum, o) => sum + o.subtotalAmount, 0);
  const totalCommissionCollected = orders.reduce((sum, o) => sum + o.commissionAmt, 0);
  const totalRunnerPayouts = completedOrders.length * 18;
  const cancelledOrders = orders.filter((o) => o.status === OrderStatus.CANCELLED);
  const refundRate = totalOrders > 0 ? Math.round((cancelledOrders.length / totalOrders) * 100) : 0;

  const handleSelectAllOrders = () => {
    setSelectedOrderIds(selectedOrderIds.length === filteredDispatchOrders.length ? [] : filteredDispatchOrders.map((o) => o.id));
  };

  const handleToggleOrderSelection = (id: string) => {
    setSelectedOrderIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
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
        { id: '', vendorId: '', name: newVendorForm.itemName1 || 'Special Snack', price: Number(newVendorForm.itemPrice1) || 50, isVeg: newVendorForm.itemIsVeg1, isAvailable: true, category: 'snacks' },
      ];
      onboardVendor({
        name: newVendorForm.name, location: newVendorForm.location, ownerPhone: newVendorForm.ownerPhone || '9870000000',
        commissionPct: Number(newVendorForm.commissionPct) || 10, cuisineTag: newVendorForm.cuisineTag || 'Quick Bites',
        bannerColor: 'from-orange-500/20 to-amber-500/10', prepTimeMinutes: Number(newVendorForm.prepTimeMinutes) || 15,
        menuItems: initialItems,
      });
      setShowAddVendorModal(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', overflow: 'hidden', position: 'relative' }}>
      
      {/* ─── 1. COMPACT MODERN ADMIN HEADER ─── */}
      <header className="modern-header">
        <div className="modern-header-top">
          {/* Admin Identity Chip */}
          <div className="location-chip-btn">
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.2), rgba(225, 29, 72, 0.1))',
                border: '1px solid rgba(251, 113, 133, 0.4)',
                color: '#FB7185',
                fontSize: '10px',
                fontWeight: 800,
                padding: '2px 7px',
                borderRadius: '9999px',
                letterSpacing: '0.02em',
              }}
            >
              <Zap size={11} fill="#FB7185" color="#FB7185" />
              <span>COMMAND</span>
            </span>
            <span className="location-text">
              University Admin
            </span>
          </div>

          {/* Global Kill Switch Status & Logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              className="px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5"
              style={{
                backgroundColor: settings.globalOrderingPaused ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                border: `1px solid ${settings.globalOrderingPaused ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
                color: settings.globalOrderingPaused ? '#EF4444' : '#10B981',
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: settings.globalOrderingPaused ? '#EF4444' : '#10B981',
                }}
              />
              <span>{settings.globalOrderingPaused ? 'PAUSED' : 'ONLINE'}</span>
            </div>

            <button
              type="button"
              onClick={logout}
              className="w-9 h-9 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center hover:bg-rose-500/25 transition-all cursor-pointer"
              title="Log out of Admin Portal"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>

        {/* Compact 4-KPI Row */}
        <div className="grid grid-cols-4 gap-2 pt-1">
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-2 text-center">
            <div className="text-[9.5px] text-neutral-400 font-bold uppercase tracking-wider">Gross</div>
            <div className="text-sm font-black text-white">₹{totalGrossRevenue}</div>
          </div>
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-2 text-center">
            <div className="text-[9.5px] text-neutral-400 font-bold uppercase tracking-wider">Orders</div>
            <div className="text-sm font-black text-white">{totalOrders}</div>
          </div>
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-2 text-center">
            <div className="text-[9.5px] text-neutral-400 font-bold uppercase tracking-wider">Dispatch</div>
            <div className="text-sm font-black text-orange-400">{dispatchableOrders.length}</div>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-2 text-center">
            <div className="text-[9.5px] text-emerald-400 font-bold uppercase tracking-wider">Runners</div>
            <div className="text-sm font-black text-emerald-400">{studentRunners.length}</div>
          </div>
        </div>
      </header>

      {/* ─── 2. MAIN SCROLLABLE CONTENT ─── */}
      <div className="flex-1 overflow-y-auto hide-scrollbar px-4 pt-3" style={{ paddingBottom: '96px' }}>
          {/* TAB 1: EMERGENCY KILL-SWITCHES */}
          {activeTab === 'killswitch' && (
            <div className="flex-1 flex flex-col min-h-0 overflow-y-auto no-scrollbar space-y-6 animate-in fade-in slide-in-from-bottom-4">
              
              <div className="bg-gradient-to-br from-rose-950/40 to-neutral-900/60 backdrop-blur-xl border border-rose-900/50 rounded-3xl p-6 shadow-2xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h2 className="text-xl font-black text-white mb-2 flex items-center gap-2">
                      <Power className="w-5 h-5 text-rose-500" /> Master Kill-Switch
                    </h2>
                    <p className="text-sm text-rose-200/60 max-w-lg leading-relaxed">
                      Instantly pause all checkouts across the entire campus. Existing active orders will remain in progress, but no new orders can be placed.
                    </p>
                  </div>
                  <button
                    onClick={() => toggleGlobalKillSwitch(!settings.globalOrderingPaused)}
                    className={`shrink-0 px-6 py-4 rounded-2xl font-black text-sm flex items-center gap-2 transition-all shadow-xl active:scale-95 ${
                      settings.globalOrderingPaused
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/50'
                        : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/50'
                    }`}
                  >
                    {settings.globalOrderingPaused ? (
                      <><ToggleRight className="w-5 h-5" /> RESUME DELIVERIES</>
                    ) : (
                      <><ToggleLeft className="w-5 h-5" /> EMERGENCY PAUSE ALL</>
                    )}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-neutral-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl">
                  <h2 className="text-lg font-black text-white mb-4">Hostel Delivery Controls</h2>
                  <div className="space-y-3">
                    {hostels.map((h) => {
                      const isPaused = settings.pausedHostelBlocks.includes(h.name);
                      return (
                        <div key={h.id} className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${isPaused ? 'bg-rose-950/20 border-rose-800' : 'bg-black/40 border-white/5 hover:border-white/10'}`}>
                          <div>
                            <div className="font-bold text-white mb-0.5">{h.name}</div>
                            <div className={`text-xs font-bold uppercase tracking-wider ${isPaused ? 'text-rose-400' : 'text-emerald-400'}`}>
                              {isPaused ? 'Deliveries Paused' : 'Ordering Open'}
                            </div>
                          </div>
                          <button
                            onClick={() => toggleHostelKillSwitch(h.name, !isPaused)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors border ${
                              isPaused ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-transparent text-neutral-300 hover:text-white border-white/20'
                            }`}
                          >
                            {isPaused ? 'Unpause' : 'Pause'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-neutral-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl h-fit">
                  <h2 className="text-lg font-black text-white mb-2">Night Kitchen Cutoff</h2>
                  <p className="text-sm text-neutral-400 mb-6">Set the time when all platform ordering naturally ceases.</p>
                  <div className="flex items-center gap-4 bg-black/40 p-4 rounded-2xl border border-white/5">
                    <input
                      type="time"
                      value={settings.cutoffTime}
                      onChange={(e) => updateCutoffTime(e.target.value)}
                      className="bg-neutral-900 border border-white/10 text-white px-4 py-3 rounded-xl text-lg font-mono font-black focus:border-orange-500 outline-none"
                    />
                    <div className="text-xs text-neutral-400 font-medium">
                      Current Cutoff<br/><strong className="text-white">Default 9:15 PM</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MANUAL DISPATCH */}
          {activeTab === 'dispatch' && (
            <div className="flex-1 flex flex-col min-h-0 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex-1 min-h-0 flex flex-col bg-neutral-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-xl font-black text-white mb-1 flex items-center gap-2">
                      <Send className="w-5 h-5 text-orange-500" /> Manual Batch Dispatcher
                    </h2>
                    <p className="text-sm text-neutral-400">Assign multiple pending orders to a single runner to optimize routes.</p>
                  </div>
                  
                  <div className="flex items-center gap-2 p-2 bg-black/40 border border-white/5 rounded-2xl">
                    <select
                      value={targetRunnerId}
                      onChange={(e) => setTargetRunnerId(e.target.value)}
                      className="bg-transparent text-white text-sm font-bold px-3 py-2 focus:outline-none"
                    >
                      <option value="" className="bg-neutral-900 text-neutral-400">Select Runner...</option>
                      {studentRunners.map((r) => (
                        <option key={r.id} value={r.id} className="bg-neutral-900 text-white">
                          {r.name} ({r.hostelBlock?.split(' ')[0]})
                        </option>
                      ))}
                    </select>
                    <button
                      disabled={selectedOrderIds.length === 0 || !targetRunnerId}
                      onClick={handleBatchDispatchSubmit}
                      className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 disabled:bg-neutral-800 disabled:text-neutral-500 text-white font-bold text-sm transition-all"
                    >
                      Dispatch ({selectedOrderIds.length})
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 mb-4">
                   <select
                    value={selectedHostelFilter}
                    onChange={(e) => setSelectedHostelFilter(e.target.value)}
                    className="bg-black/50 border border-white/10 text-white text-xs font-bold rounded-xl px-4 py-2"
                  >
                    <option value="all">All Hostels</option>
                    <option value="Aryabhatta">Aryabhatta Hall</option>
                    <option value="Bhaskara">Bhaskara Hall</option>
                  </select>
                  <button onClick={handleSelectAllOrders} className="text-xs font-bold text-orange-400 hover:text-orange-300">
                    {selectedOrderIds.length === filteredDispatchOrders.length && filteredDispatchOrders.length > 0 ? 'Deselect All' : 'Select All Filtered'}
                  </button>
                </div>

                {filteredDispatchOrders.length === 0 ? (
                  <div className="p-12 text-center bg-black/40 rounded-2xl border border-white/5 border-dashed">
                    <Package className="w-10 h-10 text-neutral-700 mx-auto mb-3" />
                    <div className="text-neutral-400 text-sm font-medium">No unassigned orders waiting for dispatch.</div>
                  </div>
                ) : (
                  <>
                  <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar pb-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {filteredDispatchOrders.slice(dispatchPage * 4, (dispatchPage + 1) * 4).map((ord) => {
                      const isChecked = selectedOrderIds.includes(ord.id);
                      return (
                        <div
                          key={ord.id}
                          onClick={() => handleToggleOrderSelection(ord.id)}
                          className={`p-4 rounded-2xl border cursor-pointer flex items-center justify-between transition-all select-none ${
                            isChecked ? 'bg-orange-500/10 border-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.15)]' : 'bg-black/40 border-white/5 hover:border-white/20 text-neutral-300'
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <div className={`mt-1 w-5 h-5 rounded flex items-center justify-center border-2 transition-colors ${isChecked ? 'bg-orange-500 border-orange-500 text-white' : 'border-neutral-600'}`}>
                              {isChecked && <ShieldCheck className="w-3 h-3" />}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-mono font-black text-white text-sm">{ord.id}</span>
                                <OrderStatusBadge status={ord.status} size="sm" />
                              </div>
                              <div className="text-xs text-neutral-400 font-medium">
                                Stall: <span className="text-white">{ord.vendorName}</span>
                              </div>
                              <div className="text-xs text-neutral-400 font-medium mt-0.5">
                                Room: <span className="text-orange-400">{ord.hostelBlock.split(' ')[0]} {ord.roomNumber}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                             <div className="text-base font-black text-white">{formatRupees(ord.totalAmount)}</div>
                             <div className="text-[10px] text-neutral-500 font-mono mt-1">{new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                          </div>
                        </div>
                      );
                    })}
                    </div>
                  </div>
                  
                  {filteredDispatchOrders.length > 4 && (
                    <div className="flex items-center justify-between pt-3 mt-auto border-t border-white/10">
                      <button
                        onClick={() => setDispatchPage(p => Math.max(0, p - 1))}
                        disabled={dispatchPage === 0}
                        className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 ${dispatchPage === 0 ? 'opacity-30 cursor-not-allowed text-neutral-500' : 'bg-white/10 text-white hover:bg-white/20'}`}
                      >
                        Prev
                      </button>
                      <div className="text-[10px] font-mono text-neutral-400">
                        Page {dispatchPage + 1} / {Math.ceil(filteredDispatchOrders.length / 4)}
                      </div>
                      <button
                        onClick={() => setDispatchPage(p => Math.min(Math.ceil(filteredDispatchOrders.length / 4) - 1, p + 1))}
                        disabled={dispatchPage >= Math.ceil(filteredDispatchOrders.length / 4) - 1}
                        className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 ${dispatchPage >= Math.ceil(filteredDispatchOrders.length / 4) - 1 ? 'opacity-30 cursor-not-allowed text-neutral-500' : 'bg-orange-500 text-white hover:bg-orange-400'}`}
                      >
                        Next
                      </button>
                    </div>
                  )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: RUNNER ROSTER */}
          {activeTab === 'roster' && (
            <div className="flex-1 flex flex-col min-h-0 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex-1 min-h-0 flex flex-col bg-neutral-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-black text-white mb-1">Student Runner Roster</h2>
                    <p className="text-sm text-neutral-400">Manage enrolled delivery partners and verify their IDs.</p>
                  </div>
                  <button onClick={() => setShowAddRunnerModal(true)} className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg">
                    <Plus className="w-4 h-4" /> Add Runner
                  </button>
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar rounded-2xl border border-white/5">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-black/50 sticky top-0 z-10">
                      <tr className="text-neutral-400 uppercase tracking-wider text-[10px] font-bold border-b border-white/5">
                        <th className="py-4 px-4">Runner Name</th>
                        <th className="py-4 px-4">Phone</th>
                        <th className="py-4 px-4">Hostel Base</th>
                        <th className="py-4 px-4">Status</th>
                        <th className="py-4 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 bg-black/20">
                      {studentRunners.slice(rosterPage * 4, (rosterPage + 1) * 4).map((r) => (
                        <tr key={r.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-4 px-4 font-bold text-white">{r.name}</td>
                          <td className="py-4 px-4 font-mono text-neutral-300">{r.phone}</td>
                          <td className="py-4 px-4 text-neutral-300">{r.hostelBlock}</td>
                          <td className="py-4 px-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${r.isVerified ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                              {r.isVerified ? '✓ Verified' : 'Pending'}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right">
                             <button onClick={() => toggleRunnerVerification(r.id)} className="text-xs font-bold text-indigo-400 hover:text-indigo-300 underline underline-offset-2">
                               {r.isVerified ? 'Revoke Access' : 'Verify ID'}
                             </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {studentRunners.length > 4 && (
                  <div className="flex items-center justify-between pt-4 mt-auto border-t border-white/10">
                    <button
                      onClick={() => setRosterPage(p => Math.max(0, p - 1))}
                      disabled={rosterPage === 0}
                      className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 ${rosterPage === 0 ? 'opacity-30 cursor-not-allowed text-neutral-500' : 'bg-white/10 text-white hover:bg-white/20'}`}
                    >
                      Prev
                    </button>
                    <div className="text-[10px] font-mono text-neutral-400">
                      Page {rosterPage + 1} / {Math.ceil(studentRunners.length / 4)}
                    </div>
                    <button
                      onClick={() => setRosterPage(p => Math.min(Math.ceil(studentRunners.length / 4) - 1, p + 1))}
                      disabled={rosterPage >= Math.ceil(studentRunners.length / 4) - 1}
                      className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 ${rosterPage >= Math.ceil(studentRunners.length / 4) - 1 ? 'opacity-30 cursor-not-allowed text-neutral-500' : 'bg-orange-500 text-white hover:bg-orange-400'}`}
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: VENDORS */}
          {activeTab === 'vendors' && (
            <div className="flex-1 flex flex-col min-h-0 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex-1 min-h-0 flex flex-col bg-neutral-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-black text-white mb-1">Campus Vendors</h2>
                    <p className="text-sm text-neutral-400">Manage stalls and adjust platform commission splits.</p>
                  </div>
                  <button onClick={() => setShowAddVendorModal(true)} className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg">
                    <Plus className="w-4 h-4" /> Onboard Stall
                  </button>
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pb-2">
                    {vendors.slice(vendorPage * 2, (vendorPage + 1) * 2).map((v) => (
                    <div key={v.id} className="bg-black/40 border border-white/10 hover:border-white/20 transition-colors rounded-2xl p-5 flex flex-col md:flex-row gap-5">
                       {v.coverImage ? (
                         <div className="w-24 h-24 shrink-0 rounded-xl bg-neutral-800 overflow-hidden">
                           <img src={v.coverImage} className="w-full h-full object-cover" alt="" />
                         </div>
                       ) : (
                         <div className="w-24 h-24 shrink-0 rounded-xl bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center text-neutral-600"><Store className="w-8 h-8"/></div>
                       )}
                       <div className="flex-1 flex flex-col justify-between min-w-0">
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="font-black text-white text-lg truncate">{v.name}</h3>
                              <div className="bg-black/50 text-amber-400 font-bold text-xs px-2 py-0.5 rounded-full border border-white/5 whitespace-nowrap">★ {v.rating}</div>
                            </div>
                            <div className="text-xs text-neutral-400 mt-1">{v.location}</div>
                          </div>
                          
                          <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                            <span className="text-xs font-medium text-neutral-400">Menu Items: <strong className="text-white">{v.menuItems.length}</strong></span>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Commission</span>
                              <select
                                value={v.commissionPct}
                                onChange={(e) => updateVendorCommission(v.id, Number(e.target.value))}
                                className="bg-neutral-800 border border-white/10 text-orange-400 font-bold rounded-lg px-3 py-1 text-xs focus:outline-none focus:border-orange-500"
                              >
                                {[8, 10, 12, 15, 20].map(pct => <option key={pct} value={pct}>{pct}%</option>)}
                              </select>
                            </div>
                          </div>
                       </div>
                    </div>
                  ))}
                  </div>
                </div>

                {vendors.length > 2 && (
                  <div className="flex items-center justify-between pt-4 mt-auto border-t border-white/10 shrink-0">
                    <button
                      onClick={() => setVendorPage(p => Math.max(0, p - 1))}
                      disabled={vendorPage === 0}
                      className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 ${vendorPage === 0 ? 'opacity-30 cursor-not-allowed text-neutral-500' : 'bg-white/10 text-white hover:bg-white/20'}`}
                    >
                      Prev
                    </button>
                    <div className="text-[10px] font-mono text-neutral-400">
                      Page {vendorPage + 1} / {Math.ceil(vendors.length / 2)}
                    </div>
                    <button
                      onClick={() => setVendorPage(p => Math.min(Math.ceil(vendors.length / 2) - 1, p + 1))}
                      disabled={vendorPage >= Math.ceil(vendors.length / 2) - 1}
                      className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 ${vendorPage >= Math.ceil(vendors.length / 2) - 1 ? 'opacity-30 cursor-not-allowed text-neutral-500' : 'bg-orange-500 text-white hover:bg-orange-400'}`}
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: REPORTS */}
          {activeTab === 'reports' && (
            <div className="flex-1 flex flex-col min-h-0 animate-in fade-in slide-in-from-bottom-4">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pb-4 shrink-0">
                <div className="bg-neutral-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-5 shadow-xl">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-2">Gross Volume</div>
                  <div className="text-3xl font-black text-white">{formatRupees(totalGrossRevenue)}</div>
                  <div className="text-xs text-neutral-400 font-medium mt-1">{totalOrders} orders</div>
                </div>
                <div className="bg-neutral-900/60 backdrop-blur-xl border border-emerald-500/20 rounded-3xl p-5 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl"></div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 mb-2">Platform Comm.</div>
                  <div className="text-3xl font-black text-emerald-400">{formatRupees(totalCommissionCollected)}</div>
                  <div className="text-xs text-emerald-500/70 font-medium mt-1">Campus revenue</div>
                </div>
                <div className="bg-neutral-900/60 backdrop-blur-xl border border-orange-500/20 rounded-3xl p-5 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl"></div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-orange-500 mb-2">Runner Payouts</div>
                  <div className="text-3xl font-black text-orange-400">{formatRupees(totalRunnerPayouts)}</div>
                  <div className="text-xs text-orange-500/70 font-medium mt-1">₹18/deliv + bonus</div>
                </div>
                <div className="bg-neutral-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-5 shadow-xl">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-2">Cancel Rate</div>
                  <div className="text-3xl font-black text-white">{refundRate}%</div>
                  <div className="text-xs text-neutral-400 font-medium mt-1">{cancelledOrders.length} cancellations</div>
                </div>
              </div>

              <div className="flex-1 min-h-0 flex flex-col bg-neutral-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
                <h2 className="text-xl font-black text-white mb-4 shrink-0">Master Audit Log</h2>
                <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar rounded-2xl border border-white/5">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-black/50 sticky top-0 z-10">
                      <tr className="text-neutral-400 uppercase tracking-wider text-[10px] font-bold border-b border-white/5">
                        <th className="py-4 px-4">Order ID</th>
                        <th className="py-4 px-4">Stall</th>
                        <th className="py-4 px-4">Customer</th>
                        <th className="py-4 px-4">Runner</th>
                        <th className="py-4 px-4 text-right">Amount</th>
                        <th className="py-4 px-4 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 bg-black/20">
                      {orders.slice(reportPage * 4, (reportPage + 1) * 4).map((o) => (
                        <tr key={o.id} className="hover:bg-white/[0.02] transition-colors text-neutral-300">
                          <td className="py-4 px-4 font-mono font-bold text-white">{o.id}</td>
                          <td className="py-4 px-4 font-medium">{o.vendorName}</td>
                          <td className="py-4 px-4">
                            <span className="font-bold text-white">{o.studentName}</span> <span className="text-xs text-neutral-500 block">{o.hostelBlock.split(' ')[0]} {o.roomNumber}</span>
                          </td>
                          <td className="py-4 px-4 font-mono text-xs">{o.runnerName || <span className="text-neutral-600">Unassigned</span>}</td>
                          <td className="py-4 px-4 text-right font-black text-white">{formatRupees(o.totalAmount)}</td>
                          <td className="py-4 px-4 text-right">
                            <div className="flex justify-end"><OrderStatusBadge status={o.status} size="sm" /></div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {orders.length > 4 && (
                  <div className="flex items-center justify-between pt-4 mt-auto border-t border-white/10 shrink-0">
                    <button
                      onClick={() => setReportPage(p => Math.max(0, p - 1))}
                      disabled={reportPage === 0}
                      className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 ${reportPage === 0 ? 'opacity-30 cursor-not-allowed text-neutral-500' : 'bg-white/10 text-white hover:bg-white/20'}`}
                    >
                      Prev
                    </button>
                    <div className="text-[10px] font-mono text-neutral-400">
                      Page {reportPage + 1} / {Math.ceil(orders.length / 4)}
                    </div>
                    <button
                      onClick={() => setReportPage(p => Math.min(Math.ceil(orders.length / 4) - 1, p + 1))}
                      disabled={reportPage >= Math.ceil(orders.length / 4) - 1}
                      className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 ${reportPage >= Math.ceil(orders.length / 4) - 1 ? 'opacity-30 cursor-not-allowed text-neutral-500' : 'bg-orange-500 text-white hover:bg-orange-400'}`}
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
          <Power size={18} />
          <span className="dock-tab-label">Controls</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('dispatch')}
          className={`dock-tab ${activeTab === 'dispatch' ? 'active' : ''}`}
        >
          <Send size={18} />
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
          <Bike size={18} />
          <span className="dock-tab-label">Runners</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('vendors')}
          className={`dock-tab ${activeTab === 'vendors' ? 'active' : ''}`}
        >
          <Store size={18} />
          <span className="dock-tab-label">Stalls</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reports')}
          className={`dock-tab ${activeTab === 'reports' ? 'active' : ''}`}
        >
          <FileText size={18} />
          <span className="dock-tab-label">Reports</span>
        </button>
      </nav>

      {/* Add Runner Modal */}
      {showAddRunnerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-neutral-900 border border-white/10 rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-white">Add Runner</h3>
              <button onClick={() => setShowAddRunnerModal(false)} className="text-neutral-400 hover:text-white bg-white/5 rounded-full p-2"><X className="w-4 h-4"/></button>
            </div>
            <form onSubmit={handleCreateRunner} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1 block">Full Name</label>
                <input type="text" required value={newRunnerForm.name} onChange={e => setNewRunnerForm({...newRunnerForm, name: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white font-bold focus:border-orange-500 outline-none" />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1 block">Phone Number</label>
                <input type="tel" required value={newRunnerForm.phone} onChange={e => setNewRunnerForm({...newRunnerForm, phone: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white font-mono font-bold focus:border-orange-500 outline-none" />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1 block">Hostel Base</label>
                <select value={newRunnerForm.hostelBlock} onChange={e => setNewRunnerForm({...newRunnerForm, hostelBlock: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white font-bold focus:border-orange-500 outline-none appearance-none">
                  {hostels.map(h => <option key={h.id} value={h.name}>{h.name}</option>)}
                </select>
              </div>
              <button type="submit" className="w-full py-4 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-black shadow-lg shadow-orange-900/30 mt-4">Add To Roster</button>
            </form>
          </div>
        </div>
      )}

      {/* Add Vendor Modal */}
      {showAddVendorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-neutral-900 border border-white/10 rounded-3xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto hide-scrollbar">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-white">Onboard Stall</h3>
              <button onClick={() => setShowAddVendorModal(false)} className="text-neutral-400 hover:text-white bg-white/5 rounded-full p-2"><X className="w-4 h-4"/></button>
            </div>
            <form onSubmit={handleCreateVendor} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1 block">Stall Name</label>
                <input type="text" required value={newVendorForm.name} onChange={e => setNewVendorForm({...newVendorForm, name: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white font-bold focus:border-orange-500 outline-none" />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1 block">Location</label>
                <input type="text" required value={newVendorForm.location} onChange={e => setNewVendorForm({...newVendorForm, location: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white font-bold focus:border-orange-500 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1 block">Comm. %</label>
                  <input type="number" required value={newVendorForm.commissionPct} onChange={e => setNewVendorForm({...newVendorForm, commissionPct: Number(e.target.value)})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white font-mono font-bold focus:border-orange-500 outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1 block">Prep (mins)</label>
                  <input type="number" required value={newVendorForm.prepTimeMinutes} onChange={e => setNewVendorForm({...newVendorForm, prepTimeMinutes: Number(e.target.value)})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white font-mono font-bold focus:border-orange-500 outline-none" />
                </div>
              </div>
              <div className="pt-4 border-t border-white/10 mt-2">
                 <div className="text-xs font-bold text-white mb-3">Initial Menu Item</div>
                 <div className="flex gap-2">
                   <input type="text" required placeholder="Item Name" value={newVendorForm.itemName1} onChange={e => setNewVendorForm({...newVendorForm, itemName1: e.target.value})} className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white font-bold focus:border-orange-500 outline-none text-sm" />
                   <input type="number" required placeholder="₹" value={newVendorForm.itemPrice1} onChange={e => setNewVendorForm({...newVendorForm, itemPrice1: Number(e.target.value)})} className="w-20 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white font-mono font-bold focus:border-orange-500 outline-none text-sm" />
                 </div>
                 <label className="flex items-center gap-2 mt-3 cursor-pointer">
                    <input type="checkbox" checked={newVendorForm.itemIsVeg1} onChange={e => setNewVendorForm({...newVendorForm, itemIsVeg1: e.target.checked})} className="accent-emerald-500 w-4 h-4" />
                    <span className="text-sm font-bold text-neutral-300">Pure Vegetarian</span>
                 </label>
              </div>
              <button type="submit" className="w-full py-4 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-black shadow-lg shadow-orange-900/30 mt-6">Onboard Stall</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
