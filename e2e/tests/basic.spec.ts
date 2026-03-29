import { test, expect } from '@playwright/test';

test.describe('基礎功能測試', () => {
  test('應該成功加載首頁並顯示正確的元素', async ({ page }) => {
    await page.goto('/');
    
    // 檢查 Logo
    const logo = page.locator('img[alt="Bloom Protocol\'s Logo"]').first();
    await expect(logo).toBeVisible();
    
    // 檢查有 Connect 按鈕（未登錄狀態）
    const connectButtons = await page.locator('button:has-text("Connect")').count();
    console.log(`找到 ${connectButtons} 個 Connect 按鈕`);
    expect(connectButtons).toBeGreaterThan(0);
    
    // 檢查頁面標題
    await expect(page).toHaveTitle(/Bloom Protocol/i);
    
    console.log('✅ 基礎頁面元素檢查通過');
  });


  test('測試 API 登錄接口', async ({ page }) => {
    const response = await page.request.post('http://localhost:3005/auth/user/wallet/login', {
      data: {
        address: '82tYWDm5kgCxPVG8A5eyKL4KdVdR2esgq6FExudrMqYW'
      }
    });
    
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    console.log('API 返回結構:', {
      hasSuccess: 'success' in data,
      hasData: 'data' in data,
      hasToken: data.data?.token ? 'yes' : 'no',
      hasUser: data.data?.user ? 'yes' : 'no',
      userSub: data.data?.user?.sub
    });
    
    // 驗證返回結構
    expect(data).toHaveProperty('success', true);
    expect(data).toHaveProperty('data');
    expect(data.data).toHaveProperty('token');
    expect(data.data).toHaveProperty('user');
    expect(data.data.user).toHaveProperty('sub');
  });
});