import { test, expect } from '@playwright/test';
import { authenticatedTest } from '../../fixtures/auth.fixture';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3005';
const TEST_WALLET = '82tYWDm5kgCxPVG8A5eyKL4KdVdR2esgq6FExudrMqYW';

test.describe('正確的認證功能測試', () => {
  test('未登錄狀態的 Menu 驗證', async ({ page }) => {
    await page.goto('/');
    
    // 1. 應該有 Connect 按鈕（精確匹配）
    const connectButton = page.locator('button').filter({ hasText: /^Connect$/ });
    const connectCount = await connectButton.count();
    expect(connectCount).toBeGreaterThan(0);
    console.log(`✅ 找到 ${connectCount} 個 Connect 按鈕`);
    
    // 2. 不應該有積分圖標（水滴圖標） - 只在桌面端檢查
    if (page.viewportSize()?.width && page.viewportSize()!.width >= 1440) {
      const dropsIcon = page.locator('img[src="https://statics.bloomprotocol.ai/logo/water-drop-icon.svg"]');
      const dropsCount = await dropsIcon.count();
      expect(dropsCount).toBe(0);
      console.log('✅ 未登錄狀態：沒有積分圖標');
    }
    
    // 3. 不應該顯示錢包地址
    const walletButton = await page.locator('button:has-text("82tYW")').count();
    expect(walletButton).toBe(0);
    console.log('✅ 未登錄狀態：沒有錢包地址顯示');
  });

  test('登錄後 Menu UI 變化驗證', async ({ page, context }) => {
    // 1. 先訪問首頁確認初始狀態
    await page.goto('/');
    
    // 初始狀態檢查
    const initialConnectCount = await page.locator('button:has-text("Connect")').count();
    expect(initialConnectCount).toBeGreaterThan(0);
    console.log('✅ 初始狀態：有 Connect 按鈕');
    
    // 2. 調用 API 登錄
    console.log('🔐 調用 API 登錄...');
    const response = await page.request.post(`${API_BASE_URL}/auth/user/wallet/login`, {
      data: { address: TEST_WALLET }
    });
    
    expect(response.ok()).toBeTruthy();
    const authResponse = await response.json();
    const authData = authResponse.data || authResponse;
    console.log('✅ API 登錄成功');
    
    // 3. 設置認證 Cookies
    await context.addCookies([
      {
        name: 'auth-token',
        value: authData.token,
        domain: 'localhost',
        path: '/'
      },
      {
        name: 'wallet-address',
        value: TEST_WALLET,
        domain: 'localhost',
        path: '/'
      },
      {
        name: 'sub',
        value: authData.user?.sub || '',
        domain: 'localhost',
        path: '/'
      },
      {
        name: 'role',
        value: authData.user?.role || 'SUPPORTER',
        domain: 'localhost',
        path: '/'
      },
      {
        name: 'tia',
        value: new Date().toISOString(),
        domain: 'localhost',
        path: '/'
      }
    ]);
    
    // 4. 重新加載頁面以應用認證狀態
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // 等待一下讓 UI 更新
    await page.waitForTimeout(2000);
    
    // 5. 驗證登錄後的 UI 變化
    console.log('🔍 驗證登錄後的 Menu 變化...');
    
    // 應該顯示錢包地址 - 登入成功
    const walletButtonCount = await page.locator('button:has-text("82tYW")').count();
    expect(walletButtonCount).toBeGreaterThan(0);
    
    const walletText = await page.locator('button:has-text("82tYW")').first().textContent();
    console.log('✅ 登入成功，顯示錢包地址:', walletText);
    
    // 桌面端應該顯示積分圖標（需要 dashboardData）
    if (page.viewportSize()?.width && page.viewportSize()!.width >= 1440) {
      const dropsIcon = page.locator('img[src="https://statics.bloomprotocol.ai/logo/water-drop-icon.svg"]');
      const dropsCount = await dropsIcon.count();
      
      if (dropsCount > 0) {
        console.log('✅ 顯示積分圖標');
        
        // 獲取積分數值 - 找相鄰的 span
        const pointsContainer = page.locator('div:has(img[src="https://statics.bloomprotocol.ai/logo/water-drop-icon.svg"]) > span');
        const pointsText = await pointsContainer.textContent().catch(() => '0');
        console.log(`💧 用戶積分: ${pointsText}`);
      } else {
        console.log('⚠️ 積分圖標未顯示（需要 dashboardData 加載）');
      }
    }
    
    // 6. 驗證可以訪問 Dashboard
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/dashboard');
    
    const dashboardTitle = page.locator('h1:has-text("Dashboard")');
    await expect(dashboardTitle).toBeVisible();
    console.log('✅ 成功訪問 Dashboard');
  });
});

authenticatedTest.describe('使用認證夾具的測試', () => {
  authenticatedTest('驗證已登錄狀態的 Menu', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/');
    
    console.log('🔍 驗證已登錄狀態...');
    
    // 應該顯示錢包地址 - 這就是登入成功的證明
    const walletButtonCount = await authenticatedPage.locator('button:has-text("82tYW")').count();
    expect(walletButtonCount).toBeGreaterThan(0);
    
    const walletText = await authenticatedPage.locator('button:has-text("82tYW")').first().textContent();
    console.log(`✅ 已登入，顯示錢包地址: ${walletText}`);
    
    // 3. 導航到 Dashboard
    await authenticatedPage.goto('/dashboard');
    await expect(authenticatedPage).toHaveURL('/dashboard');
    console.log('✅ 成功訪問 Dashboard');
    
    // 4. 返回首頁，確認仍然保持登錄狀態
    await authenticatedPage.goto('/');
    const stillHasWallet = await authenticatedPage.locator('button:has-text("82tYW")').count();
    expect(stillHasWallet).toBeGreaterThan(0);
    console.log('✅ 認證狀態保持');
  });
});