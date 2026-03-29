/**
 * This utility extracts critical CSS for above-the-fold content
 * It's used during build time to inline critical styles
 * 
 * ⚠️ 注意：這個文件目前是備用的
 * 我們使用 Beasties (scripts/critical-css.js) 來自動處理 Critical CSS
 * 保留這個文件是為了：
 * 1. 作為關鍵樣式的參考
 * 2. 如果 Beasties 有問題時可以快速切換回來
 * 
 * 如果要重新啟用，請在 layout.tsx 中引入並使用
 */

// Critical CSS for the main layout and initial page
const criticalCss = `
/* Critical CSS for initial render */
/* 关键字体定义 */
@font-face {
  font-family: 'Wix Madefor Display';
  src: url('https://statics.bloomprotocol.ai/fonts/WixMadeforDisplay-Regular.ttf') format('truetype');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Wix Madefor Display';
  src: url('https://statics.bloomprotocol.ai/fonts/WixMadeforDisplay-Medium.ttf') format('truetype');
  font-weight: 500;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Wix Madefor Display';
  src: url('https://statics.bloomprotocol.ai/fonts/WixMadeforDisplay-SemiBold.ttf') format('truetype');
  font-weight: 600;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Wix Madefor Display';
  src: url('https://statics.bloomprotocol.ai/fonts/WixMadeforDisplay-Bold.ttf') format('truetype');
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Wix Madefor Display';
  src: url('https://statics.bloomprotocol.ai/fonts/WixMadeforDisplay-ExtraBold.ttf') format('truetype');
  font-weight: 800;
  font-style: normal;
  font-display: swap;
}

/* 基础样式重置 */
*, *::before, *::after {
  box-sizing: border-box;
}

html, body {
  font-family: var(--font-wix), 'Wix Madefor Display', sans-serif;
  margin: 0;
  padding: 0;
}

/* 使特定元素使用 Wix Display 字体 */
h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-wix), 'Wix Madefor Display', sans-serif;
}

body {
  color: #393f49;
  background-image: url(https://statics.bloomprotocol.ai/images/body-light.jpg);
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  font-size: 16px;
  button {
    font-family: inherit;
  }
}

/* 关键的 Tailwind 类 */
.font-bold {
  font-weight: 700 !important;
}

.bg-primary {
  background-color: #90d446 !important;
}

.font-sans {
  font-family: var(--font-wix), 'Wix Madefor Display', sans-serif !important;
}

.font-display {
  font-family: var(--font-wix), 'Wix Madefor Display', sans-serif !important;
}
`;

module.exports = criticalCss; 