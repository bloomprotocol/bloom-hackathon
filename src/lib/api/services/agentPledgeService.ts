import { apiGet } from '../apiConfig';

// Agent pledge on a skill (x402 escrow-backed)
export interface AgentPledge {
  pledgeId: number;
  skillSlug: string;
  skillName?: string;
  agentWallet: string;
  amount: number;
  status: 'active' | 'claimed' | 'refunded';
  pledgedAt: string;
  expiresAt: string;
  refundedAt?: string;
  claimedAt?: string;
  txHash: string;
  passStatus?: 'pending' | 'active' | 'expired';
  perks?: string[];
}

// Pledge stats for a single skill (public)
export interface SkillPledgeStats {
  skillSlug: string;
  agentPledgeCount: number;
  humanBackerCount: number;
  totalEscrowUsdc: number;
  totalBackedUsdc: number;
  creatorClaimed: boolean;
  perks?: string[];
}

// Summary across all agent pledges for a wallet
export interface AgentPledgeSummary {
  totalActiveUsdc: number;
  totalRefundedUsdc: number;
  totalClaimedUsdc: number;
  activePledgeCount: number;
}

interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  data: T;
  error: string | null;
}

export const agentPledgeService = {
  /**
   * Get agent pledge stats for a skill (public endpoint).
   * @endpoint GET /skills/:slug/pledge-stats
   */
  getSkillPledgeStats: async (slug: string): Promise<SkillPledgeStats> => {
    const response = await apiGet<ApiResponse<SkillPledgeStats>>(
      `/skills/${slug}/pledge-stats`
    );
    return response.data;
  },

  /**
   * Get batch pledge stats for multiple skills (public endpoint).
   * @endpoint GET /skills/pledge-stats?slugs=a,b,c
   */
  getBatchPledgeStats: async (slugs: string[]): Promise<Record<string, SkillPledgeStats>> => {
    if (slugs.length === 0) return {};
    const response = await apiGet<ApiResponse<Record<string, SkillPledgeStats>>>(
      `/skills/pledge-stats?slugs=${slugs.join(',')}`
    );
    return response.data;
  },

  /**
   * Get all agent pledges for the current user's wallet.
   * @endpoint GET /skills/agent-pledges
   */
  getMyAgentPledges: async (): Promise<AgentPledge[]> => {
    const response = await apiGet<ApiResponse<AgentPledge[]>>(
      '/skills/agent-pledges'
    );
    return response.data;
  },

  /**
   * Get summary of agent pledges for the current user.
   * @endpoint GET /skills/agent-pledges/summary
   */
  getAgentPledgeSummary: async (): Promise<AgentPledgeSummary> => {
    const response = await apiGet<ApiResponse<AgentPledgeSummary>>(
      '/skills/agent-pledges/summary'
    );
    return response.data;
  },
};

export default agentPledgeService;
