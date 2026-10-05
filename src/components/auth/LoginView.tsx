import React, { useState, useEffect } from 'react';
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
  AlertTriangle,
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const {
    loginAsRole,
    users,
    vendors,
    setCurrentUser,
    setActiveVendorId,
    setActiveRunnerId,
    pendingRoleSwitch,
    cancelRoleSwitch,
    currentRole,
  } = useAppStore();

  const [selectedRole, setSelectedRole] = useState<Role>(pendingRoleSwitch || currentRole || Role.STUDENT);
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Sync selectedRole if a portal switch request is triggered
  useEffect(() => {
    if (pendingRoleSwitch) {
      setSelectedRole(pendingRoleSwitch);
      setAuthError(null);
    }
  }, [pendingRoleSwitch]);

  // Form states
  const [studentForm, setStudentForm] = useState({
    hostelBlock: 'Aryabhatta Hall (Block A)',
    roomNumber: 'A-204',
    phone: '9876543210',
    pin: '1234',
  });

  const [vendorForm, setVendorForm] = useState({
    vendorId: vendors[0]?.id || 'vendor-1',
    pin: '1234',
  });

  const [runnerForm, setRunnerForm] = useState({
    runnerId: users.find((u) => u.role === Role.RUNNER)?.id || 'runner-1',
    passcode: '8888',
  });

  const [adminForm, setAdminForm] = useState({
    accessKey: 'ADMIN-CAMPUS-2026',
  });

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    // Verify Student PIN
    if (studentForm.pin.trim() !== '1234') {
      setAuthError('Incorrect Student PIN! Default demo PIN is 1234.');
      return;
    }

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
    setAuthError(null);

    // Verify Kitchen PIN
    if (vendorForm.pin.trim() !== '1234') {
      setAuthError('Incorrect Kitchen PIN! Default demo PIN is 1234.');
      return;
    }

    setActiveVendorId(vendorForm.vendorId);
    loginAsRole(Role.VENDOR);
  };

  const handleRunnerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    // Verify Runner Passcode
    if (runnerForm.passcode.trim() !== '8888') {
      setAuthError('Incorrect Runner Passcode! Default demo Passcode is 8888.');
      return;
    }

    setActiveRunnerId(runnerForm.runnerId);
    loginAsRole(Role.RUNNER);
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    // Verify Admin Master Key
    if (adminForm.accessKey.trim() !== 'ADMIN-CAMPUS-2026') {
      setAuthError('Incorrect Master Access Key! (Demo Key: ADMIN-CAMPUS-2026)');
      return;
    }

    loginAsRole(Role.ADMIN);
  };

  const handleQuickSelect = (role: Role) => {
    setSelectedRole(role);
    setAuthError(null);
    if (role === Role.STUDENT) {
      setStudentForm({
        hostelBlock: 'Aryabhatta Hall (Block A)',
        roomNumber: 'A-204',
        phone: '9876543210',
        pin: '1234',
      });
    } else if (role === Role.VENDOR) {
      setVendorForm({
        vendorId: vendors[0]?.id || 'vendor-1',
        pin: '1234',
      });
    } else if (role === Role.RUNNER) {
      setRunnerForm({
        runnerId: users.find((u) => u.role === Role.RUNNER)?.id || 'runner-1',
        passcode: '8888',
      });
    } else if (role === Role.ADMIN) {
      setAdminForm({
        accessKey: 'ADMIN-CAMPUS-2026',
      });
    }
  };

  return (
    <div className="auth-screen">
      <div
        className="auth-content"
        style={{
          paddingTop: 'calc(24px + var(--sat, 0px))',
          paddingBottom: 'calc(32px + var(--sab, 0px))',
        }}
      >
        {/* Portal Switch Verification Notice (shown when switching roles from another portal) */}
        {pendingRoleSwitch ? (
          <div
            style={{
              marginBottom: '20px',
              padding: '12px 14px',
              borderRadius: '16px',
              backgroundColor: 'rgba(253, 105, 49, 0.12)',
              border: '1px solid rgba(253, 105, 49, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lock size={16} color="#FD6931" style={{ flexShrink: 0 }} />
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#FFFFFF' }}>
                Verify password to access <span style={{ color: '#FD6931' }}>{pendingRoleSwitch}</span> Portal
              </span>
            </div>
            <button
              type="button"
              onClick={cancelRoleSwitch}
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#FFFFFF',
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                border: 'none',
                padding: '5px 12px',
                borderRadius: '8px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              Cancel
            </button>
          </div>
        ) : (
          <>
            <h1 className="auth-title">
              Welcome Back! <span className="wave-icon">👋</span>
            </h1>
            <p className="auth-subtitle">
              Campus Runner — Lightning food delivery inside university gates
            </p>
          </>
        )}

        {/* Delivo Role Switcher Tabs */}
        <div style={{ marginBottom: '24px' }}>
          <label
            className="form-label"
            style={{
              fontSize: 'var(--font-12)',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
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
                  onClick={() => {
                    setSelectedRole(role);
                    setAuthError(null);
                  }}
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
                  <Icon
                    style={{
                      width: '18px',
                      height: '18px',
                      marginBottom: '4px',
                      color: isSelected ? '#FD6931' : '#8E8E93',
                    }}
                  />
                  <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '-0.01em' }}>
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Error notification */}
        {authError && (
          <div
            style={{
              marginBottom: '16px',
              padding: '10px 14px',
              borderRadius: '12px',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#F87171',
              fontSize: '12.5px',
              fontWeight: 600,
            }}
          >
            <AlertTriangle size={16} style={{ flexShrink: 0 }} />
            <span>{authError}</span>
          </div>
        )}

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
                  <option value="Aryabhatta Hall (Block A)" style={{ background: '#1A1A1A' }}>
                    Aryabhatta Hall (Block A)
                  </option>
                  <option value="Bhaskara Hall (Block B — Strict Veg)" style={{ background: '#1A1A1A' }}>
                    Bhaskara Hall (Block B — Strict Veg)
                  </option>
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

            <div className="form-group" style={{ marginTop: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label className="form-label" style={{ margin: 0 }}>Student Security PIN</label>
                <span style={{ fontSize: '11px', color: '#FD6931', fontWeight: 600 }}>Default PIN: 1234</span>
              </div>
              <div className="password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={studentForm.pin}
                  onChange={(e) => setStudentForm({ ...studentForm, pin: e.target.value })}
                  className="form-control"
                  placeholder="Enter 4-digit PIN (1234)"
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

            <button type="submit" className="btn btn-primary btn-auth" style={{ marginTop: '12px' }}>
              Verify & Enter Student Portal
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
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label className="form-label" style={{ margin: 0 }}>Kitchen PIN</label>
                <span style={{ fontSize: '11px', color: '#FD6931', fontWeight: 600 }}>Default PIN: 1234</span>
              </div>
              <div className="password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={vendorForm.pin}
                  onChange={(e) => setVendorForm({ ...vendorForm, pin: e.target.value })}
                  className="form-control"
                  placeholder="Enter 4-digit Kitchen PIN"
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
              Verify & Enter Kitchen Dashboard
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
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label className="form-label" style={{ margin: 0 }}>Runner Passcode</label>
                <span style={{ fontSize: '11px', color: '#10B981', fontWeight: 600 }}>Default: 8888</span>
              </div>
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
              Verify & Enter Runner Portal
            </button>
          </form>
        )}

        {/* ─── ADMIN FORM ─── */}
        {selectedRole === Role.ADMIN && (
          <form className="auth-form" onSubmit={handleAdminSubmit}>
            <div className="form-group">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label className="form-label" style={{ margin: 0 }}>Master University Access Key</label>
                <span style={{ fontSize: '10.5px', color: '#A855F7', fontWeight: 600 }}>Key: ADMIN-CAMPUS-2026</span>
              </div>
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
              Verify & Enter Control Tower
            </button>
          </form>
        )}

        {/* Delivo Divider */}
        <div className="divider">
          <span>Or quick-select demo profile</span>
        </div>

        {/* Quick Demo Switcher Buttons - Autofills credentials for verification */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '24px' }}>
          <button
            type="button"
            onClick={() => handleQuickSelect(Role.STUDENT)}
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
            onClick={() => handleQuickSelect(Role.VENDOR)}
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
            onClick={() => handleQuickSelect(Role.RUNNER)}
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
            <span>Vikram (Runner)</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickSelect(Role.ADMIN)}
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
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            flexWrap: 'wrap',
            marginTop: '24px',
            fontSize: '11px',
            color: 'var(--text-muted)',
          }}
        >
          <span>Campus Runner v2.0</span>
          <span>•</span>
          <span>Gated Campus Network</span>
          <span>•</span>
          <span style={{ color: 'var(--primary)', fontWeight: 700 }}>Password Verified</span>
        </div>
      </div>
    </div>
  );
};
