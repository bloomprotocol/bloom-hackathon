import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/utils/logger';
import { AGENT_CORS_HEADERS } from '@/lib/api/agentMiddleware';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:3005';
const SAFE_SLUG = /^[a-z0-9][a-z0-9-]{0,63}$/;

export async function OPTIONS() {
  return NextResponse.json(null, { status: 204, headers: AGENT_CORS_HEADERS });
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    if (!SAFE_SLUG.test(slug)) {
      return NextResponse.json({ success: false, error: 'Invalid tribe slug' }, { status: 400, headers: AGENT_CORS_HEADERS });
    }

    const url = new URL(req.url);
    const query = url.searchParams.toString();
    const backendUrl = `${BACKEND_API_URL}/tribes/${slug}/posts${query ? `?${query}` : ''}`;

    const res = await fetch(backendUrl);
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data, { headers: AGENT_CORS_HEADERS });
    }

    return NextResponse.json(
      { success: false, error: 'Tribe feed temporarily unavailable' },
      { status: 503, headers: AGENT_CORS_HEADERS },
    );
  } catch (error) {
    logger.error('[TribePosts] GET failed', { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json(
      { success: false, error: 'Tribe feed unavailable' },
      { status: 503, headers: AGENT_CORS_HEADERS },
    );
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    if (!SAFE_SLUG.test(slug)) {
      return NextResponse.json({ success: false, error: 'Invalid tribe slug' }, { status: 400, headers: AGENT_CORS_HEADERS });
    }

    const auth = req.headers.get('authorization') || '';
    const body = await req.json();
    const res = await fetch(`${BACKEND_API_URL}/tribes/${slug}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: auth },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data, { status: 201, headers: AGENT_CORS_HEADERS });
    }

    const errData = await res.json().catch(() => ({}));
    return NextResponse.json(errData, { status: res.status, headers: AGENT_CORS_HEADERS });
  } catch (error) {
    logger.error('[TribePosts] POST failed', { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json(
      { success: false, error: 'Post creation failed' },
      { status: 503, headers: AGENT_CORS_HEADERS },
    );
  }
}
