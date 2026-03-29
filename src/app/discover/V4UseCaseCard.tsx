'use client';

import Link from 'next/link';
import type { UseCase } from '@/constants/v4-use-case-definitions';

// Map use case IDs to playbook page slugs
const PLAYBOOK_SLUG_MAP: Record<string, string> = {
  geo: 'geo-content-marketing',
  'find-skills': 'find-skills',
};

interface V4UseCaseCardProps {
  useCase: UseCase;
  onClick: (useCase: UseCase) => void;
}

// Card theme per color
const CARD_THEME: Record<UseCase['color'], {
  bg: string;
  gradient: string;
  edge: string;
  shadow: string;
  accent: string;
  accentBg: string;
  accentBorder: string;
}> = {
  purple: {
    bg: '#1e1433',
    gradient: 'radial-gradient(ellipse at 25% 0%, rgba(139,92,246,0.25) 0%, transparent 60%), radial-gradient(ellipse at 75% 100%, rgba(168,85,247,0.12) 0%, transparent 50%)',
    edge: 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(139,92,246,0.05) 40%, transparent 60%)',
    shadow: '0 8px 40px rgba(139,92,246,0.18), 0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
    accent: '#a78bfa',
    accentBg: 'rgba(167,139,250,0.12)',
    accentBorder: 'rgba(167,139,250,0.2)',
  },
  amber: {
    bg: '#1e1a13',
    gradient: 'radial-gradient(ellipse at 75% 0%, rgba(251,191,36,0.2) 0%, transparent 60%), radial-gradient(ellipse at 25% 100%, rgba(245,158,11,0.1) 0%, transparent 50%)',
    edge: 'linear-gradient(135deg, rgba(251,191,36,0.25), rgba(251,191,36,0.05) 40%, transparent 60%)',
    shadow: '0 8px 40px rgba(251,191,36,0.12), 0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
    accent: '#fbbf24',
    accentBg: 'rgba(251,191,36,0.12)',
    accentBorder: 'rgba(251,191,36,0.2)',
  },
};

export default function V4UseCaseCard({ useCase, onClick }: V4UseCaseCardProps) {
  const theme = CARD_THEME[useCase.color];
  const isLive = useCase.status === 'live';
  const isSoon = useCase.status === 'soon';
  const playbookSlug = PLAYBOOK_SLUG_MAP[useCase.id];

  return (
    <div
      role="button"
      tabIndex={0}
      className="relative rounded-[20px] overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-400"
      style={{
        background: theme.bg,
        opacity: isSoon ? 0.75 : 1,
        boxShadow: theme.shadow,
      }}
      onClick={() => onClick(useCase)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(useCase); } }}
    >
      {/* Gradient glow overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: theme.gradient }}
      />

      {/* Edge highlight — top-left */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: theme.edge }}
      />

      {/* Content — 5 elements only */}
      <div className="relative z-10 p-6 flex flex-col gap-4">
        {/* 1. Icon + Status badge */}
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">{useCase.icon}</span>
          <span
            className="px-3 py-1 rounded-full text-[10px] font-semibold tracking-[0.5px] uppercase"
            style={{
              fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
              background: isLive ? theme.accentBg : 'rgba(255,255,255,0.06)',
              color: isLive ? theme.accent : 'rgba(255,255,255,0.35)',
              border: `1px solid ${isLive ? theme.accentBorder : 'rgba(255,255,255,0.08)'}`,
            }}
          >
            {isLive ? 'LIVE' : 'COMING SOON'}
          </span>
        </div>

        {/* 2. Title */}
        <h3
          className="text-[18px] font-bold text-white leading-[1.3]"
          style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}
        >
          {useCase.title}
        </h3>

        {/* 3. Description */}
        <p
          className="text-[13px] leading-[1.7]"
          style={{
            color: 'rgba(209,213,219,0.7)',
            fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {useCase.description}
        </p>

        {/* 4. Skill pills */}
        <div className="flex flex-wrap gap-1.5">
          {useCase.skills.map((skill) => (
            <span
              key={skill.name}
              className="px-2.5 py-1 rounded-full text-[10px] font-medium"
              style={{
                fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
                background: 'rgba(255,255,255,0.06)',
                color: 'rgba(255,255,255,0.5)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              {skill.name}
            </span>
          ))}
        </div>

        {/* 5. CTA button + Read guide link */}
        <div className="pt-2 flex items-center gap-3">
          <span
            className="inline-block text-[12px] font-semibold px-4 py-2 rounded-xl transition-opacity hover:opacity-90"
            style={{
              fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif',
              color: isLive ? theme.accent : 'rgba(255,255,255,0.45)',
              background: isLive ? theme.accentBg : 'rgba(255,255,255,0.06)',
              border: `1px solid ${isLive ? theme.accentBorder : 'rgba(255,255,255,0.1)'}`,
            }}
          >
            {isLive ? 'Claim spot →' : 'Suggest →'}
          </span>
          {playbookSlug && isLive && (
            <Link
              href={`/playbooks/${playbookSlug}`}
              onClick={(e) => e.stopPropagation()}
              className="text-[11px] font-medium transition-opacity hover:opacity-80"
              style={{
                fontFamily: 'var(--font-jetbrains-mono), monospace',
                color: 'rgba(255,255,255,0.4)',
              }}
            >
              Read guide
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
