import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Missions | Bloom Protocol',
  description: 'Complete missions and earn rewards on Bloom Protocol. Discover tasks, challenges, and opportunities to contribute to the Web3 ecosystem.',
  keywords: ['missions', 'tasks', 'rewards', 'Web3', 'blockchain', 'Bloom Protocol'],
  openGraph: {
    title: 'Missions | Bloom Protocol',
    description: 'Complete missions and earn rewards on Bloom Protocol. Discover tasks, challenges, and opportunities to contribute to the Web3 ecosystem.',
    url: 'https://bloom-protocol-fe.railway.app/missions',
    siteName: 'Bloom Protocol',
    images: [
      {
        url: 'https://bloom-protocol-fe.railway.app/bloom-og.png',
        width: 1200,
        height: 630,
        alt: 'Bloom Protocol Missions',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Missions | Bloom Protocol',
    description: 'Complete missions and earn rewards on Bloom Protocol.',
    images: ['https://bloom-protocol-fe.railway.app/bloom-og.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};