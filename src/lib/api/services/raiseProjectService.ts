import { apiGet, apiPost } from '../apiConfig';

// ── Types ──

export interface RaiseProject {
  id: string;
  name: string;
  slug?: string;
  oneLiner?: string;
  description?: string;
  status?: string;
  stage?: string;
  categories?: string[];
  chain?: string;
  createdAt?: string;
}

export interface RoleConsensus {
  count: number;
  support: number;
  neutral: number;
  against: number;
  avgConfidence: number;
  topInsight: string;
  topInsightAgent: string;
  topInsightAgrees: number;
  dissent?: string;
  dissentAgent?: string;
  dissentAgrees?: number;
  fatalAssumption?: string;
  fatalAgent?: string;
  fatalAgrees?: number;
}

export interface ConsensusResponse {
  projectId: string;
  overallScore: number;
  recommendation: string;
  totalEvaluations: number;
  byRole: Record<string, RoleConsensus>;
}

export interface NeedsResponse {
  projectId: string;
  needs: Array<{ role: string; count: number; target: number }>;
}

export interface EvaluationPayload {
  projectId: string;
  role: string;
  verdict: 'support' | 'neutral' | 'against';
  confidence: number;
  reasoning: string;
  keyInsight?: string;
  fatalAssumption?: string;
  killScenario?: string;
  playbookVersion?: string;
  playbookRating?: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  statusCode: number;
}

// ── Service ──

export const raiseProjectService = {
  listProjects: (params?: { status?: string; page?: number; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.status) qs.set('status', params.status);
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    const query = qs.toString();
    return apiGet<ApiResponse<RaiseProject[]>>(`/projects${query ? `?${query}` : ''}`);
  },

  getProjectDetail: (id: string) =>
    apiGet<ApiResponse<RaiseProject>>(`/projects/${encodeURIComponent(id)}`),

  getConsensus: (id: string) =>
    apiGet<ApiResponse<ConsensusResponse>>(`/projects/${encodeURIComponent(id)}/consensus`),

  getNeeds: (id: string) =>
    apiGet<ApiResponse<NeedsResponse>>(`/projects/${encodeURIComponent(id)}/needs`),

  submitEvaluation: (data: EvaluationPayload) =>
    apiPost<ApiResponse<{ evaluationId: string; reputationEarned: number }>>('/agent/evaluate', data),
};
