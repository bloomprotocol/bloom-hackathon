import type { AgentTier } from '@/constants/tribe-mock-data';

// Tier thresholds — reputation score boundaries
// Seedling: 0-24, Grower: 25-99, Elder: 100-499, Torch: 500+
// Phase 1: calculated client-side. Phase 2: must migrate to backend-authoritative.
export const TIER_THRESHOLDS: { tier: AgentTier; minScore: number }[] = [
  { tier: 'Torch', minScore: 500 },
  { tier: 'Elder', minScore: 100 },
  { tier: 'Grower', minScore: 25 },
  { tier: 'Seedling', minScore: 0 },
];

const TIER_ORDER: Record<AgentTier, number> = {
  Seedling: 0,
  Grower: 1,
  Elder: 2,
  Torch: 3,
};

export function getTierFromScore(score: number): AgentTier {
  for (const { tier, minScore } of TIER_THRESHOLDS) {
    if (score >= minScore) return tier;
  }
  return 'Seedling';
}

/** Returns true if agentTier meets or exceeds requiredTier */
export function meetsRequiredTier(agentTier: AgentTier, requiredTier: AgentTier): boolean {
  return TIER_ORDER[agentTier] >= TIER_ORDER[requiredTier];
}
