'use client';

/**
 * Agent Dashboard Content - Option B (Public View)
 *
 * Public dashboard that anyone can view without authentication.
 * Features:
 * - Auto-opens modal with full card details on first visit
 * - Users can close modal to see card in carousel
 * - Save to Collection button (requires login)
 * - Share on X button
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AgentIdentityCard from '@/app/(protected)/dashboard/components/agent-identity-card';
import AgentIdentityCardPreview from '@/app/(protected)/dashboard/components/agent-identity-card-preview';
import { AGENT_PERSONALITIES } from '@/app/(protected)/dashboard/config/agent-personalities';
import EmailCaptureModal from '@/components/auth/EmailCaptureModal';
import { getCookie, COOKIE_KEYS } from '@/lib/utils/storage/cookieService';
import AgentRecommendationCard from './AgentRecommendationCard';

interface AgentIdentity {
  agentUserId: number;
  personalityType: string;
  tagline: string;
  description: string;
  mainCategories: string[];
  subCategories: string[];
  dimensions: {
    conviction: number;
    intuition: number;
    contribution: number;
  };
  tasteSpectrums?: {
    learning: number;
    decision: number;
    novelty: number;
    risk: number;
  };
  strengths?: string[];
  recommendations: Array<{
    skillName: string;
    skillId?: string;
    matchScore: number;
    description: string;
    url: string;
    creator?: string;
    source?: 'ClaudeCode' | 'ClawHub' | 'GitHub';
    categoryGroup?: string;
    stars?: number;
    downloads?: number;
    language?: string;
    reason?: string;
  }>;
  walletAddress: string;
  network: string;
  confidence: number;
  mode: string;
  createdAt: string;
  recommendationsUpdatedAt?: string;
}

function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks === 1) return '1 week ago';
  if (diffWeeks < 4) return `${diffWeeks} weeks ago`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths === 1) return '1 month ago';
  return `${diffMonths} months ago`;
}

interface AgentDashboardContentProps {
  agentUserId: string;
}

export default function AgentDashboardContent({ agentUserId }: AgentDashboardContentProps) {
  const router = useRouter();
  const [agentData, setAgentData] = useState<AgentIdentity | null>(null);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string>('');
  const [isSaved, setIsSaved] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [saveError, setSaveError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('');

  // Modal state for auto-open behavior
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [hasAutoOpened, setHasAutoOpened] = useState(false);

  // Email capture modal state
  const [showEmailModal, setShowEmailModal] = useState(false);


  // Discoveries state ("New for You")
  const [discoveries, setDiscoveries] = useState<Array<{
    skillId: string;
    skillName: string;
    matchScore: number;
    categories: string[];
    url: string;
    source: string;
    discoveredAt: string;
  }>>([]);
  const [lastDiscoveryAt, setLastDiscoveryAt] = useState<string | null>(null);

  useEffect(() => {
    fetchAgentData();
    fetchDiscoveries();
    checkAuthStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentUserId]);

  // Handle intent=save URL parameter:
  // - Logged in → auto-save card to collection
  // - Not logged in → auto-open email capture modal (conversion funnel)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const intent = urlParams.get('intent');
    if (intent !== 'save' || !agentData) return;

    if (isLoggedIn && !isSaved) {
      console.log('🔄 Auto-saving card after registration...');
      handleSaveToCollection();
      // Clean up URL by removing intent parameter
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('intent');
      window.history.replaceState({}, '', newUrl.toString());
    } else if (!isLoggedIn) {
      // Auto-open email capture for conversion
      console.log('📧 intent=save detected, opening email capture modal');
      setShowEmailModal(true);
    }
  }, [isLoggedIn, agentData, isSaved]);

  const fetchAgentData = async () => {
    try {
      setStatus('loading');
      setError('');

      console.log(`📊 Fetching public agent data for: ${agentUserId}`);

      // Call public API (no authentication required!)
      const response = await fetch(`/api/x402/agent/${agentUserId}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Agent identity card not found');
        }
        throw new Error('Failed to load agent data');
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to load agent data');
      }

      console.log('✅ Agent data loaded:', result.data);

      // Transform backend data structure to match component expectations
      // Backend: { identityData: { personalityType, ... }, ... }
      // Frontend expects: { personalityType, ... } (flattened)
      const transformedData: AgentIdentity = {
        agentUserId: result.data.agentUserId,
        personalityType: result.data.identityData.personalityType,
        tagline: result.data.identityData.tagline,
        description: result.data.identityData.description,
        mainCategories: result.data.identityData.mainCategories,
        subCategories: result.data.identityData.subCategories,
        dimensions: result.data.identityData.dimensions,
        tasteSpectrums: result.data.identityData.tasteSpectrums,
        strengths: result.data.identityData.strengths,
        recommendations: result.data.identityData.recommendations || [],
        walletAddress: result.data.walletAddress,
        network: result.data.network,
        confidence: result.data.identityData.confidence,
        mode: result.data.identityData.mode,
        createdAt: result.data.createdAt,
        recommendationsUpdatedAt: result.data.recommendationsUpdatedAt || result.data.createdAt,
      };

      setAgentData(transformedData);

      // Auto-select first category that has recommendations
      const recs = transformedData.recommendations || [];
      const categoriesWithSkills = (transformedData.mainCategories || []).filter(
        (cat: string) => recs.some((r: any) => r.categoryGroup === cat)
      );
      setActiveTab(categoriesWithSkills[0] || '');

      setStatus('success');
    } catch (err) {
      console.error('❌ Failed to fetch agent data:', err);
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to load agent identity');
    }
  };

  const fetchDiscoveries = async () => {
    try {
      const response = await fetch(`/api/x402/agent/${agentUserId}/discoveries`);
      if (!response.ok) return;
      const result = await response.json();
      if (result.success && result.data) {
        setDiscoveries(result.data.discoveries || []);
        setLastDiscoveryAt(result.data.lastDiscoveryAt || null);
      }
    } catch (err) {
      // Non-critical — discoveries are optional
      console.debug('Failed to fetch discoveries:', err);
    }
  };

  const checkAuthStatus = async () => {
    try {
      // Check auth cookies directly (matching AuthContext's cookie-based auth)
      const token = getCookie(COOKIE_KEYS.AUTH_TOKEN);
      const uid = getCookie(COOKIE_KEYS.SUB);

      if (token && uid) {
        console.log('✅ User authenticated via cookies (uid:', uid, ')');
        setIsLoggedIn(true);

        // Check if this agent is already saved
        await checkIfAlreadySaved();
      } else {
        setIsLoggedIn(false);
        setIsSaved(false);
      }
    } catch (err) {
      setIsLoggedIn(false);
      setIsSaved(false);
    }
  };

  const checkIfAlreadySaved = async () => {
    try {
      const response = await fetch('/api/saved-agents');
      if (response.ok) {
        const result = await response.json();
        const savedAgents = result.data?.agents || result.agents || [];
        const isAlreadySaved = savedAgents.some(
          (agent: any) => agent.agentUserId === parseInt(agentUserId)
        );
        setIsSaved(isAlreadySaved);

        if (isAlreadySaved) {
          console.log('✅ Agent already saved in collection');
        }
      }
    } catch (err) {
      console.error('Failed to check if agent is saved:', err);
    }
  };

  const handleSaveToCollection = async () => {
    console.log('🔍 handleSaveToCollection called, isLoggedIn:', isLoggedIn);

    // ALWAYS show email capture modal for non-logged-in users
    // This is the primary conversion path
    if (!isLoggedIn) {
      console.log('🔓 User not logged in, showing email capture modal');
      setShowEmailModal(true);
      return;
    }

    // For logged-in users, save directly
    console.log('✅ User is logged in, proceeding with save');

    // Set loading state
    setSaveStatus('saving');
    setSaveError('');

    try {
      const response = await fetch('/api/saved-agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentUserId: parseInt(agentUserId) }),
      });

      const result = await response.json();

      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 401) {
          throw new Error('Please log in again to save this card');
        } else if (response.status === 409) {
          // Already saved
          setIsSaved(true);
          setSaveStatus('success');
          console.log('ℹ️ Card was already saved');
          return;
        } else {
          throw new Error(result.message || 'Failed to save to collection');
        }
      }

      setIsSaved(true);
      setSaveStatus('success');
      console.log('✅ Saved to collection successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save to collection. Please try again.';
      console.error('❌ Failed to save:', err);
      setSaveStatus('error');
      setSaveError(errorMessage);
    }
  };

  const handleEmailSubmit = async (email: string) => {
    try {
      console.log(`📧 Submitting email: ${email} for agentUserId: ${agentUserId}`);

      const response = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          agentUserId,
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

  const handleShareOnX = () => {
    if (!agentData) return;

    // Personality short taglines
    const personalityTaglines: Record<string, string> = {
      'The Visionary': 'First to back what\'s next',
      'The Explorer': 'Discovers new frontiers',
      'The Cultivator': 'Builds lasting communities',
      'The Optimizer': 'Refines what works',
      'The Innovator': 'Pushes boundaries',
    };

    const tagline = personalityTaglines[agentData.personalityType] || 'Discovers crypto identity';

    const shareText = `Just discovered my Bloom Identity: ${agentData.personalityType}

${tagline}

Check out my personalized skill recommendations on @bloom__protocol`;
    // Add timestamp to bypass Twitter OG image cache
    const shareUrl = `${window.location.href.split('?')[0]}?t=${Date.now()}`;

    const twitterUrl = `https://twitter.com/intent/tweet?${new URLSearchParams({
      text: shareText,
      url: shareUrl,
    })}`;

    window.open(twitterUrl, '_blank', 'width=550,height=420');
  };


  // Auto-open modal on first load
  useEffect(() => {
    if (agentData && !hasAutoOpened && status === 'success') {
      // Auto-open the detail modal after a short delay
      setTimeout(() => {
        setShowDetailModal(true);
        setHasAutoOpened(true);
        console.log('✅ Auto-opened agent card detail modal');
      }, 300);
    }
  }, [agentData, hasAutoOpened, status]);

  // Handle modal close with animation
  const handleCloseModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowDetailModal(false);
      setIsClosing(false);
    }, 200); // Match animation duration
  };

  // Get personality config
  const getPersonalityKey = (personalityType: string): string => {
    // Convert "The Visionary" to "visionary"
    return personalityType.toLowerCase().replace('the ', '');
  };

  // Loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Loading Agent Identity...</h1>
            <p className="text-gray-600">Please wait</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 mx-auto rounded-full bg-red-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Agent</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Success state - show agent identity card
  if (!agentData) return null;

  const personalityKey = getPersonalityKey(agentData.personalityType);
  const personalityConfig = AGENT_PERSONALITIES[personalityKey];

  if (!personalityConfig) {
    console.error('Unknown personality type:', agentData.personalityType);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Invalid personality type</p>
      </div>
    );
  }

  const cardData = {
    personality: personalityKey,
    conviction: agentData.dimensions?.conviction || 75,
    intuition: agentData.dimensions?.intuition || 75,
    contribution: agentData.dimensions?.contribution || 50,
    tasteSpectrums: agentData.tasteSpectrums,
    categories: agentData.mainCategories,
    memberSince: new Date(agentData.createdAt).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    }),
    cardId: `A-${agentData.agentUserId.toString().padStart(6, '0')}`,
    dynamicDescription: agentData.description,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Success Banner - Show when card is saved */}
        {saveStatus === 'success' && isSaved && (
          <div className="mb-6 bg-white/80 backdrop-blur-sm border border-purple-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {isLoggedIn ? 'Card saved to your collection!' : 'Check your email! 📧'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {isLoggedIn
                      ? 'You can view it anytime in your dashboard'
                      : 'We sent you a magic link to access your personalized dashboard'}
                  </p>
                </div>
              </div>
              {isLoggedIn && (
                <button
                  onClick={() => window.location.href = '/my-agent'}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium text-sm hover:bg-purple-700 transition-colors whitespace-nowrap"
                >
                  View Dashboard →
                </button>
              )}
            </div>
          </div>
        )}

        {/* Error Banner - Show when save fails */}
        {saveStatus === 'error' && saveError && (
          <div className="mb-6 bg-white/80 backdrop-blur-sm border border-red-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Failed to save card</p>
                  <p className="text-sm text-gray-600">{saveError}</p>
                </div>
              </div>
              <button
                onClick={handleSaveToCollection}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium text-sm hover:bg-red-700 transition-colors whitespace-nowrap"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mb-6 flex gap-3 justify-end">
          <button
            onClick={handleShareOnX}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            Share on X
          </button>
          <button
            onClick={() => {
              if (isSaved) {
                // If saved, navigate to dashboard
                if (isLoggedIn) {
                  // Use hard redirect to ensure AuthContext re-checks cookies
                  window.location.href = '/my-agent';
                } else {
                  // If not logged in, redirect to login with return to dashboard
                  router.push(`/login?return=${encodeURIComponent('/my-agent')}`);
                }
              } else {
                // If not saved, trigger save
                handleSaveToCollection();
              }
            }}
            disabled={saveStatus === 'saving'}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isSaved
                ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                : saveStatus === 'saving'
                ? 'bg-purple-400 text-white cursor-wait'
                : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}
          >
            {saveStatus === 'saving' ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : isSaved ? (
              <>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Saved ✓
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                  />
                </svg>
                Save My Card
              </>
            )}
          </button>
        </div>

        {/* Agent Identity Card Preview in Carousel Style */}
        <div className="relative mb-8 rounded-[20px] overflow-hidden">
          {/* Atmospheric background */}
          <div className="absolute -inset-8 pointer-events-none">
            <div
              className="absolute inset-0"
              style={{
                background: 'radial-gradient(ellipse 900px 700px at center, rgba(140,120,200,0.12) 0%, rgba(120,100,180,0.06) 35%, rgba(100,80,160,0.02) 60%, transparent 85%)',
              }}
            />
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
          </div>

          {/* Card Container */}
          <div className="relative h-[480px] desktop:h-[550px] z-10 flex items-center justify-center">
            <div
              className="w-full max-w-[372px] cursor-pointer transition-transform duration-300 hover:scale-105"
              onClick={() => setShowDetailModal(true)}
            >
              <AgentIdentityCardPreview
                personality={personalityConfig}
                conviction={cardData.conviction}
                intuition={cardData.intuition}
                contribution={cardData.contribution}
                memberSince={cardData.memberSince}
              />
            </div>
          </div>
        </div>

        {/* Card Details Section */}
        <div className="bg-white/50 backdrop-blur-sm rounded-[16px] p-6 border border-white/60">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg text-gray-800">
              {personalityConfig.name} Identity
            </h3>
            <button
              onClick={() => setShowDetailModal(true)}
              className="px-4 py-2 rounded-[100px] bg-[rgba(120,90,180,0.85)] text-white font-medium text-sm hover:bg-[rgba(120,90,180,1)] transition-all duration-200 ease-in-out"
            >
              View Full Card
            </button>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            {agentData.description}
          </p>
          <div className="flex flex-wrap gap-2">
            {agentData.mainCategories.map((category, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium"
              >
                {category}
              </span>
            ))}
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">About This Card</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-600">Created:</dt>
              <dd className="text-gray-900">{new Date(agentData.createdAt).toLocaleDateString()}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Analysis Mode:</dt>
              <dd className="text-gray-900">{agentData.mode === 'data' ? 'Data-driven' : 'Manual Q&A'}</dd>
            </div>
          </dl>
        </div>

        {/* Agent Wallet — hidden until Coinbase Agentic Wallet integration is restored */}

        {/* New for You — Autonomous Discoveries */}
        {discoveries.length > 0 && (
          <div className="bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 rounded-xl p-5 mt-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-teal-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                New for You
              </h3>
              {lastDiscoveryAt && (
                <span className="text-xs text-teal-600">
                  Updated {formatRelativeTime(lastDiscoveryAt)}
                </span>
              )}
            </div>
            <div className="space-y-2">
              {discoveries.slice(0, 5).map((d, i) => (
                <div
                  key={`${d.skillId}-${i}`}
                  className="flex items-center justify-between gap-3 p-3 bg-white/70 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-gray-900 text-sm">{d.skillName}</span>
                      <span className="inline-flex items-center px-2 py-0.5 bg-teal-100 text-teal-700 text-xs rounded-full font-medium">
                        {d.matchScore}% match
                      </span>
                      {d.source && (
                        <span className={`inline-flex items-center px-2 py-0.5 text-xs rounded-full font-medium ${
                          d.source === 'ClawHub' ? 'bg-teal-600 text-white' :
                          d.source === 'ClaudeCode' ? 'bg-orange-500 text-white' :
                          'bg-gray-700 text-white'
                        }`}>
                          {d.source === 'ClaudeCode' ? 'Claude Code' : d.source}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Discovered {formatRelativeTime(d.discoveredAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <a
                      href={d.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-teal-600 text-white text-xs rounded-lg hover:bg-teal-700 transition-colors whitespace-nowrap"
                    >
                      View
                    </a>
                  </div>
                </div>
              ))}
            </div>
            {discoveries.length > 5 && (
              <p className="text-xs text-teal-600 mt-2 text-center">
                +{discoveries.length - 5} more discoveries
              </p>
            )}
          </div>
        )}

        {/* Detected Strengths */}
        {agentData.strengths && agentData.strengths.length > 0 && (
          <div className="mb-6 bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-purple-100 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <span className="text-lg">Strengths</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {agentData.strengths.map((strength, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-full bg-purple-50 text-purple-700 text-sm font-medium border border-purple-100"
                >
                  {strength}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Skill Recommendations - Category-Based Tabs */}
        {agentData.recommendations && agentData.recommendations.length > 0 && (() => {
          // Build category tabs from mainCategories, only showing those with skills
          const categoryTabs = (agentData.mainCategories || []).filter(
            (cat) => agentData.recommendations.some((r: any) => r.categoryGroup === cat)
          );

          if (categoryTabs.length === 0) return null;

          // Get skills for the active tab
          const activeSkills = agentData.recommendations.filter(
            (r: any) => r.categoryGroup === activeTab
          );

          return (
            <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
              {/* Category Tab Header */}
              <div className="flex items-center gap-2 mb-1 border-b border-gray-200 overflow-x-auto">
                {categoryTabs.map((category) => {
                  const count = agentData.recommendations.filter(
                    (r: any) => r.categoryGroup === category
                  ).length;
                  return (
                    <button
                      key={category}
                      onClick={() => setActiveTab(category)}
                      className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 -mb-px whitespace-nowrap ${
                        activeTab === category
                          ? 'border-teal-600 text-teal-700'
                          : 'border-transparent text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <span>{category}</span>
                      <span className={`ml-1 px-2 py-0.5 text-xs rounded-full ${
                        activeTab === category
                          ? 'bg-teal-100 text-teal-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
              {agentData.recommendationsUpdatedAt && (
                <p className="text-xs text-gray-400 mt-1 mb-1">
                  Last updated {formatRelativeTime(agentData.recommendationsUpdatedAt)}
                </p>
              )}
              <p className="text-xs text-gray-400 mb-4">
                These are community-submitted skills. Always review a skill&apos;s source code with your agent before installing.
              </p>

              {/* Tab Content — Skills for active category */}
              {activeSkills.length === 0 && (
                <p className="text-sm text-gray-500 py-4 text-center">
                  No recommendations found for this category yet.
                </p>
              )}
              {activeSkills.length > 0 && (
                <div className="space-y-3">
                  {activeSkills.map((rec, index) => (
                    <AgentRecommendationCard
                      key={index}
                      recommendation={rec}
                    />
                  ))}
                </div>
              )}

              {/* Explore CTA */}
              <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col items-center gap-2">
                <a
                  href="/skills"
                  className="inline-flex items-center gap-1.5 font-['Outfit'] font-semibold text-sm text-[#7c3aed] hover:underline"
                >
                  Explore all skills
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
                <p className="font-['Outfit'] text-xs text-[#9ca3af]">
                  Browse the full skill catalog
                </p>
              </div>
            </div>
          );
        })()}

        {/* Viral loop — Get your own identity */}
        <div className="w-full max-w-md mx-auto mt-8 rounded-2xl p-6 text-center" style={{
          background: 'linear-gradient(180deg, rgba(196,164,108,0.08) 0%, rgba(196,164,108,0.02) 100%)',
          border: '1px solid rgba(196,164,108,0.2)',
        }}>
          <p className="font-serif text-lg font-bold text-[#393f49] mb-1">
            Want your own Bloom Identity?
          </p>
          <p className="font-['Outfit'] text-sm text-[#696f8c] mb-4">
            Discover your agent personality and get personalized skill recommendations.
          </p>
          <code className="block bg-[#1a1228] text-[#c4a46c] text-xs px-4 py-2.5 rounded-lg font-mono mb-3 select-all">
            clawhub install bloom-discovery
          </code>
          <p className="font-['Outfit'] text-[11px] text-[#b0b5c0]">
            Run in Claude Code, Cursor, or any OpenClaw-compatible agent
          </p>
        </div>
      </div>

      {/* Detail Modal - Auto-opens on first visit */}
      {showDetailModal && (
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
            {/* Close button */}
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

            {/* Full Agent Identity Card */}
            <div onClick={(e) => e.stopPropagation()}>
              <AgentIdentityCard
                personality={personalityConfig}
                conviction={cardData.conviction}
                intuition={cardData.intuition}
                contribution={cardData.contribution}
                tasteSpectrums={cardData.tasteSpectrums}
                categories={cardData.categories}
                memberSince={cardData.memberSince}
                cardId={cardData.cardId}
                dynamicDescription={cardData.dynamicDescription}
              />
            </div>

            {/* Share on X */}
            <button
              onClick={(e) => { e.stopPropagation(); handleShareOnX(); }}
              className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors font-medium"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              Share on X
            </button>
          </div>
        </div>
      )}

      {/* Auth Modal removed - now using direct redirect to /register */}

      {/* Email Capture Modal */}
      <EmailCaptureModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        onSubmit={handleEmailSubmit}
        personalityType={agentData.personalityType}
        agentUserId={agentUserId}
      />
    </div>
  );
}
