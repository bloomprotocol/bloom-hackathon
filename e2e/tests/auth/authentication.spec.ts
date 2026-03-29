import { test, expect } from '@playwright/test';
import { authenticatedTest } from '../../fixtures/auth.fixture';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3005';
const TEST_WALLET = '82tYWDm5kgCxPVG8A5eyKL4KdVdR2esgq6FExudrMqYW';

test.describe('核心認證功能測試', () => {
  test('應該顯示未登錄狀態的 Menu', async ({ page }) => {
    await page.goto('/');
    
    // 未登入 = 沒有錢包地址按鈕
    const walletButton = await page.locator('button:has-text("82tYW")').count();
    expect(walletButton).toBe(0);
    
    // 應該有 Connect 按鈕
    const connectButton = await page.locator('button').filter({ hasText: /^Connect$/ }).count();
    expect(connectButton).toBeGreaterThan(0);
  });

  test('應該成功通過 API 登錄並更新 Menu UI', async ({ page, context }) => {
    // 1. 訪問首頁並確認未登錄狀態
    await page.goto('/');
    const connectButtons = page.locator('button:has-text("Connect")');
    const initialCount = await connectButtons.count();
    expect(initialCount).toBeGreaterThan(0);
    
    // 2. 調用 API 進行登錄
    console.log('🔐 調用 API 登錄...');
    const response = await page.request.post(`${API_BASE_URL}/auth/user/wallet/login`, {
      data: {
        address: TEST_WALLET
      }
    });
    
    expect(response.ok()).toBeTruthy();
    const authResponse = await response.json();
    const authData = authResponse.data || authResponse;
    console.log('✅ API 登錄成功, 用戶 ID:', authData.user?.sub);
    
    // 3. 設置認證 Cookies
    await context.addCookies([
      {
        name: 'auth-token',
        value: authData.token || authData.accessToken,
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
        value: authData.user?.sub || authData.user?.uid || authData.user?.id || '',
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
    
    // 5. 等待 Menu 狀態轉換
    console.log('🔍 等待 Menu 狀態轉換...');
    
    // 等待 Connecting 狀態（如果有）
    const connectingButton = page.locator('button:has-text("Connecting")');
    const hasConnecting = await connectingButton.isVisible({ timeout: 1000 }).catch(() => false);
    if (hasConnecting) {
      console.log('⏳ 檢測到 Connecting 狀態...');
      await connectingButton.waitFor({ state: 'hidden', timeout: 10000 });
    }
    
    // 等待 Connect 按鈕消失
    await page.waitForTimeout(1000); // 給一點時間讓狀態更新
    const connectButtonsAfter = page.locator('button:has-text("Connect")');
    const afterCount = await connectButtonsAfter.count();
    expect(afterCount).toBe(0);
    console.log('✅ Connect 按鈕已消失');
    
    // 檢查積分顯示（桌面端）
    if (page.viewportSize()?.width && page.viewportSize()!.width >= 1440) {
      const dropsIcon = page.locator('img[src="https://statics.bloomprotocol.ai/logo/water-drop-icon.svg"]');
      const dropsCount = await dropsIcon.count();
      
      if (dropsCount > 0) {
        console.log('✅ 顯示積分圖標');
        
        // 獲取積分數值 - 找包含水滴圖標的 div 中的 span
        const pointsContainer = page.locator('div:has(img[src="https://statics.bloomprotocol.ai/logo/water-drop-icon.svg"]) > span');
        const pointsText = await pointsContainer.textContent().catch(() => '0');
        console.log(`💧 用戶積分: ${pointsText}`);
      } else {
        console.log('⚠️ 積分圖標未顯示（需要 dashboardData 加載）');
      }
    }
    
    // 驗證錢包地址顯示 - 檢查按鈕內的文字
    const walletAddressElements = await page.locator('button:has-text("82tYW")').count();
    expect(walletAddressElements).toBeGreaterThan(0);
    
    const walletText = await page.locator('button:has-text("82tYW")').first().textContent();
    console.log('✅ 錢包地址顯示正常:', walletText);
    
    // 6. 驗證可以訪問 Dashboard
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/dashboard');
    
    // 檢查 Dashboard 標題
    const dashboardTitle = page.locator('h1:has-text("Dashboard")');
    await expect(dashboardTitle).toBeVisible();
    console.log('✅ Dashboard 訪問成功');
  });
});

authenticatedTest.describe('已認證用戶功能測試', () => {
  authenticatedTest('應該顯示已登錄的 Menu 並能訪問 Dashboard', async ({ authenticatedPage }) => {
    // 認證夾具已經處理了登錄，直接測試已登錄狀態
    console.log('🔍 測試已認證狀態...');
    
    // 確保在首頁
    await authenticatedPage.goto('/');
    
    // 驗證已登入 - 有錢包地址顯示
    const walletAddressCount = await authenticatedPage.locator('button:has-text("82tYW")').count();
    expect(walletAddressCount).toBeGreaterThan(0);
    console.log('✅ 已登入，顯示錢包地址');
    
    // 桌面端應該顯示積分（需要 dashboardData）
    if (authenticatedPage.viewportSize()?.width && authenticatedPage.viewportSize().width >= 1440) {
      const dropsIcon = authenticatedPage.locator('img[src="https://statics.bloomprotocol.ai/logo/water-drop-icon.svg"]');
      const hasDrops = await dropsIcon.count() > 0;
      
      if (hasDrops) {
        const pointsContainer = authenticatedPage.locator('div:has(img[src="https://statics.bloomprotocol.ai/logo/water-drop-icon.svg"]) > span');
        const pointsText = await pointsContainer.textContent().catch(() => '0');
        console.log('💧 用戶積分:', pointsText);
      } else {
        console.log('💧 積分顯示未找到（需要 dashboardData 加載）');
      }
    }
    
    // 2. 測試導航到 Dashboard
    console.log('📍 導航到 Dashboard...');
    
    // 方法1: 直接訪問 URL
    await authenticatedPage.goto('/dashboard');
    await expect(authenticatedPage).toHaveURL('/dashboard');
    
    // 驗證 Dashboard 內容
    const dashboardTitle = authenticatedPage.locator('h1:has-text("Dashboard")');
    await expect(dashboardTitle).toBeVisible();
    
    // 檢查是否有 Supporter/Builder 相關內容
    const dashboardContent = authenticatedPage.locator('text=/Supporter|Builder|Overview|Missions/i');
    await expect(dashboardContent.first()).toBeVisible();
    
    console.log('✅ Dashboard 內容加載成功');
    
    // 3. 測試從 Dashboard 返回首頁
    await authenticatedPage.goto('/');
    await expect(authenticatedPage).toHaveURL('/');
    
    // 確認仍然保持登錄狀態 - 錢包地址還在
    const stillLoggedIn = await authenticatedPage.locator('button:has-text("82tYW")').count();
    expect(stillLoggedIn).toBeGreaterThan(0);
    console.log('✅ 認證狀態保持正常');
  });

  authenticatedTest('應該在桌面端導航欄顯示 Dashboard 鏈接', async ({ authenticatedPage }) => {
    // 僅在桌面端測試（寬度 >= 1440px）
    const viewport = authenticatedPage.viewportSize();
    if (!viewport || viewport.width < 1440) {
      console.log('⏩ 跳過移動端測試');
      return;
    }
    
    await authenticatedPage.goto('/');
    
    // 查找導航欄中的 Dashboard 鏈接
    const dashboardLink = authenticatedPage.locator('a[href="/dashboard"]');
    await expect(dashboardLink).toBeVisible();
    
    // 點擊 Dashboard 鏈接
    await dashboardLink.click();
    
    // 驗證導航成功
    await expect(authenticatedPage).toHaveURL('/dashboard');
    const dashboardTitle = authenticatedPage.locator('h1:has-text("Dashboard")');
    await expect(dashboardTitle).toBeVisible();
    
    console.log('✅ 通過導航欄訪問 Dashboard 成功');
  });
});