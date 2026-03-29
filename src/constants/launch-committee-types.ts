// Launch Committee types and mappings

export type ProjectStatus = 'idea' | 'mvp' | 'paying_users' | 'scaling';
export type ProjectStage = 'seeding' | 'growing' | 'scaling';
export type RecommendedTribe = 'launch' | 'raise' | 'grow';

export interface LaunchReport {
  id: string;
  project_name: string;
  description: string;
  problem: string;
  current_status: ProjectStatus;
  url?: string;
  created_at: string;

  // AI analysis result
  stage: ProjectStage;
  analysis: {
    market: string;
    product: string;
    growth: string;
    risk: string;
  };
  quality_score: number; // Internal, never shown. 0-100.
  can_publish: boolean;
  recommended_tribe: RecommendedTribe;
  improvement_suggestions: string[] | null;
}

export interface LaunchCommitteeRequest {
  project_name: string;
  description: string;
  problem: string;
  current_status: ProjectStatus;
  url?: string;
}

export interface LaunchCommitteeResponse {
  success: boolean;
  data?: {
    id: string;
    stage: ProjectStage;
    analysis: {
      market: string;
      product: string;
      growth: string;
      risk: string;
    };
    recommended_tribe: RecommendedTribe;
    can_publish: boolean; // true if quality >= threshold, user chooses to publish
    improvement_suggestions: string[] | null;
  };
  error?: string;
}

// Stage → Tribe mapping
export const STAGE_TO_TRIBE: Record<ProjectStage, RecommendedTribe> = {
  seeding: 'launch',
  growing: 'raise',
  scaling: 'grow',
};

// Status → Stage mapping
// idea + mvp = still validating (seeding → Launch)
// paying_users = proven demand, build the business (growing → Raise)
// scaling = scale distribution (scaling → Grow)
export const STATUS_TO_STAGE: Record<ProjectStatus, ProjectStage> = {
  idea: 'seeding',
  mvp: 'seeding',
  paying_users: 'growing',
  scaling: 'scaling',
};

// Display config
export const STAGE_DISPLAY: Record<ProjectStage, { emoji: string; label: string; color: string }> = {
  seeding: { emoji: '\u{1F331}', label: 'Seeding', color: '#22c55e' },
  growing: { emoji: '\u{1F33F}', label: 'Growing', color: '#84cc16' },
  scaling: { emoji: '\u{1F333}', label: 'Scaling', color: '#16a34a' },
};

export const TRIBE_DISPLAY: Record<RecommendedTribe, { label: string; description: string }> = {
  launch: { label: 'Launch Tribe', description: 'Validate your idea and find product-market fit.' },
  raise: { label: 'Raise Tribe', description: 'Turn traction into a real business.' },
  grow: { label: 'Grow Tribe', description: 'Scale your distribution and reach 10x more people.' },
};

export const ROLE_DISPLAY = {
  market: { emoji: '\u{1F3E6}', label: 'MARKET' },
  product: { emoji: '\u{1F6E0}\u{FE0F}', label: 'PRODUCT' },
  growth: { emoji: '\u{1F4C8}', label: 'GROWTH' },
  risk: { emoji: '\u{26A0}\u{FE0F}', label: 'RISK' },
} as const;

// Quality gate threshold (user can opt-in to publish if score >= this)
export const QUALITY_THRESHOLD = 40;
