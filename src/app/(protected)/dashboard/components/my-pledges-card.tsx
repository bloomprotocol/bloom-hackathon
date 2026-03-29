'use client';

import { useMyPledges, useCancelPledge } from '@/hooks/usePledges';
import { useAuth } from '@/lib/context/AuthContext';
import { useState } from 'react';
import Link from 'next/link';

export default function MyPledgesCard() {
  const { user } = useAuth();
  const { data: pledgesData, isLoading, error } = useMyPledges(!!user);
  const cancelPledge = useCancelPledge();
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  if (!user) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="common-container-style p-5 rounded-2xl">
        <div className="animate-pulse space-y-3">
          <div className="h-5 bg-gray-200 rounded w-1/3"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return null;
  }

  const pledges = pledgesData?.items || [];

  const handleCancel = async (pledgeId: string) => {
    if (cancellingId) return;

    setCancellingId(pledgeId);
    try {
      await cancelPledge.mutateAsync(pledgeId);
    } catch (err) {
      console.error('Failed to cancel pledge:', err);
    } finally {
      setCancellingId(null);
    }
  };

  // Format date
  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div
      className="p-5 rounded-2xl overflow-hidden border border-white/50"
      style={{
        background: 'rgba(255, 255, 255, 0.7)',
        boxShadow: '0 8px 32px -8px rgba(0, 0, 0, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.8)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
          My Pledges
        </h3>
        <span className="text-lg">🎯</span>
      </div>

      {pledges.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-gray-500 text-sm mb-3">No active pledges yet</p>
          <div className="flex flex-col gap-2">
            <Link
              href="/discover"
              className="text-purple-600 text-sm font-medium hover:underline"
            >
              Explore Projects →
            </Link>
            <Link
              href="/skills"
              className="text-purple-500 text-xs font-medium hover:underline"
            >
              Back AI Skills →
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1 [scrollbar-width:thin]">
          {pledges.map((pledge) => (
            <div
              key={pledge.pledgeId}
              className="flex items-center justify-between p-3 bg-gray-50/80 rounded-xl"
            >
              <div className="flex-1 min-w-0">
                <Link
                  href={`/projects/${pledge.projectId}`}
                  className="text-sm font-medium text-gray-800 hover:text-purple-600 truncate block"
                >
                  {pledge.projectName || `Project #${pledge.projectId.slice(-6)}`}
                </Link>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-500">
                    {formatDate(pledge.createdAt)}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-purple-600">
                    ⚡ {pledge.pledgePower}
                  </span>
                </div>
              </div>

              <button
                  onClick={() => handleCancel(pledge.pledgeId)}
                  disabled={cancellingId === pledge.pledgeId}
                  className="ml-2 px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-red-500
                           bg-white border border-gray-200 rounded-lg hover:border-red-200
                           transition-colors disabled:opacity-50"
                >
                  {cancellingId === pledge.pledgeId ? '...' : 'Cancel'}
                </button>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      {pledges.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">
              Total Pledged: <span className="font-semibold text-gray-700">
                {pledges.reduce((sum, p) => sum + (p.pledgePower || 0), 0)}
              </span>
            </span>
            <span className="text-gray-500">
              {pledges.length} project{pledges.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
