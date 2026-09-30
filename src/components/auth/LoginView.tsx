import React, { useState } from 'react';
import { useAppStore } from '../../store';
import { Role } from '../../types';
import {
  User,
  Store,
  Bike,
  ShieldCheck,
  Eye,
  EyeOff,
  Building2,
  Phone,
  MapPin,
  Lock,
  Zap,
  ArrowRight,
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const { loginAsRole, users, vendors, setCurrentUser, setActiveVendorId, setActiveRunnerId } = useAppStore();

  const [selectedRole, setSelectedRole] = useState<Role>(Role.STUDENT);
  const [showPassword, setShowPassword] = useState(false);

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
    <div className="auth-screen">
      <div className="auth-content" style={{ paddingTop: 'calc(24px + var(--sat, 0px))', paddingBottom: 'calc(32px + var(--sab, 0px))' }}>
        {/* Delivo Welcome Title with Wave Animation */}
        <h1 className="auth-title">
          Welcome Back! <span className="wave-icon">👋</span>
        </h1>
        <p className="auth-subtitle">
          Campus Runner — Lightning food delivery inside university gates
        </p>

        {/* Delivo Role Switcher Tabs */}
        <div style={{ marginBottom: '24px' }}>
          <label className="form-label" style={{ fontSize: 'var(--font-12)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Select Portal
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
            {[
              { role: Role.STUDENT, label: 'Student', icon: User },
              { role: Role.VENDOR, label: 'Vendor', icon: Store },
              { role: Role.RUNNER, label: 'Runner', icon: Bike },
              { role: Role.ADMIN, label: 'Admin', icon: ShieldCheck },
            ].map(({ role, label, icon: Icon }) => {
              const isSelected = selectedRole === role;
              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => setSelectedRole(role)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '12px 4px',
                    borderRadius: '20px',
                    background: isSelected
                      ? 'linear-gradient(135deg, rgba(253, 105, 49, 0.25), rgba(255, 120, 60, 0.1))'
                      : 'rgba(255, 255, 255, 0.04)',
                    border: `1px solid ${isSelected ? 'rgba(253, 105, 49, 0.5)' : 'rgba(255, 255, 255, 0.08)'}`,
                    boxShadow: isSelected
                      ? '0 4px 16px rgba(253, 105, 49, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.2)'
                      : 'none',
                    color: isSelected ? '#FD6931' : '#8E8E93',
                    cursor: 'pointer',
                    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  <Icon style={{ width: '18px', height: '18px', marginBottom: '4px', color: isSelected ? '#FD6931' : '#8E8E93' }} />
                  <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '-0.01em' }}>{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── STUDENT FORM ─── */}
        {selectedRole === Role.STUDENT && (
          <form className="auth-form" onSubmit={handleStudentSubmit}>
            <div className="form-group">
              <label className="form-label">Hostel Residence</label>
              <div style={{ position: 'relative' }}>
                <select
                  value={studentForm.hostelBlock}
                  onChange={(e) => setStudentForm({ ...studentForm, hostelBlock: e.target.value })}
                  className="form-control"
                  style={{ appearance: 'none', paddingRight: '40px' }}
                >
                  <option value="Aryabhatta Hall" style={{ background: '#1A1A1A' }}>Aryabhatta Hall (Boys)</option>
                  <option value="Bhaskara Hall" style={{ background: '#1A1A1A' }}>Bhaskara Hall (Pure Veg)</option>
                  <option value="Gargi Hall" style={{ background: '#1A1A1A' }}>Gargi Hall (Girls)</option>
                </select>
                <Building2
                  style={{
                    position: 'absolute',
                    right: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '18px',
                    height: '18px',
                    color: 'var(--text-muted)',
                    pointerEvents: 'none',
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Room Number</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    required
                    value={studentForm.roomNumber}
                    onChange={(e) => setStudentForm({ ...studentForm, roomNumber: e.target.value })}
                    className="form-control"
                    placeholder="A-204"
                  />
                  <MapPin
                    style={{
                      position: 'absolute',
                      right: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '16px',
                      height: '16px',
                      color: 'var(--text-muted)',
                      pointerEvents: 'none',
                    }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="tel"
                    required
                    value={studentForm.phone}
                    onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
                    className="form-control"
                    placeholder="9876543210"
                  />
                  <Phone
                    style={{
                      position: 'absolute',
                      right: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '16px',
                      height: '16px',
                      color: 'var(--text-muted)',
                      pointerEvents: 'none',
                    }}
                  />
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-auth" style={{ marginTop: '8px' }}>
              Sign In to Student Portal
            </button>
          </form>
        )}

        {/* ─── VENDOR FORM ─── */}
        {selectedRole === Role.VENDOR && (
          <form className="auth-form" onSubmit={handleVendorSubmit}>
            <div className="form-group">
              <label className="form-label">Campus Food Stall</label>
              <select
                value={vendorForm.vendorId}
                onChange={(e) => setVendorForm({ ...vendorForm, vendorId: e.target.value })}
                className="form-control"
              >
                {vendors.map((v) => (
                  <option key={v.id} value={v.id} style={{ background: '#1A1A1A' }}>
                    {v.name} ({v.location})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Kitchen PIN</label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={vendorForm.pin}
                  onChange={(e) => setVendorForm({ ...vendorForm, pin: e.target.value })}
                  className="form-control"
                  placeholder="Enter 4-digit PIN"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-auth">
              Sign In to Kitchen Dashboard
            </button>
          </form>
        )}

        {/* ─── RUNNER FORM ─── */}
        {selectedRole === Role.RUNNER && (
          <form className="auth-form" onSubmit={handleRunnerSubmit}>
            <div className="form-group">
              <label className="form-label">Student Runner</label>
              <select
                value={runnerForm.runnerId}
                onChange={(e) => setRunnerForm({ ...runnerForm, runnerId: e.target.value })}
                className="form-control"
              >
                {users
                  .filter((u) => u.role === Role.RUNNER)
                  .map((r) => (
                    <option key={r.id} value={r.id} style={{ background: '#1A1A1A' }}>
                      {r.name} ({r.phone})
                    </option>
                  ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Runner Passcode</label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={runnerForm.passcode}
                  onChange={(e) => setRunnerForm({ ...runnerForm, passcode: e.target.value })}
                  className="form-control"
                  placeholder="Enter 4-digit passcode"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-auth">
              Sign In to Runner Portal
            </button>
          </form>
        )}

        {/* ─── ADMIN FORM ─── */}
        {selectedRole === Role.ADMIN && (
          <form className="auth-form" onSubmit={handleAdminSubmit}>
            <div className="form-group">
              <label className="form-label">Master University Access Key</label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={adminForm.accessKey}
                  onChange={(e) => setAdminForm({ ...adminForm, accessKey: e.target.value })}
                  className="form-control"
                  placeholder="ADMIN-CAMPUS-2026"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-auth">
              Access University Control Tower
            </button>
          </form>
        )}

        {/* Delivo Divider */}
        <div className="divider">
          <span>Or instant demo access</span>
        </div>

        {/* Quick Demo Switcher Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '24px' }}>
          <button
            type="button"
            onClick={() => handleQuickLogin(Role.STUDENT)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '12px',
              borderRadius: '12px',
              background: 'rgba(26,26,26,0.6)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <Zap size={15} color="var(--primary)" />
            <span>Aarav (Student)</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickLogin(Role.VENDOR)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '12px',
              borderRadius: '12px',
              background: 'rgba(26,26,26,0.6)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <Store size={15} color="var(--primary)" />
            <span>Maggi Point</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickLogin(Role.RUNNER)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '12px',
              borderRadius: '12px',
              background: 'rgba(26,26,26,0.6)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <Bike size={15} color="var(--primary)" />
            <span>Kabir (Runner)</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickLogin(Role.ADMIN)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '12px',
              borderRadius: '12px',
              background: 'rgba(26,26,26,0.6)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <ShieldCheck size={15} color="var(--primary)" />
            <span>Campus Admin</span>
          </button>
        </div>

        {/* Footer info text */}
        <p className="signup-text">
          Campus Runner v2.0 • Gated University Network • <span style={{ color: 'var(--primary)', fontWeight: 600 }}>OTP Verified</span>
        </p>
      </div>
    </div>
  );
};
