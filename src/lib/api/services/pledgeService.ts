import { apiGet, apiPost, apiDelete } from '../apiConfig';

// === 類型定義（內聯） ===
export interface Pledge {
  pledgeId: string;
  projectId: string;
  projectName?: string | null;
  pledgePower: number;
  status: 'active' | 'executed' | 'cancelled';
  createdAt: Date;
}

export interface PledgeStats {
  projectId: string;
  totalPoints: number;
  pledgeCount: number;
  userCount: number;
}

export interface WeeklyLimit {
  totalPower: number;       // Weekly allowance (same as weeklyLimit)
  weeklyLimit?: number;     // Deprecated: use totalPower
  usedThisWeek: number;
  remaining: number;
  resetsAt: Date;
}

export interface Personality {
  name: string;
  description: string;
}

export interface CategoryInfo {
  key: string;
  label: string;
  icon: string;
}

export interface TierProfile {
  tier: 'New' | 'Seed' | 'Sprout' | 'Bloom';
  totalPledged: number;
  nextTierAt: number | null;
  nextTierName: 'New' | 'Seed' | 'Sprout' | 'Bloom' | null;
  progressPercent: number;
  projectsSupported: number;
  personality: Personality;
  topCategories: CategoryInfo[];
  memberSince: string | null;
}

export interface TrendingProject {
  projectId: string;
  totalPoints: number;
  pledgeCount: number;
  backerCount: number;
  score: number;
}

export interface SeedPassProgress {
  pledgePowerUsed: number;
  projectsPledged: number;
  activeWeeks: number;
  messagesSent: number;
  pledgePowerTarget: number;
  projectsTarget: number;
  weeksTarget: number;
  messagesTarget: number;
  isUnlocked: boolean;
}

export interface IdentitySnapshot {
  snapshotId: string;
  tier: 'New' | 'Seed' | 'Sprout' | 'Bloom';
  personality: Personality;
  totalPledged: number;
  projectsSupported: number;
  topCategories: CategoryInfo[];
  savedAt: Date;
}

interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  data: T;
  error: string | null;
}

// === 服務方法 ===
export const pledgeService = {
  /**
   * 創建 pledge（使用免費週額度 Pledge Power）
   * @endpoint POST /pledges
   */
  createPledge: async (projectId: string, pledgePower: number, message?: string): Promise<Pledge> => {
    const response = await apiPost<ApiResponse<Pledge>>('/pledges', {
      projectId,
      pledgePower,
      ...(message && { message })
    });
    return response.data;
  },

  /**
   * 獲取項目統計（公開端點）
   * @endpoint GET /pledges/stats/:projectId
   */
  getProjectStats: async (projectId: string): Promise<PledgeStats> => {
    const response = await apiGet<ApiResponse<PledgeStats>>(
      `/pledges/stats/${projectId}`
    );
    return response.data;
  },

  /**
   * 取消 pledge（會退還 Points）
   * @endpoint DELETE /pledges/:pledgeId
   */
  cancelPledge: async (pledgeId: string): Promise<{ message: string }> => {
    const response = await apiDelete<ApiResponse<{ message: string }>>(
      `/pledges/${pledgeId}`
    );
    return response.data;
  },

  /**
   * 獲取週額度限制
   * @endpoint GET /pledges/pledge-power
   */
  getWeeklyLimit: async (): Promise<WeeklyLimit> => {
    const response = await apiGet<ApiResponse<WeeklyLimit>>(
      '/pledges/pledge-power'
    );
    return response.data;
  },

  /**
   * 獲取用戶的 pledges
   * @endpoint GET /pledges
   */
  getMyPledges: async (status?: string): Promise<{ items: Pledge[]; pagination: any }> => {
    const params = status ? `?status=${status}` : '';
    const response = await apiGet<ApiResponse<{ items: Pledge[]; pagination: any }>>(
      `/pledges${params}`
    );
    return response.data;
  },

  /**
   * 獲取用戶的 tier profile（tier, 進度, 人格類型）
   * @endpoint GET /pledges/profile
   */
  getTierProfile: async (): Promise<TierProfile> => {
    const response = await apiGet<ApiResponse<TierProfile>>('/pledges/profile');
    return response.data;
  },

  /**
   * 獲取熱門項目（公開端點）
   * @endpoint GET /pledges/trending
   */
  getTrendingProjects: async (period: 'week' | 'all' = 'week', limit: number = 10): Promise<TrendingProject[]> => {
    const response = await apiGet<ApiResponse<TrendingProject[]>>(
      `/pledges/trending?period=${period}&limit=${limit}`
    );
    return response.data;
  },

  /**
   * 獲取 Seed Pass 解鎖進度
   * @endpoint GET /pledges/seed-pass-progress
   */
  getSeedPassProgress: async (): Promise<SeedPassProgress> => {
    const response = await apiGet<ApiResponse<SeedPassProgress>>('/pledges/seed-pass-progress');
    return response.data;
  },

  /**
   * 檢查是否已保存 identity snapshot
   * @endpoint GET /pledges/identity-snapshot
   */
  getIdentitySnapshot: async (): Promise<IdentitySnapshot | null> => {
    try {
      const response = await apiGet<ApiResponse<IdentitySnapshot>>('/pledges/identity-snapshot');
      return response.data;
    } catch (error) {
      // If no snapshot exists, return null
      return null;
    }
  },

  /**
   * 保存當前 identity snapshot (sends displayed personality/categories)
   * @endpoint POST /pledges/identity-snapshot
   */
  saveIdentitySnapshot: async (data: {
    personalityName: string;
    personalityDescription: string;
    topCategories?: { key: string; label: string; icon: string }[];
  }): Promise<IdentitySnapshot> => {
    const response = await apiPost<ApiResponse<IdentitySnapshot>>('/pledges/identity-snapshot', data);
    return response.data;
  },

  /**
   * Reset identity snapshot (for testing — remove before production)
   * @endpoint DELETE /pledges/identity-snapshot
   */
  deleteIdentitySnapshot: async (): Promise<{ deleted: boolean }> => {
    const response = await apiDelete<ApiResponse<{ deleted: boolean }>>('/pledges/identity-snapshot');
    return response.data;
  },
};

export default pledgeService;
