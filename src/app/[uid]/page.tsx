import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import PublicProfileClient from "./PublicProfileClient";
import { logger } from "@/lib/utils/logger";

type PaymentNetwork = 'BSC' | 'Solana' | 'Base';

interface NetworkWallet {
  network: PaymentNetwork;
  walletAddress: string;
}

interface WalletsAndProfileData {
  wallets: NetworkWallet[];
  profile: {
    displayName?: string;
    bio?: string;
    externalLinks?: Array<{ type: string; url: string }>;
    avatarUrl?: string | null;
    xProfileImageUrl?: string | null;
    xUsername?: string | null;
    xDisplayName?: string | null;
    isPublicProfileEnabled?: boolean;
  } | null;
}

async function getAllWalletsAndProfile(userId: string): Promise<WalletsAndProfileData | null> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';
    const workerSecret = process.env.X402_WORKER_SECRET;

    if (!workerSecret) {
      logger.error('X402_WORKER_SECRET not configured');
      return null;
    }

    // Fetch all wallets
    const walletsResponse = await fetch(`${apiUrl}/x402/user/${userId}/wallets`, {
      cache: 'no-store',
      headers: {
        'x-x402-worker-secret': workerSecret,
      },
    });

    if (!walletsResponse.ok) {
      return null;
    }

    const walletsResult = await walletsResponse.json();

    if (!walletsResult.data || !Array.isArray(walletsResult.data) || walletsResult.data.length === 0) {
      return null;
    }

    const wallets: NetworkWallet[] = walletsResult.data;

    // Fetch profile data using the first available network
    const firstNetwork = wallets[0].network;
    const profileResponse = await fetch(`${apiUrl}/x402/user/${userId}/wallet?network=${firstNetwork}`, {
      cache: 'no-store',
      headers: {
        'x-x402-worker-secret': workerSecret,
      },
    });

    if (!profileResponse.ok) {
      return { wallets, profile: null };
    }

    const profileResult = await profileResponse.json();

    return {
      wallets,
      profile: profileResult.data || null
    };
  } catch (error) {
    logger.error('Failed to fetch wallets and profile', { error });
    return null;
  }
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ uid: string }>
}): Promise<Metadata> {
  const { uid } = await params;
  const data = await getAllWalletsAndProfile(uid);

  // Return 404 metadata if no wallets or public profile is disabled
  if (!data || !data.wallets || data.wallets.length === 0 || data.profile?.isPublicProfileEnabled === false) {
    return {
      title: 'User Not Found',
      robots: { index: false, follow: false }
    };
  }

  const profile = data.profile || {};
  const displayName = profile.displayName || profile.xDisplayName || profile.xUsername;
  const bio = profile.bio;

  // Title logic
  const title = `${displayName || `User #${uid}`} | Bloom Protocol`;

  // Description logic
  const description = bio || 'Support this creator with crypto payments';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://bloomprotocol.ai/${uid}`,
      siteName: 'Bloom Protocol',
      type: 'profile',
      images: [
        {
          url: `https://bloomprotocol.ai/api/og?uid=${uid}&name=${encodeURIComponent(displayName || `User #${uid}`)}`,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`https://bloomprotocol.ai/api/og?uid=${uid}`],
    },
    alternates: {
      canonical: `https://bloomprotocol.ai/${uid}`,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function PublicProfilePage({
  params
}: {
  params: Promise<{ uid: string }>
}) {
  // Await params in Next.js 15+
  const { uid } = await params;

  // Fetch all wallets and profile data
  const data = await getAllWalletsAndProfile(uid);

  // If no wallets found or public profile is disabled, show 404
  if (!data || !data.wallets || data.wallets.length === 0 || data.profile?.isPublicProfileEnabled === false) {
    notFound();
  }

  // Determine available networks
  const availableNetworks = data.wallets.map(w => w.network);

  // Default network priority: Base > Solana > BSC
  const defaultNetwork: PaymentNetwork = availableNetworks.includes('Base') ? 'Base' : availableNetworks.includes('Solana') ? 'Solana' : 'BSC';

  // Get default wallet address
  const defaultWallet = data.wallets.find(w => w.network === defaultNetwork);

  if (!defaultWallet) {
    notFound(); // Safety check
  }

  // Extract profile data
  const profile = data.profile || {};
  const displayName = profile.displayName || profile.xDisplayName || profile.xUsername || `User #${uid}`;
  const bio = profile.bio || 'Support this creator with crypto payments';

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ProfilePage',
            name: displayName,
            description: bio,
            url: `https://bloomprotocol.ai/${uid}`,
          }),
        }}
      />
      <Suspense fallback={<div />}>
        <PublicProfileClient
          userId={uid}
          initialWalletAddress={defaultWallet.walletAddress}
          displayName={profile.displayName}
          bio={profile.bio}
          externalLinks={profile.externalLinks}
          avatarUrl={profile.avatarUrl}
          xProfileImageUrl={profile.xProfileImageUrl}
          xUsername={profile.xUsername}
          xDisplayName={profile.xDisplayName}
          availableNetworks={availableNetworks}
          defaultNetwork={defaultNetwork}
        />
      </Suspense>
    </>
  );
}
