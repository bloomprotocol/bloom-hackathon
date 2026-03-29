export interface PersonalityConfig {
  name: string;
  description: string;
  longDescription: string;
  image: string;
  background: string;
  bgGradient: string;
  barGradient: string;
}

export const AGENT_PERSONALITIES: Record<string, PersonalityConfig> = {
  visionary: {
    name: 'The Visionary',
    description: 'See beyond the hype',
    longDescription: 'You back bold ideas before they\'re obvious. Conviction drives you to see potential where others see risk.',
    bgGradient: 'from-purple-300 to-purple-200',
    barGradient: 'from-purple-400 to-purple-600',
    image: '/identity/visionary-agent.png',
    background: '/identity/visionary-agent-bg.png',
  },
  explorer: {
    name: 'The Explorer',
    description: 'Never stop discovering',
    longDescription: 'Always curious about what\'s next. You explore widely, sampling and discovering as you go.',
    bgGradient: 'from-green-300 to-green-200',
    barGradient: 'from-green-400 to-green-600',
    image: '/identity/explorer-agent.png',
    background: '/identity/explorer-agent-bg.png',
  },
  innovator: {
    name: 'The Innovator',
    description: 'First to back new tech',
    longDescription: 'You spot emerging tech early. While others wait for proof, you\'re already backing the future.',
    bgGradient: 'from-red-300 to-red-200',
    barGradient: 'from-red-400 to-red-600',
    image: '/identity/innovator-agent.png',
    background: '/identity/innovator-agent-bg.png',
  },
  optimizer: {
    name: 'The Optimizer',
    description: 'Always leveling up',
    longDescription: 'There\'s always a better way. You don\'t settle—you iterate, improve, and optimize until it\'s right.',
    bgGradient: 'from-orange-300 to-orange-200',
    barGradient: 'from-orange-400 to-orange-600',
    image: '/identity/optimizer-agent.png',
    background: '/identity/optimizer-agent-bg.png',
  },
  cultivator: {
    name: 'The Cultivator',
    description: 'Grow what you believe in',
    longDescription: 'You help projects grow through feedback and community building. You\'re the supporter every builder dreams of.',
    bgGradient: 'from-cyan-300 to-cyan-200',
    barGradient: 'from-cyan-400 to-cyan-600',
    image: '/identity/cultivator-agent.png',
    background: '/identity/cultivator-agent-bg.png',
  },
};

// Mock agent cards data for demonstration
export const MOCK_AGENT_CARDS = [
  {
    type: 'agent' as const,
    personality: 'visionary',
    conviction: 78,
    intuition: 85,
    contribution: 32,
    categories: ['Crypto', 'AI Tools', 'Productivity'],
    memberSince: 'January 2026',
    cardId: 'E-1234',
  },
  {
    type: 'agent' as const,
    personality: 'explorer',
    conviction: 45,
    intuition: 62,
    contribution: 28,
    categories: ['DeFi', 'Gaming', 'NFT'],
    memberSince: 'December 2025',
    cardId: 'E-1235',
  },
  {
    type: 'agent' as const,
    personality: 'cultivator',
    conviction: 55,
    intuition: 38,
    contribution: 72,
    categories: ['Community', 'Education', 'Social Good'],
    memberSince: 'January 2026',
    cardId: 'E-1236',
  },
];
