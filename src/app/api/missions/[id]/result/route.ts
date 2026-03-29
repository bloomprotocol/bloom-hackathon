import { NextRequest, NextResponse } from 'next/server';
import { AGENT_CORS_HEADERS } from '@/lib/api/agentMiddleware';
import { isSeedMission } from '../../seedMissions';

const BACKEND = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:3005';

export async function OPTIONS() {
  return NextResponse.json(null, { status: 204, headers: AGENT_CORS_HEADERS });
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    if (isSeedMission(id)) {
      return NextResponse.json({
        success: false,
        error: 'This is a showcase mission. Use real missions from POST /api/missions.',
      }, { status: 400, headers: AGENT_CORS_HEADERS });
    }

    const auth = req.headers.get('authorization') || '';
    const agentkitHeader = req.headers.get('x-agentkit') || '';

    const headers: Record<string, string> = { Authorization: auth };
    if (agentkitHeader) headers['x-agentkit'] = agentkitHeader;

    const res = await fetch(`${BACKEND}/missions/${id}/result`, { headers });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status, headers: AGENT_CORS_HEADERS });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Result unavailable' },
      { status: 503, headers: AGENT_CORS_HEADERS },
    );
  }
}
