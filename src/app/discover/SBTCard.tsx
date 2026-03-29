'use client';

import { useState } from 'react';
import TierProfileModal from './TierProfileModal';
import { useAuth } from '@/lib/context/AuthContext';
import { useModal } from '@/lib/context/ModalContext';
import { useWeeklyLimit } from '@/hooks/usePledges';

// Add shimmer animation (slower)
if (typeof window !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `;
  if (!document.querySelector('style[data-shimmer]')) {
    style.setAttribute('data-shimmer', 'true');
    document.head.appendChild(style);
  }
}

// Identity unlock threshold (use all weekly power)
const WEEKLY_POWER = 1000;
const UNLOCK_THRESHOLD = 1000;

interface SBTCardProps {
  isMobile?: boolean;
}

// Benefit cards data - Exclusive Pass Perks
const PERKS = [
  { title: 'Priority Rewards', desc: 'First in line for project drops' },
  { title: 'Founding Status', desc: 'Recognized as an early backer' },
  { title: 'Early Pricing', desc: 'Discounts from projects' },
  { title: 'Exclusive Skills', desc: 'Premium access & limited editions' },
];

const STEPS = [
  'Use Pledge Power to back projects you believe in',
  'Top projects get invited to launch on Bloom',
  'Claim your Exclusive Pass & perks',
];

function PassIcon() {
  // Use unique ID with timestamp to avoid conflicts
  const gradientId = `passGradient-${Math.random().toString(36).slice(2, 11)}`;

  return (
    <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      {/* Badge/Shield shape */}
      <path
        d="M12 3L4 7v5c0 5 3.5 9.5 8 11 4.5-1.5 8-6 8-11V7l-8-4z"
        fill={`url(#${gradientId})`}
        opacity="0.15"
      />
      <path
        d="M12 3L4 7v5c0 5 3.5 9.5 8 11 4.5-1.5 8-6 8-11V7l-8-4z"
        stroke={`url(#${gradientId})`}
        strokeWidth="1.5"
        fill="none"
      />
      {/* Star in center */}
      <path
        d="M12 8l1.5 3 3.5 0.5-2.5 2.5 0.5 3.5L12 16l-3 1.5 0.5-3.5L7 11.5l3.5-0.5z"
        fill={`url(#${gradientId})`}
      />
    </svg>
  );
}

interface SBTContentProps {
  onOpenIdentity: () => void;
  remaining: number;
  totalPower: number;
}

function SBTContent({
  onOpenIdentity,
  remaining,
  totalPower
}: SBTContentProps) {
  const [showLearnMore, setShowLearnMore] = useState(true);
  const [showPowerTooltip, setShowPowerTooltip] = useState(false);

  // Calculate weekly usage first
  const usedThisWeek = totalPower - remaining;
  const percentage = totalPower > 0 ? (usedThisWeek / totalPower) * 100 : 0;

  // Check if unlocked this week (used all power)
  const canUnlock = usedThisWeek >= UNLOCK_THRESHOLD;

  return (
    <>
      {/* Header */}
      <div className="text-center mb-4">
        <div className="flex items-center justify-center gap-2.5 mb-1">
          <PassIcon />
          <h2 className="font-['Outfit'] text-[22px] font-bold whitespace-nowrap" style={{ color: '#1a1228' }}>
            Exclusive Pass
            {canUnlock && <span className="ml-2" style={{ color: 'rgba(140,100,200,0.8)' }}>✓</span>}
          </h2>
        </div>
        {/* Subtitle */}
        <p className="font-['Outfit'] text-[12px] font-normal italic" style={{ color: 'rgba(100,80,140,0.5)' }}>
          Issued by projects
        </p>
      </div>

      {/* Progress Card - Use gradient background image */}
      <div className="mb-2 p-4 rounded-[20px] relative overflow-hidden shadow-lg transition-all duration-500"
        style={{
          backgroundImage: 'url(/identity/gradient-bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Purple overlay to make it more purple and darker for better text contrast */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/35 via-violet-500/25 to-purple-400/15 pointer-events-none z-0" />

        <div className="relative z-10">
          {/* Progress Section */}
          <div className="mb-2">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <span className="font-['Outfit'] text-[14px] font-semibold text-white" style={{ letterSpacing: '0.5px' }}>Pledge Power</span>
                {/* Info Icon with Tooltip */}
                <div className="relative">
                  <button
                    onMouseEnter={() => setShowPowerTooltip(true)}
                    onMouseLeave={() => setShowPowerTooltip(false)}
                    onClick={() => setShowPowerTooltip(!showPowerTooltip)}
                    className="text-white/50 hover:text-white/80 transition-colors"
                    aria-label="What is Pledge Power?"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
                    </svg>
                  </button>
                  {/* Tooltip */}
                  {showPowerTooltip && (
                    <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 w-48 p-2.5 rounded-lg shadow-xl z-[9999] backdrop-blur-md bg-white/95 border border-white/60">
                      <p className="font-['Outfit'] font-semibold text-xs mb-1" style={{ color: '#2a2040' }}>
                        Pledge Power
                      </p>
                      <p className="font-['Outfit'] text-[11px] font-light leading-relaxed" style={{ color: 'rgba(60,50,80,0.6)', lineHeight: '1.6' }}>
                        Free {totalPower} points weekly. Support projects, build your identity. Resets every Monday.
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <span className="font-['Outfit'] text-[12px] font-semibold text-white flex items-center gap-1.5">
                {canUnlock && <span className="text-sm">✓</span>}
                {usedThisWeek} / {totalPower}
              </span>
            </div>
            {/* Progress Bar - Soft Purple Gradient */}
            <div className="relative w-full h-2 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
              <div
                className="absolute left-0 top-0 h-full rounded-full transition-all duration-500"
                style={{
                  width: `${percentage}%`,
                  background: 'linear-gradient(90deg, rgba(139,92,246,0.9) 0%, rgba(167,139,250,0.9) 50%, rgba(196,181,253,0.9) 100%)',
                }}
              />
            </div>
            {/* Reset info */}
            <p className="font-['Outfit'] text-[10px] text-white/60 mt-1.5">
              Resets every Monday
            </p>
          </div>

          {/* Small Preview Area */}
          <div className={`p-3 rounded-[20px] relative overflow-hidden ${
            canUnlock
              ? 'bg-white/20 border border-white/30'
              : 'bg-gradient-to-br from-white/40 via-white/25 to-white/15 border-2 border-white/50 shadow-[0px_4px_16px_rgba(255,255,255,0.4),inset_0px_2px_4px_rgba(255,255,255,0.6)]'
          }`}>
            {/* Mysterious shimmer overlay for locked state */}
            {!canUnlock && (
              <>
                {/* Glass reflection effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent pointer-events-none z-0" />
                {/* Shimmer animation (slower) */}
                <div
                  className="absolute inset-0 pointer-events-none z-0"
                  style={{
                    background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)',
                    backgroundSize: '200% 200%',
                    animation: 'shimmer 6s infinite'
                  }}
                />
              </>
            )}
            <div className="relative z-10">
              {/* Unlocked: Star icon centered at top */}
              {canUnlock && (
                <div className="flex justify-center mb-2">
                  <img
                    src="/identity/star-icon.png"
                    alt="Star"
                    className="w-10 h-10 object-contain"
                  />
                </div>
              )}

              <div className="flex items-center gap-3">
                {/* Locked: Lock icon on left */}
                {!canUnlock && (
                  <div className="w-10 h-10 rounded-[14px] flex items-center justify-center shrink-0 bg-white/20">
                    <svg className="w-5 h-5 text-white/60" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}

                {/* Text */}
                <div className={canUnlock ? 'flex-1 text-center' : 'flex-1'}>
                  <p className="font-['Outfit'] text-[14px] font-medium text-white mb-1">
                    {canUnlock ? 'Identity unlocked!' : 'Discover your taste'}
                  </p>
                  <p className="font-['Outfit'] text-[11px] font-light text-white/70 mb-1">
                    {canUnlock ? 'Tap to reveal' : `${totalPower - usedThisWeek} more to unlock`}
                  </p>
                  {/* One-line explanation - changes based on unlock status */}
                  <p className="font-['Outfit'] text-[11px] font-light italic" style={{
                    color: canUnlock ? 'rgba(72, 160, 120, 0.7)' : 'rgba(100,80,140,0.4)'
                  }}>
                    {canUnlock ? 'Your identity is ready!' : 'Unlock your Supporter Identity'}
                  </p>
                </div>

                {/* Eye icon for unlocked */}
                {canUnlock && (
                  <svg className="w-5 h-5 text-white/80 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                    <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Button - Discover Your Taste (locked/unlocked states) */}
      <button
        onClick={canUnlock ? onOpenIdentity : undefined}
        disabled={!canUnlock}
        className="w-full py-3.5 px-4 font-['Outfit'] text-[14px] font-medium transition-all duration-300 flex items-center justify-center gap-2 shadow-lg"
        style={{
          background: canUnlock ? 'rgba(72, 160, 120, 0.85)' : 'rgba(72, 160, 120, 0.2)',
          color: canUnlock ? 'white' : 'rgba(255,255,255,0.4)',
          letterSpacing: '0.5px',
          borderRadius: '100px',
          cursor: canUnlock ? 'pointer' : 'not-allowed',
        }}
        onMouseEnter={(e) => {
          if (canUnlock) {
            e.currentTarget.style.background = 'rgba(72, 160, 120, 1)';
          }
        }}
        onMouseLeave={(e) => {
          if (canUnlock) {
            e.currentTarget.style.background = 'rgba(72, 160, 120, 0.85)';
          }
        }}
      >
        <span>{canUnlock ? 'Discover Your Taste →' : 'Discover Your Taste 🔒'}</span>
      </button>

      {/* Learn More - Below CTA */}
      <button
        onClick={() => setShowLearnMore(!showLearnMore)}
        className="w-full mt-2 flex items-center justify-between font-['Outfit'] text-[13px] font-medium transition-colors"
        style={{ color: 'rgba(100,80,140,0.6)' }}
        onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(100,80,140,0.9)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(100,80,140,0.6)'; }}
      >
        <span>Learn more</span>
        <svg
          className={`w-4 h-4 transition-transform ${showLearnMore ? 'rotate-180' : ''}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {/* Expanded Content - Learn More */}
      {showLearnMore && (
        <div className="mb-4 p-4 rounded-[20px] bg-purple-50/30 border border-purple-100/50">
          {/* Exclusive Pass Perks */}
          <div className="mb-4">
            <h3 className="font-['Outfit'] text-[14px] font-semibold mb-1" style={{ color: '#2a2040', letterSpacing: '0.5px' }}>Pass Perks</h3>
            <p className="font-['Outfit'] text-[11px] font-light italic mb-3" style={{ color: 'rgba(100,80,140,0.4)' }}>
              Benefits vary by project — some examples:
            </p>
            <div className="grid grid-cols-2 gap-2 mb-2">
              {PERKS.map((perk) => (
                <div
                  key={perk.title}
                  className="p-2 rounded-lg"
                  style={{
                    background: 'rgba(245,242,255,0.5)',
                    border: '1px solid rgba(150,130,200,0.08)'
                  }}
                >
                  <div className="font-['Outfit'] text-[13px] font-medium mb-0.5" style={{ color: '#2a2040' }}>{perk.title}</div>
                  <div className="font-['Outfit'] text-[11px] font-light leading-tight" style={{ color: 'rgba(80,60,120,0.5)' }}>{perk.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* How It Works */}
          <div className="pt-3 border-t border-purple-100/50">
            <h3 className="font-['Outfit'] text-[14px] font-semibold mb-3" style={{ color: '#2a2040', letterSpacing: '0.5px' }}>How It Works</h3>
            <div className="flex flex-col gap-2.5">
              {STEPS.map((step, index) => (
                <div key={index} className="flex items-start gap-2.5">
                  <div
                    className="w-5 h-5 rounded-full text-white font-['Outfit'] text-[13px] font-semibold flex items-center justify-center shrink-0 shadow-lg mt-0.5"
                    style={{ background: 'rgba(140,100,200,0.6)' }}
                  >
                    {index + 1}
                  </div>
                  <div className="font-['Outfit'] text-[13px] font-normal leading-snug" style={{ color: 'rgba(60,50,80,0.7)' }}>{step}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
</>
  );
}

export default function SBTCard({ isMobile = false }: SBTCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showIdentityModal, setShowIdentityModal] = useState(false);
  const { user } = useAuth();
  const { openAuthModal } = useModal();
  const { data: weeklyLimit } = useWeeklyLimit(!!user);

  const handleOpenIdentity = () => {
    if (!user) {
      openAuthModal();
      return;
    }
    setShowIdentityModal(true);
  };

  // Default values
  // If no user or no weeklyLimit data, show as not used (remaining = totalPower)
  const totalPower = weeklyLimit?.totalPower || WEEKLY_POWER;
  const remaining = weeklyLimit?.remaining ?? totalPower; // Use ?? to allow 0 as valid value

  // Mobile: collapsible
  if (isMobile) {
    return (
      <>
        <TierProfileModal isOpen={showIdentityModal} onClose={() => setShowIdentityModal(false)} />
        <div className="mb-6">
        <div
          className="holo-glass-card relative w-full p-5 rounded-[20px] overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(245,240,255,0.35) 100%)',
            border: '1px solid rgba(255,255,255,0.6)',
            boxShadow: '0 4px 24px rgba(100,80,150,0.08), inset 0 1px 0 rgba(255,255,255,0.7), inset 0 -1px 0 rgba(150,130,200,0.06)',
            backdropFilter: 'blur(24px) saturate(1.2)',
            WebkitBackdropFilter: 'blur(24px) saturate(1.2)',
          }}
        >

          {/* Content */}
          <div className="relative z-10">
            {/* Header with toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <PassIcon />
                <h2 className="text-[17px] font-bold text-[#1e1b4b]">Unlock Exclusive Pass</h2>
              </div>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-1"
              >
                <span className="text-sm font-medium text-[#7c3aed]">
                  {isExpanded ? 'Less' : 'More'}
                </span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                >
                  <path d="M4 6L8 10L12 6" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
              <div className="mt-4">
                <SBTContent
                  onOpenIdentity={handleOpenIdentity}
                  remaining={remaining}
                  totalPower={totalPower}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      </>
    );
  }

  // Desktop: always expanded, sticky
  return (
    <>
      <TierProfileModal isOpen={showIdentityModal} onClose={() => setShowIdentityModal(false)} />
      <div className="w-[300px] sticky top-[100px]">
      <div
        className="relative p-6 rounded-[20px] overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(245,240,255,0.65) 100%)',
          border: '1px solid rgba(150,130,200,0.12)',
          boxShadow: '0 4px 24px rgba(100,80,150,0.05)',
          backdropFilter: 'blur(12px)',
        }}
      >

        {/* Content */}
        <div className="relative z-10">
          <SBTContent
            onOpenIdentity={handleOpenIdentity}
            remaining={remaining}
            totalPower={totalPower}
          />
        </div>
      </div>
    </div>
    </>
  );
}
