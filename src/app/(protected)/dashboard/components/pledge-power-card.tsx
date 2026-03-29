'use client';

import { useWeeklyLimit } from '@/hooks/usePledges';
import { useAuth } from '@/lib/context/AuthContext';

export default function PledgePowerCard() {
  const { user } = useAuth();
  const { data: weeklyLimit, isLoading, error } = useWeeklyLimit(!!user);

  if (!user) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="p-5 rounded-2xl overflow-hidden bg-white/60 backdrop-blur-md border border-white/50">
        <div className="animate-pulse space-y-3">
          <div className="h-5 bg-gray-200 rounded w-1/3"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="h-2 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    );
  }

  if (error || !weeklyLimit) {
    return null;
  }

  const { totalPower: total, usedThisWeek, remaining, resetsAt } = weeklyLimit;
  // Progress bar shows growth (used/total), not depletion
  const progressPercent = total > 0 ? (usedThisWeek / total) * 100 : 0;

  // Format reset time
  const resetDate = new Date(resetsAt);
  const now = new Date();
  const diffMs = resetDate.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  let resetText = '';
  if (diffDays > 0) {
    resetText = `Resets in ${diffDays}d ${diffHours}h`;
  } else if (diffHours > 0) {
    resetText = `Resets in ${diffHours}h`;
  } else {
    resetText = 'Resets soon';
  }

  return (
    <div
      className="p-5 rounded-2xl overflow-hidden border border-white/50"
      style={{
        background: 'rgba(255, 255, 255, 0.7)',
        boxShadow: '0 8px 32px -8px rgba(0, 0, 0, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.8)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
          Pledge Power
        </h3>
        <span className="text-lg">⚡</span>
      </div>

      {/* Power Display */}
      <div className="mb-3">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-purple-600">{remaining}</span>
          <span className="text-lg text-gray-400">/ {total}</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">Available this week</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(progressPercent, 100)}%` }}
          />
        </div>
      </div>

      {/* Reset Info */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-500">
          Used: <span className="font-medium text-gray-700">{usedThisWeek}</span>
        </span>
        <span className="text-purple-600 font-medium">{resetText}</span>
      </div>
    </div>
  );
}
