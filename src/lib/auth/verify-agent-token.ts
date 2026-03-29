/**
 * Agent Token Verification (Frontend)
 *
 * Re-export from agent module for frontend use
 */

// This is a simplified version for frontend
// The actual implementation is in /agent/auth/verify-agent-token.ts
// For now, we'll create a minimal version

import jwt from 'jsonwebtoken';
import { verifyMessage } from 'viem';

export interface AgentTokenPayload {
  type: 'agent';
  version: '1.0';
  address: string;
  nonce: string;
  timestamp: number;
  expiresAt: number;
  scope: string[];
  signature?: string; // Optional for convenience tokens
  signedMessage?: string; // Optional for convenience tokens
  identity?: {
    personalityType: string;
    tagline: string;
    description: string;
    mainCategories: string[];
    subCategories: string[];
    confidence: number;
  };
}

export async function verifyAgentToken(
  token: string,
  options?: {
    redis?: any;
    skipNonceCheck?: boolean;
  }
): Promise<AgentTokenPayload> {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET environment variable is not configured');
  }

  // Layer 1: JWT Verification
  const decoded = jwt.verify(
    token,
    jwtSecret,
    {
      issuer: 'bloom-protocol',
      audience: 'bloom-dashboard',
      algorithms: ['HS256'],
    }
  ) as AgentTokenPayload;

  if (decoded.type !== 'agent') {
    throw new Error('Invalid token type');
  }

  // Layer 2: Signature Verification (skip for convenience tokens)
  if (decoded.signature && decoded.signedMessage) {
    await verifyAgentSignature(decoded);
  }

  // Layer 3: Nonce Check (if Redis available)
  if (!options?.skipNonceCheck && options?.redis) {
    await checkNonce(decoded.nonce, decoded.expiresAt, options.redis);
  }

  // Layer 4: Timestamp Validation
  validateTimestamp(decoded);

  // Layer 6: Scope Validation
  validateScope(decoded.scope);

  return decoded;
}

async function verifyAgentSignature(payload: AgentTokenPayload): Promise<void> {
  if (!payload.signature || !payload.signedMessage) {
    throw new Error('Signature and signedMessage required for verification');
  }

  const expectedMessage = [
    'Bloom Agent Authentication',
    `Address: ${payload.address}`,
    `Nonce: ${payload.nonce}`,
    `Timestamp: ${payload.timestamp}`,
    `Expires: ${payload.expiresAt}`,
    'Scope: read:identity,read:skills,read:wallet',
  ].join('\n');

  if (payload.signedMessage !== expectedMessage) {
    throw new Error('Message content mismatch');
  }

  try {
    const isValid = await verifyMessage({
      address: payload.address as `0x${string}`,
      message: payload.signedMessage,
      signature: payload.signature as `0x${string}`,
    });

    if (!isValid) {
      throw new Error('Invalid signature');
    }
  } catch (error) {
    throw error;
  }
}

async function checkNonce(
  nonce: string,
  expiresAt: number,
  redis: any
): Promise<void> {
  const key = `agent-nonce:${nonce}`;
  const exists = await redis.exists(key);

  if (exists) {
    throw new Error('Token already used');
  }

  const ttl = Math.floor((expiresAt - Date.now()) / 1000);
  if (ttl > 0) {
    await redis.setex(key, ttl, '1');
  }
}

function validateTimestamp(payload: AgentTokenPayload): void {
  const now = Date.now();

  if (now > payload.expiresAt) {
    throw new Error('Token expired');
  }

  const maxAge = 48 * 60 * 60 * 1000;
  if (now - payload.timestamp > maxAge) {
    throw new Error('Token too old');
  }

  const clockSkew = 5 * 60 * 1000;
  if (payload.timestamp > now + clockSkew) {
    throw new Error('Token timestamp in future');
  }
}

function validateScope(scopes: string[]): void {
  const validScopes = ['read:identity', 'read:skills', 'read:wallet'];

  for (const scope of scopes) {
    if (!validScopes.includes(scope)) {
      throw new Error(`Invalid scope: ${scope}`);
    }
  }

  const writeScopes = scopes.filter(s => s.startsWith('write:') || s.startsWith('tip:'));
  if (writeScopes.length > 0) {
    throw new Error('Write permissions not allowed');
  }
}

export async function checkAddressRateLimit(
  address: string,
  redis: any,
  options: { windowSeconds?: number; maxRequests?: number } = {}
): Promise<void> {
  const { windowSeconds = 3600, maxRequests = 50 } = options;
  const key = `rl:address:${address}`;

  const count = await redis.incr(key);

  if (count === 1) {
    await redis.expire(key, windowSeconds);
  }

  if (count > maxRequests) {
    throw new Error(`Rate limit exceeded`);
  }
}
