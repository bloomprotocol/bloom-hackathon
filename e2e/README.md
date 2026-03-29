# Playwright E2E 測試指南

## 🚀 快速開始

### 前置條件
1. 確保後端服務運行在 `http://localhost:3005`
2. 確保前端服務運行在 `http://localhost:3000`

### 運行測試

```bash
# 運行所有測試
npm run test:e2e

# 使用 UI 模式（推薦用於開發）
npm run test:e2e:ui

# 調試模式
npm run test:e2e:debug

# 有頭模式（顯示瀏覽器）
npm run test:e2e:headed

# 運行特定測試
npx playwright test e2e/tests/smoke.spec.ts
npx playwright test e2e/tests/auth/authentication.spec.ts

# 只運行特定瀏覽器
npm run test:e2e -- --project=chromium-desktop
npm run test:e2e -- --project=mobile-chrome
```

## 📁 目錄結構

```
e2e/
├── fixtures/
│   └── auth.fixture.ts      # 統一的 API 認證夾具
├── tests/
│   ├── auth/
│   │   └── authentication.spec.ts  # 認證相關測試
│   └── smoke.spec.ts        # 煙霧測試
├── pages/                   # Page Object Models (待擴展)
└── utils/                   # 工具函數 (待擴展)
```

## 🔑 核心概念

### 統一認證夾具
所有需要登錄狀態的測試都使用 `authenticatedTest` 而不是普通的 `test`：

```typescript
import { authenticatedTest } from '../fixtures/auth.fixture';

authenticatedTest('測試名稱', async ({ authenticatedPage }) => {
  // authenticatedPage 已經是登錄狀態
  await authenticatedPage.goto('/dashboard');
  // ... 測試邏輯
});
```

### API 認證流程
為了避免複雜的錢包插件操作，我們直接使用 API 認證：
1. 調用 `/auth/user/wallet/login` API
2. 設置必要的 cookies (auth-token, wallet-address, sub, role, tia)
3. 重新加載頁面讓認證生效

測試錢包地址：`82tYWDm5kgCxPVG8A5eyKL4KdVdR2esgq6FExudrMqYW`

## 🎯 測試覆蓋範圍

### 當前實現的測試
1. **基礎測試** (`basic.spec.ts`)
   - 首頁加載和元素檢查
   - API 登錄接口測試

2. **認證測試** 
   - `authentication.spec.ts` - 核心認證功能
   - `auth-correct.spec.ts` - 修正後的認證測試
   - `login-flow.spec.ts` - 完整登入流程
   - `simple-auth.spec.ts` - 簡化認證測試
   
3. **測試重點**
   - 未登錄：有 Connect 按鈕，無錢包地址
   - 已登錄：有錢包地址（82tYW...），可訪問 Dashboard
   - Dashboard：移動端通過漢堡選單，桌面端直接點擊

## 📐 響應式測試

項目支持兩種視窗模式：
- **桌面端**: 寬度 ≥ 1440px
- **移動端**: 寬度 < 1440px

配置在 `playwright.config.ts` 中定義了 2 個測試項目：
- `chromium-desktop` (1440x900)
- `mobile-chrome` (iPhone 14, 390x844)

**注意**: Crypto 項目只測試 Chrome，不測試 Firefox/Safari

## 🐛 調試技巧

1. **使用 UI 模式** - 最方便的調試方式
   ```bash
   npm run test:e2e:ui
   ```

2. **查看測試報告**
   ```bash
   npx playwright show-report
   ```

3. **添加調試日誌**
   ```typescript
   console.log('🔍 調試信息:', someVariable);
   ```

4. **截圖調試**
   ```typescript
   await page.screenshot({ path: 'debug.png' });
   ```

## 🔧 環境變量

可以通過環境變量配置測試：
- `PLAYWRIGHT_BASE_URL`: 前端 URL (默認: http://localhost:3000)
- `NEXT_PUBLIC_API_BASE_URL`: 後端 API URL (默認: http://localhost:3005)

## 📝 擴展測試

要添加新的測試：

1. **創建測試文件**
   ```bash
   touch e2e/tests/your-feature.spec.ts
   ```

2. **使用合適的測試基礎**
   - 不需要登錄：使用 `import { test, expect } from '@playwright/test'`
   - 需要登錄：使用 `import { authenticatedTest } from '../fixtures/auth.fixture'`

3. **編寫測試用例**
   ```typescript
   test('測試描述', async ({ page }) => {
     await page.goto('/your-page');
     // 測試邏輯
   });
   ```

## ⚠️ 重要注意事項

### 測試編寫原則
1. **抓重點** - 有錢包地址 = 登入成功，不要檢查無關的東西
2. **看代碼** - 必須先看實際組件代碼（如 Menu.tsx）再寫測試
3. **用對選擇器** - 使用精確匹配，避免誤判
4. **智能等待** - 使用 `waitForSelector` 而非 `waitForTimeout`
5. **不做無意義的健康檢查** - 本地測試當然有後端

### 技術注意事項
1. 測試會自動啟動開發服務器（如果未運行）
2. 測試失敗時會自動截圖和錄影（保存在 `test-results/`）
3. Worker 設置為 4 個，避免連接問題（ECONNRESET）
4. 認證夾具會自動清除 cookies 確保乾淨狀態

## 🤝 貢獻指南

1. 新增測試前先運行現有測試確保環境正常
2. 測試命名使用中文描述，便於理解
3. 使用 Page Object Model 模式組織複雜頁面
4. 保持測試獨立性，避免測試間依賴