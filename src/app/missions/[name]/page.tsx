import { redirect, notFound } from 'next/navigation';
import { Metadata } from 'next';
import { logger } from '@/lib/utils/logger';

// Client component wrapper
import MissionDetailPageClient from './components/MissionDetailPageClient';

// Helper function to fetch mission data
async function fetchMissionData(slug: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';
  const decodedSlug = decodeURIComponent(slug);

  const response = await fetch(`${apiUrl}/public/mission/${decodedSlug}`, {
    cache: 'no-store'
  });

  if (!response.ok) {
    return { data: null, status: response.status };
  }

  const result = await response.json();
  return { data: result.success ? result.data : null, status: response.status };
}

// Dynamic metadata generation
export async function generateMetadata({
  params
}: {
  params: Promise<{ name: string }>
}): Promise<Metadata> {
  const { name } = await params;

  if (!name) {
    return {
      title: 'Mission | Bloom Protocol',
      description: 'Complete missions to earn rewards on Bloom Protocol.',
    };
  }

  const { data: missionData } = await fetchMissionData(name);

  if (!missionData) {
    return {
      title: 'Mission Not Found | Bloom Protocol',
      description: 'The requested mission could not be found.',
    };
  }

  const title = `${missionData.title} | Bloom Protocol`;
  const description = missionData.description || 'Complete this mission to earn rewards on Bloom Protocol.';
  const url = `https://bloomprotocol.ai/missions/${missionData.slug || name}`;

  return {
    title,
    description,
    keywords: ['mission', 'tasks', 'rewards', 'Web3', 'blockchain', 'Bloom Protocol'],
    openGraph: {
      title,
      description,
      url,
      siteName: 'Bloom Protocol',
      images: [
        {
          url: 'https://bloomprotocol.ai/bloom-og.png',
          width: 1200,
          height: 630,
          alt: `${missionData.title} - Bloom Protocol Mission`,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['https://bloomprotocol.ai/bloom-og.png'],
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
}

export default async function MissionDetailPage({
  params
}: {
  params: Promise<{ name: string }>
}) {
  const { name } = await params;
  const missionName = name;

  if (!missionName) {
    redirect('/missions');
  }

  const { data: missionData, status: responseStatus } = await fetchMissionData(missionName);

  if (responseStatus === 404) {
    notFound();
  }

  if (!missionData) {
    logger.error('Failed to load mission', { slug: missionName, status: responseStatus });
    notFound();
  }

  // Redirect social missions to the correct page
  if (missionData.missionType === 'social_mission') {
    redirect(`/social-missions/${missionData.slug}`);
  }

  return <MissionDetailPageClient missionData={missionData} />;
}