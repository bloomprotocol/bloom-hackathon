# CLAUDE.md - bp-fe

This file provides guidance to Claude Code when working with code in this repository.

## Development Commands

使用 `/dev` skill 管理服务（在背景运行）：

```bash
/dev                 # 查看所有服务状态
/dev start bp-fe     # 启动前端
/dev stop bp-fe      # 停止前端
/dev group main      # 启动 Main 组 (bp-fe, bp-be, bp-admin, bp-api)
```

本地 build：
```bash
npm run build        # 生产构建 + Critical CSS 优化
npm run lint         # ESLint 检查
```

## Tech Stack

- **Next.js 15** with App Router
- **React 19** with TypeScript
- **Tailwind CSS v4**
- **React Query** for server state

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (home)/            # Public routes (homepage)
│   ├── (protected)/       # Auth-required routes
│   └── layout.tsx         # Root layout with global Menu
├── components/
│   ├── PageContainer.tsx  # 统一页面容器组件
│   ├── BackgroundImage.tsx
│   ├── menu/              # Global menu (DO NOT import in pages)
│   └── ui/                # Reusable UI components
├── lib/
│   ├── api/services/      # API service layer
│   ├── context/           # React contexts (Auth, Menu, Modal)
│   └── hooks/             # Custom hooks
└── middleware.ts          # Auth & routing logic
```

## Page Layout Standards

### PageContainer 组件

除了首页和 public pages，所有页面都使用 `PageContainer` 组件：

```tsx
// components/PageContainer.tsx
// 统一的页面容器，提供一致的 padding 和 max-width
// - Horizontal: px-4 (mobile) / desktop:px-40
// - Vertical: py-8 (mobile) / desktop:py-10
// - Max width: 1440px
```

### Layout 结构

```tsx
// 标准 layout 模板
import BackgroundImage from "@/components/BackgroundImage";
import PageContainer from "@/components/PageContainer";

export default function PageLayout({ children }) {
  return (
    <>
      <BackgroundImage src="..." alt="..." />
      <PageContainer>{children}</PageContainer>
    </>
  );
}
```

### 页面类型

| 类型 | 背景 | 容器 |
|------|------|------|
| 首页 | 特殊多屏设计 | 不使用 PageContainer |
| Public pages | BackgroundImage | PageContainer |
| Protected pages | BackgroundImage | PageContainer |

## Key Conventions

1. **Server Components**: ALL page.tsx files MUST be server components
2. **Never import Menu component in pages** - it's globally managed
3. **Use path alias**: `@/` maps to `./src/`
4. **Protected routes**: Add to `protectedRoutes` in `routeGuard.ts`

## Creating New Pages

1. 创建 `layout.tsx`：使用 `BackgroundImage` + `PageContainer`
2. 创建 `page.tsx`：Server component，导出 metadata
3. 创建 `page.meta.ts`：SEO metadata
4. 如需导航：更新 `Menu.tsx` 和 `NavigationModal.tsx`

## Design Assets from Figma

### 從 Figma 實現設計的流程

當用戶貼 Figma link 時：

1. **自動評估複雜度**（用 `get_metadata`）
   - 複雜設計（8+ 層、多個 image 節點）→ 靜態圖片匯出
   - 簡單設計（單層、基本 UI）→ 代碼實現

2. **靜態圖片匯出**（複雜視覺設計）
   - 需要 Figma Personal Access Token
   - 自動下載 PNG 到 `public/[category]/`
   - 建立 Image component
   - 更新 `design-assets/assets-registry.md`

3. **代碼實現**（簡單 UI）
   - 用 `get_design_context` 取得規格
   - 搜尋現有 components 並重用
   - 符合專案的 design system

### 素材索引

**所有 Figma 素材記錄在：** `design-assets/assets-registry.md`

**現有素材：**
- SeedPass Certificate (`public/certificates/`, 3 個變體)

**工具說明：** `design-assets/figma-mcp-tools-guide.md`

### 範例

```
用戶：「https://figma.com/design/ABC?node-id=123
      我想在 dashboard 用這個卡片」

Claude：[自動評估] → [匯出素材] → [建立 component] → [更新 registry]
        「✅ 完成！Preview: /preview/cards」
```

## Environment Variables

Required:
- `NEXT_PUBLIC_PRIVY_APP_ID` - Privy authentication
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` - Cloudflare Turnstile
- `NEXT_PUBLIC_API_BASE_URL` - Backend API endpoint

World ID / AgentKit (Sanctuary):
- `NEXT_PUBLIC_WORLDCOIN_APP_ID` - World ID app ID (`app_xxx` from Developer Portal)
- `NEXT_PUBLIC_WORLDCOIN_RP_ID` - Relying Party ID (`rp_xxx` from Developer Portal)
- `WORLDCOIN_RP_SIGNING_KEY` - RP ECDSA signing key (server-only, never expose to client)

Optional (local tunnel):
- `NEXT_PUBLIC_TUNNEL_DOMAIN` - Cloudflare tunnel domain
- `NEXT_PUBLIC_TUNNEL_API_URL` - Tunnel API URL
