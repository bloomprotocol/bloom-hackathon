import { Suspense } from 'react';
import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { tribes, getTribeById } from '@/constants/tribe-definitions';
import TribeDetailClient from './TribeDetailClient';
import DiscoverPageClient from './DiscoverPageClient';

export const dynamic = 'force-dynamic';

// Known tribe IDs for dispatch
const TRIBE_IDS = new Set(tribes.map((t) => t.id));

// Validate slug format to prevent SSRF via path traversal
const SAFE_SLUG = /^[a-zA-Z0-9_-]{1,64}$/;

interface PageProps {
  params: Promise<{ listId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { listId } = await params;

  if (!SAFE_SLUG.test(listId)) {
    return { title: 'Not Found | Bloom Protocol' };
  }

  // Check if this is a tribe
  const tribe = getTribeById(listId);
  if (tribe) {
    const desc = tribe.creed || tribe.tagline;
    return {
      title: `${tribe.name} Tribe — ${tribe.tagline} | Bloom Protocol`,
      description: desc,
      alternates: { canonical: `/discover/${listId}` },
      openGraph: {
        title: `${tribe.name} Tribe | Bloom Protocol`,
        description: desc,
        url: `/discover/${listId}`,
        siteName: 'Bloom Protocol',
        type: 'website',
        images: [{ url: '/og/home.png', width: 1200, height: 630 }],
      },
      twitter: {
        card: 'summary_large_image' as const,
        title: `${tribe.name} Tribe | Bloom Protocol`,
        description: desc,
        images: ['/og/home.png'],
      },
      other: {
        'ai:summary': `${tribe.name} is a Bloom Protocol tribe focused on: ${tribe.tagline}. ${tribe.creed || ''} Members run playbooks, contribute discoveries, and earn reputation. Tribe status: ${tribe.status}.`,
      },
    };
  }

  // Legacy curated list metadata
  try {
    const BACKEND_API_URL =
      process.env.BACKEND_API_URL || 'https://api.bloomprotocol.ai';
    const response = await fetch(
      `${BACKEND_API_URL}/skills/curated-list/${listId}`,
      { cache: 'no-store' },
    );

    if (!response.ok) throw new Error('Not found');
    const result = await response.json();
    const list = result.data;

    const title = `Skills picked for ${list.personalityType} | Bloom Protocol`;
    const description = list.context || `${list.items.length} curated skills for your profile`;
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || 'https://preflight.bloomprotocol.ai';

    const personalityKey = list.personalityType
      .toLowerCase()
      .replace('the ', '');
    const ogImageUrl = `${baseUrl}/og/${personalityKey}.png`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `${baseUrl}/discover/${listId}`,
        siteName: 'Bloom Protocol',
        type: 'website',
        images: [
          {
            url: ogImageUrl,
            width: 1200,
            height: 630,
            alt: `Skills for ${list.personalityType}`,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [ogImageUrl],
      },
    };
  } catch {
    return {
      title: 'Discover | Bloom Protocol',
      description: 'Explore tribes and curated skills',
    };
  }
}

function LoadingFallback() {
  return (
    <div className="w-full max-w-2xl mx-auto py-20 flex flex-col items-center gap-4">
      <div
        className="animate-spin"
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          border: '2px solid #c4a46c30',
          borderTopColor: '#c4a46c',
        }}
      />
    </div>
  );
}

export default async function DiscoverSlugPage({ params }: PageProps) {
  const { listId } = await params;

  // Validate slug format to prevent SSRF
  if (!SAFE_SLUG.test(listId)) {
    notFound();
  }

  // Route 1: Tribe detail page (active + forming)
  if (TRIBE_IDS.has(listId)) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <TribeDetailClient tribeId={listId} />
      </Suspense>
    );
  }

  // Route 2: Legacy curated skills list
  const BACKEND_API_URL =
    process.env.BACKEND_API_URL || 'https://api.bloomprotocol.ai';
  let listData = null;

  try {
    const response = await fetch(
      `${BACKEND_API_URL}/skills/curated-list/${listId}`,
      { cache: 'no-store' },
    );
    if (response.ok) {
      const result = await response.json();
      listData = result.data;
    }
  } catch {
    // Fall through to notFound
  }

  if (!listData) {
    notFound();
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      <DiscoverPageClient listId={listId} initialData={listData} />
    </Suspense>
  );
}
