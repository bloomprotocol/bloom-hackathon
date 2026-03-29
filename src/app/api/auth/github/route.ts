import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * GET /api/auth/github?returnTo=/builder
 *
 * Initiates GitHub OAuth flow for builder identity verification.
 * Generates a CSRF state token (Base64-encoded JSON with nonce),
 * stores nonce in httpOnly cookie, then redirects to GitHub.
 */
export async function GET(request: NextRequest) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json(
      { success: false, message: 'GitHub OAuth not configured' },
      { status: 500 },
    );
  }

  // Validate returnTo is a relative path (prevent open redirect)
  const raw = request.nextUrl.searchParams.get('returnTo') || '/builder';
  const returnTo = raw.startsWith('/') ? raw : '/builder';

  // Generate CSRF nonce
  const nonce = crypto.randomUUID();

  // Base64-encode state payload: { returnTo, nonce }
  const statePayload = JSON.stringify({ returnTo, nonce });
  const state = Buffer.from(statePayload).toString('base64');

  // Build callback URL
  const origin = process.env.NEXT_PUBLIC_STAGING || 'https://bloomprotocol.ai';
  const callbackUrl = `${origin}/api/auth/github/callback`;

  // Build GitHub OAuth URL
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: callbackUrl,
    scope: 'read:org',
    state,
  });

  const response = NextResponse.redirect(
    `https://github.com/login/oauth/authorize?${params.toString()}`,
  );

  // Store nonce in httpOnly cookie for CSRF validation in callback
  response.cookies.set('github_oauth_state', nonce, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 10, // 10 minutes
  });

  return response;
}
