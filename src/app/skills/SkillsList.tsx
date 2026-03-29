'use client';

import { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { skillService } from '@/lib/api/services/skillService';
import { agentPledgeService } from '@/lib/api/services/agentPledgeService';
import type { SkillPledgeStats } from '@/lib/api/services/agentPledgeService';
import { SKILL_CATEGORY_ID_TO_API, DISPLAY_TO_BACKEND_CATEGORIES } from '@/constants/skill-category-definitions';
import SkillCard from './SkillCard';
import SkillCategorySelector from './SkillCategorySelector';
import type { Skill } from '@/lib/api/services/skillService';

const PAGE_SIZE = 20;

interface SkillsListProps {
  onAddToCart: (skill: Skill, amount: number) => void;
  isInCart: (slug: string) => boolean;
  isBacked: (slug: string) => boolean;
}

export default function SkillsList({ onAddToCart, isInCart, isBacked }: SkillsListProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'stars' | 'newest'>('stars');
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);

  // Reset visible count when filters change
  const handleCategorySelect = useCallback((cat: string | null) => {
    setSelectedCategory(cat);
    setVisibleCount(PAGE_SIZE);
  }, []);

  const handleSortChange = useCallback((sort: 'stars' | 'newest') => {
    setSortBy(sort);
    setVisibleCount(PAGE_SIZE);
  }, []);

  // Fetch all skills — category filtering done client-side to handle merged categories
  const { data, isLoading, error } = useQuery({
    queryKey: ['skills', { sort: sortBy }],
    queryFn: () =>
      skillService.getSkills({
        sort: sortBy,
        limit: 200,
      }),
    staleTime: 2 * 60 * 1000,
  });

  const allSkills = data?.data?.skills || [];

  // Client-side category filter using display → backend category mapping
  const apiCategory = selectedCategory ? SKILL_CATEGORY_ID_TO_API[selectedCategory] : undefined;
  const rawSkills = useMemo(() => {
    if (!apiCategory) return allSkills;
    const backendCats = DISPLAY_TO_BACKEND_CATEGORIES[apiCategory] || [apiCategory];
    return allSkills.filter(skill =>
      skill.categories?.some(cat => backendCats.includes(cat))
    );
  }, [allSkills, apiCategory]);

  // Fetch agent pledge stats for all visible skills
  const slugs = rawSkills.map(s => s.slug);
  const { data: pledgeStatsMap } = useQuery({
    queryKey: ['skill-pledge-stats', slugs],
    queryFn: () => agentPledgeService.getBatchPledgeStats(slugs),
    staleTime: 2 * 60 * 1000,
    enabled: slugs.length > 0,
  });

  // Client-side search filter
  const filteredSkills = useMemo(() => {
    if (!searchQuery.trim()) return rawSkills;
    const query = searchQuery.toLowerCase();
    return rawSkills.filter(
      (skill) =>
        skill.name.toLowerCase().includes(query) ||
        skill.description?.toLowerCase().includes(query) ||
        skill.slug.toLowerCase().includes(query)
    );
  }, [rawSkills, searchQuery]);

  // Paginated slice
  const skills = filteredSkills.slice(0, visibleCount);
  const hasMore = visibleCount < filteredSkills.length;

  if (isLoading) {
    return <div className="text-center py-8 font-['Outfit'] text-[#696f8c]">Loading skills...</div>;
  }

  if (error) {
    return <div className="text-center py-8 font-['Outfit'] text-red-500">Failed to load skills</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Sticky controls: Sort + Search + Category */}
      <div className="sticky top-[56px] desktop:top-[84px] z-20 pt-2 pb-2 bg-gradient-to-b from-white/60 via-white/40 to-transparent backdrop-blur-md">
        {/* Sort + Search */}
        <div className="flex flex-col desktop:flex-row gap-2 mb-2">
          <div className="flex gap-2">
            {[
              { key: 'stars' as const, label: 'Popular', icon: (
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <polyline points="1,12 4,9 7,11 11,6 15,3" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="11,3 15,3 15,7" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )},
              { key: 'newest' as const, label: 'Newest', icon: (
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 1.5l.53 2.12a1.5 1.5 0 001.06 1.06L11.7 5.2l-2.12.53a1.5 1.5 0 00-1.06 1.06L8 9l-.53-2.12a1.5 1.5 0 00-1.06-1.06L4.3 5.2l2.12-.53a1.5 1.5 0 001.06-1.06L8 1.5z"/>
                </svg>
              )},
            ].map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => handleSortChange(key)}
                className={`px-4 py-2 rounded-lg font-['Outfit'] font-medium text-sm transition-all flex items-center gap-1.5 ${
                  sortBy === key
                    ? 'bg-[#8b5cf6] text-white shadow-md'
                    : 'bg-gray-100 text-[#696f8c] hover:bg-gray-200'
                }`}
              >
                {icon}
                {label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="flex-1 desktop:max-w-xs">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9ca3af]" viewBox="0 0 16 16" fill="none" stroke="currentColor">
                <circle cx="7" cy="7" r="5" strokeWidth="1.5" />
                <path d="M11 11l3 3" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setVisibleCount(PAGE_SIZE); }}
                placeholder="Search skills..."
                className="w-full pl-9 pr-4 py-2 rounded-lg bg-gray-100 border border-transparent font-['Outfit'] text-sm text-[#393f49] placeholder-[#9ca3af] focus:bg-white focus:border-[#8b5cf6] focus:outline-none transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(''); setVisibleCount(PAGE_SIZE); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#393f49]"
                >
                  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Category Selector */}
        <SkillCategorySelector
          selectedCategory={selectedCategory}
          onCategorySelect={handleCategorySelect}
        />
      </div>

      {/* No Results */}
      {filteredSkills.length === 0 && searchQuery && (
        <div className="text-center py-12">
          <div className="text-[#6b7280] font-['Outfit'] mb-2">
            No skills found for &ldquo;{searchQuery}&rdquo;
          </div>
          <button
            onClick={() => { setSearchQuery(''); setVisibleCount(PAGE_SIZE); }}
            className="text-[#8b5cf6] font-['Outfit'] text-sm hover:underline"
          >
            Clear search
          </button>
        </div>
      )}

      {filteredSkills.length === 0 && !searchQuery && (
        <div className="text-center py-12">
          <div className="text-[#6b7280] font-['Outfit']">
            No skills found in this category yet.
          </div>
        </div>
      )}

      {/* Skills Grid */}
      {skills.map((skill) => (
        <SkillCard
          key={skill.slug}
          skill={skill}
          onBack={onAddToCart}
          isInCart={isInCart(skill.slug)}
          isBacked={isBacked(skill.slug)}
          pledgeStats={pledgeStatsMap?.[skill.slug]}
          isExpanded={expandedSlug === skill.slug}
          onToggleExpand={() => setExpandedSlug(expandedSlug === skill.slug ? null : skill.slug)}
        />
      ))}

      {/* Load More */}
      {hasMore && (
        <button
          onClick={() => setVisibleCount(prev => prev + PAGE_SIZE)}
          className="w-full py-3 rounded-xl font-['Outfit'] font-medium text-sm text-[#8b5cf6] transition-all hover:bg-purple-50/50"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(240,235,255,0.2) 100%)',
            border: '1px solid rgba(255,255,255,0.4)',
            backdropFilter: 'blur(12px)',
          }}
        >
          Show more skills ({filteredSkills.length - visibleCount} remaining)
        </button>
      )}
    </div>
  );
}
