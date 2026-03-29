'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/context/AuthContext';
import projectService, { ProjectListResponse, ProjectStatus } from '@/lib/api/services/projectService';

interface UseProjectsWithAuthOptions {
  page: number;
  limit: number;
  status: 'all' | ProjectStatus;
}

export function useProjectsWithAuth(options: UseProjectsWithAuthOptions) {
  const { user } = useAuth();
  
  // Build query key - React Query will automatically refetch when userId changes
  const queryKey = ['projects', {
    page: options.page,
    limit: options.limit,
    status: options.status,
    ...(user ? { userId: user.uid } : {})
  }];

  const query = useQuery<ProjectListResponse>({
    queryKey,
    queryFn: async () => {
      const params = {
        page: options.page,
        limit: options.limit,
        ...(options.status !== 'all' && { status: options.status }),
        ...(user && { userId: user.uid })
      };
      
      return await projectService.getProjectList(params);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // No useEffect listening to user changes!
  // React Query handles refetching automatically when queryKey changes

  return {
    ...query,
    queryKey, // Expose for testing
  };
}