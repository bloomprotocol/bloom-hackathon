# 從 Figma 導出證書圖片

## 方法 1：在 Figma Desktop 中導出（推薦）

1. 打開 Figma 文件：https://www.figma.com/design/MBzMGT7TcUncjhUjzEbNCA/Bloom-Protocol-New--Copy-?node-id=1789-49344

2. 選擇 **Property 1=Default** (Seed 證書)
   - 右鍵點擊 → Export
   - 格式：PNG
   - 倍數：2x（或 3x 更清晰）
   - 保存為：`public/certificates/seed-certificate.png`

3. 選擇 **Property 1=Variant2** (Sprout 證書)
   - 右鍵點擊 → Export
   - 格式：PNG
   - 倍數：2x
   - 保存為：`public/certificates/sprout-certificate.png`

4. 選擇 **Property 1=Variant3** (Bloom 證書)
   - 右鍵點擊 → Export
   - 格式：PNG
   - 倍數：2x
   - 保存為：`public/certificates/bloom-certificate.png`

## 方法 2：使用 Figma API（自動化）

```bash
# 需要 Figma Personal Access Token
# 在 Figma → Account Settings → Personal Access Tokens 生成

export FIGMA_TOKEN="your-token-here"
export FILE_KEY="MBzMGT7TcUncjhUjzEbNCA"

# Seed - Node ID: 1789:49345
curl -H "X-Figma-Token: $FIGMA_TOKEN" \
  "https://api.figma.com/v1/images/$FILE_KEY?ids=1789:49345&scale=2&format=png" \
  | jq -r '.images["1789:49345"]' \
  | xargs curl -o public/certificates/seed-certificate.png

# Sprout - Node ID: 1789:49356
curl -H "X-Figma-Token: $FIGMA_TOKEN" \
  "https://api.figma.com/v1/images/$FILE_KEY?ids=1789:49356&scale=2&format=png" \
  | jq -r '.images["1789:49356"]' \
  | xargs curl -o public/certificates/sprout-certificate.png

# Bloom - Node ID: 1789:49369
curl -H "X-Figma-Token: $FIGMA_TOKEN" \
  "https://api.figma.com/v1/images/$FILE_KEY?ids=1789:49369&scale=2&format=png" \
  | jq -r '.images["1789:49369"]' \
  | xargs curl -o public/certificates/bloom-certificate.png
```

## 導出設置建議

- **格式**：PNG
- **倍數**：2x 或 3x（高解析度螢幕）
- **尺寸**：原始尺寸 272x320，導出為 544x640 (2x) 或 816x960 (3x)
- **背景**：透明（如果 Figma 有設置）

## 驗證導出

導出後，檢查文件：

```bash
ls -lh public/certificates/*-certificate.png
```

應該看到三個文件：
- seed-certificate.png (~200-500 KB)
- sprout-certificate.png (~200-500 KB)
- bloom-certificate.png (~200-500 KB)

## 下一步

導出完成後，組件會自動使用這些圖片：

```tsx
<SeedPassCertificate level="seed" />   // 使用 seed-certificate.png
<SeedPassCertificate level="sprout" /> // 使用 sprout-certificate.png
<SeedPassCertificate level="bloom" />  // 使用 bloom-certificate.png
```
