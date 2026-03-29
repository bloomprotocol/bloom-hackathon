import { useQuery } from '@tanstack/react-query';
import { contextService } from '@/lib/api/services/contextService';
import type { KnowledgeEntry, KnowledgeStats, TribeContext } from '@/constants/context-engine-types';
import {
  STUB_KNOWLEDGE_ENTRIES,
  STUB_KNOWLEDGE_STATS,
  STUB_TRIBE_CONTEXT,
} from '@/constants/context-engine-mock-data';

/**
 * Fetch knowledge feed entries for a tribe.
 * Falls back to stub data when API is unavailable.
 */
export function useTribeKnowledge(tribeId: string, role?: string, sort?: 'recent' | 'cited' | 'confirmed') {
  return useQuery<KnowledgeEntry[]>({
    queryKey: ['knowledge', tribeId, role, sort],
    queryFn: async () => {
      try {
        const res = await contextService.getKnowledgeFeed(tribeId, {
          role: role && role !== 'all' ? role : undefined,
          sort,
        });
        // Trust the API response, even if empty
        if (Array.isArray(res.data)) {
          return res.data;
        }
      } catch {
        // Only fall back to stubs on network/connection errors
      }
      let entries = STUB_KNOWLEDGE_ENTRIES[tribeId] ?? [];
      if (role && role !== 'all') {
        entries = entries.filter((e) => e.role === role);
      }
      if (sort === 'cited') {
        entries = [...entries].sort((a, b) => b.cited - a.cited);
      } else if (sort === 'confirmed') {
        entries = [...entries].sort((a, b) => b.confirmedBy - a.confirmedBy);
      }
      return entries;
    },
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Fetch knowledge stats for a tribe.
 * Falls back to stub data when API is unavailable.
 */
export function useKnowledgeStats(tribeId: string) {
  return useQuery<KnowledgeStats>({
    queryKey: ['knowledgeStats', tribeId],
    queryFn: async () => {
      try {
        const res = await contextService.getKnowledgeStats(tribeId);
        if (res.data) {
          return res.data;
        }
      } catch {
        // Fall back to stubs on network/connection errors
      }
      return STUB_KNOWLEDGE_STATS[tribeId] ?? {
        totalInsights: 0,
        totalAgents: 0,
        totalCitations: 0,
        lastUpdated: new Date().toISOString(),
        byRole: {},
        byType: { evaluation_insight: 0, reflection: 0, discovery: 0, pattern: 0 },
      };
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch raw tribe context (for debug/preview).
 * Falls back to stub data when API is unavailable.
 */
export function useTribeContext(tribeId: string, topic?: string) {
  return useQuery<TribeContext>({
    queryKey: ['tribeContext', tribeId, topic],
    queryFn: async () => {
      try {
        const res = await contextService.getTribeContext(tribeId, { topic });
        if (res.data) {
          return res.data;
        }
      } catch {
        // Fall back to stubs on network/connection errors
      }
      return STUB_TRIBE_CONTEXT[tribeId] ?? {
        tribeId,
        generatedAt: new Date().toISOString(),
        tokenEstimate: 0,
        episodic: [],
        semantic: [],
        roleHints: {},
        skillRegistry: [],
      };
    },
    staleTime: 2 * 60 * 1000,
  });
}
