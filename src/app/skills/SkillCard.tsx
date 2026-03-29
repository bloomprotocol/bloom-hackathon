'use client';

import { useState } from 'react';
import type { Skill } from '@/lib/api/services/skillService';
import type { SkillPledgeStats } from '@/lib/api/services/agentPledgeService';
import { BloomIcon } from '@/app/discover/icons';

interface SkillCardProps {
  skill: Skill;
  onBack: (skill: Skill, amount: number) => void;
  isInCart: boolean;
  isBacked: boolean;
  pledgeStats?: SkillPledgeStats;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

const AMOUNT_OPTIONS = [1, 5, 10];
const DEFAULT_AMOUNT = 5;

// Format large numbers (e.g. 48320 → "48.3k")
function formatNumber(num: number): string {
  if (num >= 1000) {
    return (num / 1000).toFixed(num >= 10000 ? 0 : 1) + 'k';
  }
  return String(num);
}

// Map backend categories to display category labels (6 consolidated categories)
function getDisplayCategories(categories: string[]): string[] {
  const displayMap: Record<string, string> = {
    'Agent Framework': 'Agent OS',
    'Context Engineering': 'Agent OS',
    'MCP Ecosystem': 'Agent OS',
    'AI Tools': 'AI & Dev',
    'Development': 'AI & Dev',
    'Coding Assistant': 'AI & Dev',
    'Productivity': 'Productivity',
    'Design': 'Creative',
    'Marketing': 'Creative',
    'Crypto': 'Finance & Web3',
    'Finance': 'Finance & Web3',
    'Prediction Market': 'Finance & Web3',
    'Wellness': 'Other',
    'Education': 'Other',
    'Lifestyle': 'Other',
    'General': 'Other',
  };

  const unique = new Set<string>();
  categories.forEach(cat => {
    const display = displayMap[cat] || cat;
    unique.add(display);
  });
  return Array.from(unique).slice(0, 2);
}

export default function SkillCard({ skill, onBack, isInCart, isBacked, pledgeStats, isExpanded, onToggleExpand }: SkillCardProps) {
  const [selectedAmount, setSelectedAmount] = useState(DEFAULT_AMOUNT);
  const [customAmount, setCustomAmount] = useState('');
  const [useCustom, setUseCustom] = useState(false);

  const totalUsdc = skill.backingStats?.totalUsdc || 0;
  const backerCount = skill.backingStats?.backerCount || 0;
  const agentReferredCount = skill.backingStats?.agentReferredCount || 0;
  const directCount = skill.backingStats?.directCount || 0;
  const displayCategories = getDisplayCategories(skill.categories);

  // Agent pledge data from real backend
  const agentPledgeCount = pledgeStats?.agentPledgeCount || 0;
  const escrowUsdc = pledgeStats?.totalEscrowUsdc || 0;
  const creatorClaimed = pledgeStats?.creatorClaimed || false;

  // Combined stats
  const totalEscrow = totalUsdc + escrowUsdc;

  const effectiveAmount = useCustom ? (parseFloat(customAmount) || 0) : selectedAmount;
  const isValidAmount = effectiveAmount >= 1;

  const handlePresetClick = (amount: number) => {
    setSelectedAmount(amount);
    setUseCustom(false);
    setCustomAmount('');
  };

  const handleCustomFocus = () => {
    setUseCustom(true);
  };

  const handleCustomChange = (val: string) => {
    // Allow only digits and one decimal
    if (/^\d*\.?\d{0,2}$/.test(val)) {
      setCustomAmount(val);
      setUseCustom(true);
    }
  };

  const handleBack = () => {
    if (!isValidAmount) return;
    onBack(skill, effectiveAmount);
  };

  // Quick back from collapsed state — uses default amount
  const handleQuickBack = () => {
    onBack(skill, DEFAULT_AMOUNT);
  };

  return (
    <div
      className="relative rounded-[20px] overflow-hidden p-4 desktop:p-5 flex flex-col gap-2.5 w-full transition-all duration-200"
      style={{
        background: 'linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(245,240,255,0.35) 100%)',
        border: '1px solid rgba(255,255,255,0.6)',
        boxShadow: isExpanded
          ? '0 4px 20px rgba(100,80,150,0.1), inset 0 1px 0 rgba(255,255,255,0.7)'
          : '0 2px 12px rgba(100,80,150,0.06), inset 0 1px 0 rgba(255,255,255,0.7)',
        backdropFilter: 'blur(24px) saturate(1.2)',
        WebkitBackdropFilter: 'blur(24px) saturate(1.2)',
      }}
    >
      {/* Row 1: Name + Action (right-aligned) */}
      <div className="flex items-start justify-between gap-3">
        <div
          className="flex flex-col gap-1 min-w-0 flex-1 cursor-pointer"
          onClick={onToggleExpand}
        >
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-serif font-bold text-base text-[#393f49] leading-none">
              {skill.name}
            </p>
            {skill.autoScore > 0 && (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-700 rounded-md text-xs font-['Outfit'] font-medium"
                title="Bloom Score — community traction signal based on stars, downloads, and activity"
              >
                <BloomIcon size={14} className="text-purple-600" />
                <span>Score {skill.autoScore}</span>
              </span>
            )}
            {creatorClaimed && (
              <span className="inline-flex items-center gap-0.5 text-emerald-600 font-['Outfit'] text-xs font-medium">
                <svg className="w-3 h-3" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z" />
                </svg>
                Claimed
              </span>
            )}
          </div>
          <p className={`font-['Outfit'] text-xs text-[#696f8c] leading-[1.4] ${isExpanded ? '' : 'line-clamp-2'}`}>
            {skill.description}
          </p>
        </div>

        {/* CTA — right side */}
        <div className="shrink-0 flex items-center gap-1.5">
          {isBacked ? (
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-green-50 border border-green-200 font-['Outfit'] font-semibold text-xs text-green-700">
              <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z" />
              </svg>
              Backed
            </span>
          ) : isInCart ? (
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200 font-['Outfit'] font-semibold text-xs text-purple-700">
              <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z" />
              </svg>
              In Cart
            </span>
          ) : (
            <button
              onClick={isExpanded ? handleBack : handleQuickBack}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#8b5cf6] text-white font-['Outfit'] font-semibold text-xs hover:opacity-90 transition-opacity shadow-[0px_1px_1px_0.05px_rgba(24,24,27,0.24)]"
            >
              {isExpanded ? `Back · $${effectiveAmount}` : '+ Back'}
            </button>
          )}
        </div>
      </div>

      {/* Row 2: Stats + Categories — always visible */}
      <div
        className="flex items-center gap-2 flex-wrap font-['Outfit'] text-xs cursor-pointer"
        onClick={onToggleExpand}
      >
        {/* Stars */}
        {skill.stars > 0 && (
          <span className="inline-flex items-center gap-1 text-[#9ca3af]">
            <svg className="w-3 h-3" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25z" />
            </svg>
            {formatNumber(skill.stars)}
          </span>
        )}
        {/* Downloads */}
        {skill.downloads > 0 && (
          <span className="inline-flex items-center gap-1 text-[#9ca3af]">
            <svg className="w-3 h-3" viewBox="0 0 16 16" fill="currentColor">
              <path d="M2.75 14A1.75 1.75 0 0 1 1 12.25v-2.5a.75.75 0 0 1 1.5 0v2.5c0 .138.112.25.25.25h10.5a.25.25 0 0 0 .25-.25v-2.5a.75.75 0 0 1 1.5 0v2.5A1.75 1.75 0 0 1 13.25 14ZM7.25 7.689V2a.75.75 0 0 1 1.5 0v5.689l1.97-1.969a.749.749 0 1 1 1.06 1.06l-3.25 3.25a.749.749 0 0 1-1.06 0L4.22 6.78a.749.749 0 1 1 1.06-1.06l1.97 1.969Z" />
            </svg>
            {formatNumber(skill.downloads)}
          </span>
        )}
        {/* Backing stats — only when there are actual backers */}
        {agentPledgeCount > 0 && (
          <span className="inline-flex items-center gap-0.5 text-[#e8956a]">
            🦞 {agentPledgeCount} {agentPledgeCount === 1 ? 'agent' : 'agents'}
          </span>
        )}
        {agentReferredCount > 0 && (
          <span className="inline-flex items-center gap-0.5 text-[#8b5cf6]">
            🤖 {agentReferredCount} agent-referred
          </span>
        )}
        {directCount > 0 && (
          <span className="inline-flex items-center gap-0.5 text-[#9ca3af]">
            👥 {directCount} direct
          </span>
        )}
        {agentReferredCount === 0 && directCount === 0 && backerCount > 0 && (
          <span className="inline-flex items-center gap-0.5 text-[#9ca3af]">
            👥 {backerCount} {backerCount === 1 ? 'backer' : 'backers'}
          </span>
        )}
        {totalEscrow > 0 && (
          <span className="font-medium text-[#22c55e]">
            ${totalEscrow.toFixed(2)}
          </span>
        )}
        {/* Category pills */}
        {displayCategories.map((cat) => (
          <span
            key={cat}
            className="px-1.5 py-0.5 rounded font-medium text-[11px] text-[#7c3aed]"
            style={{ background: 'rgba(139,92,246,0.08)' }}
          >
            {cat}
          </span>
        ))}
        {/* Expand hint */}
        <svg className="size-5 ml-auto shrink-0" viewBox="0 0 20 20" fill="#a59af3">
          <path d={isExpanded ? "M10 7.5L14 12.5H6L10 7.5Z" : "M10 12.5L14 7.5H6L10 12.5Z"} />
        </svg>
      </div>

      {/* Expanded detail section */}
      {isExpanded && (
        <div className="pt-2 border-t border-purple-100/30 flex flex-col gap-3">
          {/* Amount selector */}
          <div className="flex items-center gap-2">
            {AMOUNT_OPTIONS.map((amt) => (
              <button
                key={amt}
                onClick={() => handlePresetClick(amt)}
                className={`flex-1 py-1.5 rounded-lg font-['Outfit'] font-semibold text-sm transition-all ${
                  !useCustom && selectedAmount === amt
                    ? 'bg-[#8b5cf6] text-white shadow-md'
                    : 'bg-white/50 text-[#696f8c] border border-white/60 hover:bg-white/70'
                }`}
              >
                ${amt}
              </button>
            ))}
            <div className="flex-1 relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-['Outfit'] text-sm text-[#9ca3af] pointer-events-none">$</span>
              <input
                type="text"
                inputMode="decimal"
                value={customAmount}
                onChange={(e) => handleCustomChange(e.target.value)}
                onFocus={handleCustomFocus}
                placeholder="Other"
                className={`w-full py-1.5 pl-6 pr-2 rounded-lg font-['Outfit'] font-semibold text-sm text-center transition-all ${
                  useCustom
                    ? 'bg-[#8b5cf6] text-white placeholder-white/60 shadow-md'
                    : 'bg-white/50 text-[#696f8c] border border-white/60 placeholder-[#b0b5c0]'
                } focus:outline-none`}
              />
            </div>
          </div>

          {/* Exclusive Pass value prop */}
          <div className="flex items-start gap-2 px-2.5 py-2 rounded-lg" style={{ background: 'rgba(139,92,246,0.04)', border: '1px solid rgba(139,92,246,0.08)' }}>
            <span className="text-base shrink-0 leading-none mt-0.5">🎫</span>
            <p className="font-['Outfit'] text-[11px] text-[#696f8c] leading-relaxed">
              When the creator claims, you receive an <span className="font-semibold text-[#7c3aed]">Exclusive Pass</span> — early access, priority rewards, and founding backer status. No claim in 90 days = full refund.
            </p>
          </div>

          {/* Source link */}
          {skill.url && (
            <a
              href={skill.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-['Outfit'] text-xs text-[#8b5cf6] hover:underline w-fit"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 3H3v10h10v-3M9 3h4v4M14 2L7 9" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              View source
            </a>
          )}
        </div>
      )}
    </div>
  );
}
