import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * POST /api/auth/magic-link
 *
 * Creates a magic link for email-based authentication
 * Flow:
 * 1. Generate secure token
 * 2. Store token + email + agentUserId in database (or temp storage)
 * 3. Send email with magic link
 * 4. Return success
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, agentUserId } = body;

    // Validation
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'Valid email is required' },
        { status: 400 }
      );
    }

    if (!agentUserId) {
      return NextResponse.json(
        { success: false, message: 'Agent ID is required' },
        { status: 400 }
      );
    }

    console.log(`🔐 Generating magic link for: ${email}, agentUserId: ${agentUserId}`);

    // Generate secure token (32 bytes = 64 hex characters)
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes (matches backend)

    // Store token in database
    // TODO: Implement database storage
    // For now, we'll use the backend API to create the magic link
    const BACKEND_API_URL = process.env.BACKEND_API_URL || 'https://api.bloomprotocol.ai';

    const backendResponse = await fetch(`${BACKEND_API_URL}/auth/magic-link`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        agentUserId: String(agentUserId),
        token,
        expiresAt: expiresAt.toISOString(),
      }),
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json();
      throw new Error(errorData.message || 'Failed to create magic link');
    }

    const result = await backendResponse.json();

    // Backend returns HTTP 200 for all responses; errors indicated by success: false
    if (!result.success) {
      throw new Error(result.error || 'Failed to create magic link');
    }

    console.log(`✅ Magic link created successfully for ${email}`);

    return NextResponse.json({
      success: true,
      message: 'Magic link sent! Check your email.',
      data: {
        email,
        tokenSent: true,
      },
    });
  } catch (error) {
    console.error('❌ Magic link creation error:', error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create magic link',
      },
      { status: 500 }
    );
  }
}
