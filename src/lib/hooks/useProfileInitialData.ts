// src/lib/hooks/useProfileInitialData.ts

import { useQuery } from '@tanstack/react-query';
import { profileService, ProfileInitialDataResponse } from '@/lib/api/services/profileService';
import { logger } from '@/lib/utils/logger';
import { useAuth } from '@/lib/context/AuthContext';

/**
* Hook for fetching profile initial data
*/
export const useProfileInitialData = () => {
 const { isAuthenticated } = useAuth();
 
 const { 
   data: dashboardData,
   isLoading, 
   error,
   refetch 
 } = useQuery<ProfileInitialDataResponse>({
   queryKey: ['profileInitialData'],
   queryFn: async () => {
     try {
       const data = await profileService.getInitialData();
       return data;
     } catch (error) {
       logger.error('Failed to fetch profile initial data', { error });
       throw error;
     }
   },
   enabled: isAuthenticated,
   staleTime: 5 * 60 * 1000, // 5 minutes
 });

 return {
   dashboardData,
   isLoading,
   error,
   refetch
 };
};

export default useProfileInitialData;