import { test, expect } from '@playwright/test';

test.describe('煙霧測試', () => {
  test('應該成功加載首頁', async ({ page }) => {
    await page.goto('/');
    
    // 檢查頁面標題
    await expect(page).toHaveTitle(/Bloom Protocol/i);
    
    // 檢查 Logo 是否顯示
    const logo = page.locator('img[alt="Bloom Protocol\'s Logo"]').first();
    await expect(logo).toBeVisible();
    
    console.log('✅ 首頁加載成功');
  });

  test('應該有正確的視窗尺寸', async ({ page }) => {
    const viewport = page.viewportSize();
    console.log('📐 當前視窗尺寸:', viewport);
    
    if (viewport) {
      if (viewport.width >= 1440) {
        console.log('💻 桌面端測試');
        expect(viewport.width).toBeGreaterThanOrEqual(1440);
      } else {
        console.log('📱 移動端測試');
        expect(viewport.width).toBeLessThan(1440);
      }
    }
  });
});