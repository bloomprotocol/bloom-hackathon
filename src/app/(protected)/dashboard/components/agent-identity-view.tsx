'use client';

/**
 * Agent Identity View
 *
 * Displays the identity card and skills for authenticated agents
 */

import { AgentIdentityData } from '@/hooks/useAgentSession';

interface AgentIdentityViewProps {
  agentData: AgentIdentityData;
}

export default function AgentIdentityView({ agentData }: AgentIdentityViewProps) {
  const { identity, wallet, recommendations } = agentData;

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-6">
      {/* Agent Identity Card */}
      <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-8 shadow-lg border border-violet-200">
        <div className="text-center mb-6">
          <div className="text-5xl mb-4">🤖</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'DM Serif Text, serif' }}>
            {identity.personalityType}
          </h1>
          <p className="text-lg text-violet-600 italic mb-4">"{identity.tagline}"</p>
          <p className="text-gray-700 max-w-2xl mx-auto">
            {identity.description}
          </p>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {identity.mainCategories.map((category) => (
            <span
              key={category}
              className="px-4 py-2 bg-violet-100 text-violet-700 rounded-full text-sm font-medium"
            >
              {category}
            </span>
          ))}
        </div>

        {/* Confidence */}
        <div className="text-center">
          <div className="inline-block px-6 py-3 bg-white rounded-lg shadow-sm">
            <span className="text-sm text-gray-600 mr-2">Confidence:</span>
            <span className="text-lg font-bold text-violet-600">{identity.confidence}%</span>
          </div>
        </div>
      </div>

      {/* Wallet Info */}
      <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'DM Serif Text, serif' }}>
          🤖 Agent On-Chain Identity
        </h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-gray-600 min-w-[120px]">⛓️ Network:</span>
            <span className="text-gray-900">{wallet.network}</span>
          </div>
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800 mb-2">⚠️ <strong>Wallet features coming soon:</strong></p>
            <ul className="text-sm text-amber-700 space-y-1 ml-4">
              <li>• Tipping skill creators</li>
              <li>• Receiving X402 payments</li>
              <li>• Wallet management</li>
            </ul>
            <p className="text-xs text-amber-600 mt-2">🔒 Note: Please do not deposit funds yet - withdrawal features are in development.</p>
          </div>
        </div>
      </div>

      {/* Recommended Skills */}
      <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'DM Serif Text, serif' }}>
          🎯 Recommended OpenClaw Skills
        </h2>
        <div className="space-y-4">
          {recommendations.map((skill, index) => (
            <div
              key={skill.skillId}
              className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {index + 1}. {skill.skillName}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">{skill.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {skill.categories.map((category) => (
                      <span
                        key={category}
                        className="px-2 py-1 bg-white rounded text-xs text-gray-600 border border-gray-200"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-sm font-bold">
                    {skill.matchScore}% match
                  </div>
                  {skill.url && (
                    <a
                      href={skill.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-violet-600 hover:text-violet-700 underline"
                    >
                      View Skill
                    </a>
                  )}
                </div>
              </div>
              {skill.creator && (
                <div className="mt-2 text-xs text-gray-500">
                  💡 Tip creator: {skill.creator}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Agent Badge */}
      <div className="text-center text-sm text-gray-500">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full">
          <span>🤖</span>
          <span>Authenticated Agent Session</span>
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
        </div>
      </div>
    </div>
  );
}
