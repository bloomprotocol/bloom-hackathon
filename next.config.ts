import type { NextConfig } from "next";

// Build cache buster: 2026-03-23T02:55 — force fresh build on Railway
// Backend URL - defaults to localhost for dev, can be overridden for production
const backendUrl = process.env.BACKEND_URL || 'http://localhost:3005';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'statics.bloomprotocol.ai',
      },
      {
        protocol: 'https',
        hostname: 'pumpforgood-file.pumpforgood.com',
      },
    ],
  },
  devIndicators: false,
  reactStrictMode: false,
  async rewrites() {
    return [
      {
        source: '/api/ai-agents/:path*',
        destination: `${backendUrl}/ai-agents/:path*`,
      },
      {
        source: '/api/auth/:path*',
        destination: `${backendUrl}/auth/:path*`,
      },
      {
        source: '/api/users/:path*',
        destination: `${backendUrl}/users/:path*`,
      },
      {
        source: '/api/x402/:path*',
        destination: `${backendUrl}/x402/:path*`,
      },
      // Agent-facing endpoints (exposed via agent-card.json)
      {
        source: '/api/use-cases/:path*',
        destination: `${backendUrl}/use-cases/:path*`,
      },
      {
        source: '/api/skills/:path*',
        destination: `${backendUrl}/skills/:path*`,
      },
      {
        source: '/api/social-missions/:path*',
        destination: `${backendUrl}/social-missions/:path*`,
      },
    ];
  },
};

export default nextConfig;
