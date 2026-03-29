import { apiGet, apiPost } from '../apiConfig';

// Skill catalog entry from the backend
export interface Skill {
  slug: string;
  name: string;
  description: string;
  url: string;
  source: string;
  type: string;
  downloads: number;
  stars: number;
  githubVerified: boolean;
  creator: string;
  author?: {
    name?: string;
    avatarUrl?: string;
    githubUsername: string;
    xHandle?: string;
  };
  categories: string[];
  language?: string;
  status: string;
  autoScore: number;
  discoveredAt: string;
  publishedAt?: string;
  updatedAt: string;
  backingStats?: {
    totalUsdc: number;
    backerCount: number;
    agentReferredCount?: number;
    directCount?: number;
  };
}

export interface SkillsListResponse {
  success: boolean;
  data: {
    skills: Skill[];
    total: number;
  };
  statusCode: number;
}

export interface SkillCategoriesResponse {
  success: boolean;
  data: {
    categories: Array<{ name: string; count: number }>;
  };
  statusCode: number;
}

export interface SkillRecommendationsResponse {
  success: boolean;
  data: Skill[];
  statusCode: number;
}

export interface BackingResponse {
  success: boolean;
  data: {
    success: boolean;
    backing?: {
      slug: string;
      userId: string;
      txHash: string;
      amount: number;
      chain: string;
      createdAt: string;
    };
  };
  statusCode: number;
}

export interface BatchBackingResponse {
  success: boolean;
  data: {
    success: boolean;
    backings?: Array<{
      slug: string;
      userId: string;
      txHash: string;
      amount: number;
      chain: string;
      createdAt: string;
    }>;
    error?: string;
  };
  statusCode: number;
}

export interface CuratedListItem {
  slug: string;
  name: string;
  description: string;
  url: string;
  categories: string[];
  stars: number;
  downloads: number;
  autoScore?: number;
  matchScore?: number;
}

export interface CuratedList {
  listId: string;
  agentUserId: number;
  personalityType: string;
  context: string;
  items: CuratedListItem[];
  status: 'active' | 'completed';
  createdAt: string;
  expiresAt: string;
}

export interface CuratedListResponse {
  success: boolean;
  data: CuratedList;
  statusCode: number;
}

export interface SkillsListParams {
  category?: string;
  search?: string;
  sort?: string;
  featured?: boolean;
  rising?: boolean;
  limit?: number;
  offset?: number;
}

export const skillService = {
  /**
   * Get approved skills with optional filters.
   */
  getSkills: async (params?: SkillsListParams) => {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append('category', params.category);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.sort) queryParams.append('sort', params.sort);
    if (params?.featured) queryParams.append('featured', 'true');
    if (params?.rising) queryParams.append('rising', 'true');
    if (params?.limit) queryParams.append('limit', String(params.limit));
    if (params?.offset) queryParams.append('offset', String(params.offset));

    const qs = queryParams.toString();
    return apiGet<SkillsListResponse>(`/skills${qs ? '?' + qs : ''}`);
  },

  /**
   * Get skill categories with counts.
   */
  getSkillCategories: async () => {
    return apiGet<SkillCategoriesResponse>('/skills/categories');
  },

  /**
   * Get agent-recommended skills based on user's Identity Card.
   */
  getAgentRecommendations: async (categories: string[]) => {
    return apiGet<SkillRecommendationsResponse>(
      `/skills/recommend?categories=${categories.join(',')}`
    );
  },

  /**
   * Record a backing after successful on-chain USDC transfer (legacy single-skill).
   */
  recordBacking: async (
    slug: string,
    txHash: string,
    amount: number = 1.0,
    chain: 'base' | 'solana' = 'base',
  ) => {
    return apiPost<BackingResponse>(`/skills/${slug}/back`, {
      txHash,
      chain,
      amount,
    });
  },

  /**
   * Record a batch of backings in one call after escrow deposit.
   */
  recordBackingBatch: async (
    txHash: string,
    items: { slug: string; amount: number }[],
    source?: 'agent-referral' | 'direct',
    curatedListId?: string,
    chain: 'base' | 'solana' = 'base',
  ) => {
    return apiPost<BatchBackingResponse>('/skills/back-batch', {
      txHash,
      items,
      source,
      curatedListId,
      chain,
    });
  },

  /**
   * Toggle upvote on a skill (requires auth).
   */
  toggleUpvote: async (slug: string) => {
    return apiPost<{
      success: boolean;
      data: { voted: boolean; humanCount: number; agentCount: number };
      statusCode: number;
    }>(`/skills/${slug}/upvote`, {});
  },

  /**
   * Get a curated list by ID (public).
   */
  getCuratedList: async (listId: string) => {
    return apiGet<CuratedListResponse>(`/skills/curated-list/${listId}`);
  },
};

export default skillService;
