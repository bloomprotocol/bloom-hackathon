'use client';

import AgentIdentityCardPreview from '../(protected)/dashboard/components/agent-identity-card-preview';
import { AGENT_PERSONALITIES } from '../(protected)/dashboard/config/agent-personalities';

export default function ShowcaseCardsPage() {
  const personalities = [
    { key: 'visionary', conviction: 85, intuition: 80, contribution: 60 },
    { key: 'explorer', conviction: 60, intuition: 85, contribution: 50 },
    { key: 'cultivator', conviction: 70, intuition: 70, contribution: 90 },
    { key: 'optimizer', conviction: 90, intuition: 60, contribution: 65 },
    { key: 'innovator', conviction: 75, intuition: 90, contribution: 55 },
  ];

  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎴 Agent Identity Cards - Carousel View
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            All 5 personality types with exact carousel styling
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl mx-auto text-left">
            <p className="text-sm text-blue-900 font-medium mb-2">📸 How to capture:</p>
            <ol className="text-sm text-blue-800 space-y-1 ml-4">
              <li>1. Right-click on a card below</li>
              <li>2. Select "Inspect Element"</li>
              <li>3. Find the card's root div (with class "agent-card")</li>
              <li>4. Right-click → "Capture node screenshot"</li>
              <li>5. Repeat for all 5 cards</li>
            </ol>
          </div>
        </div>

        {/* Carousel-style background */}
        <div className="relative mb-8 rounded-[20px] overflow-hidden">
          {/* Atmospheric background layer */}
          <div className="absolute -inset-8 pointer-events-none">
            {/* Radial gradient */}
            <div
              className="absolute inset-0"
              style={{
                background: 'radial-gradient(ellipse 900px 700px at center, rgba(140,120,200,0.12) 0%, rgba(120,100,180,0.06) 35%, rgba(100,80,160,0.02) 60%, transparent 85%)',
              }}
            />

            {/* Decorative blur circles */}
            <div
              className="absolute top-10 left-20"
              style={{
                width: '300px',
                height: '300px',
                background: 'rgba(160,130,220,0.08)',
                filter: 'blur(100px)',
                borderRadius: '50%',
              }}
            />
            <div
              className="absolute bottom-20 right-10"
              style={{
                width: '250px',
                height: '250px',
                background: 'rgba(100,180,200,0.06)',
                filter: 'blur(80px)',
                borderRadius: '50%',
              }}
            />
          </div>

          {/* Cards Grid */}
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 justify-items-center py-12 px-8">
            {personalities.map((p) => (
              <div key={p.key} className="flex flex-col items-center">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  {AGENT_PERSONALITIES[p.key].name}
                </h2>
                {/* Capture Container with fixed dimensions */}
                <div
                  id={`card-${p.key}`}
                  className="relative"
                  style={{
                    width: '400px',
                    height: '550px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <AgentIdentityCardPreview
                    personality={AGENT_PERSONALITIES[p.key]}
                    conviction={p.conviction}
                    intuition={p.intuition}
                    contribution={p.contribution}
                    memberSince="February 2026"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
