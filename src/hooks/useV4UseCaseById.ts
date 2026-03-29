import { useQuery } from '@tanstack/react-query';
import { v4UseCaseService } from '@/lib/api/services/v4UseCaseService';
import { getUseCaseById } from '@/constants/v4-use-case-definitions';

export function useV4UseCaseById(id: string) {
  return useQuery({
    queryKey: ['v4-use-case', id],
    queryFn: async () => {
      try {
        const res = await v4UseCaseService.getUseCaseById(id);
        return res.data;
      } catch {
        // Fallback to static data when API is unavailable
        return getUseCaseById(id) ?? null;
      }
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    enabled: !!id,
  });
}
