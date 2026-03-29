"use client";

import { createContext, useContext, useMemo, useEffect, useCallback, useState } from "react";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { usePathname } from 'next/navigation';
import { useProfileInitialData } from "@/lib/hooks/useProfileInitialData";
import { useTaskActions } from "@/lib/hooks/useTaskActions";
import { logger } from '@/lib/utils/logger';
import {
 ClaimMissionRewardData,
 ProfileInitialDataResponse,
 ProfileSelectedMission,
 profileService
} from "@/lib/api/services/profileService";
import { useAuth } from "@/lib/context/AuthContext";
import { setCookie, COOKIE_KEYS } from '@/lib/utils/storage';

// Context type definition
export interface UserProfileContextType {
 // Core state
 selectedMissionId: string | null;
 setSelectedMissionId: (id: string) => void;

 // Data
 selectedMission: ProfileSelectedMission | null;
 dashboardData: ProfileInitialDataResponse | undefined;

 // Task operations
 isProcessing: boolean;
 currentTaskId: string;
 failedTaskId: string;
 handleTaskAction: (taskId: string, value?: any) => void;

 // Reward operations
 claimReward: () => void;

 // Utility functions
 isUnclaimedMission: (missionId: string) => boolean;
 
 // Special page markers
 isOverviewView: boolean;
}

const UserProfileContext = createContext<UserProfileContextType | null>(null);

export const UserProfileProvider = ({
 children,
 initialMissionId,
}: {
 children: React.ReactNode;
 initialMissionId?: string;
}) => {
 const queryClient = useQueryClient();
 const pathname = usePathname();
 
 // 檢查認證狀態
 const { isAuthenticated, hasRole } = useAuth();

 // 獲取初始數據
 const { dashboardData, refetch: refetchInitialData } = useProfileInitialData();

 // 管理選中的任務 ID - Always start with supporter view
 const [selectedMissionId, setSelectedMissionId] = useState<string | null>('supporter');

 // 設置初始選中任務 - Always supporter
 useEffect(() => {
  if (isAuthenticated && dashboardData && !selectedMissionId) {
    logger.debug('[UserProfileProvider] Setting initial view to supporter');
    setSelectedMissionId('supporter');
  }
 }, [isAuthenticated, dashboardData]); // Remove selectedMissionId from dependencies

 // Ensure supporter view when navigating to dashboard
 useEffect(() => {
  if (pathname === '/dashboard' && selectedMissionId !== 'supporter') {
    logger.debug('[UserProfileProvider] Setting to supporter view');
    setSelectedMissionId('supporter');
  }
 }, [pathname]); // Run when pathname changes


 // Set user role to cookie
 useEffect(() => {
  if (dashboardData?.userInfo?.role) {
    // Store user role in cookie for AuthContext to use (now as string, not array)
    setCookie(COOKIE_KEYS.ROLE, dashboardData.userInfo.role);
  }
}, [dashboardData?.userInfo?.role]);

 // 獲取任務詳情 - Only fetch when user clicks a mission
 const { data: missionDetail } = useQuery<ProfileSelectedMission | null>({
   queryKey: ['missionDetail', selectedMissionId],
   queryFn: async () => {
    // Only fetch mission details for actual missions, not dashboard views
    if (!selectedMissionId || !isAuthenticated || selectedMissionId === 'supporter') {
      return null;
    }

     // If user clicked on a mission, fetch its details
     try {
       return await profileService.getMissionDetail(selectedMissionId);
     } catch (error) {
       logger.error('Failed to fetch mission detail', { error, missionId: selectedMissionId });
       throw error;
     }
   },
   enabled: !!selectedMissionId && isAuthenticated && selectedMissionId !== 'supporter',
   staleTime: 10 * 60 * 1000,
 });

 // 切換任務的函數
 const selectMission = useCallback((missionId: string) => {
   // Allow view switching
   setSelectedMissionId(missionId);
 }, []);

 // 當前選中任務 - Only available when user clicks a mission
 const currentSelectedMission = missionDetail || null;

 // 刷新數據的回調
 const refreshData = useCallback(async () => {
   await refetchInitialData();
   if (selectedMissionId) {
     await queryClient.invalidateQueries({ queryKey: ['missionDetail', selectedMissionId] });
   }
 }, [refetchInitialData, selectedMissionId, queryClient]);

 // Task operations
 const {
   isProcessing,
   currentTaskId,
   failedTaskId,
   handleTaskAction: baseHandleTaskAction
 } = useTaskActions(refreshData);

 // 包裝 handleTaskAction 以傳遞正確的參數
 const handleTaskAction = useCallback((taskId: string, value?: any) => {
   if (!currentSelectedMission) return;

   // Find task in grouped structure
   let task: any = null;
   for (const category of Object.values(currentSelectedMission.tasks)) {
     const found = category.find(t => t.id === taskId);
     if (found) {
       task = found;
       break;
     }
   }
   if (!task) return;

   baseHandleTaskAction(taskId, task.task_type, value);
 }, [currentSelectedMission, baseHandleTaskAction]);

 // 領取獎勵
 const claimReward = useCallback(async () => {
   if (!currentSelectedMission || currentSelectedMission.claimed) return;

   try {
     const response = await profileService.claimReward(currentSelectedMission.id);

     if (response && response.success && response.data) {
       const rewardData = response.data as ClaimMissionRewardData;


       // 1. 直接更新積分查詢的緩存
       queryClient.setQueryData(['userPoints'], rewardData.updatedPoints);

       // 2. 更新 profileInitialData 中的積分
       queryClient.setQueryData(['profileInitialData'], (oldData: ProfileInitialDataResponse | undefined) => {
         if (!oldData) return oldData;

         return {
           ...oldData,
           missions: oldData.missions.map(m =>
             m.id === currentSelectedMission.id ? { ...m, claimed: true } : m
           ),
           statistics: {
             ...oldData.statistics,
             totalPoints: rewardData.updatedPoints
           },
         };
       });

       // 3. 更新 missionDetail 緩存
       queryClient.setQueryData(['missionDetail', currentSelectedMission.id], (oldData: ProfileSelectedMission | undefined) => {
         if (!oldData) return oldData;
         return { ...oldData, claimed: true };
       });

     } else {
       const errorMessage = response?.error || 'Failed to claim reward';
       logger.error('Failed to claim reward', { response, missionId: currentSelectedMission.id });

       switch (response.error) {
         case 'User has already claimed the reward':
           logger.warn('Reward already claimed, refreshing data');
           if (currentSelectedMission.id) {
             await queryClient.invalidateQueries({ queryKey: ['missionDetail', currentSelectedMission.id] });
           }
           break;

         case 'Mission not completed':
           logger.warn('Mission not completed, refreshing data');
           await queryClient.invalidateQueries({ queryKey: ['profileInitialData'] });
           break;

         default:
           logger.error('Unknown error:', { errorMessage });
           break;
       }
     }
   } catch (error) {
     logger.error('Failed to claim reward - network error', { error });
   }
 }, [currentSelectedMission, queryClient]);

 // 檢查任務是否有未領取獎勵
 const isUnclaimedMission = useCallback((missionId: string) => {
   if (!dashboardData || !dashboardData.missions) return false;
   
   const mission = dashboardData.missions.find(m => m.id === missionId);
   if (!mission) return false;

   // A mission is unclaimed if it's completed but not claimed
   return mission.status === 'Completed' && !mission.claimed;
 }, [dashboardData]);

 // 判斷是否為概覽視圖
 const isOverviewView = selectedMissionId === 'supporter';

 // Context 值
 const value = useMemo(() => ({
   selectedMissionId,
   setSelectedMissionId: selectMission,
   selectedMission: currentSelectedMission,
   dashboardData,
   isProcessing,
   currentTaskId,
   failedTaskId,
   handleTaskAction,
   claimReward,
   isUnclaimedMission,
   isOverviewView
 }), [
   selectedMissionId,
   selectMission,
   currentSelectedMission,
   dashboardData,
   isProcessing,
   currentTaskId,
   failedTaskId,
   handleTaskAction,
   claimReward,
   isUnclaimedMission,
   isOverviewView
 ]);

 return (
   <UserProfileContext.Provider value={value}>
     {children}
   </UserProfileContext.Provider>
 );
};

// Custom hook to use UserProfileContext
export const useUserProfileContext = () => {
 const context = useContext(UserProfileContext);
 if (!context) {
   throw new Error("useUserProfileContext must be used within UserProfileProvider");
 }
 return context;
};

// Temporary backward compatibility
export const useDashboardContext = useUserProfileContext;