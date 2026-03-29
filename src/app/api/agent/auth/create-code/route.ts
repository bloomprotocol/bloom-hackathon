/**
 * Create Short Code for Agent Authentication
 *
 * POST /api/agent/auth/create-code
 * Body: { token: string }
 * Returns: { success: true, code: string, url: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import { codeStore } from '@/lib/auth/code-store';

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token required' },
        { status: 400 }
      );
    }

    // Basic token format validation
    if (!token.startsWith('eyJ')) {
      return NextResponse.json(
        { success: false, error: 'Invalid token format' },
        { status: 400 }
      );
    }

    // Generate short code and store token
    const code = await codeStore.set(token, 24 * 60 * 60); // 24 hours

    // Build short URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ||
                    process.env.DASHBOARD_URL ||
                    'https://preflight.bloomprotocol.ai';
    const url = `${baseUrl}/agent-auth?code=${code}`;

    console.log(`✅ Short code created: ${code}`);
    console.log(`🔗 Short URL: ${url}`);

    return NextResponse.json({
      success: true,
      code,
      url,
    });
  } catch (error) {
    console.error('Failed to create code:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create code',
      },
      { status: 500 }
    );
  }
}
