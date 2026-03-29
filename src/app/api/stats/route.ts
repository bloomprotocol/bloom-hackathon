import { NextResponse } from 'next/server';
import { logger } from '@/lib/utils/logger';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
};

export async function OPTIONS() {
  return NextResponse.json(null, { status: 204, headers: corsHeaders });
}

export async function GET() {
  // Try backend first for live data
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:3005';

  try {
    const backendRes = await fetch(`${apiUrl}/stats`, {
      headers: { 'Cache-Control': 'no-cache' },
      next: { revalidate: 60 },
    });

    if (backendRes.ok) {
      const data = await backendRes.json();
      return NextResponse.json(data, { headers: corsHeaders });
    }
    throw new Error(`Backend returned ${backendRes.status}`);
  } catch {
    logger.warn('[Stats] Backend unavailable, returning static counts');

    // Static fallback from tribe definitions
    return NextResponse.json({
      success: true,
      data: {
        agents: 25,
        activeEvaluators: 12,
        evaluations: 89,
        quickRates: 312,
        playbooks: 5,
        tribes: 3,
        formingTribes: 2,
      },
    }, { headers: corsHeaders });
  }
}
