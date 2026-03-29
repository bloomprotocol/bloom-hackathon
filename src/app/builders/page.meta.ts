import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_STAGING || "https://bloomprotocol.ai"),

  title: "Builder Portal - Find Your First 100 True Supporters | Bloom Protocol",

  description: "Submit your project to Bloom Protocol. Find your first 100 true supporters, validate go-to-market, and turn early support into capital. Built for vibe coders and indie devs building consumer AI.",

  keywords: [
    "builder portal", "submit project", "indie devs", "vibe coders", "early supporters",
    "go-to-market validation", "product-market fit", "early growth", "consumer AI builders",
    "startup funding", "early believers", "builder community", "bloom protocol"
  ],

  robots: {
    index: true,
    follow: true,
  },

  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },

  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/builders",
    siteName: "Bloom Protocol",
    title: "Builder Portal - Find Your First 100 True Supporters",
    description: "Submit your project to Bloom Protocol. Validate go-to-market, unlock early growth, and connect with supporters who believe in your vision.",
    images: [
      {
        url: "/og/home.png",
        width: 1200,
        height: 630,
        alt: "Bloom Protocol Builder Portal",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    site: "@Bloom__protocol",
    creator: "@Bloom__protocol",
    title: "Builder Portal - Find Your First 100 True Supporters",
    description: "Submit your project to Bloom Protocol and find supporters who believe in your vision.",
    images: ["/og/home.png"],
  },

  alternates: {
    canonical: "/builders",
  },
};
