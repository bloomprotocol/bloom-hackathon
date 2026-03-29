import { useQuery } from '@tanstack/react-query';
import { tribeService } from '@/lib/api/services/tribeService';
import { getTribeById } from '@/constants/tribe-definitions';

export function useTribeById(id: string) {
  return useQuery({
    queryKey: ['tribe', id],
    queryFn: async () => {
      try {
        const res = await tribeService.getTribeById(id);
        // API may return 200 OK with data: null if tribe isn't in DB yet
        if (res.data) return res.data;
      } catch (error) {
        console.warn(`[useTribeById] API unavailable for ${id}, using static fallback`, error);
      }
      // Fall back to static tribe definitions
      const staticTribe = getTribeById(id);
      if (!staticTribe) throw new Error(`Tribe ${id} not found`);
      return staticTribe;
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    enabled: !!id,
  });
}
