"use client";

import RoleContent from "./role-content";
import SupporterProgress from "./supporter-progress";
import TierIdentityCard from "./tier-identity-card";
import PledgePowerCard from "./pledge-power-card";
import MyPledgesCard from "./my-pledges-card";
import SeedPassUnlockCard from "./seed-pass-unlock-card";
import IdentityCardsCarousel from "./identity-cards-carousel";
import DashboardPreview from "./dashboard-preview";
import DashboardGrowthCTA from "./dashboard-growth-cta";
import AgentPledges from "./agent-pledges";
import { useSeedPassProgress } from "@/hooks/usePledges";
import { useAuth } from "@/lib/context/AuthContext";

export default function SupporterLayout() {
  const { user } = useAuth();
  const { data: seedPassProgress } = useSeedPassProgress(!!user);

  // Check if user has unlocked Seed Pass
  const hasUnlockedSeedPass = seedPassProgress?.isUnlocked ?? false;

  // Show preview for non-logged-in users
  if (!user) {
    return <DashboardPreview />;
  }

  // Show full dashboard for logged-in users
  return (
    <div className="space-y-8 -mr-6">
      {/* Top Section: Achievement Showcase + Current Status */}
      <div className="flex flex-col desktop:flex-row gap-6 desktop:gap-16 desktop:items-start">
        {/* Left: Cover Flow - Achievement Collection with atmospheric background */}
        <div className="w-full desktop:flex-1 desktop:max-w-[calc(100%-360px)]">
          <IdentityCardsCarousel />
        </div>

        {/* Right: Status Card - Current Level & Progress (Pushed to right edge) */}
        <div className="w-full desktop:w-[320px] desktop:shrink-0 desktop:ml-auto desktop:mr-6 space-y-6">
          {!hasUnlockedSeedPass ? (
            // Show Seed Pass unlock progress for users who haven't unlocked yet
            <SeedPassUnlockCard />
          ) : (
            // Show identity and pledge cards for users who have unlocked Seed Pass
            <>
              <TierIdentityCard />
              <PledgePowerCard />
              <MyPledgesCard />
            </>
          )}
          {/* Agent Pledges — x402 escrow-backed skill pledges */}
          <AgentPledges />
          {/* Growth loop CTAs — always visible */}
          <DashboardGrowthCTA />
        </div>
      </div>

      {/* Quick Actions Hub - Full Width */}
      <div>
        <h2 className="font-serif font-bold text-2xl text-[#393f49] mb-4">Quick Actions</h2>
        <RoleContent />
      </div>

      {/* Progress Section - Full Width (includes all activity types) */}
      <SupporterProgress />
    </div>
  );
}
