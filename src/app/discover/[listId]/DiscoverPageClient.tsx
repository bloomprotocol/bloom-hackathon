'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BloomIcon } from '@/app/discover/icons';
import type { CuratedList, CuratedListItem } from '@/lib/api/services/skillService';

// Map backend categories to display labels (same as SkillCard)
function getDisplayCategories(categories: string[]): string[] {
  const displayMap: Record<string, string> = {
    'Agent Framework': 'Agent OS',
    'Context Engineering': 'Agent OS',
    'MCP Ecosystem': 'Agent OS',
    'AI Tools': 'AI & Dev Tools',
    Development: 'AI & Dev Tools',
    'Coding Assistant': 'AI & Dev Tools',
    Productivity: 'Productivity',
    Design: 'Design',
    Marketing: 'Marketing',
    Crypto: 'Crypto & Web3',
    Finance: 'Finance',
    'Prediction Market': 'Prediction Market',
    Wellness: 'Wellness',
    Education: 'Education',
    Lifestyle: 'Education',
    General: 'Other',
  };

  const unique = new Set<string>();
  categories.forEach((cat) => {
    unique.add(displayMap[cat] || cat);
  });
  return Array.from(unique).slice(0, 2);
}

function formatNumber(num: number): string {
  if (num >= 1000) {
    return (num / 1000).toFixed(num >= 10000 ? 0 : 1) + 'k';
  }
  return String(num);
}

// Map skill categories to a tribe
function getSkillTribe(categories: string[]): { id: string; name: string } {
  const catSet = categories.map((c) => c.toLowerCase());
  // Grow tribe
  if (catSet.some((c) => ['marketing', 'design', 'productivity'].includes(c))) {
    return { id: 'grow', name: 'Grow' };
  }
  // Raise tribe
  if (
    catSet.some((c) =>
      ['finance', 'crypto', 'prediction market'].includes(c),
    )
  ) {
    return { id: 'raise', name: 'Raise' };
  }
  // Launch tribe (dev tools, agent frameworks — builders validating ideas)
  if (
    catSet.some((c) =>
      [
        'agent framework',
        'context engineering',
        'mcp ecosystem',
        'coding assistant',
        'development',
        'ai tools',
      ].includes(c),
    )
  ) {
    return { id: 'launch', name: 'Launch' };
  }
  return { id: 'launch', name: 'Launch' }; // default
}

// Glass card shared style
const glassCardStyle = {
  background:
    'linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(245,240,255,0.35) 100%)',
  border: '1px solid rgba(255,255,255,0.6)',
  boxShadow:
    '0 2px 12px rgba(100,80,150,0.06), inset 0 1px 0 rgba(255,255,255,0.7)',
  backdropFilter: 'blur(24px) saturate(1.2)',
  WebkitBackdropFilter: 'blur(24px) saturate(1.2)',
};

interface DiscoverSkillCardProps {
  item: CuratedListItem;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

function DiscoverSkillCard({
  item,
  isExpanded,
  onToggleExpand,
}: DiscoverSkillCardProps) {
  const displayCategories = getDisplayCategories(item.categories);
  const tribe = getSkillTribe(item.categories);

  return (
    <div
      className="relative rounded-[20px] overflow-hidden p-4 desktop:p-5 flex flex-col gap-2.5 w-full transition-all duration-200"
      style={{
        ...glassCardStyle,
        boxShadow: isExpanded
          ? '0 4px 20px rgba(100,80,150,0.1), inset 0 1px 0 rgba(255,255,255,0.7)'
          : glassCardStyle.boxShadow,
      }}
    >
      {/* Row 1: Name + Action */}
      <div className="flex items-start justify-between gap-3">
        <div
          className="flex flex-col gap-1 min-w-0 flex-1 cursor-pointer"
          onClick={onToggleExpand}
        >
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-serif font-bold text-base text-[#393f49] leading-none">
              {item.name}
            </p>
            {item.autoScore != null && item.autoScore > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-700 rounded-md text-xs font-['Outfit'] font-medium">
                <BloomIcon size={14} className="text-purple-600" />
                <span>{item.autoScore}</span>
              </span>
            )}
            {/* Tribe badge */}
            <span
              className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-['Outfit'] font-medium"
              style={{
                background: 'rgba(196,164,108,0.12)',
                color: '#c4a46c',
              }}
            >
              {tribe.name}
            </span>
          </div>
          <p
            className={`font-['Outfit'] text-xs text-[#696f8c] leading-[1.4] ${isExpanded ? '' : 'line-clamp-2'}`}
          >
            {item.description}
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-1.5">
          {item.url ? (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl font-['Outfit'] font-semibold text-xs transition-opacity hover:opacity-90 shadow-[0px_1px_1px_0.05px_rgba(24,24,27,0.24)]"
              style={{
                background: 'linear-gradient(to right, #c4a46c, #d4b87c)',
                color: '#fff',
              }}
            >
              <svg
                className="w-3.5 h-3.5"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path
                  d="M6 3H3v10h10v-3M9 3h4v4M14 2L7 9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              View Source
            </a>
          ) : (
            <span className="inline-flex items-center px-3 py-1.5 rounded-xl bg-gray-100 font-['Outfit'] font-semibold text-xs text-[#9ca3af]">
              No link
            </span>
          )}
        </div>
      </div>

      {/* Row 2: Stats + expand hint */}
      <div
        className="flex items-center gap-2 flex-wrap font-['Outfit'] text-xs cursor-pointer"
        onClick={onToggleExpand}
      >
        {item.downloads > 0 && (
          <span className="inline-flex items-center gap-1 text-[#9ca3af]">
            <svg className="w-3 h-3" viewBox="0 0 16 16" fill="currentColor">
              <path d="M2.75 14A1.75 1.75 0 0 1 1 12.25v-2.5a.75.75 0 0 1 1.5 0v2.5c0 .138.112.25.25.25h10.5a.25.25 0 0 0 .25-.25v-2.5a.75.75 0 0 1 1.5 0v2.5A1.75 1.75 0 0 1 13.25 14ZM7.25 7.689V2a.75.75 0 0 1 1.5 0v5.689l1.97-1.969a.749.749 0 1 1 1.06 1.06l-3.25 3.25a.749.749 0 0 1-1.06 0L4.22 6.78a.749.749 0 1 1 1.06-1.06l1.97 1.969Z" />
            </svg>
            {formatNumber(item.downloads)}
          </span>
        )}
        {item.stars > 0 && (
          <span className="inline-flex items-center gap-1 text-[#9ca3af]">
            <svg className="w-3 h-3" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25z" />
            </svg>
            {formatNumber(item.stars)}
          </span>
        )}
        {item.matchScore != null && item.matchScore > 0 && (
          <span className="text-[#8b5cf6] font-medium">
            {item.matchScore}% match
          </span>
        )}
        <svg
          className="size-5 ml-auto shrink-0"
          viewBox="0 0 20 20"
          fill="#c4a46c"
        >
          <path
            d={
              isExpanded
                ? 'M10 7.5L14 12.5H6L10 7.5Z'
                : 'M10 12.5L14 7.5H6L10 12.5Z'
            }
          />
        </svg>
      </div>

      {/* Expanded section */}
      {isExpanded && (
        <div className="pt-2 border-t border-[#c4a46c]/20 flex flex-col gap-3">
          {/* Categories */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {displayCategories.map((cat) => (
              <span
                key={cat}
                className="px-2 py-0.5 rounded-md font-['Outfit'] text-[11px] font-medium"
                style={{
                  background: 'rgba(196,164,108,0.10)',
                  color: '#c4a46c',
                }}
              >
                {cat}
              </span>
            ))}
          </div>

          {/* Source link */}
          {item.url && (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-['Outfit'] text-xs hover:underline w-fit"
              style={{ color: '#c4a46c' }}
            >
              <svg
                className="w-3.5 h-3.5"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path
                  d="M6 3H3v10h10v-3M9 3h4v4M14 2L7 9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              View source
            </a>
          )}
        </div>
      )}
    </div>
  );
}

interface DiscoverPageClientProps {
  listId: string;
  initialData: CuratedList;
}

export default function DiscoverPageClient({
  listId,
  initialData,
}: DiscoverPageClientProps) {
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);

  // Suppress unused variable warning — listId is part of the page route contract
  void listId;

  return (
    <div className="w-full max-w-2xl mx-auto py-8 desktop:py-12 px-4 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1
          className="font-serif text-2xl desktop:text-3xl font-bold"
          style={{ color: '#1a1228' }}
        >
          Skills picked for you
        </h1>
        <p className="font-['Outfit'] text-sm text-[#696f8c]">
          {initialData.context} &middot; {initialData.items.length} skills
        </p>
      </div>

      {/* Skill cards */}
      <div className="flex flex-col gap-3">
        {initialData.items.map((item) => (
          <DiscoverSkillCard
            key={item.slug}
            item={item}
            isExpanded={expandedSlug === item.slug}
            onToggleExpand={() =>
              setExpandedSlug((prev) =>
                prev === item.slug ? null : item.slug,
              )
            }
          />
        ))}
      </div>

      {/* Engagement hooks */}
      <div className="flex flex-col gap-4 pt-4">
        {/* Join tribe CTA */}
        <Link
          href="/tribes"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-['Outfit'] font-semibold text-sm text-white transition-opacity hover:opacity-90 shadow-[0px_1px_1px_0.05px_rgba(24,24,27,0.24)]"
          style={{
            background: 'linear-gradient(to right, #c4a46c, #d4b87c)',
          }}
        >
          Explore the Tribes
        </Link>

        {/* Get identity CTA */}
        <div className="text-center flex flex-col items-center gap-1.5">
          <p className="text-sm text-gray-500 font-['Outfit']">
            Want personalized recommendations?
          </p>
          <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
            clawhub install bloom-discovery
          </code>
        </div>

        <p className="text-center font-['Outfit'] text-[11px] text-[#b0b5c0]">
          Powered by Bloom Protocol
        </p>
      </div>
    </div>
  );
}
