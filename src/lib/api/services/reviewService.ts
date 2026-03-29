import { apiGet, apiPost, apiPut, apiDelete } from '../apiConfig';
import { ApiResponse } from '@/types/api';
import { logger } from '@/lib/utils/logger';

export interface Review {
  id: string;
  uid: number;
  project_id: string;
  content: string;
  parent_id: string | null;
  grand_parent_id: string | null;
  is_hidden: boolean;
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    uid: number;
    name: string;
  };
  _count?: {
    helpful_votes: number;
  };
  replies?: Review[];
  isHelpful?: boolean;
}

export interface GetReviewsParams {
  page?: number;
  limit?: number;
  sort?: 'newest' | 'most_helpful';
  includeReplies?: boolean;
}

export interface ReviewsResponse {
  reviews: Review[];
  total: number;
  page: number;
  hasMore: boolean;
}

export interface ReviewStatsResponse {
  totalReviews: number;
  distribution: {
    withReplies: number;
    withoutReplies: number;
  };
}

export interface ReviewHelpfulResponse {
  helpfulCount: number;
  isHelpful: boolean;
}

export const reviewService = {
  // Get reviews for a project
  getProjectReviews: async (projectId: string, params?: GetReviewsParams): Promise<ReviewsResponse> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.sort) queryParams.append('sort', params.sort);
      if (params?.includeReplies !== undefined) {
        queryParams.append('includeReplies', params.includeReplies.toString());
      }

      const response = await apiGet<ApiResponse<ReviewsResponse>>(
        `/projects/${projectId}/reviews${queryParams.toString() ? `?${queryParams}` : ''}`
      );
      
      // Check if response.data exists, otherwise return empty result
      if (!response || !response.data) {
        logger.warn('No data returned from getProjectReviews API', { projectId, response });
        return {
          reviews: [],
          total: 0,
          page: params?.page || 1,
          hasMore: false
        };
      }
      
      return response.data;
    } catch (error) {
      logger.error('Error fetching project reviews', { error });
      // Return empty data instead of throwing
      return {
        reviews: [],
        total: 0,
        page: params?.page || 1,
        hasMore: false
      };
    }
  },

  // Create a new review
  createReview: async (data: { projectId: string; content: string; parentId?: string }) => {
    logger.debug('ReviewService.createReview - Request payload', {
      projectId: data.projectId,
      content: data.content,
      parentId: data.parentId,
    });
    
    const requestPayload: any = {
      projectId: data.projectId,
      content: data.content,
    };
    
    // Only include parentId if it's a valid string
    if (data.parentId && typeof data.parentId === 'string' && data.parentId.trim()) {
      requestPayload.parentId = data.parentId.trim();
    }
    
    logger.debug('ReviewService.createReview - Final payload', requestPayload);
    
    const response = await apiPost<ApiResponse<Review>>('/reviews', requestPayload);
    
    logger.debug('ReviewService.createReview - Full response', { response });
    
    // The backend returns { success, statusCode, data, error }
    // apiPost already extracts response.data, so we need to get response.data
    if (response && typeof response === 'object' && 'data' in response) {
      logger.debug('ReviewService.createReview - Actual review data', { data: response.data });
      return response.data;
    }
    
    // Fallback for direct data
    logger.debug('ReviewService.createReview - Using fallback, returning full response', { response });
    return response;
  },

  // Reply to a review
  replyToReview: async (reviewId: string, content: string) => {
    const response = await apiPost<ApiResponse<Review>>(
      `/reviews/${reviewId}/reply`,
      { content }
    );
    return response.data;
  },

  // Get a specific review with replies
  getReview: async (reviewId: string) => {
    const response = await apiGet<ApiResponse<Review>>(`/reviews/${reviewId}`);
    return response.data;
  },

  // Toggle review visibility (soft delete)
  updateReviewVisibility: async (reviewId: string, isHidden: boolean) => {
    const response = await apiPut<ApiResponse<{ success: boolean }>>(
      `/reviews/${reviewId}/visibility`,
      { isHidden }
    );
    return response.data;
  },

  // Vote a review as helpful
  voteHelpful: async (reviewId: string) => {
    const response = await apiPost<ApiResponse<ReviewHelpfulResponse>>(
      `/reviews/${reviewId}/helpful`
    );
    return response.data;
  },

  // Remove helpful vote
  removeHelpfulVote: async (reviewId: string) => {
    const response = await apiDelete<ApiResponse<ReviewHelpfulResponse>>(
      `/reviews/${reviewId}/helpful`
    );
    return response.data;
  },

  // Get review statistics
  getReviewStats: async (reviewId: string) => {
    const response = await apiGet<ApiResponse<{
      helpfulCount: number;
      builderHelpfulCount: number;
      replyCount: number;
    }>>(`/reviews/${reviewId}/stats`);
    return response.data;
  },

  // Get project review statistics
  getProjectReviewStats: async (projectId: string) => {
    const response = await apiGet<ApiResponse<ReviewStatsResponse>>(
      `/projects/${projectId}/review-stats`
    );
    return response.data;
  },

  // Get user's reviews (using updated /user route)
  getUserReviews: async (params?: { page?: number; limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await apiGet<ApiResponse<{
      reviews: Review[];
      total: number;
      stats: {
        totalReviews: number;
        helpfulVotes: number;
      };
    }>>(`/user/reviews${queryParams.toString() ? `?${queryParams}` : ''}`);
    return response.data;
  },

  // Get builder's inbox items (reviews, mission reviews, bug reports)
  getBuilderInbox: async (projectId: string, params?: { page?: number; limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await apiGet<ApiResponse<{
      items: Array<{
        id: string;
        type: 'REGULAR_REVIEW' | 'QUALITY_REVIEW' | 'BUG_REPORT';
        source: 'DIRECT' | 'MISSION';
        content: string;
        title?: string;
        author: string;
        authorId: number;
        date: string;
        status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'RESOLVED';
        missionId?: string;
        taskId?: string;
      }>;
      total: number;
      page: number;
      hasMore: boolean;
    }>>(`/projects/${projectId}/inbox${queryParams.toString() ? `?${queryParams}` : ''}`);
    return response.data;
  },
};