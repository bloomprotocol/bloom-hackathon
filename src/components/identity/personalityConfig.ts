export interface PersonalityConfig {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  backgroundColor: string; // Tailwind gradient classes
  imageUrl: string; // Main personality image (e.g., crystal ball)
  backgroundImageUrl?: string; // Background pattern/texture
}

export const PERSONALITY_CONFIGS: Record<string, PersonalityConfig> = {
  // ===== New Human Supporter Personalities =====
  'The Trailblazer': {
    id: 'trailblazer',
    name: 'The Trailblazer',
    description: 'First to back new tech',
    longDescription: 'You spot the future before it arrives. While others wait, you\'re already there, backing the next big thing.',
    backgroundColor: 'from-red-300 to-red-100',
    imageUrl: '/identity/innovator.png', // Reuse existing assets
    backgroundImageUrl: '/identity/innovator-bg.png',
  },
  'The Achiever': {
    id: 'achiever',
    name: 'The Achiever',
    description: 'Always leveling up',
    longDescription: 'Productivity is your passion. You back tools that help people work smarter and reach peak performance.',
    backgroundColor: 'from-orange-300 to-orange-100',
    imageUrl: '/identity/optimizer.png', // Reuse existing assets
    backgroundImageUrl: '/identity/optimizer-bg.png',
  },
  'The Nurturer': {
    id: 'nurturer',
    name: 'The Nurturer',
    description: 'Investing in wellbeing',
    longDescription: 'You believe growth starts from within. You back projects that help people heal, grow, and thrive.',
    backgroundColor: 'from-cyan-300 to-cyan-100',
    imageUrl: '/identity/mindful.png', // Reuse existing assets
    backgroundImageUrl: '/identity/mindful-bg.png',
  },
  'The Pioneer': {
    id: 'pioneer',
    name: 'The Pioneer',
    description: 'Back bold ideas early',
    longDescription: 'You back bold ideas before they\'re obvious. Your conviction drives breakthrough innovation across all frontiers.',
    backgroundColor: 'from-purple-300 to-purple-100',
    imageUrl: '/identity/visionary.png', // Reuse existing assets
    backgroundImageUrl: '/identity/visionary-bg.png',
  },
  'The Curator': {
    id: 'curator',
    name: 'The Curator',
    description: 'Curious about everything',
    longDescription: 'Every project is worth discovering. You explore widely, curating the best ideas across all categories.',
    backgroundColor: 'from-green-300 to-green-100',
    imageUrl: '/identity/explorer.png', // Reuse existing assets
    backgroundImageUrl: '/identity/explorer-bg.png',
  },

  // ===== Legacy Personalities (for backwards compatibility) =====
  'The Explorer': {
    id: 'explorer',
    name: 'The Explorer',
    description: 'Never stop discovering',
    longDescription: 'Every project is a new adventure, every category worth discovering',
    backgroundColor: 'from-green-300 to-green-100',
    imageUrl: '/identity/explorer.png',
    backgroundImageUrl: '/identity/explorer-bg.png',
  },
  'The Innovator': {
    id: 'innovator',
    name: 'The Innovator',
    description: 'First to back new tech',
    longDescription: 'You spot the future before it arrives. While others wait, you\'re already there.',
    backgroundColor: 'from-red-300 to-red-100',
    imageUrl: '/identity/innovator.png',
    backgroundImageUrl: '/identity/innovator-bg.png',
  },
  'The Optimizer': {
    id: 'optimizer',
    name: 'The Optimizer',
    description: 'Always leveling up',
    longDescription: 'There\'s always a better way. You don\'t settle — you iterate, improve, and optimize until it\'s right.',
    backgroundColor: 'from-orange-300 to-orange-100',
    imageUrl: '/identity/optimizer.png',
    backgroundImageUrl: '/identity/optimizer-bg.png',
  },
  'The Mindful': {
    id: 'mindful',
    name: 'The Mindful',
    description: 'Growth starts within',
    longDescription: 'Focused on wellness and mindfulness',
    backgroundColor: 'from-cyan-300 to-cyan-100',
    imageUrl: '/identity/mindful.png',
    backgroundImageUrl: '/identity/mindful-bg.png',
  },
  'The Visionary': {
    id: 'visionary',
    name: 'The Visionary',
    description: 'See beyond the hype',
    longDescription: 'You back bold ideas before they\'re obvious. Your conviction is your edge',
    backgroundColor: 'from-purple-300 to-purple-100',
    imageUrl: '/identity/visionary.png',
    backgroundImageUrl: '/identity/visionary-bg.png',
  },
};

// Helper to get config by personality name
export function getPersonalityConfig(name: string): PersonalityConfig {
  return PERSONALITY_CONFIGS[name] || PERSONALITY_CONFIGS['The Curator'];
}
