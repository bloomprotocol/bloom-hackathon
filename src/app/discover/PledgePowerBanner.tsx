'use client';

import { useState } from 'react';
import { LightningIcon } from './icons';

interface PledgePowerBannerProps {
  remaining: number;
  totalPower: number;
  resetsAt: Date;
}

export default function PledgePowerBanner({ remaining, totalPower, resetsAt }: PledgePowerBannerProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  // Calculate days until reset
  const getDaysUntilReset = () => {
    const now = new Date();
    const reset = new Date(resetsAt);
    const diffMs = reset.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'tomorrow';
    return `in ${diffDays} days`;
  };

  // Calculate percentage for progress bar (shows growth, not depletion)
  const usedThisWeek = totalPower - remaining;
  const percentage = totalPower > 0 ? (usedThisWeek / totalPower) * 100 : 0;

  return (
    <div className="relative rounded-xl px-4 py-3 mb-4 backdrop-blur-sm border border-white/60">
      {/* Glass background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/90 via-purple-50/60 to-violet-50/40 rounded-xl -z-10" />

      <div className="relative overflow-visible">
        {/* Main Message */}
        <div className="flex items-center gap-2">
          <LightningIcon size={16} className="text-[#71ca41] shrink-0" />
          <p className="font-['Outfit'] text-sm text-[#1e1b4b]">
            <span className="font-semibold">{usedThisWeek} / {totalPower} Pledge Power used</span>
            <span className="text-[#6b7280]"> • {remaining} left • Resets {getDaysUntilReset()}</span>
          </p>

          {/* Info Icon with Tooltip */}
          <div className="relative">
            <button
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              onClick={() => setShowTooltip(!showTooltip)}
              className="text-[#a9a9a9] hover:text-[#696f8c] transition-colors"
              aria-label="What is Pledge Power?"
            >
              <svg
                className="size-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {/* Tooltip */}
            {showTooltip && (
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 w-56 p-2.5 rounded-lg shadow-lg z-[9999] backdrop-blur-md bg-white/95 border border-white/60">
                <p className="font-['Outfit'] font-semibold text-xs text-[#1e1b4b] mb-1">
                  Pledge Power
                </p>
                <p className="font-['Outfit'] text-[11px] text-[#6b7280] leading-relaxed">
                  Free {totalPower} points weekly. Support projects, build your identity. Resets Monday.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
