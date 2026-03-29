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
  computeEvaluateTrustSignals,
  forwardOrFail,
  isValidInteger,
  isValidNumber,
  AGENT_CORS_HEADERS,
} from '@/lib/api/agentMiddleware';

const VALID_ROLES = ['market_analyst', 'product_critic', 'growth_strategist', 'risk_auditor', 'mp'] as const;
const VALID_VERDICTS = ['support', 'neutral', 'against'] as const;
const PLAYBOOK_ID_RE = /^[a-zA-Z0-9_-]{1,100}$/;

const MIN_REASONING_LENGTH = 100;
const MIN_DISCOVERY_LENGTH = 50;
const MAX_REASONING_LENGTH = 5000;
const MAX_DISCOVERY_LENGTH = 2000;

const checkRate = createRateLimiter(10, 60 * 60 * 1000); // 10 per hour

// Validate a single role's evaluation data
function validateRoleData(
  data: Record<string, unknown>,
  prefix: string,
): string | null {
  if (!data || typeof data !== 'object') return `${prefix}: role data must be an object`;

  if (!VALID_VERDICTS.includes(data.verdict as typeof VALID_VERDICTS[number])) {
    return `${prefix}: verdict must be support | neutral | against`;
  }
  if (!isValidNumber(data.confidence, 0, 100)) {
    return `${prefix}: confidence must be a finite number 0-100`;
  }
  if (!data.reasoning || typeof data.reasoning !== 'string') {
    return `${prefix}: reasoning is required`;
  }
  if (data.reasoning.length < MIN_REASONING_LENGTH) {
    return `${prefix}: reasoning must be at least ${MIN_REASONING_LENGTH} characters`;
  }
  if (data.reasoning.length > MAX_REASONING_LENGTH) {
    return `${prefix}: reasoning must be at most ${MAX_REASONING_LENGTH} characters`;
  }
  return null;
}

export async function OPTIONS() {
  return optionsResponse();
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = extractBearerToken(req);
    if (!authHeader) return unauthorized();

    const key = tokenRateLimitKey(authHeader);
    if (!checkRate(key)) {
      logger.warn('[AgentEvaluate] Rate limit exceeded', { key: key.slice(0, 8) });
      return tooManyRequests('Rate limit exceeded. Maximum 10 evaluations per hour.');
    }

    const body = await req.json();

    // Detect mode
    const isSingleRole = body.role && !body.roles;
    const isMultiRole = body.roles && typeof body.roles === 'object';
    const isPlaybookFeedback = body.playbookId && body.rating != null && !body.role && !body.roles;

    // --- Playbook feedback ---
    if (isPlaybookFeedback) {
      if (typeof body.playbookId !== 'string' || !PLAYBOOK_ID_RE.test(body.playbookId)) {
        return badRequest('playbookId must be an alphanumeric string (max 100 chars)');
      }
      if (!isValidInteger(body.rating, 1, 5)) {
        return badRequest('rating must be an integer 1-5');
      }
      if (!body.discovery || typeof body.discovery !== 'string') {
        return badRequest('discovery is required');
      }
      if (body.discovery.length < MIN_DISCOVERY_LENGTH) {
        return badRequest(`discovery must be at least ${MIN_DISCOVERY_LENGTH} characters`);
      }
      if (body.discovery.length > MAX_DISCOVERY_LENGTH) {
        return badRequest(`discovery must be at most ${MAX_DISCOVERY_LENGTH} characters`);
      }

      const trustSignals = computeEvaluateTrustSignals({
        rating: body.rating,
        discovery: body.discovery,
      });

      // Allowlist fields — prevent mass assignment
      const sanitized = {
        playbookId: body.playbookId,
        tribeId: typeof body.tribeId === 'string' ? body.tribeId.slice(0, 100) : undefined,
        rating: body.rating,
        discovery: body.discovery,
        methodology: typeof body.methodology === 'string' ? body.methodology.slice(0, 2000) : undefined,
        sampleSize: typeof body.sampleSize === 'string' ? body.sampleSize.slice(0, 200) : undefined,
        timeframe: typeof body.timeframe === 'string' ? body.timeframe.slice(0, 200) : undefined,
        _meta: { trustSignals },
      };

      return forwardOrFail(authHeader, sanitized, 'agent/evaluate', 'AgentEvaluate');
    }

    // --- Single-role evaluation ---
    if (isSingleRole) {
      if (!VALID_ROLES.includes(body.role)) {
        return badRequest(`role must be one of: ${VALID_ROLES.join(', ')}`);
      }
      if (!body.projectId || typeof body.projectId !== 'string' || body.projectId.length > 200) {
        return badRequest('projectId is required (max 200 chars)');
      }

      const roleError = validateRoleData(body, body.role);
      if (roleError) return badRequest(roleError);

      const trustSignals = computeEvaluateTrustSignals({
        role: body.role,
        confidence: body.confidence,
      });

      const sanitized = {
        playbookId: typeof body.playbookId === 'string' ? body.playbookId : undefined,
        projectId: body.projectId,
        role: body.role,
        verdict: body.verdict,
        confidence: body.confidence,
        reasoning: body.reasoning,
        keyInsight: typeof body.keyInsight === 'string' ? body.keyInsight.slice(0, 1000) : undefined,
        limitations: typeof body.limitations === 'string' ? body.limitations.slice(0, 1000) : undefined,
        fatalAssumption: typeof body.fatalAssumption === 'string' ? body.fatalAssumption.slice(0, 1000) : undefined,
        killScenario: typeof body.killScenario === 'string' ? body.killScenario.slice(0, 1000) : undefined,
        playbookVersion: typeof body.playbookVersion === 'string' ? body.playbookVersion.slice(0, 50) : undefined,
        playbookRating: isValidInteger(body.playbookRating, 1, 5) ? body.playbookRating : undefined,
        _meta: { trustSignals },
      };

      logger.info('[AgentEvaluate] Single-role', {
        role: body.role,
        signals: Object.keys(trustSignals).filter(k => k !== 'version'),
      });

      return forwardOrFail(authHeader, sanitized, 'agent/evaluate', 'AgentEvaluate');
    }

    // --- Multi-role evaluation ---
    if (isMultiRole) {
      if (!body.projectId || typeof body.projectId !== 'string' || body.projectId.length > 200) {
        return badRequest('projectId is required (max 200 chars)');
      }

      const roles = body.roles as Record<string, Record<string, unknown>>;
      const roleNames = Object.keys(roles);

      if (roleNames.length < 2 || roleNames.length > VALID_ROLES.length) {
        return badRequest(`Multi-role evaluation requires 2-${VALID_ROLES.length} roles`);
      }

      const sanitizedRoles: Record<string, Record<string, unknown>> = {};

      for (const roleName of roleNames) {
        if (!VALID_ROLES.includes(roleName as typeof VALID_ROLES[number])) {
          return badRequest(`Invalid role name. Must be one of: ${VALID_ROLES.join(', ')}`);
        }
        const roleError = validateRoleData(roles[roleName], `roles.${roleName}`);
        if (roleError) return badRequest(roleError);

        // Allowlist per-role fields
        const r = roles[roleName];
        sanitizedRoles[roleName] = {
          verdict: r.verdict,
          confidence: r.confidence,
          reasoning: r.reasoning,
          keyInsight: typeof r.keyInsight === 'string' ? (r.keyInsight as string).slice(0, 1000) : undefined,
          limitations: typeof r.limitations === 'string' ? (r.limitations as string).slice(0, 1000) : undefined,
          fatalAssumption: typeof r.fatalAssumption === 'string' ? (r.fatalAssumption as string).slice(0, 1000) : undefined,
          killScenario: typeof r.killScenario === 'string' ? (r.killScenario as string).slice(0, 1000) : undefined,
        };
      }

      const trustSignals = computeEvaluateTrustSignals({ roles: sanitizedRoles as Record<string, { verdict?: string; confidence?: number; reasoning?: string }> });

      const sanitized = {
        playbookId: typeof body.playbookId === 'string' ? body.playbookId : undefined,
        projectId: body.projectId,
        projectName: typeof body.projectName === 'string' ? body.projectName.slice(0, 200) : undefined,
        stage: typeof body.stage === 'string' ? body.stage.slice(0, 50) : undefined,
        roles: sanitizedRoles,
        _meta: { trustSignals },
      };

      logger.info('[AgentEvaluate] Multi-role', {
        roleCount: roleNames.length,
        signals: Object.keys(trustSignals).filter(k => k !== 'version'),
      });

      return forwardOrFail(authHeader, sanitized, 'agent/evaluate', 'AgentEvaluate');
    }

    return badRequest('Invalid request. Provide role (single), roles (multi), or playbookId + rating (feedback).');
  } catch (error) {
    logger.error('[AgentEvaluate] Evaluation failed', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { success: false, error: 'Evaluation submission failed' },
      { status: 500, headers: AGENT_CORS_HEADERS },
    );
  }
}
