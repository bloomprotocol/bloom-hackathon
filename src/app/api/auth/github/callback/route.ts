import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/auth/github/callback?code=...&state=...
 *
 * GitHub OAuth callback handler.
 * 1. Validate CSRF state (decode Base64, check nonce matches httpOnly cookie)
 * 2. Exchange code for access_token
 * 3. Fetch GitHub user profile (login)
 * 4. Send githubUsername + githubAccessToken to backend
 * 5. Clear github_oauth_state cookie
 * 6. Redirect to returnTo URL
 */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state');

  if (!code || !state) {
    return NextResponse.redirect(
      new URL('/builder?error=github_auth_failed', request.url),
    );
  }

  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      new URL('/builder?error=github_auth_failed', request.url),
    );
  }

  // 1. Validate CSRF state: decode Base64, check nonce matches cookie
  let returnTo = '/builder';
  try {
    const decoded = JSON.parse(Buffer.from(state, 'base64').toString());
    const cookieNonce = request.cookies.get('github_oauth_state')?.value;

    if (!cookieNonce || decoded.nonce !== cookieNonce) {
      console.error('[GitHub OAuth] CSRF nonce mismatch');
      return NextResponse.redirect(
        new URL('/builder?error=github_auth_failed', request.url),
      );
    }

    if (decoded.returnTo && decoded.returnTo.startsWith('/')) {
      returnTo = decoded.returnTo;
    }
  } catch {
    console.error('[GitHub OAuth] Invalid state token');
    return NextResponse.redirect(
      new URL('/builder?error=github_auth_failed', request.url),
    );
  }

  // 2. Exchange code for access_token
  let accessToken: string;
  try {
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    });

    const tokenData = await tokenRes.json();
    if (tokenData.error || !tokenData.access_token) {
      console.error('[GitHub OAuth] Token exchange failed:', tokenData.error);
      return NextResponse.redirect(
        new URL(`${returnTo}?error=github_auth_failed`, request.url),
      );
    }
    accessToken = tokenData.access_token;
  } catch (err) {
    console.error('[GitHub OAuth] Token exchange error:', err);
    return NextResponse.redirect(
      new URL(`${returnTo}?error=github_auth_failed`, request.url),
    );
  }

  // 3. Fetch GitHub user profile
  let githubUsername: string;
  try {
    const userRes = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!userRes.ok) {
      console.error('[GitHub OAuth] User fetch failed:', userRes.status);
      return NextResponse.redirect(
        new URL(`${returnTo}?error=github_auth_failed`, request.url),
      );
    }

    const userData = await userRes.json();
    githubUsername = userData.login;
  } catch (err) {
    console.error('[GitHub OAuth] User fetch error:', err);
    return NextResponse.redirect(
      new URL(`${returnTo}?error=github_auth_failed`, request.url),
    );
  }

  // 4. Get the user's Bloom JWT and call backend
  try {
    const authToken = request.cookies.get('auth-token')?.value;
    const BACKEND_API_URL = process.env.BACKEND_API_URL || 'https://api.bloomprotocol.ai';

    const backendRes = await fetch(`${BACKEND_API_URL}/users/me/github`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
      body: JSON.stringify({ githubUsername, githubAccessToken: accessToken }),
    });

    if (!backendRes.ok) {
      const errData = await backendRes.json().catch(() => ({}));
      console.error('[GitHub OAuth] Backend save failed:', backendRes.status, errData);
      // Continue anyway — user can retry
    } else {
      console.log(`[GitHub OAuth] Saved GitHub identity: @${githubUsername}`);
    }
  } catch (err) {
    console.error('[GitHub OAuth] Backend save error:', err);
    // Continue — non-blocking
  }

  // 5. Clear the github_oauth_state cookie and redirect
  const redirectUrl = new URL(returnTo, request.url);
  redirectUrl.searchParams.set('github_connected', githubUsername);

  const response = NextResponse.redirect(redirectUrl);

  // 6. Clear CSRF cookie
  response.cookies.set('github_oauth_state', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  return response;
}
