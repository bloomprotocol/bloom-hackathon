/**
 * Magic Link Authentication
 *
 * Passwordless login via email magic link.
 *
 * Flow:
 * 1. User clicks magic link in email
 * 2. Verify token with backend
 * 3. Get user info and JWT token
 * 4. Set auth cookie
 * 5. Redirect to dashboard
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'https://api.bloomprotocol.ai';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await context.params;

    console.log(`[Magic Link] Verifying token...`);

    // Verify token with backend
    const response = await fetch(`${BACKEND_API_URL}/auth/magic-link/${token}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    // If backend returned an error
    if (!response.ok) {
      console.error(`[Magic Link] Backend error: ${response.status}`, data);

      // Redirect to login with error message
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('error', data.message || 'Invalid or expired link');
      return NextResponse.redirect(loginUrl);
    }

    console.log(`[Magic Link] Token verified successfully`);

    // Extract auth data
    const { token: authToken, user, returnUrl } = data;

    // Set auth cookie
    const cookieStore = await cookies();
    cookieStore.set('auth-token', authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    // Also set user info cookies (for client-side access)
    if (user) {
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
    }

    console.log(`[Magic Link] Auth cookies set, redirecting to ${returnUrl || '/dashboard'}`);

    // Redirect to dashboard or specified return URL
    const redirectUrl = new URL(returnUrl || '/dashboard', request.url);
    return NextResponse.redirect(redirectUrl);

  } catch (error) {
    console.error('[Magic Link] Error:', error);

    // Redirect to login with error
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('error', 'Authentication failed. Please try again.');
    return NextResponse.redirect(loginUrl);
  }
}
