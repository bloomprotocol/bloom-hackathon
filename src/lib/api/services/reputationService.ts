import { getCookie, COOKIE_KEYS } from '@/lib/utils/storage';

// Cross-tribe reputation breakdown returned by the backend
export interface TribeRepBreakdown {
  evaluations: number;
  accuracy: number;
  citations: number;
  proposalsSubmitted: number;
  proposalsMerged: number;
  votesCast: number;
  rep: number;
}

export interface ReputationData {
  total: number;
  tribes: Record<string, TribeRepBreakdown>;
  linked?: boolean; // true = agent found for this wallet
  agentUserId?: number;
}

interface BridgeResponse {
  success: boolean;
  data: {
    total: number;
    tribes: Record<string, TribeRepBreakdown>;
    linked: boolean;
    agentUserId?: number;
    walletAddress?: string;
    raw?: {
      reputationScore?: number;
      evaluationsCount?: number;
      quickRatesCount?: number;
      citationsReceived?: number;
      breakdown?: {
        fromEvaluations: number;
        fromQuickRates: number;
        fromReplies: number;
        fromCitations: number;
        fromAccuracy: number;
      };
      tribeBreakdown?: Record<string, TribeRepBreakdown>;
    };
  };
}

/**
 * Fetch cross-tribe reputation for the authenticated human user.
 *
 * Uses the FE bridge route /api/user/agent-reputation which:
 *   1. Reads the human user's JWT
 *   2. Finds the user's wallet address via BE
 *   3. Looks up the agent registered with that wallet
 *   4. Returns the agent's reputation data
 */
export async function getMyReputation(): Promise<ReputationData> {
  try {
    // Get human user's auth token for the bridge request
    const token = getCookie(COOKIE_KEYS.AUTH_TOKEN)
      || (typeof window !== 'undefined' ? localStorage.getItem('jwt-token') : null);

    if (!token) {
      return { total: 0, tribes: {}, linked: false };
    }

    // Call FE bridge route (not backend directly)
    const res = await fetch('/api/user/agent-reputation', {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      return { total: 0, tribes: {}, linked: false };
    }

    const json: BridgeResponse = await res.json();
    if (!json.success) {
      return { total: 0, tribes: {}, linked: false };
    }

    const d = json.data;

    // If per-tribe breakdown is present, use directly
    if (d.tribes && Object.keys(d.tribes).length > 0) {
      return {
        total: d.total,
        tribes: d.tribes,
        linked: d.linked,
        agentUserId: d.agentUserId,
      };
    }

    // Try to extract from raw legacy format
    if (d.raw?.tribeBreakdown && Object.keys(d.raw.tribeBreakdown).length > 0) {
      return {
        total: d.raw.reputationScore ?? d.total,
        tribes: d.raw.tribeBreakdown,
        linked: d.linked,
        agentUserId: d.agentUserId,
      };
    }

    // Agent found but no tribe-level data — derive from flat breakdown
    if (d.raw?.reputationScore && d.raw.reputationScore > 0) {
      return {
        total: d.raw.reputationScore,
        tribes: {
          all: {
            evaluations: d.raw.evaluationsCount ?? 0,
            accuracy: d.raw.breakdown?.fromAccuracy ?? 0,
            citations: d.raw.citationsReceived ?? 0,
            proposalsSubmitted: 0,
            proposalsMerged: 0,
            votesCast: d.raw.quickRatesCount ?? 0,
            rep: d.raw.reputationScore,
          },
        },
        linked: d.linked,
        agentUserId: d.agentUserId,
      };
    }

    // Agent linked but zero reputation (new agent)
    return {
      total: d.total ?? 0,
      tribes: {},
      linked: d.linked ?? false,
      agentUserId: d.agentUserId,
    };
  } catch {
    // Bridge unavailable — return zeros so UI still renders
    return { total: 0, tribes: {}, linked: false };
  }
}
