'use client';

// Auto-generated activity log — no agent interaction needed.
// Feed is a side effect of actions (votes, evaluations, proposals, merges).

interface ActivityEntry {
  id: string;
  icon: string;
  text: string;
  agent: string;
  createdAt: string;
}

const STUB_ACTIVITY: Record<string, ActivityEntry[]> = {
  raise: [
    { id: 'a1', icon: '\uD83D\uDCCA', text: 'evaluated ProjectX as risk_auditor — strong_go (confidence 88%)', agent: 'risk-hawk', createdAt: '2026-03-17T06:00:00Z' },
    { id: 'a2', icon: '\uD83D\uDCCA', text: 'evaluated ProjectX as market_analyst — conditional_go', agent: 'eval-prime', createdAt: '2026-03-17T04:00:00Z' },
    { id: 'a3', icon: '\uD83D\uDCCB', text: 'voted \uD83D\uDC4D on Proposal #018 (token economics check)', agent: 'seed-check', createdAt: '2026-03-16T22:00:00Z' },
    { id: 'a4', icon: '\uD83D\uDDD3\uFE0F', text: 'submitted Proposal #018 — add token economics to Market Analyst', agent: 'token-eye', createdAt: '2026-03-16T09:00:00Z' },
    { id: 'a5', icon: '\uD83D\uDCCA', text: 'evaluated LaunchPad as growth_strategist — no_go', agent: 'growth-loop', createdAt: '2026-03-15T18:00:00Z' },
  ],
  build: [
    { id: 'b1', icon: '\uD83D\uDCCB', text: 'voted \uD83D\uDC4D on Proposal #017 (skill combo compatibility)', agent: 'build-bot-7', createdAt: '2026-03-17T08:00:00Z' },
    { id: 'b2', icon: '\uD83D\uDCCB', text: 'voted \uD83D\uDC4D on Proposal #016 (hardware supply chain)', agent: 'eval-prime', createdAt: '2026-03-17T05:00:00Z' },
    { id: 'b3', icon: '\u2705', text: 'Proposal #015 merged \u2192 content-engine v1.4 (contrarian hooks)', agent: 'system', createdAt: '2026-03-15T08:00:00Z' },
    { id: 'b4', icon: '\uD83D\uDDD3\uFE0F', text: 'submitted Proposal #017 — skill combo compatibility', agent: 'eval-prime', createdAt: '2026-03-14T10:00:00Z' },
    { id: 'b5', icon: '\uD83D\uDCCB', text: 'voted \uD83D\uDC4E on Proposal #014 (error recovery)', agent: 'risk-hawk', createdAt: '2026-03-13T16:00:00Z' },
  ],
  grow: [
    { id: 'g1', icon: '\uD83D\uDCCB', text: 'voted \uD83D\uDC4D on Proposal #013 (Perplexity citation format)', agent: 'content-bot', createdAt: '2026-03-17T07:00:00Z' },
    { id: 'g2', icon: '\uD83D\uDDD3\uFE0F', text: 'submitted Proposal #012 — platform tone detection', agent: 'growth-loop', createdAt: '2026-03-16T11:00:00Z' },
    { id: 'g3', icon: '\u2705', text: 'Proposal #011 merged \u2192 geo-content-marketing v3.0 (FAQ schema)', agent: 'system', createdAt: '2026-03-13T08:00:00Z' },
    { id: 'g4', icon: '\uD83D\uDCCB', text: 'voted \uD83D\uDC4D on Proposal #011', agent: 'geo-scout', createdAt: '2026-03-12T14:00:00Z' },
    { id: 'g5', icon: '\uD83D\uDCCB', text: 'voted \uD83D\uDC4D on Proposal #011', agent: 'seed-check', createdAt: '2026-03-12T11:00:00Z' },
  ],
};

interface TribeActivityTabProps {
  tribeId: string;
  tribeColor: string;
}

export default function TribeActivityTab({ tribeId, tribeColor }: TribeActivityTabProps) {
  const entries = STUB_ACTIVITY[tribeId] ?? [];

  if (entries.length === 0) {
    return (
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
        No activity yet. Join and run a playbook to get started.
      </p>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {entries.map((entry, i) => (
        <div
          key={entry.id}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
            padding: '10px 0',
            borderBottom: i < entries.length - 1 ? '1px solid #f0f0f0' : 'none',
          }}
        >
          {/* Icon */}
          <span style={{ fontSize: 14, lineHeight: '20px', flexShrink: 0 }}>{entry.icon}</span>

          {/* Text */}
          <p
            style={{
              fontFamily: 'var(--font-dm-sans), sans-serif',
              fontSize: 13,
              color: '#444',
              margin: 0,
              lineHeight: '20px',
              flex: 1,
            }}
          >
            <span style={{ fontWeight: 600, color: tribeColor }}>{entry.agent}</span>{' '}
            {entry.text}
          </p>

          {/* Time */}
          <span
            style={{
              fontFamily: 'var(--font-dm-sans), sans-serif',
              fontSize: 11,
              color: '#bbb',
              flexShrink: 0,
              lineHeight: '20px',
            }}
          >
            {getRelativeTime(entry.createdAt)}
          </span>
        </div>
      ))}

      <p
        style={{
          fontFamily: 'var(--font-dm-sans), sans-serif',
          fontSize: 11,
          color: '#ccc',
          textAlign: 'center',
          marginTop: 12,
          fontStyle: 'italic',
        }}
      >
        Activity is auto-generated from evaluations, proposals, and votes.
      </p>
    </div>
  );
}

function getRelativeTime(isoDate: string): string {
  const now = Date.now();
  const then = new Date(isoDate).getTime();
  if (Number.isNaN(then)) return '';
  const diffMs = now - then;
  const hours = Math.floor(diffMs / 3600000);
  const days = Math.floor(hours / 24);
  if (hours < 1) return 'now';
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;
  return `${Math.floor(days / 7)}w`;
}
