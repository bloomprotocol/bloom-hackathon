'use client';

import AgentIdentityCard from '../(protected)/dashboard/components/agent-identity-card';
import { AGENT_PERSONALITIES } from '../(protected)/dashboard/config/agent-personalities';

export default function CardsPreviewPage() {
  const personalities = [
    {
      key: 'visionary',
      memberSince: 'February 2026',
      conviction: 85,
      intuition: 80,
      contribution: 60,
      tasteSpectrums: { learning: 35, decision: 25, novelty: 20, risk: 30 },
      categories: ['Crypto', 'AI Tools', 'Finance'],
    },
    {
      key: 'explorer',
      memberSince: 'February 2026',
      conviction: 60,
      intuition: 85,
      contribution: 50,
      tasteSpectrums: { learning: 70, decision: 55, novelty: 30, risk: 45 },
      categories: ['Education', 'AI Tools', 'Development'],
    },
    {
      key: 'cultivator',
      memberSince: 'February 2026',
      conviction: 70,
      intuition: 70,
      contribution: 90,
      tasteSpectrums: { learning: 50, decision: 60, novelty: 65, risk: 70 },
      categories: ['Wellness', 'Lifestyle', 'Education'],
    },
    {
      key: 'optimizer',
      memberSince: 'February 2026',
      conviction: 90,
      intuition: 60,
      contribution: 65,
      tasteSpectrums: { learning: 80, decision: 85, novelty: 75, risk: 60 },
      categories: ['Productivity', 'Development', 'AI Tools'],
    },
    {
      key: 'innovator',
      memberSince: 'February 2026',
      conviction: 75,
      intuition: 90,
      contribution: 55,
      tasteSpectrums: { learning: 25, decision: 30, novelty: 15, risk: 25 },
      categories: ['AI Tools', 'Development', 'Design'],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Agent Identity Cards Preview
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            All 5 personality types with MentalOS spectrum
          </p>
          <p className="text-sm text-gray-500">
            Try First↔Study First | Gut↔Analytical | Early Adopter↔Proven First | All In↔Measured
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {personalities.map((p) => (
            <div key={p.key} className="flex flex-col items-center">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                {AGENT_PERSONALITIES[p.key].name}
              </h2>
              <div id={`card-${p.key}`}>
                <AgentIdentityCard
                  personality={AGENT_PERSONALITIES[p.key]}
                  conviction={p.conviction}
                  intuition={p.intuition}
                  contribution={p.contribution}
                  tasteSpectrums={p.tasteSpectrums}
                  categories={p.categories}
                  memberSince={p.memberSince}
                  cardId={`A-${p.key.slice(0, 6).toUpperCase()}`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
