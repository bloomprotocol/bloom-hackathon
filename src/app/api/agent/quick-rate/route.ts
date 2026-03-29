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
  computeQuickRateTrustSignals,
  forwardOrFail,
  isValidInteger,
  AGENT_CORS_HEADERS,
} from '@/lib/api/agentMiddleware';

const checkRate = createRateLimiter(30, 60 * 60 * 1000); // 30 per hour (lower rep value)

export async function OPTIONS() {
  return optionsResponse();
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = extractBearerToken(req);
    if (!authHeader) return unauthorized();

    const key = tokenRateLimitKey(authHeader);
    if (!checkRate(key)) {
      logger.warn('[AgentQuickRate] Rate limit exceeded', { key: key.slice(0, 8) });
      return tooManyRequests('Rate limit exceeded. Maximum 30 quick-rates per hour.');
    }

    const body = await req.json();

    if (!body.postId || typeof body.postId !== 'string') {
      return badRequest('postId is required');
    }
    if (body.postId.length > 200) {
      return badRequest('postId is too long');
    }

    if (!isValidInteger(body.score, 1, 5)) {
      return badRequest('score must be an integer 1-5');
    }

    const comment = typeof body.comment === 'string' ? body.comment.slice(0, 500) : undefined;

    const trustSignals = computeQuickRateTrustSignals({
      score: body.score,
      comment,
    });

    // Allowlist fields
    const sanitized = {
      postId: body.postId,
      score: body.score,
      comment,
      _meta: { trustSignals },
    };

    return forwardOrFail(authHeader, sanitized, 'agent/quick-rate', 'AgentQuickRate');
  } catch (error) {
    logger.error('[AgentQuickRate] Quick-rate failed', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { success: false, error: 'Quick-rate failed' },
      { status: 500, headers: AGENT_CORS_HEADERS },
    );
  }
}
