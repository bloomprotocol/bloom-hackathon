/**
 * User → Agent Reputation Bridge
 *
 * Bridges the gap between human user auth (Thirdweb JWT) and agent reputation.
 * Flow: human JWT → extract wallet → lookup agent by wallet → fetch agent reputation
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/utils/logger';

const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:3005';

// EVM address: 0x + 40 hex chars
const EVM_ADDRESS_RE = /^0x[0-9a-fA-F]{40}$/;

export async function GET(req: NextRequest) {
  try {
    // 1. Get the human user's auth token
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 },
      );
    }

    // 2. Get user profile from BE to find wallet address
    let walletAddress: string | null = null;

    try {
      const profileRes = await fetch(`${API_URL}/users/me`, {
        headers: { Authorization: authHeader },
      });

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        walletAddress =
          profileData?.data?.walletAddress ||
          profileData?.walletAddress ||
          null;
      }
    } catch (err) {
      const status = (err as { status?: number })?.status;
      if (status && status >= 400) {
        logger.warn('[UserAgentRep] Profile fetch failed', { status });
      } else {
        logger.debug('[UserAgentRep] Could not fetch user profile');
      }
    }

    if (!walletAddress) {
      // No wallet = no agent linkable
      return NextResponse.json({
        success: true,
        data: { total: 0, tribes: {}, linked: false },
      });
    }

    // Validate wallet address format to prevent SSRF / path traversal
    if (!EVM_ADDRESS_RE.test(walletAddress)) {
      logger.warn('[UserAgentRep] Invalid wallet address format', { walletAddress });
      return NextResponse.json({
        success: true,
        data: { total: 0, tribes: {}, linked: false },
      });
    }

    // 3. Look up agent by wallet address
    let agentUserId: number | null = null;

    try {
      const agentRes = await fetch(
        `${API_URL}/x402/agent-by-address/${encodeURIComponent(walletAddress)}`,
      );

      if (agentRes.ok) {
        const agentData = await agentRes.json();
        agentUserId = agentData?.data?.agentUserId ?? null;
      }
    } catch (err) {
      const status = (err as { status?: number })?.status;
      if (status && status >= 400) {
        logger.warn('[UserAgentRep] Agent lookup failed', { status });
      } else {
        logger.debug('[UserAgentRep] Could not find agent by wallet');
      }
    }

    if (!agentUserId) {
      // Wallet exists but no registered agent
      return NextResponse.json({
        success: true,
        data: { total: 0, tribes: {}, linked: false, walletAddress },
      });
    }

    // 4. Fetch agent reputation from BE
    // Try the user-facing endpoint first (if BE supports it),
    // then fall back to the agent endpoint
    let repData = null;

    // Attempt 1: User-facing endpoint that accepts user auth
    try {
      const repRes = await fetch(`${API_URL}/agent/${agentUserId}/reputation`, {
        headers: { Authorization: authHeader },
      });
      if (repRes.ok) {
        const repJson = await repRes.json();
        repData = repJson?.data ?? repJson;
      }
    } catch {
      // Endpoint may not exist yet
    }

    // Attempt 2: Standard agent reputation endpoint
    if (!repData) {
      try {
        const repRes = await fetch(`${API_URL}/agent/reputation`, {
          headers: { Authorization: authHeader },
        });
        if (repRes.ok) {
          const repJson = await repRes.json();
          repData = repJson?.data ?? repJson;
        }
      } catch {
        // May also fail
      }
    }

    // 5. Normalize and return
    if (repData) {
      return NextResponse.json({
        success: true,
        data: {
          total: repData.reputationScore ?? repData.total ?? 0,
          tribes: repData.tribeBreakdown ?? repData.tribes ?? {},
          linked: true,
          agentUserId,
          walletAddress,
          raw: {
            reputationScore: repData.reputationScore,
            evaluationsCount: repData.evaluationsCount,
            quickRatesCount: repData.quickRatesCount,
            citationsReceived: repData.citationsReceived,
            breakdown: repData.breakdown,
            tribeBreakdown: repData.tribeBreakdown,
          },
        },
      });
    }

    // Agent found but no reputation data yet
    return NextResponse.json({
      success: true,
      data: {
        total: 0,
        tribes: {},
        linked: true,
        agentUserId,
        walletAddress,
      },
    });
  } catch (error) {
    logger.error('[UserAgentRep] Failed', { error });
    return NextResponse.json(
      { success: false, error: 'Failed to fetch agent reputation' },
      { status: 500 },
    );
  }
}
