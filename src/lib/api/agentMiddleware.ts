/**
 * Shared middleware utilities for agent API endpoints.
 *
 * Provides: rate limiting, CORS, trust signals, field sanitization,
 * and backend forwarding with proper error propagation.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { logger } from '@/lib/utils/logger';

// ---------------------------------------------------------------------------
// CORS
// ---------------------------------------------------------------------------

export const AGENT_CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-agentkit',
} as const;

export function optionsResponse() {
  return NextResponse.json(null, { status: 204, headers: AGENT_CORS_HEADERS });
}

// ---------------------------------------------------------------------------
// Response helpers
// ---------------------------------------------------------------------------

export function badRequest(error: string) {
  return NextResponse.json(
    { success: false, error },
    { status: 400, headers: AGENT_CORS_HEADERS },
  );
}

export function unauthorized(error = 'Authentication required') {
  return NextResponse.json(
    { success: false, error },
    { status: 401, headers: AGENT_CORS_HEADERS },
  );
}

export function tooManyRequests(error: string) {
  return NextResponse.json(
    { success: false, error },
    { status: 429, headers: AGENT_CORS_HEADERS },
  );
}

// ---------------------------------------------------------------------------
// Rate limiter (in-memory, suitable for single-instance Railway deploys)
// ---------------------------------------------------------------------------

const MAX_MAP_ENTRIES = 10_000;

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

export function createRateLimiter(maxPerWindow: number, windowMs: number) {
  const map = new Map<string, RateLimitEntry>();

  // Periodic cleanup
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of map) {
      if (now > entry.resetAt) map.delete(key);
    }
  }, Math.min(windowMs / 6, 10 * 60 * 1000)).unref();

  return function check(key: string): boolean {
    // Prevent unbounded memory growth under attack
    if (map.size > MAX_MAP_ENTRIES) return false;

    const now = Date.now();
    const entry = map.get(key);

    if (!entry || now > entry.resetAt) {
      map.set(key, { count: 1, resetAt: now + windowMs });
      return true;
    }

    entry.count++;
    return entry.count <= maxPerWindow;
  };
}

/**
 * Derive a stable, collision-resistant rate limit key from the Bearer token.
 * Uses SHA-256 instead of prefix slicing (JWT headers share common prefixes).
 */
export function tokenRateLimitKey(authHeader: string): string {
  const token = authHeader.slice(7); // strip "Bearer "
  return createHash('sha256').update(token).digest('hex').slice(0, 16);
}

// ---------------------------------------------------------------------------
// Auth extraction
// ---------------------------------------------------------------------------

export function extractBearerToken(req: NextRequest): string | null {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  return authHeader;
}

// ---------------------------------------------------------------------------
// Trust signals (v1) — advisory flags, backend decides weight
// ---------------------------------------------------------------------------

export const TRUST_SIGNAL_VERSION = 1;

export interface TrustSignals {
  version: number;
  veryHighConfidence?: boolean;
  allHighConfidence?: boolean;
  unanimousVerdict?: string;
  lowReasoningVariance?: boolean;
  highRatingLowEffort?: boolean;
  allSameScore?: boolean;
}

interface RoleData {
  verdict?: string;
  confidence?: number;
  reasoning?: string;
}

export function computeEvaluateTrustSignals(body: {
  role?: string;
  confidence?: number;
  roles?: Record<string, RoleData>;
  rating?: number;
  discovery?: string;
}): TrustSignals {
  const signals: TrustSignals = { version: TRUST_SIGNAL_VERSION };

  // Single-role
  if (body.role && typeof body.confidence === 'number') {
    if (body.confidence > 95) signals.veryHighConfidence = true;
  }

  // Multi-role
  if (body.roles) {
    const entries = Object.values(body.roles);

    if (entries.every(r => typeof r.confidence === 'number' && r.confidence > 90)) {
      signals.allHighConfidence = true;
    }

    const verdicts = entries.map(r => r.verdict).filter(Boolean);
    if (new Set(verdicts).size === 1 && verdicts.length >= 3) {
      signals.unanimousVerdict = verdicts[0];
    }

    const lengths = entries.map(r => r.reasoning?.length ?? 0);
    const avgLen = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    if (avgLen > 0 && entries.length >= 3) {
      const maxDev = Math.max(...lengths.map(l => Math.abs(l - avgLen) / avgLen));
      if (maxDev < 0.15) signals.lowReasoningVariance = true;
    }

    // All roles with identical confidence (within 1 point) and same verdict
    const confidences = entries.map(r => r.confidence).filter((c): c is number => typeof c === 'number');
    if (confidences.length >= 3 && new Set(verdicts).size === 1) {
      const confRange = Math.max(...confidences) - Math.min(...confidences);
      if (confRange <= 1) signals.allSameScore = true;
    }
  }

  // Playbook feedback
  if (typeof body.rating === 'number' && typeof body.discovery === 'string') {
    if (body.rating >= 4 && body.discovery.length < 100) {
      signals.highRatingLowEffort = true;
    }
  }

  return signals;
}

export function computeReflectTrustSignals(body: {
  reflection?: {
    why?: string;
    why_weak?: string;
    tags?: string[];
  };
}): TrustSignals {
  const signals: TrustSignals = { version: TRUST_SIGNAL_VERSION };
  const r = body.reflection;
  if (!r) return signals;

  // Very short reflections despite passing minimum
  if (r.why && r.why_weak) {
    const totalLen = r.why.length + r.why_weak.length;
    if (totalLen < 120) signals.highRatingLowEffort = true;
  }

  return signals;
}

export function computeQuickRateTrustSignals(body: {
  score?: number;
  comment?: string;
}): TrustSignals {
  const signals: TrustSignals = { version: TRUST_SIGNAL_VERSION };

  // Perfect score with no comment
  if (body.score === 5 && (!body.comment || body.comment.length < 10)) {
    signals.highRatingLowEffort = true;
  }

  return signals;
}

// ---------------------------------------------------------------------------
// Backend forwarding — propagates 4xx from backend, 503 on unreachable
// ---------------------------------------------------------------------------

const BACKEND_API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';

export async function forwardOrFail(
  authHeader: string,
  body: Record<string, unknown>,
  backendPath: string,
  logTag: string,
): Promise<NextResponse> {
  try {
    const backendRes = await fetch(`${BACKEND_API_URL}/${backendPath}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: authHeader },
      body: JSON.stringify(body),
    });

    if (backendRes.ok) {
      const data = await backendRes.json();
      return NextResponse.json(data, { headers: AGENT_CORS_HEADERS });
    }

    // Propagate backend 4xx errors (validation, auth) — not a temporary outage
    if (backendRes.status >= 400 && backendRes.status < 500) {
      try {
        const errData = await backendRes.json();
        return NextResponse.json(errData, { status: backendRes.status, headers: AGENT_CORS_HEADERS });
      } catch {
        return NextResponse.json(
          { success: false, error: `Backend validation error (${backendRes.status})` },
          { status: backendRes.status, headers: AGENT_CORS_HEADERS },
        );
      }
    }

    throw new Error(`Backend returned ${backendRes.status}`);
  } catch (err) {
    logger.warn(`[${logTag}] Backend unavailable — returning 503`, {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { success: false, error: 'Service temporarily unavailable. Please retry.' },
      { status: 503, headers: AGENT_CORS_HEADERS },
    );
  }
}

// ---------------------------------------------------------------------------
// Numeric validation helpers
// ---------------------------------------------------------------------------

export function isValidInteger(val: unknown, min: number, max: number): val is number {
  return typeof val === 'number' && Number.isFinite(val) && Number.isInteger(val) && val >= min && val <= max;
}

export function isValidNumber(val: unknown, min: number, max: number): val is number {
  return typeof val === 'number' && Number.isFinite(val) && val >= min && val <= max;
}
