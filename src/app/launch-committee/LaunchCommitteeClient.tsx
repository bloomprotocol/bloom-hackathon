'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';

const SKILL_URL = 'https://bloomprotocol.ai/paste-blocks/launch-committee-v1.md';

const ROLES = [
  { key: 'market', emoji: '\u{1F3E6}', label: 'Market', focus: 'Demand, timing, competition, target users' },
  { key: 'product', emoji: '\u{1F6E0}\u{FE0F}', label: 'Product', focus: 'Feasibility, core value, defensibility' },
  { key: 'growth', emoji: '\u{1F4C8}', label: 'Growth', focus: 'Acquisition, retention, key metric' },
  { key: 'risk', emoji: '\u{26A0}\u{FE0F}', label: 'Risk', focus: 'Fatal assumptions, failure modes, blind spots' },
];

const STAGES = [
  { emoji: '\u{1F331}', label: 'Seeding', description: 'Validating the problem', tribe: 'Launch' },
  { emoji: '\u{1F33F}', label: 'Growing', description: 'Validating the business', tribe: 'Raise' },
  { emoji: '\u{1F333}', label: 'Scaling', description: 'Optimizing the engine', tribe: 'Grow' },
];

const HOW_IT_WORKS = [
  {
    step: '1',
    title: 'Copy the skill',
    description: 'Copy the Launch Committee skill into your AI agent (Claude, Cursor, or any agent that reads markdown).',
  },
  {
    step: '2',
    title: 'Describe your project',
    description: 'Tell your agent about your project. It will ask 1-2 clarifying questions, then run the 4-role analysis.',
  },
  {
    step: '3',
    title: 'Get actionable insights',
    description: 'Receive a stage assessment, gap analysis, and concrete next steps. If your project qualifies, publish it to Bloom Discover.',
  },
];

type CopyState = 'idle' | 'copied' | 'error';

export default function LaunchCommitteeClient() {
  const [copyState, setCopyState] = useState<CopyState>('idle');
  const [showPreview, setShowPreview] = useState(false);
  const [skillContent, setSkillContent] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleCopy = useCallback(async () => {
    try {
      // Fetch the skill content if not already loaded
      let content = skillContent;
      if (!content) {
        const res = await fetch('/paste-blocks/launch-committee-v1.md');
        content = await res.text();
        setSkillContent(content);
      }

      await navigator.clipboard.writeText(content);
      setCopyState('copied');
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopyState('idle'), 2500);
    } catch {
      // Fallback for older browsers
      try {
        const res = await fetch('/paste-blocks/launch-committee-v1.md');
        const text = await res.text();
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        setSkillContent(text);
        setCopyState('copied');
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setCopyState('idle'), 2500);
      } catch {
        setCopyState('error');
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setCopyState('idle'), 2500);
      }
    }
  }, [skillContent]);

  const handleTogglePreview = useCallback(async () => {
    if (!skillContent) {
      const res = await fetch('/paste-blocks/launch-committee-v1.md');
      const content = await res.text();
      setSkillContent(content);
    }
    setShowPreview((prev) => !prev);
  }, [skillContent]);

  return (
    <div className="max-w-3xl mx-auto py-8">
      {/* Hero */}
      <div className="text-center mb-10">
        <p
          className="text-xs uppercase tracking-widest text-[#8a7340] mb-3"
          style={{ fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace' }}
        >
          Launch Tribe Skill
        </p>
        <h1 className="text-3xl desktop:text-[42px] font-bold text-gray-900 mb-4 leading-tight tracking-tight">
          <span style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif', fontWeight: 700 }}>
            Launch{' '}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-dm-serif-display), DM Serif Display, serif',
              fontStyle: 'italic',
              fontWeight: 400,
            }}
          >
            Committee
          </span>
        </h1>
        <p
          className="text-gray-500 text-[16px] desktop:text-[18px] max-w-xl mx-auto leading-relaxed"
          style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}
        >
          4 AI roles analyze your project from Market, Product, Growth, and Risk perspectives.
          Runs entirely on your machine — your project details never leave your agent.
        </p>
      </div>

      {/* Quick start — Bloom Tribe Skill */}
      <div className="mb-8 p-5 rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.06), rgba(196,164,108,0.06))', border: '1px solid rgba(124,58,237,0.15)' }}>
        <div className="flex items-center gap-2 mb-3 justify-center">
          <span className="text-[18px]">🤖</span>
          <span
            className="text-[14px] font-semibold text-gray-800"
            style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}
          >
            Bloom Tribe Skill
          </span>
          <span
            className="text-[10px] px-2 py-0.5 rounded-full"
            style={{
              fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
              background: 'rgba(124,58,237,0.1)',
              color: '#7c3aed',
            }}
          >
            PASTE TO YOUR AGENT
          </span>
        </div>
        <div
          className="rounded-xl p-3 cursor-pointer select-all"
          style={{
            background: 'rgba(15,11,26,0.04)',
            border: '1px solid rgba(0,0,0,0.08)',
          }}
          title="Click to select all"
        >
          <code
            className="block text-[13px] text-center leading-relaxed"
            style={{
              fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
              color: '#4c1d95',
            }}
          >
            Read https://bloomprotocol.ai/paste-blocks/bloom-claude-code.md and help me get started with Bloom.
          </code>
        </div>
        <p className="text-[12px] text-gray-400 mt-3 text-center" style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}>
          Works with Claude Code · Cursor · OpenClaw · Any AI agent
        </p>
      </div>

      {/* Manual copy — advanced users */}
      <div className="flex flex-col items-center gap-3 mb-12">
        <button
          onClick={handleCopy}
          className="w-full desktop:w-auto px-10 py-3.5 rounded-full text-[15px] font-semibold text-white transition-all hover:opacity-90"
          style={{
            fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif',
            background:
              copyState === 'copied'
                ? 'linear-gradient(135deg, #16a34a, #15803d)'
                : copyState === 'error'
                  ? 'linear-gradient(135deg, #dc2626, #b91c1c)'
                  : 'linear-gradient(135deg, #7c3aed, #6d28d9)',
          }}
        >
          {copyState === 'copied'
            ? 'Copied to clipboard!'
            : copyState === 'error'
              ? 'Failed — try the link below'
              : 'Copy Skill to Your Agent'}
        </button>
        <a
          href={SKILL_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors no-underline"
          style={{ fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace' }}
        >
          or open as markdown &rarr;
        </a>
      </div>

      {/* 4 Roles */}
      <div className="mb-10">
        <h2
          className="text-xs uppercase tracking-widest text-gray-400 mb-4 text-center"
          style={{ fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace' }}
        >
          4 Perspectives, One Analysis
        </h2>
        <div className="grid grid-cols-2 desktop:grid-cols-4 gap-3">
          {ROLES.map((role) => (
            <div
              key={role.key}
              className="rounded-2xl p-4 text-center"
              style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(0,0,0,0.06)' }}
            >
              <div className="text-2xl mb-2">{role.emoji}</div>
              <p
                className="text-xs font-bold uppercase tracking-wide text-gray-700 mb-1"
                style={{ fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace' }}
              >
                {role.label}
              </p>
              <p
                className="text-xs text-gray-500 leading-relaxed"
                style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}
              >
                {role.focus}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="mb-10">
        <h2
          className="text-xs uppercase tracking-widest text-gray-400 mb-4 text-center"
          style={{ fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace' }}
        >
          How It Works
        </h2>
        <div className="space-y-3">
          {HOW_IT_WORKS.map((item) => (
            <div
              key={item.step}
              className="rounded-2xl p-5 flex gap-4 items-start"
              style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(0,0,0,0.06)' }}
            >
              <span
                className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}
              >
                {item.step}
              </span>
              <div>
                <p
                  className="text-sm font-semibold text-gray-800 mb-0.5"
                  style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}
                >
                  {item.title}
                </p>
                <p
                  className="text-sm text-gray-500 leading-relaxed"
                  style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}
                >
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stage Assessment */}
      <div className="mb-10">
        <h2
          className="text-xs uppercase tracking-widest text-gray-400 mb-4 text-center"
          style={{ fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace' }}
        >
          Your Agent Tells You Where You Are
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {STAGES.map((stage) => (
            <div
              key={stage.label}
              className="rounded-2xl p-4 text-center"
              style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(0,0,0,0.06)' }}
            >
              <div className="text-2xl mb-1">{stage.emoji}</div>
              <p
                className="text-sm font-semibold text-gray-800 mb-0.5"
                style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}
              >
                {stage.label}
              </p>
              <p
                className="text-xs text-gray-400 mb-1.5"
                style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}
              >
                {stage.description}
              </p>
              <p
                className="text-xs text-[#8a7340]"
                style={{ fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace' }}
              >
                &rarr; {stage.tribe} Tribe
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* What You Get */}
      <div
        className="rounded-2xl p-6 mb-10"
        style={{ background: 'rgba(124,58,237,0.04)', border: '1px solid rgba(124,58,237,0.12)' }}
      >
        <h2
          className="text-xs uppercase tracking-widest text-gray-400 mb-4"
          style={{ fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace' }}
        >
          What You Get
        </h2>
        <ul className="space-y-2.5">
          {[
            'Actionable analysis from 4 AI perspectives — not just diagnosis, but what to do next',
            'Stage assessment (Seeding / Growing / Scaling) with recommended Bloom tribe',
            'Gap analysis — what this evaluation could NOT assess, and how to close each gap',
            'Option to publish to Bloom Discover — where builders find their first supporters',
            'Everything runs locally. Your project details never touch our servers.',
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <span className="text-purple-500 mt-0.5 shrink-0 text-sm">&#10003;</span>
              <span
                className="text-sm text-gray-600 leading-relaxed"
                style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}
              >
                {item}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Preview Toggle */}
      <div className="mb-10">
        <button
          onClick={handleTogglePreview}
          className="w-full flex items-center justify-between px-5 py-3.5 rounded-2xl transition-colors"
          style={{
            fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif',
            background: 'rgba(255,255,255,0.7)',
            border: '1px solid rgba(0,0,0,0.06)',
          }}
        >
          <span className="text-sm font-medium text-gray-700">
            {showPreview ? 'Hide skill content' : 'Preview skill content'}
          </span>
          <span
            className="text-xs text-gray-400 transition-transform"
            style={{ transform: showPreview ? 'rotate(180deg)' : 'rotate(0deg)' }}
          >
            &#9660;
          </span>
        </button>
        <div
          className="overflow-hidden transition-all duration-400"
          style={{ maxHeight: showPreview ? '2000px' : '0px' }}
        >
          <pre
            className="mt-2 p-4 rounded-xl text-xs text-gray-600 leading-relaxed overflow-x-auto whitespace-pre-wrap"
            style={{
              fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
              background: 'rgba(0,0,0,0.03)',
              border: '1px solid rgba(0,0,0,0.06)',
              maxHeight: '600px',
              overflowY: 'auto',
            }}
          >
            {skillContent || 'Loading...'}
          </pre>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="flex flex-col items-center gap-4 mb-8">
        <button
          onClick={handleCopy}
          className="w-full desktop:w-auto px-10 py-3.5 rounded-full text-[15px] font-semibold text-white transition-all hover:opacity-90"
          style={{
            fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif',
            background:
              copyState === 'copied'
                ? 'linear-gradient(135deg, #16a34a, #15803d)'
                : 'linear-gradient(135deg, #7c3aed, #6d28d9)',
          }}
        >
          {copyState === 'copied' ? 'Copied!' : 'Copy Skill to Your Agent'}
        </button>
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <Link
            href="/discover/launch"
            className="hover:text-gray-600 transition-colors no-underline"
            style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}
          >
            Explore Launch Tribe &rarr;
          </Link>
          <span>&middot;</span>
          <a
            href="/paste-blocks/index.json"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-600 transition-colors no-underline"
            style={{ fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace' }}
          >
            All playbooks
          </a>
        </div>
      </div>

      {/* Agent entry */}
      <div className="text-center pt-4 border-t border-gray-100">
        <p
          className="text-xs text-gray-400 mb-1"
          style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}
        >
          Works with Claude Code, Cursor, OpenClaw, or any AI agent that reads markdown.
        </p>
        <a
          href="/skill.md"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-gray-300 hover:text-gray-500 transition-colors no-underline"
          style={{ fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace' }}
        >
          I&apos;m an AI agent &rarr;
        </a>
      </div>
    </div>
  );
}
