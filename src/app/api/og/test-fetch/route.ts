import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
  try {
    const BACKEND_API_URL = process.env.BACKEND_API_URL || 'https://api.bloomprotocol.ai';
    const apiUrl = `${BACKEND_API_URL}/x402/agent/716973675`;

    console.log('[Test] Attempting fetch:', apiUrl);

    const response = await fetch(apiUrl, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('[Test] Response status:', response.status);

    const text = await response.text();
    console.log('[Test] Response text length:', text.length);

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      responseLength: text.length,
      responsePreview: text.substring(0, 200),
      envVar: BACKEND_API_URL,
    });
  } catch (error) {
    console.error('[Test] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}
