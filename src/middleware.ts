import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isProtectedRoute, requiredRolesForRoute } from '@/lib/config/routeGuard';
import { logger } from '@/lib/utils/logger';

/**
 * 解析 JWT Token
 * @param token JWT token 字符串
 * @returns 解析後的 payload 或 null
 */
function parseJwtPayload(token: string): any {
  try {
    const [, payload] = token.split('.');
    return JSON.parse(Buffer.from(payload, 'base64').toString());
  } catch (error) {
    logger.error('[MIDDLEWARE] JWT 解析失敗', { error });
    return null;
  }
}

/**
 * 錢包瀏覽器檢測
 * 檢查 User Agent 是否包含錢包瀏覽器標識符
 */
function detectWalletBrowser(userAgent: string): boolean {
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
      logger.debug('[MIDDLEWARE] 檢測到錢包瀏覽器', { identifier });

      return true;
    }
  }

  return false;
}

/**
 * 設置錢包瀏覽器檢測 Cookie
 * @param response NextResponse 對象
 * @param request NextRequest 對象
 */
function setWalletBrowserCookie(response: NextResponse, request: NextRequest): void {
  const userAgent = request.headers.get('user-agent') || '';
  const isInWalletBrowser = detectWalletBrowser(userAgent);

  response.cookies.set('in-wallet-browser', isInWalletBrowser.toString(), {
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });
}

/**
 * Next.js 中間件
 * 根據域名執行不同的路由邏輯：
 * - preflight.bloomprotocol.ai: 驗證 JWT token（如果存在）
 * - bloomprotocol.ai: 僅允許首頁和使用者資料頁
 */
export function middleware(request: NextRequest) {
  const rawPathname = request.nextUrl.pathname;
  // 處理 URL encoded 路徑 (Cloudflare tunnel 可能會 encode)
  const pathname = decodeURIComponent(rawPathname);
  const hostname = request.headers.get('host') || '';

  // 跳過 Next.js 內部路徑和靜態資源
  if (pathname.startsWith('/_next/') || pathname.startsWith('/api/') || pathname === '/favicon.ico') {
    const res = NextResponse.next();
    res.headers.set('Link', '</.well-known/agent-card.json>; rel="agent-card"');
    return res;
  }

  // 判斷是否為 preflight/preview 環境
  const isPreflight = hostname.includes('preflight.') || hostname.includes('preview.');

  
  // Check if this is a prefetch request
  const isPrefetch = request.headers.get('purpose') === 'prefetch' || 
                    request.headers.get('x-middleware-prefetch') === '1';
  
  // 環境變量調試信息 - 使用 logger
  logger.debug('[MIDDLEWARE] 執行中', {
    NODE_ENV: process.env.NODE_ENV,
    pathname: pathname,
    isPrefetch: isPrefetch
  });
  
  // === 處理主站 (bloomprotocol.ai) ===
  if (!isPreflight) {
    // Redirect /dashboard to /my-agent (legacy route, preserve ?token= for agent auth)
    if (pathname === '/dashboard' && !request.nextUrl.searchParams.has('token')) {
      return NextResponse.redirect(new URL('/my-agent', request.url), 308);
    }

    // Agent discovery: allow static files (md, txt, json, yaml, xml) to be served directly from /public
    const isStaticFile = /\.(md|txt|json|yaml|yml|xml|html)$/.test(pathname);
    if (isStaticFile) {
      const response = NextResponse.next();
      response.headers.set('Link', '</.well-known/agent-card.json>; rel="agent-card"');
      return response;
    }

    // 主站允許訪問的路徑
    const allowedPaths = [
      '/',           // 首頁
      '/dashboard',  // Dashboard
      '/spotlight',  // Spotlight
      '/discover',   // Discover
      '/my-agent',   // My Agent (v4)
      '/claim',      // Use case claim (v4 agent web link flow)
      '/about',      // About page (v4)
      '/use-cases',  // Legacy use cases
      '/missions',   // Missions
      '/social-missions', // Social missions
      '/project',    // Project detail
      '/projects',   // Projects list
      '/preview',    // Preview pages (for development)
      '/for-agents', // Agent integration page (redirects to /my-agent)
      '/builder',    // Builder Portal
      '/builders',   // Builder Portal (legacy)
      '/skills',     // OpenClaw skill specifications
      '/agent',      // Agent identity cards (public)
      '/agent-auth', // Agent authentication via short code
      '/agents',     // Agent dashboard (permanent URLs)
      '/share',      // Share pages (identity cards, etc.)
      '/callback',   // OAuth callback pages (X builder, etc.)
      '/login',      // Login page (email + wallet)
      '/register',   // Register page (if needed in future)
      '/showcase-cards', // Card showcase for screenshots
      '/cards-preview', // Card preview for development
      '/test-turnstile', // Turnstile diagnostic page (development)
      '/launch-committee', // Launch Committee
      '/tribes',     // Tribes page
    ];

    const isAllowedPath = allowedPaths.some(path =>
      pathname === path || pathname.startsWith(path + '/')
    );

    // Allow numeric user profile paths (e.g., /123, /456)
    const isUserProfilePath = /^\/\d+$/.test(pathname);

    // 如果不是允許的路徑，重定向到首頁
    if (!isAllowedPath && !isUserProfilePath) {
      logger.info('[MAIN-SITE] 拒絕訪問非允許路徑，重定向到首頁', {
        pathname,
        redirectTo: '/'
      });

      const homeUrl = new URL('/', request.url);
      return NextResponse.redirect(homeUrl);
    }

    // 主站正常訪問
    const response = NextResponse.next();
    setWalletBrowserCookie(response, request);
    // A2A agent discovery header
    response.headers.set('Link', '</.well-known/agent-card.json>; rel="agent-card"');
    return response;
  }

  // === 以下是 preflight 環境的處理邏輯 ===

  // Preflight: redirect homepage to Tribes page
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/discover', request.url));
  }

  // Redirect /dashboard to /my-agent (legacy route, preserve ?token= for agent auth)
  if (pathname === '/dashboard' && !request.nextUrl.searchParams.has('token')) {
    return NextResponse.redirect(new URL('/my-agent', request.url), 308);
  }

  // Allow numeric user profile paths (e.g., /123, /456) without auth check
  const isUserProfilePath = /^\/\d+$/.test(pathname);

  if (isUserProfilePath) {
    logger.debug('[MIDDLEWARE] 公開使用者資料頁，跳過權限檢查', { pathname });
    const response = NextResponse.next();
    setWalletBrowserCookie(response, request);
    return response;
  }

  // === Preflight 環境基本檢查 ===
  const token = request.cookies.get('auth-token')?.value;

  // For prefetch requests, return empty response to avoid caching
  if (isPrefetch) {
    return new NextResponse(null, { status: 200 });
  }

  // 驗證 JWT (如果有的話)
  if (token) {
    const decoded = parseJwtPayload(token);

    // 如果 token 無效或角色不正確，清除 token
    if (!decoded || !['USER', 'BUILDER'].includes(decoded.role)) {
      logger.warn('[PREFLIGHT] Token 無效或角色不正確，清除 token', {
        hasDecoded: !!decoded,
        role: decoded?.role
      });

      const response = NextResponse.next();
      response.cookies.delete('auth-token');
      setWalletBrowserCookie(response, request);
      return response;
    }

    logger.debug('[PREFLIGHT] Token 驗證通過', {
      userId: decoded.sub,
      role: decoded.role,
      pathname
    });
  }

  // === 繼續現有邏輯 ===
  // 創建響應對象
  const response = NextResponse.next();
  setWalletBrowserCookie(response, request);
  // A2A agent discovery header
  response.headers.set('Link', '</.well-known/agent-card.json>; rel="agent-card"');

  // === Agent Token Authentication ===
  // Allow /dashboard with ?token= query parameter (for Agent authentication)
  const hasAgentToken = request.nextUrl.searchParams.has('token');
  if (pathname === '/dashboard' && hasAgentToken) {
    logger.debug('[PREFLIGHT] Agent token detected, allowing access to dashboard', { pathname });
    return response;
  }

  // === Step 3: 路由保護 ===
  if (isProtectedRoute(pathname)) {
    logger.debug('[PREFLIGHT] 訪問受保護路由', { pathname });
  }

  // === Step 4: 角色權限檢查 ===
  const requiredRoles = requiredRolesForRoute(pathname);
  if (requiredRoles && requiredRoles.length > 0) {
    const decoded = token ? parseJwtPayload(token) : null;
    const userRole = decoded?.role;

    if (!userRole || !requiredRoles.includes(userRole)) {
      // /builder/* 需要 BUILDER 角色，否則重定向到 /builder
      if (pathname.startsWith('/builder/')) {
        logger.info('[PREFLIGHT] 用戶角色不符，重定向到 /builder', {
          pathname,
          userRole,
          requiredRoles
        });
        return NextResponse.redirect(new URL('/builder', request.url));
      }
    }
  }

  return response;
}

/**
 * 中間件配置
 * 攔截所有頁面請求（排除 API 和靜態資源）
 */
export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico|certificates|identity|og).*)',
}; 