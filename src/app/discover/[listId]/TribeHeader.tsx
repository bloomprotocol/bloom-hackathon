'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TribeTotem from '@/components/tribes/TribeTotem';
import type { Tribe } from '@/constants/tribe-definitions';
import { useKnowledgeStats } from '@/hooks/useTribeKnowledge';

interface TribeHeaderProps {
  tribe: Tribe;
  joinState: 'hidden' | 'can-join' | 'joining' | 'joined';
  accentColor: string;
  accentTextColor: string;
}

export default function TribeHeader({
  tribe,
  joinState,
  accentColor,
  accentTextColor,
}: TribeHeaderProps) {
  const router = useRouter();
  const isForming = tribe.status === 'forming';
  const { data: knowledgeStats } = useKnowledgeStats(tribe.id);

  return (
    <div style={{ textAlign: 'center', marginBottom: isForming ? 0 : 28 }}>
      {/* Back nav */}
      <button
        onClick={() => router.push('/discover')}
        style={{
          background: 'none',
          border: 'none',
          color: '#999',
          cursor: 'pointer',
          fontFamily: 'var(--font-dm-sans), sans-serif',
          fontSize: 15,
          padding: '4px 0',
          marginBottom: 28,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <span style={{ fontSize: 18, lineHeight: 1 }}>&larr;</span>
        Back to tribes
      </button>

      {/* Header: totem + name + tagline */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
        <TribeTotem tribeId={tribe.id} size={isForming ? 64 : 44} />
      </div>

      <h1
        style={{
          fontFamily: 'var(--font-dm-sans), sans-serif',
          fontSize: 22,
          fontWeight: 700,
          color: accentTextColor,
          margin: '0 0 6px',
          letterSpacing: '2.5px',
          textTransform: 'uppercase',
        }}
      >
        {tribe.name}
      </h1>

      <p
        style={{
          fontFamily: 'var(--font-newsreader), serif',
          fontSize: 15,
          fontWeight: 400,
          fontStyle: 'italic',
          color: '#555',
          margin: '0 0 6px',
        }}
      >
        {tribe.tagline}
      </p>

      {/* Creed — subtle vibe line */}
      {tribe.creed && (
        <p
          style={{
            fontFamily: 'var(--font-newsreader), serif',
            fontSize: 13,
            fontWeight: 400,
            fontStyle: 'italic',
            color: '#bbb',
            margin: '0 0 16px',
            maxWidth: 480,
            marginLeft: 'auto',
            marginRight: 'auto',
            lineHeight: 1.6,
          }}
        >
          &ldquo;{tribe.creed}&rdquo;
        </p>
      )}

      {/* Skill Install Banner — re-conversion CTA */}
      {/* Copy prompt banner hidden — Builder CTA cards in TribeDetailClient handle this */}

      {/* Orchestration stats */}
      {joinState !== 'hidden' && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 24,
            margin: '0 auto 20px',
            flexWrap: 'wrap',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-dm-sans), sans-serif',
              fontSize: 13,
              color: '#999',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <strong style={{ color: accentTextColor, fontWeight: 600, fontSize: 15 }}>{knowledgeStats?.totalInsights ?? 0}</strong> tribal insights
          </span>
          <span style={{ color: '#ddd', fontSize: 12 }}>·</span>
          <span
            style={{
              fontFamily: 'var(--font-dm-sans), sans-serif',
              fontSize: 13,
              color: '#999',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <strong style={{ color: accentTextColor, fontWeight: 600, fontSize: 15 }}>{tribe.agentCount || 3}+</strong> specialized roles
          </span>
          <span style={{ color: '#ddd', fontSize: 12 }}>·</span>
          <span
            style={{
              fontFamily: 'var(--font-dm-sans), sans-serif',
              fontSize: 13,
              color: '#999',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <strong style={{ color: accentTextColor, fontWeight: 600, fontSize: 15 }}>100%</strong> local execution
          </span>
        </div>
      )}

      {/* Joined badge */}
      {joinState === 'joined' && (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 16px',
            borderRadius: 8,
            background: '#f0f0f0',
            fontFamily: 'var(--font-dm-sans), sans-serif',
            fontSize: 13,
            fontWeight: 600,
            color: '#999',
            marginBottom: 4,
          }}
        >
          Joined
        </div>
      )}
    </div>
  );
}

const GITHUB_ICON = (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
  </svg>
);

// Compact skill install banner
function SkillInstallBanner({ accentColor, tribeId }: { accentColor: string; tribeId: string }) {
  const [copyState, setCopyState] = useState<'idle' | 'loading' | 'copied' | 'error'>('idle');
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const SKILL_PROMPT = tribeId === 'sanctuary'
    ? `Read https://bloomprotocol.ai/paste-blocks/zen-v1.md and guide me through reflection. This requires World ID verification — if I haven't verified, help me do it first at https://bloomprotocol.ai/discover/sanctuary`
    : `Read https://bloomprotocol.ai/paste-blocks/bloom-claude-code.md and help me get started with Bloom.`;

  const handleCopy = useCallback(async () => {
    if (copyState === 'loading') return;
    setCopyState('loading');
    try {
      await navigator.clipboard.writeText(SKILL_PROMPT);
      setCopyState('copied');
      timerRef.current = setTimeout(() => setCopyState('idle'), 3000);
    } catch {
      setCopyState('error');
      timerRef.current = setTimeout(() => setCopyState('idle'), 3000);
    }
  }, [copyState, SKILL_PROMPT]);

  return (
    <div
      style={{
        margin: '0 auto 24px',
        maxWidth: 620,
        padding: '14px 20px',
        background: '#faf9f6',
        border: '1px solid #eee',
        borderRadius: 12,
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        flexWrap: 'wrap',
      }}
    >
      <div style={{ flex: 1, minWidth: 200 }}>
        <p
          style={{
            fontFamily: 'var(--font-dm-sans), sans-serif',
            fontSize: 14,
            fontWeight: 500,
            color: '#444',
            margin: '0 0 4px',
          }}
        >
          Paste this to your AI agent:
        </p>
        <p
          style={{
            fontFamily: 'var(--font-jetbrains-mono), monospace',
            fontSize: 11,
            color: '#666',
            lineHeight: 1.5,
            maxWidth: 420,
            wordBreak: 'break-word' as const,
          }}
        >
          {SKILL_PROMPT}
        </p>
      </div>
      <button
        onClick={handleCopy}
        disabled={copyState === 'loading'}
        style={{
          fontFamily: 'var(--font-dm-sans), sans-serif',
          fontSize: 13,
          fontWeight: 600,
          padding: '8px 16px',
          borderRadius: 8,
          border: `1px solid ${copyState === 'copied' ? '#2E8B57' : accentColor}`,
          cursor: copyState === 'loading' ? 'wait' : 'pointer',
          background: copyState === 'copied' ? '#edf5f0' : 'transparent',
          color: copyState === 'copied' ? '#2E8B57' : accentColor,
          transition: 'all 0.2s',
          whiteSpace: 'nowrap',
        }}
      >
        {copyState === 'loading' ? 'Copying...' : copyState === 'copied' ? 'Copied!' : copyState === 'error' ? 'Failed' : 'Copy Prompt'}
      </button>
    </div>
  );
}
