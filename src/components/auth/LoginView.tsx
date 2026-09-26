import React, { useState } from 'react';
import { useAppStore } from '../../store';
import { Role } from '../../types';
import {
  User,
  Store,
  Bike,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Lock,
  Phone,
  Building2,
  KeyRound,
  CheckCircle2,
  Zap,
  MapPin,
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const { loginAsRole, users, vendors, setCurrentUser, setActiveVendorId, setActiveRunnerId } = useAppStore();

  const [selectedRole, setSelectedRole] = useState<Role>(Role.STUDENT);

  // Form states
  const [studentForm, setStudentForm] = useState({
    hostelBlock: 'Aryabhatta Hall',
    roomNumber: 'A-204',
    phone: '9876543210',
  });

  const [vendorForm, setVendorForm] = useState({
    vendorId: vendors[0]?.id || 'v1',
    pin: '1234',
  });

  const [runnerForm, setRunnerForm] = useState({
    runnerId: users.find((u) => u.role === Role.RUNNER)?.id || 'u4',
    passcode: '8888',
  });

  const [adminForm, setAdminForm] = useState({
    accessKey: 'ADMIN-CAMPUS-2026',
  });

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const studentUser = users.find((u) => u.role === Role.STUDENT) || users[0];
    setCurrentUser({
      ...studentUser,
      hostelBlock: studentForm.hostelBlock,
      roomNumber: studentForm.roomNumber,
      phone: studentForm.phone,
    });
    loginAsRole(Role.STUDENT);
  };

  const handleVendorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveVendorId(vendorForm.vendorId);
    loginAsRole(Role.VENDOR);
  };

  const handleRunnerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveRunnerId(runnerForm.runnerId);
    loginAsRole(Role.RUNNER);
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginAsRole(Role.ADMIN);
  };

  const handleQuickLogin = (role: Role) => {
    loginAsRole(role);
  };

  return (
    <div className="min-h-[100dvh] w-full bg-[#FAFAFA] text-[#1A1A1A] flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Subtle Background Glow Elements */}
      <div className="absolute top-[-10%] left-[-5%] w-[45%] h-[45%] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[45%] h-[45%] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Top Brand Bar */}
      <header className="w-full max-w-6xl mx-auto px-6 py-5 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#2D2D2D] text-white flex items-center justify-center text-xl font-bold shadow-md">
            🍕
          </div>
          <div>
            <div className="font-extrabold text-lg tracking-tight text-[#1A1A1A] flex items-center gap-1.5">
              <span>Campus Runner</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                PILOT v2.0
              </span>
            </div>
            <div className="text-xs text-[#6B6B6B]">In-Campus Food Delivery System</div>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-4 text-xs font-semibold text-[#6B6B6B]">
          <span className="flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            15-Min Delivery Slots
          </span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            OTP Verified
          </span>
        </div>
      </header>

      {/* Main Login Card Container */}
      <main className="w-full max-w-5xl mx-auto px-4 py-6 z-10 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Hero Text & Features */}
          <div className="lg:col-span-5 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-[#F2F2F2] border border-[#E5E5E5] px-3 py-1.5 rounded-full text-xs font-semibold text-[#2D2D2D]">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Gated Campus Delivery Network</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1A1A1A] tracking-tight leading-[1.15]">
              Delicious food, delivered <span className="underline decoration-emerald-500/40 decoration-4">to your room.</span>
            </h1>

            <p className="text-sm sm:text-base text-[#6B6B6B] leading-relaxed max-w-md mx-auto lg:mx-0">
              Connecting hostel students, campus food stalls, and student runners with real-time tracking and zero hassle.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2 max-w-md mx-auto lg:mx-0 text-left">
              <div className="bg-white p-3.5 rounded-2xl border border-[#E5E5E5] shadow-xs">
                <div className="text-base font-extrabold text-[#1A1A1A]">₹15 Flat</div>
                <div className="text-xs text-[#6B6B6B]">Hostel Delivery Fee</div>
              </div>
              <div className="bg-white p-3.5 rounded-2xl border border-[#E5E5E5] shadow-xs">
                <div className="text-base font-extrabold text-[#1A1A1A]">Strict Veg</div>
                <div className="text-xs text-[#6B6B6B]">Hostel Policy Enforced</div>
              </div>
            </div>
          </div>

          {/* Right Column: Portal Selector & Login Card */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E5E5] shadow-xl shadow-black/5">
            
            {/* Role Tabs Header */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-[#6B6B6B] uppercase tracking-wider mb-3">
                Select Your Portal Role
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#F2F2F2] p-1.5 rounded-2xl border border-[#E5E5E5]">
                <button
                  type="button"
                  onClick={() => setSelectedRole(Role.STUDENT)}
                  className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                    selectedRole === Role.STUDENT
                      ? 'bg-white text-[#1A1A1A] shadow-xs'
                      : 'text-[#6B6B6B] hover:text-[#1A1A1A]'
                  }`}
                >
                  <User className="w-4 h-4 text-indigo-600" />
                  <span>Student</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole(Role.VENDOR)}
                  className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                    selectedRole === Role.VENDOR
                      ? 'bg-white text-[#1A1A1A] shadow-xs'
                      : 'text-[#6B6B6B] hover:text-[#1A1A1A]'
                  }`}
                >
                  <Store className="w-4 h-4 text-emerald-600" />
                  <span>Vendor</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole(Role.RUNNER)}
                  className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                    selectedRole === Role.RUNNER
                      ? 'bg-white text-[#1A1A1A] shadow-xs'
                      : 'text-[#6B6B6B] hover:text-[#1A1A1A]'
                  }`}
                >
                  <Bike className="w-4 h-4 text-sky-600" />
                  <span>Runner</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole(Role.ADMIN)}
                  className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                    selectedRole === Role.ADMIN
                      ? 'bg-white text-[#1A1A1A] shadow-xs'
                      : 'text-[#6B6B6B] hover:text-[#1A1A1A]'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-rose-600" />
                  <span>Admin</span>
                </button>
              </div>
            </div>

            {/* STUDENT LOGIN FORM */}
            {selectedRole === Role.STUDENT && (
              <form onSubmit={handleStudentSubmit} className="space-y-4 animate-fade-in">
                <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center font-bold">
                    🎓
                  </div>
                  <div>
                    <div className="font-bold text-sm text-indigo-950">Student Ordering Portal</div>
                    <div className="text-xs text-indigo-700">Order from campus canteens & track deliveries</div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#6B6B6B] block mb-1">Hostel Block</label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-[#999] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <select
                      value={studentForm.hostelBlock}
                      onChange={(e) => setStudentForm({ ...studentForm, hostelBlock: e.target.value })}
                      className="w-full bg-[#F9F9F9] border border-[#E5E5E5] rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium text-[#1A1A1A] outline-none focus:border-[#2D2D2D] transition-colors"
                    >
                      <option value="Aryabhatta Hall">Aryabhatta Hall (Boys)</option>
                      <option value="Bhaskara Hall">Bhaskara Hall (Strict Veg Enforced)</option>
                      <option value="Gargi Hall">Gargi Hall (Girls)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[#6B6B6B] block mb-1">Room Number</label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-[#999] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={studentForm.roomNumber}
                        onChange={(e) => setStudentForm({ ...studentForm, roomNumber: e.target.value })}
                        className="w-full bg-[#F9F9F9] border border-[#E5E5E5] rounded-xl pl-10 pr-4 py-2.5 text-sm font-mono text-[#1A1A1A] outline-none focus:border-[#2D2D2D] transition-colors"
                        placeholder="A-204"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#6B6B6B] block mb-1">Mobile Number</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-[#999] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        value={studentForm.phone}
                        onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
                        className="w-full bg-[#F9F9F9] border border-[#E5E5E5] rounded-xl pl-10 pr-4 py-2.5 text-sm font-mono text-[#1A1A1A] outline-none focus:border-[#2D2D2D] transition-colors"
                        placeholder="9876543210"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#2D2D2D] text-white font-bold text-sm hover:bg-[#1A1A1A] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md"
                >
                  <span>Enter Student Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin(Role.STUDENT)}
                    className="text-xs text-indigo-600 hover:underline font-semibold"
                  >
                    ⚡ Instant Demo Login as Aarav Sharma (Aryabhatta Rm A-204)
                  </button>
                </div>
              </form>
            )}

            {/* VENDOR LOGIN FORM */}
            {selectedRole === Role.VENDOR && (
              <form onSubmit={handleVendorSubmit} className="space-y-4 animate-fade-in">
                <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                    🍳
                  </div>
                  <div>
                    <div className="font-bold text-sm text-emerald-950">Vendor Kitchen Management</div>
                    <div className="text-xs text-emerald-700">Receive live orders, manage stock & payouts</div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#6B6B6B] block mb-1">Select Campus Stall</label>
                  <select
                    value={vendorForm.vendorId}
                    onChange={(e) => setVendorForm({ ...vendorForm, vendorId: e.target.value })}
                    className="w-full bg-[#F9F9F9] border border-[#E5E5E5] rounded-xl px-4 py-2.5 text-sm font-medium text-[#1A1A1A] outline-none focus:border-[#2D2D2D] transition-colors"
                  >
                    {vendors.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.location})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#6B6B6B] block mb-1">Kitchen Access PIN</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#999] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={vendorForm.pin}
                      onChange={(e) => setVendorForm({ ...vendorForm, pin: e.target.value })}
                      className="w-full bg-[#F9F9F9] border border-[#E5E5E5] rounded-xl pl-10 pr-4 py-2.5 text-sm font-mono text-[#1A1A1A] outline-none focus:border-[#2D2D2D] transition-colors"
                      placeholder="••••"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#2D2D2D] text-white font-bold text-sm hover:bg-[#1A1A1A] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md"
                >
                  <span>Enter Kitchen Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin(Role.VENDOR)}
                    className="text-xs text-emerald-600 hover:underline font-semibold"
                  >
                    ⚡ Instant Demo Login as Chai & Maggi Manager
                  </button>
                </div>
              </form>
            )}

            {/* RUNNER LOGIN FORM */}
            {selectedRole === Role.RUNNER && (
              <form onSubmit={handleRunnerSubmit} className="space-y-4 animate-fade-in">
                <div className="bg-sky-50/50 border border-sky-100 rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold">
                    🛵
                  </div>
                  <div>
                    <div className="font-bold text-sm text-sky-950">Student Runner Fleet</div>
                    <div className="text-xs text-sky-700">Pickup orders from stalls & deliver with OTP verification</div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#6B6B6B] block mb-1">Select Runner Account</label>
                  <select
                    value={runnerForm.runnerId}
                    onChange={(e) => setRunnerForm({ ...runnerForm, runnerId: e.target.value })}
                    className="w-full bg-[#F9F9F9] border border-[#E5E5E5] rounded-xl px-4 py-2.5 text-sm font-medium text-[#1A1A1A] outline-none focus:border-[#2D2D2D] transition-colors"
                  >
                    {users
                      .filter((u) => u.role === Role.RUNNER)
                      .map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name} ({r.hostelBlock || 'Aryabhatta'})
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#6B6B6B] block mb-1">Runner Passcode</label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-[#999] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={runnerForm.passcode}
                      onChange={(e) => setRunnerForm({ ...runnerForm, passcode: e.target.value })}
                      className="w-full bg-[#F9F9F9] border border-[#E5E5E5] rounded-xl pl-10 pr-4 py-2.5 text-sm font-mono text-[#1A1A1A] outline-none focus:border-[#2D2D2D] transition-colors"
                      placeholder="••••"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#2D2D2D] text-white font-bold text-sm hover:bg-[#1A1A1A] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md"
                >
                  <span>Start Delivery Shift</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin(Role.RUNNER)}
                    className="text-xs text-sky-600 hover:underline font-semibold"
                  >
                    ⚡ Instant Demo Login as Runner Vikram Singh
                  </button>
                </div>
              </form>
            )}

            {/* ADMIN LOGIN FORM */}
            {selectedRole === Role.ADMIN && (
              <form onSubmit={handleAdminSubmit} className="space-y-4 animate-fade-in">
                <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold">
                    🛡️
                  </div>
                  <div>
                    <div className="font-bold text-sm text-rose-950">University Control Center</div>
                    <div className="text-xs text-rose-700">Campus kill-switches, cutoff control & analytics</div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#6B6B6B] block mb-1">Master Access Key</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#999] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={adminForm.accessKey}
                      onChange={(e) => setAdminForm({ ...adminForm, accessKey: e.target.value })}
                      className="w-full bg-[#F9F9F9] border border-[#E5E5E5] rounded-xl pl-10 pr-4 py-2.5 text-sm font-mono text-[#1A1A1A] outline-none focus:border-[#2D2D2D] transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#2D2D2D] text-white font-bold text-sm hover:bg-[#1A1A1A] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md"
                >
                  <span>Enter Command Console</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin(Role.ADMIN)}
                    className="text-xs text-rose-600 hover:underline font-semibold"
                  >
                    ⚡ Instant Demo Login as Campus Master Admin
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 px-6 border-t border-[#E5E5E5] bg-white text-center text-xs text-[#6B6B6B]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>Campus Runner Pilot • Gated Campus Delivery Protocol</div>
          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span>Aryabhatta & Bhaskara Hostels</span>
            <span>•</span>
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> System Ready
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};
