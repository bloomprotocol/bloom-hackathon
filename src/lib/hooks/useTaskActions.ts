// src/lib/hooks/useTaskActions.ts
import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { taskVerificationService } from '@/lib/api/services/taskVerificationService';
import { logger } from '@/lib/utils/logger';
import { flattenTasks } from '@/lib/utils/mission/task-helpers';

export const useTaskActions = (onSuccess?: () => Promise<void>) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState<string>("");
  const [failedTaskId, setFailedTaskId] = useState<string>("");
  const queryClient = useQueryClient();

  const handleTaskAction = useCallback(async (taskId: string, taskType: string, value?: any) => {
    if (isProcessing) return;

    setIsProcessing(true);
    setCurrentTaskId(taskId);
    setFailedTaskId("");

    try {
      const payload = {
        taskId,
        ...(taskType === 'DAILY_CHECKIN' && process.env.NODE_ENV === 'development' && {
          testDate: new Date().toISOString()
        }),
        ...(taskType === 'CONTENT_SUBMISSION' && value && {
          // Support both string (legacy) and object format
          ...(typeof value === 'string' ? { url: value } : value)
        })
      };
      
      const response = await taskVerificationService.verifyTask(taskType, payload);

      if (response.success) {
        // 構建正確的 statusData 結構
        const newStatusData = {
          status: response.data.taskStatus,
          completedAt: response.data.taskStatus === 'COMPLETED' ? new Date().toISOString() : null,
          extra: response.data  // 將整個 response.data 放入 extra
        };
        
        // Note: Profile initial data no longer contains task information
        // Task updates should be handled by the parent component that knows the mission context
        // The parent should invalidate or update the relevant queries after task completion

        await onSuccess?.();
        setCurrentTaskId("");
      } else {
        setFailedTaskId(taskId);
        setTimeout(() => setFailedTaskId(""), 1500);
      }
    } catch (error) {
      logger.error('[Task] Request error', { error });
      setFailedTaskId(taskId);
      setTimeout(() => setFailedTaskId(""), 1500);
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, onSuccess, queryClient]);

  return {
    isProcessing,
    currentTaskId,
    failedTaskId,
    handleTaskAction
  };
};