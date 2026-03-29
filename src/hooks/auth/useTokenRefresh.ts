'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { setCookie, getCookie, COOKIE_KEYS } from '@/lib/utils/storage';
import { getTokenRemainingMinutes, isTokenExpired } from '@/lib/utils/auth/jwt-utils';
import auth from '@/lib/api/services/authService';
import { logger } from '@/lib/utils/logger';

/**
 * useTokenRefresh - Token 刷新邏輯
 *
 * 從 AuthContext 抽離出來，集中管理 Token 刷新的邏輯。
 *
 * 功能：
 * - 自動刷新定時器（根據 token 剩餘時間設置）
 * - 用戶活動時檢查並刷新（< 15 分鐘時）
 * - 401 錯誤處理（嘗試刷新或登出）
 *
 * 刷新策略：
 * - 剩餘 > 1 天 → 過期前 1 小時刷新
 * - 剩餘 ≤ 1 天 → 過期前 10 分鐘刷新
 * - 剩餘 < 10 分鐘 → 立即刷新
 */

interface UseTokenRefreshOptions {
  /** 用戶 ID，用於檢查是否可以刷新 */
  userId: string | null;
  /** 是否已認證 */
  isAuthenticated: boolean;
  /** Token 簽發時間，用於觸發定時器重設 */
  tokenIssuedAt: Date | null;
  /** 登出回調，401 處理失敗時調用 */
  onLogout: () => Promise<void>;
}

interface UseTokenRefreshReturn {
  /** 手動刷新 Token */
  refreshToken: () => Promise<boolean>;
  /** 是否正在刷新 */
  isRefreshing: boolean;
}

export function useTokenRefresh({
  userId,
  isAuthenticated,
  tokenIssuedAt,
  onLogout,
}: UseTokenRefreshOptions): UseTokenRefreshReturn {
  const queryClient = useQueryClient();

  // 刷新狀態
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 同步標誌，防止並發刷新和 401 循環
  const isRefreshingRef = useRef(false);
  const isHandling401Ref = useRef(false);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 計算 token 剩餘有效時間（分鐘）
  const calculateRemainingMinutes = useCallback(() => {
    const token = getCookie(COOKIE_KEYS.AUTH_TOKEN);
    if (!token) return null;
    return getTokenRemainingMinutes(token);
  }, []);

  // 刷新 Token
  const refreshToken = useCallback(async (): Promise<boolean> => {
    // 1. 基本檢查 - 只需要 uid
    if (!userId) {
      return false;
    }

    // 2. 同步檢查避免並發刷新
    if (isRefreshingRef.current) {
      return false;
    }
    isRefreshingRef.current = true;
    setIsRefreshing(true);

    try {
      // 3. 檢查當前 token 是否已完全過期
      const currentToken = getCookie(COOKIE_KEYS.AUTH_TOKEN);
      if (!currentToken || isTokenExpired(currentToken, 0)) {
        logger.warn('[Auth] Token expired, cannot refresh');
        return false;
      }

      // 4. 調用刷新 API
      const response = await auth.refreshToken();

      // 5. 處理響應
      const responseData = response?.data as { token?: string } | undefined;
      const newToken = responseData?.token;

      if (!newToken) {
        logger.error('[Auth] Refresh response missing token');
        return false;
      }

      // 6. 更新 Cookies
      setCookie(COOKIE_KEYS.AUTH_TOKEN, newToken);
      setCookie(COOKIE_KEYS.TIA, new Date().toISOString());

      // 7. 刷新所有查詢
      queryClient.invalidateQueries();

      logger.debug('[Auth] Token refreshed successfully');
      return true;
    } catch (error) {
      logger.error('[Auth] Token refresh failed', {}, error instanceof Error ? error : new Error(String(error)));
      return false;
    } finally {
      isRefreshingRef.current = false;
      setIsRefreshing(false);
    }
  }, [userId, queryClient]);

  // 設置自動刷新定時器
  const setupRefreshTimer = useCallback(() => {
    // 清除舊的定時器
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }

    const remaining = calculateRemainingMinutes();
    if (remaining === null || remaining <= 0) {
      return;
    }

    const ONE_DAY_MINUTES = 24 * 60;
    const ONE_HOUR_MINUTES = 60;
    const TEN_MINUTES = 10;

    let refreshInMinutes: number;

    if (remaining > ONE_DAY_MINUTES) {
      // 長期 token：過期前 1 小時刷新
      refreshInMinutes = remaining - ONE_HOUR_MINUTES;
    } else if (remaining > TEN_MINUTES) {
      // 短期 token：過期前 10 分鐘刷新
      refreshInMinutes = remaining - TEN_MINUTES;
    } else {
      // 即將過期：立即刷新
      refreshToken();
      return;
    }

    const refreshInMs = refreshInMinutes * 60 * 1000;

    refreshTimerRef.current = setTimeout(() => {
      refreshToken();
    }, refreshInMs);
  }, [calculateRemainingMinutes, refreshToken]);

  // 監聽認證狀態和 token 時間變化，設置自動刷新
  useEffect(() => {
    if (isAuthenticated && tokenIssuedAt) {
      setupRefreshTimer();
    }

    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    };
  }, [isAuthenticated, tokenIssuedAt, setupRefreshTimer]);

  // 監聽用戶活動，必要時刷新 token
  useEffect(() => {
    if (!isAuthenticated || !tokenIssuedAt) return;

    const checkAndRefreshOnActivity = () => {
      const remaining = calculateRemainingMinutes();
      if (remaining !== null && remaining < 15 && remaining > 0) {
        refreshToken();
      }
    };

    // 監聯 API 調用（通過 React Query）
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event.type === 'added' && event.query.state.status === 'pending') {
        checkAndRefreshOnActivity();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [isAuthenticated, tokenIssuedAt, calculateRemainingMinutes, refreshToken, queryClient]);

  // 監聽 401 錯誤，嘗試刷新 token
  useEffect(() => {
    if (!isAuthenticated) return;

    const handle401 = async () => {
      // 防止重入
      if (isHandling401Ref.current) {
        return;
      }
      isHandling401Ref.current = true;

      try {
        // 檢查 token 是否已完全過期
        const currentToken = getCookie(COOKIE_KEYS.AUTH_TOKEN);
        if (!currentToken || isTokenExpired(currentToken, 0)) {
          logger.debug('[Auth] Token expired on 401, logging out');
          await onLogout();
          return;
        }

        // 嘗試刷新
        const success = await refreshToken();

        if (!success) {
          // 刷新失敗，登出
          await onLogout();
        }
      } finally {
        isHandling401Ref.current = false;
      }
    };

    window.addEventListener('auth:unauthorized', handle401);

    return () => {
      window.removeEventListener('auth:unauthorized', handle401);
    };
  }, [isAuthenticated, refreshToken, onLogout]);

  // 清理定時器的方法（供外部調用，如登出時）
  const clearRefreshTimer = useCallback(() => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  }, []);

  return {
    refreshToken,
    isRefreshing,
  };
}
