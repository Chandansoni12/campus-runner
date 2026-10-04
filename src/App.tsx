/**
 * Campus Runner — Master Campus Food Delivery Platform
 * Connecting Students, Stalls, Student Runners, and University Admin
 */

import React from 'react';
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
