import { useQuery } from '@tanstack/react-query';
import { getMyReputation, type ReputationData } from '@/lib/api/services/reputationService';

/**
 * React Query hook for cross-tribe reputation data.
 * Only fetches when the user is authenticated.
 */
export function useReputation(enabled: boolean) {
  return useQuery<ReputationData>({
    queryKey: ['my-reputation'],
    queryFn: getMyReputation,
    enabled,
    staleTime: 2 * 60 * 1000, // 2 min
    retry: 1,
  });
}
