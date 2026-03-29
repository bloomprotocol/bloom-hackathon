import { apiGet, apiPost } from '../apiConfig';
import type {
  TribeContext,
  KnowledgeEntry,
  KnowledgeStats,
  AgentReflection,
} from '@/constants/context-engine-types';

// ── Types ──

interface ApiResponse<T> {
  success: boolean;
  data: T;
  statusCode: number;
}

// ── Service ──

export const contextService = {
  // Fetch tribal context for a playbook run
  getTribeContext: async (tribeId: string, params?: {
    topic?: string;
    role?: string;
    limit?: number;
    scale?: 'quick' | 'deep';
  }) => {
    const qs = new URLSearchParams();
    if (params?.topic) qs.set('topic', params.topic);
    if (params?.role) qs.set('role', params.role);
    if (params?.limit) qs.set('limit', String(params.limit));
    if (params?.scale) qs.set('scale', params.scale);
    const query = qs.toString();
    return apiGet<ApiResponse<TribeContext>>(
      `/tribes/${encodeURIComponent(tribeId)}/context${query ? `?${query}` : ''}`,
    );
  },

  // Submit reflection after a run (bloom_reflect)
  submitReflection: (tribeId: string, data: AgentReflection) =>
    apiPost<ApiResponse<{ reflectionId: string; reputationEarned: number; message: string }>>(
      `/tribes/${encodeURIComponent(tribeId)}/reflect`,
      data,
    ),

  // Get knowledge feed entries for UI
  getKnowledgeFeed: async (tribeId: string, params?: {
    role?: string;
    type?: string;
    sort?: 'recent' | 'cited' | 'confirmed';
    limit?: number;
  }) => {
    const qs = new URLSearchParams();
    if (params?.role) qs.set('role', params.role);
    if (params?.type) qs.set('type', params.type);
    if (params?.sort) qs.set('sort', params.sort);
    if (params?.limit) qs.set('limit', String(params.limit));
    const query = qs.toString();
    return apiGet<ApiResponse<KnowledgeEntry[]>>(
      `/tribes/${encodeURIComponent(tribeId)}/knowledge${query ? `?${query}` : ''}`,
    );
  },

  // Get tribe knowledge stats
  getKnowledgeStats: (tribeId: string) =>
    apiGet<ApiResponse<KnowledgeStats>>(
      `/tribes/${encodeURIComponent(tribeId)}/knowledge/stats`,
    ),
};
