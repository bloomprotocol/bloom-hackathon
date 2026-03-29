/**
 * Public API Proxy - Agent Discoveries ("New for You")
 *
 * Proxies requests to the backend API.
 * Same pattern as the parent [agentUserId]/route.ts proxy.
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/utils/logger';

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'https://api.bloomprotocol.ai';

// Validate agentUserId to prevent path traversal
const AGENT_USER_ID_PATTERN = /^\d+$/;

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ agentUserId: string }> }
) {
  try {
    const { agentUserId } = await context.params;

    if (!AGENT_USER_ID_PATTERN.test(agentUserId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid agent user ID' },
        { status: 400 }
      );
    }

    const response = await fetch(`${BACKEND_API_URL}/x402/agent/${agentUserId}/discoveries`, {
      headers: { 'Content-Type': 'application/json' },
      cache: process.env.NODE_ENV === 'production' ? 'default' : 'no-store',
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: 'Discoveries not found' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    logger.error('[API Proxy] Error fetching agent discoveries', { error });

    return NextResponse.json(
      { success: false, message: 'Failed to fetch agent discoveries' },
      { status: 500 }
    );
  }
}
