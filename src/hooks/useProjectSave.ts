import { useState, useCallback, useEffect } from 'react';
import { savesService } from '@/lib/api/services/savesService';
import { logger } from '@/lib/utils/logger';
// Toast notifications will be added later

export interface UseProjectSaveOptions {
  onSaveSuccess?: () => void;
  onUnsaveSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useProjectSave(projectId: string, options?: UseProjectSaveOptions) {
  const [isSaved, setIsSaved] = useState(false);
  const [saveCount, setSaveCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Fetch initial save status
  useEffect(() => {
    const fetchSaveStatus = async () => {
      if (!projectId) return;
      
      try {
        setIsInitializing(true);
        const response = await savesService.getSaveStatus(projectId);
        
        // Handle null response (user not authenticated)
        if (!response) {
          setIsSaved(false);
          setSaveCount(0);
        } else {
          const { isSaved, saveCount } = response;
          setIsSaved(isSaved);
          setSaveCount(saveCount);
        }
      } catch (error) {
        logger.error('Failed to fetch save status', { error });
        // Default to not saved if there's an error (likely unauthenticated)
        setIsSaved(false);
        setSaveCount(0);
      } finally {
        setIsInitializing(false);
      }
    };

    fetchSaveStatus();
  }, [projectId]);

  const toggleSave = useCallback(async () => {
    if (isLoading) return;

    setIsLoading(true);
    const previousState = isSaved;
    const previousCount = saveCount;

    // Optimistic update
    setIsSaved(!previousState);
    setSaveCount(previousState ? Math.max(0, previousCount - 1) : previousCount + 1);

    try {
      const response = previousState
        ? await savesService.unsaveProject(projectId)
        : await savesService.saveProject(projectId);

      if (response && typeof response.saveCount === 'number') {
        setSaveCount(response.saveCount);
        // Ensure isSaved reflects the actual API response
        if (typeof response.saved === 'boolean') {
          setIsSaved(response.saved);
        }
      }

      if (!previousState) {
        // Success notification will be added later
        options?.onSaveSuccess?.();
      } else {
        options?.onUnsaveSuccess?.();
      }
    } catch (error) {
      // Revert on error
      setIsSaved(previousState);
      setSaveCount(previousCount);
      
      logger.error('Failed to update bookmark status');
      options?.onError?.(error as Error);
      logger.error('Save toggle error', { error });
    } finally {
      setIsLoading(false);
    }
  }, [projectId, isSaved, saveCount, isLoading, options]);

  return {
    isSaved,
    saveCount,
    isLoading,
    isInitializing,
    toggleSave,
  };
}

// Hook for batch save status check
export function useProjectsSaveStatus(projectIds: string[]) {
  const [statuses, setStatuses] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchStatuses = async () => {
      if (!projectIds.length) return;

      try {
        setIsLoading(true);
        const response = await savesService.getBatchSaveStatus(projectIds);
        
        // Handle null response (user not authenticated)
        if (!response || !response.statuses) {
          setStatuses({});
        } else {
          setStatuses(response.statuses);
        }
      } catch (error) {
        logger.error('Failed to fetch batch save status', { error });
        // Default to empty statuses if there's an error (likely unauthenticated)
        setStatuses({});
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatuses();
  }, [projectIds.join(',')]);

  return { statuses, isLoading };
}