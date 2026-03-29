import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { missionService } from '@/lib/api/services/missionService';

interface MissionDetail {
  id: string;
  title: string;
  description: string | null;
  endTime: string;
  status: 'Live' | 'Completed';
  claimed?: boolean;
  rewards: any[];
  tasks: Record<string, any[]> | any[];
  slug?: string;
  [key: string]: any;
}

interface UseMissionDetailOptions {
  staleTime?: number;
  gcTime?: number;
}

type UseMissionDetailReturn = UseQueryResult<MissionDetail | null, Error> & {
  queryKey: (string | Record<string, any>)[];
};

export function useMissionDetail(
  slug: string,
  options?: UseMissionDetailOptions
): UseMissionDetailReturn {
  const queryKey = ['mission', slug];
  
  const query = useQuery<MissionDetail | null, Error>({
    queryKey,
    queryFn: async () => {
      if (!slug) return null;
      return await missionService.getMissionBySlug(slug);
    },
    enabled: !!slug,
    staleTime: options?.staleTime ?? 5 * 60 * 1000, // 5 minutes
    gcTime: options?.gcTime ?? 10 * 60 * 1000, // 10 minutes
  });

  return {
    ...query,
    queryKey
  };
}