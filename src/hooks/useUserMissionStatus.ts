import { useQuery, useQueryClient, UseQueryResult } from '@tanstack/react-query';
import profileService from '@/lib/api/services/profileService';
import { useAuth } from '@/lib/context/AuthContext';

interface UserMissionStatus {
  missionId: string;
  claimed: boolean;
  taskStatuses: Array<{
    taskId: string;
    completed: boolean;
    statusData: {
      status: string;
      extra: any;
      completedAt: string | null;
    } | null;
  }>;
  rewards?: Array<{
    id: number;
    name: string;
    type: string;
    amount: number | null;
    claimed: boolean;
    canClaim: boolean;
  }>;
}

interface UseUserMissionStatusOptions {
  staleTime?: number;
  gcTime?: number;
}

type UseUserMissionStatusReturn = UseQueryResult<UserMissionStatus | null, Error> & {
  queryKey: (string | Record<string, any>)[];
  invalidate: () => Promise<void>;
};

export function useUserMissionStatus(
  slug: string,
  options?: UseUserMissionStatusOptions
): UseUserMissionStatusReturn {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ['user-mission', slug, user?.uid || ''];
  
  const query = useQuery<UserMissionStatus | null, Error>({
    queryKey,
    queryFn: async () => {
      if (!user || !slug) return null;
      
      try {
        return await profileService.getUserMissionStatus(slug);
      } catch (error: any) {
        // Return null for 404 errors (user hasn't started mission)
        if (error?.response?.status === 404) {
          return null;
        }
        throw error;
      }
    },
    enabled: !!user && !!slug,
    staleTime: options?.staleTime ?? 5 * 60 * 1000, // 5 minutes
    gcTime: options?.gcTime ?? 10 * 60 * 1000, // 10 minutes
  });

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey });
  };

  return {
    ...query,
    queryKey,
    invalidate
  };
}