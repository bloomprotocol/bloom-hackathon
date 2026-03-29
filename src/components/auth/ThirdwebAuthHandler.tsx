'use client';

import { useEffect, useRef } from 'react';
import { useActiveAccount, useProfiles } from 'thirdweb/react';
import { useAuth } from '@/lib/context/AuthContext';
import { THIRDWEB_MODAL_LOGIN_KEY } from '@/hooks/auth-providers/useThirdwebAuth';
import { thirdwebClient } from '@/lib/integration/thirdwebClient';
import { logger } from '@/lib/utils/logger';
import { useQueryClient } from '@tanstack/react-query';

/** Validate redirect path is a safe relative URL (no external/javascript/data URIs) */
function isSafeRedirectPath(path: string): boolean {
  const trimmed = path.trim();
  if (/^(javascript|data|vbscript):/i.test(trimmed)) return false;
  if (trimmed.startsWith('//')) return false;
  if (trimmed.includes('://')) return false;
  return trimmed.startsWith('/');
}

/**
 * ThirdwebAuthHandler - Handles Thirdweb auth completion
 *
 * Replaces PrivyOAuthHandler. Watches for Thirdweb wallet connection,
 * then calls backend wallet/login to get JWT.
 *
 * Thirdweb uses modals (no redirect), so this is simpler than Privy's
 * OAuth redirect handling.
 */
export function ThirdwebAuthHandler() {
  const activeAccount = useActiveAccount();
  const { data: profiles } = useProfiles({ client: thirdwebClient });
  const { isAuthenticated, loginWithWallet } = useAuth();
  const queryClient = useQueryClient();
  const processedRef = useRef(false);

  useEffect(() => {
    const handleThirdwebAuthComplete = async () => {
      // Check if we have a pending login flag
      const hasModalFlag = sessionStorage.getItem(THIRDWEB_MODAL_LOGIN_KEY) === 'true';
      if (!hasModalFlag) return;
      if (!activeAccount?.address) return;
      if (processedRef.current) return;
      if (isAuthenticated) return;

      processedRef.current = true;

      const walletAddress = activeAccount.address;

      // Extract email from Thirdweb profiles (for returning user matching)
      const emailProfile = profiles?.find(
        (p: any) => p.type === 'email' || p.type === 'google'
      );
      const email = emailProfile?.details?.email as string | undefined;

      logger.debug('[ThirdwebAuthHandler] Processing login', {
        walletAddress,
        hasEmail: !!email,
      });

      try {
        // Pass email so backend can match returning users by email
        const success = await loginWithWallet(walletAddress, email);

        if (success) {
          logger.debug('[ThirdwebAuthHandler] Login successful');

          // Cleanup flag
          sessionStorage.removeItem(THIRDWEB_MODAL_LOGIN_KEY);

          // Handle redirect (validated to prevent open redirect)
          // Thirdweb uses modals — no page reload needed. loginWithWallet already
          // called setIsAuthenticated(true) + invalidateQueries().
          const storedRedirectPath = sessionStorage.getItem('redirectAfterAuth');
          if (storedRedirectPath) {
            sessionStorage.removeItem('redirectAfterAuth');
            if (isSafeRedirectPath(storedRedirectPath)) {
              window.location.href = storedRedirectPath;
            }
          }
          // No reload — React state is already updated
        }
      } catch (error) {
        logger.error('[ThirdwebAuthHandler] Error during login', { error });
        sessionStorage.removeItem(THIRDWEB_MODAL_LOGIN_KEY);
        // Reset so user can retry — the sessionStorage flag (already cleared) prevents loops
        processedRef.current = false;
      }
    };

    handleThirdwebAuthComplete();
  }, [activeAccount?.address, isAuthenticated, loginWithWallet, queryClient]);

  return null;
}
