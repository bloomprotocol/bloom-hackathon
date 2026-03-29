# Design Assets Registry

所有從 Figma 匯出的設計素材索引。

## 目錄結構

```
public/
├── certificates/        # 證書、徽章類
├── rewards/            # 獎勵卡片
├── backgrounds/        # 背景圖片
└── ui-elements/        # UI 元件素材
```

---

## 📜 Certificates - 證書類

### Seed Pass Certificate（早期支持者證書）

| 項目 | 內容 |
|------|------|
| **Figma Link** | [🔗 View in Figma](https://www.figma.com/design/MBzMGT7TcUncjhUjzEbNCA/%F0%9F%8C%B7-Bloom-Protocol-New--Copy-?node-id=1789-49344&m=dev) |
| **Node IDs** | Seed: `1789:49345`<br>Sprout: `1789:49356`<br>Bloom: `1789:49369` |
| **Component** | `src/components/certificates/SeedPassCertificate.tsx` |
| **Assets 位置** | `public/certificates/` |
| **使用的圖片** | • `seed-certificate.png` (545 KB)<br>• `sprout-certificate.png` (517 KB)<br>• `bloom-certificate.png` (499 KB) |
| **匯出方式** | 靜態 PNG（2x scale） |
| **實現方式** | Static Image Export（設計層數 15+，無法用 CSS 重現） |
| **預覽頁面** | `/preview/certificates` |
| **使用範例** | `<SeedPassCertificate level="seed" />` |
| **變體** | 3 個等級：seed, sprout, bloom |
| **建立日期** | 2026-01-28 |
| **最後更新** | 2026-01-28 |
| **說明文檔** | `docs/EXPORT_FIGMA_CERTIFICATES.md` |
| **備註** | 複雜多層設計，包含 logo_mark、shapes、多個背景層 |

**其他素材（中間產物）：**
- `seed-bg.png`, `sprout-bg-1/2.png`, `bloom-bg-1/2/3/4/5/6.png`
- `logo-stem.svg`, `logo-leaf.svg`, `branches.svg` 等
- 這些是嘗試代碼實現時下載的，最終未使用

---

## 🎁 Rewards - 獎勵類

_尚未建立_

---

## 🎨 Backgrounds - 背景類

_尚未建立_

---

## 🧩 UI Elements - UI 元件

### Bloom Score Icon（品牌 Icon）

| 項目 | 內容 |
|------|------|
| **Figma Link** | [🔗 View in Figma](https://www.figma.com/design/0dCfBYsjNUrJcr8T7FBlEz/%F0%9F%8C%B7-Bloom-Protocol-New--Copy-?node-id=1-2439&m=dev) |
| **Component** | `src/app/discover/icons.tsx` → `BloomIcon` |
| **實現方式** | SVG React Component（從 AI 生成的 SVG 優化轉換） |
| **顏色** | 綠色葉子：`#71ca41` (品牌綠)<br>紫色花朵：`#a855f7` (品牌紫) |
| **Props** | `size?: number` (預設 16)<br>`className?: string` |
| **使用位置** | • Discover 頁面的 Bloom Score 顯示<br>• Project cards |
| **預覽頁面** | `/preview/bloom-icon` |
| **使用範例** | `<BloomIcon size={16} />` |
| **設計特點** | 有機流動形狀，包含兩片綠葉 + 中央紫色花朵 |
| **建立日期** | 2026-01-28 |
| **最後更新** | 2026-01-28 |
| **備註** | 從 1024x1024 SVG 轉換成 24x24 viewBox，顏色調整為品牌色 |

---

## 新增素材流程

當你要新增 Figma 設計時：

### 簡單流程（推薦）

```
1. 貼 Figma link
2. 說明用途（例如：「用在 discover 頁面」）
3. 我會自動：
   ✅ 評估是否用靜態圖片 vs. 代碼實現
   ✅ 匯出素材（會問你要 Figma token）
   ✅ 建立 Component
   ✅ 更新這個 Registry
   ✅ 提供預覽 URL
```

### 範例對話

```
你：「https://figma.com/design/ABC/RewardCard?node-id=100-200
     我想在 dashboard 用這個獎勵卡片」

我：「這個設計有 10 層嵌套，建議用靜態圖片。需要 Figma token。」
你：「figd_XXXX」
我：[完成後]
    「✅ 完成！
    • Component: src/components/rewards/RewardCard.tsx
    • Assets: public/rewards/reward-card.png
    • Preview: http://localhost:3000/preview/rewards
    • Registry 已更新」
```

---

## 使用 Figma Token

### 取得 Token

1. 開啟 Figma
2. 右上角頭像 → Settings
3. Personal Access Tokens → Generate new token
4. 複製 token（格式：`figd_XXXXXXXXXXXX`）

### Token 用途

- 用於 Figma API 匯出高解析度圖片
- 只需提供一次，我會在當前對話中記住
- Token 不會被儲存，安全無虞

---

## 維護說明

### 定期檢查

```bash
# 檢查素材完整性
node scripts/verify-figma-assets.js

# 查看素材大小
ls -lh public/*/
```

### 更新設計

如果 Figma 設計更新：
1. 重新匯出圖片（使用原本的 Figma link）
2. 覆蓋 `public/` 中的舊檔案
3. 檢查 component 是否需要調整
4. 更新此 Registry 的「最後更新」日期

### 清理未使用素材

定期檢查是否有未使用的中間產物：
```bash
# 找出沒有被 component 引用的圖片
node scripts/find-unused-assets.js
```

---

## 技術備註

### 何時用靜態圖片 vs. 代碼實現

**使用靜態圖片：**
- ✅ 設計層數 > 8 層
- ✅ 複雜視覺效果（多層背景、gradients、effects）
- ✅ 包含精密圖形設計
- ✅ 需要像素級精確度

**使用代碼實現：**
- ✅ 簡單 UI 組件（按鈕、卡片、表單）
- ✅ 可用 Tailwind/CSS 重現
- ✅ 需要動態內容或互動

### Middleware 設定

確保 `src/middleware.ts` 的 matcher 排除了素材路徑：

```typescript
export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico|certificates|rewards|backgrounds).*)',
};
```

---

**Registry 版本：** 1.0.0
**建立日期：** 2026-01-28
**最後更新：** 2026-01-28
