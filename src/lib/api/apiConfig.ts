import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { getCookie, COOKIE_KEYS } from '@/lib/utils/storage';
import { logger } from '@/lib/utils/logger';

// 動態獲取 API URL（本地 tunnel 測試用）
function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';
}

// 創建axios實例
const apiInstance: AxiosInstance = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    "Content-type": "application/json",
    // Add ngrok header to bypass warning page
    ...(process.env.NEXT_PUBLIC_API_URL?.includes('ngrok') && {
      'ngrok-skip-browser-warning': 'true'
    })
  },
  timeout: 10000, // 10秒超時
  timeoutErrorMessage: 'Request timed out', // 自定義超時錯誤訊息
  withCredentials: true
});

// 請求攔截器 - 從cookie或localStorage獲取token
apiInstance.interceptors.request.use(
  (config) => {
    // 動態更新 baseURL（本地 tunnel 測試用）
    // 當 NEXT_PUBLIC_TUNNEL_DOMAIN 設置時，檢查當前域名是否匹配
    const tunnelDomain = process.env.NEXT_PUBLIC_TUNNEL_DOMAIN;
    const tunnelApiUrl = process.env.NEXT_PUBLIC_TUNNEL_API_URL;
    if (tunnelDomain && tunnelApiUrl && typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      if (hostname === tunnelDomain || hostname === `preflight.${tunnelDomain}`) {
        config.baseURL = tunnelApiUrl;
      }
    }

    // 從cookie獲取token
    const cookieToken = getCookie(COOKIE_KEYS.AUTH_TOKEN);
    // 從localStorage獲取token（fallback）
    const localStorageToken = typeof window !== 'undefined' ? localStorage.getItem('jwt-token') : null;

    const token = cookieToken || localStorageToken;

    // 如果有token，添加到請求頭
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// 響應攔截器 - 處理常見錯誤
apiInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const config = error.config as AxiosRequestConfig & { _retry?: boolean };
    
    // 檢查是否超時或網絡錯誤
    if (
      (error.message === 'Network Error' || error.message === 'Request timed out') && 
      config && 
      !config._retry
    ) {
      // 重試邏輯
      config._retry = true;
      logger.warn('Network error detected, retrying request', { url: config.url });
      try {
        return await apiInstance(config);
      } catch (retryError) {
        logger.error('Retry failed', { error: retryError });
        return Promise.reject(retryError);
      }
    }

    // 統一錯誤處理
    if (error.response) {
      const { status } = error.response;
      
      // 處理常見狀態碼
      if (status === 401) {
        logger.error('unauthorized, please login again', { error });
        // 发出 401 事件，让 AuthContext 处理
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('auth:unauthorized'));
        }
      } else if (status === 403) {
        logger.error('no permission to access this resource', { error });
      } else if (status >= 500) {
        logger.error('server error, please try again later', { error });
      }
    } else if (error.request) {
      logger.error('network error, cannot connect to server', { error });
    } else {
      logger.error('request config error', { error });
    }
    
    return Promise.reject(error);
  }
);

// 導出實例
export default apiInstance;

// 導出類型化的請求方法
export const apiGet = <T>(url: string, config?: AxiosRequestConfig) => 
  apiInstance.get<T>(url, config).then(response => response.data);

export const apiPost = <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => 
  apiInstance.post<T>(url, data, config).then(response => response.data);

export const apiPut = <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
  apiInstance.put<T>(url, data, config).then(response => response.data);

export const apiPatch = <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
  apiInstance.patch<T>(url, data, config).then(response => response.data);

export const apiDelete = <T>(url: string, config?: AxiosRequestConfig) =>
  apiInstance.delete<T>(url, config).then(response => response.data);