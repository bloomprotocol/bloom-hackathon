import { test as base } from '@playwright/test';

// 測試配置
const TEST_WALLET = '82tYWDm5kgCxPVG8A5eyKL4KdVdR2esgq6FExudrMqYW';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3005';

// 擴展基礎測試類型
export type AuthFixtures = {
  authenticatedPage: any; // 這裡使用 any 是因為 Page 類型已經在 context 中
};

/**
 * 統一的認證測試夾具
 * 所有需要登錄狀態的測試都會使用這個夾具
 * 通過 API 直接獲取認證，避免複雜的錢包插件操作
 */
export const authenticatedTest = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page, context }, use) => {
    console.log('🔐 開始 API 認證流程...');
    
    try {
      // 1. 清除所有 cookies，確保乾淨狀態
      await context.clearCookies();
      console.log('🧹 已清除所有 cookies');
      
      // 2. 調用登錄 API
      const response = await page.request.post(`${API_BASE_URL}/auth/user/wallet/login`, {
        data: {
          address: TEST_WALLET
        }
      });
      
      if (!response.ok()) {
        throw new Error(`認證失敗: ${response.status()} ${response.statusText()}`);
      }
      
      const authResponse = await response.json();
      
      // API 返回格式: { success: true, data: { token, user } }
      const authData = authResponse.data || authResponse;
      console.log('✅ API 認證成功, 用戶 ID:', authData.user?.sub);
      
      // 2. 設置認證 Cookies - 基於前端的 COOKIE_KEYS
      const cookies = [
        {
          name: 'auth-token',
          value: authData.token || authData.accessToken || '',
          domain: 'localhost',
          path: '/',
          httpOnly: false,
          secure: false,
          sameSite: 'Lax' as const,
        },
        {
          name: 'wallet-address',
          value: TEST_WALLET,
          domain: 'localhost',
          path: '/',
          httpOnly: false,
          secure: false,
          sameSite: 'Lax' as const,
        },
        {
          name: 'sub', // user id
          value: authData.user?.sub || authData.user?.uid || authData.user?.id || '',
          domain: 'localhost',
          path: '/',
          httpOnly: false,
          secure: false,
          sameSite: 'Lax' as const,
        },
        {
          name: 'role',
          value: authData.user?.role || 'SUPPORTER',
          domain: 'localhost',
          path: '/',
          httpOnly: false,
          secure: false,
          sameSite: 'Lax' as const,
        },
        {
          name: 'tia', // token issued at
          value: new Date().toISOString(),
          domain: 'localhost',
          path: '/',
          httpOnly: false,
          secure: false,
          sameSite: 'Lax' as const,
        }
      ];
      
      await context.addCookies(cookies);
      console.log('🍪 Cookies 設置完成');
      
      // 3. 清除任何現有的頁面狀態，強制重新初始化
      await page.goto('about:blank');
      
      // 4. 導航到首頁，此時 AuthContext 會在初始化時讀取 cookies
      await page.goto('/');
      
      // 5. 等待頁面加載和認證狀態更新
      await page.waitForLoadState('networkidle');
      
      console.log('⏳ 等待認證狀態生效...');
      
      // 使用 Playwright 的智能等待 - 等待錢包地址出現
      try {
        await page.waitForSelector('button:has-text("82tYW")', { 
          timeout: 10000,
          state: 'visible' 
        });
        console.log('✅ 錢包地址已顯示，認證成功');
      } catch (error) {
        console.warn('⚠️ 等待超時：錢包地址未出現');
        
        // 調試用：檢查 Connect 按鈕是否還在
        const connectCount = await page.locator('button:has-text("Connect")').count();
        if (connectCount > 0) {
          console.log(`⚠️ 仍有 ${connectCount} 個 Connect 按鈕`);
        }
      }
      
      console.log('✅ 認證夾具設置完成');
      
    } catch (error) {
      console.error('❌ 認證失敗:', error);
      throw error;
    }
    
    // 使用已認證的頁面
    await use(page);
  }
});

// 導出基礎測試和 expect（不需要認證的測試）
export const test = base;
export { expect } from '@playwright/test';