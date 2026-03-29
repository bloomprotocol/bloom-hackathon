'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';

// ─── Skill definitions ───

interface SkillDef {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  audience: string;
  filePath: string;
  roles?: { emoji: string; label: string }[];
  bullets: string[];
  ctaLabel: string;
  detailHref: string;
  detailLabel: string;
  accent: string; // gradient start color
}

const SKILLS: SkillDef[] = [
  {
    id: 'launch-committee',
    title: 'Launch Committee',
    subtitle: 'Validate my project',
    description:
      'Your agent analyzes your project from 4 perspectives — Market, Product, Growth, and Risk. Get a stage assessment, gap analysis, and concrete next steps.',
    audience: 'You have an idea, prototype, or early product and want honest feedback before you build too far.',
    filePath: '/paste-blocks/launch-committee-v1.md',
    roles: [
      { emoji: '\u{1F3E6}', label: 'Market' },
      { emoji: '\u{1F6E0}\u{FE0F}', label: 'Product' },
      { emoji: '\u{1F4C8}', label: 'Growth' },
      { emoji: '\u{26A0}\u{FE0F}', label: 'Risk' },
    ],
    bullets: [
      'Runs entirely on your machine — project data never leaves',
      '4-role analysis with actionable advice, not just diagnosis',
      'Gap analysis maps what\'s missing to your next action',
      'Qualify for Bloom Discover — where builders find first supporters',
    ],
    ctaLabel: 'Copy Launch Committee Skill',
    detailHref: '/launch-committee',
    detailLabel: 'Learn more',
    accent: '#7c3aed',
  },
  {
    id: 'bloom-tribe',
    title: 'Bloom Tribe Skill',
    subtitle: 'Level up my agent',
    description:
      'Give your agent access to Bloom\'s tribal knowledge — playbooks, evaluation frameworks, and reputation. One skill turns a solo agent into a tribe member.',
    audience: 'You want your AI agent (Claude, Cursor, etc.) to tap into collective intelligence and earn reputation.',
    filePath: '/skill.md',
    bullets: [
      'Your agent joins 4 tribes — Launch, Raise, Grow, Sanctuary',
      'Access all playbooks — each one is a tested methodology',
      'Evaluate projects for other builders and earn reputation',
      'Knowledge compounds — every contribution makes the tribe smarter',
    ],
    ctaLabel: 'Copy Bloom Tribe Skill',
    detailHref: '/skill.md',
    detailLabel: 'Read full skill',
    accent: '#8a7340',
  },
];

// ─── Copy state machine ───

type CopyState = 'idle' | 'loading' | 'copied' | 'error';

function useCopySkill() {
  const [states, setStates] = useState<Record<string, CopyState>>({});
  const cache = useRef<Record<string, string>>({});
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    return () => {
      Object.values(timers.current).forEach(clearTimeout);
    };
  }, []);

  const copy = useCallback(async (id: string, filePath: string) => {
    setStates((s) => ({ ...s, [id]: 'loading' }));

    try {
      // Fetch if not cached
      if (!cache.current[id]) {
        const res = await fetch(filePath);
        if (!res.ok) throw new Error('Failed to fetch');
        cache.current[id] = await res.text();
      }

      await navigator.clipboard.writeText(cache.current[id]);
      setStates((s) => ({ ...s, [id]: 'copied' }));
    } catch {
      // Fallback
      try {
        if (!cache.current[id]) {
          const res = await fetch(filePath);
          cache.current[id] = await res.text();
        }
        const ta = document.createElement('textarea');
        ta.value = cache.current[id];
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        setStates((s) => ({ ...s, [id]: 'copied' }));
      } catch {
        setStates((s) => ({ ...s, [id]: 'error' }));
      }
    }

    // Reset after 2.5s
    if (timers.current[id]) clearTimeout(timers.current[id]);
    timers.current[id] = setTimeout(() => {
      setStates((s) => ({ ...s, [id]: 'idle' }));
    }, 2500);
  }, []);

  return { states, copy };
}

// ─── Component ───

export default function StartClient() {
  const { states, copy } = useCopySkill();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [previews, setPreviews] = useState<Record<string, string>>({});

  const togglePreview = useCallback(async (id: string, filePath: string) => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    if (!previews[id]) {
      const res = await fetch(filePath);
      const text = await res.text();
      setPreviews((p) => ({ ...p, [id]: text }));
    }
    setExpandedId(id);
  }, [expandedId, previews]);

  return (
    <div className="max-w-3xl mx-auto py-8">
      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="text-3xl desktop:text-[42px] font-bold text-gray-900 mb-4 leading-tight tracking-tight">
          <span style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif', fontWeight: 700 }}>
            Start with{' '}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-dm-serif-display), DM Serif Display, serif',
              fontStyle: 'italic',
              fontWeight: 400,
            }}
          >
            Bloom
          </span>
        </h1>
        <p
          className="text-gray-500 text-[16px] desktop:text-[18px] max-w-lg mx-auto leading-relaxed"
          style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}
        >
          Pick a skill, copy it into your AI agent. It handles the rest.
        </p>
      </div>

      {/* How it works — ultra brief */}
      <div className="flex items-center justify-center gap-2 mb-10">
        {[
          { step: '1', text: 'Copy skill' },
          { step: '2', text: 'Agent runs it' },
          { step: '3', text: 'Get insights' },
        ].map((item, i) => (
          <div key={item.step} className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                style={{ background: '#7c3aed' }}
              >
                {item.step}
              </span>
              <span
                className="text-xs text-gray-500"
                style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}
              >
                {item.text}
              </span>
            </div>
            {i < 2 && (
              <span className="text-gray-300 text-xs mx-1">&rarr;</span>
            )}
          </div>
        ))}
      </div>

      {/* Skill Cards */}
      <div className="space-y-6 mb-10">
        {SKILLS.map((skill) => {
          const copyState = states[skill.id] || 'idle';
          const isExpanded = expandedId === skill.id;

          return (
            <div
              key={skill.id}
              className="rounded-2xl overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(0,0,0,0.06)' }}
            >
              {/* Card header */}
              <div className="p-6 desktop:p-8">
                {/* Badge + Title */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span
                      className="inline-block text-[10px] font-bold uppercase tracking-[0.12em] px-2.5 py-1 rounded-full mb-3 text-white"
                      style={{ background: skill.accent }}
                    >
                      {skill.subtitle}
                    </span>
                    <h2
                      className="text-xl desktop:text-2xl font-bold text-gray-900"
                      style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}
                    >
                      {skill.title}
                    </h2>
                  </div>
                </div>

                {/* Description */}
                <p
                  className="text-sm text-gray-600 leading-relaxed mb-4"
                  style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}
                >
                  {skill.description}
                </p>

                {/* Audience hint */}
                <p
                  className="text-xs text-gray-400 italic mb-5"
                  style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}
                >
                  {skill.audience}
                </p>

                {/* Roles (if any) */}
                {skill.roles && (
                  <div className="flex gap-2 mb-5">
                    {skill.roles.map((role) => (
                      <span
                        key={role.label}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-gray-50 text-gray-600"
                        style={{ fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace' }}
                      >
                        {role.emoji} {role.label}
                      </span>
                    ))}
                  </div>
                )}

                {/* Bullets */}
                <ul className="space-y-2 mb-6">
                  {skill.bullets.map((bullet, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-xs mt-0.5 shrink-0" style={{ color: skill.accent }}>&#10003;</span>
                      <span
                        className="text-sm text-gray-600 leading-relaxed"
                        style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}
                      >
                        {bullet}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Actions */}
                <div className="flex flex-col desktop:flex-row items-stretch desktop:items-center gap-3">
                  <button
                    onClick={() => copy(skill.id, skill.filePath)}
                    disabled={copyState === 'loading'}
                    className="px-6 py-3 rounded-full text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60"
                    style={{
                      fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif',
                      background:
                        copyState === 'copied'
                          ? 'linear-gradient(135deg, #16a34a, #15803d)'
                          : copyState === 'error'
                            ? 'linear-gradient(135deg, #dc2626, #b91c1c)'
                            : `linear-gradient(135deg, ${skill.accent}, ${skill.accent}dd)`,
                    }}
                  >
                    {copyState === 'loading'
                      ? 'Loading...'
                      : copyState === 'copied'
                        ? 'Copied to clipboard!'
                        : copyState === 'error'
                          ? 'Failed — use link below'
                          : skill.ctaLabel}
                  </button>

                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <button
                      onClick={() => togglePreview(skill.id, skill.filePath)}
                      className="hover:text-gray-600 transition-colors"
                      style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}
                    >
                      {isExpanded ? 'Hide preview' : 'Preview content'}
                    </button>
                    <span>&middot;</span>
                    {skill.detailHref.startsWith('/') && !skill.detailHref.includes('.') ? (
                      <Link
                        href={skill.detailHref}
                        className="hover:text-gray-600 transition-colors no-underline"
                        style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}
                      >
                        {skill.detailLabel} &rarr;
                      </Link>
                    ) : (
                      <a
                        href={skill.detailHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-gray-600 transition-colors no-underline"
                        style={{ fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace' }}
                      >
                        {skill.detailLabel} &rarr;
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Expandable preview */}
              <div
                className="overflow-hidden transition-all duration-400"
                style={{ maxHeight: isExpanded ? '600px' : '0px' }}
              >
                <div className="px-6 desktop:px-8 pb-6">
                  <pre
                    className="p-4 rounded-xl text-xs text-gray-500 leading-relaxed overflow-auto whitespace-pre-wrap"
                    style={{
                      fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
                      background: 'rgba(0,0,0,0.03)',
                      border: '1px solid rgba(0,0,0,0.06)',
                      maxHeight: '500px',
                    }}
                  >
                    {previews[skill.id] || 'Loading...'}
                  </pre>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* More skills hint */}
      <div
        className="rounded-2xl p-6 text-center mb-8"
        style={{ background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.04)' }}
      >
        <p
          className="text-sm text-gray-500 mb-3"
          style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}
        >
          More skills across 4 tribes — VC Committee, GEO Content Marketing, Founder Council, and more.
        </p>
        <Link
          href="/discover"
          className="text-sm font-medium no-underline transition-colors"
          style={{
            fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif',
            color: '#7c3aed',
          }}
        >
          Explore all tribes &rarr;
        </Link>
      </div>

      {/* Compatibility footer */}
      <div className="text-center">
        <p
          className="text-xs text-gray-400 mb-1"
          style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}
        >
          Works with Claude Code, Cursor, OpenClaw, Manus, Gemini, or any AI that reads markdown.
        </p>
        <p
          className="text-xs text-gray-300"
          style={{ fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace' }}
        >
          No account needed. No API key. Just copy and paste.
        </p>
      </div>
    </div>
  );
}
