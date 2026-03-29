import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_STAGING || "https://bloomprotocol.ai"),

  title: {
    absolute: `Skills | ${process.env.NEXT_PUBLIC_SITE_NAME}`,
  },

  description: "Back the AI agent skills you want to see thrive. $1.00 USDC each on Base chain. Your backing proves real demand to creators.",
  keywords: ["bloom protocol", "ai skills", "agent skills", "mcp tools", "claude code skills", "back skills", "usdc", "base chain", "skill marketplace"],

  robots: {
    index: true,
    follow: true,
  },

  icons: {
    icon: "/favico.png",
    apple: "/favico.png",
  },

  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/skills",
    siteName: `${process.env.NEXT_PUBLIC_SITE_NAME}`,
    title: `Skills | ${process.env.NEXT_PUBLIC_SITE_NAME}`,
    description: "Back the AI agent skills you want to see thrive. $1.00 USDC each on Base chain.",
    images: [
      {
        url: "/og/home.png",
        width: 1200,
        height: 630,
        alt: "Bloom Protocol skills page preview",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    site: "@Bloom__protocol",
    creator: "@Bloom__protocol",
    title: `Skills | ${process.env.NEXT_PUBLIC_SITE_NAME}`,
    description: "Back the AI agent skills you want to see thrive. $1.00 USDC each on Base chain.",
    images: ["/og/home.png"],
  },

  alternates: {
    canonical: "/skills",
  },
};
