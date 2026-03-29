/**
 * Token 相关的纯函数工具
 */

/**
 * 计算 token 剩余有效时间（分钟）
 * @param tokenIssuedAt Token 签发时间
 * @param currentTime 当前时间（可选，用于测试）
 * @param expirationMs Token 有效期（毫秒，默认1小时）
 * @returns 剩余分钟数，如果没有签发时间则返回 null
 */
export function calculateTokenRemainingMinutes(
  tokenIssuedAt: Date | null,
  currentTime: Date = new Date(),
  expirationMs: number = 60 * 60 * 1000 // 默认1小时
): number | null {
  if (!tokenIssuedAt) return null;
  
  const expiresAt = new Date(tokenIssuedAt.getTime() + expirationMs);
  const remainingMs = expiresAt.getTime() - currentTime.getTime();
  const remainingMinutes = Math.floor(remainingMs / (1000 * 60));
  
  return remainingMinutes;
}

/**
 * 判断是否需要刷新 token
 * @param remainingMinutes 剩余分钟数
 * @param proactiveThreshold 主动刷新阈值（默认10分钟）
 * @returns 是否需要刷新
 */
export function shouldRefreshToken(
  remainingMinutes: number | null,
  proactiveThreshold: number = 10
): boolean {
  if (remainingMinutes === null) return false;
  return remainingMinutes <= proactiveThreshold && remainingMinutes > 0;
}

/**
 * 判断是否需要基于活动刷新 token
 * @param remainingMinutes 剩余分钟数
 * @param activityThreshold 活动刷新阈值（默认15分钟）
 * @returns 是否需要刷新
 */
export function shouldRefreshOnActivity(
  remainingMinutes: number | null,
  activityThreshold: number = 15
): boolean {
  if (remainingMinutes === null) return false;
  return remainingMinutes < activityThreshold && remainingMinutes > 0;
}

/**
 * 解析 ISO 时间字符串
 * @param isoString ISO 时间字符串
 * @returns Date 对象或 null
 */
export function parseTokenIssuedAt(isoString: string | null | undefined): Date | null {
  if (!isoString) return null;
  
  try {
    const date = new Date(isoString);
    // 检查是否是有效日期
    if (isNaN(date.getTime())) {
      return null;
    }
    return date;
  } catch {
    return null;
  }
}