import { getCookie as originalGetCookie, setCookie as originalSetCookie, deleteCookie as originalDeleteCookie, CookieValueTypes } from 'cookies-next';
import { logger } from '@/lib/utils/logger';

// --------------------- 常量定義 ------------------------

// 所有 cookie 鍵名集中管理
export const COOKIE_KEYS = {
  // 認證相關
  AUTH_TOKEN: 'auth-token',
  WALLET_ADDRESS: 'wallet-address',
  SUB: 'sub', // USER_ID → SUB (JWT subject claim)
  ROLE: 'role', // USER_ROLES → ROLE (single role as string)
  TIA: 'tia', // Token Issued At - token 签发时间

  // 其他
  REFERRAL_CODE: 'referral_code',
  PENDING_BOOKMARK: 'pendingBookmark',
  PENDING_REVIEW: 'pendingReview',

  // Legacy (待移除)
  USER_ROLES_LEGACY: 'user-roles',
};

// 數據存儲策略
export enum StorageStrategy {
  COOKIE_ONLY, // 僅使用 cookie 
  LOCAL_STORAGE, // 大數據使用 localStorage，cookie 存標記
  SESSION_STORAGE, // 使用 sessionStorage (會話期間有效)
}

// 不同類型數據的 cookie 選項
const COOKIE_OPTIONS = {
  // 認證數據 - 較長過期時間
  AUTH: {
    path: '/',
    maxAge: 30 * 24 * 60 * 60, // 30天過期
    sameSite: 'lax' as const,
  },

};

// 配置每個鍵使用的存儲策略和選項類型
const KEY_CONFIGS: {[key: string]: {strategy: StorageStrategy, optionsType: keyof typeof COOKIE_OPTIONS}} = {
  [COOKIE_KEYS.AUTH_TOKEN]: {strategy: StorageStrategy.COOKIE_ONLY, optionsType: 'AUTH'},
  [COOKIE_KEYS.WALLET_ADDRESS]: {strategy: StorageStrategy.COOKIE_ONLY, optionsType: 'AUTH'},
  [COOKIE_KEYS.SUB]: {strategy: StorageStrategy.COOKIE_ONLY, optionsType: 'AUTH'},
  [COOKIE_KEYS.ROLE]: {strategy: StorageStrategy.COOKIE_ONLY, optionsType: 'AUTH'},
  [COOKIE_KEYS.TIA]: {strategy: StorageStrategy.COOKIE_ONLY, optionsType: 'AUTH'},
  

};

// --------------------- 輔助函數 ------------------------

// 簡單加密函數 (實際應用中應使用更強的加密算法)
const encrypt = (value: string): string => {
  try {
    // 這裡使用基本的 Base64 編碼作為示例
    // 實際生產環境應使用更強的加密方法
    if (typeof window !== 'undefined') {
      return btoa(`${value}:${Date.now()}`);
    }
    return value; // 伺服器端不加密
  } catch (error) {
    logger.error('Failed to encrypt value', { error });
    return value;
  }
};

// 解密函數
const decrypt = (encryptedValue: string): string => {
  try {
    if (typeof window !== 'undefined') {
      // 從 Base64 解碼，並移除時間戳
      const decoded = atob(encryptedValue);
      return decoded.split(':')[0];
    }
    return encryptedValue; // 伺服器端不解密
  } catch (error) {
    logger.error('Failed to decrypt value', { error });
    return encryptedValue;
  }
};


// 修改 getKeyConfig 的預設值
const getKeyConfig = (key: string) => {
  return KEY_CONFIGS[key] || {strategy: StorageStrategy.COOKIE_ONLY, optionsType: 'AUTH'};
  // 改為使用 AUTH 作為預設值 ☝️
};

// 獲取對應選項
const getOptions = (key: string, customOptions = {}) => {
  const { optionsType } = getKeyConfig(key);
  return {
    ...COOKIE_OPTIONS[optionsType],
    ...customOptions,
  };
};

// 從 cookie 獲取原始值
const getValueFromCookie = (key: string): CookieValueTypes | null => {
  // 使用 cookies-next 的 getCookie 同步版本
  let value;
  try {
    // @ts-expect-error - 忽略類型檢查，因為這裡我們需要直接訪問同步版本
    value = originalGetCookie.get ? originalGetCookie.get(key) : originalGetCookie(key);
  } catch (error) {
    logger.error(`[STORAGE] Error getting cookie value for ${key}`, { error });
    return null;
  }
  
  if (value === undefined || value === null) {
    return null;
  }
  
  return value;
};

// --------------------- 主要API ------------------------

/**
 * 設置 cookie 或 localStorage 值
 * @param key 鍵名
 * @param value 值
 * @param options 自定義選項
 */
export const setCookie = (key: string, value: CookieValueTypes, options = {}) => {
  try {
    const { strategy } = getKeyConfig(key);
    const cookieOpts = getOptions(key, options);
    
    
    // 根據配置的策略決定存儲方式
    if (strategy === StorageStrategy.LOCAL_STORAGE && typeof window !== 'undefined') {
      // 大數據使用 localStorage
      const strValue = typeof value === 'string' ? value : JSON.stringify(value);
      localStorage.setItem(key, encrypt(strValue));
      
      // 在 cookie 中保存標記
      originalSetCookie(`${key}-marker`, 'true', cookieOpts);
      
    } else {
      // 小數據或敏感數據使用 cookie
      let valueToStore = value;
      
      // 如果不是字符串，先轉換為 JSON
      if (typeof value !== 'string' && typeof value !== 'number' && typeof value !== 'boolean') {
        valueToStore = JSON.stringify(value);
      }
      
      // 設置存儲
      originalSetCookie(key, valueToStore, cookieOpts);
      
    }
  } catch (error) {
    logger.error(`[STORAGE] Failed to set storage for ${key}`, { error });
    
    // 嘗試使用原始方法作為備用
    try {
      originalSetCookie(key, value, options);
    } catch (e) {
      logger.error(`[STORAGE] Fallback storage also failed for ${key}`, { error: e });
    }
  }
};

/**
 * 同步版本的 getCookie 函數
 * @param key 鍵名
 * @returns 存儲的值
 */
export const getCookie = (key: string): CookieValueTypes | null => {
  try {
    
    
    const { strategy } = getKeyConfig(key);
    
    // 檢查是否使用 localStorage 且數據存在
    if (strategy === StorageStrategy.LOCAL_STORAGE && 
        typeof window !== 'undefined' && 
        getValueFromCookie(`${key}-marker`)) {
      
      // 從 localStorage 獲取數據
      const encryptedValue = localStorage.getItem(key);
      if (!encryptedValue) return null;
      
      // 解密
      const decrypted = decrypt(encryptedValue);
      
      try {
        // 嘗試將其解析為 JSON
        return JSON.parse(decrypted);
      } catch {
        // 不是 JSON，直接返回
        return decrypted;
      }
    }
    
    // 從標準 cookie 獲取
    const value = getValueFromCookie(key);
    
    if (value === undefined || value === null) {
      return null;
    }
    
    if (typeof value === 'string') {
      try {
        // 嘗試解析為 JSON
        return JSON.parse(value);
      } catch {
        // 不是 JSON，返回原值
        return value;
      }
    }
    
    return value;
  } catch (error) {
    logger.error(`[STORAGE] Failed to get storage for ${key}`, { error });
    
    // 錯誤情況下返回null
    return null;
  }
};

/**
 * 刪除 cookie 和對應的 localStorage 數據
 * @param key 鍵名
 * @param options 選項
 */
export const deleteCookie = (key: string, options = {}) => {
  try {
    const { strategy } = getKeyConfig(key);
    const cookieOpts = getOptions(key, options);
    
    // 同時刪除 cookie 和 localStorage
    originalDeleteCookie(key, cookieOpts);
    
    if (strategy === StorageStrategy.LOCAL_STORAGE && typeof window !== 'undefined') {
      localStorage.removeItem(key);
      originalDeleteCookie(`${key}-marker`, cookieOpts);
    }
  } catch (error) {
    logger.error(`[STORAGE] Failed to delete storage for ${key}`, { error });
    
    // 嘗試使用原始方法
    try {
      originalDeleteCookie(key, options);
    } catch (e) {
      logger.error(`[STORAGE] Fallback delete also failed for ${key}`, { error: e });
    }
  }
};

/**
 * 設置緩存數據（包含時間戳和數據）
 * @param key 緩存鍵名
 * @param data 要緩存的數據
 * @param options 選項
 */
export const setToCache = <T>(key: string, data: T, options = {}): void => {
  try {
    const cacheItem = {
      data,
      timestamp: Date.now()
    };
    setCookie(key, JSON.stringify(cacheItem), options);
  } catch (error) {
    logger.error(`[STORAGE] Failed to set cache for ${key}`, { error });
  }
};

/**
 * 從緩存獲取數據，檢查過期時間
 * @param key 緩存鍵名
 * @param expiryMs 過期毫秒數，默認15分鐘
 * @returns 緩存數據或null
 */
export const getFromCache = <T>(key: string, expiryMs: number = 15 * 60 * 1000): T | null => {
  try {
    const cookieValue = getCookie(key);
    if (!cookieValue) return null;
    
    // 解析緩存項
    const cacheItem = typeof cookieValue === 'string' 
      ? JSON.parse(cookieValue) 
      : cookieValue;
    
    if (!cacheItem || !cacheItem.data || !cacheItem.timestamp) {
      deleteCookie(key);
      return null;
    }
    
    // 檢查緩存是否過期
    if (Date.now() - cacheItem.timestamp > expiryMs) {
      deleteCookie(key);
      return null;
    }
    
    return cacheItem.data as T;
  } catch (error) {
    // 緩存格式錯誤，清除並返回null
    logger.error(`[STORAGE] Failed to parse cache for ${key}`, { error });
    deleteCookie(key);
    return null;
  }
};

/**
 * 檢查值有效性的工具方法
 * @param value 要檢查的值
 * @returns 是否有效
 */
export const isValidValue = (value: unknown): boolean => {
  if (value === undefined || value === null) return false;
  if (typeof value === 'string' && value.trim() === '') return false;
  return true;
};

// 導出原始版本，以便在需要時使用
export { originalGetCookie, originalSetCookie, originalDeleteCookie }; 