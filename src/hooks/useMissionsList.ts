import { useQuery } from '@tanstack/react-query';
import profileService from '@/lib/api/services/profileService';

export interface MissionListItem {
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

export interface MissionsListResponse {
  missions: MissionListItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Hook to fetch public missions list
 * Used in mission sidebar to show other available missions
 */
export function useMissionsList(status: string = 'live') {
  return useQuery<MissionsListResponse>({
    queryKey: ['publicMissions', status],
    queryFn: async () => {
      const result = await profileService.getPublicMissions({ status });
      return result as MissionsListResponse;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });
}