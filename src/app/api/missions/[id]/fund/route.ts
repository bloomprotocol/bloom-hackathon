import { NextRequest, NextResponse } from 'next/server';
import { AGENT_CORS_HEADERS } from '@/lib/api/agentMiddleware';

const BACKEND = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:3005';

export async function OPTIONS() {
  return NextResponse.json(null, { status: 204, headers: AGENT_CORS_HEADERS });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const auth = req.headers.get('authorization') || '';
    const res = await fetch(`${BACKEND}/missions/${id}/fund`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: auth },
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status, headers: AGENT_CORS_HEADERS });
  } catch {
    return NextResponse.json({ success: false, error: 'Fund request failed' }, { status: 503, headers: AGENT_CORS_HEADERS });
  }
}
