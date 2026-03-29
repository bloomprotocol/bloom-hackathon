# Figma 轉 JSON 使用指南

本指南說明如何將 Figma 設計轉換為容易理解的 JSON 格式。

## 🎯 為什麼需要設計 JSON？

**適合非程式設計師的格式**，讓設計師、產品經理、專案經理都能：
- ✅ 查看設計規格（顏色、字體、尺寸）
- ✅ 編輯設計內容（文字、數值）
- ✅ 追蹤設計變更
- ✅ 跨團隊溝通設計決策

## 📖 JSON 格式範例

```json
{
  "seed": {
    "title": "Seed",
    "level": "L1",
    "subtitle": "Early Seed Supporter",
    "colors": {
      "gradient": {
        "description": "從溫暖的棕色到紫色調",
        "top": "#DAA57D",
        "middle": "#98798D",
        "bottom": "#5B4662"
      },
      "text": "#FFFFFF"
    },
    "typography": {
      "title": {
        "text": "Seed",
        "font": "Serif",
        "size": "40px",
        "weight": "500"
      }
    }
  }
}
```

## 🚀 如何使用

### 方法 1：使用現有腳本（針對證書卡片）

```bash
# 生成所有證書的 JSON
node scripts/generate-design-json.js all

# 生成單個證書
node scripts/generate-design-json.js seed
node scripts/generate-design-json.js sprout
node scripts/generate-design-json.js bloom
```

生成的 JSON 會保存在 `design-specs/` 資料夾。

### 方法 2：從 Figma URL 手動轉換

**步驟：**

1. 取得 Figma 設計連結
2. 告訴 Claude：「將這個 Figma 設計轉換為 JSON」
3. Claude 會：
   - 讀取 Figma 設計
   - 提取顏色、文字、尺寸
   - 生成容易理解的 JSON

**範例對話：**

```
你：https://figma.com/design/xxx?node-id=123-456
    請轉換為設計 JSON

Claude：好的！我會讀取設計並生成 JSON...
```

### 方法 3：為新設計創建腳本

如果你有新的設計組件，可以：

1. 複製 `scripts/generate-design-json.js`
2. 修改 `certificateDesigns` 物件
3. 添加你的設計規格
4. 執行腳本生成 JSON

## 📝 如何編輯 JSON

### 修改文字

```json
"title": {
  "text": "Seed",           // ← 改這裡
  "font": "Serif",
  "size": "40px"
}
```

### 修改顏色

```json
"colors": {
  "gradient": {
    "top": "#DAA57D",       // ← 改成你要的色碼
    "middle": "#98798D",
    "bottom": "#5B4662"
  }
}
```

### 修改尺寸

```json
"size": {
  "width": "272px",         // ← 改數字
  "height": "320px"
}
```

## 🔄 同步到程式碼

**重要：** 修改 JSON 後，需要告訴開發者更新程式碼！

JSON 只是文件，不會自動更新網站。

**流程：**
1. 設計師/產品修改 JSON
2. 提交變更（commit）
3. 通知開發者
4. 開發者同步到 React 組件

## 📦 檔案結構

```
bloom-protocol-fe/
├── design-specs/                    # 設計 JSON 檔案
│   ├── seed-pass-certificates.json  # 證書設計規格
│   └── README.md                    # 說明文件
├── scripts/
│   ├── generate-design-json.js      # JSON 生成腳本
│   └── figma-to-json.ts            # 轉換工具
├── src/components/certificates/
│   └── SeedPassCertificate.tsx     # React 組件
└── docs/
    └── FIGMA_TO_JSON_GUIDE.md      # 本文件
```

## 🎨 JSON 欄位說明

### 基本資訊
- `component`: 組件名稱
- `variant`: 變體類型（seed/sprout/bloom）
- `figmaNodeId`: Figma 節點 ID

### 尺寸 (size)
- `width`: 寬度
- `height`: 高度
- `borderRadius`: 圓角

### 顏色 (colors)
- `gradient.top/middle/bottom`: 漸層色碼
- `text`: 文字顏色
- `shadow`: 陰影顏色

### 文字 (typography)
- `text`: 顯示內容
- `font`: 字體名稱
- `size`: 字體大小
- `weight`: 字體粗細
- `lineHeight`: 行高

### 裝飾 (decorations)
- `icon`: 圖示設定
- `branches`: 樹枝裝飾
- `badge`: 徽章樣式

## 💡 使用場景

### 1. 設計審查會議
設計師分享 JSON 給團隊，大家一起確認規格。

### 2. 設計系統文件
將 JSON 加入設計系統，作為標準規範。

### 3. 跨團隊協作
產品經理可以直接編輯 JSON 來調整文案或顏色。

### 4. 版本控制
用 Git 追蹤設計變更歷史。

## ⚠️ 注意事項

1. **JSON 不會自動同步**
   - Figma 改了 → JSON 不會自動更新
   - JSON 改了 → 程式碼不會自動更新

2. **需要手動維護**
   - 設計變更時，重新生成 JSON
   - 定期檢查 JSON 和 Figma 是否一致

3. **色碼格式**
   - 使用大寫 HEX 格式（例如 `#DAA57D`）
   - RGBA 格式使用 `rgba(r, g, b, a)`

## 🔗 相關文件

- [設計規格 README](../design-specs/README.md)
- [Code Connect 指南](./FIGMA_CODE_CONNECT.md)
- [組件使用文件](../src/components/certificates/README.md)

## 🤝 需要幫助？

有問題或建議？
- 詢問開發團隊
- 查看範例 JSON：`design-specs/seed-pass-certificates.json`
- 參考這份文件的範例
