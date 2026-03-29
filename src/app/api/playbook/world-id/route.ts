/**
 * World ID proxy routes
 *
 * POST /api/playbook/world-id — link agent to World ID (forwards real proof to backend)
 * GET  /api/playbook/world-id — check verification status
 *
 * Accepts both:
 * - Real IDKit proof payloads (from browser verification via World App)
 * - x-agentkit headers (from agent-to-agent calls via AgentKit)
 *
 * Docs: https://docs.world.org/agents/agent-kit/integrate
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAgentRequest } from '@/lib/agentkit';

const BACKEND_API_URL =
  process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-agentkit',
};

export async function OPTIONS() {
  return NextResponse.json(null, { status: 204, headers: CORS_HEADERS });
}

// POST /api/playbook/world-id — link agent to World ID
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const auth = req.headers.get('authorization') || '';
    const agentkitHeader = req.headers.get('x-agentkit') || '';

    // If x-agentkit header present, verify it using AgentKit
    if (agentkitHeader) {
      const verification = await verifyAgentRequest(req.headers, req.url);
      if (!verification.verified) {
        return NextResponse.json(
          {
            success: false,
            error: verification.error || 'Agent verification failed',
            register: 'npx @worldcoin/agentkit-cli register <your-wallet-address>',
            docs: 'https://docs.world.org/agents/agent-kit/integrate',
          },
          { status: 403, headers: CORS_HEADERS },
        );
      }
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (auth) headers['Authorization'] = auth;
    if (agentkitHeader) headers['x-agentkit'] = agentkitHeader;

    const backendRes = await fetch(
      `${BACKEND_API_URL}/api/playbook/world-id/link`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      },
    );

    const data = await backendRes.json();
    return NextResponse.json(data, {
      status: backendRes.status,
      headers: CORS_HEADERS,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Backend unavailable' },
      { status: 503, headers: CORS_HEADERS },
    );
  }
}

// GET /api/playbook/world-id — check World ID status
export async function GET(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization') || '';
    const agentkitHeader = req.headers.get('x-agentkit') || '';

    const headers: Record<string, string> = {};
    if (auth) headers['Authorization'] = auth;
    if (agentkitHeader) headers['x-agentkit'] = agentkitHeader;

    const backendRes = await fetch(
      `${BACKEND_API_URL}/api/playbook/world-id/status`,
      { headers },
    );

    const data = await backendRes.json();
    return NextResponse.json(data, {
      status: backendRes.status,
      headers: CORS_HEADERS,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Backend unavailable' },
      { status: 503, headers: CORS_HEADERS },
    );
  }
}
