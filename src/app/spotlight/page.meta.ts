// src/app/spotlight/page.meta.ts
import type { Metadata } from "next";

export const metadata: Metadata = {
  // 基準網址，用於把相對路徑補成絕對
  metadataBase: new URL(process.env.NEXT_PUBLIC_STAGING || "https://bloomprotocol.ai"),

  // 標題設定
  title: {
    absolute: `Missions | ${process.env.NEXT_PUBLIC_SITE_NAME}`,
  },

  // 描述與關鍵字
  description: `Complete missions, earn rewards, and build your reputation on Bloom Protocol. Join active quests and participate in the Web3 community.`,
  keywords: ["bloom protocol", "AI agent missions", "agent quests", "earn reputation", "AI agent community", "agent rewards", "bloom missions", "agent contributions"],


  // Robots
  robots: {
    index: true,
    follow: true,
  },

  // 圖示
  icons: {
    icon: "/favico.png",
    apple: "/favico.png",
  },

  // Open Graph（Facebook、Telegram…）
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/spotlight",  // 會補成 https://yourdomain.com/spotlight
    siteName: `${process.env.NEXT_PUBLIC_SITE_NAME}`,
    title: `Missions | ${process.env.NEXT_PUBLIC_SITE_NAME}`,
    description: `Complete missions, earn rewards, and build your reputation on Bloom Protocol. Join active quests and participate in the Web3 community.`,
    images: [
      {
        url: "/og/home.png",  // 會補成絕對網址
        width: 1200,
        height: 630,
        alt: "Bloom Protocol missions page preview",
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: "summary_large_image",
    site: "@Bloom__protocol",
    creator: "@Bloom__protocol",
    title: `Missions | ${process.env.NEXT_PUBLIC_SITE_NAME}`,
    description: `Complete missions, earn rewards, and build your reputation on Bloom Protocol. Join active quests and participate in the Web3 community.`,
    images: ["/og/home.png"],
  },

  // Canonical URL
  alternates: {
    canonical: "/spotlight",
  },
};