'use client';

import { useTierProfile } from '@/hooks/usePledges';
import { useAuth } from '@/lib/context/AuthContext';

// Tier colors and icons
const TIER_CONFIG = {
  New: {
    color: 'from-gray-400 to-gray-500',
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-600',
    icon: '✨',
  },
  Seed: {
    color: 'from-emerald-400 to-green-500',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-600',
    icon: '🌱',
  },
  Sprout: {
    color: 'from-violet-400 to-purple-500',
    bgColor: 'bg-violet-50',
    textColor: 'text-violet-600',
    icon: '🌿',
  },
  Bloom: {
    color: 'from-amber-400 to-orange-500',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-600',
    icon: '🌸',
  },
};

export default function TierIdentityCard() {
  const { user } = useAuth();
  const { data: profile, isLoading, error } = useTierProfile(!!user);

  if (!user) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="relative p-6 rounded-2xl overflow-hidden bg-white/60 backdrop-blur-md border border-white/50">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-2 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return null;
  }

  const tierConfig = TIER_CONFIG[profile.tier];

  return (
    <div
      className="relative p-6 rounded-2xl overflow-hidden border border-white/50"
      style={{
        background: 'rgba(255, 255, 255, 0.6)',
        boxShadow: '0 25px 50px -12px rgba(147, 51, 234, 0.15), 0 12px 24px -8px rgba(147, 51, 234, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.8)',
      }}
    >
      {/* Holographic purple gradient background */}
      <div
        className="absolute inset-0 opacity-80"
        style={{
          background: `linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.9) 0%,
            rgba(200, 180, 255, 0.6) 15%,
            rgba(180, 160, 255, 0.5) 30%,
            rgba(220, 180, 255, 0.4) 45%,
            rgba(200, 170, 255, 0.3) 55%,
            rgba(170, 160, 255, 0.4) 70%,
            rgba(190, 180, 255, 0.5) 85%,
            rgba(255, 255, 255, 0.8) 100%
          )`
        }}
      />
      {/* Secondary gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(
            45deg,
            transparent 0%,
            rgba(200, 160, 255, 0.3) 25%,
            rgba(180, 180, 255, 0.4) 50%,
            rgba(220, 180, 255, 0.3) 75%,
            transparent 100%
          )`
        }}
      />
      {/* Grain overlay for glass texture */}
      <div
        className="absolute inset-0 opacity-[0.35] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Your Bloom Identity
          </h3>
          <span className="text-2xl">{tierConfig.icon}</span>
        </div>

        {/* Tier Badge */}
        <div className="mb-4">
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${tierConfig.color} text-white font-bold text-lg shadow-lg`}
          >
            {profile.tier} Supporter
          </div>
        </div>

        {/* Personality */}
        <div className="mb-4">
          <p className="text-xl font-bold text-gray-800">{profile.personality.name}</p>
          <p className="text-sm text-gray-500 italic">"{profile.personality.description}"</p>
        </div>

        {/* Top Categories */}
        {profile.topCategories && profile.topCategories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {profile.topCategories.map((category, idx) => (
              <div
                key={idx}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/50 border border-white/60 text-sm"
              >
                <span>{category.icon}</span>
                <span className="text-gray-700 font-medium">{category.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Member Since */}
        {profile.memberSince && (
          <div className="pt-4 border-t border-white/50">
            <p className="text-xs text-gray-400">
              Supporter since{' '}
              <span className="text-gray-600 font-medium">
                {new Date(profile.memberSince).toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
