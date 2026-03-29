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
  computeReflectTrustSignals,
  forwardOrFail,
  AGENT_CORS_HEADERS,
} from '@/lib/api/agentMiddleware';

// All roles across tribes (Launch, Raise, Grow, Sanctuary + legacy Invest)
const VALID_ROLES = [
  'market_analyst', 'product_critic', 'growth_strategist', 'risk_auditor', 'mp',
  'historical_mentor', 'decision_advisor', 'strengths_coach', 'potential_guide',
  'content_strategist', 'seo_analyst', 'distribution_planner',
  'sector_scanner', 'fundamental_analyst', 'catalyst_hunter', 'chief_analyst',
  'company_researcher', 'financial_modeler', 'cap_table_analyst',
] as const;

const PLAYBOOK_ID_RE = /^[a-zA-Z0-9_-]{1,100}$/;
const MIN_WHY_LENGTH = 50;
const MIN_WHY_WEAK_LENGTH = 30;

const checkRate = createRateLimiter(10, 60 * 60 * 1000); // 10 per hour

export async function OPTIONS() {
  return optionsResponse();
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = extractBearerToken(req);
    if (!authHeader) return unauthorized();

    const key = tokenRateLimitKey(authHeader);
    if (!checkRate(key)) {
      logger.warn('[AgentReflect] Rate limit exceeded', { key: key.slice(0, 8) });
      return tooManyRequests('Rate limit exceeded. Maximum 10 reflections per hour.');
    }

    const body = await req.json();
    const { playbookId, reflection } = body;

    // Validate playbookId
    if (!playbookId || typeof playbookId !== 'string' || !PLAYBOOK_ID_RE.test(playbookId)) {
      return badRequest('playbookId must be an alphanumeric string (max 100 chars)');
    }

    if (!reflection || typeof reflection !== 'object') {
      return badRequest('reflection object is required');
    }

    // Validate reflection shape
    const { most_valuable_role, why, weakest_signal, why_weak, tags } = reflection;

    if (!most_valuable_role || !VALID_ROLES.includes(most_valuable_role)) {
      return badRequest(`most_valuable_role must be one of: ${VALID_ROLES.join(', ')}`);
    }

    if (!why || typeof why !== 'string') {
      return badRequest('why is required');
    }
    if (why.length < MIN_WHY_LENGTH) {
      return badRequest(`why must be at least ${MIN_WHY_LENGTH} characters`);
    }
    if (why.length > 2000) {
      return badRequest('why must be at most 2000 characters');
    }

    if (!weakest_signal || typeof weakest_signal !== 'string') {
      return badRequest('weakest_signal is required');
    }
    if (weakest_signal.length > 500) {
      return badRequest('weakest_signal must be at most 500 characters');
    }

    if (!why_weak || typeof why_weak !== 'string') {
      return badRequest('why_weak is required');
    }
    if (why_weak.length < MIN_WHY_WEAK_LENGTH) {
      return badRequest(`why_weak must be at least ${MIN_WHY_WEAK_LENGTH} characters`);
    }
    if (why_weak.length > 2000) {
      return badRequest('why_weak must be at most 2000 characters');
    }

    if (
      !Array.isArray(tags) ||
      tags.length === 0 ||
      tags.length > 20 ||
      !tags.every((t: unknown) => typeof t === 'string' && t.length > 0 && t.length <= 100)
    ) {
      return badRequest('tags must be 1-20 non-empty strings (max 100 chars each)');
    }

    const trustSignals = computeReflectTrustSignals({ reflection: { why, why_weak, tags } });

    // Allowlist fields
    const sanitized = {
      playbookId,
      tribeId: typeof body.tribeId === 'string' ? body.tribeId.slice(0, 100) : undefined,
      reflection: {
        most_valuable_role,
        why,
        weakest_signal,
        why_weak,
        tags: (tags as string[]).slice(0, 20),
      },
      _meta: { trustSignals },
    };

    logger.info('[AgentReflect] Reflection received', {
      playbookId,
      most_valuable_role,
      weakest_signal,
      tagCount: tags.length,
      signals: Object.keys(trustSignals).filter(k => k !== 'version'),
    });

    return forwardOrFail(authHeader, sanitized, 'agent/reflect', 'AgentReflect');
  } catch (error) {
    logger.error('[AgentReflect] Reflection failed', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { success: false, error: 'Reflection submission failed' },
      { status: 500, headers: AGENT_CORS_HEADERS },
    );
  }
}
