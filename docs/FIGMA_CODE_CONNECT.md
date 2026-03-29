# Figma Code Connect 設置指南

本指南說明如何將 Figma 設計與 React 組件連接起來。

## 📦 什麼是 Code Connect？

Code Connect 是 Figma 的功能，讓設計師在 Figma 中直接看到對應的程式碼實現。

**優點：**
- 設計師可以看到設計如何被實現
- 開發者可以從 Figma 直接跳轉到程式碼
- 保持設計和程式碼的一致性

## 🔧 設置步驟

### 1. 安裝 Figma Code Connect CLI

```bash
npm install -g @figma/code-connect
```

### 2. 登入 Figma

```bash
figma-connect login
```

### 3. 初始化專案（如果還沒做過）

```bash
figma-connect init
```

### 4. 發布 Code Connect 映射

我們已經為 Seed Pass 證書創建了 Code Connect 配置檔案：

```bash
# 發布映射到 Figma
figma-connect publish
```

這會上傳 `src/components/certificates/SeedPassCertificate.figma.tsx` 的映射。

### 5. 在 Figma 中查看

1. 打開 Figma 設計檔
2. 選擇任一證書組件（Seed、Sprout、Bloom）
3. 在右側面板中查看「Code」標籤
4. 你會看到對應的 React 代碼！

## 📝 已配置的映射

### Seed Certificate (L1)
- **Figma Node ID**: `1789:49345`
- **組件**: `SeedPassCertificate`
- **Props**: `level="seed"`

### Sprout Certificate (L2)
- **Figma Node ID**: `1789:49356`
- **組件**: `SeedPassCertificate`
- **Props**: `level="sprout"`

### Bloom Certificate (L3)
- **Figma Node ID**: `1789:49369`
- **組件**: `SeedPassCertificate`
- **Props**: `level="bloom"`

## 🔄 更新映射

當組件程式碼有變更時：

```bash
# 重新發布映射
figma-connect publish

# 或只發布特定檔案
figma-connect publish src/components/certificates/SeedPassCertificate.figma.tsx
```

## 📚 配置檔案位置

- **Code Connect 配置**: `src/components/certificates/SeedPassCertificate.figma.tsx`
- **React 組件**: `src/components/certificates/SeedPassCertificate.tsx`
- **設計 JSON**: `design-specs/seed-pass-certificates.json`

## 🐛 常見問題

### Q: 發布後在 Figma 中看不到代碼？

A: 確認：
1. 組件已經在 Figma 中「發布到團隊庫」
2. 你有該 Figma 檔案的編輯權限
3. 使用正確的 Figma URL 和 Node ID

### Q: 如何找到 Node ID？

A: 在 Figma 中：
1. 選中組件
2. 右鍵 → Copy Link
3. URL 中 `node-id=` 後面的部分就是（記得把 `-` 改成 `:`）

### Q: Code Connect 會自動更新嗎？

A: 不會。每次修改程式碼後，需要重新執行 `figma-connect publish`。

## 🔗 更多資源

- [Figma Code Connect 官方文檔](https://help.figma.com/hc/en-us/articles/23920389749655-Code-Connect)
- [React Code Connect 指南](https://github.com/figma/code-connect)
