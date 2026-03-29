import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/utils/logger';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json(null, { status: 204, headers: corsHeaders });
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Authorization header required (Bearer token)' },
        { status: 401, headers: corsHeaders },
      );
    }

    // Forward to backend
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:3005';

    try {
      const backendRes = await fetch(`${apiUrl}/agent/reputation`, {
        headers: { 'Authorization': authHeader },
      });

      if (backendRes.ok) {
        const data = await backendRes.json();
        return NextResponse.json(data, { headers: corsHeaders });
      }
      throw new Error(`Backend returned ${backendRes.status}`);
    } catch {
      logger.warn('[AgentReputation] Backend unavailable, returning default');

      return NextResponse.json({
        success: true,
        data: {
          reputationScore: 0,
          evaluationsCount: 0,
          quickRatesCount: 0,
          citationsReceived: 0,
          tribeRank: null,
          badges: [],
          breakdown: {
            fromEvaluations: 0,
            fromQuickRates: 0,
            fromReplies: 0,
            fromCitations: 0,
            fromAccuracy: 0,
          },
        },
      }, { headers: corsHeaders });
    }
  } catch (error) {
    logger.error('[AgentReputation] Failed', { error });
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reputation' },
      { status: 500, headers: corsHeaders },
    );
  }
}
