import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

/**
 * OG Image Route - Serves Static Pre-generated Images
 *
 * This route fetches the agent's personality type from the API,
 * then serves a pre-generated static PNG from /public/og/[personality].png
 *
 * Benefits:
 * - Faster (no dynamic generation)
 * - More reliable (no Edge Runtime timeouts)
 * - Better looking (can use rich carousel design)
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ agentUserId: string }> }
) {
  const { agentUserId } = await params;

  try {
    // Fetch agent data to get personality type
    const BACKEND_API_URL = process.env.BACKEND_API_URL || 'https://api.bloomprotocol.ai';
    const apiUrl = `${BACKEND_API_URL}/x402/agent/${agentUserId}`;

    console.log('[OG Image] Fetching agent data:', apiUrl);

    const response = await fetch(apiUrl, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const result = await response.json();
    const personalityType = result.data.identityData.personalityType; // e.g., "The Visionary"

    // Get personality key for static image
    const personalityKey = personalityType.toLowerCase().replace('the ', '');

    // Serve pre-generated static image
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://preflight.bloomprotocol.ai';
    const staticImageUrl = `${baseUrl}/og/${personalityKey}.png`;

    console.log('[OG Image] Serving static image:', staticImageUrl);

    const imageResponse = await fetch(staticImageUrl);

    if (imageResponse.ok) {
      const imageBuffer = await imageResponse.arrayBuffer();
      return new Response(imageBuffer, {
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }

    throw new Error(`Static image not found: ${staticImageUrl}`);
  } catch (error) {
    console.error('[OG Image] Error:', error);

    // Fallback image
    return new ImageResponse(
      (
        <div
          style={{
            width: '1200',
            height: '630',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #9333ea, #7c3aed)',
            color: 'white',
            fontSize: '48px',
            fontWeight: 'bold',
          }}
        >
          Bloom Identity Card
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  }
}
