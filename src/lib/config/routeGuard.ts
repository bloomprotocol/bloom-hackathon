/**
 * 路由訪問配置類型
 */
export type RouteAccess = {
  path: string | RegExp;
  requireAuth: boolean;
  roles?: string[];
};

/**
 * 受保護路由列表
 */
export const protectedRoutes: RouteAccess[] = [
  { path: '/dashboard', requireAuth: true },
  { path: '/dashboard/*', requireAuth: true },
  { path: '/profile', requireAuth: true },
  { path: '/profile/*', requireAuth: true },
  { path: '/builder/*', requireAuth: false, roles: ['BUILDER'] },
];

/**
 * 檢查路由是否需要認證
 * @param pathname 當前路徑
 * @returns 是否需要認證
 */
export function isProtectedRoute(pathname: string): boolean {
  return protectedRoutes.some(route => {
    if (route.path instanceof RegExp) {
      return route.path.test(pathname) && route.requireAuth;
    }
    
    if (typeof route.path === 'string' && route.path.endsWith('*')) {
      const basePath = route.path.slice(0, -1);
      return pathname.startsWith(basePath) && route.requireAuth;
    }
    
    return route.path === pathname && route.requireAuth;
  });
}

/**
 * 獲取路由需要的角色
 * @param pathname 當前路徑
 * @returns 需要的角色列表或undefined
 */
export function requiredRolesForRoute(pathname: string): string[] | undefined {
  const route = protectedRoutes.find(route => {
    if (route.path instanceof RegExp) {
      return route.path.test(pathname);
    }
    
    if (typeof route.path === 'string' && route.path.endsWith('*')) {
      const basePath = route.path.slice(0, -1);
      return pathname.startsWith(basePath);
    }
    
    return route.path === pathname;
  });
  
  return route?.roles;
} 