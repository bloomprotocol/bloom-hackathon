import { useProfileInitialData } from './useProfileInitialData';
import { ProfileInitialDataResponse } from '@/lib/api/services/profileService';

interface UserProfileState {
  // Data from React Query
  profile: ProfileInitialDataResponse | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  
  // Computed properties for easy access
  points: number;
  miniPoints: number;
  completedTaskCount: number;
  referralCode: string | null;
  totalClicks: number;
  totalReferrals: number;
}

/**
 * Hook for accessing rich user profile data from React Query
 * Use this for:
 * - Displaying points/statistics
 * - Showing mission progress
 * - Loading detailed user profile
 * - Any data that changes frequently
 * 
 * Note: This requires authentication and will return undefined data if not authenticated
 */
export const useUserProfile = (): UserProfileState => {
  const { dashboardData: profile, isLoading, error, refetch } = useProfileInitialData();

  return {
    // Raw data
    profile,
    isLoading,
    error,
    refetch,
    
    // Computed properties for convenience
    points: profile?.statistics?.totalPoints ?? 0,
    miniPoints: profile?.statistics?.miniPoints ?? 0,
    completedTaskCount: profile?.statistics?.completedTaskCount ?? 0,
    referralCode: profile?.userInfo?.referralCode ?? null,
    totalClicks: profile?.statistics?.totalClicks ?? 0,
    totalReferrals: profile?.statistics?.totalReferrals ?? 0,
  };
};

/**
 * Hook to get all missions
 */
export const useMissions = () => {
  const { profile, isLoading } = useUserProfile();
  return {
    missions: profile?.missions ?? [],
    isLoading,
  };
};

/**
 * Hook to get current missions (Live status)
 */
export const useCurrentMissions = () => {
  const { profile, isLoading } = useUserProfile();
  const currentMissions = profile?.missions?.filter(m => m.status === 'Live') ?? [];
  return {
    missions: currentMissions,
    isLoading,
  };
};

/**
 * Hook to get completed missions
 */
export const useCompletedMissions = () => {
  const { profile, isLoading } = useUserProfile();
  const completedMissions = profile?.missions?.filter(m => m.status === 'Completed') ?? [];
  return {
    missions: completedMissions,
    isLoading,
  };
};