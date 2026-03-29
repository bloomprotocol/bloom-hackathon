"use client";

import BreadcrumbNav from "./breadcrumb-nav";
import PaymentCards from "./payment-cards";
import ProfileCard from "./profile-card";
import HowItWorksCard from "./how-it-works-card";
import PublicPageToggleCard from "./public-page-toggle-card";

export default function X402Layout() {
  return (
    <>
      {/* Breadcrumb Navigation */}
      <BreadcrumbNav />

      {/* Hero Section - Dynamic Title */}
      <div className="mt-4 mb-6">
        <div className="flex flex-col gap-[12px]">
          <h1 className="font-serif font-bold text-[24px] desktop:text-[32px] text-[#393f49] leading-[1.2] tracking-[-0.48px]">
            Your X402 Settings
          </h1>
          <p className="font-['Outfit'] font-normal text-[16px] desktop:text-[24px] text-[#696f8c] leading-[1.2]">
            View your links and manage your wallet settings
          </p>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="flex flex-col desktop:flex-row gap-6">
        {/* Left Column - Payment Cards */}
        <div className="flex-1 desktop:max-w-[728px]">
          <PaymentCards />
        </div>

        {/* Right Column - How It Works + Toggle + Profile Card */}
        <div className="w-full desktop:w-[340px] flex flex-col gap-6">
          <div className="desktop:sticky desktop:top-[120px] flex flex-col gap-6">
            <HowItWorksCard />
            <PublicPageToggleCard />
            <ProfileCard />
          </div>
        </div>
      </div>
    </>
  );
}
