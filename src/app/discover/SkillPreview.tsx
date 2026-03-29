'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

const ACCENT = 'rgba(196,164,108,0.9)';

export default function SkillPreview() {
  const [content, setContent] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState(false);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle');
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    fetch('/skill.md')
      .then((r) => (r.ok ? r.text() : Promise.reject()))
      .then(setContent)
      .catch(() => setFetchError(true));
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleCopy = useCallback(async () => {
    if (!content) return;
    try {
      await navigator.clipboard.writeText(content);
      setCopyState('copied');
      timerRef.current = setTimeout(() => setCopyState('idle'), 3000);
    } catch {
      setCopyState('error');
      timerRef.current = setTimeout(() => setCopyState('idle'), 3000);
    }
  }, [content]);

  if (fetchError) {
    return (
      <div
        style={{
          background: 'rgba(10,8,18,0.6)',
          borderRadius: 12,
          padding: 32,
          textAlign: 'center',
        }}
      >
        <p style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 13, color: 'rgba(232,228,223,0.4)', margin: '0 0 12px' }}>
          Failed to load skill.md
        </p>
        <a
          href="/skill.md"
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 13, color: ACCENT, textDecoration: 'underline' }}
        >
          Open directly &rarr;
        </a>
      </div>
    );
  }

  if (!content) {
    return (
      <div
        style={{
          background: 'rgba(10,8,18,0.6)',
          borderRadius: 12,
          padding: 32,
          textAlign: 'center',
        }}
      >
        <p style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 13, color: 'rgba(232,228,223,0.4)' }}>
          Loading skill.md...
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        background: 'rgba(10,8,18,0.7)',
        border: '1px solid rgba(196,164,108,0.15)',
        borderRadius: 12,
        overflow: 'hidden',
      }}
    >
      {/* Header bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 16px',
          borderBottom: '1px solid rgba(232,228,223,0.06)',
          background: 'rgba(10,8,18,0.4)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              fontFamily: 'var(--font-jetbrains-mono), monospace',
              fontSize: 12,
              color: 'rgba(232,228,223,0.5)',
            }}
          >
            skill.md
          </span>
          <span
            style={{
              fontFamily: 'var(--font-dm-sans), sans-serif',
              fontSize: 10,
              color: 'rgba(196,164,108,0.6)',
              background: 'rgba(196,164,108,0.08)',
              padding: '2px 8px',
              borderRadius: 4,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Bloom Tribe Skill
          </span>
        </div>
        <button
          onClick={handleCopy}
          style={{
            fontFamily: 'var(--font-dm-sans), sans-serif',
            fontSize: 12,
            fontWeight: 600,
            padding: '5px 14px',
            borderRadius: 6,
            border: `1px solid ${copyState === 'copied' ? 'rgba(46,139,87,0.5)' : 'rgba(196,164,108,0.3)'}`,
            cursor: 'pointer',
            background: copyState === 'copied' ? 'rgba(46,139,87,0.15)' : 'transparent',
            color: copyState === 'copied' ? '#5aba80' : ACCENT,
            transition: 'all 0.2s',
          }}
        >
          {copyState === 'copied' ? 'Copied!' : copyState === 'error' ? 'Failed' : 'Copy'}
        </button>
      </div>

      {/* Content */}
      <div
        style={{
          maxHeight: 400,
          overflow: 'auto',
          padding: '16px 20px',
        }}
      >
        <pre
          style={{
            fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
            fontSize: 12,
            lineHeight: 1.7,
            color: 'rgba(232,228,223,0.75)',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            margin: 0,
          }}
        >
          {content}
        </pre>
      </div>

      {/* Footer hint */}
      <div
        style={{
          padding: '10px 16px',
          borderTop: '1px solid rgba(232,228,223,0.06)',
          textAlign: 'center',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-dm-sans), sans-serif',
            fontSize: 12,
            color: 'rgba(232,228,223,0.35)',
            margin: 0,
          }}
        >
          Copy and paste into your agent &mdash; Claude, Cursor, OpenClaw, or any agent
        </p>
      </div>
    </div>
  );
}
