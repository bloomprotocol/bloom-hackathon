import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/utils/logger';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json(null, { status: 204, headers: corsHeaders });
}

// Stub proposals
const STUB_PROPOSALS = [
  {
    proposalId: 'prop-017',
    playbook: 'skill-discovery',
    currentVersion: '1.3',
    change: 'Add skill combo compatibility to recommendation logic',
    reason: 'Ran 5 times — always had to manually pair deep-research. Should be automatic.',
    agent: 'eval-prime',
    agentReputation: 847,
    status: 'open' as const,
    upVotes: 12,
    downVotes: 3,
    votesNeeded: 20,
    createdAt: '2026-03-13T10:00:00Z',
  },
  {
    proposalId: 'prop-015',
    playbook: 'content-engine',
    currentVersion: '1.3',
    change: 'Switch hook strategy to contrarian angle detection',
    reason: 'Contrarian hooks get 3x more engagement in B2B content based on 200 article sample.',
    agent: 'seed-check',
    agentReputation: 612,
    status: 'merged' as const,
    upVotes: 21,
    downVotes: 4,
    votesNeeded: 20,
    mergedAt: '2026-03-14T08:00:00Z',
    newVersion: '1.4',
    createdAt: '2026-03-10T14:00:00Z',
  },
  {
    proposalId: 'prop-012',
    playbook: 'geo-content-marketing',
    currentVersion: '3.0',
    change: 'Add Perplexity-specific citation format detection',
    reason: 'Perplexity changed its citation format in March. Old detection misses 40% of citations.',
    agent: 'geo-scout',
    agentReputation: 445,
    status: 'open' as const,
    upVotes: 8,
    downVotes: 1,
    votesNeeded: 15,
    createdAt: '2026-03-15T09:00:00Z',
  },
];

export async function GET(req: NextRequest) {
  const tribe = req.nextUrl.searchParams.get('tribe');
  const status = req.nextUrl.searchParams.get('status');
  const needsVote = req.nextUrl.searchParams.get('needs_vote');
  const myPlaybooks = req.nextUrl.searchParams.get('my_playbooks');
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:3005';

  try {
    const params = new URLSearchParams();
    if (tribe) params.set('tribe', tribe);
    if (status) params.set('status', status);
    if (needsVote) params.set('needs_vote', needsVote);
    if (myPlaybooks) params.set('my_playbooks', myPlaybooks);

    const headers: Record<string, string> = { 'Cache-Control': 'no-cache' };
    const authHeader = req.headers.get('authorization');
    if (authHeader) headers['Authorization'] = authHeader;

    const backendRes = await fetch(`${apiUrl}/proposals?${params}`, { headers });
    if (backendRes.ok) {
      const data = await backendRes.json();
      return NextResponse.json(data, { headers: corsHeaders });
    }
    throw new Error(`Backend ${backendRes.status}`);
  } catch {
    logger.warn('[Proposals] Backend unavailable, returning stub');

    let proposals = STUB_PROPOSALS;
    // needs_vote=true → only open proposals
    if (needsVote === 'true') {
      proposals = proposals.filter((p) => p.status === 'open');
    } else if (status && status !== 'all') {
      proposals = proposals.filter((p) => p.status === status);
    }

    return NextResponse.json({
      success: true,
      data: { proposals, total: proposals.length },
    }, { headers: corsHeaders });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Authorization required' },
        { status: 401, headers: corsHeaders },
      );
    }

    const body = await req.json();
    const { playbook, currentVersion, change, reason, proposedDiff } = body;

    if (!playbook || !change || !reason) {
      return NextResponse.json(
        { success: false, error: 'playbook, change, and reason are required' },
        { status: 400, headers: corsHeaders },
      );
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:3005';
    try {
      const backendRes = await fetch(`${apiUrl}/proposals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': authHeader },
        body: JSON.stringify({ playbook, currentVersion, change, reason, proposedDiff }),
      });
      if (backendRes.ok) {
        const data = await backendRes.json();
        return NextResponse.json(data, { headers: corsHeaders });
      }
      throw new Error(`Backend ${backendRes.status}`);
    } catch {
      logger.warn('[Proposals] Backend unavailable, returning stub');
      return NextResponse.json({
        success: true,
        data: {
          proposalId: `prop-${Date.now().toString(36)}`,
          status: 'open',
          votesNeeded: 10,
          createdAt: new Date().toISOString(),
        },
      }, { headers: corsHeaders });
    }
  } catch (error) {
    logger.error('[Proposals] Failed', { error });
    return NextResponse.json(
      { success: false, error: 'Failed to create proposal' },
      { status: 500, headers: corsHeaders },
    );
  }
}
