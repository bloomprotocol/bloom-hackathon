'use client';

import { useState, useEffect } from 'react';
import SocialMissionSubmissionModal from '@/components/modals/SocialMissionSubmissionModal';
import { socialMissionService, Submission, SocialMissionDetail } from '@/lib/api/services/socialMissionService';
import { logger } from '@/lib/utils/logger';

// Extended types based on SocialMissionDetail
type Mission = SocialMissionDetail['mission'] & {
  startTime?: string;
  endTime?: string;
  llmTitleGenerated?: boolean | null;
};

type Stats = SocialMissionDetail['stats'] & {
  pointsPerVerified?: number;
};

type Reward = SocialMissionDetail['rewards'][number];

interface SocialMissionClientProps {
  initialData: {
    mission: Mission;
    stats: Stats;
    rewards: Reward[];
  };
  postId: string;
}

// Helper functions
const formatTimeUnit = (value: number) => String(value).padStart(2, '0');
const TIME_UNITS = { days: 'd', hours: 'h', minutes: 'm', seconds: 's' } as const;

function calculateTimeUnits(diffMs: number) {
  return {
    days: Math.floor(diffMs / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diffMs % (1000 * 60)) / 1000),
  };
}

// Reusable TimeUnit component
function TimeUnit({ value, unit }: { value: number; unit: string }) {
  return (
    <div className="bg-[#f6f6f6] rounded-lg px-2 py-1.5 flex items-center gap-1">
      <span className="text-[#393f49] text-[12px] font-medium">{formatTimeUnit(value)}</span>
      <span className="text-[#393f49] text-[12px] font-medium">{unit}</span>
    </div>
  );
}

// Reusable FilterTab component
function FilterTab({
  label,
  isActive,
  onClick
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-[12px] font-semibold transition-colors relative whitespace-nowrap font-['Outfit'] ${
        isActive ? "text-[#8478e0]" : "text-[#696f8c] hover:text-[#393f49]"
      }`}
    >
      {label}
      {isActive && (
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-[24px] h-[3px] bg-[#8478e0]" />
      )}
    </button>
  );
}

// Reusable button components
function PendingButton({ children, onClick, disabled }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean }) {
  return (
    <button
      className="relative rounded-[27px] px-[16px] py-[8px] flex items-center justify-center gap-[4px] bg-[#e7e6f2] text-[#696f8c] text-[12px] font-medium leading-none"
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

function SubmitButton({ children, onClick, disabled }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="relative rounded-[27px] px-[16px] py-[8px] flex items-center justify-center bg-[#eb7cff] backdrop-blur-[10px] shadow-[0px_1px_1px_0.05px_rgba(24,24,27,0.24),0px_4px_10px_0px_rgba(0,0,0,0.25)] text-white text-[12px] font-medium leading-none overflow-hidden hover:opacity-90 transition-opacity disabled:opacity-50"
    >
      {children}
      <div className="absolute inset-0 pointer-events-none rounded-[27px] shadow-[inset_0px_2px_0px_0px_rgba(255,255,255,0.1),inset_0px_8px_16px_0px_rgba(255,255,255,0.16)]" />
    </button>
  );
}

// Components
function MissionHeaderCard({ mission, stats }: { mission: Mission; stats: Stats }) {
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [countdownLabel, setCountdownLabel] = useState('Ends in');
  const [isExpired, setIsExpired] = useState(false);

  if (!mission) {
    return <div className="common-container-style">Loading mission data...</div>;
  }

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();

      // Check if mission hasn't started yet
      if (mission?.startTime) {
        const start = new Date(mission.startTime).getTime();
        if (start > now) {
          setCountdownLabel('Starts in');
          return calculateTimeUnits(start - now);
        }
      }

      // Mission has started, show end time countdown
      setCountdownLabel('Ends in');

      if (!mission?.endTime) {
        setIsExpired(false);
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      const end = new Date(mission.endTime).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setIsExpired(true);
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      setIsExpired(false);
      return calculateTimeUnits(diff);
    };

    setCountdown(calculateTimeLeft());
    const timer = setInterval(() => setCountdown(calculateTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, [mission?.startTime, mission?.endTime]);

  return (
    <div className="common-container-style">
      {/* Mission title */}
      <h2 className="text-[#393f49] text-[20px] desktop:text-[28px] font-bold mb-1 font-serif">
        {mission.llmTitleGenerated === true ? mission.title : 'Mission'}
      </h2>
      {/* Launched by */}
      <div className="text-[14px] desktop:text-[16px] text-[#696f8c] font-['Outfit']">
        Launched by{' '}
        <a
          href={`https://x.com/${mission.postedByUsername || 'unknown'}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#8478e0] no-underline hover:opacity-80"
        >
          @{mission.postedByUsername || 'Unknown'}
        </a>
      </div>

      {/* Divider */}
      <div className="border-t border-[#e6e8ec] my-4" />

      {/* Description - Limited to 2 lines */}
      <div
        className="text-[14px] desktop:text-[16px] text-[#393f49] leading-[1.6] mb-1 line-clamp-2 font-['Outfit']"
      >
        {mission.description || 'No description available'}
      </div>

      {/* View original post link */}
      {mission.originalPostUrl && (
        <a
          href={mission.originalPostUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[14px] text-[#8478e0] no-underline hover:opacity-80 font-['Outfit']"
        >
          View original post →
        </a>
      )}

      {/* Divider */}
      <div className="border-t border-[#e6e8ec] my-4" />

      {/* Stats and Timer */}
      <div className="flex flex-col desktop:flex-row desktop:items-center gap-2 desktop:gap-3">
        <div className="text-[14px] text-[#696f8c] font-['Outfit']">
          {stats?.totalSubmissions || 0} Submissions • {stats?.verifiedCount || 0} Verified
        </div>
        {/* Countdown timer - hide when expired */}
        {!isExpired && (
          <>
            <span className="text-[#696f8c] hidden desktop:inline">|</span>
            <div className="flex items-center gap-2">
              <span className="text-[14px] text-[#696f8c] font-['Outfit']">{countdownLabel}</span>
              <TimeUnit value={countdown.days} unit={TIME_UNITS.days} />
              <span className="text-[#393f49] text-[12px] font-medium">:</span>
              <TimeUnit value={countdown.hours} unit={TIME_UNITS.hours} />
              <span className="text-[#393f49] text-[12px] font-medium">:</span>
              <TimeUnit value={countdown.minutes} unit={TIME_UNITS.minutes} />
              <span className="text-[#393f49] text-[12px] font-medium">:</span>
              <TimeUnit value={countdown.seconds} unit={TIME_UNITS.seconds} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function RewardCard({ rewards }: { rewards: Reward[] }) {
  if (!rewards || rewards.length === 0) {
    return null;
  }

  return (
    <div className="common-container-style flex w-full desktop:w-[320px] flex-col items-start gap-4">
      <div className="text-[20px] font-bold text-[#393f49] font-serif">
        Rewards
      </div>

      {/* Reward list */}
      <div className="flex flex-col gap-2 w-full">
        {rewards.map((reward, index) => (
          <div key={reward.typeId || index} className="flex items-center gap-1">
            {/* Reward icon */}
            <div className="w-5 h-5 relative">
              {reward.icon ? (
                <img src={reward.icon} alt={reward.name} className="w-full h-full object-contain" />
              ) : (
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(130deg, #74FFDE 1%, #00DE73 25%, #41F09C 50%, #03D26E 75%, #00C466 97%)',
                    boxShadow: '0px 3.33px 8.33px rgba(222, 228, 235, 0.25)',
                    mask: 'url(https://statics.bloomprotocol.ai/logo/water-drop-icon.svg) center/contain no-repeat',
                    WebkitMask: 'url(https://statics.bloomprotocol.ai/logo/water-drop-icon.svg) center/contain no-repeat'
                  }}
                />
              )}
            </div>
            {/* Reward amount */}
            <div className="text-[14px] font-medium text-[#393f49] leading-[16.8px] font-['Outfit']">
              {reward.amount || 0}
            </div>
            {/* Reward name */}
            <div className="text-[14px] font-light text-[#696f8c] leading-[19.6px] font-['Outfit']">
              {reward.name || 'Points'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SubmitPostCard({ postId, isUpcoming = false }: { postId: string; isUpcoming?: boolean }) {
  const [xPostUrl, setXPostUrl] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{
    status: 'submitted' | 'duplicate' | 'approved' | 'validation_error';
    message: string;
  } | null>(null);

  // Shared submission logic
  const processSubmission = async (url: string, onSuccess: () => void) => {
    setIsSubmitting(true);

    try {
      const response = await socialMissionService.checkManualSubmission(postId, url);

      // Map backend response to frontend status
      let status: 'submitted' | 'duplicate' | 'approved' | 'validation_error' = 'submitted';

      if (response.data?.status === 'approved') {
        status = 'approved';
      } else if (response.data?.status === 'error') {
        status = 'validation_error';
      } else if (response.data?.message?.includes('already in queue')) {
        status = 'duplicate';
      }

      setSubmissionResult({
        status,
        message: response.data?.message || 'Submission processed'
      });

      onSuccess();
    } catch (error: any) {
      logger.error('Manual submission error', { error });

      // Extract error message from backend response
      let errorMessage = 'Failed to check submission status. Please try again.';

      if (error?.response?.data?.cause && Array.isArray(error.response.data.cause)) {
        errorMessage = error.response.data.cause.join('; ');
      } else if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      setSubmissionResult({
        status: 'validation_error',
        message: errorMessage
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (!xPostUrl.trim() || isSubmitting) return;
    await processSubmission(xPostUrl, () => setIsExpanded(false));
  };

  const handleModalSubmit = async (data: { xPostUrl: string }) => {
    if (isSubmitting) return;
    await processSubmission(data.xPostUrl, () => setIsModalOpen(false));
  };

  const handleButtonClick = () => {
    // Remove previous result and clear input when opening form
    setSubmissionResult(null);
    setXPostUrl('');

    if (window.innerWidth >= 1280) {
      // Desktop: toggle inline form
      setIsExpanded(!isExpanded);
    } else {
      // Mobile: open modal
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <div className="common-container-style" style={{ padding: 0 }}>
        <div className="px-4 py-1">
          {/* Task group header */}
          <div className="flex items-center justify-between py-5 border-b border-[#e7e6f2]">
            <h4 className="text-[14px] font-semibold text-[#393f49] font-serif">
              Manual Submission - Post Taking Longer to Appear?
            </h4>
          </div>

          {/* Task: Submit Post */}
          <div className="flex items-center py-4">
            <div className="flex-1 flex flex-col gap-0.5 min-w-0">
              <div className="text-[14px] font-medium text-[#393f49] tracking-[-0.28px] truncate">
                Your post link
              </div>
            </div>

            <div className="shrink-0 ml-3">
              {isExpanded ? (
                <PendingButton onClick={handleButtonClick}>Cancel</PendingButton>
              ) : (
                <SubmitButton onClick={handleButtonClick} disabled={isUpcoming}>Submit</SubmitButton>
              )}
            </div>
          </div>

          {/* Desktop inline form */}
          {isExpanded && (
            <div className="bg-[rgba(255,255,255,0.6)] border border-[#dad9e5] rounded-xl p-3 w-full mb-4">
              <div>
                <label className="text-[12px] text-[#696f8c] mb-1 block">
                  X Post URL (Required)
                </label>
                <input
                  type="url"
                  value={xPostUrl}
                  onChange={(e) => setXPostUrl(e.target.value)}
                  placeholder="https://x.com/username/status/..."
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8e38ff] focus:border-[#8e38ff] text-[14px]"
                />
              </div>
              <div className="flex justify-end mt-3">
                {isSubmitting ? (
                  <PendingButton disabled>Checking...</PendingButton>
                ) : (
                  <SubmitButton onClick={handleSubmit} disabled={!xPostUrl.trim()}>Submit</SubmitButton>
                )}
              </div>
            </div>
          )}

          {/* Submission Result */}
          {submissionResult && (
            <div className="mb-4">
              <div
                className={`flex gap-[8px] items-start p-[10px] rounded-[12px] w-full ${
                  submissionResult.status === 'submitted' || submissionResult.status === 'duplicate'
                    ? 'bg-[rgba(132,120,224,0.1)]' // Blue/purple for info messages
                    : submissionResult.status === 'approved'
                    ? 'bg-[rgba(113,202,65,0.1)]' // Green for success
                    : 'bg-[rgba(247,89,255,0.1)]' // Pink for validation warnings
                }`}
              >
                <div className="font-['Outfit'] font-medium text-[14px] leading-[1.4]">
                  {submissionResult.status === 'submitted' ? '✅' :
                   submissionResult.status === 'duplicate' ? 'ℹ️' :
                   submissionResult.status === 'approved' ? '✅' :
                   submissionResult.status === 'validation_error' ? '⚠️' : '⏳'}
                </div>
                <div className="font-['Outfit'] font-medium text-[14px] text-[#393f49] leading-[1.4] flex-1">
                  {submissionResult.message}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile modal */}
      <SocialMissionSubmissionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
      />
    </>
  );
}

function RulesCard() {
  const [showTooltip, setShowTooltip] = useState(false);
  // 用戶交互狀態：是否已手動操作過
  const [hasMainInteracted, setHasMainInteracted] = useState(false);
  const [hasRewardsInteracted, setHasRewardsInteracted] = useState(false);
  // 展開狀態：用戶手動操作後的狀態
  const [isMainExpanded, setIsMainExpanded] = useState(true);
  const [isRewardsExpanded, setIsRewardsExpanded] = useState(true);

  const handleMainToggle = () => {
    setHasMainInteracted(true);
    setIsMainExpanded(!isMainExpanded);
  };

  const handleRewardsToggle = () => {
    setHasRewardsInteracted(true);
    setIsRewardsExpanded(!isRewardsExpanded);
  };

  // 判斷是否應該顯示內容
  // - 用戶未交互：用 CSS 控制（Desktop 展開，Mobile 收起）
  // - 用戶已交互：用 JS state 控制
  const shouldShowMain = hasMainInteracted ? isMainExpanded : true;
  const shouldShowRewards = hasRewardsInteracted ? isRewardsExpanded : true;

  // 箭頭旋轉狀態
  // - 用戶未交互：Desktop 旋轉（展開），Mobile 不旋轉（收起）→ 用 CSS
  // - 用戶已交互：根據 state
  const mainArrowClass = hasMainInteracted
    ? (isMainExpanded ? 'rotate-180' : '')
    : 'desktop:rotate-180';
  const rewardsArrowClass = hasRewardsInteracted
    ? (isRewardsExpanded ? 'rotate-180' : '')
    : 'desktop:rotate-180';

  // 主要內容
  const MainContent = () => (
    <ul
      className="list-disc text-[#696f8c] text-[14px] tracking-[-0.28px] w-full pl-[21px] font-['Outfit']"
    >
      <li className="mb-1 last:mb-0">
        <span className="leading-[1.4]">Follow the requirements in the original X post</span>
      </li>
      <li className="mb-1 last:mb-0">
        <span className="leading-[1.4]">Mention @bloom__protocol and the mission creator&apos;s account</span>
      </li>
      <li className="mb-1 last:mb-0">
        <span className="leading-[1.4]">
          Post must include your public profile link{' '}
          <span className="relative inline-block">
            <span
              className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full border border-[#696f8c] text-[10px] cursor-help"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              ?
            </span>
            {showTooltip && (
              <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-[#393f49] text-white text-[12px] rounded-lg whitespace-nowrap z-10 shadow-lg font-['Outfit']">
                Used for instant USDT reward distribution - claim yours at{' '}
                <a
                  href="/profile/x402"
                  className="text-[#8478e0] hover:opacity-80 no-underline"
                >
                  /profile/x402
                </a>
                <span className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-[#393f49]"></span>
              </span>
            )}
          </span>
        </span>
      </li>
      <li className="mb-1 last:mb-0">
        <span className="leading-[1.4]">Posts are automatically tracked as submissions</span>
      </li>
      <li className="mb-1 last:mb-0">
        <span className="leading-[1.4]">Submit manually if your post isn&apos;t detected</span>
      </li>
    </ul>
  );

  // 獎勵內容
  const RewardsContent = () => (
    <ul
      className="list-disc text-[#696f8c] text-[14px] tracking-[-0.28px] w-full pl-[21px] mt-3 font-['Outfit']"
    >
      <li className="mb-1 last:mb-0">
        <span className="leading-[1.4]">Rewards distributed after approval</span>
      </li>
      <li className="mb-1 last:mb-0">
        <span className="leading-[1.4]">Drops: Auto-credited to your Bloom Protocol account</span>
      </li>
      <li className="mb-1 last:mb-0">
        <span className="leading-[1.4]">USDT: Sent to the wallet address linked in your public profile</span>
      </li>
    </ul>
  );

  return (
    <div className="common-container-style flex w-full desktop:w-[320px] flex-col items-start gap-4">
      {/* Main collapsible header */}
      <button
        onClick={handleMainToggle}
        className="w-full flex items-center justify-between font-bold text-[#393f49] text-[18px] leading-none hover:opacity-80 transition-opacity font-serif"
      >
        <span>How to Participate</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className={`transition-transform duration-200 ${mainArrowClass}`}
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

      {/* Main content - CSS 控制初始狀態，JS 控制交互後狀態 */}
      {hasMainInteracted ? (
        // 用戶已交互：用 JS state 控制
        shouldShowMain && <MainContent />
      ) : (
        // 用戶未交互：用 CSS 控制（Desktop 展開，Mobile 收起）
        <div className="hidden desktop:block w-full">
          <MainContent />
        </div>
      )}

      {/* Collapsible rewards section - independent from main section */}
      <div className="w-full border-t border-[#e6e8ec] pt-4">
        <button
          onClick={handleRewardsToggle}
          className="w-full flex items-center justify-between font-bold text-[#393f49] text-[18px] leading-none hover:opacity-80 transition-opacity font-serif"
        >
          <span>How are rewards distributed?</span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className={`transition-transform duration-200 ${rewardsArrowClass}`}
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

        {/* Rewards content - CSS 控制初始狀態，JS 控制交互後狀態 */}
        {hasRewardsInteracted ? (
          // 用戶已交互：用 JS state 控制
          shouldShowRewards && <RewardsContent />
        ) : (
          // 用戶未交互：用 CSS 控制（Desktop 展開，Mobile 收起）
          <div className="hidden desktop:block w-full">
            <RewardsContent />
          </div>
        )}
      </div>
    </div>
  );
}

function SubmissionsCard({
  submissions,
  statusFilter,
  setStatusFilter,
  hasMore,
  loading,
  getRelativeTime,
  onLoadMore
}: {
  submissions: Submission[];
  statusFilter: 'all' | 'COMPLETED' | 'IN_PROGRESS';
  setStatusFilter: (filter: 'all' | 'COMPLETED' | 'IN_PROGRESS') => void;
  hasMore: boolean;
  loading: boolean;
  getRelativeTime: (date: string) => string;
  onLoadMore: () => void;
}) {
  return (
    <div className="common-container-style">
      {/* Header with title and type tabs */}
      <div className="flex flex-col gap-4 mb-4">
        {/* Title and tabs container */}
        <div className="flex flex-col desktop:flex-row desktop:items-center desktop:justify-between gap-4">
          <h4 className="text-[14px] font-semibold text-[#393f49] font-serif">
            SUBMISSIONS ({submissions.length})
          </h4>

          {/* Type tabs - responsive positioning */}
          <div className="flex gap-4 desktop:gap-6 overflow-x-auto desktop:overflow-visible pb-1 desktop:pb-0">
            <FilterTab label="All" isActive={statusFilter === "all"} onClick={() => setStatusFilter("all")} />
            <FilterTab label="Approved" isActive={statusFilter === "COMPLETED"} onClick={() => setStatusFilter("COMPLETED")} />
            <FilterTab label="Pending" isActive={statusFilter === "IN_PROGRESS"} onClick={() => setStatusFilter("IN_PROGRESS")} />
          </div>
        </div>
      </div>

      {/* Submissions List */}
      <div className="flex flex-col gap-4">
        {submissions.map((submission) => (
          <div
            key={submission.id}
            className="border border-[#e6e8ec] rounded-xl p-4 flex justify-between items-center"
          >
            {/* Left side - username, view post, and text stacked */}
            <div className="flex flex-col gap-1 flex-1">
              <div className="text-[#393f49] font-semibold text-[14px] font-['Outfit']">
                {submission.username}
              </div>

              {/* Submission text - clickable link to post */}
              <a
                href={submission.xPostUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[14px] text-[#8478e0] no-underline hover:opacity-80 tracking-[-0.28px] font-['Outfit']"
              >
                <span className="leading-[1.4] line-clamp-1">{submission.text}</span>
              </a>
            </div>

            {/* Right side - timestamp and badge, vertically centered */}
            <div className="flex items-center gap-2 ml-4">
              <span className="text-[#696f8c] text-[12px] font-['Outfit']">
                {getRelativeTime(submission.submittedAt)}
              </span>
              <div
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  submission.status === 'COMPLETED'
                    ? 'bg-[#E4FFF0] text-[#00C853]'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {submission.status === 'COMPLETED' ? 'Approved' : 'Pending'}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="mt-5 text-center">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="bg-white text-[#393f49] px-6 py-3 rounded-xl text-[14px] font-semibold border border-[#e6e8ec] cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 font-['Outfit']"
          >
            {loading ? 'Loading...' : 'Load More (20)'}
          </button>
        </div>
      )}
    </div>
  );
}

export default function SocialMissionClient({ initialData, postId }: SocialMissionClientProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'COMPLETED' | 'IN_PROGRESS'>('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check if mission is upcoming (hasn't started yet)
  const isMissionUpcoming = initialData.mission.startTime
    ? new Date(initialData.mission.startTime) > new Date()
    : false;

  // Fetch submissions from API
  const fetchSubmissions = async (resetPage = false) => {
    setLoading(true);
    try {
      const currentPage = resetPage ? 1 : page;
      const data = await socialMissionService.getSubmissions(postId, currentPage, statusFilter);

      if (resetPage) {
        setSubmissions(data.submissions);
        setPage(1);
      } else {
        setSubmissions([...submissions, ...data.submissions]);
      }

      setHasMore(data.pagination.hasMore);
    } catch (error) {
      logger.error('Failed to fetch submissions', { error });
    } finally {
      setLoading(false);
    }
  };

  // Fetch submissions when filter changes
  useEffect(() => {
    fetchSubmissions(true); // Reset to page 1 when filter changes
  }, [statusFilter]);

  // Handle load more button
  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
      fetchSubmissions(false);
    }
  };

  // Format relative time
  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className="flex flex-col desktop:flex-row gap-6">
      {/* Left column - Main content */}
      <div className="w-full desktop:w-[calc(100%-344px)] space-y-5">
        <MissionHeaderCard mission={initialData.mission} stats={initialData.stats} />

        {/* Mobile only - Reward card */}
        <div className="desktop:hidden">
          <RewardCard rewards={initialData.rewards} />
        </div>

        {/* Mobile only - Rules card */}
        <div className="desktop:hidden">
          <RulesCard />
        </div>

        <SubmitPostCard postId={postId} isUpcoming={isMissionUpcoming} />

        <SubmissionsCard
          submissions={submissions}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          hasMore={hasMore}
          loading={loading}
          getRelativeTime={getRelativeTime}
          onLoadMore={handleLoadMore}
        />
      </div>

      {/* Right column - 320px width, hidden on mobile */}
      <div className="hidden desktop:block desktop:w-[320px] desktop:shrink-0 space-y-6">
        <RewardCard rewards={initialData.rewards} />
        <RulesCard />
      </div>
    </div>
  );
}
