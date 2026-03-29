'use client';

import { useCallback } from 'react';
import { getUserBasicInfo } from '@/lib/utils/userBasicInfo';
import { backgroundProcess, resetFingerprintSession } from '@/lib/utils/userFinger';

/**
 * useAuthFingerprint - 認證相關的指紋採集邏輯
 *
 * 從 AuthContext 抽離出來，集中管理指紋採集的時機和邏輯。
 *
 * 使用時機：
 * - 初始化時（未登入）→ collectOnInit()
 * - 登入成功後 → collectOnLogin(walletAddress)
 * - 登出時 → resetOnLogout()
 */
export function useAuthFingerprint() {
  /**
   * 初始化時採集用戶基本信息
   * 用於未登入用戶的指紋採集
   */
  const collectOnInit = useCallback(() => {
    getUserBasicInfo();
  }, []);

  /**
   * 登入成功後的指紋採集流程
   * 1. 重置指紋 session（關聯新的錢包地址）
   * 2. 採集用戶基本信息
   * 3. 延遲執行背景指紋採集
   *
   * @param walletAddress 用戶的錢包地址
   */
  const collectOnLogin = useCallback((walletAddress: string) => {
    // 重置指紋搜集狀態，關聯錢包地址
    resetFingerprintSession(walletAddress);

    // 採集已登入用户基本信息
    getUserBasicInfo();

    // 延遲執行背景指紋採集
    setTimeout(() => {
      backgroundProcess(200);
    }, 200);
  }, []);

  /**
   * 登出時重置指紋 session
   * 清除與用戶關聯的指紋狀態
   */
  const resetOnLogout = useCallback(() => {
    resetFingerprintSession();
  }, []);

  return {
    collectOnInit,
    collectOnLogin,
    resetOnLogout,
  };
}
