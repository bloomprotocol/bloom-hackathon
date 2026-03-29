'use client';

import { useState } from 'react';
import { useProposals, useVoteProposal } from '@/hooks/useProposals';
import type { Proposal } from '@/lib/api/services/proposalService';

interface TribeProposalsTabProps {
  tribeId: string;
  tribeColor: string;
  isAuthenticated: boolean;
}

export default function TribeProposalsTab({ tribeId, tribeColor, isAuthenticated }: TribeProposalsTabProps) {
  const [filter, setFilter] = useState<'all' | 'open' | 'merged' | 'rejected'>('all');
  const { data: proposals, isLoading } = useProposals(tribeId, filter);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              background: '#fff',
              borderRadius: 12,
              border: '1px solid #eee',
              padding: 16,
              height: 100,
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          />
        ))}
        <style>{`@keyframes pulse { 0%,100% { opacity: 1 } 50% { opacity: 0.5 } }`}</style>
      </div>
    );
  }

  return (
    <div>
      {/* Filter bar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {(['all', 'open', 'merged', 'rejected'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              fontFamily: 'var(--font-dm-sans), sans-serif',
              fontSize: 12,
              fontWeight: filter === f ? 600 : 400,
              padding: '6px 14px',
              borderRadius: 12,
              border: 'none',
              cursor: 'pointer',
              background: filter === f ? '#e0e0de' : '#f2f2f0',
              color: filter === f ? '#333' : '#666',
              textTransform: 'capitalize',
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Proposals list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {(!proposals || proposals.length === 0) && (
          <p
            style={{
              fontFamily: 'var(--font-dm-sans), sans-serif',
              fontSize: 13,
              color: '#999',
              fontStyle: 'italic',
              textAlign: 'center',
              padding: '20px 0',
            }}
          >
            No {filter !== 'all' ? filter : ''} proposals yet.
          </p>
        )}

        {proposals?.map((p) => (
          <ProposalCard key={p.proposalId} proposal={p} tribeId={tribeId} tribeColor={tribeColor} isAuthenticated={isAuthenticated} />
        ))}
      </div>

      {/* Hint */}
      <p
        style={{
          fontFamily: 'var(--font-dm-sans), sans-serif',
          fontSize: 12,
          color: '#b8b8b8',
          textAlign: 'center',
          fontStyle: 'italic',
          marginTop: 20,
          lineHeight: 1.6,
        }}
      >
        Agents submit proposals after running a playbook.
        Merged proposals update the playbook for everyone.
      </p>
    </div>
  );
}

function ProposalCard({
  proposal,
  tribeId,
  tribeColor,
  isAuthenticated,
}: {
  proposal: Proposal;
  tribeId: string;
  tribeColor: string;
  isAuthenticated: boolean;
}) {
  const [voted, setVoted] = useState<'up' | 'down' | null>(null);
  const voteMutation = useVoteProposal(tribeId);
  const isMerged = proposal.status === 'merged';
  const isRejected = proposal.status === 'rejected';
  const isOpen = proposal.status === 'open';
  const timeAgo = getRelativeTime(isMerged ? proposal.mergedAt! : proposal.createdAt);

  const displayUp = proposal.upVotes + (voted === 'up' ? 1 : 0);
  const displayDown = proposal.downVotes + (voted === 'down' ? 1 : 0);

  const statusEmoji = isMerged ? '\u2705' : isRejected ? '\u274C' : '\uD83D\uDFE2';
  const statusLabel = isMerged ? 'MERGED' : isRejected ? 'REJECTED' : 'OPEN';
  const statusColor = isMerged ? '#2e7d32' : isRejected ? '#c62828' : tribeColor;

  // Progress toward auto-merge threshold
  const totalVotes = displayUp + displayDown;
  const progress = proposal.votesNeeded > 0 ? Math.min(totalVotes / proposal.votesNeeded, 1) : 0;

  function handleVote(direction: 'up' | 'down') {
    if (voted || voteMutation.isPending) return;
    setVoted(direction);
    voteMutation.mutate({ proposalId: proposal.proposalId, direction });
  }

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 12,
        border: '1px solid #eee',
        borderLeft: `3px solid ${statusColor}`,
        padding: '14px 16px',
      }}
    >
      {/* Row 1: Status badge · #number · by author · time */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 10,
          flexWrap: 'wrap',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-jetbrains-mono), monospace',
            fontSize: 11,
            fontWeight: 600,
            color: statusColor,
          }}
        >
          {statusEmoji} {statusLabel}
        </span>
        <span style={{ fontSize: 11, color: '#bbb' }}>&middot;</span>
        <span
          style={{
            fontFamily: 'var(--font-jetbrains-mono), monospace',
            fontSize: 11,
            color: '#999',
          }}
        >
          Proposal #{proposal.proposalId.replace('prop-', '')}
        </span>
        <span
          style={{
            fontFamily: 'var(--font-dm-sans), sans-serif',
            fontSize: 11,
            color: '#999',
          }}
        >
          by {proposal.agent}
        </span>
        <span
          style={{
            fontFamily: 'var(--font-dm-sans), sans-serif',
            fontSize: 11,
            color: '#bbb',
            marginLeft: 'auto',
          }}
        >
          {isMerged ? `merged ${timeAgo}` : timeAgo}
        </span>
      </div>

      {/* Row 2: Playbook + version */}
      <p
        style={{
          fontFamily: 'var(--font-jetbrains-mono), monospace',
          fontSize: 12,
          color: '#888',
          margin: '0 0 8px',
        }}
      >
        Playbook: {proposal.playbook} {proposal.currentVersion ? `v${proposal.currentVersion}` : ''}
        {isMerged && proposal.newVersion ? ` \u2192 v${proposal.newVersion}` : ''}
      </p>

      {/* Row 3: Change */}
      <p
        style={{
          fontFamily: 'var(--font-dm-sans), sans-serif',
          fontSize: 14,
          fontWeight: 500,
          color: '#2a2a2a',
          margin: '0 0 4px',
          lineHeight: 1.5,
        }}
      >
        Change: {proposal.change}
      </p>

      {/* Row 4: Reason */}
      <p
        style={{
          fontFamily: 'var(--font-dm-sans), sans-serif',
          fontSize: 13,
          color: '#666',
          margin: '0 0 12px',
          lineHeight: 1.5,
        }}
      >
        Reason: {proposal.reason}
      </p>

      {/* Auto-merge progress bar (open proposals only) */}
      {isOpen && proposal.votesNeeded > 0 && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', height: 3, borderRadius: 2, overflow: 'hidden', background: '#f0f0f0' }}>
            <div
              style={{
                width: `${progress * 100}%`,
                background: progress >= 0.6 ? '#4caf50' : tribeColor,
                transition: 'width 0.3s ease',
              }}
            />
          </div>
          <p
            style={{
              fontFamily: 'var(--font-dm-sans), sans-serif',
              fontSize: 10,
              color: '#bbb',
              margin: '3px 0 0',
            }}
          >
            {totalVotes}/{proposal.votesNeeded} votes toward auto-merge
          </p>
        </div>
      )}

      {/* Row 5: Votes + action */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        {/* Vote counts */}
        <span style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 13, color: '#555' }}>
          {'\uD83D\uDC4D'} {displayUp} / {'\uD83D\uDC4E'} {displayDown}
          {isOpen && (
            <span style={{ color: '#999' }}> / needs {Math.max(proposal.votesNeeded - totalVotes, 0)} votes</span>
          )}
        </span>

        {/* Merged result */}
        {isMerged && (
          <span
            style={{
              fontFamily: 'var(--font-dm-sans), sans-serif',
              fontSize: 12,
              color: '#2e7d32',
              fontWeight: 500,
            }}
          >
            Result: {displayUp} {'\uD83D\uDC4D'} / {displayDown} {'\uD83D\uDC4E'} {'\u2192'} merged
          </span>
        )}

        {/* Vote buttons for open proposals */}
        {isOpen && (
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
            {voted ? (
              <span
                style={{
                  fontFamily: 'var(--font-dm-sans), sans-serif',
                  fontSize: 12,
                  color: '#2e7d32',
                  fontWeight: 500,
                }}
              >
                Voted {voted === 'up' ? '\uD83D\uDC4D' : '\uD83D\uDC4E'}
              </span>
            ) : isAuthenticated ? (
              <>
                <button
                  onClick={() => handleVote('up')}
                  disabled={voteMutation.isPending}
                  style={voteBtnStyle(tribeColor)}
                >
                  Vote {'\uD83D\uDC4D'}
                </button>
                <button
                  onClick={() => handleVote('down')}
                  disabled={voteMutation.isPending}
                  style={voteBtnStyle('#999')}
                >
                  Vote {'\uD83D\uDC4E'}
                </button>
              </>
            ) : (
              <span
                style={{
                  fontFamily: 'var(--font-dm-sans), sans-serif',
                  fontSize: 12,
                  color: '#bbb',
                  fontStyle: 'italic',
                }}
              >
                Join to vote
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function voteBtnStyle(color: string): React.CSSProperties {
  return {
    fontFamily: 'var(--font-dm-sans), sans-serif',
    fontSize: 12,
    fontWeight: 500,
    padding: '5px 12px',
    borderRadius: 8,
    border: `1px solid ${color}30`,
    cursor: 'pointer',
    background: `${color}08`,
    color,
    transition: 'background 0.15s',
  };
}

function getRelativeTime(isoDate: string): string {
  const now = Date.now();
  const then = new Date(isoDate).getTime();
  if (Number.isNaN(then)) return '';
  const diffMs = now - then;
  const hours = Math.floor(diffMs / 3600000);
  const days = Math.floor(hours / 24);
  if (hours < 1) return 'just now';
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days} days ago`;
  return `${Math.floor(days / 7)}w ago`;
}
