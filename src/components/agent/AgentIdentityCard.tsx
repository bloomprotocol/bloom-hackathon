/**
 * Agent Identity Card
 *
 * Displays agent's personality and identity information
 */

'use client';

import { AgentIdentityData } from '@/hooks/useAgentSession';

interface AgentIdentityCardProps {
  agentData: AgentIdentityData;
}

// Personality type colors
const personalityColors = {
  'The Visionary': 'from-purple-500 to-blue-500',
  'The Explorer': 'from-green-500 to-teal-500',
  'The Cultivator': 'from-pink-500 to-rose-500',
  'The Optimizer': 'from-orange-500 to-red-500',
  'The Innovator': 'from-red-500 to-rose-500',
};

// Personality type emojis
const personalityEmojis = {
  'The Visionary': '💜',
  'The Explorer': '💚',
  'The Cultivator': '🩷',
  'The Optimizer': '🧡',
  'The Innovator': '❤️',
};

export default function AgentIdentityCard({ agentData }: AgentIdentityCardProps) {
  const { identity, wallet } = agentData;
  const gradientClass = personalityColors[identity.personalityType as keyof typeof personalityColors] || 'from-gray-500 to-gray-700';
  const emoji = personalityEmojis[identity.personalityType as keyof typeof personalityEmojis] || '🎴';

  return (
    <div className="w-full max-w-md">
      {/* Card */}
      <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header with gradient */}
        <div className={`bg-gradient-to-br ${gradientClass} p-6 text-white`}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-4xl">{emoji}</span>
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium">
              Taste Profile
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2">
            {identity.personalityType}
          </h2>
          <p className="text-white/90 italic">
            "{identity.tagline}"
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Description
            </h3>
            <p className="text-gray-700 leading-relaxed">
              {identity.description}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Categories
            </h3>
            <div className="flex flex-wrap gap-2">
              {identity.mainCategories.map((category) => (
                <span
                  key={category}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
                >
                  {category}
                </span>
              ))}
            </div>
          </div>

          {identity.subCategories && identity.subCategories.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Interests
              </h3>
              <div className="flex flex-wrap gap-2">
                {identity.subCategories.slice(0, 5).map((category) => (
                  <span
                    key={category}
                    className="px-2 py-1 bg-gray-50 text-gray-600 rounded text-xs"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Confidence</span>
              <span className="font-semibold text-gray-900">
                {identity.confidence}%
              </span>
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div
                className={`bg-gradient-to-r ${gradientClass} h-2 rounded-full transition-all duration-500`}
                style={{ width: `${identity.confidence}%` }}
              />
            </div>
          </div>

          {wallet && (
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Wallet
              </h3>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 font-mono text-xs">
                  {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>
              Mode: {identity.mode === 'data' ? '🤖 Data-driven' : '📝 Manual'}
            </span>
            <span>Bloom Protocol</span>
          </div>
        </div>
      </div>
    </div>
  );
}
