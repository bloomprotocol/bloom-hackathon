'use client';

import { BuilderDashboardProvider } from '../contexts/builder-dashboard-context';
import DashboardLayout from './dashboard-layout';

/**
 * Dashboard Content
 * Client component wrapper that provides context and background
 */
export default function DashboardContent() {
  return (
    <BuilderDashboardProvider>
      <>
        {/* Background */}
        <div className="fixed inset-0 bg-[url('https://statics.bloomprotocol.ai/images/body-light.jpg')] bg-cover bg-center bg-no-repeat -z-10" />

        {/* Content */}
        <div className="min-h-[calc(100vh-56px)] desktop:min-h-[calc(100vh-84px)] relative">
          <DashboardLayout />
        </div>
      </>
    </BuilderDashboardProvider>
  );
}
