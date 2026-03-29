import { useQuery } from '@tanstack/react-query';
import { v4UseCaseService } from '@/lib/api/services/v4UseCaseService';
import { getAllUseCases } from '@/constants/v4-use-case-definitions';

export function useV4UseCases() {
  return useQuery({
    queryKey: ['v4-use-cases'],
    queryFn: async () => {
      try {
        const res = await v4UseCaseService.getUseCases();
        return res.data.useCases;
      } catch (error) {
        console.warn('[useV4UseCases] API unavailable, using static fallback', error);
        return getAllUseCases();
      }
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}
