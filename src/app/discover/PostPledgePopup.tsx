'use client';

import { useEffect, useRef } from 'react';
import { TierProfile } from '@/lib/api/services/pledgeService';

interface PostPledgePopupProps {
  isOpen: boolean;
  onClose: () => void;
  tierProfile: TierProfile | null;
}

// Tier colors and icons
const TIER_CONFIG = {
  New: {
    gradient: 'from-gray-400 to-gray-500',
    bgGradient: 'rgba(156, 163, 175, 0.15)',
    icon: '✨',
    frameColor: 'rgba(156, 163, 175, 0.3)',
  },
  Seed: {
    gradient: 'from-emerald-400 to-green-500',
    bgGradient: 'rgba(16, 185, 129, 0.15)',
    icon: '🌱',
    frameColor: 'rgba(16, 185, 129, 0.3)',
  },
  Sprout: {
    gradient: 'from-violet-400 to-purple-500',
    bgGradient: 'rgba(139, 92, 246, 0.15)',
    icon: '🌿',
    frameColor: 'rgba(139, 92, 246, 0.3)',
  },
  Bloom: {
    gradient: 'from-amber-400 to-orange-500',
    bgGradient: 'rgba(251, 191, 36, 0.15)',
    icon: '🌸',
    frameColor: 'rgba(251, 191, 36, 0.3)',
  },
};

// Map categories to style labels
const CATEGORY_STYLE_MAP: Record<string, { emoji: string; label: string }> = {
  'AI': { emoji: '🤖', label: 'AI Pioneer' },
  'ai-tools': { emoji: '🤖', label: 'AI Pioneer' },
  'Developer Tools': { emoji: '👨‍💻', label: 'Dev Tools Explorer' },
  'developer-tools': { emoji: '👨‍💻', label: 'Dev Tools Explorer' },
  'Productivity': { emoji: '⚡', label: 'Productivity Pro' },
  'productivity': { emoji: '⚡', label: 'Productivity Pro' },
  'Design': { emoji: '🎨', label: 'Creative Enthusiast' },
  'design-tools': { emoji: '🎨', label: 'Creative Enthusiast' },
  'Wellness': { emoji: '🧘', label: 'Wellness Seeker' },
  'wellness': { emoji: '🧘', label: 'Wellness Seeker' },
  'Education': { emoji: '📚', label: 'Lifelong Learner' },
  'education': { emoji: '📚', label: 'Lifelong Learner' },
  'Crypto': { emoji: '₿', label: 'Web3 Believer' },
  'crypto': { emoji: '₿', label: 'Web3 Believer' },
  'Lifestyle': { emoji: '✨', label: 'Lifestyle Curator' },
  'lifestyle': { emoji: '✨', label: 'Lifestyle Curator' },
};

// Generate a short ID from string (for display)
function generateShortId(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).toUpperCase().slice(0, 8).padStart(8, '0');
}

// Generate style labels from categories
function getStyleLabels(topCategories: { key: string; label: string; icon: string }[]): { emoji: string; label: string }[] {
  return topCategories
    .map(cat => {
      // Try to match by key first, then by label
      const style = CATEGORY_STYLE_MAP[cat.key] || CATEGORY_STYLE_MAP[cat.label];
      return style;
    })
    .filter(Boolean)
    .slice(0, 3); // Max 3 styles
}

export default function PostPledgePopup({
  isOpen,
  onClose,
  tierProfile,
}: PostPledgePopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Close on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !tierProfile) return null;

  const tierConfig = TIER_CONFIG[tierProfile.tier as keyof typeof TIER_CONFIG] || TIER_CONFIG.Seed;

  // Generate a unique-looking ID for the card
  const cardId = generateShortId(
    tierProfile.personality.name + (tierProfile.memberSince || '') + tierProfile.tier
  );

  const handleShareToX = () => {
    try {
      // Format categories for URL (e.g., "⚡Productivity,📦Automation")
      const categoriesStr = tierProfile.topCategories
        .map(cat => `${cat.icon}${cat.label}`)
        .join(',');

      // Build shareable URL with OG meta tags
      const params = new URLSearchParams({
        tier: tierProfile.tier,
        personality: tierProfile.personality?.name || 'Explorer',
        description: tierProfile.personality?.description || '',
      });
      if (categoriesStr) {
        params.set('categories', categoriesStr);
      }
      if (tierProfile.memberSince) {
        params.set('since', tierProfile.memberSince);
      }
      // Add timestamp to bypass Twitter OG image cache
      params.set('t', Date.now().toString());

      // Use current environment's base URL (preflight or production)
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin;
      const sharePageUrl = `${baseUrl}/share/identity?${params.toString()}`;

      // Tweet text
      const shareText = `${tierConfig.icon} ${tierProfile.tier} Supporter | ${tierProfile.personality?.name || 'Explorer'}

Build your early supporter identity on @bloom__protocol`;

      // Build X intent URL
      const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(sharePageUrl)}`;

      // Open in new window
      window.open(xUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Error sharing to X:', error);
      // Fallback: copy to clipboard
      const fallbackText = `${tierConfig.icon} ${tierProfile.tier} Supporter | ${tierProfile.personality?.name || 'Explorer'} - Build your early supporter identity on @bloom__protocol https://bloomprotocol.ai`;
      navigator.clipboard?.writeText(fallbackText);
      alert('Could not open X. Text copied to clipboard!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div
        ref={popupRef}
        className="relative w-full max-w-[360px]"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 z-30 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>

        {/* 3D Frame - Outer glow */}
        <div
          className="absolute -inset-[3px] rounded-[30px] pointer-events-none"
          style={{
            background: `linear-gradient(135deg, ${tierConfig.frameColor}, transparent 40%, transparent 60%, ${tierConfig.frameColor})`,
            opacity: 0.8,
          }}
        />

        {/* Glass rim - visible border */}
        <div
          className="absolute -inset-[2px] rounded-[28px] pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0.9) 100%)',
            boxShadow: `
              0 0 0 1px rgba(255,255,255,0.6),
              inset 0 0 0 1px rgba(255,255,255,0.8),
              0 8px 32px rgba(0,0,0,0.12)
            `,
          }}
        />

        {/* Main Card */}
        <div
          className="relative rounded-3xl overflow-hidden"
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            border: '1.5px solid rgba(200, 180, 255, 0.4)',
            boxShadow: `
              0 25px 50px -12px rgba(147, 51, 234, 0.2),
              0 12px 24px -8px rgba(147, 51, 234, 0.1),
              0 0 0 1px rgba(255, 255, 255, 0.8),
              inset 0 1px 0 rgba(255,255,255,1),
              inset 0 -1px 0 rgba(147, 51, 234, 0.05)
            `,
          }}
        >
          {/* Purple glass gradient background */}
          <div
            className="absolute inset-0 opacity-70"
            style={{
              background: `linear-gradient(
                135deg,
                rgba(255, 255, 255, 0.9) 0%,
                rgba(200, 180, 255, 0.5) 15%,
                rgba(180, 160, 255, 0.4) 30%,
                rgba(220, 180, 255, 0.35) 45%,
                rgba(200, 170, 255, 0.3) 55%,
                rgba(170, 160, 255, 0.35) 70%,
                rgba(190, 180, 255, 0.4) 85%,
                rgba(255, 255, 255, 0.7) 100%
              )`
            }}
          />
          {/* Secondary purple overlay for depth */}
          <div
            className="absolute inset-0 opacity-40"
            style={{
              background: `linear-gradient(
                45deg,
                transparent 0%,
                rgba(180, 140, 255, 0.3) 25%,
                rgba(160, 160, 255, 0.35) 50%,
                rgba(200, 160, 255, 0.3) 75%,
                transparent 100%
              )`
            }}
          />

          {/* Enhanced grain texture for glass effect */}
          <div
            className="absolute inset-0 opacity-[0.35] pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
            }}
          />

          {/* Edge highlight for 3D effect */}
          <div
            className="absolute inset-0 rounded-3xl pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.5) 0%, transparent 50%, rgba(0,0,0,0.05) 100%)',
            }}
          />

          {/* Card Content */}
          <div className="relative z-10 p-6">
            {/* Card Header - ID Card Style */}
            <div className="flex items-center justify-between mb-4">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                Supporter ID
              </div>
              <div className="text-[10px] font-mono text-gray-400">
                #{cardId}
              </div>
            </div>

            {/* Decorative line */}
            <div className="h-px bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 mb-5" />

            {/* Tier Icon & Badge */}
            <div className="text-center mb-4">
              <div className="text-5xl mb-3">{tierConfig.icon}</div>
              <div
                className={`inline-block px-5 py-2 rounded-full bg-gradient-to-r ${tierConfig.gradient} text-white font-bold text-base shadow-lg`}
                style={{
                  boxShadow: '0 4px 14px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.3)',
                }}
              >
                {tierProfile.tier}
              </div>
            </div>

            {/* Personality */}
            <div className="text-center mb-4">
              <p className="text-xl font-bold text-gray-800 mb-1">{tierProfile.personality.name}</p>
              {/* Dynamic insight based on categories */}
              {tierProfile.topCategories.length > 0 ? (
                <p className="text-sm text-gray-500">
                  You back <span className="font-medium text-gray-600">{tierProfile.topCategories[0].label.toLowerCase()}</span> projects
                  {tierProfile.topCategories.length > 1 && (
                    <> & <span className="font-medium text-gray-600">{tierProfile.topCategories[1].label.toLowerCase()}</span></>
                  )}
                </p>
              ) : (
                <p className="text-sm text-gray-500 italic">"{tierProfile.personality.description}"</p>
              )}
            </div>

            {/* Top Categories */}
            {tierProfile.topCategories.length > 0 && (
              <div className="flex justify-center gap-2 mb-4 flex-wrap">
                {tierProfile.topCategories.map((category, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/50 border border-white/60 text-sm"
                    style={{
                      boxShadow: 'inset 0 1px 2px rgba(147, 51, 234, 0.05)',
                    }}
                  >
                    <span>{category.icon}</span>
                    <span className="text-gray-700 font-medium">{category.label}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Your Discovery Style */}
            {tierProfile.topCategories.length > 0 && (() => {
              const styleLabels = getStyleLabels(tierProfile.topCategories);
              return styleLabels.length > 0 ? (
                <div className="mb-4">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 text-center">
                    Your Discovery Style
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {styleLabels.map((style, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-white/30 border border-white/40"
                        style={{
                          boxShadow: 'inset 0 1px 2px rgba(147, 51, 234, 0.03)',
                        }}
                      >
                        <span className="text-lg">{style.emoji}</span>
                        <span className="text-sm font-medium text-gray-700">{style.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null;
            })()}

            {/* Member since */}
            {tierProfile.memberSince && (
              <div className="text-center text-xs text-gray-400 mb-4">
                Member since {new Date(tierProfile.memberSince).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </div>
            )}

            {/* Bottom Section */}
            <div className="pt-4 border-t border-gray-200">
              {/* Branding with slogan */}
              <div className="text-center">
                <div className="text-sm font-semibold text-gray-600 tracking-wide">bloomprotocol.ai</div>
                <div className="text-[10px] text-gray-400 mt-0.5">Discover. Support. Bloom.</div>
              </div>
            </div>
          </div>
        </div>

        {/* Share Button */}
        <div className="mt-4">
          <button
            onClick={handleShareToX}
            className="w-full py-3.5 rounded-xl bg-black text-white font-semibold text-sm hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
            style={{
              boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
            }}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            Share on X
          </button>
        </div>
      </div>
    </div>
  );
}
