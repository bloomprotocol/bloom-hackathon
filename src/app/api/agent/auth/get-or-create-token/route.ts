/**
 * Get or Create Agent Token
 *
 * POST /api/agent/auth/get-or-create-token
 * Body: { agentUserId: number }
 * Returns: { success: true, token: string }
 *
 * For permanent agent URLs - generates fresh token on each visit
 * while keeping the URL permanent.
 */

import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory rate limiter
const rateLimiter = new Map<number, { count: number; resetAt: number }>();

function checkRateLimit(agentUserId: number): boolean {
  const now = Date.now();
  const limit = rateLimiter.get(agentUserId);

  if (!limit || now > limit.resetAt) {
    // Reset or create new limit: 10 requests per hour
    rateLimiter.set(agentUserId, {
      count: 1,
      resetAt: now + 60 * 60 * 1000, // 1 hour
    });
    return true;
  }

  if (limit.count >= 10) {
    return false; // Rate limit exceeded
  }

  limit.count++;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const { agentUserId } = await req.json();

    if (!agentUserId || typeof agentUserId !== 'number') {
      return NextResponse.json(
        { success: false, error: 'Valid agentUserId required' },
        { status: 400 }
      );
    }

    // Rate limiting
    if (!checkRateLimit(agentUserId)) {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded. Try again later.' },
        { status: 429 }
      );
    }

    // Fetch agent data from backend
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:3005';
    const backendResponse = await fetch(`${apiUrl}/x402/agent/${agentUserId}`, {
      headers: {
        'Cache-Control': 'no-cache',
      },
    });

    if (!backendResponse.ok) {
      return NextResponse.json(
        { success: false, error: 'Agent not found' },
        { status: 404 }
      );
    }

    const backendData = await backendResponse.json();

    if (!backendData.success || !backendData.data) {
      return NextResponse.json(
        { success: false, error: 'Invalid agent data' },
        { status: 404 }
      );
    }

    const agent = backendData.data;

    // Generate fresh JWT token with agent data
    const jwt = require('jsonwebtoken');
    const crypto = require('crypto');

    const nonce = crypto.randomUUID();
    const timestamp = Date.now();
    const expiresAt = timestamp + 24 * 60 * 60 * 1000; // 24 hours

    // Note: This generates a token without wallet signature
    // For full security, the agent should sign the message with their wallet
    // But for convenience, we allow token generation based on backend data
    const payload = {
      type: 'agent',
      version: '1.0',
      address: agent.walletAddress,
      agentUserId: agent.agentUserId,
      identity: agent.identityData,
      nonce,
      timestamp,
      expiresAt,
      scope: ['read:identity', 'read:skills', 'read:wallet'],
      // Note: No signature - this is a convenience token
      // For higher security, require wallet signature
    };

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET not configured');
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const token = jwt.sign(payload, jwtSecret, {
      algorithm: 'HS256',
      expiresIn: '24h',
      issuer: 'bloom-protocol',
      audience: 'bloom-dashboard',
    });

    console.log(`✅ Token generated for agent ${agentUserId}`);

    return NextResponse.json({
      success: true,
      token,
    });
  } catch (error) {
    console.error('Failed to generate token:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate token',
      },
      { status: 500 }
    );
  }
}
