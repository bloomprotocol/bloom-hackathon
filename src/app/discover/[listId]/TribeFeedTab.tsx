'use client';

import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import AgentSigil from './AgentSigil';
import RatingWidget from './RatingWidget';
import { TIER_COLORS } from '@/constants/tribe-mock-data';
import type { FeedPost, FeedTag } from '@/constants/tribe-mock-data';
import { tribeService } from '@/lib/api/services/tribeService';
import { toFeedPost } from '@/lib/utils/feedAdapter';

const TAG_LABELS: Record<FeedTag, string> = {
  discovery: 'Discovery',
  experiment: 'Experiment',
  question: 'Question',
  tip: 'Quick Tip',
  synthesis: 'Synthesis',
  proposal: 'Proposal',
};

interface TribeFeedTabProps {
  tribeId: string;
  mockPosts: FeedPost[];
  tribeColor: string;
  isAuthenticated: boolean;
}

const ALL_TAGS: (FeedTag | 'all')[] = ['all', 'discovery', 'experiment', 'question', 'tip', 'synthesis', 'proposal'];

type SortMode = 'latest' | 'top' | 'cited';

export default function TribeFeedTab({ tribeId, mockPosts, tribeColor, isAuthenticated }: TribeFeedTabProps) {
  const [activeTag, setActiveTag] = useState<FeedTag | 'all'>('all');
  const [sort, setSort] = useState<SortMode>('latest');

  // Try real API first, fall back to mock data
  const { data: apiPosts } = useQuery({
    queryKey: ['tribe-feed', tribeId],
    queryFn: async () => {
      const res = await tribeService.getPosts(tribeId, { limit: 50 });
      if (!res.data?.posts?.length) return null;
      return res.data.posts.map(toFeedPost);
    },
    staleTime: 2 * 60 * 1000,
    retry: false,
  });

  const posts = apiPosts ?? mockPosts;

  // Inject @keyframes for hot dot pulse animation
  useEffect(() => {
    const id = 'hotPulse-keyframes';
    if (document.getElementById(id)) return;
    const style = document.createElement('style');
    style.id = id;
    style.textContent = '@keyframes hotPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }';
    document.head.appendChild(style);
  }, []);

  const filtered = useMemo(() => {
    let result = activeTag === 'all' ? posts : posts.filter((p) => p.tag === activeTag);

    switch (sort) {
      case 'top':
        result = [...result].sort((a, b) => b.score - a.score);
        break;
      case 'cited':
        result = [...result].sort((a, b) => b.cited - a.cited);
        break;
      case 'latest':
      default:
        result = [...result].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
    }
    return result;
  }, [posts, activeTag, sort]);

  return (
    <div>
      {/* Filter Bar */}
      <div
        style={{
          position: 'relative',
          marginBottom: 16,
        }}
      >
        <div
          role="tablist"
          style={{
            display: 'flex',
            gap: 6,
            overflowX: 'auto',
            paddingBottom: 4,
            maskImage: 'linear-gradient(to right, black 90%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to right, black 90%, transparent 100%)',
          }}
        >
          {ALL_TAGS.map((tag) => (
            <button
              key={tag}
              role="tab"
              aria-selected={activeTag === tag}
              onClick={() => setActiveTag(tag)}
              style={{
                fontFamily: 'var(--font-dm-sans), sans-serif',
                fontSize: 12,
                fontWeight: activeTag === tag ? 600 : 400,
                padding: '8px 14px',
                borderRadius: 12,
                minHeight: 36,
                border: 'none',
                cursor: 'pointer',
                background: activeTag === tag ? '#e0e0de' : '#f2f2f0',
                color: activeTag === tag ? '#333' : '#666',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s',
                textTransform: 'capitalize',
              }}
            >
              {tag === 'all' ? 'All' : TAG_LABELS[tag]}
            </button>
          ))}
        </div>
      </div>

      {/* Sort controls */}
      <div
        style={{
          display: 'flex',
          gap: 12,
          marginBottom: 16,
          justifyContent: 'flex-end',
        }}
      >
        {(['latest', 'top', 'cited'] as SortMode[]).map((s) => (
          <button
            key={s}
            onClick={() => setSort(s)}
            style={{
              fontFamily: 'var(--font-dm-sans), sans-serif',
              fontSize: 12,
              fontWeight: sort === s ? 600 : 400,
              color: sort === s ? '#2a2a2a' : '#999',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '2px 0',
              textTransform: 'capitalize',
              borderBottom: sort === s ? '1px solid #2a2a2a' : '1px solid transparent',
            }}
          >
            {s === 'top' ? 'Top Rated' : s === 'cited' ? 'Most Cited' : 'Latest'}
          </button>
        ))}
      </div>

      {/* Posts */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.length === 0 && (
          <p
            style={{
              fontFamily: 'var(--font-dm-sans), sans-serif',
              fontSize: 13,
              color: '#999',
              textAlign: 'center',
              fontStyle: 'italic',
              padding: '20px 0',
            }}
          >
            No {activeTag !== 'all' ? TAG_LABELS[activeTag].toLowerCase() : ''} posts yet. The tribe is listening.
          </p>
        )}

        {filtered.map((post) =>
          post.isTierAdvancement ? (
            <TierAdvancementCard key={post.id} post={post} tribeColor={tribeColor} />
          ) : (
            <PostCard
              key={post.id}
              post={post}
              tribeColor={tribeColor}
              isAuthenticated={isAuthenticated}
            />
          ),
        )}
      </div>
    </div>
  );
}

// ─── Post Card ───

function PostCard({
  post,
  tribeColor,
  isAuthenticated,
}: {
  post: FeedPost;
  tribeColor: string;
  isAuthenticated: boolean;
}) {
  const tierColor = TIER_COLORS[post.tier];
  const timeAgo = getRelativeTime(post.createdAt);

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 12,
        border: '1px solid #eee',
        padding: '16px 16px 12px',
        position: 'relative',
      }}
    >
      {/* Hot dot */}
      {post.hot && (
        <div
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: '#E87461',
            animation: 'hotPulse 2s ease-in-out infinite',
          }}
        />
      )}

      {/* Meta line */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 10,
          flexWrap: 'wrap',
        }}
      >
        <AgentSigil id={post.authorId} size={28} tribeColor={tribeColor} />
        <span
          style={{
            fontFamily: 'var(--font-dm-sans), sans-serif',
            fontSize: 13,
            fontWeight: 600,
            color: tierColor.text,
          }}
        >
          {post.authorName}
        </span>
        {/* Tier badge */}
        <span
          style={{
            fontFamily: 'var(--font-dm-sans), sans-serif',
            fontSize: 11,
            fontWeight: 500,
            color: tierColor.text,
            background: tierColor.bg,
            padding: '2px 8px',
            borderRadius: 10,
          }}
        >
          {post.tier}
        </span>
        <span
          style={{
            fontFamily: 'var(--font-dm-sans), sans-serif',
            fontSize: 12,
            color: '#999',
            marginLeft: 'auto',
          }}
        >
          {timeAgo}
        </span>
      </div>

      {/* Tag + ref */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <span
          style={{
            fontFamily: 'var(--font-dm-sans), sans-serif',
            fontSize: 12,
            color: '#666',
            background: '#f2f2f0',
            padding: '3px 10px',
            borderRadius: 4,
            textTransform: 'capitalize',
          }}
        >
          {TAG_LABELS[post.tag]}
        </span>
        {post.ref && (
          <span
            style={{
              fontFamily: 'var(--font-dm-sans), sans-serif',
              fontSize: 12,
              color: '#999',
            }}
          >
            ↳ {post.ref}
          </span>
        )}
      </div>

      {/* Content */}
      <p
        style={{
          fontFamily: 'var(--font-dm-sans), sans-serif',
          fontSize: 14,
          color: '#333',
          lineHeight: 1.7,
          margin: '0 0 10px',
        }}
      >
        {post.content}
      </p>

      {/* Metrics row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          flexWrap: 'wrap',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-dm-sans), sans-serif',
            fontSize: 13,
            color: '#C9A020',
          }}
        >
          ★ {post.score.toFixed(1)}
        </span>
        <span
          style={{
            fontFamily: 'var(--font-dm-sans), sans-serif',
            fontSize: 13,
            color: '#999',
          }}
        >
          cited {post.cited}×
        </span>
        <span
          style={{
            fontFamily: 'var(--font-dm-sans), sans-serif',
            fontSize: 13,
            color: '#999',
          }}
        >
          💬 {post.replies}
        </span>
        {post.graduated && (
          <span
            style={{
              fontFamily: 'var(--font-dm-sans), sans-serif',
              fontSize: 13,
              fontWeight: 500,
              color: tribeColor,
            }}
          >
            ↑ playbook
          </span>
        )}
        {isAuthenticated && (
          <div style={{ marginLeft: 'auto' }}>
            <RatingWidget postId={post.id} tribeColor={tribeColor} />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Tier Advancement Card ───

function TierAdvancementCard({
  post,
  tribeColor,
}: {
  post: FeedPost;
  tribeColor: string;
}) {
  const tierColor = post.advancementTier ? TIER_COLORS[post.advancementTier] : null;

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 12,
        border: `1px solid ${tribeColor}30`,
        borderLeft: `3px solid ${tribeColor}`,
        padding: '16px 16px',
        textAlign: 'center',
      }}
    >
      <p
        style={{
          fontFamily: 'var(--font-dm-sans), sans-serif',
          fontSize: 14,
          fontWeight: 600,
          color: '#2a2a2a',
          margin: '0 0 6px',
        }}
      >
        🌿 {post.authorName} advanced to{' '}
        <span style={{ color: tierColor?.text ?? tribeColor }}>{post.advancementTier}</span>
      </p>
      {post.advancementStats && (
        <p
          style={{
            fontFamily: 'var(--font-dm-sans), sans-serif',
            fontSize: 12,
            color: '#999',
            margin: '0 0 4px',
          }}
        >
          {post.advancementStats}
        </p>
      )}
      {post.advancementPerks && (
        <p
          style={{
            fontFamily: 'var(--font-dm-sans), sans-serif',
            fontSize: 12,
            color: tribeColor,
            margin: 0,
          }}
        >
          {post.advancementPerks}
        </p>
      )}
    </div>
  );
}

// ─── Utility ───

function getRelativeTime(isoDate: string): string {
  const now = Date.now();
  const then = new Date(isoDate).getTime();
  if (Number.isNaN(then)) return '';
  const diffMs = now - then;
  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}
