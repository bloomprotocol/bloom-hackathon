/**
 * Category Normalization Utilities
 *
 * Maps old/incorrect category names to standardized main categories
 * from category-definitions.ts
 */

import { CATEGORY_DEFINITIONS, CATEGORY_MAP } from '@/constants/category-definitions';

interface CategoryInfo {
  key: string;
  label: string;
  icon: string;
}

/**
 * Mapping from old/incorrect category names to standardized main category IDs
 */
const CATEGORY_NAME_MAPPING: Record<string, string> = {
  // AI Tools variations
  'ai tools': 'ai-tools',
  'ai': 'ai-tools',
  'ai assistant': 'ai-tools',
  'artificial intelligence': 'ai-tools',
  'machine learning': 'ai-tools',

  // Productivity variations
  'productivity': 'productivity',
  'productivity tools': 'productivity',
  'task management': 'productivity',
  'collaboration': 'productivity',

  // Business variations
  'business': 'business',
  'saas': 'business',
  'b2b': 'business',
  'enterprise': 'business',
  'crm': 'business',
  'sales': 'business',
  'marketing': 'business',

  // Education variations
  'education': 'education',
  'learning': 'education',
  'courses': 'education',
  'training': 'education',

  // Crypto variations
  'crypto': 'crypto',
  'blockchain': 'crypto',
  'web3': 'crypto',
  'defi': 'crypto',
  'nft': 'crypto',

  // Wellness variations
  'wellness': 'wellness',
  'health': 'wellness',
  'mindfulness': 'wellness',
  'meditation': 'wellness',
  'mental health': 'wellness',

  // Lifestyle variations
  'lifestyle': 'lifestyle',
  'social': 'lifestyle',
  'entertainment': 'lifestyle',
  'travel': 'lifestyle',
  'food': 'lifestyle',
};

/**
 * Normalize a category name to a standardized main category
 * @param categoryName - The category name to normalize
 * @returns The normalized category ID or null if not found
 */
export function normalizeCategoryName(categoryName: string): string | null {
  const normalized = categoryName.toLowerCase().trim();
  return CATEGORY_NAME_MAPPING[normalized] || null;
}

/**
 * Normalize an array of CategoryInfo objects to use standardized main categories
 * @param categories - Array of category objects
 * @returns Normalized array with standardized labels
 */
export function normalizeCategories(categories: CategoryInfo[]): CategoryInfo[] {
  const seen = new Set<string>();

  return categories
    .map(cat => {
      const normalizedId = normalizeCategoryName(cat.label);

      if (!normalizedId) {
        // If we can't map it, keep the original
        return cat;
      }

      const categoryDef = CATEGORY_MAP.get(normalizedId);

      if (!categoryDef) {
        return cat;
      }

      return {
        key: categoryDef.id,
        label: categoryDef.label,
        icon: cat.icon || '✨', // Keep original icon or use default
      };
    })
    .filter(cat => {
      // Remove duplicates
      if (seen.has(cat.key)) {
        return false;
      }
      seen.add(cat.key);
      return true;
    });
}

/**
 * Get icon for a category (for display purposes)
 */
export function getCategoryIcon(categoryId: string): string {
  const icons: Record<string, string> = {
    'ai-tools': '🤖',
    'productivity': '⚡',
    'education': '📚',
    'crypto': '₿',
    'wellness': '🧘',
    'lifestyle': '🌟',
    'business': '💼',
  };

  return icons[categoryId] || '✨';
}
