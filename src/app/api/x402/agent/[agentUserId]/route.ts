/**
 * Public API Proxy - Agent Identity Data
 *
 * Proxies requests to the backend API at api.bloomprotocol.ai
 * This allows the frontend to call /api/x402/agent/{id}
 * which then fetches from the backend.
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

    // Fetch from backend API
    const response = await fetch(`${BACKEND_API_URL}/x402/agent/${agentUserId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: process.env.NODE_ENV === 'production' ? 'default' : 'no-store',
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: 'Agent not found' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    logger.error('[API Proxy] Error fetching agent data', { error });

    return NextResponse.json(
      { success: false, message: 'Failed to fetch agent data' },
      { status: 500 }
    );
  }
}
