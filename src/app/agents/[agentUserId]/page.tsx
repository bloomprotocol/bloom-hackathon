/**
 * Permanent Agent Dashboard URL
 *
 * /agents/{agentUserId} - Permanent, multi-use URL for agent identity
 *
 * Flow:
 * 1. Fetch agent public data (anyone can view)
 * 2. Generate fresh token for authentication
 * 3. Auto-authenticate and show dashboard
 */

import { Suspense } from 'react';
import { Metadata } from 'next';
import AgentDashboardContent from './AgentDashboardContent';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{
    agentUserId: string;
  }>;
}

// Generate dynamic OG metadata for Twitter card preview
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { agentUserId } = await params;

  try {
    // Fetch agent data for metadata
    const BACKEND_API_URL = process.env.BACKEND_API_URL || 'https://api.bloomprotocol.ai';
    const response = await fetch(`${BACKEND_API_URL}/x402/agent/${agentUserId}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch agent data');
    }

    const result = await response.json();
    const agentData = result.data;

    const title = `${agentData.identityData.personalityType} | Bloom Identity`;
    const description = agentData.identityData.tagline || agentData.identityData.description;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://preflight.bloomprotocol.ai';
    const url = `${baseUrl}/agents/${agentUserId}`;

    // Use static OG image directly from /public/og/{personality}.png
    const personalityKey = agentData.identityData.personalityType.toLowerCase().replace('the ', '');
    const ogImageUrl = `${baseUrl}/og/${personalityKey}.png`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url,
        siteName: 'Bloom Protocol',
        type: 'profile',
        images: [
          {
            url: ogImageUrl,
            width: 1200,
            height: 630,
            alt: `${agentData.identityData.personalityType} Identity Card`,
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
  } catch (error) {
    console.error('Failed to generate metadata:', error);

    // Fallback metadata with default OG image
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://preflight.bloomprotocol.ai';
    const defaultImageUrl = `${baseUrl}/og/innovator.png`; // Use innovator as default

    return {
      title: 'Bloom Identity Card',
      description: 'Discover your personalized Bloom Identity with AI-powered skill recommendations',
      openGraph: {
        title: 'Bloom Identity Card',
        description: 'Discover your personalized Bloom Identity',
        type: 'website',
        images: [
          {
            url: defaultImageUrl,
            width: 1200,
            height: 630,
            alt: 'Bloom Identity Card',
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Bloom Identity Card',
        description: 'Discover your personalized Bloom Identity',
        images: [defaultImageUrl],
      },
    };
  }
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Loading Agent Identity...</h1>
          <p className="text-gray-600">Please wait</p>
        </div>
      </div>
    </div>
  );
}

export default async function AgentDashboardPage({ params }: PageProps) {
  const { agentUserId } = await params;

  return (
    <Suspense fallback={<LoadingFallback />}>
      <AgentDashboardContent agentUserId={agentUserId} />
    </Suspense>
  );
}
