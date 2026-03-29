import { test, expect } from '@playwright/test';

const API_BASE_URL = 'http://localhost:3005';
const TEST_WALLET = '82tYWDm5kgCxPVG8A5eyKL4KdVdR2esgq6FExudrMqYW';

test.describe('簡單認證測試', () => {
  test('手動設置 cookies 後檢查 Menu 狀態', async ({ page, context }) => {
    console.log('1️⃣ 調用 API 獲取 token...');
    
    // 1. 先調用 API 獲取 token
    const response = await page.request.post(`${API_BASE_URL}/auth/user/wallet/login`, {
      data: { address: TEST_WALLET }
    });
    
    const result = await response.json();
    const token = result.data.token;
    const userId = result.data.user.sub;
    const role = result.data.user.role;
    
    console.log('✅ 獲得 Token:', token.substring(0, 50) + '...');
    console.log('✅ 用戶 ID:', userId);
    console.log('✅ 角色:', role);
    
    // 2. 設置 cookies（完全模擬前端的 cookie 結構）
    console.log('2️⃣ 設置 Cookies...');
    await context.addCookies([
      {
        name: 'auth-token',
        value: token,
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
        value: userId,
        domain: 'localhost',
        path: '/'
      },
      {
        name: 'role',
        value: role,
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
    
    // 3. 訪問首頁
    console.log('3️⃣ 訪問首頁...');
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // 4. 打印當前頁面的 cookies
    const cookies = await context.cookies();
    console.log('📝 當前 Cookies:', cookies.map(c => `${c.name}: ${c.value?.substring(0, 20)}...`));
    
    // 5. 等待一下讓前端讀取 cookies
    await page.waitForTimeout(2000);
    
    // 6. 檢查 Menu 狀態
    console.log('4️⃣ 檢查 Menu 狀態...');
    
    // 檢查是否還有 Connect 按鈕
    const connectCount = await page.locator('button:has-text("Connect")').count();
    console.log(`📊 Connect 按鈕數量: ${connectCount}`);
    
    // 檢查是否有 Connecting 按鈕
    const connectingCount = await page.locator('button:has-text("Connecting")').count();
    console.log(`📊 Connecting 按鈕數量: ${connectingCount}`);
    
    // 檢查是否有頭像按鈕
    const avatarCount = await page.locator('button:has(img[alt="avatar"])').count();
    console.log(`📊 頭像按鈕數量: ${avatarCount}`);
    
    // 獲取所有按鈕的文本
    const allButtons = await page.locator('button').allTextContents();
    console.log('📊 所有按鈕文本:', allButtons.filter(t => t.trim()));
    
    // 7. 截圖以便調試
    await page.screenshot({ path: 'test-results/menu-state.png', fullPage: false });
    console.log('📸 已保存截圖到 test-results/menu-state.png');
    
    // 基本斷言 - 至少應該發生變化
    if (connectCount === 0 && avatarCount > 0) {
      console.log('✅ Menu 已切換到登錄狀態！');
    } else if (connectingCount > 0) {
      console.log('⏳ Menu 顯示 Connecting 狀態');
    } else {
      console.log('❌ Menu 仍然顯示未登錄狀態');
    }
  });
});