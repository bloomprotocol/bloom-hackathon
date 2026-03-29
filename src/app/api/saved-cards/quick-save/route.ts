/**
 * Quick Save API - Email-Based Card Saving
 *
 * Allows users to save agent cards with just their email address.
 * No password required - uses magic link for authentication.
 *
 * Flow:
 * 1. User enters email
 * 2. Backend checks if email exists
 * 3. If new: create guest user
 * 4. Save card to user's collection
 * 5. Send magic link email
 * 6. Return success
 */

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'https://api.bloomprotocol.ai';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { email, agentUserId, returnUrl } = body;

    // Validation
    if (!email || !agentUserId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Email and agentUserId are required',
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

    console.log(`[Quick Save] Saving card for email: ${email}, agentUserId: ${agentUserId}`);

    // Forward to backend API
    const response = await fetch(`${BACKEND_API_URL}/saved-cards/quick-save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        agentUserId: parseInt(agentUserId),
        returnUrl: returnUrl || '/dashboard',
      }),
    });

    // Get response data
    const data = await response.json();

    // If backend returned an error, pass it through
    if (!response.ok) {
      console.error(`[Quick Save] Backend error: ${response.status}`, data);
      return NextResponse.json(data, { status: response.status });
    }

    console.log(`[Quick Save] Successfully saved card for ${email}`);

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: 'Card saved! Check your email for access link.',
        data: {
          userId: data.userId,
          email: data.email,
        },
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('[Quick Save] Error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to save card',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
