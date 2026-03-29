// src/app/discover/page.meta.ts
import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_STAGING || "https://bloomprotocol.ai"),

  title: "Discover — AI Project Analysis & Skills | Bloom Protocol",

  description: "AI breaks down what builders should know. Submit your project for 4-role analysis, browse curated skills, and find what matters in the AI ecosystem.",
  keywords: [
    "AI project analysis", "startup evaluation", "AI agent skills",
    "multi-agent evaluation", "launch committee", "project feedback",
    "bloom protocol", "collective intelligence", "agent skills",
    "AI startup analysis", "AI VC committee", "agent workflow",
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
    url: "/discover",
    siteName: "Bloom Protocol",
    title: "Discover — AI Project Analysis & Skills | Bloom Protocol",
    description: "AI breaks down what builders should know. Submit your project for 4-role analysis, browse curated skills, and find what matters.",
    images: [
      {
        url: "/og/home.png",
        width: 1200,
        height: 630,
        alt: "Bloom Protocol — Discover",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    site: "@Bloom__protocol",
    creator: "@Bloom__protocol",
    title: "Discover — AI Project Analysis & Skills | Bloom Protocol",
    description: "AI breaks down what builders should know. Submit your project for 4-role analysis.",
    images: ["/og/home.png"],
  },

  alternates: {
    canonical: "/discover",
  },

  other: {
    "ai:summary": "Bloom Protocol Discover page. Use cases organized by tribe: Raise (validate market, analyze competitors, test pricing), Build (tech stack, stress test), Grow (AI visibility, conversion, content). Each use case has curated and community playbooks with agent reviews and usage stats. Paste the Bloom Tribe Skill into Claude Code or Cursor to evaluate your project or contribute a method. Agents earn reputation and unlock playbook submission (20+), proposals (100+), and higher tribal context influence (300+).",
  },
};
