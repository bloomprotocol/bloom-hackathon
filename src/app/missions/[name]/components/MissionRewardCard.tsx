"use client";

import { useMemo } from "react";
import { ProfileSelectedMission } from "@/lib/api/services/profileService";

export interface MissionRewardCardProps {
  mission: ProfileSelectedMission | null;
  onClaimReward: () => void;
  isProcessing?: boolean;
  className?: string;
}

// Reward card configuration
const rewardConfig = {
  header: "Rewards",
  buttons: {
    claim: "Claim Rewards",
    claimed: "Claimed",
    completeTasks: "Complete all tasks",
    noMission: "No mission selected"
  }
};

export function MissionRewardCard({
  mission,
  onClaimReward,
  isProcessing = false,
}: MissionRewardCardProps) {

  // 找到可领取的 reward（canClaim === true）
  const claimableReward = useMemo(() => {
    if (!mission?.rewards) return null;
    return mission.rewards.find((r: any) => r.canClaim === true) || null;
  }, [mission]);

  // 要展示的 rewards：有可领取的就只展示那个，否则展示全部（灰色）
  const rewardItems = useMemo(() => {
    if (!mission?.rewards) return [];
    if (claimableReward) {
      return [claimableReward];
    }
    return mission.rewards;
  }, [mission, claimableReward]);

  // 是否有可领取的 reward
  const hasClaimable = !!claimableReward;

  // Is reward claimed
  const isRewardClaimed = mission?.claimed || false;

  // Calculate claim button state
  const getClaimButtonState = useMemo(() => {
    // No mission selected
    if (!mission) {
      return 'unavailable';
    }

    // Already claimed
    if (isRewardClaimed) {
      return 'claimed';
    }

    // 使用後端返回的 canClaim 判斷（已考慮 optional task 等邏輯）
    if (hasClaimable) {
      return 'available';
    }

    return 'locked';
  }, [mission, isRewardClaimed, hasClaimable]);

  // Button configuration based on state
  const getClaimButtonConfig = (state: string) => {
    switch (state) {
      case 'claimed':
        return {
          disabled: true,
          opacity: 0.7,
          text: rewardConfig.buttons.claimed,
          onClick: () => {}
        };
      case 'available':
        return {
          disabled: isProcessing,
          opacity: isProcessing ? 0.7 : 1,
          text: isProcessing ? "Processing..." : rewardConfig.buttons.claim,
          onClick: onClaimReward
        };
      case 'locked':
        return {
          disabled: true,
          opacity: 0.5,
          text: rewardConfig.buttons.completeTasks,
          onClick: () => {}
        };
      case 'unavailable':
        return {
          disabled: true,
          opacity: 0.3,
          text: rewardConfig.buttons.noMission,
          onClick: () => {}
        };
      default:
        return {
          disabled: true,
          opacity: 0.5,
          text: rewardConfig.buttons.claim,
          onClick: () => {}
        };
    }
  };

  const claimButtonState = getClaimButtonState;
  const claimButtonConfig = getClaimButtonConfig(claimButtonState);

  return (
    <div 
      className="common-container-style flex w-full desktop:w-[320px] flex-col items-start gap-4"
    >
      {/* Title */}
      <div className="text-[20px] font-bold text-[#393f49]" style={{ fontFamily: 'Times, serif' }}>
        {rewardConfig.header}
      </div>

      {/* Reward list - Figma style inline display */}
      <div className="flex flex-col gap-2 w-full">
        {rewardItems.map((reward, index) => (
          <div
            key={index}
            className="flex items-center gap-1"
          >
            {/* Water drop icon with gradient */}
            <div className="w-5 h-5 relative">
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{
                  background: hasClaimable
                    ? 'linear-gradient(130deg, #74FFDE 1%, #00DE73 25%, #41F09C 50%, #03D26E 75%, #00C466 97%)'
                    : '#9CA3AF',
                  boxShadow: '0px 3.33px 8.33px rgba(222, 228, 235, 0.25)',
                  mask: 'url(https://statics.bloomprotocol.ai/logo/water-drop-icon.svg) center/contain no-repeat',
                  WebkitMask: 'url(https://statics.bloomprotocol.ai/logo/water-drop-icon.svg) center/contain no-repeat'
                }}
              />
            </div>
            {/* Reward amount */}
            <div
              className={`text-[14px] font-medium leading-[16.8px] ${hasClaimable ? 'text-[#393f49]' : 'text-gray-400'}`}
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              {reward.amount || '0'}
            </div>
            {/* Reward name */}
            <div
              className={`text-[14px] font-light leading-[19.6px] ${hasClaimable ? 'text-[#696f8c]' : 'text-gray-400'}`}
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              {reward.name || 'Drops'}
            </div>
          </div>
        ))}

        {rewardItems.length === 0 && (
          <div className="text-gray-500 text-center">
            No rewards available
          </div>
        )}
      </div>
      
      {/* Claim button */}
      <button 
        className={`flex h-[38px] px-5 py-[10px] justify-center items-center gap-1 self-stretch rounded-[27px] font-semibold transition-all text-[14px]
          ${claimButtonState === 'available' 
            ? 'bg-[#EB7CFF] text-white shadow-[0px_4px_0px_-1px_#B97BC4]' 
            : claimButtonConfig.disabled 
              ? 'bg-gray-300 cursor-not-allowed' 
              : 'bg-gray-400 text-white'
          }`}
        onClick={claimButtonConfig.onClick}
        disabled={claimButtonConfig.disabled}
        style={{ opacity: claimButtonConfig.opacity, fontFamily: 'Outfit, sans-serif' }}
      >
        {claimButtonConfig.text}
      </button>
    </div>
  );
}