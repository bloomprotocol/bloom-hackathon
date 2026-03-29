import { apiGet, apiPost } from '../apiConfig';
import type { Tribe } from '@/constants/tribe-definitions';

export interface TribesListResponse {
  success: boolean;
  data: Tribe[];
  statusCode: number;
}

export interface TribeDetailResponse {
  success: boolean;
  data: Tribe;
  statusCode: number;
}

export interface JoinTribeResponse {
  success: boolean;
  data: { joined: boolean; tribeId: string; sbtStatus: string };
  statusCode: number;
}

export interface TribeMembership {
  id: string;
  tribeId: string;
  userId: string;
  joinedAt: string;
  sbtStatus?: 'pending' | 'minting' | 'minted' | 'failed' | null;
  walletAddress?: string | null;
  sbtTokenId?: string | null;
  sbtTxHash?: string | null;
}

export interface MyTribesResponse {
  success: boolean;
  data: TribeMembership[];
  statusCode: number;
}

// ── Posts / Feed ──

export interface TribePost {
  id: string;
  tribeId: string;
  authorId: string;
  content: string;
  tag: string;
  ref?: string | null;
  playbookRef?: string | null;
  avgRating: number;
  ratingCount: number;
  citations: number;
  created_at: string;
}

export interface TribePostsResponse {
  success: boolean;
  data: { posts: TribePost[]; total: number; page: number; limit: number };
  statusCode: number;
}

export interface CreatePostData {
  content: string;
  tag: string;
  ref?: string;
  playbookRef?: string;
}

export interface CreatePostResponse {
  success: boolean;
  data: TribePost;
  statusCode: number;
}

// ── Playbooks ──

export interface TribePlaybookResponse {
  success: boolean;
  data: Array<{
    id: string;
    tribeId: string;
    title: string;
    desc?: string;
    type: string;
    status: string;
    score?: number;
  }>;
  statusCode: number;
}

// ── Activity ──

export interface TribeActivityResponse {
  success: boolean;
  data: Array<{
    id: string;
    tribeId: string;
    type: string;
    agent: string;
    detail?: string;
    timestamp: string;
  }>;
  statusCode: number;
}

export const tribeService = {
  getTribes: () => apiGet<TribesListResponse>('/tribes'),

  getTribeById: (id: string) =>
    apiGet<TribeDetailResponse>(`/tribes/${encodeURIComponent(id)}`),

  joinTribe: (id: string, data?: { message?: string; walletAddress?: string }) =>
    apiPost<JoinTribeResponse>(`/tribes/${encodeURIComponent(id)}/join`, data),

  getMyTribes: () => apiGet<MyTribesResponse>('/tribes/my-tribes'),

  // Feed
  getPosts: (slug: string, params?: { page?: number; limit?: number; tag?: string; sort?: string }) => {
    const qs = new URLSearchParams();
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    if (params?.tag) qs.set('tag', params.tag);
    if (params?.sort) qs.set('sort', params.sort);
    const query = qs.toString();
    return apiGet<TribePostsResponse>(`/tribes/${encodeURIComponent(slug)}/posts${query ? `?${query}` : ''}`);
  },

  createPost: (slug: string, data: CreatePostData) =>
    apiPost<CreatePostResponse>(`/tribes/${encodeURIComponent(slug)}/posts`, data),

  // Playbooks
  getPlaybooks: (slug: string) =>
    apiGet<TribePlaybookResponse>(`/tribes/${encodeURIComponent(slug)}/playbooks`),

  // Activity
  getActivity: (slug: string, limit = 20) =>
    apiGet<TribeActivityResponse>(`/tribes/${encodeURIComponent(slug)}/activity?limit=${limit}`),
};
