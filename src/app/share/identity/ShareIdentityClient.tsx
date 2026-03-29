'use client';

import { useEffect } from 'react';
import IdentityCard from '@/components/identity/IdentityCard';
import { getPersonalityConfig } from '@/components/identity/personalityConfig';

interface CategoryInfo {
  key: string;
  label: string;
  icon: string;
}

interface ShareIdentityClientProps {
  tier: string;
  personality: string;
  description: string;
  categories: CategoryInfo[];
  memberSince?: string;
}

export default function ShareIdentityClient({
  tier,
  personality,
  description,
  categories,
  memberSince,
}: ShareIdentityClientProps) {
  const personalityConfig = getPersonalityConfig(personality);

  // Generate card ID (simple hash from personality)
  const generateCardId = () => {
    const hash = personality.split('').reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);
    return `H-${hash.toString(16).toUpperCase().padStart(6, '0').slice(0, 6)}`;
  };

  useEffect(() => {
    // Track page view for analytics
    console.log('Shared identity card viewed:', { personality, tier });
  }, [personality, tier]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span className="font-medium">Back to Home</span>
          </a>
        </div>

        {/* Identity Card Display */}
        <div className="flex flex-col items-center">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Bloom Supporter Identity
            </h1>
            <p className="text-lg text-gray-600">
              {personality} - Building reputation on Bloom Protocol
            </p>
          </div>

          {/* Identity Card Component */}
          <IdentityCard
            personalityName={personality}
            personalityDescription={description}
            personalityImage={personalityConfig.imageUrl}
            backgroundImage={personalityConfig.backgroundImageUrl}
            backgroundColor={personalityConfig.backgroundColor}
            longDescription={personalityConfig.longDescription}
            topCategories={categories}
            memberSince={memberSince}
            cardId={generateCardId()}
            tier={tier as 'New' | 'Seed' | 'Sprout' | 'Bloom'}
          />

          {/* CTA Section - Simpler, no "About This Card" */}
          <div className="mt-8 w-full max-w-[372px] bg-white/50 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-gray-200">
            <p className="text-sm text-gray-600 text-center mb-4">
              Want to create your own supporter identity?
            </p>
            <a
              href="/discover"
              className="block w-full py-3.5 px-4 bg-gradient-to-b from-[#a59af3] to-[#8b7be8] text-white text-center rounded-xl font-semibold hover:from-[#b3a8ff] hover:to-[#9989f0] transition-all shadow-[0_4px_16px_rgba(139,123,232,0.4),inset_0_1px_2px_rgba(255,255,255,0.3)] border border-white/20 hover:shadow-[0_6px_20px_rgba(139,123,232,0.5),inset_0_1px_2px_rgba(255,255,255,0.4)] hover:scale-[1.02] active:scale-[0.98]"
            >
              Join Bloom Protocol
            </a>
          </div>

        </div>
      </div>
    </div>
  );
}
