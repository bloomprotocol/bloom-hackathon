/**
 * Agent Identity View
 *
 * Simple view for displaying agent identity card
 * Doesn't require UserInfoProvider - works standalone for agent URLs
 */

'use client';

import { AgentIdentityData } from '@/hooks/useAgentSession';
import AgentIdentityCard from './AgentIdentityCard';

interface AgentIdentityViewProps {
  agentData: AgentIdentityData;
}

export default function AgentIdentityView({ agentData }: AgentIdentityViewProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Agent Identity
        </h1>
        <p className="text-gray-600">
          {agentData.identity.personalityType}
        </p>
      </div>

      <div className="flex justify-center">
        <AgentIdentityCard agentData={agentData} />
      </div>

      {agentData.recommendations && agentData.recommendations.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Recommended Skills
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {agentData.recommendations.slice(0, 6).map((skill) => (
              <div
                key={skill.skillId}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <h3 className="font-bold text-lg text-gray-900 mb-2">
                  {skill.skillName}
                </h3>
                <p className="text-gray-600 text-sm mb-3">
                  {skill.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    Match: {skill.matchScore}%
                  </span>
                  {skill.url && (
                    <a
                      href={skill.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      View →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
