import { useQuery } from '@tanstack/react-query';
import { v4UseCaseService } from '@/lib/api/services/v4UseCaseService';
import { useAuth } from '@/lib/context/AuthContext';

export function useUserClaims() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ['my-claims'],
    queryFn: async () => {
      const res = await v4UseCaseService.getUserClaims();
      return res?.data?.claims ?? [];
    },
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}
