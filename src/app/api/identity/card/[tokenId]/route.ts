import { NextRequest, NextResponse } from 'next/server';
import { getPersonalityConfig } from '@/components/identity/personalityConfig';

/**
 * Get identity card metadata (OpenSea compatible)
 *
 * Returns JSON metadata for the identity card NFT, compatible with
 * OpenSea and other NFT marketplaces.
 *
 * @route GET /api/identity/card/[tokenId]
 * @param tokenId - The NFT token ID
 * @returns JSON metadata
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tokenId: string }> }
) {
  try {
    const { tokenId } = await params;

    // Validate token ID
    if (!tokenId || isNaN(Number(tokenId))) {
      return NextResponse.json(
        { error: 'Invalid token ID' },
        { status: 400 }
      );
    }

    // Fetch identity data from contract
    const identityData = await fetchIdentityDataFromContract(tokenId);

    if (!identityData) {
      return NextResponse.json(
        { error: 'Token not found' },
        { status: 404 }
      );
    }

    // Get personality configuration
    const config = getPersonalityConfig(identityData.identityType);

    // Build OpenSea-compatible metadata
    const metadata = {
      name: `Bloom Identity Card #${tokenId}`,
      description: identityData.customDescription,
      image: `${getBaseUrl(request)}/api/identity/card/${tokenId}/image`,
      external_url: `https://bloomprotocol.ai/identity/${tokenId}`,
      attributes: [
        {
          trait_type: 'Identity Type',
          value: identityData.identityType,
        },
        {
          trait_type: 'Tagline',
          value: identityData.customTagline,
        },
        {
          trait_type: 'Main Categories',
          value: identityData.mainCategories.join(', '),
        },
        {
          trait_type: 'Category Count',
          value: identityData.mainCategories.length,
          display_type: 'number',
        },
        {
          trait_type: 'Projects Supported',
          value: identityData.projectsSupported || 0,
          display_type: 'number',
        },
        {
          trait_type: 'Minted At',
          value: identityData.mintedAt,
          display_type: 'date',
        },
        {
          trait_type: 'Tier',
          value: identityData.tier || 'Seed',
        },
      ],
      // Additional properties for enhanced display
      properties: {
        personality: {
          type: identityData.identityType,
          description: config.description,
          color: config.backgroundColor,
        },
        categories: identityData.mainCategories,
        stats: {
          projectsSupported: identityData.projectsSupported || 0,
          memberSince: formatMemberSince(identityData.mintedAt),
        },
      },
    };

    return NextResponse.json(metadata, {
      headers: {
        'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      },
    });
  } catch (error) {
    console.error('Metadata generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate metadata' },
      { status: 500 }
    );
  }
}

/**
 * Fetch identity data from the BloomIdentityCard contract
 */
async function fetchIdentityDataFromContract(tokenId: string) {
  try {
    // TODO: Implement actual contract call
    // See image/route.ts for example implementation

    // Mock data for development
    return {
      identityType: 'The Mindful',
      customTagline: 'Growth starts within',
      customDescription: 'Focused on wellness and mindfulness',
      mainCategories: ['Wellness', 'Education', 'AI Tools'],
      subCategories: ['Meditation', 'Fitness'],
      mintedAt: Math.floor(Date.now() / 1000),
      owner: '0x1234...',
      projectsSupported: 15,
      tier: 'Seed',
    };
  } catch (error) {
    console.error('Error fetching contract data:', error);
    return null;
  }
}

function formatMemberSince(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function getBaseUrl(request: NextRequest): string {
  const host = request.headers.get('host') || 'bloomprotocol.ai';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  return `${protocol}://${host}`;
}
