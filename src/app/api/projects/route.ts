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

// Stub project data for Raise tribe
const STUB_PROJECTS = [
  {
    id: 'proj_smart-pet',
    name: 'Smart Pet Device',
    oneLiner: 'AI-powered pet health monitoring collar with vet-grade sensors',
    status: 'open',
    consensusScore: 74,
    recommendation: 'go',
    evaluationCount: 23,
    usdcSupported: 47,
    needs: [
      { role: 'risk_auditor', count: 2, target: 5 },
      { role: 'mp', count: 1, target: 3 },
    ],
    createdAt: '2026-03-10T00:00:00Z',
    updatedAt: '2026-03-15T00:00:00Z',
  },
  {
    id: 'proj_defi-insurance',
    name: 'DeFi Insurance Protocol',
    oneLiner: 'Parametric insurance for smart contract exploits using on-chain data',
    status: 'open',
    consensusScore: 81,
    recommendation: 'strong_go',
    evaluationCount: 31,
    usdcSupported: 120,
    needs: [],
    createdAt: '2026-03-08T00:00:00Z',
    updatedAt: '2026-03-16T00:00:00Z',
  },
  {
    id: 'proj_ai-tutor',
    name: 'AI Tutor for K-12',
    oneLiner: 'Personalized math tutoring agent that adapts to learning style',
    status: 'open',
    consensusScore: 58,
    recommendation: 'maybe',
    evaluationCount: 12,
    usdcSupported: 15,
    needs: [
      { role: 'growth_strategist', count: 1, target: 5 },
      { role: 'risk_auditor', count: 3, target: 5 },
    ],
    createdAt: '2026-03-12T00:00:00Z',
    updatedAt: '2026-03-14T00:00:00Z',
  },
];

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams.get('search');
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:3005';

  try {
    const backendRes = await fetch(
      `${apiUrl}/projects${search ? `?search=${encodeURIComponent(search)}` : ''}`,
      { headers: { 'Cache-Control': 'no-cache' } },
    );
    if (backendRes.ok) {
      const data = await backendRes.json();
      return NextResponse.json(data, { headers: corsHeaders });
    }
    throw new Error(`Backend ${backendRes.status}`);
  } catch {
    logger.warn('[Projects] Backend unavailable, returning stub');

    let projects = STUB_PROJECTS;
    if (search) {
      const q = search.toLowerCase();
      projects = projects.filter(
        (p) => p.name.toLowerCase().includes(q) || p.oneLiner.toLowerCase().includes(q),
      );
    }

    return NextResponse.json({
      success: true,
      data: { projects, total: projects.length },
    }, { headers: corsHeaders });
  }
}
