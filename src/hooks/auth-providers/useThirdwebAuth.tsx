import { useCallback, useState } from 'react';
import { useActiveAccount, useDisconnect, useConnectModal } from 'thirdweb/react';
import { inAppWallet, createWallet } from 'thirdweb/wallets';
import { thirdwebClient } from '@/lib/integration/thirdwebClient';
import { logger } from '@/lib/utils/logger';
import type { AuthMethod } from '@/lib/types/auth';

// SessionStorage key for modal login flow (shared with ThirdwebAuthHandler)
export const THIRDWEB_MODAL_LOGIN_KEY = 'thirdweb_modal_login_pending';

/**
 * useThirdwebAuth - Thirdweb Connect auth hook
 *
 * Replaces usePrivyAuth with same interface:
 * - triggerLogin() opens Thirdweb connect modal (email + google)
 * - cleanup() disconnects wallet, clears state
 */
export const useThirdwebAuth = (): AuthMethod & {
  isReady: boolean;
  triggerLogin: () => void;
} => {
  const { connect } = useConnectModal();
  const activeAccount = useActiveAccount();
  const { disconnect } = useDisconnect();
  const [isReady] = useState(true);

  /**
   * Trigger Thirdweb connect modal
   */
  const triggerLogin = useCallback(() => {
    logger.debug('[useThirdwebAuth] triggerLogin called');

    // Set flag for ThirdwebAuthHandler to process
    sessionStorage.setItem(THIRDWEB_MODAL_LOGIN_KEY, 'true');

    try {
      connect({
        client: thirdwebClient,
        wallets: [
          inAppWallet({
            auth: {
              options: ["email", "google"],
            },
          }),
          createWallet("io.metamask"),
          createWallet("com.coinbase.wallet"),
          createWallet("me.rainbow"),
          createWallet("io.zerion.wallet"),
        ],
      });
    } catch (error) {
      logger.debug('[useThirdwebAuth] Login error (may be user cancellation)', { error });
      sessionStorage.removeItem(THIRDWEB_MODAL_LOGIN_KEY);
    }
  }, [connect]);

  /**
   * @deprecated Use triggerLogin() instead
   */
  const getCredentials = useCallback(async () => {
    logger.warn('[useThirdwebAuth] getCredentials is deprecated, use triggerLogin() instead');
    triggerLogin();
    return new Promise<{ walletAddress: string; email?: string }>(() => {});
  }, [triggerLogin]);

  // Cleanup - disconnect and clear Thirdweb data
  const cleanup = useCallback(async () => {
    logger.debug('[useThirdwebAuth] Cleanup called');

    try {
      if (activeAccount) {
        disconnect(activeAccount as any);
      }

      // Clear any Thirdweb session data from localStorage
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('thirdweb') || key.includes('thirdweb'))) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });

      logger.debug('[useThirdwebAuth] Cleanup completed');
    } catch (error) {
      logger.warn('[useThirdwebAuth] Error during cleanup', { error });
    }
  }, [activeAccount, disconnect]);

  return {
    getCredentials,
    cleanup,
    isReady,
    triggerLogin,
  };
};
