'use client';

import { useState } from 'react';
import { useBuilderMission } from '../contexts/builder-mission-context';
import MobileDisabledWrapper from './mobile-disabled-wrapper';

export default function DistributeDropRewardCard() {
  const {
    isMobile,
    stats,
    handleDistributeAll,
    isSubmitting,
  } = useBuilderMission();

  const [isExpanded, setIsExpanded] = useState(true);

  // Count of submissions eligible for Drops distribution
  // APPROVED status means: backend COMPLETED + dropsStatus NOT completed/sent
  // So approvedCount already represents eligible submissions
  const eligibleCount = stats.approvedCount;

  return (
    <div className="common-container-style flex w-full flex-col items-start gap-4">
      {/* Collapsible header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between font-bold text-[#393f49] text-[20px] leading-none hover:opacity-80 transition-opacity"
        style={{ fontFamily: 'Times, serif' }}
      >
        <span>Distribute Drop Reward</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
        >
          <path
            d="M4 6L8 10L12 6"
            stroke="#696f8c"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isExpanded && (
        <>
          {/* Distribution Info */}
          <div className="flex flex-col gap-2 w-full">
            {/* Eligible Submissions */}
            <div className="flex items-center justify-between">
              <span className="text-[14px] text-[#696f8c]" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Eligible Submissions
              </span>
              <span className="text-[14px] font-semibold text-[#393f49]" style={{ fontFamily: 'Outfit, sans-serif' }}>
                {eligibleCount}
              </span>
            </div>

            {/* Already Distributed */}
            <div className="flex items-center justify-between">
              <span className="text-[14px] text-[#696f8c]" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Already Distributed
              </span>
              <span className="text-[14px] font-semibold text-[#00C853]" style={{ fontFamily: 'Outfit, sans-serif' }}>
                {stats.distributedCount}
              </span>
            </div>
          </div>

          {/* Distribute All Drops Button */}
          <MobileDisabledWrapper isMobile={isMobile} message="Please use desktop to distribute rewards">
            <button
              onClick={handleDistributeAll}
              disabled={eligibleCount === 0 || isSubmitting}
              className="w-full bg-[rgba(113,202,65,0.1)] h-10 rounded-[27px] px-4 py-2 flex items-center justify-center text-[#71ca41] text-[14px] font-semibold shadow-[0px_3px_0px_-1px_#a8d89a] border-2 border-[rgba(113,202,65,0.10)] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Distributing...' : `Distribute All Drops (${eligibleCount})`}
            </button>
          </MobileDisabledWrapper>
        </>
      )}
    </div>
  );
}
