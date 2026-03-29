# Seed Pass Certificates 組件

三個等級的 Seed Pass 證書卡片組件，對應 Figma 設計。

## 🎨 設計來源

**Figma 連結**: [Bloom Protocol - Seed Pass Certificates](https://www.figma.com/design/MBzMGT7TcUncjhUjzEbNCA/Bloom-Protocol-New--Copy-?node-id=1789-49344)

## 📦 組件

### SeedPassCertificate

顯示不同等級的 Seed Pass 證書。

**Props:**
- `level`: `'seed' | 'sprout' | 'bloom'` - 證書等級
- `className?`: `string` - 額外的 CSS class

**尺寸:** 272px × 320px

## 🚀 使用方式

```tsx
import { SeedPassCertificate } from '@/components/certificates';

// Level 1 - Seed
<SeedPassCertificate level="seed" />

// Level 2 - Sprout
<SeedPassCertificate level="sprout" />

// Level 3 - Bloom
<SeedPassCertificate level="bloom" />
```

## 🎯 證書等級

### Seed (L1)
- **顏色**: 棕色到紫色漸層
- **描述**: Early Seed Supporter
- **Figma Node**: `1789:49345`

### Sprout (L2)
- **顏色**: 綠色漸層
- **描述**: Activated Sprout Supporter
- **Figma Node**: `1789:49356`

### Bloom (L3)
- **顏色**: 深紫色漸層
- **描述**: Bloom Supporter
- **Figma Node**: `1789:49369`

## 👀 預覽

訪問開發伺服器查看所有證書：
```
http://localhost:3000/preview/certificates
```

## 📁 相關檔案

- **組件**: `SeedPassCertificate.tsx` - 主要組件
- **展示頁**: `CertificateShowcase.tsx` - 預覽所有變體
- **Code Connect**: `SeedPassCertificate.figma.tsx` - Figma 映射
- **導出**: `index.ts` - 組件導出

## 🎨 設計規格

完整的設計規格（顏色、字體、尺寸等）請參考：
```
design-specs/seed-pass-certificates.json
```

這是一個容易閱讀的 JSON 格式，非程式設計師也能理解。

## 🔗 Figma Code Connect

本組件已配置 Code Connect，讓設計師在 Figma 中直接看到程式碼。

設置步驟請參考：`docs/FIGMA_CODE_CONNECT.md`

## ✨ 設計特色

- **漸層背景**: 每個等級有獨特的顏色漸層
- **樹枝裝飾**: SVG 樹枝圖案疊加
- **植物圖示**: 右上角的發芽圖示
- **證書徽章**: 右下角的半透明徽章
- **響應式**: 固定尺寸，適合卡片展示

## 🛠 技術細節

- **框架**: React + TypeScript
- **樣式**: Tailwind CSS + inline styles（漸層）
- **圖示**: 自定義 SVG
- **字體**: Serif (標題) + Outfit (內文)

## 📝 未來改進

- [ ] 添加動畫效果（hover、entrance）
- [ ] 支援響應式尺寸
- [ ] 添加可選的行動按鈕
- [ ] 支援自定義內容
- [ ] 導出為圖片功能

## 🤝 貢獻

修改組件時請：
1. 保持與 Figma 設計一致
2. 更新 `design-specs/seed-pass-certificates.json`
3. 重新發布 Code Connect（`figma-connect publish`）
4. 在預覽頁面測試所有變體
