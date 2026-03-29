import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Social Mission | Bloom Protocol',
  description: 'View mission details and community submissions on Bloom Protocol',
  openGraph: {
    title: 'Social Mission | Bloom Protocol',
    description: 'View mission details and community submissions on Bloom Protocol',
    url: 'https://bloomprotocol.ai/social-missions',
    siteName: 'Bloom Protocol',
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Bloom Protocol Social Mission',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Social Mission | Bloom Protocol',
    description: 'View mission details and community submissions on Bloom Protocol',
    images: ['/images/og-image.png'],
  },
};
