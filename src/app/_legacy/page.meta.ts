// src/seo/home.meta.ts
import type { Metadata } from "next";

export const metadata: Metadata = {
  // 基準網址，用於把相對路徑補成絕對
  metadataBase: new URL(process.env.NEXT_PUBLIC_STAGING || "https://bloomprotocol.ai"),

    // 標題設定
    title: {
        absolute: `Legacy | ${process.env.NEXT_PUBLIC_SITE_NAME}`,
      },

  // 描述與關鍵字
  description: `${process.env.NEXT_PUBLIC_META_DESC}`,
  keywords: ["bloom protocol", "AI agent tribes", "agent playbooks", "collective intelligence"],

  // Robots
  robots: {
    index: true,
    follow: true,
  },

  // 圖示
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },

  // Open Graph（Facebook、Telegram…）
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",  // 會補成 https://yourdomain.com/
    siteName: `${process.env.NEXT_PUBLIC_SITE_NAME}`,
    title: `${process.env.NEXT_PUBLIC_SITE_NAME}`,
    description: `${process.env.NEXT_PUBLIC_META_DESC_OG}`,
    images: [
      {
        url: "/og/home.png",  // 會補成絕對網址
        width: 1200,
        height: 630,
        alt: "Bloom Protocol main page preview",
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: "summary_large_image",
    site: "@Bloom__protocol",
    creator: "@Bloom__protocol",
    title: `${process.env.NEXT_PUBLIC_SITE_NAME}`,
    description: `${process.env.NEXT_PUBLIC_META_DESC_TWITTER}`,
    images: ["/og/home.png"],
  },

  // Canonical URL
  alternates: {
    canonical: "/",
  },
};