import { useQuery } from '@tanstack/react-query';
import { tribeService } from '@/lib/api/services/tribeService';
import { tribes } from '@/constants/tribe-definitions';

export function useTribes() {
  return useQuery({
    queryKey: ['tribes'],
    queryFn: async () => {
      try {
        const res = await tribeService.getTribes();
        return res.data;
      } catch (error) {
        console.warn('[useTribes] API unavailable, using static fallback', error);
        return tribes;
      }
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}
