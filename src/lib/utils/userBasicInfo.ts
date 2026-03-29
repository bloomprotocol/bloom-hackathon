import { logger } from '@/lib/utils/logger';
import { getCookie, COOKIE_KEYS } from '@/lib/utils/storage';

// 用戶基本信息類型
export type UserBasicInfo = {
  userAgent: string;
  platform: string;
  language: string;
  secCHUA: string;
  browser: string;
  uid: string | null;
  screenSize?: {
    width: number;
    height: number;
  };
  referrer?: string;
  entryPath?: string;
  timestamp: number;
}

// UserAgentData 接口定義
interface NavigatorUserAgentData {
  platform?: string;
  brands?: Array<{
    brand: string;
    version: string;
  }>;
}

// 擴展 Navigator 類型以支持 userAgentData
interface ExtendedNavigator extends Navigator {
  userAgentData?: NavigatorUserAgentData;
}

// 上次已记录的 uid，undefined 表示未记录过
let lastLoggedUid: string | null | undefined = undefined;

/**
 * 獲取用戶基本信息 - 僅在 uid 變化時記錄到 logger
 */
export function getUserBasicInfo(): UserBasicInfo {
  const userBasicInfo = collectUserBasicInfo();
  
  // 只有當 uid 與上次不同時記錄一次
  if (typeof window !== 'undefined' && userBasicInfo.uid !== lastLoggedUid) {
    lastLoggedUid = userBasicInfo.uid;
  }
  
  return userBasicInfo;
}

/**
 * 收集用戶基本信息的內部函數
 */
function collectUserBasicInfo(): UserBasicInfo {
  // 默認值 (用於服務器端渲染)
  const defaultInfo: UserBasicInfo = {
    userAgent: '',
    timestamp: Date.now(),
    referrer: '',    // 默认空 referrer
    entryPath: '',    // 默认空 entryPath
    browser: '',
    platform: '',   // 默认空平台
    language: '',   // 默认空语言
    secCHUA: '',    // 默认空 UA Client Hints
    uid: null        // 默认空 uid
  };
  
  if (typeof window === 'undefined') {
    return defaultInfo;
  }
  
  const userAgent = window.navigator.userAgent;
  
  // 從 cookie 獲取 uid
  const uid = getCookie(COOKIE_KEYS.SUB)?.toString() ?? null;
  
  // 檢測瀏覽器
  let browser = 'Unknown';
  if (/Edg\//.test(userAgent)) {
    browser = 'Edge';
  } else if (/OPR\//.test(userAgent)) {
    browser = 'Opera';
  } else if (/Chrome\//.test(userAgent)) {
    browser = 'Chrome';
  } else if (/Safari\//.test(userAgent) && !/Chrome\//.test(userAgent)) {
    browser = 'Safari';
  } else if (/Firefox\//.test(userAgent)) {
    browser = 'Firefox';
  } else if (/MSIE \d|Trident\//.test(userAgent)) {
    browser = 'Internet Explorer';
  }
  
  // 獲取平台信息
  const extendedNavigator = navigator as ExtendedNavigator;
  const platform = extendedNavigator.userAgentData?.platform || 
                   navigator.platform || 
                   'Unknown';
  
  // 獲取語言信息
  const language = navigator.language || 
                  (Array.isArray(navigator.languages) ? navigator.languages.join(',') : 'Unknown');
  
  // 獲取 Sec-CH-UA 客戶端提示
  const secCHUA = extendedNavigator.userAgentData?.brands
    ? JSON.stringify(extendedNavigator.userAgentData.brands)
    : 'Unknown';
  
  return {
    userAgent,
    browser,
    uid,
    platform,
    language,
    secCHUA,
    screenSize: {
      width: window.innerWidth,
      height: window.innerHeight
    },
    referrer: document.referrer,
    entryPath: window.location.pathname,
    timestamp: Date.now()
  };
} 