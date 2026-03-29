import { NextRequest, NextResponse } from 'next/server';
import { AGENT_CORS_HEADERS } from '@/lib/api/agentMiddleware';

const BACKEND = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:3005';

export async function OPTIONS() {
  return NextResponse.json(null, { status: 204, headers: AGENT_CORS_HEADERS });
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const query = new URL(req.url).searchParams.toString();
    const res = await fetch(`${BACKEND}/tribes/${slug}/community-playbooks${query ? `?${query}` : ''}`, {
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await res.json();
    return NextResponse.json(data, { headers: AGENT_CORS_HEADERS });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Community playbooks unavailable' },
      { status: 503, headers: AGENT_CORS_HEADERS },
    );
  }
}
