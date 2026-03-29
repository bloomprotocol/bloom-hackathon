# Bloom Protocol Design System Rules

> 自動生成於 2026-01-28
> 基於 codebase 掃描和 Figma MCP 分析

這份文檔定義 Bloom Protocol 的設計系統規則，用於確保從 Figma 實現的設計符合專案風格。

---

## 🎨 Design Tokens

### Colors

#### Primary Palette

```css
/* Brand Colors */
--color-brand-green: #71ca41;      /* Bloom icon, growth elements */
--color-brand-purple: #a855f7;     /* Bloom tulip, accent color */

/* Base Colors */
--color-background: #F5F0EB;       /* Warm beige background */
--color-white: #FFFFFF;
--color-black: #121212;

/* Text Colors */
--color-text-primary: #121212;     /* Main text (black) */
--color-text-secondary: #DADADA;   /* Secondary text (light gray) */
--color-text-white: #FFFFFF;       /* White text on dark backgrounds */
```

#### Glass Morphism

```css
/* Card backgrounds with backdrop blur */
--color-glass-white: rgba(255, 255, 255, 0.5);
backdrop-filter: blur(5px);
```

**使用方式：**
```tsx
<div className="backdrop-blur-[5px] bg-[rgba(255,255,255,0.5)]">
  Card content
</div>
```

---

### Typography

#### Font Families

專案使用三種字體，每種有特定用途：

```css
/* Primary Font - Body text, UI elements */
font-family: 'Outfit', sans-serif;
--font-outfit: (Google Font variable)

/* Display Font - Large headings, hero sections */
font-family: 'Gilkys', serif;

/* Secondary Serif - Card titles, section headings */
font-family: 'Times New Roman', serif;
```

#### Font Usage Guidelines

| 元素 | 字體 | 大小 (Mobile) | 大小 (Desktop) | 粗細 |
|------|------|--------------|----------------|-----|
| Hero Heading | Gilkys | 32px | 56px | Normal |
| Card Title | Times New Roman | 20px | 20px | Normal |
| Body Text | Outfit | 14px | 14px | 300 (Light) |
| Subtitle | Outfit | 14px | 18px | 300 (Light) |
| Small Text | Outfit | 12px | 14px | 300-400 |

#### Letter Spacing

```css
/* Large headings */
letter-spacing: -1.68px;  /* Hero headings */

/* Subtitles */
letter-spacing: -0.36px;  /* Secondary headings */
```

#### Line Height

```css
/* Headings */
line-height: 1.2;

/* Body text */
line-height: normal;
```

**實作範例：**
```tsx
{/* Hero Heading */}
<p
  className="text-[32px] desktop:text-[56px] leading-[1.2] tracking-[-1.68px] uppercase"
  style={{ fontFamily: 'Gilkys, serif' }}
>
  WHERE EARLY BELIEF BECOMES CAPITAL
</p>

{/* Card Title */}
<p
  className="text-[20px]"
  style={{ fontFamily: 'Times New Roman, serif' }}
>
  Discover Early Builders
</p>

{/* Body Text */}
<p
  className="font-light text-[14px]"
  style={{ fontFamily: 'Outfit, sans-serif' }}
>
  Find high-quality builders at the very beginning of their journey.
</p>
```

---

### Spacing

#### Spacing Scale

```
4px   → gap-[4px]
8px   → gap-[8px]   p-[8px]
12px  → gap-[12px]
16px  → gap-[16px]  p-[16px]
20px  → gap-[20px]
30px  → mt-[30px]
40px  → mt-[40px]   desktop:mt-[40px]
55px  → desktop:pt-[55px]
```

#### Common Patterns

**卡片內距：**
```tsx
<div className="p-[16px]">
  Card content
</div>
```

**元素間距：**
```tsx
<div className="flex flex-col gap-[8px]">
  {/* 8px vertical spacing */}
</div>

<div className="flex gap-[20px]">
  {/* 20px horizontal spacing */}
</div>
```

**Section 間距：**
```tsx
<div className="mt-[30px] desktop:mt-[40px]">
  {/* 30px on mobile, 40px on desktop */}
</div>
```

---

### Border Radius

**標準圓角：**
```css
border-radius: 20px;  /* 統一使用 20px */
```

**使用方式：**
```tsx
<div className="rounded-[20px]">
  Content
</div>
```

---

### Shadows

#### Card Shadow

專案使用一致的陰影系統：

```css
box-shadow:
  0px 6px 10px -4px rgba(0, 0, 0, 0.12),  /* Soft drop shadow */
  0px 0px 0px 1px rgba(0, 0, 0, 0.05);    /* Subtle border */
```

**使用方式：**
```tsx
<div className="shadow-[0px_6px_10px_-4px_rgba(0,0,0,0.12),0px_0px_0px_1px_rgba(0,0,0,0.05)]">
  Card content
</div>
```

---

## 📐 Layout System

### Container Max Width

```css
max-width: 1440px;
```

**標準 Container：**
```tsx
<div className="mx-auto px-4 max-w-[1440px]">
  Content
</div>
```

### Breakpoints

專案使用自訂 breakpoint：

```
mobile:    未定義具體值（預設）
desktop:   (Tailwind v4 自訂 breakpoint)
```

**使用方式：**
```tsx
{/* Mobile first, then desktop */}
<div className="text-[14px] desktop:text-[18px]">
  Responsive text
</div>

<div className="h-[56px] desktop:h-[84px]">
  Responsive height
</div>
```

### Page Layout Standards

#### PageContainer Component

除首頁外，所有頁面使用統一的 `PageContainer`：

```tsx
// components/PageContainer.tsx
// - Horizontal: px-4 (mobile) / desktop:px-40
// - Vertical: py-8 (mobile) / desktop:py-10
// - Max width: 1440px

<PageContainer>
  {children}
</PageContainer>
```

#### Background Pattern

```tsx
{/* Global background */}
<div className="fixed inset-0 bg-[#F5F0EB] -z-20" />

{/* Content with BackgroundVideo or BackgroundImage */}
<div className="relative min-h-screen">
  <BackgroundVideo src="..." poster="..." />
  <div className="relative">
    <div className="mx-auto px-4 max-w-[1440px]">
      {/* Content */}
    </div>
  </div>
</div>
```

---

## 🧩 Component Patterns

### Glass Card Pattern

最常用的卡片設計（見於首頁、功能卡片）：

```tsx
<div className="
  backdrop-blur-[5px]
  bg-[rgba(255,255,255,0.5)]
  flex flex-col gap-[8px]
  items-start justify-center
  p-[16px]
  rounded-[20px]
  shadow-[0px_6px_10px_-4px_rgba(0,0,0,0.12),0px_0px_0px_1px_rgba(0,0,0,0.05)]
  w-full desktop:w-[260px]
">
  {/* Image */}
  <div className="relative h-[164px] rounded-[20px] w-full overflow-hidden">
    <Image src="..." alt="..." fill className="object-cover" />
  </div>

  {/* Content */}
  <div className="flex flex-col gap-[2px] text-[#121212] w-full">
    <p
      className="text-[20px]"
      style={{ fontFamily: 'Times New Roman, serif' }}
    >
      Card Title
    </p>
    <p
      className="font-light text-[14px]"
      style={{ fontFamily: 'Outfit, sans-serif' }}
    >
      Card description text.
    </p>
  </div>
</div>
```

### Button Pattern

*(待補充：需要掃描 button components)*

### Modal Pattern

*(使用 BaseModal component)*

---

## 🖼️ Asset Management

### Static Assets

```
public/
├── certificates/        # 證書、徽章
├── rewards/            # 獎勵卡片
├── backgrounds/        # 背景圖片
└── [category]/         # 其他分類素材
```

### CDN Assets

專案使用 CDN 存放大型素材：

```
https://statics.bloomprotocol.ai/images/home/openBeta/
https://statics.bloomprotocol.ai/logo/
```

**使用方式：**
```tsx
<Image
  src="https://statics.bloomprotocol.ai/images/home/openBeta/1st_image_mainScreen.jpg"
  alt="Descriptive alt text"
  fill
  className="object-cover"
/>
```

---

## 🎯 Icon System

### Icon Pattern

專案使用內嵌 SVG components：

```tsx
// src/app/discover/icons.tsx
interface IconProps {
  className?: string;
  size?: number;
}

export function BloomIcon({ className = "", size = 16 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      {/* SVG paths */}
    </svg>
  );
}
```

**使用方式：**
```tsx
<BloomIcon size={24} className="text-green-500" />
```

### Icon Colors

```
Brand Green: #71ca41
Brand Purple: #a855f7
currentColor (繼承父元素顏色)
```

---

## 🎭 Styling Approach

### Tailwind CSS v4

專案使用 **Tailwind CSS v4**，大部分配置在 CSS 層級：

```typescript
// tailwind.config.ts - 極簡配置
export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
} satisfies Config;
```

### CSS Modules

部分 UI components 使用 CSS Modules：

```
src/components/ui/Box.module.css
src/components/ui/Container.module.css
src/components/ui/Progress.module.css
```

**使用方式：**
```tsx
import styles from './Box.module.css';

<div className={`${styles.box} ${className}`}>
  {children}
</div>
```

### Inline Styles

**僅用於字體系列：**
```tsx
style={{ fontFamily: 'Gilkys, serif' }}
style={{ fontFamily: 'Times New Roman, serif' }}
style={{ fontFamily: 'Outfit, sans-serif' }}
```

**不要用於：**
- ❌ Colors（使用 Tailwind classes）
- ❌ Spacing（使用 Tailwind classes）
- ❌ Layout（使用 Tailwind classes）

---

## 🏗️ Component Architecture

### Component Organization

```
src/components/
├── ui/                     # 可重用 UI components
│   ├── Box.tsx
│   ├── Container.tsx
│   ├── BaseModal.tsx
│   └── Progress.tsx
├── menu/                   # 全局 Menu (不要在 pages 中 import)
├── certificates/           # 證書相關 components
├── openBetaMainpage/       # 首頁 sections
└── [feature]/              # 功能特定 components
```

### Component Conventions

1. **Server Components 優先**
   - 所有 page.tsx 必須是 Server Components
   - 只在需要互動時使用 'use client'

2. **Props Interface**
   ```tsx
   interface ComponentNameProps {
     /** JSDoc 說明 */
     propName: string;
     className?: string;  // 總是支援 className
     children?: React.ReactNode;
   }
   ```

3. **Path Alias**
   ```tsx
   import { Component } from '@/components/Component';
   // ✅ 使用 @/ alias

   import { Component } from '../../../components/Component';
   // ❌ 不要用相對路徑
   ```

---

## 🚀 Implementing Figma Designs

### Decision Tree

當收到 Figma 設計時：

```
1. 執行 get_metadata 評估複雜度
   ├─ 複雜設計（8+ 層、多個 image 節點）
   │  → 使用靜態圖片匯出（figma-export-static-assets skill）
   │
   └─ 簡單設計（單層、基本 UI）
      → 代碼實現（參考本 design system rules）
```

### 實現簡單 UI 時

**步驟：**

1. **搜尋現有 components**
   ```bash
   # 在 src/components/ui/ 找相似的
   ```

2. **使用 design tokens**
   ```tsx
   // ✅ 正確：使用定義好的顏色
   <div className="bg-[#F5F0EB] text-[#121212]">

   // ❌ 錯誤：使用 Figma 的隨機顏色
   <div className="bg-[#F3E8DF] text-[#0A0A0A]">
   ```

3. **遵循 spacing scale**
   ```tsx
   // ✅ 正確：使用 8, 12, 16, 20, 30, 40px
   <div className="gap-[16px] p-[16px]">

   // ❌ 錯誤：使用奇怪的間距
   <div className="gap-[15px] p-[18px]">
   ```

4. **使用正確的字體**
   ```tsx
   // ✅ 大標題
   <h1 style={{ fontFamily: 'Gilkys, serif' }}>

   // ✅ 卡片標題
   <h2 style={{ fontFamily: 'Times New Roman, serif' }}>

   // ✅ 正文
   <p style={{ fontFamily: 'Outfit, sans-serif' }}>
   ```

5. **遵循 responsive pattern**
   ```tsx
   // ✅ Mobile first
   <div className="text-[14px] desktop:text-[18px]">

   // ❌ Desktop only
   <div className="desktop:text-[18px]">
   ```

### 實現複雜視覺設計時

**使用靜態圖片匯出（參考 SeedPassCertificate 範例）：**

```tsx
'use client';

import Image from 'next/image';

interface CertificateProps {
  level: 'seed' | 'sprout' | 'bloom';
  className?: string;
}

const config = {
  seed: {
    src: '/certificates/seed-certificate.png',
    alt: 'Seed Level Certificate',
  },
  // ...其他變體
};

export default function Certificate({ level, className = '' }: CertificateProps) {
  const item = config[level];

  return (
    <div className={`relative w-[272px] h-[320px] ${className}`}>
      <Image
        src={item.src}
        alt={item.alt}
        width={272}
        height={320}
        className="w-full h-full object-contain"
        priority
      />
    </div>
  );
}
```

---

## 📋 Quality Checklist

實現 Figma 設計後，檢查以下項目：

### Visual Fidelity
- [ ] 顏色符合 design tokens
- [ ] 字體使用正確（Gilkys / Times New Roman / Outfit）
- [ ] 間距使用 spacing scale（8, 12, 16, 20...）
- [ ] 圓角統一 20px
- [ ] 陰影使用標準 shadow pattern

### Responsive Design
- [ ] Mobile first（預設 mobile 樣式）
- [ ] Desktop breakpoint 正確使用
- [ ] 在 375px (mobile) 和 1440px (desktop) 測試過

### Code Quality
- [ ] 使用 @/ path alias
- [ ] 支援 className prop
- [ ] TypeScript types 完整
- [ ] 沒有 console.log
- [ ] 沒有硬編碼的奇怪數值

### Performance
- [ ] Images 使用 Next.js Image component
- [ ] Images 有正確的 alt text
- [ ] 靜態資源使用 CDN 或 /public
- [ ] 沒有不必要的 'use client'

### Accessibility
- [ ] 顏色對比度足夠（WCAG AA）
- [ ] 互動元素有適當的 hover/focus 狀態
- [ ] 語義化 HTML（正確使用 h1, h2, p, button 等）

---

## 🔄 Future Improvements

### 待補充的 Patterns

- [ ] Button variants（primary, secondary, ghost）
- [ ] Form input styles
- [ ] Toast/notification patterns
- [ ] Loading states
- [ ] Error states
- [ ] Empty states

### Design Tokens Migration

考慮將 inline colors 移到 Tailwind config：

```typescript
// tailwind.config.ts (未來)
theme: {
  extend: {
    colors: {
      'bloom-bg': '#F5F0EB',
      'bloom-green': '#71ca41',
      'bloom-purple': '#a855f7',
    }
  }
}
```

---

## 📚 Reference Files

- **Component Library:** `src/components/ui/`
- **Homepage Example:** `src/components/openBetaMainpage/OpenBetaMainpage.tsx`
- **Layout System:** `src/components/PageContainer.tsx`
- **Icon System:** `src/app/discover/icons.tsx`
- **Assets Registry:** `design-assets/assets-registry.md`

---

**版本：** 1.0.0
**最後更新：** 2026-01-28
**生成方式：** Codebase 掃描 + Figma MCP 分析
