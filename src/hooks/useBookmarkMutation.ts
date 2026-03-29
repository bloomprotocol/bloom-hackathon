'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { savesService } from '@/lib/api/services/savesService';
import { logger } from '@/lib/utils/logger';

interface BookmarkMutationParams {
  projectId: string;
  isSaved: boolean;
}

export function useBookmarkMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, isSaved }: BookmarkMutationParams) => {
      if (isSaved) {
        // Remove bookmark
        return await savesService.unsaveProject(projectId);
      } else {
        // Add bookmark
        return await savesService.saveProject(projectId);
      }
    },
    onSuccess: (data, variables) => {
      // Invalidate projects query to refetch with updated bookmark status
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      
    },
    onError: (error) => {
      logger.error('Bookmark error', { error });
    },
  });
}