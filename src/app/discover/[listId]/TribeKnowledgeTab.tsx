'use client';

import { useState } from 'react';
import { useTribeKnowledge, useKnowledgeStats } from '@/hooks/useTribeKnowledge';
import type { KnowledgeEntry, KnowledgeEntryType } from '@/constants/context-engine-types';

// Card accent colors by entry type
const TYPE_STYLES: Record<KnowledgeEntryType, { accent: string; bg: string; label: string }> = {
  pattern: { accent: '#2e7d32', bg: '#e8f5e9', label: 'Pattern' },
  discovery: { accent: '#1565c0', bg: '#e3f2fd', label: 'Discovery' },
  reflection: { accent: '#e65100', bg: '#fff3e0', label: 'Calibration' },
  evaluation_insight: { accent: '#666', bg: '#f5f5f5', label: 'Insight' },
};

const FRESHNESS_LABEL: Record<string, { text: string; color: string }> = {
  fresh: { text: 'Fresh', color: '#2e7d32' },
  aging: { text: 'Aging', color: '#e65100' },
  stale: { text: 'Stale', color: '#999' },
};

type FilterType = 'all' | KnowledgeEntryType;
type SortType = 'recent' | 'cited' | 'confirmed';

interface TribeKnowledgeTabProps {
  tribeId: string;
  tribeColor: string;
}

export default function TribeKnowledgeTab({ tribeId, tribeColor }: TribeKnowledgeTabProps) {
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('recent');

  const { data: entries, isLoading } = useTribeKnowledge(tribeId, roleFilter, sort);
  const { data: stats } = useKnowledgeStats(tribeId);

  // Apply type filter client-side (role filter is passed to hook)
  const filtered = entries?.filter((e) => typeFilter === 'all' || e.type === typeFilter) ?? [];

  // Get unique roles from entries for role filter
  const roles = [...new Set(entries?.map((e) => e.role).filter(Boolean) ?? [])];

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header stats */}
      {stats && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flexWrap: 'wrap',
            padding: '0 2px',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-jetbrains-mono), monospace',
              fontSize: 11,
              fontWeight: 600,
              color: tribeColor,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            Tribal Knowledge
          </span>
          <span style={{ color: '#ddd', fontSize: 11 }}>·</span>
          <span
            style={{
              fontFamily: 'var(--font-dm-sans), sans-serif',
              fontSize: 12,
              color: '#999',
            }}
          >
            {stats.totalInsights} insights · {stats.totalAgents} agents · updated{' '}
            {timeAgo(stats.lastUpdated)}
          </span>
        </div>
      )}

      {/* Filters */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        {/* Type filters */}
        {(['all', 'pattern', 'discovery', 'reflection', 'evaluation_insight'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            style={{
              fontFamily: 'var(--font-dm-sans), sans-serif',
              fontSize: 12,
              fontWeight: typeFilter === t ? 600 : 400,
              padding: '5px 12px',
              borderRadius: 8,
              border: 'none',
              cursor: 'pointer',
              background: typeFilter === t ? `${tribeColor}15` : 'transparent',
              color: typeFilter === t ? tribeColor : '#666',
              transition: 'all 0.15s',
              whiteSpace: 'nowrap',
            }}
          >
            {t === 'all' ? 'All' : t === 'evaluation_insight' ? 'Insights' : t.charAt(0).toUpperCase() + t.slice(1) + 's'}
          </button>
        ))}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Role filter */}
        {roles.length > 1 && (
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{
              fontFamily: 'var(--font-dm-sans), sans-serif',
              fontSize: 12,
              padding: '5px 8px',
              borderRadius: 6,
              border: '1px solid #eee',
              background: '#fff',
              color: '#666',
              cursor: 'pointer',
            }}
          >
            <option value="all">All roles</option>
            {roles.map((r) => (
              <option key={r} value={r!}>
                {formatRole(r!)}
              </option>
            ))}
          </select>
        )}

        {/* Sort */}
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortType)}
          style={{
            fontFamily: 'var(--font-dm-sans), sans-serif',
            fontSize: 12,
            padding: '5px 8px',
            borderRadius: 6,
            border: '1px solid #eee',
            background: '#fff',
            color: '#666',
            cursor: 'pointer',
          }}
        >
          <option value="recent">Recent</option>
          <option value="cited">Most cited</option>
          <option value="confirmed">Most confirmed</option>
        </select>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <p
            style={{
              fontFamily: 'var(--font-dm-sans), sans-serif',
              fontSize: 14,
              color: '#999',
            }}
          >
            No knowledge entries yet. Run a playbook to start building tribal knowledge.
          </p>
        </div>
      )}

      {/* Knowledge cards */}
      {filtered.map((entry) => (
        <KnowledgeCard key={entry.id} entry={entry} tribeColor={tribeColor} />
      ))}
    </div>
  );
}

function KnowledgeCard({ entry, tribeColor }: { entry: KnowledgeEntry; tribeColor: string }) {
  const style = TYPE_STYLES[entry.type];
  const freshness = getFreshness(entry.createdAt);
  const freshnessStyle = FRESHNESS_LABEL[freshness];

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 12,
        border: '1px solid #eee',
        borderLeft: `3px solid ${style.accent}`,
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      {/* Header: type badge + role + freshness */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span
          style={{
            fontFamily: 'var(--font-jetbrains-mono), monospace',
            fontSize: 10,
            fontWeight: 600,
            color: style.accent,
            background: style.bg,
            padding: '2px 8px',
            borderRadius: 4,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          {style.label}
        </span>
        {entry.role && (
          <span
            style={{
              fontFamily: 'var(--font-jetbrains-mono), monospace',
              fontSize: 10,
              color: '#999',
            }}
          >
            {formatRole(entry.role)}
          </span>
        )}
        <span
          style={{
            fontFamily: 'var(--font-jetbrains-mono), monospace',
            fontSize: 10,
            color: freshnessStyle.color,
            marginLeft: 'auto',
          }}
        >
          {freshnessStyle.text}
        </span>
      </div>

      {/* Content */}
      <p
        style={{
          fontFamily: 'var(--font-dm-sans), sans-serif',
          fontSize: 13,
          color: '#333',
          lineHeight: 1.6,
          margin: 0,
        }}
      >
        &ldquo;{entry.content}&rdquo;
      </p>

      {/* Footer: agent + stats */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        {entry.agent && (
          <span
            style={{
              fontFamily: 'var(--font-dm-sans), sans-serif',
              fontSize: 11,
              color: '#999',
            }}
          >
            {entry.agent}
            {entry.agentTier && (
              <span style={{ color: '#bbb' }}> · {entry.agentTier}</span>
            )}
          </span>
        )}
        <span
          style={{
            fontFamily: 'var(--font-dm-sans), sans-serif',
            fontSize: 11,
            color: '#999',
            marginLeft: entry.agent ? 'auto' : 0,
          }}
        >
          Confirmed by {entry.confirmedBy}
        </span>
        <span style={{ color: '#ddd', fontSize: 10 }}>·</span>
        <span
          style={{
            fontFamily: 'var(--font-dm-sans), sans-serif',
            fontSize: 11,
            color: tribeColor,
            fontWeight: 500,
          }}
        >
          Cited {entry.cited}×
        </span>
        {entry.confidence > 0 && (
          <>
            <span style={{ color: '#ddd', fontSize: 10 }}>·</span>
            <span
              style={{
                fontFamily: 'var(--font-jetbrains-mono), monospace',
                fontSize: 10,
                color: entry.confidence >= 80 ? '#2e7d32' : entry.confidence >= 60 ? '#e65100' : '#999',
              }}
            >
              {entry.confidence}% confidence
            </span>
          </>
        )}
      </div>
    </div>
  );
}

// ── Helpers ──

function formatRole(role: string): string {
  return role
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function getFreshness(dateStr: string): 'fresh' | 'aging' | 'stale' {
  const days = (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24);
  if (days < 30) return 'fresh';
  if (days < 90) return 'aging';
  return 'stale';
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return 'just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}
