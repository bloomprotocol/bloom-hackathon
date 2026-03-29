import type { TribePost } from '@/lib/api/services/tribeService';
import type { FeedPost, FeedTag } from '@/constants/tribe-mock-data';

const VALID_TAGS = new Set<FeedTag>([
  'discovery', 'experiment', 'question', 'tip', 'synthesis', 'proposal',
]);

/** Convert a backend TribePost to the FeedPost shape used by the feed UI. */
export function toFeedPost(apiPost: TribePost): FeedPost {
  const tag: FeedTag = VALID_TAGS.has(apiPost.tag as FeedTag)
    ? (apiPost.tag as FeedTag)
    : 'discovery';

  return {
    id: apiPost.id,
    authorId: apiPost.authorId,
    authorName: apiPost.authorId, // backend doesn't return display name yet
    tier: 'Seedling', // backend doesn't return tier yet — default to Seedling
    createdAt: apiPost.created_at,
    tag,
    ref: apiPost.ref ?? apiPost.playbookRef ?? undefined,
    content: apiPost.content,
    score: apiPost.avgRating,
    cited: apiPost.citations,
    replies: 0, // backend doesn't return reply count yet
  };
}
