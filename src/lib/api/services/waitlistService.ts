import { apiPost } from '../apiConfig';
import { logger } from '@/lib/utils/logger';

/**
 * 等候名單註冊數據接口
 */
export interface WaitlistSignupData {
  email: string;
  tag: string;
  referral?: string;
  source?: string;
  terminal_option: Record<string, string>;  // 必填项：用户选择的terminal选项
  fingerprint: {
    fingerprint_hash: string;
    user_agent?: string;
    city?: string;
    country?: string;
    location_label?: string;
    source?: string;
    tag: string;
    extra?: Record<string, unknown>;
  };
}

/**
 * API 響應接口
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  statusCode?: number;
  error?: string;
  cause?: string;
}

/**
 * 等候名單服務
 */
export const waitlistServices = {
  /**
   * 註冊等候名單
   * @param data 等候名單數據
   * @returns API 響應
   */
  signupWaitlist: (data: WaitlistSignupData): Promise<ApiResponse> => {
    try {
      // 創建一個可以快速超時的API調用，不阻塞用戶體驗
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5秒超時
      
      
      return apiPost<ApiResponse>('/common/waitlist/signup', data, {
        signal: controller.signal
      })
        .then(response => {
          clearTimeout(timeoutId);
          return response;
        })
        .catch(error => {
          clearTimeout(timeoutId);
          // 如果是超時或取消，只記錄但不拋出錯誤
          if (error.name === 'AbortError' || error.code === 'ECONNABORTED') {
            logger.warn('[Waitlist][ABORT] Request cancelled', {
              reason: 'timeout'
            });
            return { success: false, message: 'Request timed out but user flow continued' };
          }
          
          logger.error('[Waitlist][FAIL] Request error', { 
            code: error.response?.status,
            message: error.message
          });
          // 不抛出錯誤，返回一個標準化的錯誤響應
          return { success: false, message: 'Request processing error' };
        });
    } catch {
      // 捕獲任何可能的錯誤，確保不會影響用戶體驗
      logger.error('[Waitlist][CRITICAL] Unexpected error', { status: 'failed' });
      return Promise.resolve({ success: false, message: 'Critical error' });
    }
  }
};

export default waitlistServices; 