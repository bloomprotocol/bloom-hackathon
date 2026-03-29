/**
 * URL參數檢測服務
 * 用於檢測URL中的查詢參數
 */

import { logger } from "@/lib/utils/logger";

// URL參數檢測結果接口
export interface UrlParamsDetectionResult {
  // 所有檢測到的URL參數
  params: Record<string, string>;
  // 原始URL
  rawUrl: string;
}

/**
 * 檢測URL參數
 * @returns URL參數檢測結果，如果在服務器端執行則返回null
 */
export function detectUrlParams(): UrlParamsDetectionResult | null {
  // 確保只在客戶端執行
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    // 獲取完整URL
    const fullUrl = window.location.href;
    
    // 獲取URL參數
    const urlParams = new URLSearchParams(window.location.search);
    
    // 創建參數對象
    const paramsObj: Record<string, string> = {};
    
    // 添加所有查詢參數 - 不過濾任何參數
    for (const [key, value] of urlParams.entries()) {
      paramsObj[key] = value;
    }
    
    // 檢測URL路徑
    const pathname = window.location.pathname;
    paramsObj['path'] = pathname;
    
    return {
      params: paramsObj,
      rawUrl: fullUrl
    };
  } catch (error) {
    logger.error('url check went wrong', { error });
    
    // 即使發生錯誤，也嘗試返回基本信息
    return {
      params: {
        error: error instanceof Error ? error.message : String(error),
        raw_url: window.location.href
      },
      rawUrl: window.location.href
    };
  }
}

/**
 * 在控制台顯示URL參數檢測結果
 */
export function logUrlParamsDetection(): void {
  // 確保只在客戶端執行
  if (typeof window === 'undefined') {
    return;
  }

  const result = detectUrlParams();
  if (!result) return;

  const { params } = result;
  
  
  // 檢查是否有任何參數
  const paramCount = Object.keys(params).length;
  if (paramCount > 0) {
    // 額外顯示每個參數的詳細信息
    Object.entries(params).forEach(([key, value]) => {
    });
  } else { }
}

/**
 * 檢測URL參數並記錄到控制台
 * @returns URL參數檢測結果，如果在服務器端執行則返回null
 */
export function detectAndLogUrlParams(): UrlParamsDetectionResult | null {
  const result = detectUrlParams();
  if (result) {
    logUrlParamsDetection();
  }
  return result;
} 