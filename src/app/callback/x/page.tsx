'use client';

import { useEffect } from 'react';
import { apiPost } from '@/lib/api/apiConfig';
import { logger } from '@/lib/utils/logger';

// X 連接響應類型
interface XConnectResponse {
  success: boolean;
  data?: {
    xUserId: string;
    xUsername: string;
    xDisplayName: string;
    xConnectedAt: string;
  };
  error?: string;
}

/**
 * X OAuth Callback Page
 *
 * This page handles the OAuth redirect from X (Twitter) after user authorization.
 * It extracts the authorization code, validates the state (CSRF protection),
 * calls the backend to complete the OAuth flow, and redirects back to the
 * profile page where the user started the flow.
 *
 * Flow:
 * 1. X redirects here with: ?code=xxx&state=yyy
 * 2. Validate state matches sessionStorage (CSRF protection)
 * 3. Get code_verifier from sessionStorage
 * 4. Call backend API: POST /auth/social/x/connect
 * 5. Store success/error flag in sessionStorage
 * 6. Redirect to /profile/x402 (user returns to original page)
 */
export default function XCallbackPage() {
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

        // Step 4: Call backend to complete OAuth flow
        const response = await apiPost<XConnectResponse>('/auth/social/x/connect', {
          code,
          codeVerifier,
        });

        if (response.success) {
          // Success: Store flag for profile page to detect
          sessionStorage.setItem('x_oauth_success', 'true');

          // Clean up OAuth state
          sessionStorage.removeItem('x_oauth_state');
          sessionStorage.removeItem('x_code_verifier');

          logger.info('[X OAuth] X account connected successfully', { xUsername: response.data?.xUsername });
        } else {
          // Error from backend
          sessionStorage.setItem('x_oauth_error', response.error || 'Failed to connect X account');
        }
      } catch (error) {
        // Client-side error (network, validation, etc.)
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
        sessionStorage.setItem('x_oauth_error', errorMessage);
        logger.error('❌ X OAuth callback error', { error: errorMessage });
      } finally {
        // Determine redirect based on origin
        const origin = sessionStorage.getItem('x_oauth_origin');
        sessionStorage.removeItem('x_oauth_origin');

        // Redirect to the origin page (default: /profile/x402)
        const redirectUrl = origin === 'profile' ? '/profile' : '/profile/x402';
        window.location.href = redirectUrl;
      }
    }

    // Run callback handler on mount
    handleCallback();
  }, []); // Empty dependency array - run once on mount

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
          Please wait while we complete the connection
        </p>
      </div>
    </div>
  );
}
