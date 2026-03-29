'use client';

import AgentIdentityCardPreview from '@/app/(protected)/dashboard/components/agent-identity-card-preview';
import { AGENT_PERSONALITIES } from '@/app/(protected)/dashboard/config/agent-personalities';

/**
 * OG Image Preview Page
 *
 * Displays all 5 personality preview cards for easy screenshot/download.
 * Visit: http://localhost:3000/og-preview
 */
export default function OGPreviewPage() {
  const personalities = [
    { key: 'visionary', conviction: 78, intuition: 85, contribution: 32 },
    { key: 'explorer', conviction: 45, intuition: 62, contribution: 28 },
    { key: 'cultivator', conviction: 55, intuition: 38, contribution: 72 },
    { key: 'optimizer', conviction: 50, intuition: 45, contribution: 5 },
    { key: 'innovator', conviction: 65, intuition: 70, contribution: 40 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            OG Image Preview - All Personalities
          </h1>
          <p className="text-gray-600 mb-2">
            Screenshot each card at 372×520px for OG images
          </p>
          <p className="text-sm text-gray-500">
            Right-click on each card → "Save Image As" or use a screenshot tool
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {personalities.map(({ key, conviction, intuition, contribution }) => {
            const personality = AGENT_PERSONALITIES[key];

            return (
              <div key={key} className="flex flex-col items-center">
                {/* Card Label */}
                <div className="mb-4 text-center">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {personality.name}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {key}.png (372×520px)
                  </p>
                </div>

                {/* Preview Card */}
                <div
                  id={`card-${key}`}
                  className="relative"
                  style={{ width: '372px', height: '520px' }}
                >
                  <AgentIdentityCardPreview
                    personality={personality}
                    conviction={conviction}
                    intuition={intuition}
                    contribution={contribution}
                    memberSince="February 2026"
                  />
                </div>

                {/* Download Button */}
                <button
                  onClick={() => {
                    const element = document.getElementById(`card-${key}`);
                    if (element) {
                      // Simple way: user can right-click to save
                      alert(`Right-click on the ${personality.name} card and select "Save Image As..."\n\nOr use a screenshot tool to capture the card area.`);
                    }
                  }}
                  className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Download {personality.name}
                </button>
              </div>
            );
          })}
        </div>

        {/* Instructions */}
        <div className="mt-12 max-w-2xl mx-auto bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            📸 How to Save Cards
          </h3>
          <ol className="space-y-3 text-gray-700">
            <li>
              <strong>1. Screenshot Method (Recommended):</strong>
              <ul className="ml-6 mt-2 space-y-1 text-sm text-gray-600">
                <li>• Mac: Cmd+Shift+4, then drag to select card area</li>
                <li>• Windows: Snipping Tool or Win+Shift+S</li>
                <li>• Each card is exactly 372×520px</li>
              </ul>
            </li>
            <li>
              <strong>2. Browser DevTools Method:</strong>
              <ul className="ml-6 mt-2 space-y-1 text-sm text-gray-600">
                <li>• Right-click on card → Inspect</li>
                <li>• In DevTools, right-click the element → Capture node screenshot</li>
              </ul>
            </li>
            <li>
              <strong>3. Save to:</strong>
              <code className="ml-2 px-2 py-1 bg-gray-100 rounded text-sm">
                /public/og/[personality].png
              </code>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
