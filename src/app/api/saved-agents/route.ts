/**
 * Saved Agents API
 *
 * GET  - Fetch saved agents for the current user
 * POST - Save an agent to the user's collection
 *
 * Proxies to backend: POST /users/me/saved-agents, GET /users/me/saved-agents
 * Auth: forwards `auth-token` JWT as Bearer token
 */

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'https://api.bloomprotocol.ai';

function getAuthToken(request: NextRequest): string | null {
  return request.cookies.get('auth-token')?.value || null;
}

export async function GET(request: NextRequest) {
  try {
    const token = getAuthToken(request);

    if (!token) {
      // Graceful fallback for unauthenticated — return empty
      return NextResponse.json({
        success: true,
        data: { agents: [] },
      });
    }

    const response = await fetch(`${BACKEND_API_URL}/users/me/saved-agents`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({
          success: true,
          data: { agents: [] },
        });
      }
      const data = await response.json().catch(() => ({}));
      return NextResponse.json(
        { success: false, message: 'Failed to fetch saved agents', ...data },
        { status: response.status }
      );
    }

    const data = await response.json();
    const agents = data.data?.savedAgents || data.data?.agents || [];

    return NextResponse.json({
      success: true,
      data: { agents },
    });
  } catch (error) {
    console.error('[Saved Agents GET] Error:', error);
    return NextResponse.json({
      success: true,
      data: { agents: [] },
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = getAuthToken(request);

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { agentUserId } = body;

    if (!agentUserId) {
      return NextResponse.json(
        { success: false, message: 'agentUserId is required' },
        { status: 400 }
      );
    }

    const response = await fetch(`${BACKEND_API_URL}/users/me/saved-agents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ agentUserId: Number(agentUserId) }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.error || data.message || 'Failed to save agent' },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Agent saved to collection',
      data: data.data || data,
    });
  } catch (error) {
    console.error('[Saved Agents POST] Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to save agent',
      },
      { status: 500 }
    );
  }
}
