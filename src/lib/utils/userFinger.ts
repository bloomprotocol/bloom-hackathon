import { getFingerprintData, getFingerprint } from "@thumbmarkjs/thumbmarkjs";
import fingerprintServices from '@/lib/api/services/fingerprintService';
import { logger } from '@/lib/utils/logger';
import { getCookie, COOKIE_KEYS } from '@/lib/utils/storage';

// 數據類型定義
interface FingerprintDataType {
  locales?: {
    timezone?: string;
    languages?: string[];
  };
  system?: {
    useragent?: string;
    platform?: string;
    cookieEnabled?: boolean;
    productSub?: string;
    product?: string;
    hardwareConcurrency?: number;
    browser?: {
      name?: string;
      version?: string;
    };
    applePayVersion?: number;
  };
  webgl?: {
    commonImageHash?: string;
  };
  canvas?: {
    commonImageDataHash?: string;
  };
  audio?: {
    sampleHash?: number;
    oscillator?: string;
    maxChannels?: number;
    channelCountMode?: string;
  };
  fonts?: {
    [fontName: string]: number;
  };
  hardware?: {
    videocard?: {
      vendor?: string;
      renderer?: string;
      version?: string;
      shadingLanguageVersion?: string;
    };
    architecture?: number;
    deviceMemory?: string;
    jsHeapSizeLimit?: number;
  };
  permissions?: {
    [permission: string]: string;
  };
  plugins?: {
    plugins?: string[];
  };
  screen?: {
    is_touchscreen?: boolean;
    maxTouchPoints?: number;
    colorDepth?: number;
    mediaMatches?: string[];
  };
  math?: {
    [calculation: string]: number;
  };
  [key: string]: unknown;
}

// 基於 session 的搜集標記 - 每次登入重置
let sessionFingerprintCollected = false;
let currentSessionWallet: string | null = null;

/**
 * 重置 session 標記（在登入或登出時調用）
 */
export function resetFingerprintSession(walletAddress?: string): void {
  sessionFingerprintCollected = false;
  currentSessionWallet = walletAddress || null;
  
  if (process.env.NODE_ENV === 'development') {
  }
}

/**
 * 檢查當前 session 是否已經搜集過指紋
 */
function hasCollectedInCurrentSession(walletAddress: string): boolean {
  return sessionFingerprintCollected && currentSessionWallet === walletAddress;
}

/**
 * 外部可調用的檢查函數
 * @param walletAddress 錢包地址
 * @returns 是否已經在當前 session 搜集過指紋
 */
export function hasCollectedForCurrentSession(walletAddress: string): boolean {
  return hasCollectedInCurrentSession(walletAddress);
}

// 處理狀態標記
let isProcessing = false;

/**
 * 為等候名單功能收集指紋數據
 * 只收集數據，不發送到 API
 * @param email 用戶的電子郵件地址
 * @param tag 標籤
 * @param source 來源
 * @returns 收集到的指紋數據，如果收集失敗則返回 null
 */
export async function collectFingerprintForWaitlist(email: string, tag: string, source: string): Promise<{
  fingerprint_hash: string;
  user_agent: string;
  city: string;
  country: string;
  location_label: string;
  source: string;
  tag: string;
  extra: Record<string, unknown>;
} | null> {
  try {
    // 收集數據
    const rawData = await getFingerprintData().catch(err => {
      logger.error('[Waitlist][FP][ERROR_1]', { error: err });
      return null;
    });
    
    if (!rawData) {
      logger.error('[Waitlist][FP][ERROR_2] Process failed');
      return null;
    }
    
    const data = rawData as FingerprintDataType;
    const hash = await getFingerprint().catch(err => {
      logger.error('[Waitlist][FP][ERROR_3]', { error: err });
      return 'unknown';
    });
    
    // 紀錄指紋數據以便調試
    
    // 提取地理位置
    let city = 'unknown';
    let country = 'unknown';
    
    try {
      if (data?.locales?.timezone) {
        const parts = String(data.locales.timezone).split('/');
        if (parts.length >= 2) {
          city = parts[parts.length - 1].replace(/_/g, ' ');
          country = parts[0].replace(/_/g, ' ');
        }
      }
    } catch (tzError) {
      logger.error('[Waitlist][FP][ERROR_4]', { error: tzError });
    }
    
    // 準備數據 - 擴展 extra 字段以包含更多信息
    const extra: Record<string, unknown> = {};
    
    // 添加 email 到 extra
    extra.email = email;
    
    // 將所有收集到的數據放入 extra（除了已經在主要字段中的）
    // Audio 數據
    if (data?.audio) {
      extra.audio = data.audio;
    }
    
    // Canvas 數據
    if (data?.canvas) {
      extra.canvas = data.canvas;
    }
    
    // WebGL 數據
    if (data?.webgl) {
      extra.webgl = data.webgl;
    }
    
    // 硬件數據
    if (data?.hardware) {
      extra.hardware = data.hardware;
    }
    
    // 屏幕數據
    if (data?.screen) {
      extra.screen = data.screen;
    }
    
    // 字體數據
    if (data?.fonts) {
      extra.fonts = data.fonts;
    }
    
    // 插件數據
    if (data?.plugins) {
      extra.plugins = data.plugins;
    }
    
    // 權限數據
    if (data?.permissions) {
      extra.permissions = data.permissions;
    }
    
    // 數學計算數據
    if (data?.math) {
      extra.math = data.math;
    }
    
    // 語言和地區數據（完整的，不只是 languages）
    if (data?.locales) {
      extra.locales = data.locales;
    }
    
    // 系統數據（除了 useragent，因為它已經在主字段中）
    if (data?.system) {
      // 解構系統數據，去掉useragent
      const { ...systemRest } = data.system;
      if (systemRest.useragent) {
        delete systemRest.useragent;
      }
      extra.system = systemRest;
    }
    
    // 添加任何其他未明確列出的數據字段
    Object.keys(data).forEach(key => {
      // 跳過已經處理過的字段
      const processedFields = [
        'audio', 'canvas', 'webgl', 'hardware', 'screen', 
        'fonts', 'plugins', 'permissions', 'math', 'locales', 'system'
      ];
      
      if (!processedFields.includes(key) && data[key] !== undefined) {
        extra[key] = data[key];
      }
    });
    
    // 返回指紋數據
    return {
      fingerprint_hash: hash,
      user_agent: data?.system?.useragent || '',
      city: city,
      country: country,
      location_label: "",
      source: source, // 使用傳入的 source
      tag: tag, // 使用傳入的 tag
      extra: extra
    };
    
  } catch {
    logger.error('[Waitlist][FP][ERROR_X] Unknown error', { status: 'failed' });
    return null;
  }
}

/**
 * 收集並發送訪問數據
 */
async function collectAndSendData(): Promise<boolean> {
  try {
    // 收集數據
    const rawData = await getFingerprintData().catch(err => {
      logger.error('[BZY][ERROR_1]', { error: err });
      return null;
    });
    
    if (!rawData) {
      logger.error('[BZY][ERROR_2] Process failed');
      return false;
    }
    
    const data = rawData as FingerprintDataType;
    const hash = await getFingerprint().catch(err => {
      logger.error('[BZY][ERROR_3]', { error: err });
      return 'unknown';
    });
    
    // 展示完整的 fingerprint 數據
    
    // 提取地理位置
    let city = 'unknown';
    let country = 'unknown';
    
    try {
      if (data?.locales?.timezone) {
        const parts = String(data.locales.timezone).split('/');
        if (parts.length >= 2) {
          city = parts[parts.length - 1].replace(/_/g, ' ');
          country = parts[0].replace(/_/g, ' ');
        }
      }
    } catch (tzError) {
      logger.error('[BZY][ERROR_4]', { error: tzError });
    }
    
    // 準備數據 - 擴展 extra 字段以包含更多信息
    const extra: Record<string, unknown> = {};
    
    // 將所有收集到的數據放入 extra（除了已經在主要字段中的）
    // Audio 數據
    if (data?.audio) {
      extra.audio = data.audio;
    }
    
    // Canvas 數據
    if (data?.canvas) {
      extra.canvas = data.canvas;
    }
    
    // WebGL 數據
    if (data?.webgl) {
      extra.webgl = data.webgl;
    }
    
    // 硬件數據
    if (data?.hardware) {
      extra.hardware = data.hardware;
    }
    
    // 屏幕數據
    if (data?.screen) {
      extra.screen = data.screen;
    }
    
    // 字體數據
    if (data?.fonts) {
      extra.fonts = data.fonts;
    }
    
    // 插件數據
    if (data?.plugins) {
      extra.plugins = data.plugins;
    }
    
    // 權限數據
    if (data?.permissions) {
      extra.permissions = data.permissions;
    }
    
    // 數學計算數據
    if (data?.math) {
      extra.math = data.math;
    }
    
    // 語言和地區數據（完整的，不只是 languages）
    if (data?.locales) {
      extra.locales = data.locales;
    }
    
    // 系統數據（除了 useragent，因為它已經在主字段中）
    if (data?.system) {
      // 解構系統數據，去掉useragent
      const { ...systemRest } = data.system;
      if (systemRest.useragent) {
        delete systemRest.useragent;
      }
      extra.system = systemRest;
    }
    
    // 添加任何其他未明確列出的數據字段
    Object.keys(data).forEach(key => {
      // 跳過已經處理過的字段
      const processedFields = [
        'audio', 'canvas', 'webgl', 'hardware', 'screen', 
        'fonts', 'plugins', 'permissions', 'math', 'locales', 'system'
      ];
      
      if (!processedFields.includes(key) && data[key] !== undefined) {
        extra[key] = data[key];
      }
    });
    
    // 展示將要發送的數據
    
    // 發送數據
    const payload = {
      "fingerprint_hash": hash,
      "user_agent": data?.system?.useragent || '',
      "city": city,
      "country": country,
      "location_label": "",
      "source": "tm",
      "extra": extra
    };
    
    // 發送請求
    try {
      const response = await fingerprintServices.trackFingerprint(payload);
      if (!response.success) {
        logger.warn('[BZY][WARN] API response not success');
      }
      return true;
    } catch {
      logger.error('[BZY][ERROR_5] Request error', { status: 'failed' });
      return false;
    }
  } catch {
    logger.error('[BZY][ERROR_X] Unknown error', { status: 'failed' });
    return false;
  }
}

/**
 * 主入口函數: 檢查登入狀態並處理用戶訪問數據
 * 只有在用戶已登入且本次 session 未搜集時才執行
 */
export function backgroundProcess(delayMs = 200): void {
  // 0. 檢查處理狀態 - 避免重複執行
  if (isProcessing) {
    if (process.env.NODE_ENV === 'development') {
      
    }
    return;
  }
  
  // 1. 檢查用戶登入狀態
  const authToken = getCookie(COOKIE_KEYS.AUTH_TOKEN);
  const walletAddress = getCookie(COOKIE_KEYS.WALLET_ADDRESS);
  const userId = getCookie(COOKIE_KEYS.SUB);
  
  if (!authToken || !walletAddress || !userId) {
    if (process.env.NODE_ENV === 'development') {
      
    }
    return;
  }
  
  // 2. 檢查當前 session 是否已經搜集過
  if (hasCollectedInCurrentSession(String(walletAddress))) {
    if (process.env.NODE_ENV === 'development') {
    }
    return;
  }
  
  // 標記開始處理
  isProcessing = true;
  
  if (process.env.NODE_ENV === 'development') {
  }
  
  // 3. 延遲執行數據收集和發送
  setTimeout(() => {
    // 再次檢查登入狀態，避免在延遲期間用戶登出
    const currentToken = getCookie(COOKIE_KEYS.AUTH_TOKEN);
    const currentWallet = getCookie(COOKIE_KEYS.WALLET_ADDRESS);
    
    if (!currentToken || !currentWallet || currentWallet !== walletAddress) {
      if (process.env.NODE_ENV === 'development') {
      }
      isProcessing = false;
      return;
    }
    
    collectAndSendData().finally(() => {
      // 標記當前 session 已搜集
      sessionFingerprintCollected = true;
      currentSessionWallet = String(walletAddress);
      isProcessing = false;
      
      if (process.env.NODE_ENV === 'development') {
      }
    });
  }, delayMs);
} 