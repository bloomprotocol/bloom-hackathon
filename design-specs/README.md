# Design Specifications

這個資料夾包含從 Figma 設計轉換而來的 JSON 規格文件，方便非程式設計師閱讀和編輯。

## 📁 檔案說明

### `seed-pass-certificates.json`

包含三個等級的 Seed Pass 證書設計規格：

- **Seed (L1)** - Early Seed Supporter
- **Sprout (L2)** - Activated Sprout Supporter
- **Bloom (L3)** - Bloom Supporter

## 🎨 JSON 結構說明

每個證書包含以下資訊：

```json
{
  "component": "組件名稱",
  "variant": "變體類型",
  "figmaNodeId": "Figma 節點 ID",
  "size": {
    "width": "寬度",
    "height": "高度",
    "borderRadius": "圓角"
  },
  "design": {
    "title": "標題文字",
    "level": "等級標示",
    "subtitle": "副標題",
    "colors": {
      "gradient": {
        "description": "漸層描述",
        "top": "頂部顏色",
        "middle": "中間顏色",
        "bottom": "底部顏色",
        "cssValue": "CSS 完整值"
      },
      "text": "文字顏色",
      "textOpacity": {
        "title": "標題透明度",
        "level": "等級透明度",
        "subtitle": "副標題透明度",
        "badge": "徽章透明度"
      },
      "shadow": {
        "value": "陰影值",
        "description": "陰影描述"
      }
    },
    "typography": {
      "title": {
        "text": "文字內容",
        "font": "字體",
        "size": "大小",
        "weight": "粗細",
        "lineHeight": "行高"
      }
      // ... 其他文字樣式
    },
    "decorations": {
      "icon": {
        "type": "圖示類型",
        "size": "大小",
        "color": "顏色",
        "position": "位置"
      }
      // ... 其他裝飾元素
    }
  }
}
```

## 🔧 如何生成新的 JSON

使用命令行工具生成設計 JSON：

```bash
# 生成所有證書
node scripts/generate-design-json.js all

# 生成單個證書
node scripts/generate-design-json.js seed
node scripts/generate-design-json.js sprout
node scripts/generate-design-json.js bloom
```

## 📝 如何編輯

1. **修改文字內容**：直接編輯 `text` 欄位
2. **修改顏色**：編輯 `colors` 區塊的色碼（例如 `#DAA57D`）
3. **修改大小**：編輯 `size` 區塊的數值（例如 `"40px"`）
4. **修改字體**：編輯 `typography` 區塊的 `font`、`weight` 等屬性

## 🔗 相關連結

- **Figma 設計檔**：[Bloom Protocol - Seed Pass Certificates](https://www.figma.com/design/MBzMGT7TcUncjhUjzEbNCA/Bloom-Protocol-New--Copy-?node-id=1789-49344)
- **React 組件**：`src/components/certificates/SeedPassCertificate.tsx`
- **預覽頁面**：http://localhost:3000/preview/certificates

## 💡 使用場景

- **設計審查**：設計師和產品經理可以直接查看 JSON 來確認設計規格
- **設計文件**：作為設計系統的一部分，記錄設計決策
- **跨團隊溝通**：開發、設計、產品都能用同一份文件溝通
- **版本控制**：追蹤設計變更歷史

## ⚠️ 注意事項

- 這些 JSON 檔案是從 Figma 設計「手動提取」的，不會自動更新
- 如果 Figma 設計有變更，需要重新執行生成腳本
- 修改 JSON 不會自動更新程式碼，需要手動同步到 React 組件
