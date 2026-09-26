import React, { useState } from 'react';
import { useAppStore } from '../../store';
import { Role, User } from '../../types';
import {
  Smartphone,
  Mail,
  Lock,
  KeyRound,
  ShieldCheck,
  UserCheck,
  Store,
  Bike,
  GraduationCap,
  X,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetRole?: Role;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, targetRole }) => {
  const {
    currentRole,
    setRole,
    setCurrentUser,
    users,
    vendors,
    setActiveVendorId,
    setActiveRunnerId,
  } = useAppStore();

  const [selectedRole, setSelectedRole] = useState<Role>(targetRole || currentRole);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const isStudentOrRunner = selectedRole === Role.STUDENT || selectedRole === Role.RUNNER;

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      setErrorMessage('Please enter a valid 10-digit campus mobile number.');
      return;
    }
    setOtpSent(true);
    setOtp('1234'); // Demo auto-fill OTP
    setErrorMessage(null);
  };

  const handleVerifyOtpAndLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp !== '1234' && otp.length !== 4) {
      setErrorMessage('Invalid OTP. Use demo OTP: 1234');
      return;
    }

    // Match or create user
    const matchedUser = users.find((u) => u.phone === phone || u.role === selectedRole);
    if (matchedUser) {
      setCurrentUser(matchedUser);
      setRole(selectedRole);
      if (selectedRole === Role.RUNNER) {
        setActiveRunnerId(matchedUser.id);
      }
    }
    onClose();
  };

  const handlePasswordLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please fill in both email and password.');
      return;
    }

    const matchedUser = users.find((u) => u.role === selectedRole);
    if (matchedUser) {
      setCurrentUser(matchedUser);
      setRole(selectedRole);
      if (selectedRole === Role.VENDOR && vendors.length > 0) {
        setActiveVendorId(vendors[0].id);
      }
    }
    onClose();
  };

  const handleQuickLoginAs = (user: User) => {
    setCurrentUser(user);
    setRole(user.role);
    if (user.role === Role.RUNNER) {
      setActiveRunnerId(user.id);
    } else if (user.role === Role.VENDOR && vendors.length > 0) {
      setActiveVendorId(vendors[0].id);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-orange-400" />
              <span>Campus Role Sign-In</span>
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Select operator role to sign in or switch account.
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-neutral-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Role Selection Tabs */}
        <div className="grid grid-cols-4 gap-1.5 p-1 bg-neutral-950 rounded-xl border border-neutral-800 text-xs font-semibold">
          {[
            { role: Role.STUDENT, label: 'Student', icon: GraduationCap },
            { role: Role.VENDOR, label: 'Vendor', icon: Store },
            { role: Role.RUNNER, label: 'Runner', icon: Bike },
            { role: Role.ADMIN, label: 'Admin', icon: ShieldCheck },
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = selectedRole === item.role;
            return (
              <button
                key={item.role}
                onClick={() => {
                  setSelectedRole(item.role);
                  setOtpSent(false);
                  setErrorMessage(null);
                }}
                className={`py-2 px-1 rounded-lg flex flex-col items-center gap-1 transition-all ${
                  isSelected
                    ? 'bg-orange-600 text-white shadow-md'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[11px]">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Auth Method Notification */}
        <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800/80 text-[11px] text-neutral-400">
          {isStudentOrRunner ? (
            <span className="text-emerald-400 font-medium">
              📱 Indian Campus Auth: Mobile OTP (Instant student verification)
            </span>
          ) : (
            <span className="text-orange-400 font-medium">
              🔐 Portal Security: Email & Password (Kitchen tablet & Warden access)
            </span>
          )}
        </div>

        {/* Dynamic Form: Phone + OTP vs Email + Password */}
        {isStudentOrRunner ? (
          /* Student & Runner Phone OTP Flow */
          <div className="space-y-3">
            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-3">
                <div>
                  <label className="text-xs text-neutral-300 font-medium block mb-1">
                    Campus Phone Number
                  </label>
                  <div className="flex items-center gap-2 bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-white">
                    <span className="text-xs font-mono text-neutral-400">+91</span>
                    <input
                      type="tel"
                      maxLength={10}
                      required
                      placeholder="9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      className="bg-transparent outline-none w-full text-xs font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Send 4-Digit Login OTP</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtpAndLogin} className="space-y-3">
                <div className="text-center">
                  <span className="text-xs text-neutral-400">
                    OTP sent to <strong className="text-white">+91 {phone}</strong>
                  </span>
                  <div className="text-[11px] text-emerald-400 mt-0.5">Demo OTP pre-filled: 1234</div>
                </div>

                <input
                  type="text"
                  maxLength={4}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full bg-neutral-950 border-2 border-orange-500 rounded-xl py-2.5 text-center text-2xl font-mono tracking-widest text-white outline-none font-bold"
                />

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setOtpSent(false)}
                    className="w-1/3 py-2 text-xs text-neutral-400 hover:text-white"
                  >
                    Change Phone
                  </button>
                  <button
                    type="submit"
                    className="w-2/3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verify & Continue</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          /* Vendor & Admin Email / Password Flow */
          <form onSubmit={handlePasswordLogin} className="space-y-3 text-xs">
            <div>
              <label className="text-neutral-300 font-medium block mb-1">
                {selectedRole === Role.VENDOR ? 'Stall Manager Email' : 'Warden / DSA Email'}
              </label>
              <div className="flex items-center gap-2 bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-white">
                <Mail className="w-3.5 h-3.5 text-neutral-400" />
                <input
                  type="email"
                  required
                  placeholder={
                    selectedRole === Role.VENDOR ? 'stall.manager@campus.edu' : 'warden.dsa@campus.edu'
                  }
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-transparent outline-none w-full text-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-neutral-300 font-medium block mb-1">Password / Secure PIN</label>
              <div className="flex items-center gap-2 bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-white">
                <Lock className="w-3.5 h-3.5 text-neutral-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-transparent outline-none w-full text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Sign In to {selectedRole} Console</span>
            </button>
          </form>
        )}

        {errorMessage && (
          <div className="p-2 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-200 text-xs">
            {errorMessage}
          </div>
        )}

        {/* Quick One-Tap Persona Selector (For rapid demo without re-typing) */}
        <div className="pt-3 border-t border-neutral-800 space-y-2">
          <div className="text-[11px] text-neutral-400 uppercase font-mono font-semibold flex items-center justify-between">
            <span>One-Tap Pilot Personas:</span>
            <span className="text-[10px] text-neutral-500">Fast-switch</span>
          </div>

          <div className="space-y-1.5">
            {users.map((u) => (
              <button
                key={u.id}
                onClick={() => handleQuickLoginAs(u)}
                className="w-full text-left p-2 rounded-xl bg-neutral-950 hover:bg-neutral-800/80 border border-neutral-800/60 flex items-center justify-between transition-colors text-xs"
              >
                <div>
                  <span className="font-semibold text-white">{u.name}</span>
                  <span className="text-[10px] text-neutral-400 block font-mono">
                    {u.role} • {u.hostelBlock || u.phone}
                  </span>
                </div>
                <span className="text-[11px] text-orange-400 font-mono font-medium">Log In →</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
