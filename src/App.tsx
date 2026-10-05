/**
 * Campus Runner — Master Campus Food Delivery Platform
 * Connecting Students, Stalls, Student Runners, and University Admin
 */

import React, { useState, useEffect } from 'react';
import { useAppStore } from './store';
import { Role } from './types';
import { StudentView } from './components/student/StudentView';
import { VendorView } from './components/vendor/VendorView';
import { RunnerView } from './components/runner/RunnerView';
import { AdminView } from './components/admin/AdminView';
import { LoginView } from './components/auth/LoginView';
import { TopPortalNav } from './components/common/TopPortalNav';

export default function App() {
  const { currentRole, isAuthenticated } = useAppStore();
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    // Check if store has already hydrated from localStorage
    if (useAppStore.persist.hasHydrated()) {
      setHasHydrated(true);
    } else {
      const unsub = useAppStore.persist.onFinishHydration(() => {
        setHasHydrated(true);
      });
      return () => unsub();
    }
  }, []);

  // Show a seamless Delivo loader while rehydrating persistent session
  if (!hasHydrated) {
    return (
      <div className="home-screen-wrapper">
        <div
          className="home-screen"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#090A0F',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                border: '3px solid rgba(253, 105, 49, 0.2)',
                borderTopColor: '#FD6931',
                animation: 'spin 0.8s linear infinite',
              }}
            />
            <span
              style={{
                fontSize: '12px',
                fontWeight: 800,
                color: 'rgba(255,255,255,0.7)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                fontFamily: 'system-ui, sans-serif',
              }}
            >
              Campus Runner
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginView />;
  }

  return (
    <div className="home-screen-wrapper">
      <div className="home-screen">
        <TopPortalNav />
        {currentRole === Role.STUDENT && <StudentView />}
        {currentRole === Role.VENDOR && <VendorView />}
        {currentRole === Role.RUNNER && <RunnerView />}
        {currentRole === Role.ADMIN && <AdminView />}
      </div>
    </div>
  );
}
