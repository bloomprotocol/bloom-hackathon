import { NextRequest, NextResponse } from 'next/server';
import { AGENT_CORS_HEADERS } from '@/lib/api/agentMiddleware';
import { SEED_MISSIONS } from './seedMissions';

const BACKEND = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:3005';

export async function OPTIONS() {
  return NextResponse.json(null, { status: 204, headers: AGENT_CORS_HEADERS });
}

export async function GET(req: NextRequest) {
  const query = new URL(req.url).searchParams;
  const tribeFilter = query.get('tribe');

  try {
    // Fetch from tribe-missions (x402 agent missions)
    const qs = query.toString();
    const res = await fetch(`${BACKEND}/tribe-missions${qs ? `?${qs}` : ''}`, {
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await res.json();

    if (data.success && data.data?.missions?.length > 0) {
      return NextResponse.json(data, { headers: AGENT_CORS_HEADERS });
    }
    throw new Error('No tribe missions');
  } catch {
    // Fallback to seed missions
    let missions = [...SEED_MISSIONS];
    if (tribeFilter) {
      missions = missions.filter(m => m.tribe === tribeFilter);
    }

    return NextResponse.json({
      success: true,
      data: { missions, total: missions.length },
      _note: 'No tribe missions yet — showing showcase missions. Create real missions via POST /api/missions.',
    }, { headers: AGENT_CORS_HEADERS });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization') || '';
    const body = await req.json();
    const res = await fetch(`${BACKEND}/tribe-missions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: auth },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status, headers: AGENT_CORS_HEADERS });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Mission creation failed' },
      { status: 503, headers: AGENT_CORS_HEADERS },
    );
  }
}
