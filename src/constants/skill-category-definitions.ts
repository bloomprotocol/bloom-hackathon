/**
 * Skill Category Definitions
 *
 * 6 consolidated display categories for the Discovery page.
 * These map to fine-grained backend categories via the API.
 */

export interface SkillCategoryDefinition {
  id: string;
  label: string;
  description: string;
}

export const SKILL_CATEGORY_DEFINITIONS: SkillCategoryDefinition[] = [
  {
    id: 'agent-os',
    label: 'Agent OS',
    description: 'Agent frameworks, context engineering, and MCP ecosystem tools',
  },
  {
    id: 'ai-dev',
    label: 'AI & Dev',
    description: 'AI applications, coding assistants, and developer tools',
  },
  {
    id: 'productivity',
    label: 'Productivity',
    description: 'Workflow automation and efficiency tools',
  },
  {
    id: 'creative',
    label: 'Creative',
    description: 'UI/UX design, creative tools, marketing, and content strategy',
  },
  {
    id: 'finance-web3',
    label: 'Finance & Web3',
    description: 'Crypto, DeFi, trading, investing, and prediction markets',
  },
  {
    id: 'other',
    label: 'Other',
    description: 'Wellness, education, and uncategorized tools',
  },
];

/**
 * Map from category ID to display label sent to the API.
 * The API expects the display label (e.g., "Agent OS"), not the ID.
 */
export const SKILL_CATEGORY_ID_TO_API: Record<string, string> = {
  'agent-os': 'Agent OS',
  'ai-dev': 'AI & Dev',
  'productivity': 'Productivity',
  'creative': 'Creative',
  'finance-web3': 'Finance & Web3',
  'other': 'Other',
};

/**
 * Map from display category label → fine-grained backend category names.
 * Mirrors backend DISPLAY_CATEGORY_MAP in skills-public.controller.ts.
 * Used for client-side filtering when skills are fetched in bulk.
 */
export const DISPLAY_TO_BACKEND_CATEGORIES: Record<string, string[]> = {
  'Agent OS': ['Agent Framework', 'Context Engineering', 'MCP Ecosystem'],
  'AI & Dev': ['AI Tools', 'Development', 'Coding Assistant'],
  'Productivity': ['Productivity'],
  'Creative': ['Design', 'Marketing'],
  'Finance & Web3': ['Crypto', 'Finance', 'Prediction Market'],
  'Other': ['Wellness', 'Education', 'Lifestyle', 'General'],
};

export const SKILL_CATEGORY_IDS = SKILL_CATEGORY_DEFINITIONS.map((cat) => cat.id);
export const SKILL_CATEGORY_LABELS = SKILL_CATEGORY_DEFINITIONS.map((cat) => cat.label);
