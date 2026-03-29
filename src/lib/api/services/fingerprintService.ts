import { apiPost } from '../apiConfig';
import { logger } from '@/lib/utils/logger';

/**
 * 用戶數據介面
 */
export interface FingerprintData {
  fingerprint_hash: string;
  user_agent: string;
  city: string;
  country: string;
  location_label: string;
  source: string;
  extra: Record<string, any>;
}

/**
 * API 響應介面
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

/**
 * 訪客統計服務
 */
export const fingerprintServices = {
  /**
   * 記錄用戶訪問數據
   * @param data 用戶數據
   * @returns API 響應
   */
  trackFingerprint: (data: FingerprintData): Promise<ApiResponse> => {
    try {
      // 創建一個可以快速超時的API調用，不阻塞用戶體驗
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3秒超時
      
      return apiPost<ApiResponse>('/common/track-fingerprint', data, {
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
            logger.warn('[BZY][ABORT] Request cancelled', {
              reason: 'timeout'
            });
            return { success: false, message: 'Request timed out but user flow continued' };
          }
          
          logger.error('[BZY][FAIL] Request error', { 
            code: error.response?.status
          });
          // 不抛出錯誤，返回一個標準化的錯誤響應
          return { success: false, message: 'Request processing error' };
        });
    } catch (error) {
      // 捕獲任何可能的錯誤，確保不會影響用戶體驗
      logger.error('[BZY][CRITICAL] Unexpected error', { status: 'failed' });
      return Promise.resolve({ success: false, message: 'Critical error' });
    }
  }
};

export default fingerprintServices; 