'use client';

import { useState, useEffect } from 'react';
import { useBuilderMission } from '../contexts/builder-mission-context';
import { MS_PER_DAY, MS_PER_HOUR, MS_PER_MINUTE, MS_PER_SECOND } from '../constants';

export default function MissionOverviewCard() {
  const { mission, stats, rewardSettings } = useBuilderMission();

  const formatTimeUnit = (value: number) => String(value).padStart(2, '0');

  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!mission?.endTime) return;

    const calculateTimeLeft = () => {
      const end = new Date(mission.endTime).getTime();
      const now = new Date().getTime();
      const diff = end - now;

      if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

      return {
        days: Math.floor(diff / MS_PER_DAY),
        hours: Math.floor((diff % MS_PER_DAY) / MS_PER_HOUR),
        minutes: Math.floor((diff % MS_PER_HOUR) / MS_PER_MINUTE),
        seconds: Math.floor((diff % MS_PER_MINUTE) / MS_PER_SECOND),
      };
    };

    setCountdown(calculateTimeLeft());
    const timer = setInterval(() => setCountdown(calculateTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, [mission?.endTime]);

  // Build reward badge text
  const rewardBadgeText = (() => {
    if (!rewardSettings?.stablecoinReward) return null;
    const { amountPerSubmission, tokenSymbol } = rewardSettings.stablecoinReward;
    return `${amountPerSubmission} ${tokenSymbol}`;
  })();

  const statBadges = [
    { label: 'Submissions', value: stats.totalSubmissions, bg: 'bg-[#f3f3f5]', text: 'text-[#696f8c]' },
    { label: 'Approved', value: stats.approvedCount, bg: 'bg-[#f0eefb]', text: 'text-[#8478e0]' },
    { label: 'Distributed', value: stats.distributedCount, bg: 'bg-[#e8f9ef]', text: 'text-[#00873C]' },
  ];

  return (
    <div className="relative">
      {/* File folder tab */}
      <div className="absolute -top-3 left-0 z-10">
        <div
          className="bg-[#8478e0] text-white text-[12px] font-medium px-4 py-1.5 rounded-t-lg shadow-sm"
          style={{ fontFamily: 'Outfit, sans-serif' }}
        >
          You are now managing this social mission
        </div>
      </div>

      <div className="common-container-style pt-8">
        {/* Mission title (read-only) */}
        <h2 className="text-[#393f49] text-[20px] desktop:text-[28px] font-bold mb-1" style={{ fontFamily: 'Times, serif' }}>
          {mission?.title || 'Mission'}
        </h2>

        {/* Launched by */}
        <div className="text-[14px] desktop:text-[16px] text-[#696f8c]" style={{ fontFamily: 'Outfit, sans-serif' }}>
          Launched by{' '}
          <a
            href={`https://x.com/${mission?.postedByUsername || ''}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#8478e0] no-underline hover:opacity-80"
          >
            @{mission?.postedByUsername || ''}
          </a>
        </div>

        {/* Divider */}
        <div className="border-t border-[#e6e8ec] my-4" />

        {/* Description */}
        <div
          className="text-[14px] desktop:text-[16px] text-[#393f49] leading-[1.6] mb-1 line-clamp-2"
          style={{ fontFamily: 'Outfit, sans-serif' }}
        >
          {mission?.description || ''}
        </div>

        {/* View original post link */}
        <a
          href={mission?.originalPostUrl || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[14px] text-[#8478e0] no-underline hover:opacity-80"
          style={{ fontFamily: 'Outfit, sans-serif' }}
        >
          View original post &rarr;
        </a>

        {/* Divider */}
        <div className="border-t border-[#e6e8ec] my-4" />

        {/* Stat badges row + reward badge */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {statBadges.map((badge) => (
            <span
              key={badge.label}
              className={`${badge.bg} ${badge.text} text-[13px] font-semibold px-3 py-1 rounded-full`}
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              {badge.value} {badge.label}
            </span>
          ))}
          {rewardBadgeText && (
            <span
              className="bg-[#e8f0ff] text-[#3b82f6] text-[13px] font-semibold px-3 py-1 rounded-full"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              {rewardBadgeText}
            </span>
          )}
        </div>

        {/* Countdown timer (read-only) */}
        <div className="flex items-center gap-2">
          <span className="text-[14px] text-[#696f8c] font-medium" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Ends in
          </span>
          <div className="flex items-center gap-1.5">
            {[
              { value: countdown.days, unit: 'd' },
              { value: countdown.hours, unit: 'h' },
              { value: countdown.minutes, unit: 'm' },
              { value: countdown.seconds, unit: 's' },
            ].map((item, i) => (
              <div key={item.unit} className="flex items-center gap-1.5">
                {i > 0 && <span className="text-[#c0bfcf] text-[16px] font-medium">:</span>}
                <div className="bg-[#f0eefb] rounded-lg px-2.5 py-2 flex items-center gap-1 min-w-[48px] justify-center">
                  <span
                    className="text-[#393f49] text-[18px] font-bold tabular-nums"
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  >
                    {formatTimeUnit(item.value)}
                  </span>
                  <span
                    className="text-[#696f8c] text-[12px] font-medium"
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  >
                    {item.unit}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
