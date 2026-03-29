'use client';

import Link from 'next/link';

/**
 * Growth loop CTAs for the dashboard sidebar.
 * Links to /skills and /for-agents to keep users in the loop:
 *   Install Bloom Discovery → Agent recommends → Back skills → Dashboard → Share
 */
export default function DashboardGrowthCTA() {
  return (
    <div className="space-y-4">
      {/* Back Skills CTA */}
      <Link
        href="/skills"
        className="block p-4 rounded-2xl overflow-hidden border border-purple-200/50 hover:border-purple-300/60 transition-all group"
        style={{
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.06) 0%, rgba(124, 58, 237, 0.03) 100%)',
          boxShadow: '0 4px 16px -4px rgba(139, 92, 246, 0.1)',
        }}
      >
        <div className="flex items-start gap-3">
          <span className="text-xl shrink-0">🧩</span>
          <div className="flex-1 min-w-0">
            <p className="font-['Outfit'] font-semibold text-sm text-[#1e1b4b] mb-0.5">
              Back AI Skills
            </p>
            <p className="font-['Outfit'] text-xs text-[#6b7280] leading-relaxed">
              $1 USDC each — prove demand for the tools you want
            </p>
          </div>
          <svg className="w-4 h-4 text-purple-400 shrink-0 mt-0.5 group-hover:translate-x-0.5 transition-transform" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </Link>

      {/* Install Bloom Discovery CTA */}
      <Link
        href="/for-agents"
        className="block p-4 rounded-2xl overflow-hidden border border-white/50 hover:border-purple-200/40 transition-all group"
        style={{
          background: 'rgba(255, 255, 255, 0.7)',
          boxShadow: '0 8px 32px -8px rgba(0, 0, 0, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.8)',
        }}
      >
        <div className="flex items-start gap-3">
          <span className="text-xl shrink-0">🎨</span>
          <div className="flex-1 min-w-0">
            <p className="font-['Outfit'] font-semibold text-sm text-[#1e1b4b] mb-0.5">
              Get Bloom Discovery
            </p>
            <p className="font-['Outfit'] text-xs text-[#6b7280] leading-relaxed">
              Your agent finds skills based on your taste
            </p>
          </div>
          <svg className="w-4 h-4 text-gray-400 shrink-0 mt-0.5 group-hover:translate-x-0.5 transition-transform" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </Link>
    </div>
  );
}
