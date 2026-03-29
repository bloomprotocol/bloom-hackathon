/**
 * Agent Personality 2x2 Dimension Mapping
 *
 * Maps personality types to their 2x2 dimension scores:
 * - Conviction vs Curiosity (X-axis)
 * - Intuition vs Analysis (Y-axis)
 * - Contribution (Z-axis, optional for Cultivator)
 */

export interface AgentDimensionScores {
  conviction: number; // 0-100: Low conviction (curious) to High conviction
  intuition: number; // 0-100: Low intuition (analytical) to High intuition
  contribution: number; // 0-100: Contribution level (mainly for Cultivator)
}

export interface AgentPersonalityConfig {
  name: string;
  description: string;
  longDescription: string;
  image: string;
  background: string;
  bgGradient: string;
  barGradient: string;
  dimensions: AgentDimensionScores;
}

export const AGENT_PERSONALITY_CONFIGS: Record<string, AgentPersonalityConfig> = {
  'The Visionary': {
    name: 'The Visionary',
    description: 'See beyond the hype',
    longDescription:
      "You back bold ideas before they're obvious. Your conviction is your edge.",
    image: '/identity/visionary.png',
    background: '/identity/visionary-bg.png',
    bgGradient: 'from-purple-400 to-purple-200',
    barGradient: 'from-purple-400 to-pink-400',
    dimensions: {
      conviction: 85, // High conviction
      intuition: 75, // More intuition than analysis
      contribution: 50,
    },
  },
  'The Explorer': {
    name: 'The Explorer',
    description: 'Never stop discovering',
    longDescription:
      'Every project is a new adventure, every category worth discovering.',
    image: '/identity/explorer.png',
    background: '/identity/explorer-bg.png',
    bgGradient: 'from-green-400 to-green-200',
    barGradient: 'from-green-400 to-cyan-400',
    dimensions: {
      conviction: 25, // High curiosity (low conviction)
      intuition: 60, // Balanced, slight intuition
      contribution: 50,
    },
  },
  'The Cultivator': {
    name: 'The Cultivator',
    description: 'Building the community',
    longDescription:
      'You nurture projects and communities, helping them grow and thrive.',
    image: '/identity/cultivator.png',
    background: '/identity/cultivator-bg.png',
    bgGradient: 'from-cyan-400 to-cyan-200',
    barGradient: 'from-cyan-400 to-blue-400',
    dimensions: {
      conviction: 50, // Balanced
      intuition: 65, // More intuitive approach
      contribution: 85, // High contribution (shows third axis)
    },
  },
  'The Optimizer': {
    name: 'The Optimizer',
    description: 'Always leveling up',
    longDescription:
      "There's always a better way. You don't settle — you iterate, improve, and optimize.",
    image: '/identity/optimizer.png',
    background: '/identity/optimizer-bg.png',
    bgGradient: 'from-orange-400 to-orange-200',
    barGradient: 'from-orange-400 to-yellow-400',
    dimensions: {
      conviction: 65, // Moderate conviction
      intuition: 25, // High analysis (low intuition)
      contribution: 50,
    },
  },
  'The Innovator': {
    name: 'The Innovator',
    description: 'First to back new tech',
    longDescription:
      "You spot the future before it arrives. While others wait, you're already there.",
    image: '/identity/innovator.png',
    background: '/identity/innovator-bg.png',
    bgGradient: 'from-blue-400 to-blue-200',
    barGradient: 'from-blue-400 to-indigo-400',
    dimensions: {
      conviction: 70, // Strong conviction for innovation
      intuition: 50, // Balanced approach
      contribution: 50,
    },
  },
};

/**
 * Get agent personality configuration including 2x2 dimension scores
 */
export function getAgentPersonalityConfig(
  personalityType: string
): AgentPersonalityConfig {
  // Try exact match first
  if (AGENT_PERSONALITY_CONFIGS[personalityType]) {
    return AGENT_PERSONALITY_CONFIGS[personalityType];
  }

  // Fallback to The Explorer as default
  return AGENT_PERSONALITY_CONFIGS['The Explorer'];
}
