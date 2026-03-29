/**
 * Exchange Short Code for Agent Token
 *
 * POST /api/agent/auth/exchange
 * Body: { code: string }
 * Returns: { success: true, token: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import { codeStore } from '@/lib/auth/code-store';

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();

    if (!code) {
      return NextResponse.json(
        { success: false, error: 'Code required' },
        { status: 400 }
      );
    }

    // Get token from store (single-use - code is deleted)
    const token = await codeStore.get(code);

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid or expired code',
        },
        { status: 404 }
      );
    }

    console.log(`✅ Code exchanged: ${code}`);

    return NextResponse.json({
      success: true,
      token,
    });
  } catch (error) {
    console.error('Failed to exchange code:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to exchange code',
      },
      { status: 500 }
    );
  }
}
