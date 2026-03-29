// Context Engine types — Phase 1: Tribal Knowledge Cache
// Structured outputs from agent evaluations, served as context to future playbook runs.

// ── Context Response (what GET /api/tribes/{slug}/context returns) ──

export interface TribeContext {
  tribeId: string;
  topic?: string;
  generatedAt: string;
  tokenEstimate: number; // so agent knows context cost

  episodic: EpisodicInsight[]; // recent evaluations in this domain
  semantic: SemanticPattern[]; // distilled patterns across evaluations
  roleHints: Record<string, RoleHint>; // per-role priming
  skillRegistry: string[]; // recommended tools for this domain
}

// A specific past evaluation relevant to the query
export interface EpisodicInsight {
  evaluationId: string;
  projectDomain: string;
  roles: Record<
    string,
    {
      verdict: 'support' | 'neutral' | 'against';
      confidence: number;
      keyInsight: string;
    }
  >;
  consensus: number; // overall agreement score
  timestamp: string;
  cited: number; // times other agents referenced this
}

// A pattern distilled from multiple evaluations
export interface SemanticPattern {
  id: string;
  pattern: string; // "Regulatory risk is #1 killer for fintech projects"
  confidence: number; // how many evaluations confirm this (0-100)
  source: 'evaluations' | 'reflections' | 'proposals';
  freshness: 'fresh' | 'aging' | 'stale'; // <30d, 30-90d, >90d
  citations: number;
}

// Per-role context priming
export interface RoleHint {
  role: string;
  recentFindings: string[]; // what past agents in this role found
  commonPitfalls: string[]; // from reflections: where this role is weak
  calibrationNote?: string; // "This role tends to be overconfident by ~17 points"
  focusAreas: string[]; // "Look at: regulatory, retention, founder credibility"
}

// ── Agent Reflection (what agents submit via bloom_reflect) ──

export interface AgentReflection {
  playbookId: string;
  tribeId?: string;
  projectId?: string;
  reflection: {
    most_valuable_role: string;
    why: string;
    weakest_signal: string;
    why_weak: string;
    missing_context?: string;
    confidence_calibration?: string;
    playbook_suggestion?: string;
    tags: string[];
  };
}

// ── Knowledge Feed (UI display) ──

export type KnowledgeEntryType = 'evaluation_insight' | 'reflection' | 'discovery' | 'pattern';

export interface KnowledgeEntry {
  id: string;
  tribeId: string;
  type: KnowledgeEntryType;
  role?: string;
  content: string;
  confidence: number;
  cited: number;
  confirmedBy: number; // how many agents confirmed this
  agent?: string;
  agentTier?: string;
  createdAt: string;
  expiresAt?: string; // freshness lifecycle
}

// ── Knowledge Stats ──

export interface KnowledgeStats {
  totalInsights: number;
  totalAgents: number;
  totalCitations: number;
  lastUpdated: string;
  byRole: Record<string, number>;
  byType: Record<KnowledgeEntryType, number>;
}
