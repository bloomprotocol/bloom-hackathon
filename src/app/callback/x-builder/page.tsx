'use client';

import { useEffect } from 'react';
import { apiPost } from '@/lib/api/apiConfig';
import { setCookie, COOKIE_KEYS } from '@/lib/utils/storage/cookieService';
import { logger } from '@/lib/utils/logger';

// X Builder 登入響應類型
interface XBuilderLoginResponse {
  success: boolean;
  data?: {
    isBuilder: boolean;
    token?: string;
    user?: {
      sub: string;
      walletAddress: string;
      role: string;
      isNewUser: boolean;
    };
    xProfile: {
      xUserId: string;
      xUsername: string;
      xDisplayName: string;
      xProfileImageUrl?: string;
    };
    missions?: unknown[];
  };
  error?: string;
}

/**
 * X Builder OAuth Callback Page
 *
 * This page handles the OAuth redirect from X (Twitter) for builder login.
 * Unlike /callback/x (which requires existing auth), this endpoint:
 * - Works for unauthenticated users
 * - Creates new users if X account is not linked
 * - Logs in existing users if X account is already linked
 * - Only succeeds if the X account has missions (is a builder)
 *
 * Flow:
 * 1. X redirects here with: ?code=xxx&state=yyy
 * 2. Validate state matches sessionStorage (CSRF protection)
 * 3. Get code_verifier from sessionStorage
 * 4. Call backend API: POST /auth/social/x/builder-login
 * 5. If success: Store JWT token in cookies
 * 6. Store result in sessionStorage for /builder page
 * 7. Redirect to /builder
 */
export default function XBuilderCallbackPage() {
  useEffect(() => {
    async function handleCallback() {
      try {
        // Step 1: Extract code and state from URL
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const state = params.get('state');

        if (!code) {
          throw new Error('No authorization code received from X');
        }

        // Step 2: Validate state (CSRF protection)
        const savedState = sessionStorage.getItem('x_oauth_state');
        if (!state || state !== savedState) {
          throw new Error('Security validation failed - state mismatch');
        }

        // Step 3: Get code verifier from sessionStorage
        const codeVerifier = sessionStorage.getItem('x_code_verifier');
        if (!codeVerifier) {
          throw new Error('OAuth state missing - code verifier not found');
        }

        // Step 4: Call backend builder-login API (no JWT required)
        const redirectUri = `${window.location.origin}/callback/x-builder`;
        const response = await apiPost<XBuilderLoginResponse>('/auth/social/x/builder-login', {
          code,
          codeVerifier,
          redirectUri,
        });

        // Step 5: Handle response
        if (response.success && response.data?.isBuilder) {
          // Success: has missions, got token - store auth data
          setCookie(COOKIE_KEYS.AUTH_TOKEN, response.data.token!);
          setCookie(COOKIE_KEYS.SUB, response.data.user!.sub);
          setCookie(
            COOKIE_KEYS.WALLET_ADDRESS,
            response.data.user!.walletAddress || ''
          );
          setCookie(COOKIE_KEYS.ROLE, response.data.user!.role);
          setCookie(COOKIE_KEYS.TIA, new Date().toISOString());

          // Store builder data for /builder page to pick up
          sessionStorage.setItem(
            'builder_login_success',
            JSON.stringify({
              missions: response.data.missions,
              xProfile: response.data.xProfile,
              isNewUser: response.data.user!.isNewUser,
            })
          );

          logger.info('[X Builder OAuth] Builder login successful', { xUsername: response.data?.xProfile?.xUsername });
        } else if (response.success && !response.data?.isBuilder) {
          // No missions - not a builder
          sessionStorage.setItem(
            'builder_no_missions',
            JSON.stringify({
              xProfile: response.data?.xProfile,
            })
          );

          logger.info('[X Builder OAuth] X account has no missions', { xUsername: response.data?.xProfile?.xUsername });
        } else {
          // Unexpected response
          sessionStorage.setItem(
            'builder_login_error',
            response.error || 'Login failed'
          );
          logger.error('❌ Builder login failed', { error: response });
        }

        // Clean up OAuth state
        sessionStorage.removeItem('x_oauth_state');
        sessionStorage.removeItem('x_code_verifier');
      } catch (error) {
        // Client-side error (network, validation, etc.)
        const errorMessage =
          error instanceof Error ? error.message : 'An unexpected error occurred';
        sessionStorage.setItem('builder_login_error', errorMessage);
        logger.error('❌ X Builder OAuth callback error', { error: errorMessage });
      } finally {
        // Always redirect back to builder page
        window.location.href = '/builder';
      }
    }

    // Run callback handler on mount
    handleCallback();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="text-center">
        {/* Loading spinner */}
        <div className="w-16 h-16 mx-auto mb-4 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />

        {/* Loading text */}
        <p className="text-lg font-medium text-gray-700">
          Connecting your X account...
        </p>
        <p className="mt-2 text-sm text-gray-500">
          Please wait while we verify your builder status
        </p>
      </div>
    </div>
  );
}
