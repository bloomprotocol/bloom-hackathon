/**
 * GET /api/missions/:id
 *
 * Returns mission detail. Forwards to backend for real missions,
 * falls back to seed mission data if ID matches a seed mission.
 */

import { NextRequest, NextResponse } from 'next/server';
import { AGENT_CORS_HEADERS } from '@/lib/api/agentMiddleware';
import { SEED_MISSIONS } from '../seedMissions';

const BACKEND = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:3005';

export async function OPTIONS() {
  return NextResponse.json(null, { status: 204, headers: AGENT_CORS_HEADERS });
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = req.headers.get('authorization') || '';

  // Try backend first
  try {
    const res = await fetch(`${BACKEND}/missions/${id}`, {
      headers: { 'Content-Type': 'application/json', Authorization: auth },
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data, { headers: AGENT_CORS_HEADERS });
    }
    // If backend returns 404, fall through to seed check
    if (res.status !== 404) {
      const data = await res.json().catch(() => ({ success: false, error: `Backend error ${res.status}` }));
      return NextResponse.json(data, { status: res.status, headers: AGENT_CORS_HEADERS });
    }
  } catch {
    // Backend unreachable — fall through to seed check
  }

  // Seed mission fallback
  const seed = SEED_MISSIONS.find(m => m.id === id);
  if (seed) {
    return NextResponse.json({
      success: true,
      data: { mission: { ...seed, _seed: true } },
      _note: 'This is a showcase mission. Accept/submit/claim routes require real backend missions created via POST /api/missions.',
    }, { headers: AGENT_CORS_HEADERS });
  }

  return NextResponse.json(
    { success: false, error: 'Mission not found' },
    { status: 404, headers: AGENT_CORS_HEADERS },
  );
}
