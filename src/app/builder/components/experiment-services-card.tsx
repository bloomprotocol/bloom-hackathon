'use client';

import Link from 'next/link';
import { useBuilderDashboard } from '../contexts/builder-dashboard-context';

/**
 * Quick Links Card
 * Sidebar card with useful links for builders (API Key, How It Works)
 */
export default function ExperimentServicesCard() {
  const { handleHowItWorks } = useBuilderDashboard();

  return (
    <div
      className="rounded-[20px] p-6 flex flex-col gap-4"
      style={{
        background: 'linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(245,240,255,0.35) 100%)',
        border: '1px solid rgba(255,255,255,0.6)',
        boxShadow: '0 4px 24px rgba(100,80,150,0.08), inset 0 1px 0 rgba(255,255,255,0.7), inset 0 -1px 0 rgba(150,130,200,0.06)',
        backdropFilter: 'blur(24px) saturate(1.2)',
        WebkitBackdropFilter: 'blur(24px) saturate(1.2)',
      }}
    >
      {/* Card Title */}
      <h3
        className="text-[15px] font-semibold text-[#1a1228] leading-none"
        style={{ fontFamily: 'Outfit, sans-serif' }}
      >
        QUICK LINKS
      </h3>

      {/* Get API Key */}
      <Link
        href="/builder/api-keys"
        className="w-full bg-white h-10 rounded-[27px] px-4 py-2 flex items-center justify-center gap-2 text-[#393f49] text-[14px] font-semibold border-2 border-[#dad9e5] shadow-[0px_3px_0px_-1px_#c0bfcf] hover:opacity-90 transition-opacity"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
        </svg>
        Get API Key
      </Link>

      {/* How It Works */}
      <button
        onClick={handleHowItWorks}
        className="w-full bg-white h-10 rounded-[27px] px-4 py-2 flex items-center justify-center gap-2 text-[#393f49] text-[14px] font-semibold border-2 border-[#dad9e5] shadow-[0px_3px_0px_-1px_#c0bfcf] hover:opacity-90 transition-opacity"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        How It Works
      </button>
    </div>
  );
}
