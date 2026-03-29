/**
 * Tier System Definitions
 *
 * Defines the progression path for Bloom Protocol supporters
 * Level 0 (New User) → Level 1 (Seed) → Level 2 (Sprout) → Level 3 (Bloom)
 *
 * "Bloom Pass" is the overall name for the identity card system,
 * not a separate tier level.
 *
 * Thresholds designed with hotel loyalty program principles:
 * - Seed: achievable in ~3-4 weeks (entry tier)
 * - Sprout: ~3 months commitment (10x power jump from Seed)
 * - Bloom: ~8 months commitment (3x power jump from Sprout + referral gate)
 */

export interface TierRequirement {
  id: string;
  label: string;
  description?: string;
}

export interface TierDefinition {
  id: string;
  name: string;
  level: number; // 0 = new user, 1 = Seed, 2 = Sprout, 3 = Bloom
  color: string;
  gradient: string;
  icon: string;
  description: string;
  requirements: TierRequirement[];
  benefits: string[];
  // Numeric thresholds for backend validation
  thresholds?: {
    pledgePower?: number;
    projectsSupported?: number;
    activeWeeks?: number;
    messagesSent?: number;
    referrals?: number;
  };
}

/**
 * Complete tier progression system
 * Only 3 official levels: Seed (1), Sprout (2), Bloom (3)
 * Level 0 represents new users who haven't unlocked Seed yet
 */
export const TIER_DEFINITIONS: TierDefinition[] = [
  {
    id: 'seed',
    name: 'Seed',
    level: 1,
    color: '#10b981',
    gradient: 'from-emerald-400 to-green-500',
    icon: '🌱',
    description: 'Begin your journey as a supporter',
    requirements: [
      {
        id: 'pledge-power',
        label: 'Earn 1,000 Pledge Power',
        description: 'Use your weekly pledge power to support projects'
      },
      {
        id: 'projects-supported',
        label: 'Support 5 different projects',
        description: 'Explore and diversify your support'
      },
      {
        id: 'active-weeks',
        label: 'Be active for 2+ weeks',
        description: 'Show consistent engagement'
      },
      {
        id: 'first-message',
        label: 'Send your first message',
        description: 'Leave a message with a pledge'
      },
    ],
    benefits: [
      'Unlock Supporter Identity',
      'Weekly Pledge Power refresh',
    ],
    thresholds: {
      pledgePower: 1000,
      projectsSupported: 5,
      activeWeeks: 2,
      messagesSent: 1,
    },
  },
  {
    id: 'sprout',
    name: 'Sprout',
    level: 2,
    color: '#8b5cf6',
    gradient: 'from-violet-400 to-purple-500',
    icon: '🌿',
    description: 'Committed supporter building momentum',
    requirements: [
      {
        id: 'pledge-power',
        label: 'Earn 10,000 Pledge Power',
        description: 'Consistent weekly pledging over months'
      },
      {
        id: 'projects-supported',
        label: 'Support 15+ different projects',
        description: 'Broad ecosystem engagement'
      },
      {
        id: 'active-weeks',
        label: 'Be active for 8+ weeks',
        description: 'At least 2 months of participation'
      },
      {
        id: 'messages-sent',
        label: 'Send 5+ messages',
        description: 'Engage with project teams'
      },
    ],
    benefits: [
      'Upgraded identity card',
      'Sprout badge',
    ],
    thresholds: {
      pledgePower: 10000,
      projectsSupported: 15,
      activeWeeks: 8,
      messagesSent: 5,
    },
  },
  {
    id: 'bloom',
    name: 'Bloom',
    level: 3,
    color: '#f59e0b',
    gradient: 'from-amber-400 to-orange-500',
    icon: '🌸',
    description: 'Core contributor and community pillar',
    requirements: [
      {
        id: 'pledge-power',
        label: 'Earn 30,000 Pledge Power',
        description: 'Long-term commitment milestone'
      },
      {
        id: 'projects-supported',
        label: 'Support 30+ different projects',
        description: 'True ecosystem champion'
      },
      {
        id: 'active-weeks',
        label: 'Be active for 20+ weeks',
        description: 'Sustained engagement over months'
      },
      {
        id: 'messages-sent',
        label: 'Send 10+ messages',
        description: 'Active community participant'
      },
      {
        id: 'referrals',
        label: 'Refer 3+ active supporters',
        description: 'Help grow the community'
      },
    ],
    benefits: [
      'Premium identity card',
      'Bloom badge',
    ],
    thresholds: {
      pledgePower: 30000,
      projectsSupported: 30,
      activeWeeks: 20,
      messagesSent: 10,
      referrals: 3,
    },
  },
];

/**
 * Get tier by ID
 */
export function getTierById(tierId: string): TierDefinition | undefined {
  return TIER_DEFINITIONS.find((t) => t.id === tierId);
}

/**
 * Get next tier
 */
export function getNextTier(currentTierId: string): TierDefinition | null {
  const currentTier = getTierById(currentTierId);
  if (!currentTier) return TIER_DEFINITIONS[0];

  const nextLevel = currentTier.level + 1;
  return TIER_DEFINITIONS.find((t) => t.level === nextLevel) || null;
}

/**
 * Get tier by level number
 */
export function getTierByLevel(level: number): TierDefinition | undefined {
  return TIER_DEFINITIONS.find((t) => t.level === level);
}
