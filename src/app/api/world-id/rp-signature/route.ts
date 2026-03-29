/**
 * POST /api/world-id/rp-signature
 *
 * Generates a signed RP context for IDKit proof requests.
 * The RP signing key MUST stay server-side — never expose to client.
 *
 * Docs: https://docs.world.org/agents/agent-kit/integrate
 */

import { signRequest } from '@worldcoin/idkit/signing';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const signingKey = process.env.WORLDCOIN_RP_SIGNING_KEY;
  const rpId = process.env.NEXT_PUBLIC_WORLDCOIN_RP_ID || process.env.WORLDCOIN_RP_ID;

  if (!signingKey || !rpId) {
    return NextResponse.json(
      { error: 'World ID RP credentials not configured' },
      { status: 500 },
    );
  }

  try {
    const { action } = await request.json();

    if (!action || typeof action !== 'string') {
      return NextResponse.json({ error: 'action is required' }, { status: 400 });
    }

    // Sign the request — generates nonce, timestamps, and ECDSA signature
    const { sig, nonce, createdAt, expiresAt } = signRequest(action, signingKey);

    return NextResponse.json({
      sig,
      nonce,
      rp_id: rpId,
      created_at: createdAt,
      expires_at: expiresAt,
    });
  } catch (error) {
    console.error('[World ID RP Signature] Error:', error);
    return NextResponse.json({ error: 'Failed to sign request' }, { status: 500 });
  }
}
