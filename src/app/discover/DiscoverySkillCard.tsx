'use client';

import { useState, useEffect, useRef } from 'react';
import type { Skill } from '@/lib/api/services/skillService';
import { BloomIcon } from './icons';

// Map backend categories → 6 display categories
const DISPLAY_MAP: Record<string, string> = {
  'Agent Framework': 'Agent OS',
  'Context Engineering': 'Agent OS',
  'MCP Ecosystem': 'Agent OS',
  'AI Tools': 'AI & Dev',
  'Development': 'AI & Dev',
  'Coding Assistant': 'AI & Dev',
  'Productivity': 'Productivity',
  'Design': 'Creative',
  'Marketing': 'Creative',
  'Crypto': 'Finance & Web3',
  'Finance': 'Finance & Web3',
  'Prediction Market': 'Finance & Web3',
  'Wellness': 'Other',
  'Education': 'Other',
  'Lifestyle': 'Other',
  'General': 'Other',
};

function getDisplayCategories(categories: string[]): string[] {
  const unique = new Set<string>();
  categories.forEach(cat => unique.add(DISPLAY_MAP[cat] || cat));
  return Array.from(unique).slice(0, 2);
}

function formatNumber(num: number): string {
  if (num >= 1000) return (num / 1000).toFixed(num >= 10000 ? 0 : 1) + 'k';
  return String(num);
}

interface DiscoverySkillCardProps {
  skill: Skill;
  voted: boolean;
  humanCount: number;
  agentCount: number;
  onVote: (slug: string) => void;
  isVoting: boolean;
}

export default function DiscoverySkillCard({
  skill,
  voted,
  humanCount,
  agentCount,
  onVote,
  isVoting,
}: DiscoverySkillCardProps) {
  const [expanded, setExpanded] = useState(false);
  const displayCategories = getDisplayCategories(skill.categories);
  const totalVotes = humanCount + agentCount;

  return (
    <div className="flex gap-3 w-full">
      {/* Left: Upvote pill — Product Hunt pattern */}
      <button
        onClick={() => onVote(skill.slug)}
        disabled={isVoting}
        className={`shrink-0 flex flex-col items-center justify-center w-[52px] rounded-xl border transition-all duration-200 ${
          voted
            ? 'bg-[#7c3aed] border-[#7c3aed] text-white'
            : 'bg-white border-[#e5e7eb] text-[#6b7280] hover:border-[#7c3aed] hover:text-[#7c3aed]'
        } ${isVoting ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
        style={{ minHeight: 64 }}
      >
        {/* Arrow SVG */}
        <svg
          width="16"
          height="10"
          viewBox="0 0 16 10"
          fill="none"
          className={voted ? 'text-white' : 'text-current'}
        >
          <path
            d="M8 0L15 9H1L8 0Z"
            fill="currentColor"
          />
        </svg>
        <span className="font-['Outfit'] font-bold text-sm leading-none mt-1">
          {totalVotes}
        </span>
      </button>

      {/* Right: Card content */}
      <div
        className="flex-1 min-w-0 rounded-[16px] p-3.5 transition-all duration-200 cursor-pointer"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(245,240,255,0.35) 100%)',
          border: '1px solid rgba(255,255,255,0.6)',
          boxShadow: '0 2px 12px rgba(100,80,150,0.06), inset 0 1px 0 rgba(255,255,255,0.7)',
          backdropFilter: 'blur(24px) saturate(1.2)',
          WebkitBackdropFilter: 'blur(24px) saturate(1.2)',
        }}
        onClick={() => setExpanded(!expanded)}
      >
        {/* Row 1: Name + Score */}
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <p className="font-serif font-bold text-[15px] text-[#393f49] leading-tight truncate">
            {skill.name}
          </p>
          {skill.autoScore > 0 && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-purple-50 text-purple-700 rounded-md text-[11px] font-['Outfit'] font-medium">
              <BloomIcon size={12} className="text-purple-600" />
              {skill.autoScore}
            </span>
          )}
        </div>

        {/* Row 2: Description */}
        <p className={`font-['Outfit'] text-xs text-[#696f8c] leading-[1.5] mb-2 ${expanded ? '' : 'line-clamp-2'}`}>
          {skill.description}
        </p>

        {/* Row 3: Stats */}
        <div className="flex items-center gap-2.5 flex-wrap font-['Outfit'] text-xs">
          {/* Stars */}
          {skill.stars > 0 && (
            <span className="inline-flex items-center gap-1 text-[#9ca3af]">
              <svg className="w-3 h-3" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25z" />
              </svg>
              {formatNumber(skill.stars)}
            </span>
          )}
          {/* Vote breakdown: human + agent SVG icons */}
          {humanCount > 0 && (
            <span className="inline-flex items-center gap-1 text-[#6b7280]">
              <svg className="w-3 h-3" viewBox="0 0 16 16" fill="currentColor">
                <path d="M10.561 8.073a6.005 6.005 0 0 1 3.432 5.142.75.75 0 1 1-1.498.07 4.5 4.5 0 0 0-8.99 0 .75.75 0 0 1-1.498-.07 6.004 6.004 0 0 1 3.431-5.142 3.999 3.999 0 1 1 5.123 0ZM10.5 5a2.5 2.5 0 1 0-5 0 2.5 2.5 0 0 0 5 0Z" />
              </svg>
              {humanCount}
            </span>
          )}
          {agentCount > 0 && (
            <span className="inline-flex items-center gap-1 text-[#8b5cf6]">
              <svg className="w-3 h-3" viewBox="0 0 16 16" fill="currentColor">
                <path d="M7.5 1.5a.5.5 0 0 1 1 0V3h2a2 2 0 0 1 2 2v1.5h1a.5.5 0 0 1 0 1h-1V9a2 2 0 0 1-2 2h-1v1.5a.5.5 0 0 1-1 0V11H5a2 2 0 0 1-2-2V7.5H2a.5.5 0 0 1 0-1h1V5a2 2 0 0 1 2-2h2.5V1.5ZM5 4.5a.5.5 0 0 0-.5.5v4a.5.5 0 0 0 .5.5h5.5a.5.5 0 0 0 .5-.5V5a.5.5 0 0 0-.5-.5H5Zm1 1.75a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5Zm3.5 0a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5Z" />
              </svg>
              {agentCount}
            </span>
          )}
          {/* Category pills */}
          {displayCategories.map((cat) => (
            <span
              key={cat}
              className="px-1.5 py-0.5 rounded font-medium text-[11px] text-[#7c3aed]"
              style={{ background: 'rgba(139,92,246,0.08)' }}
            >
              {cat}
            </span>
          ))}
        </div>

        {/* Expanded: author + source */}
        {expanded && (
          <div className="mt-3 pt-2 border-t border-purple-100/30" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 flex-wrap">
              {/* Author info */}
              {skill.author && (
                <div className="flex items-center gap-2">
                  {skill.author.avatarUrl && (
                    <img
                      src={skill.author.avatarUrl}
                      alt={skill.author.name || skill.author.githubUsername}
                      className="w-5 h-5 rounded-full"
                    />
                  )}
                  <span className="font-['Outfit'] text-xs text-[#6b7280]">
                    {skill.author.name || skill.author.githubUsername}
                  </span>
                  {skill.author.xHandle && (
                    <a
                      href={`https://x.com/${skill.author.xHandle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/5 text-[11px] font-['Outfit'] font-medium text-[#393f49] hover:bg-black/10 transition-colors"
                    >
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                      @{skill.author.xHandle}
                    </a>
                  )}
                </div>
              )}
              {/* Source link */}
              {skill.url && (
                <a
                  href={skill.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-['Outfit'] text-xs text-[#8b5cf6] hover:underline"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M6 3H3v10h10v-3M9 3h4v4M14 2L7 9" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  View source
                </a>
              )}
            </div>

            {/* X Embedded Timeline */}
            {skill.author?.xHandle && (
              <XTimeline handle={skill.author.xHandle} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/** Embedded X timeline widget — loads on expand */
function XTimeline({ handle }: { handle: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!containerRef.current || loaded) return;

    // Load X widgets.js if not already loaded
    const win = window as any;
    const loadWidget = () => {
      if (win.twttr?.widgets) {
        win.twttr.widgets.load(containerRef.current);
        setLoaded(true);
      }
    };

    if (win.twttr?.widgets) {
      loadWidget();
    } else {
      const script = document.createElement('script');
      script.src = 'https://platform.twitter.com/widgets.js';
      script.async = true;
      script.onload = loadWidget;
      document.head.appendChild(script);
    }
  }, [handle, loaded]);

  return (
    <div ref={containerRef} className="mt-3 max-h-[300px] overflow-y-auto rounded-lg">
      <a
        className="twitter-timeline"
        data-height="280"
        data-theme="light"
        data-chrome="noheader nofooter noborders transparent"
        data-tweet-limit="2"
        href={`https://twitter.com/${handle}`}
      >
        Loading posts by @{handle}...
      </a>
    </div>
  );
}
