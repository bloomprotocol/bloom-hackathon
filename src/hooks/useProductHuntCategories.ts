import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api/apiConfig';

interface CategoriesResponse {
  success: boolean;
  data: {
    categories: string[];
  };
  statusCode: number;
}

export function useProductHuntCategories() {
  return useQuery<CategoriesResponse>({
    queryKey: ['product-hunt-categories'],
    queryFn: async () => {
      // Add timestamp to prevent browser caching
      const timestamp = Date.now();
      const response = await apiGet<CategoriesResponse>(`/product-hunt/categories?t=${timestamp}`);
      return response;
    },
    staleTime: 0, // Consider data stale immediately
    gcTime: 0, // Don't cache data after unmount
    refetchOnWindowFocus: true, // Refetch when user returns to window
    refetchOnMount: true, // Always refetch on mount
    refetchInterval: 30000, // Refetch every 30 seconds for real-time feel
  });
}