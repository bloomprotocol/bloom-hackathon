import { test, expect } from '@playwright/test';
import { authenticatedTest } from '../../fixtures/auth.fixture';

authenticatedTest.describe('登入流程測試', () => {
  authenticatedTest('完整登入流程驗證', async ({ authenticatedPage }) => {
    // 1. 訪問首頁
    await authenticatedPage.goto('/');
    
    // 2. 驗證登入成功 - 有錢包地址顯示
    const walletAddress = await authenticatedPage.locator('button:has-text("82tYW")').count();
    expect(walletAddress).toBeGreaterThan(0);
    console.log('✅ 登入成功，錢包地址已顯示');
    
    // 3. 進入 Dashboard
    const viewport = authenticatedPage.viewportSize();
    
    if (viewport && viewport.width < 1440) {
      // 移動端：點漢堡選單 → 點 Dashboard
      console.log('📱 移動端：通過漢堡選單進入 Dashboard');
      
      // 點擊漢堡選單
      const burgerMenu = authenticatedPage.locator('button[aria-label="Open navigation menu"]');
      await burgerMenu.click();
      
      // 等待 modal 出現
      await authenticatedPage.waitForTimeout(500);
      
      // 點擊 Dashboard
      const dashboardLink = authenticatedPage.locator('text=Dashboard');
      await dashboardLink.click();
      
    } else {
      // 桌面端：直接點 Menu 上的 Dashboard
      console.log('🖥️ 桌面端：直接點擊 Dashboard 連結');
      
      const dashboardLink = authenticatedPage.locator('a[href="/dashboard"]');
      await dashboardLink.click();
    }
    
    // 4. 驗證 Dashboard 頁面成功渲染
    await expect(authenticatedPage).toHaveURL('/dashboard');
    
    // 確認 Dashboard 標題存在
    const dashboardTitle = authenticatedPage.locator('h1:has-text("Dashboard")');
    await expect(dashboardTitle).toBeVisible();
    
    console.log('✅ Dashboard 頁面成功渲染');
  });
});