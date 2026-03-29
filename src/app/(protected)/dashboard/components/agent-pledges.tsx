'use client';

import { useQuery } from '@tanstack/react-query';
import { agentPledgeService } from '@/lib/api/services/agentPledgeService';
import type { AgentPledge } from '@/lib/api/services/agentPledgeService';
import { useAuth } from '@/lib/context/AuthContext';
import Link from 'next/link';

// Status badge colors
const STATUS_STYLES: Record<AgentPledge['status'], { bg: string; text: string; label: string }> = {
  active: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Active' },
  claimed: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Creator Claimed' },
  refunded: { bg: 'bg-gray-100', text: 'text-gray-500', label: 'Refunded' },
};

// Pass status display
const PASS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: 'bg-amber-50', text: 'text-amber-600', label: 'Pass: Pending creator' },
  active: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Exclusive Pass' },
  expired: { bg: 'bg-gray-50', text: 'text-gray-400', label: 'Pass: Expired' },
};

function getDaysRemaining(expiresAt: string): number {
  const diff = new Date(expiresAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function AgentPledges() {
  const { user } = useAuth();

  const { data: pledges, isLoading: pledgesLoading } = useQuery({
    queryKey: ['agent-pledges'],
    queryFn: () => agentPledgeService.getMyAgentPledges(),
    staleTime: 60 * 1000,
    enabled: !!user,
  });

  const { data: summary } = useQuery({
    queryKey: ['agent-pledges-summary'],
    queryFn: () => agentPledgeService.getAgentPledgeSummary(),
    staleTime: 60 * 1000,
    enabled: !!user,
  });

  if (!user) return null;

  if (pledgesLoading) {
    return (
      <div
        className="p-5 rounded-2xl overflow-hidden border border-white/50"
        style={{
          background: 'rgba(255, 255, 255, 0.7)',
          boxShadow: '0 8px 32px -8px rgba(0, 0, 0, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.8)',
        }}
      >
        <div className="animate-pulse space-y-3">
          <div className="h-5 bg-gray-200 rounded w-2/5"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const activePledges = pledges?.filter(p => p.status === 'active') || [];
  const hasAnyPledges = (pledges?.length || 0) > 0;

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
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Agent Pledges
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Your agent scouts skills for you
          </p>
        </div>
        <span className="text-lg">🔍</span>
      </div>

      {/* Summary Stats */}
      {summary && hasAnyPledges && (
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center p-2 bg-blue-50/60 rounded-xl">
            <p className="text-lg font-bold text-blue-700">${summary.totalActiveUsdc.toFixed(0)}</p>
            <p className="text-[10px] text-blue-600 font-medium">In Escrow</p>
          </div>
          <div className="text-center p-2 bg-emerald-50/60 rounded-xl">
            <p className="text-lg font-bold text-emerald-700">${summary.totalClaimedUsdc.toFixed(0)}</p>
            <p className="text-[10px] text-emerald-600 font-medium">Claimed</p>
          </div>
          <div className="text-center p-2 bg-gray-50/60 rounded-xl">
            <p className="text-lg font-bold text-gray-600">${summary.totalRefundedUsdc.toFixed(0)}</p>
            <p className="text-[10px] text-gray-500 font-medium">Refunded</p>
          </div>
        </div>
      )}

      {/* Pledge List */}
      {!hasAnyPledges ? (
        <div className="text-center py-6">
          <p className="text-gray-500 text-sm mb-1">No agent pledges yet</p>
          <p className="text-gray-400 text-xs mb-3">
            Install Bloom Discovery to let your agent auto-pledge skills
          </p>
          <Link
            href="/for-agents"
            className="text-purple-600 text-sm font-medium hover:underline"
          >
            Set up your agent →
          </Link>
        </div>
      ) : (
        <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1 [scrollbar-width:thin]">
          {(pledges || []).map((pledge) => {
            const status = STATUS_STYLES[pledge.status];
            const daysLeft = getDaysRemaining(pledge.expiresAt);
            const passStyle = pledge.passStatus ? PASS_STYLES[pledge.passStatus] : null;

            return (
              <div
                key={pledge.pledgeId}
                className={`p-3 bg-gray-50/80 rounded-xl ${pledge.passStatus === 'active' ? 'ring-1 ring-emerald-200' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/skills`}
                      className="text-sm font-medium text-gray-800 hover:text-purple-600 truncate block"
                    >
                      {pledge.skillName || pledge.skillSlug}
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">
                        {formatDate(pledge.pledgedAt)}
                      </span>
                      <span className="text-xs font-medium text-gray-600">
                        ${pledge.amount.toFixed(2)}
                      </span>
                      {pledge.status === 'active' && (
                        <span className="text-xs text-blue-500">
                          {daysLeft}d left
                        </span>
                      )}
                    </div>
                  </div>

                  <span className={`ml-2 px-2 py-0.5 rounded-md text-xs font-medium ${status.bg} ${status.text}`}>
                    {status.label}
                  </span>
                </div>

                {/* Pass status + perks */}
                {passStyle && (
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${passStyle.bg} ${passStyle.text}`}>
                      {passStyle.label}
                    </span>
                    {pledge.passStatus === 'active' && pledge.perks && pledge.perks.length > 0 && (
                      <div className="flex gap-1 flex-wrap mt-1.5">
                        {pledge.perks.map(perk => (
                          <span
                            key={perk}
                            className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] font-medium"
                          >
                            {perk}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Footer — Escrow info */}
      {activePledges.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">
              {activePledges.length} active pledge{activePledges.length !== 1 ? 's' : ''} in escrow
            </span>
            <span className="text-blue-600 font-medium">
              Trustless · Auto-refund
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
