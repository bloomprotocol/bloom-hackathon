'use client';

import { AGENT_PERSONALITIES } from '@/app/(protected)/dashboard/config/agent-personalities';

/**
 * Twitter OG Image Preview - 1200x630
 *
 * Visit: http://localhost:3000/og-preview-twitter
 *
 * Instructions:
 * 1. Right-click on each card
 * 2. "Inspect Element"
 * 3. In DevTools, right-click the element → "Capture node screenshot"
 * 4. Save as /public/og/[personality].png
 */

export default function TwitterOGPreview() {
  const personalities = [
    { key: 'visionary', conviction: 78, intuition: 85 },
    { key: 'explorer', conviction: 45, intuition: 62 },
    { key: 'cultivator', conviction: 55, intuition: 38 },
    { key: 'optimizer', conviction: 50, intuition: 45 },
    { key: 'innovator', conviction: 65, intuition: 70 },
  ];

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Twitter OG Image Generator
          </h1>
          <p className="text-gray-600 mb-4">
            Size: <strong>1200 × 630 pixels</strong> (Twitter recommended)
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded p-4 text-left">
            <h3 className="font-semibold text-blue-900 mb-2">📸 How to Capture:</h3>
            <ol className="space-y-2 text-sm text-blue-800">
              <li><strong>1.</strong> Right-click on a card below</li>
              <li><strong>2.</strong> Select "Inspect" or "Inspect Element"</li>
              <li><strong>3.</strong> In DevTools, right-click the highlighted div</li>
              <li><strong>4.</strong> Click "Capture node screenshot"</li>
              <li><strong>5.</strong> Save as <code>public/og/[personality].png</code></li>
            </ol>
          </div>
        </div>

        {/* Cards */}
        <div className="space-y-8">
          {personalities.map(({ key, conviction, intuition }) => {
            const personality = AGENT_PERSONALITIES[key];

            return (
              <div key={key} className="bg-white rounded-lg shadow-lg p-8">
                <div className="mb-4 text-center">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {personality.name}
                  </h2>
                  <p className="text-sm text-gray-500">
                    Save as: <code className="bg-gray-100 px-2 py-1 rounded">public/og/{key}.png</code>
                  </p>
                </div>

                {/* OG Image Card - 1200x630 */}
                <div
                  id={`og-${key}`}
                  className="mx-auto relative rounded-3xl overflow-hidden shadow-2xl"
                  style={{
                    width: '1200px',
                    height: '630px',
                    background: `linear-gradient(135deg, ${personality.bgGradient})`,
                  }}
                >
                  {/* Background texture if exists */}
                  {personality.background && (
                    <div className="absolute inset-0 opacity-30">
                      <img
                        src={personality.background}
                        alt=""
                        className="w-full h-full object-cover mix-blend-overlay"
                      />
                    </div>
                  )}

                  {/* Dark overlay */}
                  <div className="absolute inset-0 bg-black/20"></div>

                  {/* Content Container */}
                  <div className="relative z-10 h-full flex items-center justify-between px-16">
                    {/* Left: Hero Image */}
                    <div className="flex-shrink-0">
                      <div className="w-[400px] h-[500px] rounded-2xl overflow-hidden shadow-xl bg-white/10 backdrop-blur-sm">
                        <img
                          src={personality.image}
                          alt={personality.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    {/* Right: Text Content */}
                    <div className="flex-1 ml-16 text-white">
                      {/* Personality Name */}
                      <h2 className="font-['DM_Serif_Text'] text-6xl mb-6 leading-tight">
                        {personality.name}
                      </h2>

                      {/* Tagline */}
                      <p className="font-['Hedvig_Letters_Serif'] text-3xl opacity-90 mb-8 italic leading-relaxed">
                        "{personality.description}"
                      </p>

                      {/* Description */}
                      <p className="font-['IBM_Plex_Mono'] text-xl opacity-85 mb-10 leading-relaxed max-w-xl">
                        {personality.longDescription}
                      </p>

                      {/* OpenClaw Badge */}
                      <div className="inline-flex items-center gap-2 mb-6 pb-4 border-b border-white/20">
                        <span className="text-3xl">🦞</span>
                        <span className="text-lg text-white/80 font-medium">via OpenClaw</span>
                      </div>

                      {/* Bloom Protocol Logo */}
                      <div className="flex items-center gap-3 opacity-90">
                        <div className="w-10 h-10">
                          <img
                            src="/identity/bloom-logo.png"
                            alt="Bloom"
                            className="w-full h-full"
                          />
                        </div>
                        <span className="font-['IBM_Plex_Mono'] text-xl font-medium">
                          Bloom Protocol
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
