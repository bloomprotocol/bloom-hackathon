import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api/apiConfig';
import { PublicProjectResponse } from '@/lib/api/services/projectService';

export function usePublicProject(slug: string) {
  return useQuery<PublicProjectResponse>({
    queryKey: ['public-project', slug],
    queryFn: async () => {
      const response = await apiGet<PublicProjectResponse>(`/public/project/${slug}`);
      return response;
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}