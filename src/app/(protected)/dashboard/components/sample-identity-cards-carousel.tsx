'use client';

import { useState } from 'react';
import IdentityCard from '@/components/identity/IdentityCard';
import { getPersonalityConfig } from '@/components/identity/personalityConfig';
import styles from './identity-cards-carousel.module.css';

// Sample cards data for preview - 4 different supporter personalities
const SAMPLE_CARDS = [
  {
    type: 'human' as const,
    personality: 'The Achiever',
    tier: 'New' as const,
    categories: ['Productivity', 'SaaS', 'Business'],
    projectsSupported: 8,
    memberSince: 'Feb 2026',
  },
  {
    type: 'human' as const,
    personality: 'The Curator',
    tier: 'Seed' as const,
    categories: ['Design', 'Content', 'Community'],
    projectsSupported: 15,
    memberSince: 'Dec 2025',
  },
  {
    type: 'human' as const,
    personality: 'The Pioneer',
    tier: 'Sprout' as const,
    categories: ['Web3', 'DeFi', 'NFT'],
    projectsSupported: 20,
    memberSince: 'Nov 2025',
  },
  {
    type: 'human' as const,
    personality: 'The Trailblazer',
    tier: 'Bloom' as const,
    categories: ['AI & ML', 'Developer Tools', 'Web3'],
    projectsSupported: 12,
    memberSince: 'Jan 2026',
  },
];

export default function SampleIdentityCardsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(1); // Start at middle card (index 1 of 4)

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? SAMPLE_CARDS.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === SAMPLE_CARDS.length - 1 ? 0 : prev + 1));
  };

  // Calculate base scale - match official carousel
  const baseScale = 0.75;

  return (
    <div className="relative">
      {/* Title */}
      <div className="mb-8 text-center">
        <h2 className="font-serif font-bold text-3xl text-[#393f49]">
          Which Type Are You?
        </h2>
      </div>

      {/* 3D Coverflow Carousel */}
      <div className={styles.carouselContainer}>
        <div className="relative h-[550px] flex items-center justify-center">
          {SAMPLE_CARDS.map((card, index) => {
            const personalityConfig = getPersonalityConfig(card.personality);
            if (!personalityConfig) return null;

            // Calculate position relative to current index
            const position = index - currentIndex;

            // Calculate transform based on position
            let transform = '';
            let zIndex = 0;
            let opacity = 0;

            if (position === 0) {
              // Center card (active)
              transform = `translateX(0%) scale(${baseScale * 1.15}) rotateY(0deg)`;
              zIndex = 30;
              opacity = 1;
            } else if (position === -1) {
              // Left card
              transform = `translateX(-85%) scale(${baseScale * 0.85}) rotateY(55deg)`;
              zIndex = 20;
              opacity = 0.7;
            } else if (position === 1) {
              // Right card
              transform = `translateX(85%) scale(${baseScale * 0.85}) rotateY(-55deg)`;
              zIndex = 20;
              opacity = 0.7;
            } else {
              // Hidden
              transform = position < 0
                ? `translateX(-170%) scale(${baseScale * 0.6}) rotateY(65deg)`
                : `translateX(170%) scale(${baseScale * 0.6}) rotateY(-65deg)`;
              zIndex = 10;
              opacity = 0;
            }

            // Use empty categories for preview mode (no main categories shown)
            const topCategories: any[] = [];

            return (
              <div
                key={index}
                className={`${styles.carouselCard} absolute`}
                style={{
                  transform,
                  zIndex,
                  opacity,
                  pointerEvents: position === 0 ? 'auto' : 'none',
                }}
                data-active={position === 0}
              >
                <div className="max-w-[372px]">
                  <IdentityCard
                    personalityName={card.personality}
                    personalityDescription={personalityConfig.description}
                    personalityImage={personalityConfig.imageUrl}
                    backgroundImage={personalityConfig.backgroundImageUrl}
                    backgroundColor={personalityConfig.backgroundColor}
                    longDescription={personalityConfig.longDescription}
                    tier={card.tier}
                    memberSince={card.memberSince}
                    topCategories={topCategories}
                    projectsSupported={card.projectsSupported}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-center gap-6 mt-8">
        {/* Previous Button */}
        <button
          onClick={handlePrevious}
          className="size-12 rounded-full bg-white/90 backdrop-blur-sm border border-gray-200 flex items-center justify-center hover:bg-white transition-colors shadow-lg"
          aria-label="Previous card"
        >
          <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Dots Indicator */}
        <div className="flex gap-2">
          {SAMPLE_CARDS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`size-2.5 rounded-full transition-all ${
                idx === currentIndex
                  ? 'bg-[#a59af3] w-8'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to card ${idx + 1}`}
            />
          ))}
        </div>

        {/* Next Button */}
        <button
          onClick={handleNext}
          className="size-12 rounded-full bg-white/90 backdrop-blur-sm border border-gray-200 flex items-center justify-center hover:bg-white transition-colors shadow-lg"
          aria-label="Next card"
        >
          <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
