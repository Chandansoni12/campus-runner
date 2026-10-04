import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../store';
import { Role, OrderStatus } from '../../types';
import {
  GraduationCap,
  Store,
  Bike,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  X,
  Bell,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const TopPortalNav: React.FC = () => {
  const {
    currentRole,
    setRole,
    orders,
    activeVendorId,
    toastMessage,
    setToast,
    settings,
  } = useAppStore();

  const [isCollapsed, setIsCollapsed] = useState(false);

  // Auto-dismiss toast after 4.5 seconds
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage, setToast]);

  // Counts of pending actions for role badges
  const pendingVendorOrders = orders.filter(
    (o) => o.vendorId === activeVendorId && o.status === OrderStatus.PLACED
  ).length;

  const availableRunnerOrders = orders.filter(
    (o) =>
      !o.runnerId &&
      (o.status === OrderStatus.PREPARING ||
        o.status === OrderStatus.READY ||
        o.status === OrderStatus.ACCEPTED)
  ).length;

  const roles = [
    {
      id: Role.STUDENT,
      label: 'Student',
      icon: GraduationCap,
      badge: 0,
    },
    {
      id: Role.VENDOR,
      label: 'Vendor',
      icon: Store,
      badge: pendingVendorOrders,
      badgeColor: '#FD6931',
    },
    {
      id: Role.RUNNER,
      label: 'Runner',
      icon: Bike,
      badge: availableRunnerOrders,
      badgeColor: '#10B981',
    },
    {
      id: Role.ADMIN,
      label: 'Admin',
      icon: ShieldCheck,
      badge: 0,
    },
  ];

  return (
    <>
      {/* ─── 1. GLOBAL TOAST NOTIFICATION ─── */}
      {toastMessage && (
        <div
          id="global-toast-notification"
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] max-w-sm w-[92%] p-3.5 rounded-2xl border shadow-2xl backdrop-blur-2xl flex items-start gap-3 transition-all animate-in fade-in slide-in-from-top-4"
          style={{
            background:
              toastMessage.type === 'error'
                ? 'rgba(76, 16, 24, 0.95)'
                : toastMessage.type === 'info'
                ? 'rgba(16, 32, 60, 0.95)'
                : 'rgba(12, 44, 28, 0.95)',
            borderColor:
              toastMessage.type === 'error'
                ? 'rgba(239, 68, 68, 0.5)'
                : toastMessage.type === 'info'
                ? 'rgba(99, 102, 241, 0.5)'
                : 'rgba(16, 185, 129, 0.5)',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
          }}
        >
          {toastMessage.type === 'error' ? (
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          ) : toastMessage.type === 'info' ? (
            <Bell className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          )}

          <div className="flex-1 text-xs font-semibold text-white leading-relaxed">
            {toastMessage.message}
          </div>

          <button
            type="button"
            onClick={() => setToast(null)}
            className="text-neutral-400 hover:text-white p-1 rounded-full bg-white/10 shrink-0"
            aria-label="Dismiss toast"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ─── 2. KILL-SWITCH EMERGENCY BANNER ─── */}
      {settings.globalOrderingPaused && (
        <div className="bg-rose-950 border-b border-rose-800 text-rose-200 px-4 py-2 text-xs flex items-center justify-between z-[180]">
          <div className="flex items-center gap-2 font-medium">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="truncate">Campus Kill-Switch Active: Ordering suspended by Admin.</span>
          </div>
          <button
            type="button"
            onClick={() => setRole(Role.ADMIN)}
            className="text-[11px] bg-rose-900 hover:bg-rose-800 text-rose-100 px-2.5 py-1 rounded font-mono font-bold shrink-0 ml-2"
          >
            Admin Ops
          </button>
        </div>
      )}

      {/* ─── 3. TOP PORTAL SWITCHER BAR ─── */}
      <div
        className="w-full relative z-[100] transition-all duration-300"
        style={{
          background: 'rgba(10, 11, 16, 0.88)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <div className="max-w-[500px] mx-auto px-3 py-1.5 flex items-center justify-between gap-2">
          {/* Collapse Toggle & Brand Pill */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white flex items-center justify-center transition-colors"
              title={isCollapsed ? 'Expand portal tabs' : 'Collapse portal tabs'}
            >
              {isCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
            </button>
            <span className="text-[10px] font-black uppercase tracking-wider text-orange-400 font-mono hidden sm:inline">
              Portals
            </span>
          </div>

          {/* Role Navigation Pills */}
          {!isCollapsed ? (
            <div className="flex items-center gap-1 overflow-x-auto hide-scrollbar flex-1 justify-end">
              {roles.map((r) => {
                const Icon = r.icon;
                const isActive = currentRole === r.id;
                return (
                  <button
                    key={r.id}
                    id={`nav-role-${r.id.toLowerCase()}`}
                    type="button"
                    onClick={() => setRole(r.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 shrink-0 ${
                      isActive
                        ? 'bg-gradient-to-r from-[#FD6931] to-[#E04B28] text-white shadow-md shadow-orange-950 scale-[1.02]'
                        : 'bg-white/5 hover:bg-white/10 text-neutral-300'
                    }`}
                  >
                    <Icon size={13} />
                    <span>{r.label}</span>
                    {r.badge > 0 && (
                      <span
                        className="px-1.5 py-0.2 rounded-full text-[9.5px] font-black text-white animate-pulse"
                        style={{ backgroundColor: r.badgeColor || '#FD6931' }}
                      >
                        {r.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white flex items-center gap-1">
                <span>Active:</span>
                <span className="text-orange-400">{currentRole}</span>
              </span>
              {(pendingVendorOrders > 0 || availableRunnerOrders > 0) && (
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
