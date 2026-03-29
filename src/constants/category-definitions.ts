/**
 * Category Definitions
 *
 * Source of truth for all category mappings in Bloom Protocol
 * Used by both agent identity analysis and frontend discovery page
 */

export interface CategoryDefinition {
  id: string;
  label: string;
  description: string;
  subcategories: string[];
}

/**
 * All 7 main categories with their subcategories
 */
export const CATEGORY_DEFINITIONS: CategoryDefinition[] = [
  {
    id: 'ai-tools',
    label: 'AI Tools',
    description: 'Artificial intelligence applications and tools',
    subcategories: [
      'Generative AI',
      'AI Agents & Automation',
      'Machine Learning',
      'Conversational AI',
    ],
  },
  {
    id: 'productivity',
    label: 'Productivity',
    description: 'Tools for efficiency, task management, and workflow optimization',
    subcategories: [
      'Task & Project Management',
      'Automation & Workflow',
      'Note-taking & Knowledge',
      'Time Management',
      'Collaboration Tools',
    ],
  },
  {
    id: 'education',
    label: 'Education',
    description: 'Learning, knowledge acquisition, and skill development',
    subcategories: [
      'Learning Platforms',
      'Courses & Training',
      'Research & Knowledge',
      'Language Learning',
      'Skills Development',
    ],
  },
  {
    id: 'crypto',
    label: 'Crypto',
    description: 'Blockchain, cryptocurrency, and decentralized technologies',
    subcategories: [
      'DeFi',
      'Web3',
      'NFTs',
      'Trading & Exchanges',
      'Wallets & DAOs',
    ],
  },
  {
    id: 'wellness',
    label: 'Wellness',
    description: 'Mental wellbeing, spirituality, and holistic health',
    subcategories: [
      'Mindfulness & Meditation',
      'Therapy & Self-care',
      'Astrology & Spirituality',
      'Energy Healing',
      'Mysticism & Tarot',
    ],
  },
  {
    id: 'lifestyle',
    label: 'Lifestyle',
    description: 'Daily life, hobbies, and personal interests',
    subcategories: [
      'Social & Community',
      'Travel & Adventure',
      'Fashion & Style',
      'Food & Dining',
      'Home & Entertainment',
    ],
  },
  {
    id: 'business',
    label: 'Business',
    description: 'Business operations, sales, and team management',
    subcategories: [
      'CRM & Sales',
      'Marketing & Analytics',
      'Team Collaboration',
      'E-commerce',
      'Customer Support',
    ],
  },
];

/**
 * Quick lookup maps
 */
export const CATEGORY_MAP = new Map(
  CATEGORY_DEFINITIONS.map((cat) => [cat.id, cat])
);

export const CATEGORY_IDS = CATEGORY_DEFINITIONS.map((cat) => cat.id);

export const CATEGORY_LABELS = CATEGORY_DEFINITIONS.map((cat) => cat.label);

/**
 * Get subcategories for a main category
 */
export function getSubcategories(mainCategoryId: string): string[] {
  return CATEGORY_MAP.get(mainCategoryId)?.subcategories || [];
}

/**
 * Get category label by ID
 */
export function getCategoryLabel(categoryId: string): string {
  return CATEGORY_MAP.get(categoryId)?.label || categoryId;
}

/**
 * Find category ID by label (case-insensitive)
 */
export function findCategoryByLabel(label: string): string | undefined {
  const normalized = label.toLowerCase();
  return CATEGORY_DEFINITIONS.find(
    (cat) => cat.label.toLowerCase() === normalized
  )?.id;
}
