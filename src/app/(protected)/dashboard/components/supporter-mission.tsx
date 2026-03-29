"use client";
import clsx from "clsx";
import Image from "next/image";
import { useState, useMemo } from "react";
import { useRoleContentContext } from "../contexts/role-content-context";
import { useUserInfo } from "@/app/(protected)/dashboard/contexts/user-info-context";
import { useRouter } from "next/navigation";
import { dashboardContent } from "../content.config";
import { DEFAULT_MISSION_IMAGE } from "@/lib/utils/missionUtils";

// Mission button configuration by display status
type MissionButtonConfig = {
  text: string;
  className: string;
  disabled: boolean;
  hasOverlay: boolean;
};

const MISSION_BUTTON_CONFIG: Record<string, MissionButtonConfig> = {
  active: {
    text: 'View Mission',
    className: 'bg-[#eb7cff] text-white hover:bg-[#E563FF] shadow-[0px_1px_1px_0.05px_rgba(24,24,27,0.24)] transition-colors px-[20px] py-[10px] font-semibold text-[14px] leading-none',
    disabled: false,
    hasOverlay: true,
  },
  waiting: {
    text: 'Pending',
    className: 'bg-gray-300 text-gray-500 cursor-not-allowed h-[34px] px-4 py-2.5 text-sm',
    disabled: true,
    hasOverlay: false,
  },
  claimable: {
    text: 'Claim Reward',
    className: 'bg-[#71ca41] text-white hover:bg-[#5fb532] shadow-[0px_1px_1px_0.05px_rgba(24,24,27,0.24)] transition-colors px-[20px] py-[10px] font-semibold text-[14px] leading-none',
    disabled: false,
    hasOverlay: true,
  },
  claimed: {
    text: 'Claimed',
    className: 'bg-gray-300 text-gray-500 cursor-not-allowed h-[34px] px-4 py-2.5 text-sm',
    disabled: true,
    hasOverlay: false,
  },
  failed: {
    text: 'Failed',
    className: 'bg-red-100 text-red-500 cursor-not-allowed h-[34px] px-4 py-2.5 text-sm',
    disabled: true,
    hasOverlay: false,
  },
};

export const SupporterMission = () => {
  const { userInfo, missions } = useUserInfo();
  const router = useRouter();
  const { isMobile, onCloseMobile } = useRoleContentContext();
  const [isShaking, setIsShaking] = useState(false);
  const [copied, setCopied] = useState(false);

  // Process missions data with dynamic images from API
  const missionCards = useMemo(() => {
    if (!missions || missions.length === 0) {
      // Return loading state or empty state
      return [];
    }
    
    // Map real missions data with dynamic images, using fallback if not provided
    return missions.map((mission) => ({
      id: mission.id,
      title: mission.title,
      description: mission.description,
      slug: mission.slug,
      image: mission.imageUrl || DEFAULT_MISSION_IMAGE,
      isUpcoming: mission.status === 'Upcoming',
      status: mission.status,
      claimed: mission.claimed,
      canClaim: mission.canClaim,
      displayStatus: mission.displayStatus,
      missionType: mission.missionType,
    }));
  }, [missions]);

  // 根據 mission type 生成正確的 URL
  const getMissionUrl = (mission: { slug: string; missionType?: string | null }) => {
    if (mission.missionType === 'social_mission') {
      return `/social-missions/${mission.slug}`;
    }
    return `/missions/${mission.slug}`;
  };

  // 生成推薦連結
  const getReferralUrl = () => {
    if (!userInfo?.referralCode) return 'Loading...';
    if (typeof window === 'undefined') return `/?code=${userInfo.referralCode}`;
    return `${window.location.origin}/?code=${userInfo.referralCode}`;
  };

  // 複製推薦連結
  const copyReferralUrl = () => {
    if (userInfo?.referralCode) {
      navigator.clipboard.writeText(getReferralUrl());
      // Trigger shake animation
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 400);
      // Show copied feedback
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="common-container-style flex flex-col gap-4 w-full">
      {/* Header */}
        <div className="self-stretch justify-between items-center inline-flex">
          <div className="text-[#393F49] text-[20px] font-serif font-bold leading-[24px]">
            {dashboardContent.dashboardRoleContent.headers.mission}
          </div>
        </div>
        
        {/* Mission Cards */}
        <section className="flex flex-row gap-4 overflow-x-auto overflow-y-visible scroll-smooth snap-x snap-mandatory pr-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none]">
          {missionCards.length === 0 ? (
            // Loading state - show 3 skeleton cards
            Array.from({ length: 3 }).map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className="flex-1 common-plp-card-style justify-start items-center gap-4 opacity-70"
              >
                <div className="relative h-[176px] w-full desktop:h-[208px] desktop:w-[208px] rounded-[12px] bg-gray-200 animate-pulse" />
                <div className="flex-1 flex flex-col gap-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4" />
                </div>
                <div className="w-full space-y-1">
                  <div className="h-2 bg-gray-200 rounded-full animate-pulse" />
                  <div className="flex justify-between">
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-16" />
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-10" />
                  </div>
                </div>
                <div className="w-full h-[34px] bg-gray-200 rounded-[27px] animate-pulse" />
              </div>
            ))
          ) : (
            missionCards.map((mission) => (
            <div
              key={mission.id}
              id="mission-card"
              className="flex-none w-[208px] desktop:flex-1 desktop:w-auto common-plp-card-style justify-start items-center gap-4 snap-center cursor-pointer"
              onClick={() => {
                router.push(getMissionUrl(mission));
                if (isMobile && onCloseMobile) {
                  onCloseMobile();
                }
              }}
            >
              {/* Mission image */}
              <div className="relative h-[176px] w-full desktop:h-[208px] desktop:w-[208px] rounded-[12px] overflow-hidden">
                <Image
                  src={mission.image}
                  alt={mission.title}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    // If image fails to load, use the default mission image
                    const imgElement = e.target as HTMLImageElement;
                    imgElement.src = DEFAULT_MISSION_IMAGE;
                  }}
                />
              </div>

              {/* Mission info */}
              <div className="flex-1 flex flex-col gap-2">
                <h3 className="font-semibold text-sm text-center line-clamp-1">{mission.title}</h3>
                <p className="text-xs text-gray-600 line-clamp-1 text-center">
                  {mission.description}
                </p>
              </div>

              {/* CTA Button based on displayStatus */}
              {(() => {
                const config = MISSION_BUTTON_CONFIG[mission.displayStatus || ''] || MISSION_BUTTON_CONFIG.active;
                return (
                  <button
                    onClick={config.disabled ? undefined : (e) => {
                      e.stopPropagation();
                      router.push(getMissionUrl(mission));
                      if (isMobile && onCloseMobile) {
                        onCloseMobile();
                      }
                    }}
                    className={`w-full rounded-[27px] flex items-center justify-center ${config.disabled ? '' : 'relative'} ${config.className}`}
                    disabled={config.disabled}
                  >
                    {config.text}
                    {config.hasOverlay && (
                      <div className="absolute inset-0 pointer-events-none shadow-[0px_2px_0px_0px_inset_rgba(255,255,255,0.1),0px_8px_16px_0px_inset_rgba(255,255,255,0.16)] rounded-[27px]" />
                    )}
                  </button>
                );
              })()}
            </div>
          ))
          )}
        </section>

        {/* Referral Section - Hidden temporarily */}
        {/* <div className="self-stretch p-3 relative bg-[#F6F6F6] overflow-hidden rounded-xl justify-start items-center gap-4 inline-flex">
          <div className="flex-1 relative flex-col justify-start items-start gap-3 inline-flex">
            <div className="text-[#393F49] text-sm font-semibold font-['Outfit'] leading-[16.8px]">Share Bloom</div>

            <div className="self-stretch h-11 p-3 bg-white/60 shadow-[0px_0px_12px_0px_rgba(0,0,0,0.08)] rounded-xl outline outline-1 outline-offset-[-1px] outline-white justify-start items-center gap-4 inline-flex">
              <div className="flex-1 text-[#393F49] text-sm font-normal font-['Outfit'] leading-[19.6px]">
                {getReferralUrl()}
              </div>
              {copied && (
                <span className="text-xs text-green-600 font-medium animate-fade-in">
                  Copied!
                </span>
              )}
              <button
                onClick={copyReferralUrl}
                className={clsx(
                  "w-4 h-4 relative hover:opacity-70 transition-opacity",
                  isShaking && "shake-animation"
                )}
              >
                <Image
                  src="https://statics.bloomprotocol.ai/icon/yoona-copy.png"
                  alt="Copy"
                  width={16}
                  height={16}
                />
              </button>
            </div>

            <div className="justify-start items-center gap-2 inline-flex">
              <div className="text-[#393F49] text-xs font-medium font-['Outfit'] leading-[16.8px]">You get drops for link clicks or sign-ups.</div>
            </div>
          </div>
        </div> */}
    </div>
  );
};
export default SupporterMission;
