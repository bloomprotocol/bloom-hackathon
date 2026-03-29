import { apiGet, apiPost } from "../apiConfig";

// API 响應類型
export interface ApiResponse<T = unknown> {
  success: boolean;
  statusCode?: number;
  message?: string;
  data?: T;
  error?: string;
  cause?: string;
}

// 积分相關API数据类型
export interface UserPoints {
  id: number;
  uid: number;
  total_points: string;
  available_points: string;
  frozen_points: string;
  mini_points: string; // ✅ 新增字段
  source: unknown | null;
  point_type?: string; // ✅ 新增字段
}

// ✅ 新增：積分類型枚舉
export enum PointType {
  DROPS = 'drops',
  MINI = 'mini'
}

// 积分相關 API 方法
export const pointsServices = {
  /**
   * 获取用户积分信息
   * @param pointType 積分類型（可選）
   * @returns API 响應，包含用户积分信息
   */
  getUserPoints: (pointType?: PointType): Promise<ApiResponse<UserPoints>> => {
    const params = pointType ? `?point_type=${pointType}` : '';
    return apiGet(`/points/user${params}`);
  },

  /**
   * ✅ 新增：獲取用戶 mini-points
   */
  getUserMiniPoints: (): Promise<ApiResponse<UserPoints>> => {
    return apiGet('/points/user?point_type=mini');
  },

  /**
   * ✅ 新增：獲取用戶 drops
   */
  getUserDrops: (): Promise<ApiResponse<UserPoints>> => {
    return apiGet('/points/user?point_type=drops');
  },

  /**
   * ✅ 新增：獲取積分歷史（支持類型過濾）
   */
  getPointsHistory: (pointType?: PointType, page?: number, limit?: number): Promise<ApiResponse<any[]>> => {
    const params: Record<string, any> = {};
    
    if (pointType) params.point_type = pointType;
    if (typeof page === 'number' && page > 0) {
      params.skip = (page - 1) * (limit || 10);
    }
    if (typeof limit === 'number') {
      params.take = limit;
    }
    
    // Build query string manually to ensure numbers are passed correctly
    const queryString = Object.entries(params)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
    
    return apiGet(`/points/history${queryString ? '?' + queryString : ''}`);
  }
};

export default pointsServices;