'use client';

import { useBuilderDashboard } from '../contexts/builder-dashboard-context';
import { MissionSummary, MissionStatus } from '../constants';

interface MissionCardProps {
  mission: MissionSummary;
}

/**
 * Mission Card
 * Individual mission item with progress bar, reward badge, countdown, and status dot
 */
export default function MissionCard({ mission }: MissionCardProps) {
  const { handleManageMission, handleViewMission, getTimeRemaining } = useBuilderDashboard();

  const isEnded = mission.status === 'Ended';
  const actionLabel = isEnded ? 'View' : 'Manage';
  const handleAction = isEnded ? handleViewMission : handleManageMission;

  // Progress bar calculation (approved / total)
  const progressPct = mission.totalSubmissions > 0
    ? Math.round((mission.approvedCount / mission.totalSubmissions) * 100)
    : 0;

  // Status badge styles with dot indicator
  const statusConfig: Record<MissionStatus, { dot: string; bg: string; text: string }> = {
    Active: { dot: 'bg-[#00C853]', bg: 'bg-[#E4FFF0]', text: 'text-[#00C853]' },
    Ended: { dot: 'bg-[#9ca3af]', bg: 'bg-gray-100', text: 'text-[#696f8c]' },
  };

  const status = statusConfig[mission.status];
  const timeRemaining = !isEnded ? getTimeRemaining(mission.endTime) : null;
  const hasReward = mission.rewardPerSubmission > 0 && mission.rewardToken;

  return (
    <div className="bg-white border border-[#e6e8ec] rounded-lg p-4 flex flex-col">
      {/* Header: Title + Status */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <h4
          className="text-[16px] font-semibold text-[#393f49] line-clamp-1 flex-1"
          style={{ fontFamily: 'Outfit, sans-serif' }}
        >
          {mission.title}
        </h4>
        <span
          className={`px-2.5 py-0.5 rounded-full text-xs font-medium flex-shrink-0 flex items-center gap-1.5 ${status.bg} ${status.text}`}
          style={{ fontFamily: 'Outfit, sans-serif' }}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
          {mission.status}
        </span>
      </div>

      {/* Badges row: reward + countdown */}
      <div className="flex items-center gap-2 mb-3">
        {hasReward && (
          <span
            className="bg-[#e8f9ef] text-[#00873C] text-[12px] font-semibold px-2.5 py-0.5 rounded-full"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            {mission.rewardPerSubmission} {mission.rewardToken}
          </span>
        )}
        {timeRemaining && (
          <span
            className="bg-[#f0eefb] text-[#8478e0] text-[12px] font-medium px-2.5 py-0.5 rounded-full"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            {timeRemaining} left
          </span>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-[#e6e8ec] mb-3" />

      {/* Stats Row + Action */}
      <div className="flex items-center justify-between mb-3">
        <div
          className="text-[13px] text-[#696f8c]"
          style={{ fontFamily: 'Outfit, sans-serif' }}
        >
          {mission.totalSubmissions} Submissions · {mission.approvedCount} Approved · {mission.distributedCount} Distributed
        </div>
        <button
          onClick={() => handleAction(mission.id)}
          className="text-[14px] text-[#8478e0] font-medium hover:opacity-80 flex-shrink-0 ml-3"
          style={{ fontFamily: 'Outfit, sans-serif' }}
        >
          {actionLabel} →
        </button>
      </div>

      {/* Progress bar */}
      <div className="w-full">
        <div className="flex items-center justify-between mb-1">
          <span
            className="text-[11px] text-[#696f8c]"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            Approved
          </span>
          <span
            className="text-[11px] text-[#696f8c] font-medium"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            {progressPct}%
          </span>
        </div>
        <div className="w-full h-1.5 bg-[#f0eefb] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#8478e0] rounded-full transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
