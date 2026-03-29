'use client';

import { useState, useMemo } from 'react';
import { useBuilderMission } from '../contexts/builder-mission-context';

// Status categories
const PROCESSING_STATUSES = ['verified', 'distributing'];
const COMPLETED_STATUSES = ['completed', 'partial_completed', 'failed', 'verification_failed'];

/**
 * Card 2: Token Distribution Status
 * - Shows all requests status summary (processing + completed)
 * - Read-only, no actions
 */
export default function TokenDistributionStatusCard() {
  const {
    rewardSettings,
    missionHasTokenReward,
    allDistributionRequests,
  } = useBuilderMission();

  const [isExpanded, setIsExpanded] = useState(true);

  // Get default token symbol from reward settings
  const defaultTokenSymbol = rewardSettings?.stablecoinReward?.tokenSymbol || 'USDT';

  // Calculate processing requests (verified, distributing)
  const processingRequests = useMemo(() => {
    return allDistributionRequests.filter(r => PROCESSING_STATUSES.includes(r.status));
  }, [allDistributionRequests]);

  // Calculate completed requests summary
  const completedSummary = useMemo(() => {
    const completedRequests = allDistributionRequests.filter(r =>
      COMPLETED_STATUSES.includes(r.status) && r.status !== 'verification_failed'
    );

    if (completedRequests.length === 0) return null;

    const totalRecipients = completedRequests.reduce((sum, r) => sum + r.distributedCount, 0);
    const totalAmount = completedRequests.reduce((sum, r) => {
      return sum + (r.distributedCount * r.amountPerSubmission);
    }, 0);

    return {
      requestCount: completedRequests.length,
      totalRecipients,
      totalAmount,
      tokenSymbol: completedRequests[0]?.tokenSymbol || defaultTokenSymbol,
    };
  }, [allDistributionRequests, defaultTokenSymbol]);

  // Don't render if no token reward configured or no requests to show
  if (!missionHasTokenReward || !rewardSettings?.stablecoinReward) {
    return null;
  }

  // Don't render if there's nothing to show
  if (processingRequests.length === 0 && !completedSummary) {
    return null;
  }

  return (
    <div className="common-container-style flex w-full flex-col items-start gap-4">
      {/* Collapsible header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between font-bold text-[#393f49] text-[20px] leading-none hover:opacity-80 transition-opacity"
        style={{ fontFamily: 'Times, serif' }}
      >
        <span>Token Distribution Status</span>
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
        <div className="flex flex-col gap-3 w-full">
          {/* Processing Requests (verified, distributing) */}
          {processingRequests.map((request) => (
            <div key={request.requestId} className="w-full bg-[#E3F2FD] rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="animate-spin w-3 h-3 border border-[#1976D2] border-t-transparent rounded-full" />
                <span className="text-[12px] font-semibold text-[#1976D2]">
                  {request.status === 'verified' && 'Pending Distribution'}
                  {request.status === 'distributing' && 'Distributing...'}
                </span>
              </div>
              <div className="text-[12px] text-[#393f49]">
                {request.totalSubmissions} {request.totalSubmissions === 1 ? 'recipient' : 'recipients'} · {request.totalAmount.toFixed(2)} {request.tokenSymbol}
              </div>
              {request.status === 'distributing' && request.distributedCount > 0 && (
                <div className="text-[11px] text-[#696f8c] mt-1">
                  Progress: {request.distributedCount}/{request.totalSubmissions}
                </div>
              )}
            </div>
          ))}

          {/* Completed Summary */}
          {completedSummary && (
            <div className="w-full bg-[#E4FFF0] rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00C853" strokeWidth="2">
                  <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-[12px] font-semibold text-[#00C853]">Distributed</span>
              </div>
              <div className="text-[12px] text-[#393f49]">
                {completedSummary.requestCount} {completedSummary.requestCount === 1 ? 'request' : 'requests'} · {completedSummary.totalRecipients} {completedSummary.totalRecipients === 1 ? 'recipient' : 'recipients'} · {completedSummary.totalAmount.toFixed(2)} {completedSummary.tokenSymbol}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
