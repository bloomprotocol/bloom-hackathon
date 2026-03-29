'use client';

import { TIER_DEFINITIONS, TierDefinition } from '@/constants/tier-definitions';
import { useState } from 'react';

interface TierRoadmapProps {
  currentTier?: string | null; // null = Level 0 (new user, no tier unlocked yet)
  className?: string;
}

export default function TierRoadmap({ currentTier = null, className = '' }: TierRoadmapProps) {
  const [expandedTier, setExpandedTier] = useState<string | null>(null);

  const currentTierLevel = currentTier ? (TIER_DEFINITIONS.find(t => t.id === currentTier)?.level || 0) : 0;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="text-center space-y-1 pb-2">
        <h4 className="font-['Outfit'] text-[14px] font-semibold text-[#393f49]">
          Tier Progression
        </h4>
        <p className="font-['Outfit'] text-[11px] text-[#696f8c]">
          Seed → Sprout → Bloom
        </p>
      </div>

      {/* Tier Cards */}
      <div className="space-y-3">
        {TIER_DEFINITIONS.map((tier) => {
          const isCurrentTier = currentTier !== null && tier.id === currentTier;
          const isCompleted = tier.level < currentTierLevel;
          const isExpanded = expandedTier === tier.id;
          const isLocked = currentTierLevel === 0 ? tier.level > 1 : tier.level > currentTierLevel + 1;

          return (
            <div
              key={tier.id}
              className={`
                rounded-xl border transition-all duration-300
                ${isCurrentTier
                  ? 'border-2 shadow-lg bg-white'
                  : isCompleted
                  ? 'border border-green-200 bg-green-50/30'
                  : 'border border-gray-200 bg-white/60'
                }
                ${isLocked ? 'opacity-50' : 'opacity-100'}
              `}
            >
              {/* Tier Header - Always visible */}
              <button
                onClick={() => setExpandedTier(isExpanded ? null : tier.id)}
                className="w-full p-3 flex items-center justify-between hover:bg-gray-50/50 transition-colors rounded-xl"
              >
                <div className="flex items-center gap-3">
                  {/* Icon & Level */}
                  <div className="flex flex-col items-center">
                    <span className="text-[24px]">{tier.icon}</span>
                    <span className="font-['Outfit'] text-[9px] text-gray-400 uppercase tracking-wide">
                      Lv.{tier.level}
                    </span>
                  </div>

                  {/* Name & Description */}
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <h5
                        className="font-['Outfit'] text-[14px] font-bold"
                        style={{ color: tier.color }}
                      >
                        {tier.name}
                      </h5>
                      {isCurrentTier && (
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[9px] font-semibold rounded-full uppercase tracking-wide">
                          Current
                        </span>
                      )}
                      {isCompleted && (
                        <span className="text-green-600 text-[14px]">✓</span>
                      )}
                    </div>
                    <p className="font-['Outfit'] text-[11px] text-[#696f8c] mt-0.5">
                      {tier.description}
                    </p>
                  </div>
                </div>

                {/* Expand Arrow */}
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-2 space-y-4 border-t border-gray-100 animate-fadeIn">
                  {/* Requirements */}
                  <div>
                    <h6 className="font-['Outfit'] text-[11px] font-semibold text-[#393f49] mb-2 uppercase tracking-wide">
                      Requirements
                    </h6>
                    <div className="space-y-2">
                      {tier.requirements.map((req) => (
                        <div key={req.id} className="flex items-start gap-2">
                          <div className="shrink-0 w-4 h-4 rounded-full border-2 border-gray-300 mt-0.5" />
                          <div className="flex-1">
                            <p className="font-['Outfit'] text-[12px] text-[#393f49]">
                              {req.label}
                            </p>
                            {req.description && (
                              <p className="font-['Outfit'] text-[10px] text-[#696f8c] mt-0.5">
                                {req.description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Benefits */}
                  <div>
                    <h6 className="font-['Outfit'] text-[11px] font-semibold text-[#393f49] mb-2 uppercase tracking-wide">
                      Benefits
                    </h6>
                    <div className="space-y-1.5">
                      {tier.benefits.map((benefit, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <span className="text-purple-600 mt-0.5 text-[12px]">✓</span>
                          <p className="font-['Outfit'] text-[11px] text-[#696f8c]">
                            {benefit}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Thresholds (if available) */}
                  {tier.thresholds && (
                    <div className="pt-2 border-t border-gray-100">
                      <div className="flex flex-wrap gap-3 text-[10px]">
                        {tier.thresholds.pledgePower && (
                          <div className="flex items-center gap-1">
                            <span className="text-gray-400">Power:</span>
                            <span className="font-semibold text-gray-600">
                              {tier.thresholds.pledgePower.toLocaleString()}
                            </span>
                          </div>
                        )}
                        {tier.thresholds.projectsSupported && (
                          <div className="flex items-center gap-1">
                            <span className="text-gray-400">Projects:</span>
                            <span className="font-semibold text-gray-600">
                              {tier.thresholds.projectsSupported}+
                            </span>
                          </div>
                        )}
                        {tier.thresholds.activeWeeks && (
                          <div className="flex items-center gap-1">
                            <span className="text-gray-400">Weeks:</span>
                            <span className="font-semibold text-gray-600">
                              {tier.thresholds.activeWeeks}+
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Note */}
      <div className="text-center pt-2">
        <p className="font-['Outfit'] text-[10px] text-[#696f8c] italic">
          Tiers unlock based on your activity and contributions
        </p>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-8px);
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
