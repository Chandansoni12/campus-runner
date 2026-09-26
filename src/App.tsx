/**
 * Campus Runner — Master Campus Food Delivery Platform
 * Connecting Students, Stalls, Student Runners, and University Admin
 */

import React from 'react';
import { useAppStore } from './store';
import { Role } from './types';
import { RoleSwitcherBar } from './components/common/RoleSwitcherBar';
import { StudentView } from './components/student/StudentView';
import { VendorView } from './components/vendor/VendorView';
import { RunnerView } from './components/runner/RunnerView';
import { AdminView } from './components/admin/AdminView';
import { LoginView } from './components/auth/LoginView';
import { ShieldCheck, Bike, Smartphone, LogOut } from 'lucide-react';

export default function App() {
  const { currentRole, isAuthenticated, logout } = useAppStore();

  if (!isAuthenticated) {
    return <LoginView />;
  }

  return (
    <div className="h-[100dvh] bg-[#090a0f] text-neutral-100 flex flex-col font-sans selection:bg-orange-500 selection:text-white relative overflow-hidden">
      {/* Global Ambient Background Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-orange-600/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Main View Router based on active role */}
      <main className="flex-1 w-full relative overflow-hidden flex flex-col">
        <div key={currentRole} className="animate-page-enter h-full w-full">
          {currentRole === Role.STUDENT && <StudentView />}
          {currentRole === Role.VENDOR && <VendorView />}
          {currentRole === Role.RUNNER && <RunnerView />}
          {currentRole === Role.ADMIN && <AdminView />}
        </div>
      </main>
    </div>
  );
}
