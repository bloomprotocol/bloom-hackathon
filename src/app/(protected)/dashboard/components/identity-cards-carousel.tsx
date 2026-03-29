'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import TierIdentityCard from './tier-identity-card';
import AgentIdentityCard from './agent-identity-card';
import AgentIdentityCardPreview from './agent-identity-card-preview';
import HumanIdentityCardPreview from './human-identity-card-preview';
import InvitationCard from './invitation-card';
import PlaceholderCard from './placeholder-card';
import IdentityCard from '@/components/identity/IdentityCard';
import EmailCaptureModal from '@/components/auth/EmailCaptureModal';
import { useAuth } from '@/lib/context/AuthContext';
import { useSeedPassProgress, useIdentitySnapshot, useTierProfile } from '@/hooks/usePledges';
import { getPersonalityConfig, PERSONALITY_CONFIGS } from '@/components/identity/personalityConfig';
import { useAgentSession } from '@/hooks/useAgentSession';
import styles from './identity-cards-carousel.module.css';
import { AGENT_PERSONALITIES } from '../config/agent-personalities';
import { normalizeCategories } from '@/lib/utils/category-normalization';

// Type definitions for card data
type AgentCardData = {
  type: 'agent';
  personality: string;
  conviction: number;
  intuition: number;
  contribution: number;
  tasteSpectrums?: {
    learning: number;
    decision: number;
    novelty: number;
    risk: number;
  };
  categories: string[];
  memberSince: string;
  cardId: string;
  dynamicDescription?: string;
};

type CategoryInfo = {
  key: string;
  label: string;
  icon: string;
};

type HumanCardData = {
  type: 'human';
  personalityName: string;
  personalityDescription: string;
  personalityImage: string;
  backgroundImage: string;
  backgroundColor: string;
  longDescription: string;
  memberSince?: string;
  topCategories?: CategoryInfo[];
  projectsSupported?: number;
  cardId?: string;
};

type InvitationCardData = {
  type: 'invitation';
};

type PlaceholderCardData = {
  type: 'placeholder';
};

type CardData = AgentCardData | HumanCardData | InvitationCardData | PlaceholderCardData | null;

export default function IdentityCardsCarousel() {
  const { user } = useAuth();
  const { data: seedPassProgress } = useSeedPassProgress(!!user);
  const { data: identitySnapshot } = useIdentitySnapshot(!!user);
  const { data: tierProfile } = useTierProfile(!!user);
  const { agentData } = useAgentSession();
  const searchParams = useSearchParams();
  const hasUnlockedSeedPass = seedPassProgress?.isUnlocked ?? false;

  // Filter state
  const [filter, setFilter] = useState<'all' | 'human' | 'agent'>('all');

  // Saved agents state
  const [savedAgents, setSavedAgents] = useState<any[]>([]);

  const handleFilterChange = (newFilter: 'all' | 'human' | 'agent') => {
    console.log('🎯 Filter changed:', { from: filter, to: newFilter });
    setFilter(newFilter);
  };

  // Fetch saved agents when user is logged in
  useEffect(() => {
    if (user) {
      fetchSavedAgents();
    }
  }, [user]);

  const fetchSavedAgents = async () => {
    try {
      console.log('📥 Fetching saved agents...');
      const response = await fetch('/api/saved-agents');

      if (!response.ok) {
        console.error('Failed to fetch saved agents:', response.status);
        return;
      }

      const result = await response.json();
      const agents = result.data?.agents || result.agents || [];

      console.log('✅ Saved agents loaded:', agents.length);
      setSavedAgents(agents);
    } catch (error) {
      console.error('❌ Error fetching saved agents:', error);
    }
  };

  // Invitation card (always first)
  const invitationCard: CardData = { type: 'invitation' };

  // Placeholder card (comes after saved cards, not before)
  const placeholderCard: CardData = { type: 'placeholder' };

  // Sample agent cards for non-logged-in users (showcase different personality types)
  const sampleAgentCards: AgentCardData[] = [
    {
      type: 'agent',
      personality: 'visionary',
      conviction: 85,
      intuition: 80,
      contribution: 60,
      categories: ['AI Tools', 'DeFi', 'DAOs'],
      memberSince: 'January 2026',
      cardId: 'SAMPLE-001',
    },
    {
      type: 'agent',
      personality: 'explorer',
      conviction: 60,
      intuition: 85,
      contribution: 50,
      categories: ['NFTs', 'Gaming', 'DeFi'],
      memberSince: 'January 2026',
      cardId: 'SAMPLE-002',
    },
    {
      type: 'agent',
      personality: 'cultivator',
      conviction: 70,
      intuition: 70,
      contribution: 90,
      categories: ['Community', 'Education', 'DAOs'],
      memberSince: 'January 2026',
      cardId: 'SAMPLE-003',
    },
    {
      type: 'agent',
      personality: 'optimizer',
      conviction: 90,
      intuition: 60,
      contribution: 65,
      categories: ['Productivity', 'Developer Tools', 'Infrastructure'],
      memberSince: 'January 2026',
      cardId: 'SAMPLE-004',
    },
    {
      type: 'agent',
      personality: 'innovator',
      conviction: 75,
      intuition: 90,
      contribution: 55,
      categories: ['AI', 'Emerging Tech', 'Research'],
      memberSince: 'January 2026',
      cardId: 'SAMPLE-005',
    },
  ];

  // Extract dimension scores from agent identity data (use real data if available)
  const getDimensionScores = (identity: NonNullable<typeof agentData>['identity']) => {
    if (identity.dimensions) {
      return identity.dimensions;
    }
    // Fallback for agents that were created before dimension tracking
    return { conviction: 75, intuition: 75, contribution: 50 };
  };

  // Transform saved agents into AgentCardData format
  const savedAgentCards: AgentCardData[] = savedAgents.map(agent => {
    const personalityKey = agent.identityData?.personalityType?.toLowerCase().replace('the ', '') || 'visionary';

    return {
      type: 'agent',
      personality: personalityKey,
      conviction: agent.identityData?.dimensions?.conviction || 75,
      intuition: agent.identityData?.dimensions?.intuition || 75,
      contribution: agent.identityData?.dimensions?.contribution || 50,
      tasteSpectrums: agent.identityData?.tasteSpectrums,
      categories: agent.identityData?.mainCategories || [],
      memberSince: new Date(agent.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      cardId: `A-${agent.agentUserId?.toString().padStart(6, '0') || '000000'}`,
      dynamicDescription: agent.identityData?.description,
    };
  });

  // Use real Agent data if available, otherwise show no agent cards
  const agentCards: AgentCardData[] = agentData
    ? [
        {
          type: 'agent',
          personality: agentData.identity.personalityType.toLowerCase().replace('the ', ''),
          ...getDimensionScores(agentData.identity),
          tasteSpectrums: agentData.identity.tasteSpectrums,
          categories: agentData.identity.mainCategories,
          memberSince: new Date(agentData.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          cardId: `A-${agentData.address.slice(2, 8)}`,
          dynamicDescription: agentData.identity.description,
        },
      ]
    : [];

  // Build human identity card from saved identity snapshot
  const humanCard: HumanCardData | null = identitySnapshot
    ? (() => {
        const config = getPersonalityConfig(identitySnapshot.personality.name);
        return {
          type: 'human' as const,
          personalityName: identitySnapshot.personality.name,
          personalityDescription: identitySnapshot.personality.description,
          personalityImage: config.imageUrl,
          backgroundImage: config.backgroundImageUrl || '',
          backgroundColor: config.backgroundColor,
          longDescription: config.longDescription,
          memberSince: new Date(identitySnapshot.savedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          topCategories: normalizeCategories(identitySnapshot.topCategories || []),
          projectsSupported: identitySnapshot.projectsSupported,
          cardId: `H-${user?.uid?.toString().padStart(6, '0') || '000000'}`,
        };
      })()
    : null;

  // Build cards array with conditional logic for authenticated vs non-authenticated users
  // Authenticated users (human OR agent): Show their real cards
  // Non-authenticated users: Show sample agent cards as examples
  const displayedAgentCards = (user || agentData)
    ? [...savedAgentCards.slice().reverse(), ...agentCards.slice().reverse()]
    : sampleAgentCards;

  // [Invitation, DisplayedAgentCards, HumanCard (if exists), Placeholder]
  const allCardsData = humanCard
    ? [invitationCard, ...displayedAgentCards, humanCard, placeholderCard]
    : [invitationCard, ...displayedAgentCards, placeholderCard];

  // Filter cards based on selected filter
  const cardsData = allCardsData.filter((card) => {
    if (filter === 'all') return true;
    if (filter === 'human') return card?.type === 'human';
    if (filter === 'agent') return card?.type === 'agent';
    return true;
  });

  // Count cards by type
  const humanCount = allCardsData.filter(card => card?.type === 'human').length;
  const agentCount = allCardsData.filter(card => card?.type === 'agent').length;
  const totalCount = humanCount + agentCount;

  // Debug logging
  useEffect(() => {
    console.log('📊 Card filter state:', {
      filter,
      totalCards: allCardsData.length,
      filteredCards: cardsData.length,
      humanCount,
      agentCount,
      totalCount,
      breakdown: {
        humanCards: allCardsData.filter(c => c?.type === 'human').map(c => c?.type === 'human' ? 'Human Identity (blockchain NFT)' : ''),
        agentCards: allCardsData.filter(c => c?.type === 'agent').map((c, i) =>
          i < savedAgentCards.length ? `Saved Agent #${i+1}` : 'Current Agent'
        ),
      }
    });
  }, [filter, cardsData.length, humanCount, agentCount, totalCount, savedAgentCards.length]);

  const totalCards = cardsData.length;

  // Count real cards (excluding invitation and placeholder)
  const realCardCount = cardsData.filter(card =>
    card !== null && card?.type !== 'invitation' && card?.type !== 'placeholder'
  ).length;

  // Calculate initial index - always show middle card
  const calculateInitialIndex = (cards: CardData[], realCount: number, total: number): number => {
    if (total === 0) {
      return 0;
    }

    // Show the middle card by default for better visual balance
    return Math.floor(total / 2);
  };

  // Start with smart initial position
  const [activeIndex, setActiveIndex] = useState(() =>
    calculateInitialIndex(cardsData, realCardCount, totalCards)
  );

  // Reset active index when filter changes
  useEffect(() => {
    setActiveIndex(calculateInitialIndex(cardsData, realCardCount, totalCards));
  }, [filter, totalCards, realCardCount]);

  // Ensure activeIndex is always within bounds
  const safeActiveIndex = Math.min(Math.max(0, activeIndex), totalCards - 1);

  // Modal state for viewing full card details
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailCardData, setDetailCardData] = useState<any>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [hasAutoOpened, setHasAutoOpened] = useState(false);

  // Email capture modal state
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [pendingViewCardData, setPendingViewCardData] = useState<any>(null);

  const handlePrevious = () => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : totalCards - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev < totalCards - 1 ? prev + 1 : 0));
  };

  // Handle modal close with animation
  const handleCloseModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowDetailModal(false);
      setDetailCardData(null);
      setIsClosing(false);
    }, 200); // Match animation duration
  };

  // Handle email submission for non-logged-in users
  const handleEmailSubmit = async (email: string) => {
    try {
      console.log(`📧 Submitting email: ${email} for card view access`);

      const response = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          // Send user to dashboard after login
          redirectUrl: '/dashboard',
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to send magic link');
      }

      console.log('✅ Magic link sent successfully!');
      // Modal will show success state automatically
    } catch (error) {
      console.error('❌ Email submit error:', error);
      throw error; // Let modal handle error display
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrevious();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auto-navigate to agent card and open modal when agent authenticates
  useEffect(() => {
    // Trigger if we have agentData, came from agent auth flow, and haven't auto-opened yet
    if (agentData && (searchParams.has('from') || searchParams.has('token')) && !hasAutoOpened) {
      console.log('🤖 Agent authenticated, auto-navigating to agent card...');

      // Find the agent card index in cardsData
      const agentCardIndex = cardsData.findIndex(card => card?.type === 'agent');

      if (agentCardIndex !== -1) {
        // Navigate to the agent card
        setActiveIndex(agentCardIndex);

        // Mark as auto-opened to prevent repeated triggers
        setHasAutoOpened(true);

        // Auto-open the detail modal after a short delay (to allow carousel animation)
        setTimeout(() => {
          const agentCard = cardsData[agentCardIndex];
          if (agentCard && agentCard.type === 'agent') {
            setDetailCardData(agentCard);
            setShowDetailModal(true);
            console.log('✅ Agent card detail modal opened');
          }
        }, 400); // 400ms to match carousel transition duration
      }
    }
  }, [agentData, searchParams, cardsData, hasAutoOpened]);

  return (
    <div className="w-full">
      {/* Header - Outside the rounded container */}
      <div className="mb-6">
        <h2 className="font-serif font-bold text-3xl text-[#1e1b4b] tracking-[-0.48px] mb-2">
          My Collection
        </h2>
        <p className="font-['Outfit'] text-sm text-[#6b7280]">
          {hasUnlockedSeedPass
            ? 'Supporter identity cards for you and your agents'
            : 'Supporter identity cards for humans and agents'}
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => handleFilterChange('all')}
          className={`
            px-4 py-2.5 rounded-[100px] font-sans text-[13px] transition-all duration-200 ease-in-out border
            ${filter === 'all'
              ? 'bg-[rgba(140,110,200,0.1)] text-[rgba(100,70,160,0.9)] font-medium border-[rgba(140,110,200,0.2)]'
              : 'bg-transparent text-[rgba(80,60,120,0.5)] border-[rgba(150,130,200,0.12)] hover:bg-[rgba(140,110,200,0.05)]'
            }
          `}
        >
          All <span className={filter === 'all' ? 'opacity-80' : 'opacity-70'}>({totalCount})</span>
        </button>
        <button
          onClick={() => handleFilterChange('human')}
          className={`
            px-4 py-2.5 rounded-[100px] font-sans text-[13px] transition-all duration-200 ease-in-out border
            ${filter === 'human'
              ? 'bg-[rgba(140,110,200,0.1)] text-[rgba(100,70,160,0.9)] font-medium border-[rgba(140,110,200,0.2)]'
              : 'bg-transparent text-[rgba(80,60,120,0.5)] border-[rgba(150,130,200,0.12)] hover:bg-[rgba(140,110,200,0.05)]'
            }
          `}
        >
          By You <span className={filter === 'human' ? 'opacity-80' : 'opacity-70'}>({humanCount})</span>
        </button>
        <button
          onClick={() => handleFilterChange('agent')}
          className={`
            px-4 py-2.5 rounded-[100px] font-sans text-[13px] transition-all duration-200 ease-in-out border
            ${filter === 'agent'
              ? 'bg-[rgba(140,110,200,0.1)] text-[rgba(100,70,160,0.9)] font-medium border-[rgba(140,110,200,0.2)]'
              : 'bg-transparent text-[rgba(80,60,120,0.5)] border-[rgba(150,130,200,0.12)] hover:bg-[rgba(140,110,200,0.05)]'
            }
          `}
        >
          By Agents <span className={filter === 'agent' ? 'opacity-80' : 'opacity-70'}>({agentCount})</span>
        </button>
      </div>

      {/* Carousel Container with atmospheric background - rounded corners */}
      <div className="relative mb-8 rounded-[20px] overflow-hidden">
        {/* Atmospheric background layer - contained within carousel */}
        <div className="absolute -inset-8 pointer-events-none">
          {/* Radial gradient */}
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse 900px 700px at center, rgba(140,120,200,0.12) 0%, rgba(120,100,180,0.06) 35%, rgba(100,80,160,0.02) 60%, transparent 85%)',
            }}
          />

          {/* Decorative blur circles (bokeh effect) */}
          <div
            className="absolute top-10 left-20"
            style={{
              width: '300px',
              height: '300px',
              background: 'rgba(160,130,220,0.08)',
              filter: 'blur(100px)',
              borderRadius: '50%',
            }}
          />
          <div
            className="absolute bottom-20 right-10"
            style={{
              width: '250px',
              height: '250px',
              background: 'rgba(100,180,200,0.06)',
              filter: 'blur(80px)',
              borderRadius: '50%',
            }}
          />

          {/* Subtle grain texture */}
          <div
            className="absolute inset-0 opacity-[0.05] mix-blend-overlay"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            }}
          />
        </div>

        {/* 3D Cover Flow Carousel */}
        <div className={`relative h-[480px] desktop:h-[550px] z-10 ${styles.carouselContainer}`}>
          {/* Navigation Arrows - Positioned on sides, vertically centered */}
          <button
            onClick={handlePrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-40 w-10 h-10 rounded-[50%] bg-white border border-[rgba(150,130,200,0.1)] flex items-center justify-center hover:bg-[rgba(245,242,255,1)] transition-all duration-200 ease-in-out shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
            aria-label="Previous card"
          >
            <span className="text-[rgba(80,60,120,0.5)] hover:text-[rgba(80,60,120,0.8)] text-xl font-light transition-colors">‹</span>
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-40 w-10 h-10 rounded-[50%] bg-white border border-[rgba(150,130,200,0.1)] flex items-center justify-center hover:bg-[rgba(245,242,255,1)] transition-all duration-200 ease-in-out shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
            aria-label="Next card"
          >
            <span className="text-[rgba(80,60,120,0.5)] hover:text-[rgba(80,60,120,0.8)] text-xl font-light transition-colors">›</span>
          </button>

          <div className="absolute inset-0 flex items-center justify-center">
            {/* Render all cards with 3D transforms */}
            {cardsData.map((cardData, index) => {
              const position = index - safeActiveIndex;
              const isActive = position === 0;
              const isFar = Math.abs(position) > 2;

              // Calculate transforms - cards are scaled for better visibility
              // Base scale for all cards
              const baseScale = 0.75; // All cards scaled to 75% of original size for better visibility
              let transform = '';
              let zIndex = 0;
              let opacity = 0;

              if (position === 0) {
                // Center card (active) - slightly bigger, facing front
                transform = `translateX(0%) scale(${baseScale * 1.15}) rotateY(0deg)`;
                zIndex = 30;
                opacity = 1;
              } else if (position === -1) {
                // Left card - rotated to face center
                transform = `translateX(-85%) scale(${baseScale * 0.85}) rotateY(55deg)`;
                zIndex = 20;
                opacity = 0.7;
              } else if (position === 1) {
                // Right card - rotated to face center
                transform = `translateX(85%) scale(${baseScale * 0.85}) rotateY(-55deg)`;
                zIndex = 20;
                opacity = 0.7;
              } else if (position === -2) {
                // Far left - more angled
                transform = `translateX(-150%) scale(${baseScale * 0.7}) rotateY(65deg)`;
                zIndex = 10;
                opacity = 0.4;
              } else if (position === 2) {
                // Far right - more angled
                transform = `translateX(150%) scale(${baseScale * 0.7}) rotateY(-65deg)`;
                zIndex = 10;
                opacity = 0.4;
              } else {
                // Hidden
                transform = position < 0
                  ? `translateX(-200%) scale(${baseScale * 0.5}) rotateY(70deg)`
                  : `translateX(200%) scale(${baseScale * 0.5}) rotateY(-70deg)`;
                zIndex = 0;
                opacity = 0;
              }

              // Both agent and human cards can be viewed in detail modal
              const canViewDetails = cardData && (cardData.type === 'agent' || cardData.type === 'human');

              return (
                <div
                  key={index}
                  className={`absolute w-full max-w-[372px] transition-transform duration-300 ${styles.carouselCard}`}
                  data-active={isActive}
                  data-far={isFar}
                  style={{
                    transform,
                    zIndex,
                    opacity,
                    cursor: isActive && canViewDetails ? 'zoom-in' : 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    if (isActive && canViewDetails) {
                      e.currentTarget.style.transform = `${transform} scale(1.03)`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (isActive && canViewDetails) {
                      e.currentTarget.style.transform = transform;
                    }
                  }}
                  onClick={() => {
                    if (isActive && canViewDetails) {
                      // If clicking the active agent card, check authentication status
                      if (!user && !agentData) {
                        // Show email capture modal for non-authenticated users
                        console.log('🔓 User not authenticated, showing email capture modal');
                        setPendingViewCardData(cardData);
                        setShowEmailModal(true);
                      } else {
                        // Show full card detail modal for authenticated users (human or agent)
                        setDetailCardData(cardData);
                        setShowDetailModal(true);
                      }
                    } else {
                      // Otherwise, make this card active
                      setActiveIndex(index);
                    }
                  }}
                >
                  {cardData.type === 'invitation' ? (
                    // Invitation Card for new users
                    <InvitationCard />
                  ) : cardData.type === 'placeholder' ? (
                    // Placeholder Card for future content
                    <PlaceholderCard />
                  ) : cardData.type === 'human' ? (
                    // Human Identity Card Preview
                    <HumanIdentityCardPreview
                      personalityName={cardData.personalityName}
                      personalityDescription={cardData.personalityDescription}
                      personalityImage={cardData.personalityImage}
                      backgroundImage={cardData.backgroundImage}
                      backgroundColor={cardData.backgroundColor}
                      longDescription={cardData.longDescription}
                      memberSince={cardData.memberSince}
                    />
                  ) : cardData.type === 'agent' ? (
                    // Agent Identity Card Preview (simplified for carousel)
                    <AgentIdentityCardPreview
                      personality={AGENT_PERSONALITIES[cardData.personality]}
                      conviction={cardData.conviction}
                      intuition={cardData.intuition}
                      contribution={cardData.contribution}
                      memberSince={cardData.memberSince}
                    />
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        {/* Card Position Indicators */}
        <div className="relative z-10 flex items-center justify-center gap-2 mt-6">
          {[...Array(totalCards)].map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`h-2 rounded-full transition-all ${
                index === safeActiveIndex
                  ? 'w-8 bg-purple-600'
                  : 'w-2 bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to card ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Card Details Section - Outside rounded container */}
      <div className="bg-white/50 backdrop-blur-sm rounded-[16px] p-6 border border-white/60">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg text-gray-800">
            {!cardsData[safeActiveIndex]
              ? 'Your Supporter Identity'
              : cardsData[safeActiveIndex].type === 'invitation'
              ? 'Welcome to Bloom'
              : cardsData[safeActiveIndex].type === 'placeholder'
              ? 'Coming Soon'
              : cardsData[safeActiveIndex].type === 'human'
              ? cardsData[safeActiveIndex].personalityName
              : cardsData[safeActiveIndex].type === 'agent'
              ? `${AGENT_PERSONALITIES[cardsData[safeActiveIndex].personality].name} Identity${!user && !agentData ? ' (Example)' : ''}`
              : 'Identity Card'}
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => {
                const cardData = cardsData[safeActiveIndex];
                if (!cardData || cardData.type === 'invitation' || cardData.type === 'placeholder') return;

                if (cardData.type === 'human') {
                  // Share human card to X
                  const categoriesStr = cardData.topCategories
                    ?.map(cat => `${cat.icon || ''}${cat.label}`)
                    .join(',') || '';

                  const params = new URLSearchParams({
                    tier: tierProfile?.tier || 'Seed',
                    personality: cardData.personalityName,
                    description: cardData.personalityDescription,
                  });
                  if (categoriesStr) params.set('categories', categoriesStr);
                  if (cardData.memberSince) params.set('since', cardData.memberSince);
                  // Add timestamp to bypass Twitter OG image cache
                  params.set('t', Date.now().toString());

                  // Use current environment's base URL (preflight or production)
                  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin;
                  const shareUrl = `${baseUrl}/share/identity?${params.toString()}`;
                  const text = `Check out my Bloom Identity: ${cardData.personalityName}!`;
                  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
                  window.open(twitterUrl, '_blank');
                } else if (cardData.type === 'agent') {
                  // Share agent card to X (add timestamp to bypass Twitter cache)
                  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin;
                  const shareUrl = `${baseUrl}/agent/${cardData.cardId}?t=${Date.now()}`;
                  const personalityName = AGENT_PERSONALITIES[cardData.personality]?.name || 'Agent';
                  const text = `Check out my Bloom Agent Identity: ${personalityName}!`;
                  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
                  window.open(twitterUrl, '_blank');
                }
              }}
              disabled={!cardsData[safeActiveIndex] || cardsData[safeActiveIndex]?.type === 'invitation' || cardsData[safeActiveIndex]?.type === 'placeholder'}
              className="px-4 py-2 rounded-[100px] bg-white border border-[rgba(150,130,200,0.2)] text-[rgba(100,70,160,0.6)] font-medium text-sm hover:bg-[rgba(140,110,200,0.05)] transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Share Card
            </button>
            {cardsData[safeActiveIndex] && (cardsData[safeActiveIndex]?.type === 'agent' || cardsData[safeActiveIndex]?.type === 'human') && (
              <button
                onClick={() => {
                  const cardData = cardsData[safeActiveIndex];
                  if (cardData) {
                    // Check if user is authenticated (human or agent)
                    if (!user && !agentData) {
                      // Show email capture modal for non-authenticated users
                      console.log('🔓 User not authenticated, showing email capture modal');
                      setPendingViewCardData(cardData);
                      setShowEmailModal(true);
                    } else {
                      // Show full card detail modal for authenticated users (human or agent)
                      setDetailCardData(cardData);
                      setShowDetailModal(true);
                    }
                  }
                }}
                className="px-4 py-2 rounded-[100px] bg-[rgba(120,90,180,0.85)] text-white font-medium text-sm hover:bg-[rgba(120,90,180,1)] transition-all duration-200 ease-in-out"
              >
                View Full Card
              </button>
            )}
          </div>
        </div>
        <p className="text-sm text-gray-600">
          {!cardsData[safeActiveIndex]
            ? 'Your unique identity as a Bloom supporter, reflecting your journey and contributions to the ecosystem.'
            : cardsData[safeActiveIndex].type === 'invitation'
            ? 'Start your journey with Bloom Protocol. Bring your vision or your agent — the stage is set for every idea to find its bloom.'
            : cardsData[safeActiveIndex].type === 'placeholder'
            ? 'More exciting cards are coming soon. Stay tuned for new ways to showcase your identity and achievements in the Bloom ecosystem.'
            : cardsData[safeActiveIndex].type === 'human'
            ? cardsData[safeActiveIndex].personalityDescription || 'Your personalized Bloom identity card showcasing your supporter journey and contributions.'
            : !user && !agentData && cardsData[safeActiveIndex].type === 'agent'
            ? 'Example agent identity card showcasing different personality types. Sign in to create your own personalized card with AI-powered skill recommendations.'
            : 'Agent-generated identity card showcasing personality dimensions and contribution patterns via OpenClaw.'}
        </p>
      </div>

      {/* Email Capture Modal */}
      {showEmailModal && pendingViewCardData && (
        <EmailCaptureModal
          isOpen={showEmailModal}
          onClose={() => {
            setShowEmailModal(false);
            setPendingViewCardData(null);
          }}
          onSubmit={handleEmailSubmit}
          personalityType={
            pendingViewCardData.type === 'human'
              ? pendingViewCardData.personalityName
              : pendingViewCardData.type === 'agent'
              ? AGENT_PERSONALITIES[pendingViewCardData.personality]?.name || 'Agent'
              : 'Identity'
          }
          agentUserId={pendingViewCardData.cardId || 'unknown'}
        />
      )}

      {/* Detail Modal */}
      {showDetailModal && detailCardData && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-opacity duration-200 ${
            isClosing ? 'opacity-0' : 'opacity-100'
          }`}
          onClick={handleCloseModal}
        >
          <div
            className={`relative max-w-[420px] w-full transition-all duration-200 ${
              isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
            }`}
          >
            {/* Close button - positioned near top-right of card */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCloseModal();
              }}
              className="absolute -top-3 -right-3 z-[60] w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 hover:scale-110 transition-all shadow-lg pointer-events-auto cursor-pointer"
              aria-label="Close"
            >
              <span className="text-gray-600 text-2xl leading-none pointer-events-none">×</span>
            </button>
            {/* Full card - Agent or Human */}
            <div onClick={(e) => e.stopPropagation()}>
            {detailCardData.type === 'agent' ? (
              <AgentIdentityCard
                personality={AGENT_PERSONALITIES[detailCardData.personality]}
                conviction={detailCardData.conviction}
                intuition={detailCardData.intuition}
                contribution={detailCardData.contribution}
                tasteSpectrums={detailCardData.tasteSpectrums}
                categories={detailCardData.categories}
                memberSince={detailCardData.memberSince}
                cardId={detailCardData.cardId}
                dynamicDescription={detailCardData.dynamicDescription}
              />
            ) : (
              <IdentityCard
                personalityName={detailCardData.personalityName}
                personalityDescription={detailCardData.personalityDescription}
                personalityImage={detailCardData.personalityImage}
                backgroundImage={detailCardData.backgroundImage}
                topCategories={detailCardData.topCategories || []}
                backgroundColor={detailCardData.backgroundColor}
                longDescription={detailCardData.longDescription}
                memberSince={detailCardData.memberSince}
                projectsSupported={detailCardData.projectsSupported}
                cardId={detailCardData.cardId}
              />
            )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
