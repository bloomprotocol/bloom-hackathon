/**
 * POST /api/world-id/verify
 *
 * Forwards the IDKit proof to World's verification API.
 * Returns the verification result to the client.
 *
 * Docs: https://docs.world.org/agents/agent-kit/integrate
 */

import { NextRequest, NextResponse } from 'next/server';

const WORLD_VERIFY_API = 'https://developer.world.org/api/v4/verify';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { rp_id, proof } = body;

    if (!rp_id || !proof) {
      return NextResponse.json(
        { error: 'rp_id and proof are required' },
        { status: 400 },
      );
    }

    // Forward the proof payload unchanged to World's verification API
    const response = await fetch(`${WORLD_VERIFY_API}/${rp_id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(proof),
    });

    const data = await response.json();

    // Also notify our backend about the verification
    if (response.ok) {
      const backendUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';
      fetch(`${backendUrl}/api/playbook/world-id/link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          worldIdVerified: true,
          nullifier: data.responses?.[0]?.nullifier,
        }),
      }).catch((err) => {
        console.warn('[World ID Verify] Backend notification failed:', err.message);
      });
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[World ID Verify] Error:', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
