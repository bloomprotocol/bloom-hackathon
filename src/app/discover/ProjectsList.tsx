'use client';
import { useState, useEffect, useMemo } from 'react';
import { useCreatePledge, useCancelPledge, useWeeklyLimit, useMyPledges } from '@/hooks/usePledges';
import { useAuth } from '@/lib/context/AuthContext';
import { useModal } from '@/lib/context/ModalContext';
import { logger } from '@/lib/utils/logger';
import DiscoverProjectCard from './DiscoverProjectCard';
import CategorySelector from './CategorySelector';
import PowerExpiringBanner from './PowerExpiringBanner';
import FirstPledgeCelebration from './FirstPledgeCelebration';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet } from '@/lib/api/apiConfig';
import type { ProductHuntProduct } from '@/hooks/useProductHuntProducts';

// Track pledged projects: projectId -> { pledgeId, pledgePower }
interface PledgeInfo {
  pledgeId: string;
  pledgePower: number;
}

export default function ProjectsList() {
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [pledgeAmount, setPledgeAmount] = useState<string>('50.00');
  const [selectedQuickAmount, setSelectedQuickAmount] = useState<number>(50);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'newest' | 'trending'>('newest');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [pledgeMessage, setPledgeMessage] = useState<string>('');

  // Auth and Pledge hooks
  const { user } = useAuth();
  const { openAuthModal } = useModal();
  const queryClient = useQueryClient();
  const createPledge = useCreatePledge();
  const cancelPledge = useCancelPledge();
  const { data: weeklyLimit, isLoading: isLoadingLimit, error: limitError } = useWeeklyLimit(!!user);
  const { data: myPledges } = useMyPledges(!!user);

  const [pledgedProjects, setPledgedProjects] = useState<Record<string, PledgeInfo>>({});
  const [celebrationData, setCelebrationData] = useState<{
    isFirstPledge: boolean;
    projectName: string;
    pledgePower: number;
    weeklyPowerUsed: number;
    weeklyPowerTarget: number;
  } | null>(null);

  // Load existing pledges from backend
  useEffect(() => {
    if (myPledges?.items) {
      const pledgeMap: Record<string, PledgeInfo> = {};
      myPledges.items.forEach((pledge) => {
        pledgeMap[pledge.projectId] = {
          pledgeId: pledge.pledgeId,
          pledgePower: pledge.pledgePower ?? 0,
        };
      });
      setPledgedProjects(pledgeMap);
    }
  }, [myPledges]);
  const [pledgeError, setPledgeError] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await apiGet<{ success: boolean; data: { categories: string[] } }>('/product-hunt/categories');
      return response.data?.categories || [];
    },
  });

  const categories = categoriesData || [];

  // Fetch projects from /product-hunt/products with pledge stats
  // Note: Always fetch by date (newest first), we'll sort by Bloom Score in frontend for trending
  const { data, isLoading, error } = useQuery({
    queryKey: ['product-hunt-projects', { sortBy, categories: selectedCategories }],
    queryFn: async () => {
      const queryParams = new URLSearchParams({
        page: '1',
        limit: '50',
        sortBy: 'date', // Always fetch newest first, we sort by Bloom Score in frontend
      });

      if (selectedCategories.length > 0) {
        queryParams.append('category', selectedCategories.join(','));
      }

      const response = await apiGet<{
        success: boolean;
        data: {
          projects: Array<ProductHuntProduct & { pledgeStats?: { backerCount: number; totalPower: number; trending: boolean } }>;
          pagination: { total: number; page: number; limit: number; totalPages: number };
        };
        statusCode: number;
      }>(`/product-hunt/products?${queryParams}`);
      return response;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Calculate Bloom Score for a product
  // Formula: (PH Votes × 0.6) + (Backers × 10) + (Pledge Power / 40)
  const calculateBloomScore = (product: any): number => {
    const phVotes = product.votesCount || 0;
    const backers = product.pledgeStats?.backerCount || 0;
    const pledgePower = product.pledgeStats?.totalPower || 0;
    const score = (phVotes * 0.6) + (backers * 10) + (pledgePower / 40);
    return Math.ceil(score);
  };

  const rawProducts = data?.data?.projects || [];

  // Sort and filter products based on sortBy and searchQuery
  const products = useMemo(() => {
    let productsCopy = [...rawProducts];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      productsCopy = productsCopy.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.tagline?.toLowerCase().includes(query)
      );
    }

    // Apply sort
    if (sortBy === 'trending') {
      // Sort by Bloom Score (highest first)
      productsCopy.sort((a, b) => {
        const scoreA = calculateBloomScore(a);
        const scoreB = calculateBloomScore(b);
        return scoreB - scoreA;
      });
    }
    // For 'newest', backend already sorts by date, so no need to re-sort

    return productsCopy;
  }, [rawProducts, sortBy, searchQuery]);

  // Handle pledge submission
  const handlePledgeSubmit = async (projectId: string, projectName: string, e?: React.MouseEvent) => {
    try {
      if (e) e.stopPropagation();

      if (!user) {
        openAuthModal();
        return;
      }

      const amount = parseFloat(pledgeAmount);
      if (isNaN(amount) || amount <= 0) {
        setPledgeError(projectId);
        setErrorMessage('Please enter a valid amount');
        setTimeout(() => {
          setPledgeError(null);
          setErrorMessage(null);
        }, 3000);
        return;
      }

      // Check weekly limit before submitting
      const remaining = weeklyLimit?.remaining ?? 0;
      if (amount > remaining) {
        setPledgeError(projectId);
        setErrorMessage(`Weekly limit reached. You have ${remaining} Pledge Power remaining. Cancel existing pledges to free up limit.`);
        setTimeout(() => {
          setPledgeError(null);
          setErrorMessage(null);
        }, 5000);
        return;
      }

      const result = await createPledge.mutateAsync({
        projectId,
        pledgePower: amount,
        message: pledgeMessage.trim() || undefined
      });
      setPledgedProjects(prev => ({
        ...prev,
        [projectId]: { pledgeId: result.pledgeId, pledgePower: amount }
      }));
      setErrorMessage(null);
      setPledgeMessage(''); // Clear message after successful pledge
      setExpandedCard(null); // Collapse the card after successful pledge

      // Check if this is first pledge and show celebration
      try {
        const celebrationResponse = await apiGet<{
          success: boolean;
          data: {
            isFirstPledge: boolean;
            projectName: string;
            pledgePower: number;
            weeklyPowerUsed: number;
            weeklyPowerTarget: number;
          };
        }>('/pledges/first-pledge-check');

        if (celebrationResponse.data?.isFirstPledge) {
          setCelebrationData(celebrationResponse.data);
        }
      } catch (celebrationError) {
        logger.error('Failed to check first pledge', { error: celebrationError });
        // Don't block the main flow if celebration check fails
      }
    } catch (error: any) {
      logger.error('Pledge failed', { error });
      setPledgeError(projectId);
      const message = error?.response?.data?.error || error?.message || 'Pledge failed';
      setErrorMessage(message);
      setTimeout(() => {
        setPledgeError(null);
        setErrorMessage(null);
      }, 5000);
    }
  };

  // Handle pledge cancellation
  const handleCancelPledge = async (projectId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    const pledgeInfo = pledgedProjects[projectId];
    if (!pledgeInfo) return;

    try {
      await cancelPledge.mutateAsync(pledgeInfo.pledgeId);
      // Remove from pledged projects
      setPledgedProjects(prev => {
        const newState = { ...prev };
        delete newState[projectId];
        return newState;
      });
    } catch (error) {
      logger.error('Cancel pledge failed', { error });
    }
  };

  // Calculate hours until next Monday UTC 0:00
  const getHoursUntilReset = (): number => {
    const now = new Date();
    const nextMonday = new Date(now);
    nextMonday.setUTCHours(0, 0, 0, 0);

    // Find next Monday
    const daysUntilMonday = (8 - nextMonday.getUTCDay()) % 7;
    nextMonday.setUTCDate(nextMonday.getUTCDate() + (daysUntilMonday === 0 ? 7 : daysUntilMonday));

    const diff = nextMonday.getTime() - now.getTime();
    return Math.floor(diff / (1000 * 60 * 60));
  };

  if (isLoading) return <div className="text-center py-8">Loading products...</div>;
  if (error) return <div className="text-center py-8 text-red-500">Failed to load products</div>;
  if (products.length === 0 && !searchQuery) return <div className="text-center py-8">No products found</div>;

  return (
    <div className="flex flex-col gap-4">
      {/* Error Message Banner */}
      {errorMessage && (
        <div className="flex items-center justify-between bg-red-50 rounded-xl px-4 py-3 border border-red-200">
          <span className="font-['Outfit'] text-sm text-red-600">
            {errorMessage}
          </span>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-red-400 hover:text-red-600"
          >
            ✕
          </button>
        </div>
      )}

      {/* Power Expiring Banner - Shows when urgent (< 24h and < 200 remaining) */}
      {user && weeklyLimit && (
        <PowerExpiringBanner
          remaining={weeklyLimit.remaining ?? 0}
          hoursUntilReset={getHoursUntilReset()}
        />
      )}

      {/* Loading State */}
      {user && isLoadingLimit && (
        <div className="px-1 py-2 text-sm text-gray-400">Loading weekly limit...</div>
      )}

      {/* Sort and Search - Phase 3 */}
      <div className="flex flex-col desktop:flex-row gap-2 mb-2">
        {/* Sort Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setSortBy('newest')}
            className={`px-4 py-2 rounded-lg font-['Outfit'] font-medium text-sm transition-all flex items-center gap-1.5 ${
              sortBy === 'newest'
                ? 'bg-[#a59af3] text-white shadow-md'
                : 'bg-gray-100 text-[#696f8c] hover:bg-gray-200'
            }`}
          >
            {/* Sparkles icon */}
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 1.5l.53 2.12a1.5 1.5 0 001.06 1.06L11.7 5.2l-2.12.53a1.5 1.5 0 00-1.06 1.06L8 9l-.53-2.12a1.5 1.5 0 00-1.06-1.06L4.3 5.2l2.12-.53a1.5 1.5 0 001.06-1.06L8 1.5zM3.5 8.5l.35.7a.5.5 0 00.45.3l.7.1-.7.1a.5.5 0 00-.45.3l-.35.7-.35-.7a.5.5 0 00-.45-.3l-.7-.1.7-.1a.5.5 0 00.45-.3l.35-.7zM12 10.5l.35.7a.5.5 0 00.45.3l.7.1-.7.1a.5.5 0 00-.45.3l-.35.7-.35-.7a.5.5 0 00-.45-.3l-.7-.1.7-.1a.5.5 0 00.45-.3l.35-.7z"/>
            </svg>
            Newest
          </button>

          <button
            onClick={() => setSortBy('trending')}
            className={`px-4 py-2 rounded-lg font-['Outfit'] font-medium text-sm transition-all flex items-center gap-1.5 ${
              sortBy === 'trending'
                ? 'bg-[#a59af3] text-white shadow-md'
                : 'bg-gray-100 text-[#696f8c] hover:bg-gray-200'
            }`}
          >
            {/* Trending up chart icon */}
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor">
              <polyline points="1,12 4,9 7,11 11,6 15,3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="11,3 15,3 15,7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Trending
          </button>
        </div>

        {/* Search Bar */}
        <div className="flex-1 desktop:max-w-xs">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9ca3af]" viewBox="0 0 16 16" fill="none" stroke="currentColor">
              <circle cx="7" cy="7" r="5" strokeWidth="1.5"/>
              <path d="M11 11l3 3" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects..."
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-gray-100 border border-transparent font-['Outfit'] text-sm text-[#393f49] placeholder-[#9ca3af] focus:bg-white focus:border-[#a59af3] focus:outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#393f49]"
              >
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Category Selector */}
      <CategorySelector
        categories={categories}
        selectedCategories={selectedCategories}
        onCategoriesApply={setSelectedCategories}
      />

      {/* No Search Results */}
      {products.length === 0 && searchQuery && (
        <div className="text-center py-12">
          <div className="text-[#6b7280] font-['Outfit'] mb-2">
            No projects found for "{searchQuery}"
          </div>
          <button
            onClick={() => setSearchQuery('')}
            className="text-[#a59af3] font-['Outfit'] text-sm hover:underline"
          >
            Clear search
          </button>
        </div>
      )}

      {products.map((product, index) => (
        <DiscoverProjectCard
          key={index}
          product={product}
          index={index}
          isExpanded={expandedCard === index}
          onToggleExpand={() => setExpandedCard(expandedCard === index ? null : index)}
          pledgeAmount={pledgeAmount}
          onPledgeAmountChange={(value) => {
            setPledgeAmount(value);
            setSelectedQuickAmount(0);
          }}
          selectedQuickAmount={selectedQuickAmount}
          onQuickAmountSelect={(amount) => {
            setPledgeAmount(amount.toFixed(2));
            setSelectedQuickAmount(amount);
          }}
          pledgeMessage={pledgeMessage}
          onPledgeMessageChange={setPledgeMessage}
          pledgeInfo={pledgedProjects[product.projectId]}
          pledgeError={pledgeError}
          onPledgeSubmit={(projectId, e) => handlePledgeSubmit(projectId, product.name, e)}
          onCancelPledge={handleCancelPledge}
          isPledgePending={createPledge.isPending}
          isCancelPending={cancelPledge.isPending}
        />
      ))}

      {/* First Pledge Celebration Modal */}
      {celebrationData?.isFirstPledge && (
        <FirstPledgeCelebration
          isOpen={celebrationData.isFirstPledge}
          onClose={() => setCelebrationData(null)}
          projectName={celebrationData.projectName}
          pledgePower={celebrationData.pledgePower}
          weeklyPowerUsed={celebrationData.weeklyPowerUsed}
          weeklyPowerTarget={celebrationData.weeklyPowerTarget}
        />
      )}
    </div>
  );
}
