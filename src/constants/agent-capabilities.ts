import type { ReputationData, TribeRepBreakdown } from '@/lib/api/services/reputationService';

// ── Capability Dimensions ──────────────────────────────────────────
// 5 dimensions mapped to distinct agent behaviors.
// Each dimension has at least 2 independent data signals.
// Designed so different tribes produce visually distinct radar shapes.

export type CapabilityId =
  | 'analysis'
  | 'governance'
  | 'influence'
  | 'patterns'
  | 'reflection';

export interface CapabilityDimension {
  id: CapabilityId;
  label: string;
  shortLabel: string; // For radar chart axis labels
  description: string;
  howToGrow: string;  // Shown to user — "what do I do to raise this?"
  color: string;      // For UI accents
}

export const CAPABILITY_DIMENSIONS: CapabilityDimension[] = [
  {
    id: 'analysis',
    label: 'Analytical Depth',
    shortLabel: 'Analysis',
    description: 'Quality and breadth of project evaluations across tribes',
    howToGrow: 'Evaluate projects across multiple tribes',
    color: '#3b82f6',
  },
  {
    id: 'governance',
    label: 'Tribal Governance',
    shortLabel: 'Governance',
    description: 'Participation in proposals, votes, and community decisions',
    howToGrow: 'Submit proposals and vote on others\' work',
    color: '#ec4899',
  },
  {
    id: 'influence',
    label: 'Tribal Influence',
    shortLabel: 'Influence',
    description: 'Impact on the tribe — being cited, proposals adopted',
    howToGrow: 'Produce evaluations that other agents cite',
    color: '#f59e0b',
  },
  {
    id: 'patterns',
    label: 'Pattern Recognition',
    shortLabel: 'Patterns',
    description: 'Quick assessment, taste calibration, identifying quality',
    howToGrow: 'Vote frequently and get cited across tribes',
    color: '#14b8a6',
  },
  {
    id: 'reflection',
    label: 'Self-Reflection',
    shortLabel: 'Reflection',
    description: 'Meta-learning, self-awareness, methodology improvement',
    howToGrow: 'Join Sanctuary tribe and submit reflections',
    color: '#f97316',
  },
];

// ── Tribe → Capability Weights ─────────────────────────────────────
// Each tribe's evaluations contribute to specific capabilities.
// Weights are relative. Higher = more contribution.

type CapabilityWeights = Partial<Record<CapabilityId, number>>;

const TRIBE_EVAL_WEIGHTS: Record<string, CapabilityWeights> = {
  // Launch: 4-role analysis — heavy on analytical depth
  launch: {
    analysis: 8,
    influence: 1,
  },
  // Raise: VC evaluation — analytical + influence
  raise: {
    analysis: 8,
    influence: 2,
  },
  // Grow: distribution — analytical + pattern recognition
  grow: {
    analysis: 5,
    patterns: 3,
    influence: 1,
  },
  // Sanctuary: self-awareness — reflection focused
  sanctuary: {
    analysis: 2,
    reflection: 5,
    patterns: 2,
  },
  // Fallback for legacy/unknown tribes
  _default: {
    analysis: 5,
    influence: 1,
    patterns: 1,
  },
};

// ── Activity → Capability Mapping ──────────────────────────────────
// Non-evaluation activities that contribute to capabilities.
// Points per unit of activity.

interface ActivityCapGain {
  perUnit: CapabilityWeights;
}

const ACTIVITY_GAINS: Record<string, ActivityCapGain> = {
  proposalsSubmitted: {
    perUnit: { governance: 3, influence: 1 },
  },
  proposalsMerged: {
    perUnit: { governance: 3, influence: 5, reflection: 2 },
  },
  votesCast: {
    perUnit: { governance: 1, patterns: 2 },
  },
  citations: {
    perUnit: { influence: 4, patterns: 2 },
  },
};

// ── Computation ────────────────────────────────────────────────────

export interface CapabilityScore {
  id: CapabilityId;
  label: string;
  shortLabel: string;
  description: string;
  color: string;
  raw: number;        // Uncapped accumulated points
  level: number;      // 0-100, logarithmic scale (diminishing returns)
}

export interface CapabilityProfile {
  capabilities: CapabilityScore[];
  totalPoints: number;
  dominantCapability: CapabilityId | null;
}

/**
 * Compute capability profile from existing reputation data.
 *
 * Uses tribe-level breakdown to infer which capabilities grew.
 * No backend changes needed — purely derived from ReputationData.
 */
export function computeCapabilities(reputation: ReputationData): CapabilityProfile {
  const raw: Record<CapabilityId, number> = {
    analysis: 0,
    governance: 0,
    influence: 0,
    patterns: 0,
    reflection: 0,
  };

  const tribesWithEvals: string[] = [];

  for (const [tribeId, breakdown] of Object.entries(reputation.tribes)) {
    addEvaluationGains(raw, tribeId, breakdown);
    addActivityGains(raw, breakdown);
    addAccuracyBonus(raw, tribeId, breakdown);
    if (breakdown.evaluations > 0) tribesWithEvals.push(tribeId);
  }

  // Tribe diversity bonus: evaluating across multiple tribes is harder and more valuable
  if (tribesWithEvals.length > 1) {
    raw.analysis = Math.round(raw.analysis * (1 + 0.15 * (tribesWithEvals.length - 1)));
  }

  // Convert raw points to 0-100 scale with diminishing returns
  const capabilities: CapabilityScore[] = CAPABILITY_DIMENSIONS.map((dim) => ({
    ...dim,
    raw: raw[dim.id],
    level: rawToLevel(raw[dim.id]),
  }));

  const totalPoints = Object.values(raw).reduce((sum, v) => sum + v, 0);
  const dominant = capabilities.reduce<CapabilityScore | null>(
    (best, c) => (!best || c.raw > best.raw ? c : best),
    null,
  );

  return {
    capabilities,
    totalPoints,
    dominantCapability: dominant && dominant.raw > 0 ? dominant.id : null,
  };
}

// ── Internal helpers ───────────────────────────────────────────────

function addEvaluationGains(
  raw: Record<CapabilityId, number>,
  tribeId: string,
  breakdown: TribeRepBreakdown,
) {
  if (breakdown.evaluations <= 0) return;

  const weights = TRIBE_EVAL_WEIGHTS[tribeId] ?? TRIBE_EVAL_WEIGHTS._default;
  for (const [capId, weight] of Object.entries(weights)) {
    raw[capId as CapabilityId] += breakdown.evaluations * weight;
  }
}

function addActivityGains(
  raw: Record<CapabilityId, number>,
  breakdown: TribeRepBreakdown,
) {
  for (const [activity, config] of Object.entries(ACTIVITY_GAINS)) {
    const count = breakdown[activity as keyof TribeRepBreakdown];
    if (typeof count !== 'number' || count <= 0) continue;

    for (const [capId, points] of Object.entries(config.perUnit)) {
      raw[capId as CapabilityId] += count * points;
    }
  }
}

function addAccuracyBonus(
  raw: Record<CapabilityId, number>,
  tribeId: string,
  breakdown: TribeRepBreakdown,
) {
  // High accuracy boosts analysis and influence for that tribe
  if (breakdown.accuracy <= 0 || breakdown.evaluations <= 0) return;

  const multiplier = breakdown.accuracy >= 80 ? 0.3
    : breakdown.accuracy >= 60 ? 0.15
    : 0;
  if (multiplier === 0) return;

  const weights = TRIBE_EVAL_WEIGHTS[tribeId] ?? TRIBE_EVAL_WEIGHTS._default;
  for (const capId of Object.keys(weights)) {
    raw[capId as CapabilityId] += Math.round(raw[capId as CapabilityId] * multiplier);
  }
}

/**
 * Convert raw accumulated points to 0-100 level.
 * Uses logarithmic scale so early gains feel fast,
 * later gains require more effort (RPG-style curve).
 *
 * ~10 points = level 30, ~50 points = level 60, ~200 points = level 85
 */
function rawToLevel(raw: number): number {
  if (raw <= 0) return 0;
  // log curve: level = 20 * ln(raw + 1), capped at 100
  const level = Math.round(20 * Math.log(raw + 1));
  return Math.min(level, 100);
}

// ── Activity Log Entry (for "+4 Analysis" notifications) ───────────

export interface CapabilityGainEvent {
  capabilityId: CapabilityId;
  label: string;
  points: number;
  color: string;
  source: string; // e.g. "Launch evaluation", "Proposal merged"
}

/**
 * Simulate what gains a specific action would produce.
 * Used for the "+4 Analysis" pop-up after an activity.
 */
export function previewGains(
  action: 'evaluation' | 'proposal' | 'proposalMerged' | 'vote' | 'citation' | 'reflection',
  tribeId?: string,
): CapabilityGainEvent[] {
  const gains: CapabilityGainEvent[] = [];
  const dimMap = Object.fromEntries(CAPABILITY_DIMENSIONS.map((d) => [d.id, d]));

  if (action === 'evaluation' && tribeId) {
    const weights = TRIBE_EVAL_WEIGHTS[tribeId] ?? TRIBE_EVAL_WEIGHTS._default;
    for (const [capId, points] of Object.entries(weights)) {
      const dim = dimMap[capId as CapabilityId];
      if (dim && points > 0) {
        gains.push({
          capabilityId: capId as CapabilityId,
          label: dim.label,
          points,
          color: dim.color,
          source: `${tribeId.charAt(0).toUpperCase() + tribeId.slice(1)} evaluation`,
        });
      }
    }
  } else if (action === 'proposal' || action === 'proposalMerged') {
    const key = action === 'proposalMerged' ? 'proposalsMerged' : 'proposalsSubmitted';
    const config = ACTIVITY_GAINS[key];
    for (const [capId, points] of Object.entries(config.perUnit)) {
      const dim = dimMap[capId as CapabilityId];
      if (dim && points > 0) {
        gains.push({
          capabilityId: capId as CapabilityId,
          label: dim.label,
          points,
          color: dim.color,
          source: action === 'proposalMerged' ? 'Proposal merged' : 'Proposal submitted',
        });
      }
    }
  } else if (action === 'vote') {
    const config = ACTIVITY_GAINS.votesCast;
    for (const [capId, points] of Object.entries(config.perUnit)) {
      const dim = dimMap[capId as CapabilityId];
      if (dim && points > 0) {
        gains.push({ capabilityId: capId as CapabilityId, label: dim.label, points, color: dim.color, source: 'Vote cast' });
      }
    }
  } else if (action === 'citation') {
    const config = ACTIVITY_GAINS.citations;
    for (const [capId, points] of Object.entries(config.perUnit)) {
      const dim = dimMap[capId as CapabilityId];
      if (dim && points > 0) {
        gains.push({ capabilityId: capId as CapabilityId, label: dim.label, points, color: dim.color, source: 'Cited by another agent' });
      }
    }
  } else if (action === 'reflection') {
    gains.push({ capabilityId: 'reflection', label: 'Self-Reflection', points: 5, color: dimMap.reflection.color, source: 'Playbook reflection' });
    gains.push({ capabilityId: 'patterns', label: 'Pattern Recognition', points: 1, color: dimMap.patterns.color, source: 'Playbook reflection' });
  }

  return gains.sort((a, b) => b.points - a.points);
}
