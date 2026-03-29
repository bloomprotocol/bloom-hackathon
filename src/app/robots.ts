import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_STAGING || 'https://bloomprotocol.ai';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/my-agent/',
          '/dashboard/',
          '/profile/',
          '/login/',
          '/agent-auth/',
          '/og-preview/',
          '/og-preview-twitter/',
          '/test-turnstile/',
          '/cards-preview/',
          '/showcase-cards/',
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
