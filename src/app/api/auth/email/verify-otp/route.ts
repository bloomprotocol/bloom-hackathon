/**
 * Verify OTP Code API
 *
 * Verifies the 6-digit OTP code and authenticates the user.
 *
 * Security:
 * - Max 5 attempts per code
 * - Code expires after 10 minutes
 * - Code is one-time use (invalidated after success)
 * - Rate limiting enforced by backend
 *
 * Flow:
 * 1. User enters code
 * 2. Frontend calls this endpoint
 * 3. Backend verifies code
 * 4. Returns JWT token + user info
 * 5. Frontend sets auth cookies
 * 6. User is authenticated
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'https://api.bloomprotocol.ai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, code } = body;

    // Validation
    if (!email || !code) {
      return NextResponse.json(
        {
          success: false,
          message: 'Email and code are required',
        },
        { status: 400 }
      );
    }

    // Code format validation (6 digits)
    const codeRegex = /^\d{6}$/;
    if (!codeRegex.test(code)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid code format. Please enter a 6-digit code.',
        },
        { status: 400 }
      );
    }

    console.log(`[Verify OTP] Verifying code for: ${email}`);

    // Forward to backend API
    const response = await fetch(`${BACKEND_API_URL}/auth/email/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        code,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`[Verify OTP] Backend error:`, data);

      // Handle specific error cases
      if (response.status === 429) {
        return NextResponse.json(
          {
            success: false,
            message: 'Too many attempts. Please request a new code.',
          },
          { status: 429 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          message: data.message || 'Invalid or expired code',
        },
        { status: response.status }
      );
    }

    console.log(`[Verify OTP] Code verified successfully for ${email}`);

    // Extract auth data
    const { token: authToken, user } = data;

    if (!authToken || !user) {
      console.error('[Verify OTP] Missing token or user data');
      return NextResponse.json(
        {
          success: false,
          message: 'Authentication failed. Please try again.',
        },
        { status: 500 }
      );
    }

    // Set auth cookies (same as magic link flow)
    const cookieStore = await cookies();

    cookieStore.set('auth-token', authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    // Set user info cookies (for client-side access)
    cookieStore.set('SUB', String(user.sub), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    if (user.walletAddress) {
      cookieStore.set('WALLET_ADDRESS', user.walletAddress, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });
    }

    if (user.role) {
      cookieStore.set('ROLE', user.role, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });
    }

    // Set TIA (Time of Initial Authentication)
    cookieStore.set('TIA', new Date().toISOString(), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    console.log(`[Verify OTP] Auth cookies set for ${email}`);

    return NextResponse.json(
      {
        success: true,
        message: 'Welcome back! ✨',
        data: {
          user: {
            sub: user.sub,
            email: user.email,
            walletAddress: user.walletAddress,
            role: user.role,
          },
          redirectUrl: '/dashboard',
        },
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('[Verify OTP] Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Verification failed. Please try again.',
      },
      { status: 500 }
    );
  }
}
