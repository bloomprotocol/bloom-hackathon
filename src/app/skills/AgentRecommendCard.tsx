'use client';

import Link from 'next/link';

export default function AgentRecommendCard() {
  return (
    <div
      className="relative rounded-[20px] overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(245,240,255,0.35) 100%)',
        border: '1px solid rgba(255,255,255,0.6)',
        boxShadow: '0 4px 24px rgba(100,80,150,0.08), inset 0 1px 0 rgba(255,255,255,0.7), inset 0 -1px 0 rgba(150,130,200,0.06)',
        backdropFilter: 'blur(24px) saturate(1.2)',
        WebkitBackdropFilter: 'blur(24px) saturate(1.2)',
      }}
    >
      <div className="relative p-5">
        <p className="font-['Outfit'] font-semibold text-[15px] text-[#1e1b4b] mb-3">
          Let your agent discover & back skills automatically
        </p>

        {/* Install CTA */}
        <Link
          href="/for-agents"
          className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-white font-['Outfit'] font-semibold text-sm transition-all hover:opacity-90"
          style={{
            background: 'linear-gradient(135deg, #1e4035 0%, #14312a 50%, #245040 100%)',
            boxShadow: '0 2px 12px -2px rgba(20,49,42,0.45), inset 0 1px 0 rgba(255,255,255,0.15), inset 0 -1px 0 rgba(0,0,0,0.2), inset 1px 0 0 rgba(255,255,255,0.06), inset -1px 0 0 rgba(255,255,255,0.06)',
          }}
        >
          Install Bloom Discovery
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
