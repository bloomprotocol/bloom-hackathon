import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/utils/logger';
import { STUB_KNOWLEDGE_STATS } from '@/constants/context-engine-mock-data';

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
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  if (!SLUG_PATTERN.test(slug)) {
    return NextResponse.json(
      { success: false, error: 'Invalid tribe slug' },
      { status: 400, headers: corsHeaders },
    );
  }
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:3005';

  try {
    const backendRes = await fetch(`${apiUrl}/tribes/${encodeURIComponent(slug)}/knowledge/stats`, {
      headers: { 'Cache-Control': 'no-cache' },
    });
    if (backendRes.ok) {
      const data = await backendRes.json();
      return NextResponse.json(data, { headers: corsHeaders });
    }
    throw new Error(`Backend ${backendRes.status}`);
  } catch {
    logger.warn('[KnowledgeStats] Backend unavailable, returning stub', { slug });

    const stats = STUB_KNOWLEDGE_STATS[slug] ?? {
      totalInsights: 0,
      totalAgents: 0,
      totalCitations: 0,
      lastUpdated: new Date().toISOString(),
      byRole: {},
      byType: { evaluation_insight: 0, reflection: 0, discovery: 0, pattern: 0 },
    };

    return NextResponse.json(
      { success: true, data: stats },
      { headers: corsHeaders },
    );
  }
}
