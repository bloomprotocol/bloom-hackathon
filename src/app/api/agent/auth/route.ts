/**
 * Agent Authentication API
 *
 * Verifies Agent token and returns agent data
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAgentToken } from '@/lib/auth/verify-agent-token';
import { logger } from '@/lib/utils/logger';

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token required' },
        { status: 400 }
      );
    }

    // Verify token (7 security layers)
    const decoded = await verifyAgentToken(token, {
      skipNonceCheck: true, // Skip Redis nonce check for now (can enable in production)
    });

    // ⭐ HYBRID APPROACH: Try backend first, fallback to token
    // This ensures both agents with and without CDP registration work
    let agentData;

    try {
      // 1️⃣ Try to fetch from backend (may have updated data)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:3005';
      const backendResponse = await fetch(`${apiUrl}/x402/agent-by-address/${decoded.address}`, {
        headers: {
          'Cache-Control': 'no-cache',
        },
      });

      if (backendResponse.ok) {
        const backendData = await backendResponse.json();

        if (backendData.success && backendData.data) {
          logger.debug('[AgentAuth] Agent data loaded from backend');

          // Use backend data (most up-to-date)
          agentData = {
            address: backendData.data.walletAddress,
            identity: backendData.data.identityData,
            recommendations: [], // Fetched separately by dashboard page
            wallet: {
              address: backendData.data.walletAddress,
              network: backendData.data.network,
              x402Endpoint: backendData.data.x402Endpoint,
              balance: '0',
            },
            agentUserId: backendData.data.agentUserId,
            createdAt: new Date(backendData.data.createdAt).getTime(),
            updatedAt: new Date(backendData.data.updatedAt).getTime(),
          };
        } else {
          throw new Error('Backend returned invalid data');
        }
      } else {
        throw new Error(`Backend returned ${backendResponse.status}`);
      }
    } catch (backendError) {
      // 2️⃣ Backend failed → Fallback to token identity data
      logger.debug('[AgentAuth] Backend unavailable, using token identity');

      // Extract agent data from token payload
      const identityFromToken = (decoded as any).identity;

      agentData = {
        address: decoded.address,
        agentUserId: (decoded as any).agentUserId, // Include agentUserId if available in token
        identity: {
          personalityType: identityFromToken?.personalityType || 'The Explorer',
          tagline: identityFromToken?.tagline || 'Discovering new possibilities',
          description: identityFromToken?.description || 'You are an agent exploring the Web3 ecosystem.',
          mainCategories: identityFromToken?.mainCategories || ['Web3', 'AI', 'Automation'],
          subCategories: identityFromToken?.subCategories || ['Tools', 'Protocols', 'Infrastructure'],
          confidence: identityFromToken?.confidence || 70,
          mode: (identityFromToken?.mode || 'manual') as 'data' | 'manual',
        },
        recommendations: [],
        wallet: {
          address: decoded.address,
          network: 'base-sepolia',
          x402Endpoint: `https://x402.bloomprotocol.ai/base-sepolia/${decoded.address}`,
          balance: '0',
        },
        createdAt: decoded.timestamp,
        updatedAt: decoded.timestamp,
      };
    }

    // Return success
    const response = NextResponse.json({
      success: true,
      agentData,
    });

    // Set session cookie
    response.cookies.set('agent_session', decoded.address, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/',
    });

    return response;
  } catch (error) {
    logger.error('[AgentAuth] Authentication failed', { error });

    return NextResponse.json(
      { success: false, error: 'Authentication failed' },
      { status: 401 }
    );
  }
}
