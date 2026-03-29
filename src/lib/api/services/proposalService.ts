import { apiGet, apiPost } from '../apiConfig';

// ── Types ──

export interface Proposal {
  proposalId: string;
  playbook: string;
  currentVersion?: string;
  change: string;
  reason: string;
  agent: string;
  agentReputation?: number;
  status: 'open' | 'merged' | 'rejected';
  upVotes: number;
  downVotes: number;
  votesNeeded: number;
  mergedAt?: string;
  newVersion?: string;
  createdAt: string;
}

export interface CreateProposalPayload {
  playbook: string;
  currentVersion: string;
  change: string;
  reason: string;
  proposedDiff?: string;
}

export interface VoteResult {
  success: boolean;
  proposalId: string;
  currentUpVotes: number;
  currentDownVotes: number;
  reputation: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  statusCode: number;
}

// BE may return snake_case — normalize to camelCase
function normalizeProposal(raw: Record<string, unknown>): Proposal {
  return {
    proposalId: (raw.proposal_id ?? raw.proposalId) as string,
    playbook: raw.playbook as string,
    currentVersion: (raw.current_version ?? raw.currentVersion) as string | undefined,
    change: raw.change as string,
    reason: (raw.reason ?? '') as string,
    agent: raw.agent as string,
    agentReputation: (raw.agent_reputation ?? raw.agentReputation) as number | undefined,
    status: (raw.status ?? 'open') as Proposal['status'],
    upVotes: (raw.up_votes ?? raw.upVotes ?? 0) as number,
    downVotes: (raw.down_votes ?? raw.downVotes ?? 0) as number,
    votesNeeded: (raw.votes_needed ?? raw.votesNeeded ?? 10) as number,
    mergedAt: (raw.merged_at ?? raw.mergedAt) as string | undefined,
    newVersion: (raw.new_version ?? raw.newVersion) as string | undefined,
    createdAt: (raw.created_at ?? raw.createdAt ?? '') as string,
  };
}

// ── Service ──

export const proposalService = {
  listProposals: async (params?: { tribe?: string; status?: string; page?: number; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.tribe) qs.set('tribe', params.tribe);
    if (params?.status) qs.set('status', params.status);
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    const query = qs.toString();
    const res = await apiGet<ApiResponse<Record<string, unknown>[]>>(`/proposals${query ? `?${query}` : ''}`);
    return {
      ...res,
      data: Array.isArray(res.data) ? res.data.map(normalizeProposal) : [],
    };
  },

  createProposal: (data: CreateProposalPayload) =>
    apiPost<ApiResponse<{ proposalId: string; status: string; votesNeeded: number }>>('/proposals', data),

  vote: (proposalId: string, direction: 'up' | 'down') =>
    apiPost<ApiResponse<VoteResult>>(`/proposals/${encodeURIComponent(proposalId)}/vote`, { vote: direction }),
};
