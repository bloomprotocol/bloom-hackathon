"use client";

import React, { useState } from "react";
import Image from "@/components/Image";
import { useRouter } from "next/navigation";
import DiscoverOnboardingModal from "@/app/discover/DiscoverOnboardingModal";

interface PrivateBetaMainpageProps {
  // Future props can be added here
}

export default function PrivateBetaMainpage(props: PrivateBetaMainpageProps) {
  const router = useRouter();
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);

  const handleChoosePath = (path: 'supporter' | 'builder') => {
    // Only navigate for supporter path
    // Builder path stays in modal to show form
    if (path === 'supporter') {
      setShowOnboardingModal(false);
      router.push('/discover');
    }
    // For builder, modal stays open to show the form
  };

  return (
    <div className="pt-[30px] desktop:pt-[55px] justify-center px-4 desktop:px-0">
      {/* Caption */}
      <div className="text-center">
        <span className="text-neutral-700 text-2xl desktop:text-4xl font-['Outfit'] font-thin leading-[32px] desktop:leading-[48px]">
          Where Early Support
        </span>
        <div className="items-center justify-center flex">
          <span className="text-neutral-700 text-3xl desktop:text-6xl font-normal font-['Gilkys'] leading-[38px] desktop:leading-[76.80px]">
            Builds
          </span>

          <Image
            src="https://statics.bloomprotocol.ai/logo/bp-logo-pb-mainpage.png"
            width={95.35}
            height={95.35}
            alt="bloom protocol logo"
            className="w-12 h-12 desktop:w-24 desktop:h-24"
          />

          <span className="text-neutral-700 text-3xl desktop:text-6xl font-normal font-['Gilkys'] leading-[38px] desktop:leading-[76.80px]">
            Legends
          </span>
        </div>
        <span className="pt-[8px] desktop:pt-[12px] text-zinc-700 text-base desktop:text-xl font-light font-['Outfit']">
          Support hidden gems. Track progress. Earn early access.
        </span>
      </div>

      {/* CTA */}
      <div className="mt-[30px] desktop:mt-[40px] w-full desktop:w-[600px] max-w-[600px] relative rounded-[20px] flex flex-col overflow-hidden mx-auto">
        {/* Background layers */}

        <div className="absolute inset-0 bg-white/60 rounded-[20px] shadow-[0px_6px_10px_-4px_rgba(0,0,0,0.12)] backdrop-blur-[5px] -z-10" />

        {/* Content */}
        <div className="px-5 pt-5 pb-6 flex flex-col gap-5">
          {/* Title */}
          <div className="text-center">
            <h2 className="font-['Times'] font-bold text-[24px] text-[#393F49]">
              Start your Bloom journey
            </h2>
          </div>
          
          {/* Description */}
          <div className="text-center">
            <p className="font-['Outfit'] font-normal text-[14px] text-[#696f8c] tracking-[-0.28px] leading-[1.4]">
              Track your projects, join quests, and unlock supporter perks.
            </p>
          </div>
          
          {/* Dual CTAs: Side by Side */}
          <div className="flex flex-col desktop:flex-row gap-3 desktop:gap-4 justify-center items-center">
            {/* Primary CTA: Get Started */}
            <button
              onClick={() => setShowOnboardingModal(true)}
              className="w-full desktop:w-auto h-12 px-8 bg-gradient-to-r from-violet-500 to-purple-600 rounded-[27px] shadow-lg flex items-center justify-center gap-1.5 hover:from-violet-600 hover:to-purple-700 transition-all"
            >
              <span className="font-['Outfit'] font-semibold text-[16px] text-white leading-none">
                Get Started
              </span>
            </button>

            {/* Secondary CTA: Explore Projects */}
            <button
              onClick={() => router.push('/discover')}
              className="w-full desktop:w-auto h-12 px-8 bg-white/80 backdrop-blur-sm border-2 border-violet-300 rounded-[27px] shadow-md flex items-center justify-center gap-1.5 hover:bg-violet-50 hover:border-violet-400 transition-all"
            >
              <span className="font-['Outfit'] font-semibold text-[16px] text-violet-600 leading-none">
                Explore Projects
              </span>
            </button>
          </div>
        </div>
      
      </div>

      {/* Onboarding Modal */}
      <DiscoverOnboardingModal
        isOpen={showOnboardingModal}
        onClose={() => setShowOnboardingModal(false)}
        onChoosePath={handleChoosePath}
      />
    </div>
  );
}
