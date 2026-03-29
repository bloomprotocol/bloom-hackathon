import { apiGet } from '../apiConfig';

// 基础 API 响应包装
interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  data: T;
  error: string | null;
}

// 推薦碼響應類型
export interface ReferralCodeResponse {
  code: string;
  friendlyAlias: string | null;
  totalClicks: number;
  totalReferrals: number;
  isNewlyGenerated: boolean;
  conversionRate: string;
}

export const referralService = {
  /**
   * 獲取或生成用戶的推薦碼
   * @endpoint GET /referral/my-code
   * @description 如果用戶還沒有推薦碼，會自動生成一個新的
   * @returns 推薦碼信息
   */
  getMyReferralCode: async (): Promise<ReferralCodeResponse> => {
    const response = await apiGet<ApiResponse<ReferralCodeResponse>>('/referral/my-code');
    return response.data;
  }
};

export default referralService;