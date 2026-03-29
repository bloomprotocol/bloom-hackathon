"use client";

import { useMemo } from "react";

// Format number with fixed locale to avoid hydration mismatch
const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num);
};

interface MissionRewardTiersCardProps {
  rewardTiers?: Array<{
    _id: string;
    name: string;
    drops: number;
    iconUrl: string;
    description: string;
    order: number;
  }>;
  className?: string;
}

// Default tier icons based on display order
const defaultTierIcons = {
  1: 'https://statics.bloomprotocol.ai/icon/reward-star.png',
  2: 'https://statics.bloomprotocol.ai/icon/reward-diamond.png',
  3: 'https://statics.bloomprotocol.ai/icon/reward-crown.png'
};

// Get tier configuration based on name and order
const getTierConfig = (tierName: string, order: number) => {
  const normalizedName = tierName.toLowerCase();
  
  // Determine background color based on tier name or order
  let bgColor = '#71ca41'; // Default green
  let displayName = tierName;
  
  if (normalizedName.includes('basic')) {
    bgColor = '#71ca41';
    displayName = 'Basic Analysis';
  } else if (normalizedName.includes('quality')) {
    bgColor = '#8478e0';
    displayName = 'Quality Analysis';
  } else if (normalizedName.includes('premium')) {
    bgColor = '#eb7cff';
    displayName = 'Premium Analysis';
  } else {
    // Fallback based on order
    if (order === 2) {
      bgColor = '#8478e0';
    } else if (order === 3) {
      bgColor = '#eb7cff';
    }
  }
  
  return {
    bgColor,
    displayName
  };
};

export function MissionRewardTiersCard({ 
  rewardTiers = [],
  className = ""
}: MissionRewardTiersCardProps) {
  
  // Sort tiers by order (business rule protection)
  const sortedTiers = useMemo(() => {
    if (!Array.isArray(rewardTiers)) return [];
    return [...rewardTiers].sort((a, b) => (a?.order || 0) - (b?.order || 0));
  }, [rewardTiers]);

  return (
    <div className={`backdrop-blur-[5px] bg-white/50 flex w-full desktop:w-[320px] flex-col gap-4 items-start justify-start p-5 rounded-2xl shadow-[0px_6px_10px_-4px_rgba(0,0,0,0.12),0px_0px_0px_1px_rgba(0,0,0,0.05)] ${className}`}>
      {/* Header - Figma specific typography */}
      <div className="flex flex-col gap-2 w-full">
        <div className="font-bold text-[#393f49] text-[18px] leading-none" style={{ fontFamily: 'Times, serif' }}>
          Reward Tiers
        </div>
      </div>

      {/* Tier List - Figma design specification */}
      <div className="flex flex-col gap-3 w-full">
        {sortedTiers.length > 0 ? (
          sortedTiers.map((tier, index) => {
            const config = getTierConfig(tier.name, tier.order || index + 1);
            // Use tier's iconUrl if available, otherwise use default based on order
            const iconUrl = tier.iconUrl || defaultTierIcons[tier.order as keyof typeof defaultTierIcons] || defaultTierIcons[1];
            
            return (
              <div 
                key={tier._id || `tier-${index}`} 
                className="flex items-center justify-between w-full"
              >
                {/* Left side: Badge + Name */}
                <div className="flex gap-2 items-center">
                  {/* Tier Badge with icon */}
                  <div className="flex items-center justify-center size-5">
                    <img 
                      src={iconUrl}
                      alt=""
                      className="w-4 h-4 object-contain"
                    />
                  </div>
                  
                  {/* Tier Name */}
                  <div 
                    className="text-[#696f8c] text-[14px] leading-tight tracking-[-0.28px]" 
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  >
                    {config.displayName}
                  </div>
                </div>
                
                {/* Right side: Drops Amount */}
                <div className="flex items-center gap-1">
                  {/* Water drop icon */}
                  <div className="relative size-5">
                    <img 
                      src="https://statics.bloomprotocol.ai/logo/water-drop-icon.svg"
                      alt=""
                      className="w-full h-full"
                    />
                  </div>
                  
                  {/* Drops number */}
                  <div
                    className="font-medium text-[#393f49] text-[14px] leading-none"
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  >
                    {formatNumber(tier.drops || 0)}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-[14px] text-gray-500 text-center py-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
            No reward tiers available
          </div>
        )}
      </div>
    </div>
  );
}