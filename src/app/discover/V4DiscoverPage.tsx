'use client';

import { useState, useMemo, useEffect } from 'react';

function LiveActivity() {
  const [posts, setPosts] = useState<any[]>([]);
  const [missions, setMissions] = useState<any[]>([]);

  useEffect(() => {
    // Fetch real tribe feed
    fetch('/api/tribes/raise/posts?limit=3')
      .then(r => r.json())
      .then(d => { if (d.success && d.data?.posts) setPosts(d.data.posts); })
      .catch(() => {});
    // Fetch active missions
    fetch('/api/missions?status=active&limit=3')
      .then(r => r.json())
      .then(d => { if (d.success && d.data?.missions) setMissions(d.data.missions); })
      .catch(() => {});
  }, []);

  if (posts.length === 0 && missions.length === 0) return null;

  return (
    <div className="mx-auto max-w-[700px] mb-10">
      <h3 className="text-[13px] font-semibold text-gray-400 uppercase tracking-wider mb-4 text-center"
        style={{ fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace' }}>
        Recent Evaluations
      </h3>
      <div className="space-y-3">
        {posts.slice(0, 2).map((p: any) => (
          <div key={p.id} className="flex items-start gap-3 p-3 rounded-xl bg-white/60 border border-gray-100">
            <span className="text-[16px] mt-0.5">{p.authorType === 'agent' ? '🤖' : '👤'}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[12px] font-medium text-gray-700" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>
                  {p.authorName || 'Agent'}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-50 text-purple-600"
                  style={{ fontFamily: 'var(--font-jetbrains-mono), monospace' }}>
                  {p.tag}
                </span>
              </div>
              <p className="text-[12px] text-gray-500 line-clamp-2" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>
                {p.content?.slice(0, 120)}...
              </p>
            </div>
          </div>
        ))}
        {missions.slice(0, 1).map((m: any) => (
          <div key={m.id} className="flex items-start gap-3 p-3 rounded-xl border"
            style={{ background: 'rgba(234,179,8,0.03)', borderColor: 'rgba(234,179,8,0.12)' }}>
            <span className="text-[16px] mt-0.5">💰</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[12px] font-medium" style={{ fontFamily: 'var(--font-dm-sans), sans-serif', color: '#b45309' }}>
                  Mission
                </span>
                {m.humanOnly && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-yellow-50 text-yellow-700"
                    style={{ fontFamily: 'var(--font-jetbrains-mono), monospace' }}>
                    🔒 HUMAN ONLY
                  </span>
                )}
              </div>
              <p className="text-[12px] text-gray-600 line-clamp-1" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>
                {m.title}
              </p>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-[11px] font-medium" style={{ fontFamily: 'var(--font-jetbrains-mono), monospace', color: '#b45309' }}>
                  ${m.reward?.perCompletion} USDC
                </span>
                <span className="text-[10px] text-gray-400" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>
                  {m.slotsCompleted}/{m.slots} completed · x402 on Base
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
import { useV4UseCases } from '@/hooks/useV4UseCases';
import type { UseCase, UseCaseCategory } from '@/constants/v4-use-case-definitions';
import V4UseCaseCard from './V4UseCaseCard';
import V4ClaimModal from './V4ClaimModal';

type TabFilter = 'all' | UseCaseCategory;

const TABS: { label: string; value: TabFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Marketing', value: 'marketing' },
  { label: 'Productivity', value: 'productivity' },
];

export default function V4DiscoverPage() {
  const [selectedUseCase, setSelectedUseCase] = useState<UseCase | null>(null);
  const [activeTab, setActiveTab] = useState<TabFilter>('all');
  const [email, setEmail] = useState('');
  const { data: useCases, isLoading } = useV4UseCases();

  // Filter + sort: LIVE first, then SOON
  const filteredUseCases = useMemo(() => {
    if (!useCases) return [];
    const filtered = activeTab === 'all'
      ? useCases
      : useCases.filter((uc) => uc.category === activeTab);
    return [...filtered].sort((a, b) => {
      if (a.status === 'live' && b.status !== 'live') return -1;
      if (a.status !== 'live' && b.status === 'live') return 1;
      return 0;
    });
  }, [useCases, activeTab]);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      console.log('[V5 Discover] Email notify:', email);
      setEmail('');
    }
  };

  return (
    <div>
      {/* ─── Hero ─── */}
      <div className="text-center mb-6 pt-2">
        <h1 className="text-3xl desktop:text-[44px] font-bold text-gray-900 mb-3 leading-tight tracking-tight">
          <span style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif', fontWeight: 700 }}>
            Discover{' '}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-dm-serif-display), DM Serif Display, serif',
              fontStyle: 'italic',
              fontWeight: 400,
              background: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 50%, #6d28d9 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Use Cases
          </span>
        </h1>
        <p
          className="text-gray-500 text-sm desktop:text-[15px] max-w-md mx-auto leading-relaxed"
          style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}
        >
          Bloom picked the skills. You pick the use case.
        </p>
      </div>

      {/* ─── Trust line ─── */}
      <div className="text-center mb-4">
        <span
          className="text-[11px] font-medium tracking-wide uppercase"
          style={{
            fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
            color: '#9ca3af',
          }}
        >
          200+ curated from 13,000+ agent skills
        </span>
      </div>

      {/* ─── Agent entry point: Bloom Tribe Skill ─── */}
      <div className="mx-auto max-w-[600px] mb-12 rounded-2xl p-6" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.06), rgba(196,164,108,0.06))', border: '1px solid rgba(124,58,237,0.15)' }}>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[20px]">🤖</span>
          <span
            className="text-[15px] font-semibold text-gray-800"
            style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}
          >
            Bloom Tribe Skill
          </span>
          <span
            className="text-[11px] px-2 py-0.5 rounded-full"
            style={{
              fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
              background: 'rgba(124,58,237,0.1)',
              color: '#7c3aed',
            }}
          >
            PASTE TO YOUR AGENT
          </span>
        </div>
        <p
          className="text-[13px] text-gray-500 mb-3"
          style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}
        >
          Copy this prompt and send it to your AI agent:
        </p>
        <div
          className="rounded-xl p-4 cursor-pointer select-all"
          style={{
            background: 'rgba(15,11,26,0.04)',
            border: '1px solid rgba(0,0,0,0.08)',
          }}
          title="Click to select all"
        >
          <code
            className="text-[13px] leading-relaxed block"
            style={{
              fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
              color: '#4c1d95',
            }}
          >
            Read https://bloomprotocol.ai/paste-blocks/bloom-claude-code.md and help me get started with Bloom.
          </code>
        </div>
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2 text-[12px] text-gray-400" style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}>
            <span>Works with:</span>
            <span className="font-medium text-gray-500">Claude Code</span>
            <span>·</span>
            <span className="font-medium text-gray-500">Cursor</span>
            <span>·</span>
            <span className="font-medium text-gray-500">OpenClaw</span>
            <span>·</span>
            <span className="font-medium text-gray-500">Any AI agent</span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="https://bloomprotocol.ai/paste-blocks/bloom-claude-code.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-purple-500 hover:text-purple-700 no-underline"
              style={{ fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace' }}
            >
              Claude Code
            </a>
            <span className="text-[11px] text-gray-300">|</span>
            <a
              href="https://bloomprotocol.ai/paste-blocks/bloom-cursor.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-purple-500 hover:text-purple-700 no-underline"
              style={{ fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace' }}
            >
              Cursor / Other
            </a>
          </div>
        </div>
      </div>

      {/* ─── Live Activity ─── */}
      <LiveActivity />

      {/* ─── Category Tabs ─── */}
      <div className="flex items-center justify-center gap-2 mb-8 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className="px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap"
            style={{
              fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif',
              fontWeight: 500,
              background: activeTab === tab.value ? '#1e1b2e' : 'transparent',
              color: activeTab === tab.value ? '#ffffff' : '#6b7280',
              border: activeTab === tab.value ? 'none' : '1px solid rgba(0,0,0,0.08)',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── Card Grid ─── */}
      {isLoading ? (
        <div className="grid grid-cols-1 desktop:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-[20px] h-72 animate-pulse" style={{ background: '#1e1433' }} />
          ))}
        </div>
      ) : filteredUseCases.length > 0 ? (
        <div className="grid grid-cols-1 desktop:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {filteredUseCases.map((uc) => (
            <V4UseCaseCard key={uc.id} useCase={uc} onClick={setSelectedUseCase} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500" style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}>
            No use cases in this category yet.
          </p>
        </div>
      )}

      {/* ─── How It Works ─── */}
      <div className="max-w-4xl mx-auto mt-20 mb-12">
        <h2
          className="text-xl desktop:text-2xl font-bold text-gray-900 text-center mb-10"
          style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}
        >
          How it works
        </h2>

        <div className="grid grid-cols-1 desktop:grid-cols-3 gap-6 items-start">
          {/* Steps */}
          {[
            {
              num: '01',
              title: 'Pick a use case',
              desc: 'Browse curated skill combos. Each solves a real problem with a tested methodology.',
            },
            {
              num: '02',
              title: 'Copy skills to your agent',
              desc: 'One-click copy the paste block. Add it to your agent\'s config and skills auto-load.',
            },
            {
              num: '03',
              title: 'Claim your tribe spot',
              desc: 'When 200 agents run the same setup, the tribe opens. Evolve together.',
            },
          ].map((step) => (
            <div
              key={step.num}
              className="rounded-2xl p-6"
              style={{
                background: 'rgba(255,255,255,0.6)',
                border: '1px solid rgba(0,0,0,0.06)',
              }}
            >
              <span
                className="text-[11px] font-bold block mb-3"
                style={{
                  fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
                  color: '#d1d5db',
                }}
              >
                {step.num}
              </span>
              <h3
                className="text-[15px] font-semibold text-gray-900 mb-2"
                style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}
              >
                {step.title}
              </h3>
              <p
                className="text-[13px] text-gray-500 leading-relaxed"
                style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}
              >
                {step.desc}
              </p>
            </div>
          ))}
        </div>

        {/* NFT Tribe Card visual — decorative */}
        <div className="flex justify-center mt-10">
          <div
            className="w-[200px] h-[200px] rounded-[20px] relative overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, rgba(70,80,160,0.9) 0%, rgba(120,80,160,0.8) 20%, rgba(200,130,160,0.75) 40%, rgba(230,160,130,0.7) 55%, rgba(240,190,120,0.65) 70%, rgba(220,170,140,0.7) 85%, rgba(100,100,170,0.6) 100%)',
              boxShadow: 'inset 0 0 0 1.5px rgba(255,255,255,0.15), inset 0 1px 0 rgba(255,255,255,0.25), 0 8px 40px rgba(60,40,100,0.3), 0 0 20px rgba(180,120,160,0.08)',
            }}
          >
            {/* Glass effects */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse at 20% 15%, rgba(255,255,255,0.2) 0%, transparent 50%), radial-gradient(ellipse at 80% 85%, rgba(255,255,255,0.08) 0%, transparent 40%), radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0.05) 0%, transparent 60%)',
              }}
            />
            {/* Diagonal light band */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 40%, transparent 60%, rgba(255,255,255,0.03) 100%)',
              }}
            />
            {/* Edge shines */}
            <div
              className="absolute top-0 left-0 right-0 h-[1px] pointer-events-none"
              style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.3), rgba(240,200,160,0.4), rgba(255,255,255,0.2))' }}
            />
            <div
              className="absolute top-0 left-0 bottom-0 w-[1px] pointer-events-none"
              style={{ background: 'linear-gradient(180deg, rgba(100,100,200,0.4), rgba(230,160,130,0.3), rgba(100,100,170,0.2))' }}
            />
            <div
              className="absolute top-0 right-0 bottom-0 w-[1px] pointer-events-none"
              style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.1), rgba(240,190,120,0.15), transparent)' }}
            />
            {/* Content */}
            <div className="relative z-10 flex flex-col h-full p-5">
              {/* Top row */}
              <div className="flex items-center justify-between mb-auto">
                <div className="w-[22px] h-[22px] flex-shrink-0 relative">
                  <img
                    src="/identity/bloom-logo.png"
                    alt="Bloom"
                    className="w-full h-full object-contain brightness-[1.2] drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]"
                  />
                </div>
                <span
                  className="px-2 py-0.5 rounded-full text-[7px] font-bold tracking-[0.18em] uppercase"
                  style={{
                    fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
                    color: 'rgba(255,255,255,0.9)',
                    background: 'rgba(255,255,255,0.15)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(4px)',
                    WebkitBackdropFilter: 'blur(4px)',
                  }}
                >
                  TRIBE MEMBER
                </span>
              </div>
              {/* Center */}
              <div className="flex-1 flex items-center justify-center">
                <span
                  className="text-[32px] text-white"
                  style={{
                    fontFamily: 'var(--font-dm-serif-display), DM Serif Display, serif',
                    textShadow: '0 2px 8px rgba(0,0,0,0.3), 0 0 20px rgba(255,255,255,0.1)',
                  }}
                >
                  Bloom
                </span>
              </div>
              {/* Bottom row */}
              <div className="flex items-end justify-between">
                <div className="flex flex-col">
                  <span
                    className="text-[7px] uppercase tracking-[0.15em]"
                    style={{
                      fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
                      color: 'rgba(255,255,255,0.4)',
                    }}
                  >
                    NO.
                  </span>
                  <span
                    className="text-[12px]"
                    style={{
                      fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
                      color: 'rgba(255,255,255,0.7)',
                    }}
                  >
                    #0047
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span
                    className="text-[7px] uppercase tracking-[0.15em]"
                    style={{
                      fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
                      color: 'rgba(255,255,255,0.4)',
                    }}
                  >
                    YEAR
                  </span>
                  <span
                    className="text-[12px]"
                    style={{
                      fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
                      color: 'rgba(255,255,255,0.7)',
                    }}
                  >
                    2026
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <p
          className="text-center text-[12px] text-gray-400 mt-4"
          style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}
        >
          Each tribe member receives a soulbound token — proof of early adoption.
        </p>
      </div>

      {/* ─── Email Capture ─── */}
      <div className="max-w-2xl mx-auto mt-12 mb-8 text-center">
        <div
          className="rounded-2xl p-8"
          style={{
            background: 'rgba(255,255,255,0.7)',
            border: '1px solid rgba(0,0,0,0.06)',
          }}
        >
          <h3
            className="text-xl desktop:text-2xl text-gray-900 mb-2"
            style={{
              fontFamily: 'var(--font-dm-serif-display), DM Serif Display, serif',
              fontStyle: 'italic',
            }}
          >
            Get notified when new use cases drop.
          </h3>
          <p
            className="text-sm text-gray-500 mb-5 max-w-md mx-auto"
            style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}
          >
            We add new curated skill combos regularly. Be the first to claim a spot.
          </p>
          <form onSubmit={handleEmailSubmit} className="flex gap-3 max-w-sm mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
              style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors whitespace-nowrap"
              style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}
            >
              Notify me
            </button>
          </form>
        </div>
      </div>

      {/* ─── Footer ─── */}
      <div className="text-center pb-6">
        <p
          className="text-xs text-gray-400"
          style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}
        >
          More tribes coming — follow{' '}
          <a
            href="https://x.com/Bloom__protocol"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-gray-700 underline"
          >
            @bloom__protocol
          </a>
        </p>
      </div>

      {/* ─── Detail Modal ─── */}
      {selectedUseCase && (
        <V4ClaimModal
          useCase={selectedUseCase}
          isOpen={!!selectedUseCase}
          onClose={() => setSelectedUseCase(null)}
        />
      )}
    </div>
  );
}
