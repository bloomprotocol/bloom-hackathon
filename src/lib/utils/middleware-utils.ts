/**
 * Utility functions extracted from middleware for testability
 */

/**
 * 钱包浏览器检测
 * 检查 User Agent 是否包含钱包浏览器标识符
 */
export function detectWalletBrowser(userAgent: string): boolean {
  const walletIdentifiers = [
    'solflare',
    'solflare-mobile',
    'brokerdomain/www.okx.com',
    'okapp',
    'phantom',
    'phantom/ios'
  ];
  
  const userAgentLower = userAgent.toLowerCase();
  
  for (const identifier of walletIdentifiers) {
    if (userAgentLower.includes(identifier.toLowerCase())) {
      return true;
    }
  }
  
  return false;
}

/**
 * Check if request is a prefetch
 */
export function isPrefetchRequest(headers: Headers): boolean {
  return headers.get('purpose') === 'prefetch' || 
         headers.get('x-middleware-prefetch') === '1';
}

/**
 * Get wallet browser cookie config
 */
export function getWalletBrowserCookieConfig(isProduction: boolean) {
  return {
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    httpOnly: false, // Allow client-side reading
    secure: isProduction,
    sameSite: 'lax' as const
  };
}