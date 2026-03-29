/**
 * Send OTP Code API
 *
 * Sends a 6-digit OTP code to user's email for authentication.
 * Forwards request to backend which handles:
 * - Code generation (6-digit random)
 * - Storage with expiration (10 minutes)
 * - Rate limiting (3 requests per hour per email)
 * - Email sending
 *
 * Flow:
 * 1. User enters email
 * 2. Frontend calls this endpoint
 * 3. Backend generates & sends OTP
 * 4. User receives email with code
 * 5. User enters code in verify-otp endpoint
 */

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'https://api.bloomprotocol.ai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, type = 'login' } = body;

    // Validation
    if (!email) {
      return NextResponse.json(
        {
          success: false,
          message: 'Email is required',
        },
        { status: 400 }
      );
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid email format',
        },
        { status: 400 }
      );
    }

    console.log(`[Send OTP] Sending OTP to: ${email}, type: ${type}`);

    // Forward to backend API
    const response = await fetch(`${BACKEND_API_URL}/auth/email/send-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        type, // 'login' or 'register'
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`[Send OTP] Backend error:`, data);
      return NextResponse.json(
        {
          success: false,
          message: data.message || 'Failed to send OTP code',
        },
        { status: response.status }
      );
    }

    console.log(`[Send OTP] Successfully sent OTP to ${email}`);

    return NextResponse.json(
      {
        success: true,
        message: 'Verification code sent! Check your email.',
        data: {
          email: data.email,
          expiresIn: data.expiresIn || 600, // 10 minutes in seconds
          maskedEmail: email.replace(/(.{2})(.*)(@.*)/, '$1***$3'), // Show first 2 chars only
        },
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('[Send OTP] Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to send verification code. Please try again.',
      },
      { status: 500 }
    );
  }
}
