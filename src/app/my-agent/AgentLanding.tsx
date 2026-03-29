'use client';

import Link from 'next/link';
import { getAllUseCases } from '@/constants/v4-use-case-definitions';

export default function AgentLanding() {
  const useCases = getAllUseCases();

  return (
    <div className="max-w-[900px] mx-auto">
      {/* Hero */}
      <div className="text-center mb-12">
        <h1
          className="text-3xl desktop:text-4xl font-extrabold text-gray-900 mb-3"
          style={{ fontFamily: 'var(--font-inter), Inter, sans-serif' }}
        >
          My Agent
        </h1>
        <p className="text-gray-500 max-w-lg mx-auto">
          Claim a tribe spot to unlock your agent dashboard. Your claimed configurations and tribe memberships will appear here.
        </p>
      </div>

      {/* Blurred preview card */}
      <div className="relative mb-10">
        {/* Blurred content */}
        <div className="blur-[6px] pointer-events-none select-none opacity-60" aria-hidden="true">
          <div className="grid grid-cols-1 desktop:grid-cols-2 gap-4">
            {useCases.map((uc) => (
              <div
                key={uc.id}
                className="rounded-2xl p-5"
                style={{
                  background: uc.color === 'purple'
                    ? 'linear-gradient(170deg, #1a0f2e 0%, #0d0a14 50%, #100d18 100%)'
                    : 'linear-gradient(170deg, #1f1a0f 0%, #14100a 50%, #18120d 100%)',
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">{uc.icon}</span>
                  <span className="px-3 py-1 rounded-full text-[10px] font-semibold text-white/40 bg-white/5">
                    LOCKED
                  </span>
                </div>
                <div className="h-4 bg-white/10 rounded mb-2 w-3/4" />
                <div className="h-3 bg-white/5 rounded mb-1 w-full" />
                <div className="h-3 bg-white/5 rounded mb-4 w-5/6" />
                <div className="flex gap-2 mb-4">
                  <div className="h-6 bg-white/5 rounded-full w-24" />
                  <div className="h-6 bg-white/5 rounded-full w-20" />
                </div>
                <div className="h-2 bg-white/5 rounded-full w-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Overlay CTA */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-8 text-center shadow-xl max-w-sm">
            <div className="text-3xl mb-3">🔒</div>
            <h3
              className="text-lg font-bold text-gray-900 mb-2"
              style={{ fontFamily: 'var(--font-inter), Inter, sans-serif' }}
            >
              Claim your first tribe spot
            </h3>
            <p className="text-sm text-gray-500 mb-5">
              Browse use cases, copy the skills to your agent, and claim a spot in a tribe.
            </p>
            <Link
              href="/discover"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-900 text-white font-semibold text-sm hover:bg-gray-800 transition-colors"
            >
              Discover use cases
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* How tribes work */}
      <div className="max-w-2xl mx-auto text-center">
        <h2
          className="text-xl font-bold text-gray-900 mb-6"
          style={{ fontFamily: 'var(--font-inter), Inter, sans-serif' }}
        >
          How tribes work
        </h2>
        <div className="grid grid-cols-1 desktop:grid-cols-3 gap-4">
          {[
            { num: '01', title: 'Pick & copy', desc: 'Choose a use case and copy the AGENTS.md config to your agent' },
            { num: '02', title: 'Claim a spot', desc: 'Record your claim with email (free) or wallet ($0.50 USDC)' },
            { num: '03', title: 'Tribe opens', desc: 'When 200 people claim the same setup, the tribe unlocks' },
          ].map((step) => (
            <div key={step.num} className="text-center">
              <span
                className="text-xs font-bold text-gray-300 block mb-2"
                style={{ fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace' }}
              >
                {step.num}
              </span>
              <h3 className="text-sm font-semibold text-gray-800 mb-1">{step.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
