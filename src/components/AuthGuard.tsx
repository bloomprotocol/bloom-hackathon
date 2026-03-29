"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { isProtectedRoute, requiredRolesForRoute } from '@/lib/config/routeGuard';
import randomWelcomeMessage from '@/lib/utils/welcomeMessages';
import { logger } from '@/lib/utils/logger';
import { getCookie, COOKIE_KEYS } from '@/lib/utils/storage';

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * 身份驗證守衛組件
 * 用於保護需要用戶登錄才能訪問的路由
 */
export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, hasRole } = useAuth();
  const [welcomeMsg, setWelcomeMsg] = useState<string>("Loading...");
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    // 在客户端設置隨機消息
    setWelcomeMsg(randomWelcomeMessage.message);
    
    // 調試信息
    logger.debug('[AuthGuard] 檢查認證狀態', {
      pathname,
      isAuthenticated,
      isLoading
    });
    
    // 檢查當前路徑是否需要保護
    const requiresAuth = isProtectedRoute(pathname || '');
    const requiredRoles = requiredRolesForRoute(pathname || '');
    
    logger.debug('[AuthGuard] 路徑訪問權限', {
      requiresAuth,
      requiredRoles
    });
    
    if (requiresAuth && !isLoading) {
      // Check cookies as fallback when React state might not be synced
      const hasAuthCookie = !!getCookie(COOKIE_KEYS.AUTH_TOKEN);
      
      if (!isAuthenticated && !hasAuthCookie) {
        // 未登錄但需要認證，重定向到首頁
        logger.warn('[AuthGuard] 未授權訪問，重定向到首頁');
        router.push('/');
        setIsAuthorized(false);
        return;
      } else if (hasAuthCookie) {
        // Cookie exists, allow access even if React state not synced yet
        logger.debug('[AuthGuard] 已認證（通過 cookie），允許訪問');
      } else {
        logger.debug('[AuthGuard] 已認證，允許訪問');
      }
      
      // 檢查角色權限
      if (requiredRoles && requiredRoles.length > 0) {
        const hasRequiredRole = hasRole(requiredRoles);
        logger.debug('[AuthGuard] 角色檢查', {
          requiredRoles,
          hasRequiredRole
        });
        
        if (!hasRequiredRole) {
          logger.warn('[AuthGuard] 無權限訪問此頁面');
          router.push('/');
          setIsAuthorized(false);
          return;
        }
      }
    }
    
    // 不需要認證，或已通過認證和權限檢查
    logger.debug('[AuthGuard] 訪問已授權');
    setIsAuthorized(true);
  }, [router, pathname, isAuthenticated, isLoading, hasRole]);

  // 如果認證狀態尚未確定，顯示加載狀態
  if (isLoading || isAuthorized === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-blue-500 border-solid rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg">{welcomeMsg}</p>
        </div>
      </div>
    );
  }

  // 如果已授權，顯示子組件
  return isAuthorized ? <>{children}</> : null;
} 