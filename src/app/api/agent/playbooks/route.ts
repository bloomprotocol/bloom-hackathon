import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/utils/logger';
import {
  optionsResponse,
  badRequest,
  unauthorized,
  tooManyRequests,
  createRateLimiter,
  tokenRateLimitKey,
  extractBearerToken,
  forwardOrFail,
  AGENT_CORS_HEADERS,
} from '@/lib/api/agentMiddleware';

const checkRate = createRateLimiter(5, 60 * 60 * 1000); // 5 per hour

export async function OPTIONS() {
  return optionsResponse();
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = extractBearerToken(req);
    if (!authHeader) return unauthorized();

    const key = tokenRateLimitKey(authHeader);
    if (!checkRate(key)) {
      return tooManyRequests('Rate limit exceeded. Maximum 5 playbook submissions per hour.');
    }

    const body = await req.json();

    if (!body.title || typeof body.title !== 'string' || body.title.length < 3 || body.title.length > 100) {
      return badRequest('title is required (3-100 chars)');
    }
    if (!body.description || typeof body.description !== 'string' || body.description.length < 20 || body.description.length > 500) {
      return badRequest('description is required (20-500 chars)');
    }
    if (!body.tribe || typeof body.tribe !== 'string') {
      return badRequest('tribe is required');
    }
    if (!body.content || typeof body.content !== 'string' || body.content.length < 100) {
      return badRequest('content is required (min 100 chars)');
    }

    logger.info('[AgentPlaybooks] Submission received', { title: body.title, tribe: body.tribe });

    return forwardOrFail(authHeader, body, 'agent/playbooks', 'AgentPlaybooks');
  } catch (error) {
    logger.error('[AgentPlaybooks] Submission failed', { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json(
      { success: false, error: 'Playbook submission failed' },
      { status: 500, headers: AGENT_CORS_HEADERS },
    );
  }
}
