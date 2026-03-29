'use client';

import { useState, useEffect } from 'react';
import DimensionBar from './DimensionBar';

interface CategoryInfo {
  key: string;
  label: string;
  icon: string;
}

interface IdentityCardProps {
  personalityName: string;
  personalityDescription: string;
  personalityImage: string;
  backgroundImage?: string; // Background pattern/texture image
  topCategories: CategoryInfo[];
  backgroundColor: string; // e.g., 'from-green-300 to-green-200'
  longDescription?: string;
  tasteSpectrums?: {
    learning: number;
    decision: number;
    novelty: number;
    risk: number;
  };
  // Additional stats
  memberSince?: string; // e.g., "January 2026"
  weekNumber?: number; // Active weeks count
  projectsSupported?: number;
  cardId?: string; // Unique card ID
  tier?: 'New' | 'Seed' | 'Sprout' | 'Bloom'; // For subtle tier indicator
}

export default function IdentityCard({
  personalityName,
  personalityDescription,
  personalityImage,
  backgroundImage,
  topCategories,
  backgroundColor,
  longDescription,
  tasteSpectrums,
  memberSince,
  weekNumber,
  projectsSupported,
  cardId,
  tier,
}: IdentityCardProps) {
  // Categories are already calculated and mapped in TierProfileModal
  const displayCategories = topCategories.slice(0, 3);

  // Image loading state to prevent flash
  const [imageLoaded, setImageLoaded] = useState(false);
  const [currentImage, setCurrentImage] = useState(personalityImage);

  // Preload image when personalityImage changes
  useEffect(() => {
    if (personalityImage !== currentImage) {
      setImageLoaded(false);
      const img = new Image();
      img.src = personalityImage;
      img.onload = () => {
        setCurrentImage(personalityImage);
        setImageLoaded(true);
      };
      img.onerror = () => {
        console.error('Failed to load image:', personalityImage);
        setImageLoaded(true); // Show anyway to prevent infinite loading
      };
    } else {
      setImageLoaded(true);
    }
  }, [personalityImage, currentImage]);

  return (
    <div className="relative w-full max-w-[372px] mx-auto">
      {/* Card Container */}
      <div
        className={`relative rounded-[20px] p-4 shadow-[0px_6px_10px_-4px_rgba(0,0,0,0.12),0px_0px_0px_1px_rgba(0,0,0,0.05)] backdrop-blur-[10px] bg-gradient-to-br ${backgroundColor}`}
        style={{ height: '659px', overflow: 'hidden' }}
      >
        {/* Background Pattern/Texture */}
        {backgroundImage && (
          <div className="absolute inset-0 rounded-[20px] overflow-hidden pointer-events-none z-0">
            <img
              src={backgroundImage}
              alt=""
              className="w-full h-full object-cover opacity-50 mix-blend-overlay"
              onError={(e) => {
                console.log('Background image failed to load:', backgroundImage);
              }}
            />
          </div>
        )}
        {/* Hero Image */}
        <div className="relative z-10 w-full h-[175px] mb-3 rounded-[20px] overflow-hidden bg-white/30">
          <img
            src={currentImage}
            alt={personalityName}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onError={(e) => {
              // Fallback: hide broken image
              e.currentTarget.style.display = 'none';
            }}
          />
          {/* Loading placeholder */}
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/50">
              <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
            </div>
          )}
        </div>

        {/* Content - with z-index to be above background */}
        <div className="relative z-10">
          {/* Personality Name + Your Discovery Badge */}
          <div className="flex items-baseline justify-between mb-2">
            <h2 className="font-['DM_Serif_Text'] text-[22px] text-[#121212] leading-normal">
              {personalityName}
            </h2>
            <div className="flex items-center gap-1 flex-shrink-0 ml-2">
              <span className="text-[12px]">👤</span>
              <span className="text-[10px] text-[#121212]/60 font-medium whitespace-nowrap">Your Discovery</span>
            </div>
          </div>

          {/* Personality Quote */}
          <p className="font-['Hedvig_Letters_Serif'] text-[18px] text-[#121212] opacity-90 mb-4 leading-normal italic">
            "{personalityDescription}"
          </p>

          {/* Long Description */}
          {longDescription && (
            <p className="font-['IBM_Plex_Mono'] font-light text-[14px] text-[#121212] opacity-90 mb-6 leading-normal">
              {longDescription}
            </p>
          )}

          {/* MentalOS Spectrum */}
          {tasteSpectrums && (
            <div className="mb-4 pt-3 border-t border-[#121212]/10 space-y-2">
              <DimensionBar
                leftLabel="Try First"
                rightLabel="Study First"
                value={tasteSpectrums.learning}
                color="from-emerald-400 to-teal-400"
              />
              <DimensionBar
                leftLabel="Gut"
                rightLabel="Analytical"
                value={tasteSpectrums.decision}
                color="from-blue-400 to-indigo-400"
              />
              <DimensionBar
                leftLabel="Early Adopter"
                rightLabel="Proven First"
                value={tasteSpectrums.novelty}
                color="from-amber-400 to-orange-400"
              />
              <DimensionBar
                leftLabel="All In"
                rightLabel="Measured"
                value={tasteSpectrums.risk}
                color="from-rose-400 to-pink-400"
              />
            </div>
          )}

          {/* Top Categories - Dynamic Top 3 (main categories only) */}
          {displayCategories.length > 0 && (
            <div className="flex gap-3 mb-4 pt-3 border-t border-[#121212]/10 overflow-x-auto scrollbar-hide">
              {displayCategories.map((category) => (
                <div
                  key={category.key}
                  className="px-4 py-2 rounded-full bg-white/70 backdrop-blur-md border border-white/50 shadow-[0px_2px_8px_rgba(255,255,255,0.3),inset_0px_1px_1px_rgba(255,255,255,0.8)]"
                >
                  <p className="font-['IBM_Plex_Mono'] font-normal text-[13px] text-[#374151] whitespace-nowrap leading-normal">
                    {category.label}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Bottom Footer */}
          <div className="pt-2">
            {/* Member Since + Projects + Card ID — single row */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                {memberSince && (
                  <span className="font-['IBM_Plex_Mono'] text-[10px] text-[#121212]/60">
                    Member since {memberSince}
                  </span>
                )}
                {projectsSupported !== undefined && (
                  <div className="flex items-center gap-1 text-[#121212]/60">
                    <div className="w-3 h-3 flex-shrink-0">
                      <img
                        src="/identity/bloom-icon.png"
                        alt=""
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <span className="font-['IBM_Plex_Mono'] text-[10px]">{projectsSupported} projects</span>
                  </div>
                )}
              </div>
              {cardId && (
                <span className="font-['IBM_Plex_Mono'] text-[9px] text-[#121212]/40">
                  #{cardId}
                </span>
              )}
            </div>

            {/* Bloom Protocol Logo — centered */}
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-2 opacity-50">
                <div className="w-5 h-5 flex-shrink-0">
                  <img
                    src="/identity/bloom-logo.png"
                    alt="Bloom Protocol"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="h-3.5 flex-shrink-0">
                  <img
                    src="/identity/bloom-text-logo.png"
                    alt="Bloom Protocol"
                    className="h-full w-auto object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
