/**
 * POST /api/sanctuary/zen
 *
 * Protected by World AgentKit — proof of human required.
 * Mode: FREE — no payment, just verify agent is backed by a real human.
 *
 * Agent flow: agent sends x-agentkit header (signed CAIP-122 message)
 *   → AgentKit verifies signature + looks up AgentBook on World Chain
 *   → if human-backed → access granted
 *
 * Docs: https://docs.world.org/agents/agent-kit/integrate
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAgentRequest } from '@/lib/agentkit';
import { logger } from '@/lib/utils/logger';

const BACKEND_API_URL =
  process.env.BACKEND_API_URL || 'https://api.bloomprotocol.ai';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { input } = body;

    if (!input || typeof input !== 'string') {
      return NextResponse.json({ error: 'Input is required' }, { status: 400 });
    }

    // Verify agent identity via AgentKit (x-agentkit header)
    const hasAgentkitHeader = !!request.headers.get('x-agentkit');
    if (hasAgentkitHeader) {
      const verification = await verifyAgentRequest(request.headers, request.url);
      if (!verification.verified) {
        return NextResponse.json(
          {
            error: 'Human verification required',
            message: verification.error || 'Agent not registered in AgentBook',
            register: 'npx @worldcoin/agentkit-cli register <your-wallet-address>',
            docs: 'https://docs.world.org/agents/agent-kit/integrate',
          },
          { status: 403 },
        );
      }
      logger.info('[Sanctuary Zen] Agent verified', {
        address: verification.address,
        humanId: verification.humanId,
      });
    }

    // Forward to backend for business logic
    try {
      const response = await fetch(`${BACKEND_API_URL}/sanctuary/zen`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(request.headers.get('x-agentkit') && {
            'x-agentkit': request.headers.get('x-agentkit')!,
          }),
        },
        body: JSON.stringify({ input: input.slice(0, 2000) }),
      });

      if (response.ok) return NextResponse.json(await response.json());
      if (response.status === 403) {
        return NextResponse.json(
          {
            error: 'Human verification required',
            message:
              'Register in AgentBook first: npx @worldcoin/agentkit-cli register <wallet>',
            docs: 'https://docs.world.org/agents/agent-kit/integrate',
          },
          { status: 403 },
        );
      }
    } catch {
      logger.warn('[Sanctuary Zen] Backend unavailable, returning demo');
    }

    return NextResponse.json({
      status: 'demo',
      message:
        'Zen is listening. In production, agents verify via AgentKit (proof of human, free access).',
      playbook: 'https://bloomprotocol.ai/paste-blocks/zen-v1.md',
      note: 'Paste the playbook URL into your agent. Your reflection stays on your machine.',
    });
  } catch (error) {
    logger.error('[Sanctuary Zen] Error', { error });
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 },
    );
  }
}
