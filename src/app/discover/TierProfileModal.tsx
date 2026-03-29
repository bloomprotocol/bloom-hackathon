'use client';

import { useMemo, useState } from 'react';
import { useTierProfile, useMyPledges, useWeeklyLimit, useIdentitySnapshot, useSaveIdentitySnapshot } from '@/hooks/usePledges';
import { useAuth } from '@/lib/context/AuthContext';
import IdentityCard from '@/components/identity/IdentityCard';
import { getPersonalityConfig } from '@/components/identity/personalityConfig';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api/apiConfig';
import type { ProductHuntProduct } from '@/hooks/useProductHuntProducts';

// Identity unlock threshold (use all weekly power)
const WEEKLY_POWER = 1000;
const UNLOCK_THRESHOLD = 1000;

interface TierProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Main categories matching the FE category bar
const FE_MAIN_CATEGORIES: { [key: string]: string } = {
  'ai-tools': 'AI Tools',
  'productivity': 'Productivity',
  'wellness': 'Wellness',
  'education': 'Education',
  'crypto': 'Crypto',
  'lifestyle': 'Lifestyle',
};

// Map any category to main FE category
function mapToMainCategory(category: string): string | null {
  const catLower = category.toLowerCase().trim();

  // Direct match
  if (FE_MAIN_CATEGORIES[catLower]) {
    return FE_MAIN_CATEGORIES[catLower];
  }

  // Keyword matching
  if (catLower.includes('ai') || catLower.includes('artificial intelligence') || catLower.includes('machine learning')) {
    return 'AI Tools';
  }
  if (catLower.includes('productivity') || catLower.includes('workflow')) {
    return 'Productivity';
  }
  if (catLower.includes('wellness') || catLower.includes('health') || catLower.includes('fitness')) {
    return 'Wellness';
  }
  if (catLower.includes('education') || catLower.includes('learning')) {
    return 'Education';
  }
  if (catLower.includes('crypto') || catLower.includes('blockchain') || catLower.includes('web3') || catLower.includes('defi')) {
    return 'Crypto';
  }
  if (catLower.includes('lifestyle')) {
    return 'Lifestyle';
  }

  return null;
}

export default function TierProfileModal({ isOpen, onClose }: TierProfileModalProps) {
  const { user } = useAuth();
  const { data: profile, isLoading } = useTierProfile(!!user);
  const { data: snapshot } = useIdentitySnapshot(!!user && isOpen);
  const saveSnapshot = useSaveIdentitySnapshot();
  const [isSaving, setIsSaving] = useState(false);
  const { data: myPledges } = useMyPledges(!!user && isOpen);
  const { data: weeklyLimit } = useWeeklyLimit(!!user && isOpen);

  // Fetch all products to get their categories
  // Use limit=100 to get enough products to cover user's pledges
  const { data: productsData } = useQuery({
    queryKey: ['products-for-categories', myPledges?.items?.length],
    queryFn: async () => {
      const response = await apiGet<{ success: boolean; data: { projects: ProductHuntProduct[] } }>('/product-hunt/products?limit=100');
      return response.data.projects;
    },
    enabled: !!user && isOpen && !!myPledges,
    staleTime: 0,
    retry: 3,
  });

  // Calculate top categories from user's actual pledges
  const calculatedTopCategories = useMemo(() => {
    if (!myPledges?.items || !productsData) {
      return snapshot?.topCategories || [];
    }

    const pledgedProjectIds = new Set(myPledges.items.map(p => p.projectId));
    const categoryCount: { [key: string]: number } = {};

    productsData.forEach(product => {
      if (pledgedProjectIds.has(product.projectId)) {
        const mainCat = mapToMainCategory(product.mainCategory);
        if (mainCat) {
          categoryCount[mainCat] = (categoryCount[mainCat] || 0) + 1;
        }
      }
    });

    return Object.entries(categoryCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([label]) => ({
        key: label.toLowerCase().replace(/\s+/g, '-'),
        label: label,
        icon: '',
      }));
  }, [myPledges, productsData, snapshot]);

  // Calculate personality based on top categories
  const calculatedPersonality = useMemo(() => {
    if (!calculatedTopCategories.length) {
      // Use snapshot personality if available while loading
      if (snapshot?.personality?.name) {
        const personalityConfig = getPersonalityConfig(snapshot.personality.name);
        return {
          name: snapshot.personality.name,
          description: snapshot.personality.description || personalityConfig.description,
        };
      }
      // Default to Curator if no snapshot
      const personalityConfig = getPersonalityConfig('The Curator');
      return {
        name: 'The Curator',
        description: personalityConfig.description,
      };
    }

    const topCategory = calculatedTopCategories[0].label;

    // Map top category to personality (Human Supporter personalities)
    const personalityMap: { [key: string]: string } = {
      'Wellness': 'The Nurturer',
      'Productivity': 'The Achiever',
      'AI Tools': 'The Trailblazer',
      'Crypto': 'The Pioneer',
      'Education': 'The Curator',
      'Lifestyle': 'The Nurturer',
    };

    const newPersonalityName = personalityMap[topCategory] || 'The Curator';
    const personalityConfig = getPersonalityConfig(newPersonalityName);

    return {
      name: newPersonalityName,
      description: personalityConfig.description,
    };
  }, [calculatedTopCategories, snapshot]);

  if (!isOpen) return null;

  // Check if unlocked (used all weekly power)
  const remaining = weeklyLimit?.remaining || 0;
  const totalPower = weeklyLimit?.totalPower || WEEKLY_POWER;
  const usedThisWeek = totalPower - remaining;
  const isUnlocked = usedThisWeek >= UNLOCK_THRESHOLD;

  // Calculate week number since member joined
  const getWeekNumber = () => {
    if (!profile?.memberSince) return undefined;
    const memberDate = new Date(profile.memberSince);
    const now = new Date();
    const diffMs = now.getTime() - memberDate.getTime();
    const diffWeeks = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7));
    return diffWeeks + 1; // +1 because week 1 is the first week
  };

  // Generate card ID based on personality and user ID
  const getCardId = () => {
    if (!user?.uid || !calculatedPersonality?.name) return undefined;
    const prefix = calculatedPersonality.name.charAt(0).toUpperCase();
    const id = String(user.uid).padStart(4, '0').slice(-4);
    return `${prefix}-${id}`;
  };

  const getSnapshotData = () => ({
    personalityName: calculatedPersonality?.name || profile?.personality?.name || 'The Curator',
    personalityDescription: calculatedPersonality?.description || profile?.personality?.description || 'Curious about everything',
    topCategories: calculatedTopCategories.slice(0, 3),
  });

  // Always show freshly computed personality from current pledges
  const displayPersonality = calculatedPersonality;
  const displayCategories = calculatedTopCategories;

  const handleSaveAndShare = async () => {
    setIsSaving(true);
    try {
      // Only save if not already saved
      if (!snapshot) {
        await saveSnapshot.mutateAsync(getSnapshotData());
      }

      // Format categories for URL (e.g., "🤖AI Tools,⚡Productivity")
      const categoriesStr = displayCategories
        .map(cat => `${cat.icon || ''}${cat.label}`)
        .join(',');

      // Build shareable URL with OG meta tags (same format as PostPledgePopup)
      const params = new URLSearchParams({
        tier: profile?.tier || 'Seed',
        personality: displayPersonality?.name || 'The Curator',
        description: displayPersonality?.description || 'Curious about everything',
      });
      if (categoriesStr) {
        params.set('categories', categoriesStr);
      }
      if (profile?.memberSince) {
        params.set('since', profile.memberSince);
      }
      // Add timestamp to bypass Twitter OG image cache
      params.set('t', Date.now().toString());

      // Use current environment's base URL (preflight or production)
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin;
      const shareUrl = `${baseUrl}/share/identity?${params.toString()}`;
      const text = `Just discovered I'm a ${displayPersonality?.name} on Bloom Protocol!`;
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
      window.open(twitterUrl, '_blank');
    } catch (error) {
      console.error('Failed to save identity snapshot:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAndViewDashboard = async () => {
    setIsSaving(true);
    try {
      await saveSnapshot.mutateAsync(getSnapshotData());
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Failed to save identity snapshot:', error);
      setIsSaving(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
    >
      <div
        className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300"
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 hover:bg-white text-gray-600 hover:text-gray-900 transition-colors"
          aria-label="Close"
        >
          <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
          </svg>
        </button>

        {isLoading || !profile ? (
          <div className="p-12">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        ) : !isUnlocked ? (
          /* Locked State */
          <div className="relative p-8">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🔒</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Discover your taste</h2>
              <p className="text-sm text-gray-600">
                {totalPower - usedThisWeek} more Pledge Power to unlock
              </p>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-gray-700">This Week</span>
                <span className="text-sm font-bold text-purple-600">{usedThisWeek} / {totalPower}</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((usedThisWeek / totalPower) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* Blurred Preview - uses snapshot or calculated data */}
            <div className="relative p-6 rounded-2xl bg-white/60 backdrop-blur-sm overflow-hidden">
              <div className="absolute inset-0 backdrop-blur-lg bg-white/40 z-10" />
              <div className="blur-md relative" key={`preview-${calculatedPersonality?.name}`}>
                <div className="text-center mb-4">
                  <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-emerald-400 to-green-500 text-white font-bold text-xl">
                    {profile.tier} Supporter
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-gray-800">{calculatedPersonality?.name || profile.personality.name}</p>
                  <p className="text-sm text-gray-600 italic">"{calculatedPersonality?.description || profile.personality.description}"</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Content */}
            <div className="relative p-8">
              {/* Identity Card - uses saved snapshot data if available */}
              <IdentityCard
                personalityName={displayPersonality?.name || profile.personality.name}
                personalityDescription={displayPersonality?.description || profile.personality.description}
                personalityImage={getPersonalityConfig(displayPersonality?.name || profile.personality.name).imageUrl}
                backgroundImage={getPersonalityConfig(displayPersonality?.name || profile.personality.name).backgroundImageUrl}
                topCategories={displayCategories.slice(0, 3)}
                backgroundColor={getPersonalityConfig(displayPersonality?.name || profile.personality.name).backgroundColor}
                longDescription={getPersonalityConfig(displayPersonality?.name || profile.personality.name).longDescription}
                memberSince={profile.memberSince ? new Date(profile.memberSince).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : undefined}
                weekNumber={getWeekNumber()}
                projectsSupported={profile.projectsSupported}
                cardId={getCardId()}
                tier={profile.tier}
              />

              {/* Action Buttons */}
              <div className="mt-6 pt-6 border-t border-white/50">
                <button
                  onClick={handleSaveAndViewDashboard}
                  disabled={isSaving}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold text-sm hover:from-violet-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 mb-3 disabled:opacity-60"
                >
                  {isSaving ? 'Saving...' : 'Save and View in Dashboard'}
                </button>
                <button
                  onClick={handleSaveAndShare}
                  disabled={isSaving}
                  className="w-full text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors disabled:opacity-60"
                >
                  Share on X
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
