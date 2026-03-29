import { Metadata } from 'next';
import ShareIdentityClient from './ShareIdentityClient';

interface Props {
  searchParams: Promise<{
    tier?: string;
    personality?: string;
    description?: string;
    categories?: string;
    since?: string;
  }>;
}

interface CategoryInfo {
  key: string;
  label: string;
  icon: string;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const tier = params.tier || 'Seed';
  const personality = params.personality || 'The Explorer';
  const description = params.description || 'Curious about everything';
  const categories = params.categories || '';
  const since = params.since || '';

  // Use environment variable or fallback to preflight
  // In production, set NEXT_PUBLIC_BASE_URL=https://bloomprotocol.ai in Railway
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://preflight.bloomprotocol.ai';

  // Map personality to static OG image filename
  // Use static PNG images like agent cards (lighter background with black text)
  const personalityKey = personality.toLowerCase().replace('the ', '');
  const staticImageUrl = `${baseUrl}/og/human/${personalityKey}.png`;

  // Keep dynamic OG route as fallback
  const dynamicImageUrl = new URL('/api/og/identity', baseUrl);
  dynamicImageUrl.searchParams.set('tier', tier);
  dynamicImageUrl.searchParams.set('personality', personality);
  dynamicImageUrl.searchParams.set('description', description);
  if (categories) {
    dynamicImageUrl.searchParams.set('categories', categories);
  }
  if (since) {
    dynamicImageUrl.searchParams.set('since', since);
  }

  const title = `${tier} Supporter | ${personality}`;
  const desc = `${description} - Building reputation on Bloom Protocol`;

  return {
    title,
    description: desc,
    openGraph: {
      title,
      description: desc,
      images: [
        {
          // Use static image for better performance and reliability
          url: staticImageUrl,
          width: 1200,
          height: 630,
          alt: `Bloom Protocol ${personality} Supporter Card`,
        },
        {
          // Fallback to dynamic generation if static image doesn't exist
          url: dynamicImageUrl.toString(),
          width: 1200,
          height: 630,
          alt: `Bloom Protocol ${tier} Supporter Card`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: desc,
      // Twitter uses first image
      images: [staticImageUrl],
    },
  };
}

export default async function ShareIdentityPage({ searchParams }: Props) {
  const params = await searchParams;
  const tier = params.tier || 'Seed';
  const personality = params.personality || 'The Explorer';
  const description = params.description || 'Curious about everything';
  const categoriesStr = params.categories || '';
  const since = params.since || '';

  // Parse categories from comma-separated string like "🤖AI Tools,⚡Productivity"
  // Remove emojis and keep only text labels (matching discovery page design)
  const categories: CategoryInfo[] = categoriesStr
    ? categoriesStr.split(',').slice(0, 3).map(cat => {
        // Remove emoji to get label
        const label = cat.replace(/^[\p{Emoji}]+/u, '').trim();
        return {
          key: label.toLowerCase().replace(/\s+/g, '-'),
          label: label,
          icon: '', // No emoji icons in categories display
        };
      })
    : [];

  // Format member since date
  let memberSince = '';
  if (since) {
    try {
      const date = new Date(since);
      memberSince = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } catch {
      memberSince = '';
    }
  }

  return (
    <ShareIdentityClient
      tier={tier}
      personality={personality}
      description={description}
      categories={categories}
      memberSince={memberSince}
    />
  );
}
