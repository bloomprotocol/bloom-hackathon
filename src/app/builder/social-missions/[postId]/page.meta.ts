import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Manage Mission | Bloom Protocol Builder',
  description: 'Manage your Social Mission - approve submissions, distribute rewards, and track engagement.',
  openGraph: {
    title: 'Manage Mission | Bloom Protocol Builder',
    description: 'Manage your Social Mission - approve submissions, distribute rewards, and track engagement.',
    type: 'website',
    url: 'https://bloomprotocol.ai/builder/social-missions',
    images: [
      {
        url: 'https://bloomprotocol.ai/og/builder.png',
        width: 1200,
        height: 630,
        alt: 'Bloom Protocol Builder',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Manage Mission | Bloom Protocol Builder',
    description: 'Manage your Social Mission - approve submissions, distribute rewards, and track engagement.',
    images: ['https://bloomprotocol.ai/og/builder.png'],
  },
};
