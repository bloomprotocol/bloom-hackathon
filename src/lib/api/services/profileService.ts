// src/lib/api/services/profileService.ts

import { apiGet, apiPost } from '../apiConfig';

// 基础 API 响应包装
interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  data: T;
  error: string | null;
}

// Profile 初始数据类型定义
export interface ProfileMissionBasic {
  id: string;
  title: string;
  claimed: boolean;
}

export interface ProfileTask {
  id: string;
  title: string;
  description: string;
  task_type: string;
  content_type: string | null;
  extra: any;
  completed: boolean;
  category: string;
  statusData?: {
    status: string;
    completedAt: string | null;
    extra: any | null;
  };
}

export interface ProfileReward {
  name: string;
  type: string;
  amount: number | null;
  description?: string;
  icon: string | null;
}

export interface ProfileSelectedMission {
  id: string;
  title: string;
  description: string | null;
  imageUrl?: string | null;
  startTime?: string;
  endTime: string;
  status: 'Live' | 'Completed' | 'Upcoming';
  claimed: boolean;
  rewards: ProfileReward[];
  tasks: Record<string, ProfileTask[]>; // Tasks grouped by category
  rewardTiers?: Array<{
    _id: string;
    name: string;
    drops: number;
    iconUrl: string;
    description: string;
    order: number;
  }>;
  criteria?: string[];
}

export interface ProfileUserInfo {
  role: string | null;
  referralCode: string | null;
  walletAddress: string | null;
}

export interface ProfileMission {
  id: string;
  title: string;
  description: string;
  slug: string;
  start_time: string;
  end_time: string;
  status: 'Live' | 'Completed' | 'Upcoming';
  claimed: boolean;
  canClaim: boolean;
  displayStatus: 'active' | 'waiting' | 'claimable' | 'claimed' | 'failed';
  imageUrl?: string | null;
  missionType?: string | null;
}

export interface ProfileInitialDataResponse {
  statistics: {
    completedTaskCount: number;
    totalPoints: number;
    miniPoints: number;
    totalClicks: number;
    totalReferrals: number;
  };
  missions: ProfileMission[];
  userInfo: ProfileUserInfo;
}

// 新增響應數據類型
export interface ClaimMissionRewardData {
  claimed: boolean;
  updatedPoints: number;
}

// 活動狀態類型定義
export interface ActivityRecord {
  id: string;
  recordId: string;
  type: 'task' | 'mission' | 'comment' | 'favorite' | 'helpful' | 'referral_clicks';
  name: string;
  status: string;
  timestamp: string;
  totalRequired?: number;
}

export interface ActivityStatusResponse {
  count: number;
  records: ActivityRecord[];
}

export const profileService = {
  /**
 * 获取 Profile 页面初始数据
 * @endpoint /users/profile/initial-data
 * @description 獲取 Profile 頁面所需的結構化數據
 * @param user's bearer token
 * @returns Profile 页面所需的结构化数据
 */
  getInitialData: async (): Promise<ProfileInitialDataResponse> => {
    const response = await apiGet<ApiResponse<ProfileInitialDataResponse>>('/users/profile/initial-data');
    return response.data;
  },

  /**
   * 获取用户所有任务
   * @endpoint /missions/user
   * @description 获取用户所有可用任务列表
   * @returns 任务列表
   */
  getUserMissions: async (): Promise<ProfileMissionBasic[]> => {
    const response = await apiGet<ApiResponse<ProfileMissionBasic[]>>('/missions/user');
    return response.data;
  },

  /**
   * 获取公开的任务列表（不需要认证）
   * @endpoint GET /public/missions
   * @description 获取公开的任务列表，不包含用户特定数据
   * @returns 任务列表
   */
  getPublicMissions: async (params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    missions: Array<{
      id: string;
      title: string;
      slug: string;
      description: string | null;
      imageUrl?: string | null;
      missionType?: string | null;
      status: string;
      endTime: string;
      startTime: string;
      rewards: ProfileReward[];
      taskCount: number;
      completedCount: number;
    }>;
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const queryString = queryParams.toString();
    const url = queryString ? `/public/missions?${queryString}` : '/public/missions';
    
    const response = await apiGet<ApiResponse<{
      missions: Array<{
        id: string;
        title: string;
        slug: string;
        description: string | null;
        imageUrl?: string | null;
        missionType?: string | null;
        status: string;
        endTime: string;
        startTime: string;
        rewards: ProfileReward[];
        taskCount: number;
        completedCount: number;
      }>;
      pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    }>>(url);
    return response.data;
  },

  /**
   * 获取任务详情（只支持slug）
   * @endpoint /missions/:slug
   * @description 切換任務時，獲取任務詳情
   * @param slug 任务slug（URL友好的名称）
   * @returns 任务的完整信息
   */
  getMissionDetail: async (slug: string): Promise<ProfileSelectedMission> => {
    const response = await apiGet<ApiResponse<ProfileSelectedMission>>(`/missions/${slug}`);
    return response.data;
  },

  /**
   * 获取用户的任务状态（需要认证）
   * @endpoint /missions/:slug/status
   * @description 获取用户特定的任务完成状态
   * @param slug 任务slug
   * @returns 用户的任务状态数据
   */
  getUserMissionStatus: async (slug: string): Promise<{
    missionId: string;
    claimed: boolean;
    taskStatuses: Array<{
      taskId: string;
      completed: boolean;
      statusData: {
        status: string;
        extra: any;
        completedAt: string | null;
      } | null;
    }>;
  }> => {
    const response = await apiGet<ApiResponse<{
      missionId: string;
      claimed: boolean;
      taskStatuses: Array<{
        taskId: string;
        completed: boolean;
        statusData: {
          status: string;
          extra: any;
          completedAt: string | null;
        } | null;
      }>;
    }>>(`/missions/${slug}/status`);
    return response.data;
  },

  /**
   * 领取任务组奖励
   * @endpoint /reward/claim/mission/:missionId
   * @description 领取任务组奖励以及更新積分
   * @param missionId 任务组ID
   * @returns API 响應，成功时data包含claimed和updatedPoints
   */
  claimReward: async (missionId: string): Promise<ApiResponse<ClaimMissionRewardData>> => {
    return apiPost(`/reward/claim/mission/${missionId}`);
  },

  /**
   * 獲取用戶活動狀態
   * @endpoint /users/activity/status
   * @description 獲取最近的任務和任務組狀態記錄
   * @param limit 返回記錄數量限制
   * @returns 活動記錄
   */
  getActivityStatus: async (limit?: number): Promise<ActivityStatusResponse> => {
    const url = limit ? `/users/activity/status?limit=${limit}` : '/users/activity/status';
    const response = await apiGet<ApiResponse<ActivityStatusResponse>>(url);
    return response.data;
  }
};

export default profileService;