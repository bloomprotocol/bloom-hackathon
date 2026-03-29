import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/utils/logger';
import { STUB_KNOWLEDGE_ENTRIES } from '@/constants/context-engine-mock-data';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const SLUG_PATTERN = /^[a-z0-9-]{1,64}$/;

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
  const role = req.nextUrl.searchParams.get('role');
  const type = req.nextUrl.searchParams.get('type');
  const sort = req.nextUrl.searchParams.get('sort');
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:3005';

  try {
    const qs = new URLSearchParams();
    if (role) qs.set('role', role);
    if (type) qs.set('type', type);
    if (sort) qs.set('sort', sort);

    const headers: Record<string, string> = { 'Cache-Control': 'no-cache' };
    const authHeader = req.headers.get('authorization');
    if (authHeader) headers['Authorization'] = authHeader;

    const backendRes = await fetch(`${apiUrl}/tribes/${encodeURIComponent(slug)}/knowledge?${qs}`, { headers });
    if (backendRes.ok) {
      const data = await backendRes.json();
      return NextResponse.json(data, { headers: corsHeaders });
    }
    throw new Error(`Backend ${backendRes.status}`);
  } catch {
    logger.warn('[TribeKnowledge] Backend unavailable, returning stub', { slug });

    let entries = STUB_KNOWLEDGE_ENTRIES[slug] ?? [];

    if (role && role !== 'all') {
      entries = entries.filter((e) => e.role === role);
    }
    if (type && type !== 'all') {
      entries = entries.filter((e) => e.type === type);
    }
    if (sort === 'cited') {
      entries = [...entries].sort((a, b) => b.cited - a.cited);
    } else if (sort === 'confirmed') {
      entries = [...entries].sort((a, b) => b.confirmedBy - a.confirmedBy);
    }
    // default: recent (mock data is already in reverse chronological order)

    return NextResponse.json(
      { success: true, data: entries },
      { headers: corsHeaders },
    );
  }
}
