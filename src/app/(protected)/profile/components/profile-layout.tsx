"use client";

import BackgroundImage from "@/components/BackgroundImage";
import PageContainer from "@/components/PageContainer";
import ProfileInfoCard from "./profile-info-card";
import ConnectedAccountsCard from "./connected-accounts-card";
import SettingsCard from "./settings-card";
import SidebarLinksCard from "./sidebar-links-card";

export default function ProfileLayout() {
  return (
    <>
      <BackgroundImage
        src="https://statics.bloomprotocol.ai/images/common-bgi.jpg"
        alt="Profile page background"
      />
      <PageContainer>
        {/* Hero Section */}
        <div className="mb-6">
          <div className="flex flex-col gap-[12px]">
            <h1 className="font-serif font-bold text-[24px] desktop:text-[32px] text-[#393f49] leading-[1.2] tracking-[-0.48px]">
              Profile Settings
            </h1>
            <p className="font-['Outfit'] font-normal text-[16px] desktop:text-[24px] text-[#696f8c] leading-[1.2]">
              Manage your account information and preferences
            </p>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="flex flex-col desktop:flex-row gap-6">
          {/* Left Column - Main Content */}
          <div className="flex-1 desktop:max-w-[728px] flex flex-col gap-6">
            <ProfileInfoCard />
            <ConnectedAccountsCard />
            <SettingsCard />
          </div>

          {/* Right Column - Sidebar */}
          <div className="w-full desktop:w-[340px] flex flex-col gap-6">
            <div className="desktop:sticky desktop:top-[120px] flex flex-col gap-6">
              <SidebarLinksCard />
            </div>
          </div>
        </div>
      </PageContainer>
    </>
  );
}
