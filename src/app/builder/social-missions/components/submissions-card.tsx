'use client';

import { useState, useMemo } from 'react';
import { useBuilderMission } from '../contexts/builder-mission-context';
import { StatusFilter, BuilderSubmission, isSubmissionLocked, getDistributionBadge } from '../constants';

// ============================================
// STATUS ACCENT COLORS
// ============================================

function getStatusAccentColor(status: BuilderSubmission['status']): string {
  switch (status) {
    case 'PENDING': return 'border-l-orange-400';
    case 'APPROVED': return 'border-l-[#8478e0]';
    case 'DISTRIBUTED': return 'border-l-[#00C853]';
    case 'REJECTED': return 'border-l-red-400';
    default: return 'border-l-gray-300';
  }
}

// ============================================
// QUALITY DOT
// ============================================

function QualityDot({ submission }: { submission: BuilderSubmission }) {
  const llm = submission.llmV2ReviewStatus;

  // Analyzing state
  if (!llm || !llm.status || !llm.result) {
    return (
      <div className="w-[42px] flex items-center gap-1 flex-shrink-0">
        <div
          className="w-2.5 h-2.5 rounded-full bg-gray-300 animate-pulse flex-shrink-0"
          title="AI is analyzing..."
        />
      </div>
    );
  }

  const score = llm.result.quality_score;
  const color = score >= 80 ? 'bg-[#00C853]' : score >= 50 ? 'bg-[#FF9800]' : 'bg-red-500';

  return (
    <div className="w-[42px] flex items-center gap-1 flex-shrink-0">
      <div className={`w-2.5 h-2.5 rounded-full ${color} flex-shrink-0`} />
      <span className="text-[10px] text-[#696f8c] tabular-nums">{score}</span>
    </div>
  );
}

// ============================================
// QUALITY LEGEND
// ============================================

function QualityLegend() {
  return (
    <div className="flex items-center gap-3 px-4 py-1.5 text-[11px] text-[#696f8c]" style={{ fontFamily: 'Outfit, sans-serif' }}>
      <span className="font-medium">Quality:</span>
      <span className="flex items-center gap-1">
        <span className="w-2 h-2 rounded-full bg-[#00C853] inline-block" />
        High (80+)
      </span>
      <span className="flex items-center gap-1">
        <span className="w-2 h-2 rounded-full bg-[#FF9800] inline-block" />
        Med (50-79)
      </span>
      <span className="flex items-center gap-1">
        <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
        Low (&lt;50)
      </span>
    </div>
  );
}

// ============================================
// STATUS PILL
// ============================================

function StatusPill({ submission, missionHasTokenReward }: { submission: BuilderSubmission; missionHasTokenReward: boolean }) {
  const distributionBadge = getDistributionBadge(submission.dropsStatus, submission.tokenStatus, missionHasTokenReward);

  if (distributionBadge) {
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${distributionBadge.bgClass} ${distributionBadge.textClass}`}>
        {distributionBadge.text}
      </span>
    );
  }

  const styles: Record<string, string> = {
    APPROVED: 'bg-[rgba(132,120,224,0.1)] text-[#8478e0]',
    REJECTED: 'bg-red-50 text-red-500',
    PENDING: 'bg-gray-100 text-gray-600',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${styles[submission.status] || styles.PENDING}`}>
      {submission.status.charAt(0) + submission.status.slice(1).toLowerCase()}
    </span>
  );
}

// ============================================
// COMPACT ACTION BUTTONS
// ============================================

function ActionButtons({
  submission,
  isSubmitting,
  handleApprove,
  handleReject,
  handleMoveToPending,
}: {
  submission: BuilderSubmission;
  isSubmitting: boolean;
  handleApprove: (id: number) => void;
  handleReject: (id: number) => void;
  handleMoveToPending: (id: number) => void;
}) {
  const isLocked = isSubmissionLocked(submission.dropsStatus);
  if (isLocked) return null;

  const btnBase = 'h-6 rounded-[27px] px-3 py-1 flex items-center justify-center text-[11px] font-semibold transition-opacity disabled:opacity-50';
  const btnGray = `${btnBase} bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200`;
  const btnPink = `${btnBase} bg-[rgba(247,89,255,0.1)] text-[#eb7cff] shadow-[0px_2px_0px_-1px_#d6aedd] border-2 border-[rgba(247,89,255,0.10)] hover:opacity-90`;
  const btnRed = `${btnBase} bg-red-50 text-red-500 border border-red-100 hover:bg-red-100`;

  return (
    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
      {submission.status === 'PENDING' && (
        <>
          <button onClick={() => handleReject(submission.id)} disabled={isSubmitting} className={btnGray}>Reject</button>
          <button onClick={() => handleApprove(submission.id)} disabled={isSubmitting} className={btnPink}>Approve</button>
        </>
      )}
      {submission.status === 'APPROVED' && (
        <>
          <button onClick={() => handleMoveToPending(submission.id)} disabled={isSubmitting} className={btnGray}>Undo</button>
          <button onClick={() => handleReject(submission.id)} disabled={isSubmitting} className={btnRed}>Reject</button>
        </>
      )}
      {submission.status === 'REJECTED' && (
        <>
          <button onClick={() => handleMoveToPending(submission.id)} disabled={isSubmitting} className={btnGray}>Undo</button>
          <button onClick={() => handleApprove(submission.id)} disabled={isSubmitting} className={btnPink}>Approve</button>
        </>
      )}
    </div>
  );
}

// ============================================
// EXPANDED DETAILS
// ============================================

// Progress bar colors
function getQualityBarColor(score: number): string {
  if (score >= 80) return 'bg-[#00C853]';
  if (score >= 50) return 'bg-[#FF9800]';
  return 'bg-red-500';
}

function getQualityColorClasses(score: number): string {
  if (score >= 80) return 'bg-[#E4FFF0] text-[#00C853]';
  if (score >= 50) return 'bg-[#FFF4E5] text-[#FF9800]';
  return 'bg-red-50 text-red-500';
}

function ExpandedDetails({ submission, missionHasTokenReward }: { submission: BuilderSubmission; missionHasTokenReward: boolean }) {
  const llm = submission.llmV2ReviewStatus;
  const isLocked = isSubmissionLocked(submission.dropsStatus);

  return (
    <div className="px-4 pb-4 pt-0 border-l-[3px] border-l-transparent">
      <div className="bg-[rgba(132,120,224,0.03)] rounded-lg p-4 ml-8">
        {/* Full tweet text */}
        <a
          href={submission.xPostUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[13px] text-[#8478e0] no-underline hover:opacity-80 leading-relaxed block mb-3"
          style={{ fontFamily: 'Outfit, sans-serif' }}
        >
          {submission.text}
        </a>

        {/* AI Analysis */}
        {llm && llm.status && llm.result ? (
          <div className="space-y-3">
            {/* Quality Score bar */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-[#696f8c]">Quality</span>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${getQualityColorClasses(llm.result.quality_score)}`}>
                  {llm.result.quality_score}
                </span>
              </div>
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${getQualityBarColor(llm.result.quality_score)}`}
                  style={{ width: `${llm.result.quality_score}%` }}
                />
              </div>
            </div>

            {/* AI Likelihood bar */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-[#696f8c]">AI Likelihood</span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-500">
                  {llm.result.ai_likelihood}
                </span>
              </div>
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300 bg-gray-400"
                  style={{ width: `${llm.result.ai_likelihood}%` }}
                />
              </div>
            </div>

            {/* Message */}
            {llm.result.message && (
              <div className="pt-3 border-t border-[#e6e8ec]">
                <p className="text-[12px] text-[#696f8c] italic leading-relaxed">
                  &ldquo;{llm.result.message}&rdquo;
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-[#696f8c] text-[12px]">
            <span className="animate-pulse">AI is analyzing this post...</span>
          </div>
        )}

        {/* Distribution indicators (for locked/distributed submissions) */}
        {isLocked && (() => {
          const dropsDistributed = submission.dropsStatus === 'completed' || submission.dropsStatus === 'sent' || submission.dropsStatus === 'pending_claim';
          const tokenDistributed = submission.tokenStatus === 'completed' || submission.tokenStatus === 'sent';

          return (
            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[#e6e8ec]">
              <div className={`flex items-center gap-1 text-[12px] ${dropsDistributed ? 'text-[#00C853]' : 'text-gray-400'}`} style={{ fontFamily: 'Outfit, sans-serif' }}>
                <span>{dropsDistributed ? '✅' : '⏳'}</span>
                <span>Drop{dropsDistributed && submission.distributedAmount !== undefined ? `: ${submission.distributedAmount}` : ''}</span>
              </div>
              {missionHasTokenReward && (
                <div className={`flex items-center gap-1 text-[12px] ${tokenDistributed ? 'text-[#00C853]' : 'text-gray-400'}`} style={{ fontFamily: 'Outfit, sans-serif' }}>
                  <span>{tokenDistributed ? '✅' : '⏳'}</span>
                  <span>Token</span>
                </div>
              )}
            </div>
          );
        })()}
      </div>
    </div>
  );
}

// ============================================
// DESKTOP SUBMISSION ROW (~52px)
// ============================================

function SubmissionRow({
  submission,
  isSelectable,
  isSelected,
  isExpanded,
  onToggleSelect,
  onToggleExpand,
  isSubmitting,
  handleApprove,
  handleReject,
  handleMoveToPending,
  getRelativeTime,
  missionHasTokenReward,
}: {
  submission: BuilderSubmission;
  isSelectable: boolean;
  isSelected: boolean;
  isExpanded: boolean;
  onToggleSelect: (id: number) => void;
  onToggleExpand: (id: number) => void;
  isSubmitting: boolean;
  handleApprove: (id: number) => void;
  handleReject: (id: number) => void;
  handleMoveToPending: (id: number) => void;
  getRelativeTime: (date: string) => string;
  missionHasTokenReward: boolean;
}) {
  const accentColor = getStatusAccentColor(submission.status);

  return (
    <div className="hidden desktop:block">
      {/* Row */}
      <div
        onClick={() => onToggleExpand(submission.id)}
        className={`flex items-center gap-3 px-4 h-[52px] border-l-[3px] cursor-pointer transition-colors hover:bg-[rgba(132,120,224,0.02)] ${accentColor} ${
          isSelected ? 'bg-[rgba(132,120,224,0.04)]' : ''
        } ${isExpanded ? 'bg-[rgba(132,120,224,0.03)]' : ''}`}
      >
        {/* Checkbox */}
        <div className="w-5 flex-shrink-0">
          {isSelectable ? (
            <div
              onClick={(e) => { e.stopPropagation(); onToggleSelect(submission.id); }}
              className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors cursor-pointer ${
                isSelected
                  ? 'bg-[#8478e0] border-[#8478e0]'
                  : 'bg-white border-[#d1d5db] hover:border-[#8478e0]'
              }`}
            >
              {isSelected && (
                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          ) : null}
        </div>

        {/* Quality dot */}
        <QualityDot submission={submission} />

        {/* Username */}
        <span className="text-[13px] font-semibold text-[#393f49] w-[120px] truncate flex-shrink-0" style={{ fontFamily: 'Outfit, sans-serif' }}>
          {submission.username}
        </span>

        {/* Time */}
        <span className="text-[11px] text-[#696f8c] w-[64px] flex-shrink-0" style={{ fontFamily: 'Outfit, sans-serif' }}>
          {getRelativeTime(submission.submittedAt)}
        </span>

        {/* Tweet preview — fills remaining space */}
        <span className="text-[13px] text-[#696f8c] truncate flex-1 min-w-0" style={{ fontFamily: 'Outfit, sans-serif' }}>
          {submission.text}
        </span>

        {/* Status pill */}
        <div className="flex-shrink-0">
          <StatusPill submission={submission} missionHasTokenReward={missionHasTokenReward} />
        </div>

        {/* Actions */}
        <div className="flex-shrink-0 w-[140px] flex justify-end">
          <ActionButtons
            submission={submission}
            isSubmitting={isSubmitting}
            handleApprove={handleApprove}
            handleReject={handleReject}
            handleMoveToPending={handleMoveToPending}
          />
        </div>

        {/* Expand chevron */}
        <div className="flex-shrink-0 w-4 text-[#696f8c] text-[10px]">
          {isExpanded ? '▲' : '▼'}
        </div>
      </div>

      {/* Expanded details */}
      {isExpanded && (
        <ExpandedDetails submission={submission} missionHasTokenReward={missionHasTokenReward} />
      )}

      {/* Row divider */}
      <div className="border-b border-[#f0f0f0]" />
    </div>
  );
}

// ============================================
// MOBILE SUBMISSION CARD (~72px)
// ============================================

function SubmissionMobileCard({
  submission,
  isSelectable,
  isSelected,
  isExpanded,
  onToggleSelect,
  onToggleExpand,
  isSubmitting,
  handleApprove,
  handleReject,
  handleMoveToPending,
  getRelativeTime,
  missionHasTokenReward,
}: {
  submission: BuilderSubmission;
  isSelectable: boolean;
  isSelected: boolean;
  isExpanded: boolean;
  onToggleSelect: (id: number) => void;
  onToggleExpand: (id: number) => void;
  isSubmitting: boolean;
  handleApprove: (id: number) => void;
  handleReject: (id: number) => void;
  handleMoveToPending: (id: number) => void;
  getRelativeTime: (date: string) => string;
  missionHasTokenReward: boolean;
}) {
  const accentColor = getStatusAccentColor(submission.status);

  return (
    <div className="desktop:hidden">
      <div
        onClick={() => onToggleExpand(submission.id)}
        className={`border-l-[3px] ${accentColor} px-3 py-2.5 cursor-pointer transition-colors ${
          isSelected ? 'bg-[rgba(132,120,224,0.04)]' : ''
        }`}
      >
        {/* Top row: checkbox + quality + username + time + status */}
        <div className="flex items-center gap-2 mb-1.5">
          {isSelectable && (
            <div
              onClick={(e) => { e.stopPropagation(); onToggleSelect(submission.id); }}
              className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors cursor-pointer flex-shrink-0 ${
                isSelected
                  ? 'bg-[#8478e0] border-[#8478e0]'
                  : 'bg-white border-[#d1d5db] hover:border-[#8478e0]'
              }`}
            >
              {isSelected && (
                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          )}
          <QualityDot submission={submission} />
          <span className="text-[13px] font-semibold text-[#393f49] truncate" style={{ fontFamily: 'Outfit, sans-serif' }}>
            {submission.username}
          </span>
          <span className="text-[11px] text-[#696f8c] flex-shrink-0" style={{ fontFamily: 'Outfit, sans-serif' }}>
            {getRelativeTime(submission.submittedAt)}
          </span>
          <div className="ml-auto flex-shrink-0">
            <StatusPill submission={submission} missionHasTokenReward={missionHasTokenReward} />
          </div>
        </div>

        {/* Tweet preview — single line */}
        <p className="text-[12px] text-[#696f8c] truncate mb-1.5 pl-0" style={{ fontFamily: 'Outfit, sans-serif' }}>
          {submission.text}
        </p>

        {/* Action buttons row */}
        <div className="flex items-center justify-between">
          <div className="text-[10px] text-[#696f8c]">{isExpanded ? '▲ Less' : '▼ More'}</div>
          <ActionButtons
            submission={submission}
            isSubmitting={isSubmitting}
            handleApprove={handleApprove}
            handleReject={handleReject}
            handleMoveToPending={handleMoveToPending}
          />
        </div>
      </div>

      {/* Expanded details */}
      {isExpanded && (
        <div className="px-3 pb-3 border-l-[3px] border-l-transparent">
          <div className="bg-[rgba(132,120,224,0.03)] rounded-lg p-3">
            {/* Full tweet text */}
            <a
              href={submission.xPostUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[12px] text-[#8478e0] no-underline hover:opacity-80 leading-relaxed block mb-2"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              {submission.text}
            </a>

            {/* AI Analysis */}
            {submission.llmV2ReviewStatus?.status && submission.llmV2ReviewStatus.result ? (() => {
              const { quality_score, ai_likelihood, message } = submission.llmV2ReviewStatus.result;
              return (
                <div className="space-y-2">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] text-[#696f8c]">Quality</span>
                      <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${getQualityColorClasses(quality_score)}`}>
                        {quality_score}
                      </span>
                    </div>
                    <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${getQualityBarColor(quality_score)}`} style={{ width: `${quality_score}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] text-[#696f8c]">AI Likelihood</span>
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-500">{ai_likelihood}</span>
                    </div>
                    <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-gray-400" style={{ width: `${ai_likelihood}%` }} />
                    </div>
                  </div>
                  {message && (
                    <p className="text-[11px] text-[#696f8c] italic pt-2 border-t border-[#e6e8ec]">&ldquo;{message}&rdquo;</p>
                  )}
                </div>
              );
            })() : (
              <div className="text-[11px] text-[#696f8c] animate-pulse">AI is analyzing...</div>
            )}
          </div>
        </div>
      )}

      {/* Row divider */}
      <div className="border-b border-[#f0f0f0]" />
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function SubmissionsCard() {
  const {
    submissions,
    statusFilter,
    setStatusFilter,
    hasMore,
    loadMore,
    isSubmitting,
    handleApprove,
    handleReject,
    handleMoveToPending,
    handleBatchApprove,
    handleBatchReject,
    batchProgress,
    getRelativeTime,
    missionHasTokenReward,
  } = useBuilderMission();

  // Batch selection state
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // Expanded row state
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  const toggleExpand = (id: number) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Filter submissions based on status
  const filteredSubmissions = (() => {
    if (statusFilter === 'all') return submissions;
    if (statusFilter === 'APPROVED') {
      return submissions.filter(s => s.status === 'APPROVED' || s.status === 'DISTRIBUTED');
    }
    return submissions.filter(s => s.status === statusFilter);
  })();

  // Get selectable submissions (only pending, not locked)
  const selectableSubmissions = useMemo(() => {
    return filteredSubmissions.filter(s =>
      s.status === 'PENDING' && !isSubmissionLocked(s.dropsStatus)
    );
  }, [filteredSubmissions]);

  // Batch selection handlers
  const handleToggleSelect = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === selectableSubmissions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(selectableSubmissions.map(s => s.id)));
    }
  };

  const isAllSelected = selectableSubmissions.length > 0 && selectedIds.size === selectableSubmissions.length;
  const isPartialSelected = selectedIds.size > 0 && selectedIds.size < selectableSubmissions.length;
  const hasSelection = selectedIds.size > 0;
  const showBatchActions = statusFilter === 'PENDING' && selectableSubmissions.length > 0;

  // Batch action result state
  const [batchResult, setBatchResult] = useState<{ success: number; failed: number; failedIds: number[]; action: string } | null>(null);

  const onBatchApprove = async () => {
    const ids = Array.from(selectedIds);
    const result = await handleBatchApprove(ids);
    setBatchResult({ ...result, action: 'approved' });
    setSelectedIds(new Set());
    setTimeout(() => setBatchResult(null), result.failed > 0 ? 8000 : 3000);
  };

  const onBatchReject = async () => {
    const ids = Array.from(selectedIds);
    const result = await handleBatchReject(ids);
    setBatchResult({ ...result, action: 'rejected' });
    setSelectedIds(new Set());
    setTimeout(() => setBatchResult(null), result.failed > 0 ? 8000 : 3000);
  };

  const isBatchInProgress = batchProgress.action !== null;

  return (
    <div className="common-container-style">
      {/* Header with title and status tabs */}
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex flex-col desktop:flex-row desktop:items-center desktop:justify-between gap-4">
          <h4 className="text-[14px] font-semibold text-[#393f49]" style={{ fontFamily: 'Times, serif' }}>
            SUBMISSIONS ({submissions.length})
          </h4>

          {/* Status tabs */}
          <div className="flex gap-4 desktop:gap-6 overflow-x-auto desktop:overflow-visible pb-1 desktop:pb-0">
            {(['all', 'PENDING', 'REJECTED', 'APPROVED'] as StatusFilter[]).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`text-[12px] font-semibold transition-colors relative whitespace-nowrap ${
                  statusFilter === status
                    ? 'text-[#8478e0]'
                    : 'text-[#696f8c] hover:text-[#393f49]'
                }`}
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                {status === 'all' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
                {statusFilter === status && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-[24px] h-[3px] bg-[#8478e0]" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Batch Action Bar */}
      {showBatchActions && (
        <div className="bg-[rgba(132,120,224,0.05)] rounded-lg px-4 py-2.5 mb-3">
          {isBatchInProgress ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-[#393f49] font-medium" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {batchProgress.action === 'approve' ? 'Approving' : 'Rejecting'} {batchProgress.current}/{batchProgress.total}...
                </span>
              </div>
              <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    batchProgress.action === 'approve' ? 'bg-[#eb7cff]' : 'bg-gray-500'
                  }`}
                  style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }}
                />
              </div>
            </div>
          ) : batchResult ? (
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[14px]">{batchResult.failed > 0 ? '⚠️' : '✅'}</span>
                  <span className="text-[12px] text-[#393f49] font-medium" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    {batchResult.success} {batchResult.action}
                    {batchResult.failed > 0 && ` (${batchResult.failed} failed)`}
                  </span>
                </div>
                <button onClick={() => setBatchResult(null)} className="text-[11px] text-[#696f8c] hover:text-[#393f49]">
                  Dismiss
                </button>
              </div>
              {batchResult.failedIds.length > 0 && (
                <div className="text-[11px] text-red-500 pl-6" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Failed IDs: {batchResult.failedIds.join(', ')}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <div
                  onClick={handleSelectAll}
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors cursor-pointer ${
                    isAllSelected
                      ? 'bg-[#8478e0] border-[#8478e0]'
                      : isPartialSelected
                      ? 'bg-[#8478e0] border-[#8478e0]'
                      : 'bg-white border-[#d1d5db] hover:border-[#8478e0]'
                  }`}
                >
                  {isAllSelected && (
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {isPartialSelected && (
                    <div className="w-2 h-0.5 bg-white rounded" />
                  )}
                </div>
                <span className="text-[12px] text-[#393f49] font-medium" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {hasSelection ? `${selectedIds.size} selected` : `Select All (${selectableSubmissions.length})`}
                </span>
              </label>

              <div className="flex items-center gap-2">
                <button
                  onClick={onBatchReject}
                  disabled={!hasSelection || isSubmitting}
                  className={`h-6 rounded-[27px] px-3 py-1 flex items-center justify-center text-[11px] font-semibold transition-all ${
                    hasSelection && !isSubmitting
                      ? 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200 cursor-pointer'
                      : 'bg-gray-50 text-gray-300 border border-gray-100 cursor-not-allowed'
                  }`}
                >
                  Batch Reject
                </button>
                <button
                  onClick={onBatchApprove}
                  disabled={!hasSelection || isSubmitting}
                  className={`h-6 rounded-[27px] px-3 py-1 flex items-center justify-center text-[11px] font-semibold transition-all ${
                    hasSelection && !isSubmitting
                      ? 'bg-[rgba(247,89,255,0.1)] text-[#eb7cff] shadow-[0px_2px_0px_-1px_#d6aedd] border-2 border-[rgba(247,89,255,0.10)] hover:opacity-90 cursor-pointer'
                      : 'bg-gray-50 text-gray-300 border border-gray-100 cursor-not-allowed shadow-none'
                  }`}
                >
                  Batch Approve
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quality Legend */}
      <QualityLegend />

      {/* Desktop column headers */}
      <div className="hidden desktop:flex items-center gap-3 px-4 h-8 text-[11px] text-[#696f8c] font-medium border-b border-[#e6e8ec] mb-0" style={{ fontFamily: 'Outfit, sans-serif' }}>
        <div className="w-5 flex-shrink-0" /> {/* checkbox space */}
        <div className="w-[42px] flex-shrink-0" /> {/* quality dot space */}
        <div className="w-[120px] flex-shrink-0">User</div>
        <div className="w-[64px] flex-shrink-0">Time</div>
        <div className="flex-1 min-w-0">Tweet</div>
        <div className="flex-shrink-0">Status</div>
        <div className="w-[140px] flex-shrink-0 text-right">Actions</div>
        <div className="w-4 flex-shrink-0" /> {/* chevron space */}
      </div>

      {/* Submissions list */}
      <div>
        {filteredSubmissions.map((submission) => {
          const isLocked = isSubmissionLocked(submission.dropsStatus);
          const isSelectable = submission.status === 'PENDING' && !isLocked && statusFilter === 'PENDING';
          const isSelected = selectedIds.has(submission.id);
          const isExpanded = expandedIds.has(submission.id);

          return (
            <div key={submission.id}>
              {/* Desktop row */}
              <SubmissionRow
                submission={submission}
                isSelectable={isSelectable}
                isSelected={isSelected}
                isExpanded={isExpanded}
                onToggleSelect={handleToggleSelect}
                onToggleExpand={toggleExpand}
                isSubmitting={isSubmitting}
                handleApprove={handleApprove}
                handleReject={handleReject}
                handleMoveToPending={handleMoveToPending}
                getRelativeTime={getRelativeTime}
                missionHasTokenReward={missionHasTokenReward}
              />
              {/* Mobile card */}
              <SubmissionMobileCard
                submission={submission}
                isSelectable={isSelectable}
                isSelected={isSelected}
                isExpanded={isExpanded}
                onToggleSelect={handleToggleSelect}
                onToggleExpand={toggleExpand}
                isSubmitting={isSubmitting}
                handleApprove={handleApprove}
                handleReject={handleReject}
                handleMoveToPending={handleMoveToPending}
                getRelativeTime={getRelativeTime}
                missionHasTokenReward={missionHasTokenReward}
              />
            </div>
          );
        })}

        {filteredSubmissions.length === 0 && (
          <div className="text-center py-8 text-[#696f8c] text-[14px]" style={{ fontFamily: 'Outfit, sans-serif' }}>
            No submissions found
          </div>
        )}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="mt-5 text-center">
          <button
            onClick={loadMore}
            className="bg-white text-[#393f49] px-6 py-3 rounded-xl text-[14px] font-semibold border border-[#e6e8ec] cursor-pointer hover:bg-gray-50 transition-colors"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
}
