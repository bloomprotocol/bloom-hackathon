"use client";

import Image from "next/image";
import { useMemo } from "react";
import useCountdown from "@/lib/hooks/useCountdown";
import { ProfileSelectedMission } from "@/lib/api/services/profileService";
import { isMissionExpired, DEFAULT_MISSION_IMAGE } from "@/lib/utils/missionUtils";

export interface MissionCardProps {
  mission: ProfileSelectedMission | null;
  className?: string;
}

// Time unit labels
const timeUnits = {
  days: "D",
  hours: "H", 
  minutes: "M",
  seconds: "S"
};

// Default mission data
const defaultMission = {
  title: "Welcome to Bloom Protocol",
  status: "Live",
  description: "Start your journey with Bloom Protocol missions!"
};

export function MissionCard({ mission, className = "" }: MissionCardProps) {
  // Format time unit helper function
  const formatTimeUnit = (value: number) => { 
    return value.toString().padStart(2, "0"); 
  };
  
  // Convert mission data to display format
  const missionInfoData = useMemo(() => {
    if (!mission) {
      return defaultMission;
    }

    return {
      title: mission.title,
      status: mission.status,
      description: mission.description || "Complete all tasks to earn rewards."
    };
  }, [mission]);

  // Calculate countdown target time and label
  const { targetCountdownTime, countdownLabel } = useMemo(() => {
    if (!mission) {
      return {
        targetCountdownTime: new Date(Date.now() + 24 * 86400000),
        countdownLabel: 'Ends in'
      };
    }

    if (mission.status?.toLowerCase() === 'completed') {
      return {
        targetCountdownTime: new Date(0),
        countdownLabel: 'Ended'
      };
    }

    // If mission is Upcoming and has startTime, show "Starts in"
    if (mission.status?.toLowerCase() === 'upcoming' && mission.startTime) {
      return {
        targetCountdownTime: new Date(mission.startTime),
        countdownLabel: 'Starts in'
      };
    }

    return {
      targetCountdownTime: new Date(mission.endTime),
      countdownLabel: 'Ends in'
    };
  }, [mission]);

  // Use countdown hook
  const { d: days, h: hours, m: minutes, s: seconds } = useCountdown(targetCountdownTime);

  // Check if mission is expired
  const isExpired = useMemo(() => isMissionExpired(mission?.endTime), [mission?.endTime]);

  // Calculate completed tasks from grouped structure
  const completedTasks = useMemo(() => {
    if (!mission) return 0;
    let completed = 0;
    for (const category of Object.values(mission.tasks)) {
      completed += category.filter(task => task.completed).length;
    }
    return completed;
  }, [mission]);

  const totalTasks = useMemo(() => {
    if (!mission) return 0;
    let total = 0;
    for (const category of Object.values(mission.tasks)) {
      total += category.length;
    }
    return total;
  }, [mission]);

  return (
    <div className={`common-container-style flex flex-col desktop:flex-row gap-4 desktop:gap-6 desktop:items-center ${className}`}>
      {/* Mobile: Full width image, Desktop: Fixed width */}
      <div className="shrink-0 w-full desktop:w-52 h-[311px] desktop:h-52 rounded-xl flex items-center justify-center desktop:overflow-hidden">
        <Image
          src={mission?.imageUrl || DEFAULT_MISSION_IMAGE}
          alt="Mission illustration"
          width={311}
          height={311}
          className="object-contain w-[311px] h-[311px] desktop:w-52 desktop:h-52 desktop:object-contain"
          onError={(e) => {
            // If image fails to load, use the default mission image
            const imgElement = e.target as HTMLImageElement;
            imgElement.src = DEFAULT_MISSION_IMAGE;
          }}
        />
      </div>

        {/* Content section */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Status badge and participants (mobile shows participants) */}
          <div className="flex items-center justify-between">
            <div className="bg-[rgba(132,120,224,0.1)] rounded-[32px] px-2.5 py-1">
              <span className="text-[#8478e0] text-[12px] font-medium" style={{ fontFamily: 'Outfit, sans-serif' }}>
                {missionInfoData.status}
              </span>
            </div>
            <div className="desktop:hidden bg-[rgba(255,255,255,0.6)] rounded-xl shadow-[0px_0px_12px_0px_rgba(0,0,0,0.08)] px-2 py-1 flex items-center gap-1">
              <Image
                src="https://statics.bloomprotocol.ai/logo/water-drop-icon.svg"
                alt="participants"
                width={16}
                height={16}
              />
              <span className="text-[#393f49] text-[12px] font-medium" style={{ fontFamily: 'Outfit, sans-serif' }}>50~ 300</span>
            </div>
          </div>

          {/* Title - different sizes for mobile/desktop */}
          <h2 className="text-[#393f49] text-[20px] desktop:text-[28px] font-bold" style={{ fontFamily: 'Times, serif' }}>
            {missionInfoData.title}
          </h2>

          {/* Description - different sizes for mobile/desktop */}
          <p className="text-[#696f8c] text-[14px] desktop:text-[16px] font-normal" style={{ fontFamily: 'Outfit, sans-serif' }}>
            {missionInfoData.description}
          </p>

          {/* Countdown timer - hide when expired */}
          {!isExpired && (
            <div className="flex items-center gap-2">
              <span className="text-[#696f8c] text-[12px] font-medium" style={{ fontFamily: 'Outfit, sans-serif' }}>
                {countdownLabel}
              </span>
              <div className="bg-[#f6f6f6] rounded-lg px-2 py-1.5 flex items-center gap-1">
                <span className="text-[#393f49] text-[12px] font-medium">{formatTimeUnit(days)}</span>
                <span className="text-[#393f49] text-[12px] font-medium">{timeUnits.days}</span>
              </div>
              <span className="text-[#393f49] text-[12px] font-medium">:</span>
              <div className="bg-[#f6f6f6] rounded-lg px-2 py-1.5 flex items-center gap-1">
                <span className="text-[#393f49] text-[12px] font-medium">{formatTimeUnit(hours)}</span>
                <span className="text-[#393f49] text-[12px] font-medium">{timeUnits.hours}</span>
              </div>
              <span className="text-[#393f49] text-[12px] font-medium">:</span>
              <div className="bg-[#f6f6f6] rounded-lg px-2 py-1.5 flex items-center gap-1">
                <span className="text-[#393f49] text-[12px] font-medium">{formatTimeUnit(minutes)}</span>
                <span className="text-[#393f49] text-[12px] font-medium">{timeUnits.minutes}</span>
              </div>
              <span className="text-[#393f49] text-[12px] font-medium">:</span>
              <div className="bg-[#f6f6f6] rounded-lg px-2 py-1.5 flex items-center gap-1">
                <span className="text-[#393f49] text-[12px] font-medium">{formatTimeUnit(seconds)}</span>
                <span className="text-[#393f49] text-[12px] font-medium">{timeUnits.seconds}</span>
              </div>
            </div>
          )}

          {/* Progress bar and tasks count (mobile only) */}
          <div className="desktop:hidden flex flex-col gap-1">
            <div className="h-2 relative bg-[#e7e6f2] rounded-lg overflow-hidden">
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#9fe553] to-[#71ca41] rounded-lg"
                style={{ width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%` }}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#393f49] text-[14px] font-normal">Tasks</span>
              <span className="text-[14px]">
                <span className="text-[#71ca41] font-medium">{completedTasks}</span>
                <span className="text-[#393f49] font-normal">/{totalTasks}</span>
              </span>
            </div>
        </div>
      </div>
    </div>
  );
}