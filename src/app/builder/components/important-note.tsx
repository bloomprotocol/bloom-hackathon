'use client';

import { useBuilderDashboard } from '../contexts/builder-dashboard-context';

/**
 * Important Note Banner
 * Shown when there are pending submissions
 */
export default function ImportantNote() {
  const { pendingInfo, isNoteDismissed, dismissNote, handleReviewPending } = useBuilderDashboard();

  // Don't show if dismissed or no pending
  if (isNoteDismissed || pendingInfo.totalPending === 0) {
    return null;
  }

  return (
    <div className="bg-[#FFF8E6] border border-[#f59e0b] rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Warning Icon */}
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            className="flex-shrink-0"
          >
            <path
              d="M10 6v4m0 4h.01M19 10a9 9 0 11-18 0 9 9 0 0118 0z"
              stroke="#f59e0b"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          <div>
            <span
              className="text-[14px] font-bold text-[#393f49]"
              style={{ fontFamily: 'Times, serif' }}
            >
              IMPORTANT NOTE
            </span>
            <p
              className="text-[14px] text-[#696f8c] mt-1"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              You have {pendingInfo.totalPending} submissions pending review across all missions.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 flex-shrink-0">
          <button
            onClick={dismissNote}
            className="text-[14px] text-[#696f8c] hover:underline"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
