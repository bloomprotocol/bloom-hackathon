# Figma MCP Tools 使用指南

你之前貼的 Figma MCP tools 說明非常有幫助！這份文檔說明我如何使用這些工具。

---

## 🔧 我目前在用的工具

### 1. `get_metadata` ⭐⭐⭐⭐⭐

**用途：** 快速掃描 Figma 設計的結構

**何時用：**
- 你貼 Figma link 後，我第一件事就是用這個
- 評估設計複雜度（層數、節點數量）
- 找出所有變體的 node ID

**回傳內容：**
```xml
<frame id="1789:49344" name="SeedPass Certificate">
  <image id="1789:49345" name="background" />
  <image id="1789:49346" name="logo_mark" />
  <text id="1789:49347" name="Title" />
  ...
</frame>
```

**我的使用方式：**
```
1. 看層數：> 8 層 → 用靜態圖片
2. 看節點類型：多個 <image> → 用靜態圖片
3. 找變體：找出所有 variant 的 node ID
```

---

### 2. `get_design_context` ⭐⭐⭐⭐

**用途：** 取得設計的詳細規格（React + Tailwind 格式）

**何時用：**
- 簡單設計，準備用代碼實現時
- 需要知道具體的顏色、字體、間距

**回傳內容：**
```tsx
// React component 代碼
// 包含：layout, colors, typography, spacing
```

**我的使用方式：**
```
1. 看設計規格（顏色、字體、尺寸）
2. 參考結構，但會改用你們的 design system
3. 不會直接複製貼上，會轉換成專案風格
```

**注意：** 你貼的說明提到可以自訂輸出格式！

```
「Generate my Figma selection in Vue.」
「Generate using components from src/components/ui」
```

這個很有用！未來如果需要特定格式，我可以這樣請求。

---

### 3. `get_screenshot` ⭐⭐⭐⭐⭐

**用途：** 取得設計的視覺截圖

**何時用：**
- 每次處理設計時都會用
- 作為視覺參考的"標準答案"
- 驗證最終實現是否符合設計

**我的使用方式：**
```
1. 下載截圖作為參考
2. 實現完成後，對照檢查視覺差異
3. 如果不符合，調整實現
```

---

### 4. `get_variable_defs` ⭐⭐⭐

**用途：** 取得 Figma Variables（design tokens）

**何時用：**
- 設計有使用 Figma Variables 時
- 需要提取顏色、間距、字體 tokens

**回傳範例：**
```json
{
  "icon/default/secondary": "#949494",
  "spacing/base": "8px",
  "font/heading/size": "24px"
}
```

**我的使用方式：**
```
1. 提取 design tokens
2. 對應到專案的 Tailwind config
3. 確保顏色、間距一致
```

**目前狀況：** SeedPass Certificate 沒有用 Figma Variables，所以這次沒用到。

---

## 🔧 未來會用的工具

### 5. `get_code_connect_map` ⭐⭐⭐

**用途：** 檢查 Figma component 是否已經連接到代碼

**何時用：**
- 建立 component 後，確認是否要 Code Connect
- 檢查現有的 mapping

**目前狀況：** 你之前想做 Code Connect，但當時 tool 不可用。現在應該可以用了！

**未來使用情境：**
```
你：「幫我建立這個 Button」
我：
  1. 建立 component
  2. 用 get_code_connect_map 檢查
  3. 用 add_code_connect_map 建立連接
  4. 以後 Figma 會直接顯示 code 連結
```

---

### 6. `create_design_system_rules` ⭐⭐⭐⭐

**用途：** 自動生成專案的 design system rules

**超級有用！** 這個可以讓我：
```
1. 掃描你的 codebase
2. 學習你的 design system 規則
3. 自動生成 rules 文件
4. 未來實現設計時，自動符合規則
```

**建議：** 我們可以執行一次，生成規則檔，放在 `design-assets/design-system-rules.md`

---

### 7. `get_figjam` ⭐⭐

**用途：** 讀取 FigJam 圖表

**何時用：**
- 你貼 FigJam link（不是 Figma Design）
- 想要提取 flow、wireframe、brainstorming 內容

---

## 🎯 實際工作流程範例

### 情境 1：複雜視覺設計（像 SeedPass Certificate）

```
你：貼 Figma link

我：
1. get_metadata → 看結構（15 層，很複雜）
2. get_screenshot → 下載視覺參考
3. 判斷：用靜態圖片
4. 用 Figma API 匯出 PNG（需要 token）
5. 建立 component
6. 更新 assets-registry.md
```

### 情境 2：簡單 UI 組件（如 Button、Card）

```
你：貼 Figma link

我：
1. get_metadata → 看結構（簡單）
2. get_design_context → 取得規格
3. get_variable_defs → 取得 design tokens
4. get_screenshot → 視覺參考
5. 搜尋現有 components
6. 用代碼實現（參考專案風格）
7. (可選) get_code_connect_map → 建立連接
```

### 情境 3：有 Design System Variables 的設計

```
你：貼 Figma link

我：
1. get_metadata → 看結構
2. get_variable_defs → 提取所有 variables
3. 對應到 Tailwind config
4. get_design_context → 實現
5. 確保使用正確的 design tokens
```

---

## 🚀 未來可以做的改進

### 1. 執行 `create_design_system_rules`

建立專案的 design system rules：
```
我：執行 create_design_system_rules
我：掃描 src/components/ui/, Tailwind config
我：生成 design-assets/design-system-rules.md
你：未來我實現設計時，自動符合這些規則
```

**好處：**
- 自動使用正確的 components
- 自動套用正確的 colors、spacing
- 減少手動調整

### 2. 設定 Code Connect

為所有 components 建立 Figma ↔ Code 連接：
```
SeedPassCertificate ↔ Figma node 1789:49344
Button ↔ Figma Button component
Card ↔ Figma Card component
```

**好處：**
- 設計師在 Figma 可以直接看到 code
- 追蹤設計變更
- 確保 design-code 一致

---

## 📚 你貼的說明有幫助的部分

### ✅ 最有幫助

1. **Selection-based prompting 說明**
   - 我現在知道可以直接選 Figma 節點（desktop MCP）
   - 或貼 link（remote MCP）

2. **Output 格式可自訂**
   - 可以要求 Vue、HTML、iOS 格式
   - 可以指定使用專案的 components

3. **工具的具體用途**
   - 每個工具的使用時機很清楚
   - 知道何時用 metadata vs. design_context

### ⚠️ 需要注意

1. **Remote vs. Desktop MCP 的差異**
   - Remote 需要 link
   - Desktop 可以用 selection
   - 你現在用的是 Desktop MCP

2. **Code Connect 需要 published component**
   - 你之前遇到的問題：component 沒 publish
   - 未來要做 Code Connect，需要先在 Figma publish

---

## 總結

你貼的 tools 說明**非常有用**！我現在知道：

✅ 用 `get_metadata` 快速評估複雜度
✅ 用 `get_screenshot` 作為視覺標準
✅ 用 `get_design_context` 取得詳細規格
✅ 用 `get_variable_defs` 提取 design tokens
✅ 可以自訂輸出格式
✅ 未來可以用 `create_design_system_rules` 自動化

**下次你貼 Figma link，我會更有效率地使用這些工具！**

---

**要不要現在執行 `create_design_system_rules` 來生成專案的設計規則？**
這樣未來實現設計時，會更符合你們的 design system。
