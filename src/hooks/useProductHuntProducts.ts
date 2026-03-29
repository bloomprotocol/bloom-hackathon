import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api/apiConfig';

export interface ProductHuntProduct {
  name: string;
  tagline: string;
  website: string;
  votesCount: number;
  thumbnailUrl: string;
  date: string;
  categories: string[];
  mainCategory: string;  // Main category from API (e.g., "wellness", "ai-tools")
  projectId: string;  // 唯一標識符，格式：{date}_{index}
}

export interface ProductHuntParams {
  page?: number;
  limit?: number;
  sortBy?: 'date' | 'votes';
  category?: string;
}

export interface ProductHuntResponse {
  success: boolean;
  data: {
    projects: ProductHuntProduct[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
  statusCode: number;
}

export function useProductHuntProducts(params: ProductHuntParams = {}) {
  const {
    page = 1,
    limit = 20,
    sortBy = 'date',
    category,
  } = params;

  return useQuery<ProductHuntResponse>({
    queryKey: ['product-hunt-products', { page, limit, sortBy, category }],
    queryFn: async () => {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
      });

      if (category) {
        queryParams.append('category', category);
      }

      const response = await apiGet<ProductHuntResponse>(`/product-hunt/products?${queryParams}`);
      return response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}