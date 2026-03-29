'use client';

import { useBuilderDashboard } from '../contexts/builder-dashboard-context';
import ConnectXPrompt from './connect-x-prompt';
import NoMissionsPrompt from './no-missions-prompt';
import ImportantNote from './important-note';
import OverviewCard from './overview-card';
import SocialMissionsCard from './social-missions-card';
import SkillClaimCard from './skill-claim-card';
import FundsCard from './funds-card';
import PerksConfigCard from './perks-config-card';
import ExperimentServicesCard from './experiment-services-card';
import GitHubConnectCard from './github-connect-card';

/**
 * Dashboard Layout
 * Main layout component that renders different states based on user role
 */
export default function DashboardLayout() {
  const { dashboardState, connectedAccount, handleDisconnectX } = useBuilderDashboard();

  // State 1: X Account Not Connected (visitor or USER role)
  if (dashboardState === 'not_connected') {
    return (
      <div className="mx-auto max-w-[1440px] w-full px-4 desktop:px-40 desktop:pt-6 desktop:pb-20 mobile:pt-6 mobile:pb-10">
        <ConnectXPrompt />
      </div>
    );
  }

  // State 2: X Connected, No Missions
  if (dashboardState === 'no_missions') {
    return (
      <div className="mx-auto max-w-[1440px] w-full px-4 desktop:px-40 desktop:pt-6 desktop:pb-20 mobile:pt-6 mobile:pb-10">
        <NoMissionsPrompt />
      </div>
    );
  }

  // State 3: Has Missions - Full Dashboard (BUILDER role)
  return (
    <div className="mx-auto max-w-[1440px] w-full px-4 desktop:px-40 desktop:pt-6 desktop:pb-20 mobile:pt-6 mobile:pb-10">
      {/* Dashboard Header */}
      <div className="flex items-center justify-between mb-6">
        <h1
          className="text-[24px] desktop:text-[28px] font-bold text-[#393f49]"
          style={{ fontFamily: 'Times, serif' }}
        >
          Builder Dashboard
        </h1>
        {connectedAccount && (
          <div className="flex items-center gap-3">
            {connectedAccount.profileImageUrl ? (
              <img
                src={connectedAccount.profileImageUrl}
                alt=""
                className="w-7 h-7 rounded-full"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-[#f0eefb] flex items-center justify-center">
                <span className="text-[#8478e0] text-[11px] font-bold" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {connectedAccount.xUsername?.[0]?.toUpperCase() || '?'}
                </span>
              </div>
            )}
            <span
              className="text-[14px] text-[#393f49] font-medium"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              @{connectedAccount.xUsername}
            </span>
            <button
              onClick={handleDisconnectX}
              className="text-[13px] text-[#696f8c] hover:text-[#8478e0] transition-colors"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              Disconnect
            </button>
          </div>
        )}
      </div>

      {/* Important Note - Full width, above columns */}
      <ImportantNote />

      {/* Two column layout */}
      <div className="flex flex-col desktop:flex-row gap-6">
        {/* Left column - Main content */}
        <div className="w-full desktop:w-[calc(100%-320px-24px)] space-y-5">
          {/* Overview */}
          <OverviewCard />

          {/* Social Missions */}
          <SocialMissionsCard />

          {/* GitHub Identity + Skill Claims */}
          <GitHubConnectCard />
          <SkillClaimCard />

          {/* Mobile only - Funds, Perks, Quick Links */}
          <div className="desktop:hidden space-y-5">
            <FundsCard />
            <PerksConfigCard />
            <ExperimentServicesCard />
          </div>
        </div>

        {/* Right column - Sidebar (320px) */}
        <div className="hidden desktop:block desktop:w-[320px] space-y-6">
          <FundsCard />
          <PerksConfigCard />
          <ExperimentServicesCard />
        </div>
      </div>
    </div>
  );
}
