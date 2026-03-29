// src/lib/hooks/useUserPoints.ts

import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import pointsServices from '@/lib/api/services/pointsService';
import { logger } from '@/lib/utils/logger';
import { useAuth } from '@/lib/context/AuthContext';

/**
 * useUserPoints hook - 处理用户积分的获取和更新
 */
export const useUserPoints = () => {
  const { isAuthenticated } = useAuth();
  
  // 使用React Query获取用户积分
  const { 
    data: userPoints = 0, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['userPoints'],
    queryFn: async () => {
      try {
        const response = await pointsServices.getUserPoints();
        
        if (response.success && response.data) {
          // 從 response.data 中提取積分
          const points = parseInt(response.data.available_points) || 0;
          return points;
        }
        
        return 0;
      } catch (error) {
        logger.error('get user points failed', { error });
        throw error instanceof Error ? error : new Error('获取用户积分失败');
      }
    },
    staleTime: 5 * 60 * 1000, // 5分钟缓存有效期
    enabled: isAuthenticated
  });
  
  // 刷新用户积分 - 使用React Query的refetch功能
  const refreshUserPoints = useCallback(async () => {
    await refetch();
  }, [refetch]);
  
  return {
    userPoints,
    isLoading,
    error,
    refreshUserPoints
  };
};

export default useUserPoints;