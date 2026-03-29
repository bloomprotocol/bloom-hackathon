import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import AgentIdentityCard from '@/app/(protected)/dashboard/components/agent-identity-card';
import { getAgentPersonalityConfig } from '@/lib/agentPersonalityMapping';

interface AgentIdentityData {
  agentUserId: number;
  walletAddress: string;
  agentName: string;
  agentType: string;
  network: string;
  x402Endpoint: string;
  identityData: {
    personalityType: string;
    tagline: string;
    description: string;
    mainCategories: string[];
    subCategories: string[];
    confidence: number;
    mode: 'data' | 'manual';
    dimensions?: {
      conviction: number;
      intuition: number;
      contribution: number;
    };
    tasteSpectrums?: {
      learning: number;
      decision: number;
      novelty: number;
      risk: number;
    };
  };
  createdAt: string;
  updatedAt: string;
}

async function getAgentIdentity(agentUserId: string): Promise<AgentIdentityData | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';

  try {
    const response = await fetch(`${apiUrl}/x402/agent/${agentUserId}`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`API responded with status ${response.status}`);
    }

    const result = await response.json();

    if (!result.success || !result.data) {
      throw new Error('Invalid API response format');
    }

    return result.data;
  } catch (error) {
    console.error('Failed to fetch agent identity:', error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ agentUserId: string }>;
}): Promise<Metadata> {
  const { agentUserId } = await params;
  const agent = await getAgentIdentity(agentUserId);

  if (!agent) {
    return {
      title: 'Agent Not Found | Bloom Protocol',
      description: 'This agent identity could not be found.',
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://preflight.bloomprotocol.ai';
  const ogImageUrl = `${baseUrl}/api/og/agent/${agentUserId}`;

  return {
    title: `${agent.identityData.personalityType} | Agent Identity`,
    description: agent.identityData.tagline,
    openGraph: {
      title: `${agent.identityData.personalityType} | Bloom Agent`,
      description: agent.identityData.tagline,
      type: 'profile',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${agent.identityData.personalityType} - ${agent.identityData.tagline}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${agent.identityData.personalityType} | Bloom Agent`,
      description: agent.identityData.tagline,
      images: [ogImageUrl],
    },
  };
}

export default async function AgentIdentityPage({
  params,
}: {
  params: Promise<{ agentUserId: string }>;
}) {
  const { agentUserId } = await params;
  const agent = await getAgentIdentity(agentUserId);

  if (!agent) {
    notFound();
  }

  // Get personality configuration with 2x2 dimension scores
  const personalityConfig = getAgentPersonalityConfig(agent.identityData.personalityType);

  // Format created date
  const createdDate = new Date(agent.createdAt);
  const memberSince = createdDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  // Use real dimensions from API if available, fall back to personality config defaults
  const conviction = agent.identityData.dimensions?.conviction ?? personalityConfig.dimensions.conviction;
  const intuition = agent.identityData.dimensions?.intuition ?? personalityConfig.dimensions.intuition;
  const contribution = agent.identityData.dimensions?.contribution ?? personalityConfig.dimensions.contribution;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span className="font-medium">Back to Home</span>
          </Link>
        </div>

        {/* Agent Identity Card */}
        <div className="flex flex-col items-center">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-white mb-2">
              Agent Identity
            </h1>
            <p className="text-lg text-gray-300">
              Generated by Bloom Discovery
            </p>
          </div>

          {/* Identity Card Component with real dimensions */}
          <AgentIdentityCard
            personality={personalityConfig}
            conviction={conviction}
            intuition={intuition}
            contribution={contribution}
            tasteSpectrums={agent.identityData.tasteSpectrums}
            categories={agent.identityData.mainCategories}
            memberSince={memberSince}
            cardId={agent.agentUserId.toString()}
            dynamicDescription={agent.identityData.description}
          />

          {/* Agent Info Section */}
          <div className="mt-8 w-full max-w-[372px] bg-gray-800/50 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">
              Agent Details
            </h3>

            <div className="space-y-3 text-sm">
              {/* Agent Name */}
              <div>
                <span className="text-gray-400">Agent Name:</span>
                <p className="font-mono text-gray-100 mt-1">
                  {agent.agentName}
                </p>
              </div>

              {/* Wallet Address */}
              <div>
                <span className="text-gray-400">Wallet Address:</span>
                <p className="font-mono text-gray-100 mt-1 break-all text-xs">
                  {agent.walletAddress}
                </p>
              </div>

              {/* Network */}
              <div>
                <span className="text-gray-400">Network:</span>
                <p className="font-mono text-gray-100 mt-1">
                  {agent.network}
                </p>
              </div>

              {/* Analysis Confidence */}
              <div>
                <span className="text-gray-400">Analysis Confidence:</span>
                <p className="font-mono text-gray-100 mt-1">
                  {agent.identityData.confidence}%
                </p>
              </div>

              {/* Generation Mode */}
              <div>
                <span className="text-gray-400">Generation Mode:</span>
                <p className="font-mono text-gray-100 mt-1 capitalize">
                  {agent.identityData.mode === 'data'
                    ? 'On-chain Analysis'
                    : 'Manual Q&A'}
                </p>
              </div>

              {/* Sub-categories */}
              {agent.identityData.subCategories.length > 0 && (
                <div>
                  <span className="text-gray-400">Interests:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {agent.identityData.subCategories.map((subCat) => (
                      <span
                        key={subCat}
                        className="px-3 py-1 bg-gray-700/50 text-gray-200 rounded-full text-xs font-medium border border-gray-600"
                      >
                        {subCat}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Share Section */}
            <div className="mt-6 pt-6 border-t border-gray-700">
              <p className="text-xs text-gray-400 text-center">
                Share this identity by copying the URL above
              </p>
            </div>
          </div>

          {/* Footer CTAs — growth loop */}
          <div className="mt-8 flex flex-col items-center gap-4 pb-8">
            <p className="text-gray-300">
              Want to create your own agent identity?
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/for-agents"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#7c3aed] to-[#8b5cf6] text-white rounded-xl font-medium hover:opacity-90 transition-opacity shadow-lg"
              >
                Install Bloom Discovery
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <Link
                href="/skills"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-700 text-gray-200 rounded-xl font-medium hover:bg-gray-600 transition-colors"
              >
                Explore Skills
              </Link>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Are you a skill creator?{' '}
              <Link href="/builders" className="text-purple-400 hover:underline">
                List your skill
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
