'use client';

import { useState } from 'react';
import { useSeedPassProgress } from '@/hooks/usePledges';
import { useAuth } from '@/lib/context/AuthContext';
import { getTierById } from '@/constants/tier-definitions';
import TierRoadmap from './TierRoadmap';

export default function SeedPassUnlockCard() {
  const { user } = useAuth();
  const { data: progress, isLoading } = useSeedPassProgress(!!user);
  const [showDetails, setShowDetails] = useState(false);
  const [showCriteria, setShowCriteria] = useState(false);
  const [showTierRoadmap, setShowTierRoadmap] = useState(false);

  // Get Seed tier requirements from centralized definitions
  const seedTier = getTierById('seed');
  const criteria = seedTier?.requirements.map((req, idx) => ({
    id: idx + 1,
    label: req.label,
    completed: false, // TODO: Connect to actual progress data
  })) || [];

  const completedCount = criteria.filter(c => c.completed).length;
  const totalCount = criteria.length;

  // Determine actual tier based on completion
  // If user completed all Seed requirements, they are Seed (Level 1)
  // Otherwise, they are Level 0 (new user, no tier unlocked)
  const hasUnlockedSeed = completedCount === totalCount;
  const actualTier = hasUnlockedSeed ? 'seed' : null;

  // TEMPORARY: Mock data for development
  const isDevelopment = process.env.NODE_ENV === 'development';
  const mockProgress = {
    pledgePowerUsed: 0,
    projectsPledged: 0,
    activeWeeks: 0,
    messagesSent: 0,
    pledgePowerTarget: 1000,
    projectsTarget: 5,
    weeksTarget: 2,
    messagesTarget: 1,
    isUnlocked: false,
  };

  const effectiveProgress = (!user && isDevelopment) ? mockProgress : progress;

  if (!user && !isDevelopment) {
    return null;
  }

  if (isLoading && user) {
    return (
      <div className="relative p-8 rounded-[20px] overflow-hidden"
        style={{
          background: 'rgba(245, 243, 250, 0.85)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(150, 130, 200, 0.12)',
        }}
      >
        <div className="animate-pulse space-y-6">
          <div className="h-6 bg-purple-100/60 rounded w-2/3 mx-auto"></div>
          <div className="h-32 bg-purple-100/60 rounded-full w-32 mx-auto"></div>
          <div className="h-10 bg-purple-100/60 rounded-full"></div>
        </div>
      </div>
    );
  }

  const progressData = effectiveProgress || mockProgress;

  return (
    <div
      className="relative p-8 rounded-[20px] overflow-hidden transition-all duration-500 hover:scale-[1.02]"
      style={{
        background: 'rgba(245, 243, 250, 0.85)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(150, 130, 200, 0.1)',
        boxShadow: '0 4px 24px rgba(100, 80, 150, 0.06), inset 0 1px 1px rgba(255, 255, 255, 0.6)',
      }}
    >
      {/* Ambient inner glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(200, 170, 255, 0.08) 0%, transparent 70%)',
        }}
      />

      {/* Star particles */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(1px 1px at 15% 20%, rgba(140, 100, 200, 0.2), transparent),
            radial-gradient(1px 1px at 85% 15%, rgba(140, 100, 200, 0.15), transparent),
            radial-gradient(2px 2px at 70% 60%, rgba(140, 100, 200, 0.12), transparent),
            radial-gradient(1px 1px at 25% 75%, rgba(140, 100, 200, 0.22), transparent),
            radial-gradient(1px 1px at 90% 80%, rgba(140, 100, 200, 0.15), transparent),
            radial-gradient(1px 1px at 40% 30%, rgba(140, 100, 200, 0.12), transparent),
            radial-gradient(2px 2px at 60% 85%, rgba(140, 100, 200, 0.18), transparent)
          `,
        }}
      />

      {/* Subtle grain texture */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Content */}
      <div className="relative z-10 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h3
            className="font-['Outfit'] text-[22px] font-bold"
            style={{ color: '#1a1228' }}
          >
            Unlock Your Bloom Pass
          </h3>
          <div className="flex items-center justify-center gap-2">
            <p
              className="font-['Outfit'] text-[13px] font-normal"
              style={{ color: 'rgba(100, 80, 140, 0.5)' }}
            >
              {hasUnlockedSeed ? 'Start from' : 'Begin your journey with'}
            </p>
            {/* Tier badge */}
            <div
              className="font-['Outfit'] text-[10px] font-medium uppercase px-2.5 py-0.5 rounded-full"
              style={{
                background: 'rgba(140, 120, 200, 0.12)',
                letterSpacing: '1px',
                color: 'rgba(120, 90, 180, 0.7)',
                borderRadius: '100px',
                padding: '2px 10px',
              }}
            >
              Seed
            </div>
            {hasUnlockedSeed && (
              <p
                className="font-['Outfit'] text-[13px] font-normal"
                style={{ color: 'rgba(100, 80, 140, 0.5)' }}
              >
                tier
              </p>
            )}
          </div>
        </div>

        {/* Locked Seed Visual - Center emotional anchor */}
        <div className="flex flex-col items-center gap-6 py-8">
          {/* Locked Bloom Logo with pulsing glow */}
          <div className="relative">
            {/* Pulsing glow effect */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(200, 180, 255, 0.1) 0%, transparent 70%)',
                animation: 'pulse-glow 3s ease-in-out infinite',
                transform: 'scale(2)',
              }}
            />

            {/* Logo container */}
            <div className="relative w-24 h-24 rounded-full backdrop-blur-sm flex items-center justify-center"
              style={{
                background: 'rgba(140, 100, 200, 0.08)',
                border: '1px solid rgba(140, 100, 200, 0.15)'
              }}
            >
              <img
                src="/identity/bloom-logo.png"
                alt="Bloom"
                className="w-14 h-14 object-contain"
                style={{
                  opacity: 0.4,
                  filter: 'sepia(100%) saturate(250%) hue-rotate(230deg) brightness(0.8)'
                }}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/identity/bloom-logo.png';
                }}
              />
            </div>
          </div>

          {/* Tier progression description */}
          <p
            className="font-['Outfit'] text-[13px] font-light text-center max-w-[240px]"
            style={{
              color: 'rgba(80, 60, 120, 0.55)',
              lineHeight: '1.6',
            }}
          >
            Earn points to level up from Seed → Sprout → Bloom
          </p>
        </div>

        {/* Expandable Criteria Section */}
        <div>
          {/* Trigger */}
          <button
            onClick={() => setShowCriteria(!showCriteria)}
            className="w-full flex items-center justify-center gap-2 font-['Outfit'] text-[13px] font-medium transition-all duration-300"
            style={{ color: 'rgba(100,80,140,0.5)', cursor: 'pointer' }}
          >
            <span>What you need to do</span>
            <svg
              className="w-4 h-4 transition-transform duration-300"
              style={{ transform: showCriteria ? 'rotate(180deg)' : 'rotate(0deg)' }}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>

          {/* Expanded Criteria List */}
          {showCriteria && (
            <div
              className="mt-4 pt-4 animate-fadeIn"
              style={{ borderTop: '1px solid rgba(150,130,200,0.08)' }}
            >
              <div className="px-4 space-y-3">
                {criteria.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    {/* Circle Indicator */}
                    <div
                      className="flex items-center justify-center shrink-0"
                      style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        border: item.completed ? 'none' : '1.5px solid rgba(150,130,200,0.25)',
                        background: item.completed ? 'rgba(72,160,120,0.7)' : 'transparent',
                      }}
                    >
                      {item.completed && (
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                          <path
                            d="M1.5 4L3 5.5L6.5 2"
                            stroke="white"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>

                    {/* Text */}
                    <span
                      className="font-['Outfit'] text-[13px] font-normal flex-1"
                      style={{
                        color: item.completed ? 'rgba(60,50,80,0.35)' : 'rgba(60,50,80,0.65)',
                        textDecoration: item.completed ? 'line-through' : 'none',
                      }}
                    >
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Progress Summary */}
              <div className="mt-4 text-center">
                <p
                  className="font-['Outfit'] text-[11px] font-normal"
                  style={{ color: 'rgba(100,80,140,0.35)' }}
                >
                  {completedCount} of {totalCount} completed
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Tier Roadmap Section */}
        <div className="pt-2 space-y-3">
          {/* Toggle Button */}
          <button
            onClick={() => setShowTierRoadmap(!showTierRoadmap)}
            className="font-['Outfit'] text-[12px] font-normal transition-colors mx-auto block"
            style={{ color: 'rgba(140, 100, 200, 0.35)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'rgba(140, 100, 200, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'rgba(140, 100, 200, 0.35)';
            }}
          >
            {showTierRoadmap ? 'Hide tier roadmap' : 'View all tiers (Seed → Sprout → Bloom)'}
          </button>

          {/* Tier Roadmap */}
          {showTierRoadmap && (
            <div className="animate-fadeIn">
              <TierRoadmap currentTier={actualTier} />
            </div>
          )}

          {/* Seed Benefits (collapsed by default) */}
          {!showTierRoadmap && (
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="font-['Outfit'] text-[11px] font-normal transition-colors mx-auto block"
              style={{ color: 'rgba(140, 100, 200, 0.25)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'rgba(140, 100, 200, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'rgba(140, 100, 200, 0.25)';
              }}
            >
              {showDetails ? 'Hide Seed benefits' : 'What you get with Seed'}
            </button>
          )}

          {showDetails && !showTierRoadmap && (
            <div
              className="mt-3 space-y-2 font-['Outfit'] text-[12px] font-light animate-fadeIn px-4"
              style={{
                color: 'rgba(80, 60, 120, 0.55)',
                lineHeight: '1.5',
              }}
            >
              {seedTier?.benefits.map((benefit, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-purple-600 mt-0.5 text-[12px]">✓</span>
                  <span className="text-[11px]">{benefit}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse-glow {
          0%, 100% {
            opacity: 0.05;
            transform: scale(2);
          }
          50% {
            opacity: 0.15;
            transform: scale(2.1);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
