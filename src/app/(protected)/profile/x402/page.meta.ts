// src/app/(protected)/profile/x402/page.meta.ts
import type { Metadata } from "next";

export const metadata: Metadata = {
  // Base URL for converting relative paths to absolute
  metadataBase: new URL(process.env.NEXT_PUBLIC_STAGING || "https://bloomprotocol.ai"),

  // Title configuration
  title: "Profile - x402",

  // Description and keywords
  description: "Claim your personal public page and x402 link to receive USDT payments on BNB Smart Chain",
  keywords: ["bloom protocol", "x402", "payment link", "crypto payments", "USDT", "BNB Chain", "receive payments", "web3 payments"],

  // Robots
  robots: {
    index: false, // Don't index user-specific pages
    follow: true,
  },

  // Icons
  icons: {
    icon: "/favico.png",
    apple: "/favico.png",
  },

  // Open Graph (Facebook, Telegram...)
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/profile/x402",
    siteName: `${process.env.NEXT_PUBLIC_SITE_NAME}`,
    title: "Profile - x402",
    description: "Claim your personal public page and x402 link  to receive USDT payments on BNB Smart Chain",
    images: [
      {
        url: "/og/home.png",
        width: 1200,
        height: 630,
        alt: "Bloom Protocol X402 settings page",
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: "summary_large_image",
    site: "@Bloom__protocol",
    creator: "@Bloom__protocol",
    title: "Profile - x402",
    description: "Claim your personal public page and x402 link  to receive USDT payments on BNB Smart Chain",
    images: ["/og/home.png"],
  },

  // Canonical URL
  alternates: {
    canonical: "/profile/x402",
  },
};
