import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api/apiConfig';
import { PublicProjectsParams, PublicProjectsResponse } from '@/lib/api/services/projectService';

export function usePublicProjects(params: PublicProjectsParams = {}) {
  const {
    page = 1,
    limit = 20,
    status = 'all',
    chain,
    categories,
  } = params;

  return useQuery<PublicProjectsResponse>({
    queryKey: ['public-projects', { page, limit, status, chain, categories }],
    queryFn: async () => {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        status,
      });

      if (chain) queryParams.append('chain', chain);
      if (categories) {
        if (Array.isArray(categories)) {
          queryParams.append('categories', categories.join(','));
        } else {
          queryParams.append('categories', categories);
        }
      }

      const response = await apiGet<PublicProjectsResponse>(`/public/projects?${queryParams}`);
      return response;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}