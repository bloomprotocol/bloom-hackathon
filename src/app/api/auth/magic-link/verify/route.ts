import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/auth/magic-link/verify?token=xxx
 *
 * Verifies magic link token and logs user in
 * Flow:
 * 1. Verify token exists and not expired
 * 2. Get user data from token
 * 3. Create session (set auth cookies matching AuthContext)
 * 4. Return redirect URL to dashboard
 */

// Cookie options matching AuthContext expectations
const COOKIE_OPTIONS = {
  path: '/',
  maxAge: 30 * 24 * 60 * 60, // 30 days
  sameSite: 'lax' as const,
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Token is required' },
        { status: 400 }
      );
    }

    console.log(`🔍 Verifying magic link token: ${token.substring(0, 8)}...`);

    // Verify token with backend
    const BACKEND_API_URL = process.env.BACKEND_API_URL || 'https://api.bloomprotocol.ai';

    const backendResponse = await fetch(`${BACKEND_API_URL}/auth/magic-link/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json();
      throw new Error(errorData.message || 'Invalid or expired token');
    }

    const result = await backendResponse.json();

    // Backend returns HTTP 200 for all responses; errors indicated by success: false
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Invalid or expired token');
    }

    // Backend returns: { data: { token, user: { sub, email, role, name }, agentUserId } }
    const { user, agentUserId, token: jwtToken } = result.data;

    console.log(`✅ Magic link verified for user: ${user.email} (uid: ${user.sub})`);

    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      data: {
        user,
        agentUserId,
        redirectUrl: agentUserId ? `/agents/${agentUserId}?intent=save` : '/dashboard',
      },
    });

    // Set ALL auth cookies matching what AuthContext expects (COOKIE_KEYS in cookieService.ts)
    // These must be client-readable (NOT httpOnly) for AuthContext to read via getCookie()

    // 1. auth-token: JWT session token (AuthContext checks this)
    response.cookies.set('auth-token', jwtToken, {
      ...COOKIE_OPTIONS,
      secure: process.env.NODE_ENV === 'production',
    });

    // 2. sub: User ID (AuthContext requires this for isAuthenticated=true)
    response.cookies.set('sub', String(user.sub), {
      ...COOKIE_OPTIONS,
      secure: process.env.NODE_ENV === 'production',
    });

    // 3. role: User role
    response.cookies.set('role', user.role || 'USER', {
      ...COOKIE_OPTIONS,
      secure: process.env.NODE_ENV === 'production',
    });

    // 4. wallet-address: Empty for magic link users (no wallet)
    response.cookies.set('wallet-address', '', {
      ...COOKIE_OPTIONS,
      secure: process.env.NODE_ENV === 'production',
    });

    // 5. tia: Token issued at timestamp (for token refresh logic)
    response.cookies.set('tia', new Date().toISOString(), {
      ...COOKIE_OPTIONS,
      secure: process.env.NODE_ENV === 'production',
    });

    return response;
  } catch (error) {
    console.error('❌ Magic link verification error:', error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Token verification failed',
      },
      { status: 401 }
    );
  }
}
