/**
 * JWT 解析工具 - 用於讀取 token 過期時間
 * 注意：這是客戶端解析，不驗證簽名（簽名驗證在後端進行）
 */

/**
 * Base64 URL-safe 解碼（兼容 Node.js 和 Browser）
 * JWT 使用 URL-safe Base64 編碼（-_ 替代 +/）
 */
function base64UrlDecode(str: string): string {
  // 將 URL-safe 字符轉換回標準 Base64
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');

  // 補齊 padding
  const pad = base64.length % 4;
  if (pad) {
    base64 += '='.repeat(4 - pad);
  }

  // 解碼
  if (typeof window !== 'undefined' && typeof atob === 'function') {
    // Browser 環境
    return atob(base64);
  } else {
    // Node.js SSR 環境
    return Buffer.from(base64, 'base64').toString('utf-8');
  }
}

/**
 * 解析 JWT payload（不驗證簽名）
 * @param token JWT token 字符串
 * @returns payload 對象或 null
 */
export function parseJwtPayload(token: string): {
  exp?: number;
  iat?: number;
  sub?: string;
  role?: string;
} | null {
  if (!token || typeof token !== 'string') {
    return null;
  }

  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const payloadBase64 = parts[1];
    if (!payloadBase64) {
      return null;
    }

    const payloadJson = base64UrlDecode(payloadBase64);
    const payload = JSON.parse(payloadJson);

    // 基本驗證：確保 exp 是數字
    if (payload.exp !== undefined && typeof payload.exp !== 'number') {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * 從 JWT 獲取過期時間
 * @param token JWT token
 * @returns 過期日期或 null
 */
export function getTokenExpiry(token: string): Date | null {
  const payload = parseJwtPayload(token);
  if (!payload?.exp) {
    return null;
  }

  // JWT exp 是秒級時間戳，轉換為毫秒
  return new Date(payload.exp * 1000);
}

/**
 * 計算 token 剩余有效時間（分鐘）
 * @param token JWT token
 * @returns 剩余分鐘數或 null
 */
export function getTokenRemainingMinutes(token: string): number | null {
  const expiresAt = getTokenExpiry(token);
  if (!expiresAt) {
    return null;
  }

  const remainingMs = expiresAt.getTime() - Date.now();
  return Math.floor(remainingMs / (1000 * 60));
}

/**
 * 檢查 token 是否已過期
 * @param token JWT token
 * @param bufferSeconds 緩衝時間（秒），默認 30 秒
 * @returns true 表示已過期或即將過期
 */
export function isTokenExpired(token: string, bufferSeconds: number = 30): boolean {
  const expiresAt = getTokenExpiry(token);
  if (!expiresAt) {
    return true; // 無法解析視為過期
  }

  return Date.now() >= expiresAt.getTime() - (bufferSeconds * 1000);
}
