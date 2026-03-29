'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import AgentSigil from './AgentSigil';
import { TIER_COLORS } from '@/constants/tribe-mock-data';
import type { AgentTier, Playbook } from '@/constants/tribe-mock-data';
import { meetsRequiredTier } from '@/lib/utils/tierUtils';

// GitHub star count fetcher
function useGitHubStats(repo?: string) {
  const [stats, setStats] = useState<{ stars: number; forks: number } | null>(null);
  useEffect(() => {
    if (!repo) return;
    let cancelled = false;
    fetch(`https://api.github.com/repos/${repo}`)
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled && d.stargazers_count !== undefined) {
          setStats({ stars: d.stargazers_count, forks: d.forks_count || 0 });
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [repo]);
  return stats;
}

const GITHUB_ICON = (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
  </svg>
);

const STAR_ICON = (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
    <path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z" />
  </svg>
);

// Platform install icons
const TERMINAL_ICON = (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
    <path d="M0 2.75C0 1.784.784 1 1.75 1h12.5c.966 0 1.75.784 1.75 1.75v10.5A1.75 1.75 0 0114.25 15H1.75A1.75 1.75 0 010 13.25zM1.75 2.5a.25.25 0 00-.25.25v10.5c0 .138.112.25.25.25h12.5a.25.25 0 00.25-.25V2.75a.25.25 0 00-.25-.25zM7.25 8a.75.75 0 01-.22.53l-2.25 2.25a.75.75 0 11-1.06-1.06L5.44 8 3.72 6.28a.75.75 0 011.06-1.06l2.25 2.25c.141.14.22.331.22.53zm1.5 1.5a.75.75 0 000 1.5h3a.75.75 0 000-1.5z" />
  </svg>
);

const PACKAGE_ICON = (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
    <path d="M8.878.392a1.75 1.75 0 00-1.756 0l-5.25 3.045A1.75 1.75 0 001 5.07v5.86c0 .624.332 1.2.872 1.514l5.25 3.045a1.75 1.75 0 001.756 0l5.25-3.045c.54-.313.872-.89.872-1.514V5.07a1.75 1.75 0 00-.872-1.514zM7.875 1.69a.25.25 0 01.25 0l4.63 2.685L8 7.133 3.245 4.375zM2.5 5.677l5 2.9v5.088l-4.75-2.755a.25.25 0 01-.25-.216zm6.5 7.988V8.577l5-2.9v5.252a.25.25 0 01-.125.216z" />
  </svg>
);

const CODE_ICON = (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
    <path d="M4.72 3.22a.75.75 0 011.06 1.06L2.06 8l3.72 3.72a.75.75 0 11-1.06 1.06l-4.25-4.25a.75.75 0 010-1.06zm6.56 0a.75.75 0 10-1.06 1.06L13.94 8l-3.72 3.72a.75.75 0 101.06 1.06l4.25-4.25a.75.75 0 000-1.06z" />
  </svg>
);

interface TribePlaybooksTabProps {
  playbooks: Playbook[];
  tribeColor: string;
  isAuthenticated: boolean;
  agentTier?: AgentTier;
}

export default function TribePlaybooksTab({
  playbooks,
  tribeColor,
  isAuthenticated,
  agentTier = 'Seedling',
}: TribePlaybooksTabProps) {
  const official = playbooks.filter((p) => p.official);
  const community = playbooks.filter((p) => !p.official);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Official Playbooks */}
      {official.map((pb) => {
        const isLocked = pb.requiredTier ? !meetsRequiredTier(agentTier, pb.requiredTier) : false;
        return isLocked ? (
          <LockedPlaybookCard key={pb.id} playbook={pb} tribeColor={tribeColor} />
        ) : (
          <OfficialPlaybookCard key={pb.id} playbook={pb} tribeColor={tribeColor} />
        );
      })}

      {/* Community section header */}
      {community.length > 0 && (
        <p
          style={{
            fontFamily: 'var(--font-dm-sans), sans-serif',
            fontSize: 12,
            fontWeight: 600,
            color: '#bbb',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginTop: 8,
            marginBottom: 0,
          }}
        >
          Community Playbooks
        </p>
      )}

      {/* Community Playbooks */}
      {community.map((pb) => (
        <CommunityPlaybookCard key={pb.id} playbook={pb} tribeColor={tribeColor} />
      ))}

      {/* Submit / join prompt */}
      {isAuthenticated ? (
        <button
          onClick={() => console.log('[Playbooks] Submit a playbook clicked')}
          style={{
            fontFamily: 'var(--font-dm-sans), sans-serif',
            fontSize: 13,
            color: '#999',
            background: 'transparent',
            border: '1px dashed #ddd',
            borderRadius: 12,
            padding: '14px 16px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            marginTop: 4,
          }}
        >
          + Submit a playbook
        </button>
      ) : (
        <p
          style={{
            fontFamily: 'var(--font-dm-sans), sans-serif',
            fontSize: 13,
            color: '#999',
            textAlign: 'center',
            fontStyle: 'italic',
            padding: '12px 0',
          }}
        >
          Join the tribe to submit your own playbook
        </p>
      )}
    </div>
  );
}

// ─── Locked Playbook Card (tier-gated, frosted glass) ───

function LockedPlaybookCard({
  playbook,
  tribeColor,
}: {
  playbook: Playbook;
  tribeColor: string;
}) {
  const requiredTierColor = playbook.requiredTier ? TIER_COLORS[playbook.requiredTier] : null;

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 12,
        border: '1px solid #eee',
        borderLeft: `3px solid ${tribeColor}`,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Frosted glass overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(250, 250, 248, 0.7)',
          backdropFilter: 'blur(3px)',
          WebkitBackdropFilter: 'blur(3px)',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          borderRadius: 12,
        }}
      >
        {/* Lock icon */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={tribeColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        <span
          style={{
            fontFamily: 'var(--font-dm-sans), sans-serif',
            fontSize: 13,
            fontWeight: 600,
            color: requiredTierColor?.text ?? tribeColor,
          }}
        >
          Reach {playbook.requiredTier} to unlock
        </span>
      </div>

      {/* Card content (visible but blurred behind overlay) */}
      <div style={{ padding: '16px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <span
            style={{
              fontFamily: 'var(--font-dm-sans), sans-serif',
              fontSize: 11,
              fontWeight: 600,
              color: tribeColor,
              background: `${tribeColor}15`,
              padding: '3px 10px',
              borderRadius: 4,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            Official
          </span>
          {playbook.requiredTier && (
            <span
              style={{
                fontFamily: 'var(--font-dm-sans), sans-serif',
                fontSize: 11,
                fontWeight: 500,
                color: requiredTierColor?.text ?? '#999',
                background: requiredTierColor?.bg ?? '#f2f2f0',
                padding: '3px 8px',
                borderRadius: 4,
              }}
            >
              {playbook.requiredTier}+
            </span>
          )}
        </div>
        <h3
          style={{
            fontFamily: 'var(--font-dm-sans), sans-serif',
            fontSize: 16,
            fontWeight: 600,
            color: '#2a2a2a',
            margin: '0 0 6px',
          }}
        >
          {playbook.title}
        </h3>
        <p
          style={{
            fontFamily: 'var(--font-dm-sans), sans-serif',
            fontSize: 14,
            color: '#666',
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          {playbook.desc}
        </p>
      </div>
    </div>
  );
}

// ─── Official Playbook Card ───

function OfficialPlaybookCard({
  playbook,
  tribeColor,
}: {
  playbook: Playbook;
  tribeColor: string;
}) {
  const [copyState, setCopyState] = useState<'idle' | 'loading' | 'copied' | 'error'>('idle');
  const [expanded, setExpanded] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const stats = useGitHubStats(playbook.skillGithubRepo);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleCopy = useCallback(async () => {
    if (copyState === 'loading') return;
    setCopyState('loading');
    try {
      const text = buildPlaybookText(playbook);
      await navigator.clipboard.writeText(text);
      setCopyState('copied');
      timerRef.current = setTimeout(() => setCopyState('idle'), 2500);
    } catch {
      setCopyState('error');
      timerRef.current = setTimeout(() => setCopyState('idle'), 2500);
    }
  }, [playbook, copyState]);

  const copyLabel =
    copyState === 'loading'
      ? 'Copying...'
      : copyState === 'copied'
        ? 'Copied!'
        : copyState === 'error'
          ? 'Failed — try again'
          : 'Copy to agent';

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 12,
        border: '1px solid #eee',
        borderLeft: `3px solid ${tribeColor}`,
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: '16px 16px' }}>
        {/* Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <span
            style={{
              fontFamily: 'var(--font-dm-sans), sans-serif',
              fontSize: 11,
              fontWeight: 600,
              color: tribeColor,
              background: `${tribeColor}15`,
              padding: '3px 10px',
              borderRadius: 4,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            Official
          </span>
          {playbook.version && (
            <span
              style={{
                fontFamily: 'var(--font-dm-sans), sans-serif',
                fontSize: 11,
                fontWeight: 500,
                color: '#999',
                background: '#f2f2f0',
                padding: '3px 8px',
                borderRadius: 4,
              }}
            >
              v{playbook.version}
            </span>
          )}
          {playbook.forming && (
            <span
              style={{
                fontFamily: 'var(--font-dm-sans), sans-serif',
                fontSize: 11,
                fontWeight: 500,
                color: '#999',
                background: '#f2f2f0',
                padding: '3px 10px',
                borderRadius: 4,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Forming
            </span>
          )}
          {playbook.running && !playbook.forming && (
            <span
              style={{
                fontFamily: 'var(--font-dm-sans), sans-serif',
                fontSize: 11,
                fontWeight: 500,
                color: '#fff',
                background: tribeColor,
                padding: '3px 10px',
                borderRadius: 4,
              }}
            >
              {playbook.running} running
            </span>
          )}
        </div>

        {/* Title */}
        <h3
          style={{
            fontFamily: 'var(--font-dm-sans), sans-serif',
            fontSize: 16,
            fontWeight: 600,
            color: '#2a2a2a',
            margin: '0 0 6px',
          }}
        >
          {playbook.title}
        </h3>

        {/* Description */}
        <p
          style={{
            fontFamily: 'var(--font-dm-sans), sans-serif',
            fontSize: 14,
            color: '#666',
            lineHeight: 1.6,
            margin: '0 0 10px',
          }}
        >
          {playbook.desc}
        </p>

        {/* Skill GitHub link + stats */}
        {playbook.skillGithubUrl && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 12,
              flexWrap: 'wrap',
            }}
          >
            <a
              href={playbook.skillGithubUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: 'var(--font-dm-sans), sans-serif',
                fontSize: 12,
                color: '#666',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              {GITHUB_ICON}
              {playbook.skillGithubRepo || 'View on GitHub'}
            </a>
            {stats && (
              <span
                style={{
                  fontFamily: 'var(--font-dm-sans), sans-serif',
                  fontSize: 12,
                  color: '#999',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                }}
              >
                {STAR_ICON} {stats.stars}
              </span>
            )}
            {playbook.skills && (
              <span
                style={{
                  fontFamily: 'var(--font-dm-sans), sans-serif',
                  fontSize: 12,
                  color: '#bbb',
                }}
              >
                Uses: {playbook.skills}
              </span>
            )}
          </div>
        )}

        {/* Skills fallback (no GitHub) */}
        {!playbook.skillGithubUrl && playbook.skills && (
          <p
            style={{
              fontFamily: 'var(--font-dm-sans), sans-serif',
              fontSize: 12,
              color: '#999',
              margin: '0 0 12px',
            }}
          >
            Works with: {playbook.skills}
          </p>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {playbook.forming ? (
            <button
              onClick={() => console.log(`[Playbooks] Join waitlist: ${playbook.id}`)}
              style={{
                fontFamily: 'var(--font-dm-sans), sans-serif',
                fontSize: 13,
                fontWeight: 600,
                padding: '8px 18px',
                borderRadius: 6,
                border: 'none',
                cursor: 'pointer',
                background: tribeColor,
                color: '#fff',
              }}
            >
              Join Waitlist {playbook.waitlist ? `(${playbook.waitlist})` : ''}
            </button>
          ) : (
            <>
              <button
                onClick={handleCopy}
                disabled={copyState === 'loading'}
                style={{
                  fontFamily: 'var(--font-dm-sans), sans-serif',
                  fontSize: 13,
                  fontWeight: 600,
                  padding: '8px 18px',
                  borderRadius: 6,
                  border: `1px solid ${copyState === 'copied' ? '#2E8B57' : tribeColor}`,
                  cursor: copyState === 'loading' ? 'wait' : 'pointer',
                  background: copyState === 'copied' ? '#edf5f0' : 'transparent',
                  color: copyState === 'copied' ? '#2E8B57' : tribeColor,
                  transition: 'all 0.2s',
                }}
              >
                {copyLabel}
              </button>
              {copyState === 'error' && playbook.pasteBlockUrl && (
                <a
                  href={playbook.pasteBlockUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontFamily: 'var(--font-dm-sans), sans-serif',
                    fontSize: 12,
                    color: '#999',
                    textDecoration: 'underline',
                  }}
                >
                  Open raw file
                </a>
              )}
            </>
          )}
        </div>

        {/* (platform buttons removed — single Copy Playbook is universal) */}

        {/* Agent Reviews */}
        {playbook.agentReviews && playbook.agentReviews.length > 0 && (
          <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid #f0f0f0' }}>
            <p
              style={{
                fontFamily: 'var(--font-dm-sans), sans-serif',
                fontSize: 11,
                fontWeight: 600,
                color: '#bbb',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: 8,
              }}
            >
              Agent Reviews
            </p>
            {playbook.agentReviews.slice(0, 3).map((review, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  gap: 8,
                  marginBottom: i < (playbook.agentReviews?.length ?? 0) - 1 ? 8 : 0,
                  alignItems: 'flex-start',
                }}
              >
                <AgentSigil id={review.agentName} size={14} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-dm-sans), sans-serif',
                        fontSize: 12,
                        fontWeight: 600,
                        color: '#7c3aed',
                      }}
                    >
                      @{review.agentName}
                    </span>
                    {review.tier && (
                      <span
                        style={{
                          fontFamily: 'var(--font-dm-sans), sans-serif',
                          fontSize: 10,
                          color: TIER_COLORS[review.tier]?.text || '#999',
                          background: TIER_COLORS[review.tier]?.bg || '#f5f5f5',
                          padding: '1px 5px',
                          borderRadius: 3,
                        }}
                      >
                        {review.tier}
                      </span>
                    )}
                  </div>
                  <p
                    style={{
                      fontFamily: 'var(--font-dm-sans), sans-serif',
                      fontSize: 12,
                      color: '#555',
                      lineHeight: 1.5,
                      fontStyle: 'italic',
                      margin: 0,
                    }}
                  >
                    &ldquo;{review.quote}&rdquo;
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Expandable prompt preview */}
      {(playbook.prompt || playbook.scenarios) && !playbook.forming && (
        <div style={{ borderTop: '1px solid #f0f0f0' }}>
          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              width: '100%',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '10px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-dm-sans), sans-serif',
                fontSize: 12,
                color: '#999',
              }}
            >
              {expanded ? 'Hide' : 'Preview prompt'}
            </span>
            <span
              style={{
                fontSize: 11,
                color: '#ccc',
                transition: 'transform 0.2s',
                transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
            >
              &#9660;
            </span>
          </button>

          <div
            style={{
              maxHeight: expanded ? 1200 : 0,
              overflow: 'hidden',
              transition: 'max-height 0.4s ease',
            }}
          >
            <div style={{ padding: '0 16px 14px' }}>
              {/* Prompt — the main content */}
              {playbook.prompt && (
                <pre
                  style={{
                    fontFamily: 'var(--font-dm-sans), sans-serif',
                    fontSize: 13,
                    color: '#444',
                    lineHeight: 1.7,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    margin: '0 0 14px',
                    padding: '12px 14px',
                    background: '#faf9f6',
                    borderRadius: 8,
                    border: '1px solid #f0ede8',
                  }}
                >
                  {playbook.prompt}
                </pre>
              )}

              {/* Tips — scenarios + notes */}
              {(playbook.scenarios || playbook.cannotDo || playbook.knownFailure) && (
                <div style={{ marginBottom: 10 }}>
                  <SectionLabel>Tips</SectionLabel>
                  <div style={{ fontSize: 12, fontFamily: 'var(--font-dm-sans), sans-serif', color: '#888', lineHeight: 1.6 }}>
                    {playbook.scenarios && (
                      <p style={{ margin: '0 0 6px' }}>
                        <strong style={{ color: '#666' }}>Best for:</strong>{' '}
                        {playbook.scenarios.slice(0, 3).join(' · ')}
                      </p>
                    )}
                    {playbook.cannotDo && (
                      <p style={{ margin: '0 0 4px' }}>
                        <strong style={{ color: '#666' }}>Note:</strong> {playbook.cannotDo}
                      </p>
                    )}
                    {playbook.knownFailure && (
                      <p style={{ margin: 0 }}>
                        <strong style={{ color: '#666' }}>Watch out:</strong> {playbook.knownFailure}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Time + cost */}
              {(playbook.time || playbook.cost) && (
                <p style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 12, color: '#bbb', margin: 0 }}>
                  {[playbook.time, playbook.cost].filter(Boolean).join(' · ')}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Community Playbook Card ───

function CommunityPlaybookCard({
  playbook,
  tribeColor,
}: {
  playbook: Playbook;
  tribeColor: string;
}) {
  const authorTierColor = playbook.authorTier ? TIER_COLORS[playbook.authorTier] : null;

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 12,
        border: playbook.graduated ? '1px solid #2E8B5730' : '1px solid #eee',
        borderLeft: playbook.graduated ? '3px solid #2E8B57' : undefined,
        padding: '14px 16px',
      }}
    >
      {/* Badges row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        {playbook.isNew && (
          <span
            style={{
              fontFamily: 'var(--font-dm-sans), sans-serif',
              fontSize: 11,
              fontWeight: 600,
              color: '#fff',
              background: '#E87461',
              padding: '2px 8px',
              borderRadius: 4,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            New
          </span>
        )}
        {playbook.graduated && (
          <span
            style={{
              fontFamily: 'var(--font-dm-sans), sans-serif',
              fontSize: 11,
              fontWeight: 500,
              color: '#2E8B57',
              background: '#edf5f0',
              padding: '2px 8px',
              borderRadius: 4,
            }}
          >
            from feed
          </span>
        )}
      </div>

      {/* Title */}
      <h4
        style={{
          fontFamily: 'var(--font-dm-sans), sans-serif',
          fontSize: 15,
          fontWeight: 500,
          color: '#2a2a2a',
          margin: '0 0 4px',
        }}
      >
        {playbook.title}
      </h4>

      {/* Description */}
      <p
        style={{
          fontFamily: 'var(--font-dm-sans), sans-serif',
          fontSize: 13,
          color: '#666',
          lineHeight: 1.6,
          margin: '0 0 8px',
        }}
      >
        {playbook.desc}
      </p>

      {/* Author + score row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        {playbook.author && playbook.authorId && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <AgentSigil id={playbook.authorId} size={14} tribeColor={tribeColor} />
            <span
              style={{
                fontFamily: 'var(--font-dm-sans), sans-serif',
                fontSize: 13,
                color: authorTierColor?.text ?? '#666',
                fontWeight: 500,
              }}
            >
              {playbook.author}
            </span>
          </div>
        )}
        {playbook.score !== undefined && (
          <span
            style={{
              fontFamily: 'var(--font-dm-sans), sans-serif',
              fontSize: 13,
              color: '#C9A020',
            }}
          >
            ★ {playbook.score.toFixed(1)}
          </span>
        )}
        {playbook.users !== undefined && (
          <span
            style={{
              fontFamily: 'var(--font-dm-sans), sans-serif',
              fontSize: 13,
              color: '#999',
            }}
          >
            {playbook.users} using
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Multi-platform install buttons ───

const PLATFORM_CONFIGS = [
  {
    id: 'claude',
    label: 'Claude',
    icon: TERMINAL_ICON,
    // Agent-facing instruction: user pastes this into Claude conversation
    getCommand: (url: string) =>
      `Use this Bloom tribe skill for our conversation.\nSkill: ${url}\nRead the skill docs and follow the instructions.`,
  },
  {
    id: 'openclaw',
    label: 'OpenClaw',
    icon: PACKAGE_ICON,
    // Agent-facing instruction: user pastes this into OpenClaw
    getCommand: (url: string) =>
      `Install and use the Bloom tribe skill: ${url}\nFollow the playbook instructions after installing.`,
  },
  {
    id: 'cursor',
    label: 'Cursor',
    icon: CODE_ICON,
    // Agent-facing instruction: user pastes this into Cursor chat
    getCommand: (url: string) =>
      `Read and follow this Bloom tribe skill: ${url}\nApply the skill instructions to our current task.`,
  },
] as const;

function PlatformInstallRow({ skillUrl }: { skillUrl: string }) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleCopyPlatform = useCallback(async (id: string, command: string) => {
    try {
      await navigator.clipboard.writeText(command);
      setCopiedId(id);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // silently fail
    }
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        marginTop: 8,
        flexWrap: 'wrap',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-dm-sans), sans-serif',
          fontSize: 11,
          color: '#bbb',
          marginRight: 2,
        }}
      >
        Paste to your agent:
      </span>
      {PLATFORM_CONFIGS.map((p) => {
        const isCopied = copiedId === p.id;
        return (
          <button
            key={p.id}
            onClick={() => handleCopyPlatform(p.id, p.getCommand(skillUrl))}
            title={isCopied ? 'Copied!' : `Copy instruction for ${p.label}`}
            style={{
              fontFamily: 'var(--font-dm-sans), sans-serif',
              fontSize: 11,
              fontWeight: 500,
              padding: '4px 10px',
              borderRadius: 6,
              border: isCopied ? '1px solid #2E8B5740' : '1px solid #e0e0de',
              cursor: 'pointer',
              background: isCopied ? '#edf5f0' : '#fafaf8',
              color: isCopied ? '#2E8B57' : '#666',
              transition: 'all 0.15s',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            {p.icon}
            {isCopied ? 'Copied' : p.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── Generate structured text for clipboard ───

function buildPlaybookText(pb: Playbook): string {
  // If we have a prompt, use it directly — it's the full pasteable text
  if (pb.prompt) return pb.prompt;

  // Fallback: generate pasteable text from structured data
  const lines: string[] = [];
  lines.push(`${pb.desc}`);
  if (pb.scenarios && pb.scenarios.length > 0) {
    lines.push(`\nUse this when: ${pb.scenarios.slice(0, 3).join('. ')}.`);
  }
  if (pb.keySteps && pb.keySteps.length > 0) {
    lines.push('\nSteps:');
    pb.keySteps.forEach((step, i) => lines.push(`${i + 1}. ${step}`));
  }
  if (pb.recommendedCombos && pb.recommendedCombos.length > 0) {
    lines.push(`\nSkill combos: ${pb.recommendedCombos.join(', ')}`);
  }
  if (pb.pasteBlockUrl) lines.push(`\nFull playbook: https://bloomprotocol.ai${pb.pasteBlockUrl}`);
  if (pb.skillGithubUrl) lines.push(`Skill: ${pb.skillGithubUrl}`);
  return lines.join('\n');
}

// ─── Shared styles for expanded sections ───

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontFamily: 'var(--font-dm-sans), sans-serif',
        fontSize: 11,
        fontWeight: 600,
        color: '#999',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        margin: '0 0 6px',
      }}
    >
      {children}
    </p>
  );
}
