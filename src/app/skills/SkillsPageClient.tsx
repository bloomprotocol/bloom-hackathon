'use client';

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import SkillsList from './SkillsList';
import BackCart from './BackCart';
import BackCelebration from './BackCelebration';
import AgentRecommendCard from './AgentRecommendCard';
import HowBackingWorks from './HowBackingWorks';
import SkillCreatorCTA from './SkillCreatorCTA';
import { useAuth } from '@/lib/context/AuthContext';
import { useModal } from '@/lib/context/ModalContext';
import { useEscrowDeposit } from '@/hooks/useEscrowDeposit';
import { useSolanaEscrowDeposit } from '@/hooks/useSolanaEscrowDeposit';
import { skillService } from '@/lib/api/services/skillService';
import { logger } from '@/lib/utils/logger';
import type { Skill } from '@/lib/api/services/skillService';
import type { Chain } from '@/components/ui/ChainSelector';

// Parse ?back=cursor:5,mcp-fetch:5 → [{slug, amount}]
const MAX_BACK_AMOUNT = 10000;
function parseBackParam(param: string | null): { slug: string; amount: number }[] {
  if (!param) return [];
  return param.split(',').map(item => {
    const [slug, amountStr] = item.split(':');
    const parsed = parseFloat(amountStr);
    const amount = Number.isFinite(parsed) ? Math.min(Math.max(1, parsed), MAX_BACK_AMOUNT) : 5;
    return { slug: slug.trim(), amount };
  }).filter(item => item.slug);
}

export interface CartItem {
  skill: Skill;
  amount: number;
}

export default function SkillsPageClient() {
  const { user } = useAuth();
  const { openAuthModal } = useModal();
  const searchParams = useSearchParams();

  // Parse agent pre-fill params: ?back=cursor:5,mcp-fetch:5&ref=agent&listId=xxx
  const backParam = searchParams.get('back');
  const refSource = searchParams.get('ref'); // 'agent' for agent-referral
  const listId = searchParams.get('listId');
  const isAgentReferred = refSource === 'agent';
  const prefillItems = useMemo(() => parseBackParam(backParam), [backParam]);

  // Cart state — each item carries its own amount
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [backedSlugs, setBackedSlugs] = useState<Set<string>>(new Set());
  const [agentPrefilled, setAgentPrefilled] = useState(false);

  // Celebration state
  const [celebrationData, setCelebrationData] = useState<{
    skillCount: number;
    skillNames: string[];
    totalAmount: number;
  } | null>(null);

  // Onboarding state
  const [showOnboarding, setShowOnboarding] = useState(() => {
    if (typeof window === 'undefined') return false;
    // Skip onboarding if arriving via agent link
    if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('back')) return false;
    return !localStorage.getItem('bloom_skills_onboarding_seen');
  });

  // Chain selection (Base or Solana)
  const [selectedChain, setSelectedChain] = useState<Chain>('base');

  // Dual escrow hooks — both always instantiated (React rules), only active one used
  const baseEscrow = useEscrowDeposit();
  const solanaEscrow = useSolanaEscrowDeposit();
  const activeEscrow = selectedChain === 'base' ? baseEscrow : solanaEscrow;
  const { depositToEscrow, checkBalance } = activeEscrow;
  // Combine flags to prevent chain switching mid-deposit (race condition guard)
  const isTransferring = baseEscrow.isDepositing || solanaEscrow.isDepositing;

  // Fetch skills to resolve prefill slugs → Skill objects
  const { data: prefillSkillsData } = useQuery({
    queryKey: ['skills', { sort: 'stars' }],
    queryFn: () => skillService.getSkills({ sort: 'stars', limit: 200 }),
    staleTime: 2 * 60 * 1000,
    enabled: prefillItems.length > 0,
  });

  // Auto-populate cart from URL params (runs once after skills load)
  const prefillDone = useRef(false);
  useEffect(() => {
    if (prefillDone.current || prefillItems.length === 0) return;
    const allSkills = prefillSkillsData?.data?.skills;
    if (!allSkills) return;

    const newItems: CartItem[] = [];
    for (const item of prefillItems) {
      const skill = allSkills.find((s: Skill) => s.slug === item.slug);
      if (skill) {
        newItems.push({ skill, amount: item.amount });
      }
    }

    if (newItems.length > 0) {
      setCartItems(newItems);
      setAgentPrefilled(true);
    }
    prefillDone.current = true;
  }, [prefillSkillsData, prefillItems]);

  const handleAddToCart = useCallback((skill: Skill, amount: number) => {
    if (!user) {
      openAuthModal();
      return;
    }
    setCartItems(prev => {
      if (prev.find(item => item.skill.slug === skill.slug)) return prev;
      return [...prev, { skill, amount }];
    });
  }, [user, openAuthModal]);

  const handleRemoveFromCart = useCallback((slug: string) => {
    setCartItems(prev => prev.filter(item => item.skill.slug !== slug));
  }, []);

  const handleBackAll = useCallback(async () => {
    if (cartItems.length === 0) return;

    const totalAmount = cartItems.reduce((sum, item) => sum + item.amount, 0);

    // Check balance before transfer
    try {
      const balance = await checkBalance();
      if (balance !== null && balance < totalAmount) {
        alert(`Insufficient USDC balance. You have $${balance.toFixed(2)} but need $${totalAmount.toFixed(2)}.`);
        return;
      }
    } catch {
      // Non-critical — proceed with transfer anyway
    }

    try {
      // Escrow deposit: approve USDC → deposit to contract
      const items = cartItems.map(item => ({ slug: item.skill.slug, amount: item.amount }));
      const txHash = await depositToEscrow(items);

      if (!txHash) {
        logger.error('Escrow deposit failed — no txHash returned');
        return;
      }

      // Record all backings — use agent-referral source if from agent link
      await skillService.recordBackingBatch(
        txHash,
        cartItems.map(item => ({ slug: item.skill.slug, amount: item.amount })),
        isAgentReferred ? 'agent-referral' : 'direct',
        isAgentReferred && listId ? listId : undefined,
        selectedChain,
      );

      // Update state
      setBackedSlugs(prev => {
        const next = new Set(prev);
        cartItems.forEach(item => next.add(item.skill.slug));
        return next;
      });

      // Show celebration
      setCelebrationData({
        skillCount: cartItems.length,
        skillNames: cartItems.map(item => item.skill.name),
        totalAmount,
      });

      // Clear cart
      setCartItems([]);
    } catch (error) {
      logger.error('Batch backing failed', { error });
    }
  }, [cartItems, depositToEscrow, checkBalance, selectedChain]);

  const handleDismissOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem('bloom_skills_onboarding_seen', 'true');
  };

  const isInCart = useCallback((slug: string) => {
    return cartItems.some(item => item.skill.slug === slug);
  }, [cartItems]);

  const isBacked = useCallback((slug: string) => {
    return backedSlugs.has(slug);
  }, [backedSlugs]);

  return (
    <div className="flex flex-col desktop:flex-row gap-6">
      {/* Main content column */}
      <div className="flex-1 desktop:max-w-[728px] flex flex-col gap-6 pb-24 desktop:pb-6">
        {/* Page Header */}
        <div className="mb-2">
          <h1 className="font-serif font-bold text-3xl text-[#1e1b4b] tracking-[-0.48px] mb-2">
            Discover Skills
          </h1>
          <p className="font-serif text-xl text-[#393f49] mb-1">
            Make your agent smarter, sharper and more capable
          </p>
          <p className="font-['Outfit'] text-sm text-[#6b7280]">
            Back from $1 — earn an Exclusive Pass when the creator claims
          </p>
        </div>

        {/* Agent pre-fill banner — shown when arriving via agent link */}
        {agentPrefilled && cartItems.length > 0 && (
          <div
            className="p-4 rounded-[20px] relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(232,149,106,0.08) 0%, rgba(139,92,246,0.08) 100%)',
              border: '1px solid rgba(232,149,106,0.2)',
            }}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl shrink-0">🤖</span>
              <div>
                <p className="font-['Outfit'] font-semibold text-sm text-[#1e1b4b] mb-1">
                  Your agent recommended {cartItems.length} skill{cartItems.length > 1 ? 's' : ''}
                </p>
                <p className="font-['Outfit'] text-xs text-[#696f8c] leading-relaxed">
                  {cartItems.map(item => item.skill.name).join(', ')} — total ${cartItems.reduce((s, i) => s + i.amount, 0).toFixed(2)} USDC. Review and back with one click, or adjust amounts below.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Onboarding Copy — first visit only */}
        {showOnboarding && (
          <div
            className="p-4 rounded-[20px] relative overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(245,240,255,0.35) 100%)',
              border: '1px solid rgba(255,255,255,0.6)',
              boxShadow: '0 4px 24px rgba(100,80,150,0.08), inset 0 1px 0 rgba(255,255,255,0.7), inset 0 -1px 0 rgba(150,130,200,0.06)',
              backdropFilter: 'blur(24px) saturate(1.2)',
              WebkitBackdropFilter: 'blur(24px) saturate(1.2)',
            }}
          >
            <button
              onClick={handleDismissOnboarding}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
              </svg>
            </button>
            <div className="relative flex flex-col gap-2.5 pr-6">
              <p className="font-['Outfit'] font-semibold text-sm text-[#1e1b4b]">
                How Backing Works
              </p>
              <div className="flex items-start gap-2.5">
                <span className="text-base shrink-0">🧩</span>
                <p className="font-['Outfit'] text-xs text-[#6b7280] leading-relaxed">
                  <span className="font-medium text-[#393f49]">Pick skills</span> — open-source tools that make AI agents more capable.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="text-base shrink-0">🔒</span>
                <p className="font-['Outfit'] text-xs text-[#6b7280] leading-relaxed">
                  <span className="font-medium text-[#393f49]">Back from $1</span> — your funds are held in escrow, never spent until a creator claims.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="text-base shrink-0">🎫</span>
                <p className="font-['Outfit'] text-xs text-[#6b7280] leading-relaxed">
                  <span className="font-medium text-[#393f49]">Earn an Exclusive Pass</span> — when the creator claims, you get early access, priority rewards, and founding status. No claim in 90 days = <span className="font-medium text-[#7c3aed]">full refund</span>.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Bloom Discovery Install CTA — mobile only */}
        <div className="block desktop:hidden">
          <AgentRecommendCard />
        </div>

        {/* Skills List */}
        <SkillsList
          onAddToCart={handleAddToCart}
          isInCart={isInCart}
          isBacked={isBacked}
        />

      </div>

      {/* Sidebar — desktop only, sticky */}
      <div className="hidden desktop:block w-[300px] shrink-0">
        <div className="sticky top-[100px] flex flex-col gap-4">
          <AgentRecommendCard />
          <HowBackingWorks />
          <BackCart
            items={cartItems}
            onRemove={handleRemoveFromCart}
            onBackAll={handleBackAll}
            isTransferring={isTransferring}
            variant="sidebar"
            chain={selectedChain}
            onChainChange={setSelectedChain}
          />
          <SkillCreatorCTA />
          {/* Safety Disclaimer */}
          <p className="font-['Outfit'] text-[10px] text-[#b0b5c0] leading-relaxed px-1">
            Skills listed here are community-submitted and not verified or endorsed by Bloom Protocol. Always review a skill before use and confirm it suits your agent&apos;s needs. Bloom Protocol makes no guarantees regarding skill quality, safety, or functionality.
          </p>
        </div>
      </div>

      {/* Cart — mobile only, floating bottom */}
      <div className="desktop:hidden">
        <BackCart
          items={cartItems}
          onRemove={handleRemoveFromCart}
          onBackAll={handleBackAll}
          isTransferring={isTransferring}
          variant="floating"
          chain={selectedChain}
          onChainChange={setSelectedChain}
        />
      </div>

      {/* Celebration Modal */}
      {celebrationData && (
        <BackCelebration
          isOpen={!!celebrationData}
          onClose={() => setCelebrationData(null)}
          skillCount={celebrationData.skillCount}
          skillNames={celebrationData.skillNames}
          totalAmount={celebrationData.totalAmount}
          isLoggedIn={!!user}
        />
      )}
    </div>
  );
}
