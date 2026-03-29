"use client";

import { createContext, useContext, useMemo } from "react";
import { useProfileInitialData } from "@/lib/hooks/useProfileInitialData";
import { ProfileUserInfo, ProfileMission } from "@/lib/api/services/profileService";

// UserInfo Context 只管理基础用户信息
export interface UserInfoContextType {
  // 基础用户信息
  userInfo: ProfileUserInfo | undefined;
  
  // 统计数据
  statistics: {
    completedTaskCount: number;
    totalPoints: number;
    miniPoints: number;
    totalClicks: number;
    totalReferrals: number;
  } | undefined;
  
  // 任务列表
  missions: ProfileMission[] | undefined;
  
  // 数据状态
  isLoading: boolean;
  error: Error | null;
}

const UserInfoContext = createContext<UserInfoContextType | null>(null);

export const UserInfoProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  // 获取初始数据
  const { dashboardData, isLoading, error } = useProfileInitialData();

  // Context 值 - 只提供基础用户信息
  const value = useMemo(() => ({
    userInfo: dashboardData?.userInfo,
    statistics: dashboardData?.statistics,
    missions: dashboardData?.missions,
    isLoading,
    error,
  }), [
    dashboardData?.userInfo,
    dashboardData?.statistics,
    dashboardData?.missions,
    isLoading,
    error,
  ]);

  return (
    <UserInfoContext.Provider value={value}>
      {children}
    </UserInfoContext.Provider>
  );
};

// Custom hook to use UserInfoContext
export const useUserInfo = () => {
  const context = useContext(UserInfoContext);
  if (!context) {
    throw new Error("useUserInfo must be used within UserInfoProvider");
  }
  return context;
};