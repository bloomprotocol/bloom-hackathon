'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiGet, apiDelete } from '@/lib/api/apiConfig';
import { generateCodeVerifier, generateCodeChallenge, generateRandomString } from '@/lib/oauth/pkce';
import { logger } from '@/lib/utils/logger';

/**
 * X Connection Status returned from API
 */
export interface XConnectionStatus {
  connected: boolean;
  xUsername?: string;
  xDisplayName?: string;
  xUserId?: string;
  xConnectedAt?: string;
}

/**
 * API Response wrapper type
 */
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Options for useXConnection hook
 */
export interface UseXConnectionOptions {
  /**
   * Origin page for redirect after OAuth callback
   * - 'profile': Redirect to /profile after connecting
   * - 'x402': Redirect to /profile/x402 after connecting (default)
   */
  origin?: 'profile' | 'x402';
}

/**
 * Return type for useXConnection hook
 */
export interface UseXConnectionReturn {
  /** Current X connection status */
  status: XConnectionStatus | null;
  /** Whether status is loading */
  isLoading: boolean;
  /** Whether OAuth connection is in progress */
  isConnecting: boolean;
  /** Whether disconnect confirmation is shown */
  isConfirmingDisconnect: boolean;
  /** Initiate X OAuth connection flow */
  connectX: () => Promise<void>;
  /** Disconnect X account (two-click: first shows confirm, second disconnects) */
  disconnectX: () => Promise<void>;
  /** Cancel disconnect confirmation */
  cancelDisconnect: () => void;
  /** Refresh connection status */
  refreshStatus: () => Promise<void>;
}

/**
 * Hook for managing X (Twitter) account connection
 *
 * Provides functionality to:
 * - Fetch current X connection status
 * - Initiate OAuth flow to connect X account
 * - Disconnect X account with two-click confirmation
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { status, isLoading, connectX, disconnectX } = useXConnection({ origin: 'profile' });
 *
 *   if (isLoading) return <Spinner />;
 *
 *   return status?.connected
 *     ? <button onClick={disconnectX}>Disconnect @{status.xUsername}</button>
 *     : <button onClick={connectX}>Connect X</button>;
 * }
 * ```
 */
export function useXConnection(options: UseXConnectionOptions = {}): UseXConnectionReturn {
  const { origin = 'x402' } = options;

  const [status, setStatus] = useState<XConnectionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConfirmingDisconnect, setIsConfirmingDisconnect] = useState(false);

  /**
   * Fetch X connection status from API
   */
  const fetchStatus = useCallback(async () => {
    try {
      const response = await apiGet<ApiResponse<XConnectionStatus>>('/auth/social/x/status');

      if (response.success) {
        setStatus(response.data ?? null);

        // Check for OAuth callback results
        const oauthSuccess = sessionStorage.getItem('x_oauth_success');
        const oauthError = sessionStorage.getItem('x_oauth_error');

        if (oauthSuccess) {
          logger.info('[X OAuth] X account connected successfully');
          sessionStorage.removeItem('x_oauth_success');
        } else if (oauthError) {
          logger.error('[X OAuth] Failed to connect X account', { error: oauthError });
          sessionStorage.removeItem('x_oauth_error');
        }
      }
    } catch (error) {
      logger.error('[X Connection] Failed to fetch status', { error });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch status on mount
  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Reset disconnect confirmation when status changes
  useEffect(() => {
    setIsConfirmingDisconnect(false);
  }, [status]);

  /**
   * Initiate X OAuth connection flow
   */
  const connectX = useCallback(async () => {
    setIsConnecting(true);

    try {
      // Validate required environment variables
      const clientId = process.env.NEXT_PUBLIC_X_CLIENT_ID;
      const callbackUrl = process.env.NEXT_PUBLIC_X_OAUTH_CALLBACK_URL;

      if (!clientId || !callbackUrl) {
        logger.error('[X Connection] Missing required environment variables: NEXT_PUBLIC_X_CLIENT_ID or NEXT_PUBLIC_X_OAUTH_CALLBACK_URL');
        setIsConnecting(false);
        return;
      }

      // 1. Generate PKCE parameters
      const codeVerifier = generateCodeVerifier();
      const codeChallenge = await generateCodeChallenge(codeVerifier);

      // 2. Generate CSRF state token
      const state = generateRandomString(32);

      // 3. Store OAuth state in sessionStorage
      sessionStorage.setItem('x_oauth_state', state);
      sessionStorage.setItem('x_code_verifier', codeVerifier);
      sessionStorage.setItem('x_oauth_origin', origin);

      // 4. Build X OAuth authorize URL
      const params = new URLSearchParams({
        response_type: 'code',
        client_id: clientId,
        redirect_uri: callbackUrl,
        scope: 'users.read tweet.read',
        state: state,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256'
      });

      const authorizeUrl = `https://x.com/i/oauth2/authorize?${params.toString()}`;

      // 5. Redirect to X OAuth
      // Note: isConnecting stays true during redirect - will reset on page reload
      window.location.href = authorizeUrl;
    } catch (error) {
      logger.error('[X Connection] Failed to initiate OAuth', { error });
      setIsConnecting(false);
    }
  }, [origin]);

  /**
   * Disconnect X account (two-click confirmation)
   */
  const disconnectX = useCallback(async () => {
    // First click: show confirmation
    if (!isConfirmingDisconnect) {
      setIsConfirmingDisconnect(true);
      return;
    }

    // Second click: actually disconnect
    try {
      const response = await apiDelete<ApiResponse<{ message: string }>>('/auth/social/x/disconnect');

      if (response.success) {
        setStatus({ connected: false });
        setIsConfirmingDisconnect(false);
        logger.info('[X Connection] X account disconnected successfully');
      } else {
        logger.error('[X Connection] Failed to disconnect', { error: response.error });
        setIsConfirmingDisconnect(false);
      }
    } catch (error) {
      logger.error('[X Connection] Failed to disconnect', { error });
      setIsConfirmingDisconnect(false);
    }
  }, [isConfirmingDisconnect]);

  /**
   * Cancel disconnect confirmation
   */
  const cancelDisconnect = useCallback(() => {
    setIsConfirmingDisconnect(false);
  }, []);

  return {
    status,
    isLoading,
    isConnecting,
    isConfirmingDisconnect,
    connectX,
    disconnectX,
    cancelDisconnect,
    refreshStatus: fetchStatus,
  };
}
