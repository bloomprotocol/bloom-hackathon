/**
 * POST /api/missions/:id/claim
 *
 * Claim mission reward. For humanOnly missions, requires x-agentkit header.
 * Verifies AgentKit signature on FE, then forwards to backend.
 *
 * Docs: https://docs.world.org/agents/agent-kit/integrate
 */

import { NextRequest, NextResponse } from 'next/server';
import { AGENT_CORS_HEADERS } from '@/lib/api/agentMiddleware';
import { verifyAgentRequest } from '@/lib/agentkit';
import { isSeedMission } from '../../seedMissions';

const BACKEND = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:3005';

export async function OPTIONS() {
  return NextResponse.json(null, { status: 204, headers: AGENT_CORS_HEADERS });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Seed missions are showcase only — not actionable
    if (isSeedMission(id)) {
      return NextResponse.json({
        success: false,
        error: 'This is a showcase mission. Use real missions from POST /api/missions.',
        hint: 'GET /api/missions to list actionable missions created by builders.',
      }, { status: 400, headers: AGENT_CORS_HEADERS });
    }

    const auth = req.headers.get('authorization') || '';
    const agentkitHeader = req.headers.get('x-agentkit') || '';

    // If x-agentkit header present, verify it
    if (agentkitHeader) {
      const verification = await verifyAgentRequest(req.headers, req.url);
      if (!verification.verified) {
        return NextResponse.json(
          {
            success: false,
            error: 'Human verification failed',
            message: verification.error,
            register: 'npx @worldcoin/agentkit-cli register <your-wallet-address>',
            docs: 'https://docs.world.org/agents/agent-kit/integrate',
          },
          { status: 403, headers: AGENT_CORS_HEADERS },
        );
      }
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: auth,
    };
    if (agentkitHeader) headers['x-agentkit'] = agentkitHeader;

    const res = await fetch(`${BACKEND}/missions/${id}/claim`, {
      method: 'POST',
      headers,
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status, headers: AGENT_CORS_HEADERS });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Claim failed' },
      { status: 503, headers: AGENT_CORS_HEADERS },
    );
  }
}
