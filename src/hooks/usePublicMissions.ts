import { useQuery, UseQueryResult } from '@tanstack/react-query';
import profileService from '@/lib/api/services/profileService';
import { logger } from '@/lib/utils/logger';

interface PublicMission {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  status: string;
  startTime: string;
  endTime: string;
  rewards: Array<{
    name: string;
    type: string;
    amount: number | null;
    icon: string | null;
  }>;
  taskCount: number;
  completedCount: number;
}

interface UsePublicMissionsOptions {
  status?: string;
  staleTime?: number;
  gcTime?: number;
}

type UsePublicMissionsReturn = UseQueryResult<PublicMission[], Error> & {
  queryKey: (string | Record<string, unknown>)[];
};

export function usePublicMissions(
  options?: UsePublicMissionsOptions
): UsePublicMissionsReturn {
  const { status = 'live', staleTime, gcTime } = options || {};
  const queryKey = ['publicMissions', 'navigation', { status }];
  
  const query = useQuery<PublicMission[], Error>({
    queryKey,
    queryFn: async () => {
      try {
        const result = await profileService.getPublicMissions({ status });
        return result.missions || [];
      } catch (error) {
        logger.error('Failed to fetch missions list for navigation', { error });
        return [];
      }
    },
    staleTime: staleTime ?? 5 * 60 * 1000, // 5 minutes
    gcTime: gcTime ?? 10 * 60 * 1000, // 10 minutes
  });

  return {
    ...query,
    queryKey
  };
}