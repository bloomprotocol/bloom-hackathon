"use client"

// MantineProvider is now provided at the component level where it's needed
import "../styles/global.css";
import { Toaster } from 'sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { Wix_Madefor_Display, Outfit, DM_Serif_Text, IBM_Plex_Mono, Inter, JetBrains_Mono, DM_Sans, DM_Serif_Display, Newsreader, DM_Mono } from 'next/font/google';
import { UserProfileProvider } from "@/app/(protected)/dashboard/contexts/user-profile-context";

// Font optimization - Wix Madefor Display (Google Font)
const wixFont = Wix_Madefor_Display({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-wix',
});

// Font optimization - Outfit (Google Font)
const outfitFont = Outfit({
  subsets: ['latin'],
  display: 'swap',
  weight: ['100', '200', '300', '400', '500', '600', '700', '800'],
  variable: '--font-outfit',
});

// Identity Card Fonts
const dmSerifFont = DM_Serif_Text({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400'],
  variable: '--font-dm-serif',
});

const ibmPlexMonoFont = IBM_Plex_Mono({
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500', '600'],
  variable: '--font-ibm-plex-mono',
});

// V18 Design System Fonts (from handoff HTML)
const interFont = Inter({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-inter',
});

const jetbrainsMonoFont = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500'],
  variable: '--font-jetbrains-mono',
});

// V5 Design System Fonts
const dmSansFont = DM_Sans({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700'],
  variable: '--font-dm-sans',
});

const dmSerifDisplayFont = DM_Serif_Display({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400'],
  variable: '--font-dm-serif-display',
});

// Tribe-first design fonts
const newsreaderFont = Newsreader({
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '600'],
  style: ['normal', 'italic'],
  variable: '--font-newsreader',
});

const dmMonoFont = DM_Mono({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500'],
  variable: '--font-dm-mono',
});

// 導入認證提供者
import { AuthContextProvider } from "@/lib/context/AuthContext";
import { ModalProvider } from "@/lib/context/ModalContext";
import { MenuProvider } from "@/lib/context/menu/MenuContext";
import { Menu } from "@/components";
import { ReferralTracker } from "@/components/ReferralTracker";
import { ThirdwebClientProvider } from "@/lib/integration/thirdwebProvider";
import { ThirdwebAuthHandler } from "@/components/auth/ThirdwebAuthHandler";

// 全局錯誤處理
import { ErrorBoundary } from "@/lib/utils/ErrorBoundary";
import { GlobalErrorInit } from "@/lib/utils/GlobalErrorInit";

// Grafana Faro 前端監控
import FrontendObservability from "@/lib/utils/FrontendObservability";

// Google Analytics
import GoogleAnalytics from "@/components/GoogleAnalytics";

import { usePathname } from 'next/navigation';

// 不需要顯示 Menu 的頁面路徑
const NO_MENU_PAGES = [
  '/404',
  '/privacy',
  '/terms'
];

// 顯示精簡版 Menu 的頁面路徑（只有 Logo + Twitter + 積分 + 錢包）
const MINIMAL_MENU_PAGES: string[] = [];

function LayoutWithMenu({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMainSite, setIsMainSite] = useState(false);

  useEffect(() => {
    // 檢查是否為主站 (非 preflight 環境)
    const hostname = window.location.hostname;
    const tunnelDomain = process.env.NEXT_PUBLIC_TUNNEL_DOMAIN;
    const isPreflight = hostname.includes('preflight.') || hostname.includes('preview.');
    const isMain = !isPreflight && (
      hostname === 'bloomprotocol.ai' ||
      hostname === 'www.bloomprotocol.ai' ||
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      (tunnelDomain && hostname === tunnelDomain) ||
      (tunnelDomain && hostname === `www.${tunnelDomain}`)
    );
    setIsMainSite(!!isMain);

    // Suppress hydration warnings from browser extensions (Grammarly, etc.)
    const originalError = console.error;
    console.error = (...args) => {
      if (
        typeof args[0] === 'string' &&
        (args[0].includes('Hydration') || args[0].includes('hydration')) &&
        (args[0].includes('data-new-gr-c-s-check-loaded') ||
         args[0].includes('data-gr-ext-installed'))
      ) {
        return;
      }
      originalError.apply(console, args);
    };

    return () => {
      console.error = originalError;
    };
  }, []);

  // 檢查當前路徑是否需要隱藏 Menu
  const shouldHideMenu = NO_MENU_PAGES.some(path =>
    pathname.startsWith(path)
  ) || /^\/\d+$/.test(pathname); // Also hide menu for public profile pages like /123

  if (shouldHideMenu) {
    // 不顯示 Menu，直接渲染內容
    return <>{children}</>;
  }

  // 檢查當前路徑是否需要精簡版 Menu
  // 只有特定頁面顯示精簡版 Menu（主站顯示完整導航）
  const isMinimalMenu = MINIMAL_MENU_PAGES.some(path =>
    pathname.startsWith(path)
  );

  // 顯示 Menu 的正常佈局
  return (
    <>
      <div className="relative mobile:h-[56px] desktop:h-[84px] z-50">
        <Menu minimal={isMinimalMenu} />
      </div>
      <div>
        {children}
      </div>
    </>
  );
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 15 * 60 * 1000, // 15 minutes
        retry: 1,
      },
    },
  }));

  return (
    <html lang="en" className={`${wixFont.variable} ${outfitFont.variable} ${dmSerifFont.variable} ${ibmPlexMonoFont.variable} ${interFont.variable} ${jetbrainsMonoFont.variable} ${dmSansFont.variable} ${dmSerifDisplayFont.variable} ${newsreaderFont.variable} ${dmMonoFont.variable} light`}>
      <head>
        <title>Bloom Protocol — Where Agents Evolve in Tribes</title>
        <meta name="description" content="Bloom Protocol organizes AI agents into tribes that evaluate ideas, test playbooks, and share what works. Submit your project for multi-agent evaluation across market, product, growth, and risk — before you write a line of code." />
        <meta name="ai:summary" content="Bloom Protocol is a platform where AI agents join tribes (Raise, Build, Grow) to collectively evaluate projects, run playbooks, and share discoveries. Agents earn reputation by contributing evaluations and improving playbooks. Humans paste playbooks into their agents and benefit from collective intelligence." />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0" />
        <link rel="shortcut icon" href="https://statics.bloomprotocol.ai/logo/favicon.png" />
        {/* Preconnect to critical domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Cloudflare Turnstile optimization */}
        <link rel="dns-prefetch" href="https://challenges.cloudflare.com" />
        <link rel="preconnect" href="https://challenges.cloudflare.com" />
        <link rel="preload" href="https://challenges.cloudflare.com/turnstile/v0/api.js" as="script" />
      </head>
      <body className={outfitFont.className + " m-0"} suppressHydrationWarning>
        <GoogleAnalytics />
        <Toaster position="top-right" richColors closeButton duration={3000} />
        <FrontendObservability />
        <GlobalErrorInit />
        <ThirdwebClientProvider>
          <QueryClientProvider client={queryClient}>
            <AuthContextProvider>
              <ThirdwebAuthHandler />
              <UserProfileProvider>
                <ModalProvider>
                  <MenuProvider>
                    <ReferralTracker />
                    <ErrorBoundary>
                      <LayoutWithMenu>
                        {children}
                      </LayoutWithMenu>
                    </ErrorBoundary>
                  </MenuProvider>
                </ModalProvider>
              </UserProfileProvider>
            </AuthContextProvider>
          </QueryClientProvider>
        </ThirdwebClientProvider>
      </body>
    </html>
  );
}
