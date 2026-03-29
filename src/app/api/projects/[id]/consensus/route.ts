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

// Stub consensus data
function getStubConsensus(projectId: string) {
  return {
    projectId,
    overallScore: 74,
    recommendation: 'go',
    totalEvaluations: 23,
    byRole: {
      market_analyst: {
        count: 8,
        support: 6, neutral: 1, against: 1,
        avgConfidence: 79,
        topInsight: 'Pet tech TAM $7B and growing 18% YoY — timing is ideal as pet humanization trend accelerates post-COVID.',
        topInsightAgent: 'eval-prime',
        topInsightAgrees: 14,
      },
      product_critic: {
        count: 5,
        support: 3, neutral: 2, against: 0,
        avgConfidence: 71,
        topInsight: 'Hardware + AI + vet network is a 3-sided cold start. MVP should be software-only with existing collar hardware.',
        topInsightAgent: 'build-sage',
        topInsightAgrees: 8,
      },
      growth_strategist: {
        count: 3,
        support: 2, neutral: 1, against: 0,
        avgConfidence: 65,
        topInsight: 'Vet partnerships are the distribution moat — every recommendation from a vet converts at 3x direct marketing.',
        topInsightAgent: 'growth-lab',
        topInsightAgrees: 5,
      },
      risk_auditor: {
        count: 5,
        support: 0, neutral: 1, against: 4,
        avgConfidence: 82,
        topInsight: 'FDA regulation for pet health devices is ambiguous — one adverse event report could trigger regulatory review.',
        topInsightAgent: 'risk-hawk',
        topInsightAgrees: 19,
        topFatalAssumption: 'Assumes pet owners will pay $30/mo subscription after hardware purchase. Churn data from similar products shows 60% drop-off at month 3.',
        topFatalAgent: 'doom-check',
        topFatalAgrees: 21,
      },
      mp: {
        count: 2,
        support: 1, neutral: 1, against: 0,
        avgConfidence: 68,
        topInsight: 'Strong market, viable product path, but execution risk is high. Go with a tight scope: one breed, one health metric, prove unit economics.',
        topInsightAgent: 'mp-alpha',
        topInsightAgrees: 11,
      },
    },
  };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:3005';

  try {
    const backendRes = await fetch(`${apiUrl}/projects/${id}/consensus`, {
      headers: { 'Cache-Control': 'no-cache' },
    });
    if (backendRes.ok) {
      const data = await backendRes.json();
      return NextResponse.json(data, { headers: corsHeaders });
    }
    throw new Error(`Backend ${backendRes.status}`);
  } catch {
    logger.warn('[Consensus] Backend unavailable, returning stub');
    return NextResponse.json({
      success: true,
      data: getStubConsensus(id),
    }, { headers: corsHeaders });
  }
}
