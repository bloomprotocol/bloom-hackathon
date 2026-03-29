# Mainpage Content Configuration 使用指南

## 概述

`content.config.ts` 文件包含了 mainpage 中所有顯示的文字內容。通過編輯這個文件，您可以輕鬆更改頁面上的任何文字，而無需修改組件代碼。

## 文件位置

```
src/components/mainpage/content.config.ts
```

## 如何使用

1. 打開 `content.config.ts` 文件
2. 找到您想要修改的文字（文件中有詳細的中文註釋說明每個字段的用途）
3. 直接修改對應的文字內容
4. 保存文件，頁面會自動更新

## 配置結構說明

### 1. 主頁面內容 (mainPage)

- **framingText**: 終端上方的大標題和副標題
  - developer: 開發者模式的文字
  - user: 用戶模式的文字

- **terminal**: 終端界面的內容
  - prompt: 終端提示語
  - toggleText: 切換按鈕的文字
  - options: 終端中的選項文字

### 2. 轉場動畫內容 (terminalTransition)

- **framingText**: 轉場時顯示的標題
- **commands**: 終端命令文字
- **output**: 終端輸出的文字

### 3. 開發者時間線 (journeyTimeline)

- **header**: 頁面標題
- **stats**: 統計面板的標籤
- **milestones**: 里程碑的文字內容
- **emailSignup**: 郵件註冊表單的文字

### 4. 用戶 RPG 頁面 (rpg)

- **header**: 頁面標題
- **character**: 角色信息顯示
- **inventory**: 物品庫存的名稱和描述
- **alerts**: 點擊物品時的提示消息

## 示例

如果您想修改主頁面的標題，可以找到以下部分：

```typescript
framingText: {
  developer: {
    title: "Bloom Protocol helps you turn early ideas into revenue.",  // 修改這裡
    subtitle: "From creator tools to milestone-based crowdfunding — choose how you want to start."  // 或這裡
  }
}
```

## 注意事項

1. 修改文字時請保持引號內的格式
2. 如果文字中包含變量（如 `{name}` 或 `{countdown}`），請不要刪除這些佔位符
3. 部分文字可能有長度限制，請注意保持適當的長度以免影響頁面布局
4. 修改後請在瀏覽器中檢查效果，確保顯示正常

## 需要更新的內容

目前有些內容還需要更新：

- 用戶模式的終端選項文字（目前是 "aaaaa" 和 "bbbbb"）

```typescript
user: {
  option1: "[1] aaaaa",  // 需要更新
  option2: "[2] bbbbb"  // 需要更新
}
```

請根據實際需求更新這些內容。 