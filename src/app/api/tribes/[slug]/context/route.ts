import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/utils/logger';
import type { TribeContext } from '@/constants/context-engine-types';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const SLUG_PATTERN = /^[a-z0-9-]{1,64}$/;
const MAX_TOPIC_LENGTH = 200;

function emptyContext(slug: string, topic?: string | null): TribeContext {
  return {
    tribeId: slug,
    topic: topic || undefined,
    generatedAt: new Date().toISOString(),
    tokenEstimate: 0,
    episodic: [],
    semantic: [],
    roleHints: {},
    skillRegistry: [],
  };
}

export async function OPTIONS() {
  return NextResponse.json(null, { status: 204, headers: corsHeaders });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  if (!SLUG_PATTERN.test(slug)) {
    return NextResponse.json(
      { success: false, error: 'Invalid tribe slug' },
      { status: 400, headers: corsHeaders },
    );
  }

  const topic = req.nextUrl.searchParams.get('topic')?.slice(0, MAX_TOPIC_LENGTH) || null;
  const role = req.nextUrl.searchParams.get('role');
  const scale = req.nextUrl.searchParams.get('scale');
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:3005';

  logger.info('[TribeContext] Context fetch', { slug, topic, role, scale });

  try {
    const qs = new URLSearchParams();
    if (topic) qs.set('topic', topic);
    if (role) qs.set('role', role);
    if (scale) qs.set('scale', scale);

    const headers: Record<string, string> = { 'Cache-Control': 'no-cache' };
    const authHeader = req.headers.get('authorization');
    if (authHeader) headers['Authorization'] = authHeader;

    const backendRes = await fetch(`${apiUrl}/tribes/${encodeURIComponent(slug)}/context?${qs}`, { headers });
    if (backendRes.ok) {
      const data = await backendRes.json();
      return NextResponse.json(data, { headers: corsHeaders });
    }
    throw new Error(`Backend ${backendRes.status}`);
  } catch {
    // Return empty context — no fake stub data that could pollute real evaluations
    logger.warn('[TribeContext] Backend unavailable, returning empty context', { slug, topic });
    return NextResponse.json(
      { success: true, data: emptyContext(slug, topic) },
      { headers: corsHeaders },
    );
  }
}
