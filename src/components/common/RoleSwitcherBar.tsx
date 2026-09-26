import React, { useState } from 'react';
import { useAppStore } from '../../store';
import { Role } from '../../types';
import { LoginModal } from '../auth/LoginModal';
import {
  GraduationCap,
  Store,
  Bike,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  X,
  Clock,
  MapPin,
  ChevronDown,
  LogIn,
} from 'lucide-react';

export const RoleSwitcherBar: React.FC = () => {
  const {
    currentRole,
    setRole,
    currentUser,
    setCurrentUser,
    users,
    vendors,
    activeVendorId,
    setActiveVendorId,
    activeRunnerId,
    setActiveRunnerId,
    settings,
    resetDemoData,
    toastMessage,
    setToast,
  } = useAppStore();

  const [showPersonaMenu, setShowPersonaMenu] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const roles = [
    { id: Role.STUDENT, label: 'Student', icon: GraduationCap, badge: 'Order & Track' },
    { id: Role.VENDOR, label: 'Vendor Kitchen', icon: Store, badge: 'Live Orders & Stock' },
    { id: Role.RUNNER, label: 'Runner', icon: Bike, badge: 'Dispatch & Handover' },
    { id: Role.ADMIN, label: 'Admin', icon: ShieldCheck, badge: 'Kill-Switch & Ops' },
  ];

  const currentVendor = vendors.find((v) => v.id === activeVendorId) || vendors[0];
  const runners = users.filter((u) => u.role === Role.RUNNER);

  return (
    <>
      {/* Toast Alert */}
      {toastMessage && (
        <div
          id="toast-notification-banner"
          className={`fixed top-4 right-4 z-50 max-w-md p-3.5 rounded-xl border shadow-2xl flex items-start gap-3 backdrop-blur-md transition-all animate-in fade-in slide-in-from-top-2 ${
            toastMessage.type === 'error'
              ? 'bg-rose-950/90 text-rose-200 border-rose-700/50'
              : toastMessage.type === 'info'
              ? 'bg-sky-950/90 text-sky-200 border-sky-700/50'
              : 'bg-emerald-950/90 text-emerald-200 border-emerald-700/50'
          }`}
        >
          {toastMessage.type === 'error' ? (
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          )}
          <div className="flex-1 text-xs leading-relaxed font-medium">{toastMessage.message}</div>
          <button
            id="dismiss-toast-btn"
            onClick={() => setToast(null)}
            className="text-neutral-400 hover:text-white p-0.5"
            aria-label="Dismiss toast notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Global Kill Switch Alert Banner if Active */}
      {settings.globalOrderingPaused && (
        <div
          id="global-killswitch-warning-bar"
          className="bg-rose-950 border-b border-rose-800 text-rose-200 px-4 py-2 text-xs flex items-center justify-between"
        >
          <div className="flex items-center gap-2 font-medium">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>CAMPUS KILL-SWITCH ACTIVE: All new student food orders are paused by University Administration.</span>
          </div>
          <button
            id="admin-override-link"
            onClick={() => setRole(Role.ADMIN)}
            className="text-xs bg-rose-900 hover:bg-rose-800 text-rose-100 px-2.5 py-1 rounded font-mono"
          >
            Manage in Admin
          </button>
        </div>
      )}

      {/* Main Switcher Header */}
      <header className="sticky top-0 z-40 glass-header shadow-lg shadow-black/40">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
          {/* Logo & Campus Tag */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF5E3A] to-[#D43D1A] flex items-center justify-center text-white glow-orange-sm shadow-md">
              <Bike className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-tight text-white text-base font-sans">Campus Runner</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FF5E3A]/15 text-[#FF5E3A] border border-[#FF5E3A]/30 font-bold tracking-wider">
                  PILOT v1.0
                </span>
              </div>
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5 font-medium">
                <MapPin className="w-3 h-3 text-[#FF5E3A]" />
                <span>Gated Campus • Night Cutoff {settings.cutoffTime}</span>
              </div>
            </div>
          </div>

          {/* Role Navigation Buttons */}
          <nav className="flex items-center bg-[#12151C]/90 p-1.5 rounded-2xl border border-white/10 shadow-inner overflow-x-auto max-w-full gap-1">
            {roles.map((r) => {
              const Icon = r.icon;
              const isActive = currentRole === r.id;
              return (
                <button
                  key={r.id}
                  id={`role-btn-${r.id.toLowerCase()}`}
                  onClick={() => setRole(r.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#FF5E3A] to-[#E04B28] text-white glow-orange-sm shadow-md font-bold scale-[1.02]'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{r.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Persona & Context Control */}
          <div className="flex items-center gap-2.5">
            {/* Context Dropdown for Vendor / Runner Selection */}
            {currentRole === Role.VENDOR && (
              <div className="relative">
                <select
                  id="active-vendor-select"
                  value={activeVendorId}
                  onChange={(e) => setActiveVendorId(e.target.value)}
                  className="bg-[#1A1E27] border border-white/10 text-slate-200 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#FF5E3A] font-semibold"
                >
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>
                      Stall: {v.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {currentRole === Role.RUNNER && (
              <div className="relative">
                <select
                  id="active-runner-select"
                  value={activeRunnerId}
                  onChange={(e) => setActiveRunnerId(e.target.value)}
                  className="bg-[#1A1E27] border border-white/10 text-slate-200 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#FF5E3A] font-semibold"
                >
                  {runners.map((r) => (
                    <option key={r.id} value={r.id}>
                      Runner: {r.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Persona Switcher Menu */}
            <div className="relative">
              <button
                id="persona-switcher-btn"
                onClick={() => setShowPersonaMenu(!showPersonaMenu)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#1A1E27] hover:bg-[#222733] border border-white/10 text-xs text-slate-200 transition-colors shadow-sm"
              >
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 glow-emerald" />
                <span className="max-w-[120px] truncate font-semibold">{currentUser.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showPersonaMenu && (
                <div
                  id="persona-dropdown-list"
                  className="absolute right-0 mt-2 w-72 bg-[#161920] border border-white/15 rounded-2xl shadow-2xl p-2 z-50 backdrop-blur-xl"
                >
                  <div className="px-2.5 py-1.5 text-[11px] font-mono uppercase text-slate-400 font-bold border-b border-white/10 mb-1">
                    Quick Persona Switch (Demo)
                  </div>
                  {users.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        setCurrentUser(u);
                        setShowPersonaMenu(false);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl text-xs flex flex-col gap-1 transition-all ${
                        currentUser.id === u.id
                          ? 'bg-[#FF5E3A]/15 text-[#FF5E3A] border border-[#FF5E3A]/30 font-semibold'
                          : 'hover:bg-white/5 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span>{u.name}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/10 text-slate-300">
                          {u.role}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {u.hostelBlock ? `${u.hostelBlock} • Rm ${u.roomNumber || 'N/A'}` : u.email || u.phone}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Role Sign In / Account Modal Trigger */}
            <button
              id="open-login-modal-btn"
              onClick={() => setShowLoginModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FF5E3A]/15 hover:bg-[#FF5E3A]/25 border border-[#FF5E3A]/30 text-xs text-[#FF5E3A] font-bold transition-all"
              title="Test role login flows (Phone OTP vs Password)"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Role Login</span>
            </button>

            {/* Reset Demo Data button */}
            <button
              id="reset-demo-data-btn"
              onClick={resetDemoData}
              title="Reset orders and settings to clean pilot state"
              className="p-2 rounded-xl bg-[#1A1E27] hover:bg-[#222733] text-slate-400 hover:text-white border border-white/10 transition-colors shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Realistic Role Sign-In Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        targetRole={currentRole}
      />
    </>
  );
};
