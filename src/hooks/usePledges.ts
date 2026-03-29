import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pledgeService } from '@/lib/api/services/pledgeService';

/**
 * Hook: 獲取項目統計
 */
export function usePledgeStats(projectId: string) {
  return useQuery({
    queryKey: ['pledge-stats', projectId],
    queryFn: () => pledgeService.getProjectStats(projectId),
    staleTime: 30 * 1000,  // 30 秒
    enabled: !!projectId,
  });
}

/**
 * Hook: 獲取週額度限制
 */
export function useWeeklyLimit(enabled: boolean = true) {
  return useQuery({
    queryKey: ['pledge-weekly-limit'],
    queryFn: () => pledgeService.getWeeklyLimit(),
    staleTime: 60 * 1000,  // 1 分鐘
    enabled,
    retry: false,  // 不重試，避免未登入時重複請求
  });
}

/**
 * Hook: 獲取用戶的 pledges
 */
export function useMyPledges(enabled: boolean = true) {
  return useQuery({
    queryKey: ['my-pledges'],
    queryFn: () => pledgeService.getMyPledges('active'),
    staleTime: 30 * 1000,  // 30 秒
    enabled,
    retry: false,
  });
}

/**
 * Hook: 創建 pledge（使用免費週額度 Pledge Power）
 */
export function useCreatePledge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, pledgePower, message }: { projectId: string; pledgePower: number; message?: string }) =>
      pledgeService.createPledge(projectId, pledgePower, message),
    onSuccess: (_, variables) => {
      // 成功後刷新統計數據、週額度和用戶 pledges
      queryClient.invalidateQueries({
        queryKey: ['pledge-stats', variables.projectId]
      });
      queryClient.invalidateQueries({
        queryKey: ['pledge-weekly-limit']
      });
      queryClient.invalidateQueries({
        queryKey: ['my-pledges']
      });
      queryClient.invalidateQueries({
        queryKey: ['tier-profile']
      });
      queryClient.invalidateQueries({
        queryKey: ['seed-pass-progress']
      });
    },
  });
}

/**
 * Hook: 取消 pledge（會退還 Points）
 */
export function useCancelPledge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (pledgeId: string) => pledgeService.cancelPledge(pledgeId),
    onSuccess: () => {
      // 刷新所有統計數據、週額度和用戶 pledges
      queryClient.invalidateQueries({ queryKey: ['pledge-stats'] });
      queryClient.invalidateQueries({ queryKey: ['pledge-weekly-limit'] });
      queryClient.invalidateQueries({ queryKey: ['my-pledges'] });
      queryClient.invalidateQueries({ queryKey: ['tier-profile'] });
    },
  });
}

/**
 * Hook: 獲取用戶的 tier profile
 */
export function useTierProfile(enabled: boolean = true) {
  return useQuery({
    queryKey: ['tier-profile'],
    queryFn: () => pledgeService.getTierProfile(),
    staleTime: 60 * 1000,  // 1 分鐘
    enabled,
    retry: false,
  });
}

/**
 * Hook: 獲取熱門項目
 */
export function useTrendingProjects(period: 'week' | 'all' = 'week', limit: number = 10) {
  return useQuery({
    queryKey: ['trending-projects', period, limit],
    queryFn: () => pledgeService.getTrendingProjects(period, limit),
    staleTime: 5 * 60 * 1000,  // 5 分鐘
  });
}

/**
 * Hook: 獲取 Seed Pass 解鎖進度
 */
export function useSeedPassProgress(enabled: boolean = true) {
  return useQuery({
    queryKey: ['seed-pass-progress'],
    queryFn: () => pledgeService.getSeedPassProgress(),
    staleTime: 30 * 1000,  // 30 秒
    enabled,
    retry: false,
  });
}

/**
 * Hook: 獲取 identity snapshot
 */
export function useIdentitySnapshot(enabled: boolean = true) {
  return useQuery({
    queryKey: ['identity-snapshot'],
    queryFn: () => pledgeService.getIdentitySnapshot(),
    staleTime: 60 * 1000,  // 1 分鐘
    enabled,
    retry: false,
  });
}

/**
 * Hook: 保存 identity snapshot
 */
export function useSaveIdentitySnapshot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      personalityName: string;
      personalityDescription: string;
      topCategories?: { key: string; label: string; icon: string }[];
    }) => pledgeService.saveIdentitySnapshot(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['identity-snapshot'] });
      queryClient.invalidateQueries({ queryKey: ['tier-profile'] });
    },
  });
}

/**
 * Hook: Reset identity snapshot (testing only)
 */
export function useDeleteIdentitySnapshot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => pledgeService.deleteIdentitySnapshot(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['identity-snapshot'] });
    },
  });
}
