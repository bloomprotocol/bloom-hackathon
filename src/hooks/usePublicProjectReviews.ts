import { useInfiniteQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api/apiConfig';
import { PublicProjectReviewsParams, PublicProjectReviewsResponse } from '@/lib/api/services/projectService';

interface UsePublicProjectReviewsParams extends PublicProjectReviewsParams {
  limit?: number;
}

export function usePublicProjectReviews({
  slug,
  sort = 'recent',
  limit = 20,
}: UsePublicProjectReviewsParams) {
  const result = useInfiniteQuery<PublicProjectReviewsResponse>({
    queryKey: ['public-project-reviews', slug, { sort, limit }],
    queryFn: async ({ pageParam }) => {
      const page = pageParam as number;
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sort,
      });

      const response = await apiGet<PublicProjectReviewsResponse>(
        `/public/project/${slug}/reviews?${queryParams}`
      );
      return response;
    },
    getNextPageParam: (lastPage) => {
      // Handle case where data might be null or undefined
      if (!lastPage?.data?.pagination) {
        return undefined;
      }
      const { pagination } = lastPage.data;
      return pagination.hasMore ? pagination.page + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: !!slug,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  // Flatten all reviews from all pages
  const reviews = result.data?.pages.flatMap(page => page?.data?.reviews || []) || [];
  const total = result.data?.pages[0]?.data?.pagination?.total || 0;

  return {
    reviews,
    total,
    hasMore: result.hasNextPage || false,
    loadMore: result.fetchNextPage,
    isLoading: result.isLoading,
    isFetchingNextPage: result.isFetchingNextPage,
    error: result.error,
    refetch: result.refetch,
  };
}