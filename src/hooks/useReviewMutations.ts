'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewService } from '@/lib/api/services/reviewService';
import { logger } from '@/lib/utils/logger';

interface CreateReviewParams {
  projectId: string;
  content: string;
  parentId?: string;
}

interface VoteHelpfulParams {
  reviewId: string;
  remove?: boolean;
}

export function useReviewMutations(projectId: string, projectSlug?: string) {
  const queryClient = useQueryClient();

  // Create review/reply mutation
  const createReviewMutation = useMutation({
    mutationFn: async ({ projectId, content, parentId }: CreateReviewParams) => {
      return await reviewService.createReview({
        projectId,
        content,
        parentId
      });
    },
    onSuccess: () => {
      // Invalidate both possible query keys
      queryClient.invalidateQueries({ queryKey: ['reviews', projectId] });
      if (projectSlug) {
        queryClient.invalidateQueries({ queryKey: ['public-project-reviews', projectSlug] });
      }
      
    },
    onError: (error) => {
      logger.error('Create review error', { error });
    },
  });

  // Vote helpful mutation
  const voteHelpfulMutation = useMutation({
    mutationFn: async ({ reviewId, remove = false }: VoteHelpfulParams) => {
      if (remove) {
        return await reviewService.removeHelpfulVote(reviewId);
      } else {
        return await reviewService.voteHelpful(reviewId);
      }
    },
    onMutate: async ({ reviewId, remove }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['public-project-reviews', projectSlug] });
      
      // Snapshot the previous value
      const previousData = queryClient.getQueryData(['public-project-reviews', projectSlug]);
      
      // Optimistically update to the new value
      queryClient.setQueriesData(
        { queryKey: ['public-project-reviews', projectSlug] },
        (old: any) => {
          if (!old) return old;
          
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              data: {
                ...page.data,
                reviews: page.data.reviews.map((review: any) => {
                  // Update main review
                  if (review.id === reviewId) {
                    return {
                      ...review,
                      isHelpful: !remove,
                      _count: {
                        ...review._count,
                        helpful_votes: remove 
                          ? Math.max(0, (review._count?.helpful_votes || 0) - 1)
                          : (review._count?.helpful_votes || 0) + 1
                      }
                    };
                  }
                  
                  // Update nested replies
                  if (review.replies) {
                    return {
                      ...review,
                      replies: review.replies.map((reply: any) => {
                        if (reply.id === reviewId) {
                          return {
                            ...reply,
                            isHelpful: !remove,
                            _count: {
                              ...reply._count,
                              helpful_votes: remove 
                                ? Math.max(0, (reply._count?.helpful_votes || 0) - 1)
                                : (reply._count?.helpful_votes || 0) + 1
                            }
                          };
                        }
                        return reply;
                      })
                    };
                  }
                  
                  return review;
                })
              }
            }))
          };
        }
      );
      
      // Return a context object with the previous value
      return { previousData };
    },
    onError: (error, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousData) {
        queryClient.setQueryData(['public-project-reviews', projectSlug], context.previousData);
      }
      logger.error('Vote helpful error', { error });
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['reviews', projectId] });
      if (projectSlug) {
        queryClient.invalidateQueries({ queryKey: ['public-project-reviews', projectSlug] });
      }
    },
  });

  return {
    createReview: createReviewMutation,
    voteHelpful: voteHelpfulMutation,
  };
}