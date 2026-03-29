'use client';

import { useState, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { skillService } from '@/lib/api/services/skillService';
import { useAuth } from '@/lib/context/AuthContext';
import { useModal } from '@/lib/context/ModalContext';
import { useV4UseCases } from '@/hooks/useV4UseCases';
import { useRaiseProjects } from '@/hooks/useRaiseProjects';
import type { Skill } from '@/lib/api/services/skillService';
import type { UseCase } from '@/constants/v4-use-case-definitions';
import SkillCategorySelector from '@/app/skills/SkillCategorySelector';
import DiscoverySkillCard from './DiscoverySkillCard';
import DiscoveryProjectCard from './DiscoveryProjectCard';
import V4UseCaseCard from './V4UseCaseCard';
import V4ClaimModal from './V4ClaimModal';
import { SKILL_CATEGORY_ID_TO_API } from '@/constants/skill-category-definitions';

type SortOption = 'trending' | 'newest';

type TypeTab = 'projects';

const TYPE_TABS: { id: TypeTab; label: string }[] = [
  { id: 'projects', label: 'Projects' },
];

// Verification badge config
const VERIFIED_BADGE: Record<string, { label: string; color: string; bg: string; border: string }> = {
  'bloom-verified': {
    label: 'Certified',
    color: '#7c3aed',
    bg: 'rgba(124,58,237,0.08)',
    border: 'rgba(124,58,237,0.2)',
  },
  community: {
    label: 'Community',
    color: '#059669',
    bg: 'rgba(5,150,105,0.08)',
    border: 'rgba(5,150,105,0.2)',
  },
  unverified: {
    label: 'Listed',
    color: '#9ca3af',
    bg: 'rgba(156,163,175,0.08)',
    border: 'rgba(156,163,175,0.2)',
  },
};

export default function DiscoveryPageClient() {
  const { user } = useAuth();
  const { openAuthModal } = useModal();
  const [activeTab, setActiveTab] = useState<TypeTab>('projects');

  // ─── Use Cases state ───
  const [selectedUseCase, setSelectedUseCase] = useState<UseCase | null>(null);
  const { data: useCases, isLoading: useCasesLoading } = useV4UseCases();

  const sortedUseCases = useMemo(() => {
    if (!useCases) return [];
    return [...useCases].sort((a, b) => {
      if (a.status === 'live' && b.status !== 'live') return -1;
      if (a.status !== 'live' && b.status === 'live') return 1;
      return 0;
    });
  }, [useCases]);

  // ─── Projects state ───
  const [sortOption, setSortOption] = useState<SortOption>('trending');
  const { data: projects, isLoading: projectsLoading } = useRaiseProjects();

  const sortedProjects = useMemo(() => {
    if (!projects) return [];
    const sorted = [...projects];
    if (sortOption === 'trending') {
      sorted.sort((a, b) => b.evaluationCount - a.evaluationCount);
    } else {
      sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return sorted;
  }, [projects, sortOption]);

  // ─── Skills state ───
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showFeatured, setShowFeatured] = useState(true);
  const [voteState, setVoteState] = useState<
    Record<string, { voted: boolean; humanCount: number; agentCount: number }>
  >({});
  const [votingSlug, setVotingSlug] = useState<string | null>(null);

  const apiCategory = selectedCategory
    ? SKILL_CATEGORY_ID_TO_API[selectedCategory]
    : undefined;

  const { data: skillsData, isLoading: skillsLoading } = useQuery({
    queryKey: ['discovery-skills', apiCategory, showFeatured],
    queryFn: () =>
      skillService.getSkills({
        category: apiCategory,
        sort: 'score',
        featured: showFeatured,
        limit: 200,
      }),
    staleTime: 2 * 60 * 1000,
    enabled: false,
  });

  const { data: risingData } = useQuery({
    queryKey: ['discovery-rising', apiCategory],
    queryFn: () =>
      skillService.getSkills({
        category: apiCategory,
        rising: true,
        limit: 10,
      }),
    staleTime: 2 * 60 * 1000,
    enabled: false,
  });

  const skills: Skill[] = useMemo(
    () => skillsData?.data?.skills || [],
    [skillsData],
  );

  const risingSkills: Skill[] = useMemo(
    () => risingData?.data?.skills || [],
    [risingData],
  );

  const allSkills = useMemo(
    () => [...skills, ...risingSkills],
    [skills, risingSkills],
  );

  const getVoteCounts = useCallback(
    (skill: Skill) => {
      if (voteState[skill.slug]) return voteState[skill.slug];
      return {
        voted: false,
        humanCount: skill.backingStats?.directCount || 0,
        agentCount: skill.backingStats?.agentReferredCount || 0,
      };
    },
    [voteState],
  );

  const handleVote = useCallback(
    async (slug: string) => {
      if (!user) {
        openAuthModal();
        return;
      }
      if (votingSlug) return;

      const found = allSkills.find((s) => s.slug === slug);
      const current = voteState[slug] || {
        voted: false,
        humanCount: found?.backingStats?.directCount || 0,
        agentCount: found?.backingStats?.agentReferredCount || 0,
      };

      const nextVoted = !current.voted;
      const delta = nextVoted ? 1 : -1;
      setVoteState((prev) => ({
        ...prev,
        [slug]: {
          voted: nextVoted,
          humanCount: Math.max(0, current.humanCount + delta),
          agentCount: current.agentCount,
        },
      }));

      setVotingSlug(slug);
      try {
        const res = await skillService.toggleUpvote(slug);
        if (res?.data) {
          setVoteState((prev) => ({
            ...prev,
            [slug]: {
              voted: res.data.voted,
              humanCount: res.data.humanCount,
              agentCount: res.data.agentCount,
            },
          }));
        }
      } catch {
        setVoteState((prev) => ({
          ...prev,
          [slug]: current,
        }));
      } finally {
        setVotingSlug(null);
      }
    },
    [user, openAuthModal, votingSlug, voteState, allSkills],
  );

  return (
    <div className="max-w-[900px] mx-auto px-4 py-8">
      {/* Hero */}
      <div className="mb-6">
        <h1
          className="text-2xl desktop:text-[36px] font-bold text-[#1e1b4b] mb-2 leading-tight tracking-tight"
          style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}
        >
          Anyone can build now.{' '}
          <span
            style={{
              fontFamily: 'var(--font-dm-serif-display), DM Serif Display, serif',
              fontStyle: 'italic',
              fontWeight: 400,
              background: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 50%, #6d28d9 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Not everyone gets found.
          </span>
        </h1>
        <p
          className="text-sm text-[#6b7280] mb-4"
          style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}
        >
          Projects evaluated by agent tribes. Multi-perspective intelligence — powered by proof of human.
        </p>
        <a
          href="/launch-committee"
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{
            fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif',
            background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
          }}
        >
          Building something? Analyze Your Project &rarr;
        </a>
      </div>

      {/* Type Tabs: Use Cases | Projects | Skills */}
      <div className="flex items-center gap-1 mb-5 border-b border-gray-200">
        {TYPE_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative px-4 py-2.5 font-semibold text-sm transition-colors ${
              activeTab === tab.id
                ? 'text-[#7c3aed]'
                : 'text-[#6b7280] hover:text-[#393f49]'
            }`}
            style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-2 right-2 h-[2px] bg-[#7c3aed] rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* ─── Projects Tab (default) ─── */}
      {activeTab === 'projects' && (
        <div className="flex flex-col gap-4">
          {/* Sort controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {(['trending', 'newest'] as const).map((opt) => (
                <button
                  key={opt}
                  onClick={() => setSortOption(opt)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    sortOption === opt
                      ? 'bg-[#7c3aed] text-white'
                      : 'text-[#6b7280] hover:text-[#393f49] hover:bg-gray-100'
                  }`}
                  style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}
                >
                  {opt === 'trending' ? 'Trending' : 'Newest'}
                </button>
              ))}
            </div>
            <a
              href="/launch-committee"
              className="text-xs font-medium text-[#7c3aed] hover:underline"
              style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}
            >
              Analyze My Project &rarr;
            </a>
          </div>

          {/* Featured project: Bloom Discovery Skill */}
          <a
            href="https://github.com/bloomprotocol/bloom-discovery-skill"
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-[16px] p-5 transition-shadow hover:shadow-md"
            style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.06), rgba(196,164,108,0.04))', border: '1px solid rgba(124,58,237,0.12)' }}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ fontFamily: 'var(--font-jetbrains-mono), monospace', background: 'rgba(124,58,237,0.1)', color: '#7c3aed' }}>Building in Public</span>
                <h3 className="text-[16px] font-semibold text-[#1e1b4b] mt-2" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>Bloom Discovery Skill</h3>
              </div>
              <span className="text-[11px] text-[#9ca3af]" style={{ fontFamily: 'var(--font-jetbrains-mono), monospace' }}>2026-03-29</span>
            </div>
            <p className="text-[13px] text-[#6b7280] mb-3 leading-relaxed" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>
              Intent-driven skill discovery — analyzes your builder personality and matches you to curated use case playbooks. Don&apos;t browse 13,000 skills. Browse use cases.
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-[11px] px-2 py-1 rounded-full" style={{ fontFamily: 'var(--font-jetbrains-mono), monospace', background: 'rgba(5,150,105,0.08)', color: '#059669' }}>Published on ClawHub</span>
              <span className="text-[11px] px-2 py-1 rounded-full" style={{ fontFamily: 'var(--font-jetbrains-mono), monospace', background: 'rgba(234,179,8,0.08)', color: '#b45309' }}>4 missions active</span>
              <span className="text-[11px] px-2 py-1 rounded-full" style={{ fontFamily: 'var(--font-jetbrains-mono), monospace', background: 'rgba(124,58,237,0.08)', color: '#7c3aed' }}>$2 USDC bounty pool</span>
            </div>
          </a>

          {/* Other project cards */}
          {projectsLoading ? (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-[16px] h-24 animate-pulse"
                  style={{ background: 'rgba(124,58,237,0.04)' }}
                />
              ))}
            </div>
          ) : sortedProjects.length > 0 ? (
            <div className="flex flex-col gap-3">
              {sortedProjects.map((project) => (
                <DiscoveryProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : null}
        </div>
      )}

      {/* ─── Skills Tab (hidden for now) ─── */}
      {false && (
        <div className="flex flex-col gap-4">
          {/* Featured toggle + Domain filter chips */}
          <div className="flex items-center justify-between gap-3">
            <SkillCategorySelector
              selectedCategory={selectedCategory}
              onCategorySelect={setSelectedCategory}
            />
            <button
              onClick={() => setShowFeatured((v) => !v)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                showFeatured
                  ? 'bg-[#7c3aed] text-white'
                  : 'bg-gray-100 text-[#6b7280] hover:bg-gray-200'
              }`}
              style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}
            >
              {showFeatured ? 'Curated' : 'All Skills'}
            </button>
          </div>

          {/* Skills list */}
          {skillsLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin w-6 h-6 border-2 border-purple-300 border-t-purple-600 rounded-full" />
            </div>
          ) : skills.length === 0 ? (
            <div className="text-center py-16">
              <p
                className="text-sm text-[#9ca3af]"
                style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}
              >
                No skills found in this category.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {skills.map((skill) => {
                const counts = getVoteCounts(skill);
                return (
                  <DiscoverySkillCard
                    key={skill.slug}
                    skill={skill}
                    voted={counts.voted}
                    humanCount={counts.humanCount}
                    agentCount={counts.agentCount}
                    onVote={handleVote}
                    isVoting={votingSlug === skill.slug}
                  />
                );
              })}
            </div>
          )}

          {/* Rising section */}
          {showFeatured && risingSkills.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center gap-2 mb-3">
                <h2
                  className="font-bold text-lg text-[#1e1b4b]"
                  style={{ fontFamily: 'var(--font-dm-serif-display), DM Serif Display, serif' }}
                >
                  Rising
                </h2>
                <span
                  className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[11px] font-medium"
                  style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}
                >
                  New &amp; Promising
                </span>
              </div>
              <div className="flex flex-col gap-3">
                {risingSkills.map((skill) => {
                  const counts = getVoteCounts(skill);
                  return (
                    <DiscoverySkillCard
                      key={skill.slug}
                      skill={skill}
                      voted={counts.voted}
                      humanCount={counts.humanCount}
                      agentCount={counts.agentCount}
                      onVote={handleVote}
                      isVoting={votingSlug === skill.slug}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── Detail Modal ─── */}
      {selectedUseCase && (
        <V4ClaimModal
          useCase={selectedUseCase}
          isOpen={!!selectedUseCase}
          onClose={() => setSelectedUseCase(null)}
        />
      )}
    </div>
  );
}
