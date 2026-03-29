'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type { AuthMethod } from '@/lib/types/auth';
import { MetaMaskSDK } from '@metamask/sdk';
import { getPlatform } from '@/lib/utils/platform';
import {
  buildSIWEMessage,
  isUserRejectionError,
  getWalletErrorMessage,
  getSessionItem,
  setSessionItem,
  removeSessionItem,
  WALLET_STORAGE_KEYS,
} from '@/lib/utils/auth';
import { logger } from '@/lib/utils/logger';

export const useMetaMaskApp = (): AuthMethod & {
  isReady: boolean;
  connect: () => Promise<void>;
  signMessage: (message?: string) => Promise<void>;
  disconnect: () => void;
  publicKey: string | null;
  isConnecting: boolean;
  isSigning: boolean;
  lastSignature: string | null;
  lastMessage: string | null;
  error: string | null;
} => {
  const [isReady, setIsReady] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [lastSignature, setLastSignature] = useState<string | null>(null);
  const [lastMessage, setLastMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const sdkRef = useRef<MetaMaskSDK | null>(null);
  const providerRef = useRef<any>(null);

  // Initialize MetaMask SDK
  useEffect(() => {
    const initSDK = async () => {
      try {
        const platform = getPlatform();

        // Initialize SDK with appropriate settings
        const sdk = new MetaMaskSDK({
          dappMetadata: {
            name: 'Bloom Protocol',
            url: typeof window !== 'undefined' ? window.location.href : 'https://bloomprotocol.ai',
          },
          // Enable logging in development
          logging: {
            developerMode: process.env.NODE_ENV === 'development',
          },
          // For mobile, use deep links
          checkInstallationImmediately: false,
          // Prefer extension on desktop
          preferDesktop: !platform.isMobile,
        });

        await sdk.init();
        sdkRef.current = sdk;
        providerRef.current = sdk.getProvider();

        // Check if already connected
        if (providerRef.current) {
          try {
            const accounts = await providerRef.current.request({
              method: 'eth_accounts',
            }) as string[];

            if (accounts && accounts.length > 0) {
              setPublicKey(accounts[0]);
            }
          } catch (e) {
            // Not connected, that's fine
          }
        }

        setIsReady(true);

        // Restore state from session storage (for mobile return)
        const savedAddress = getSessionItem(WALLET_STORAGE_KEYS.METAMASK_ADDRESS);
        const savedSignature = getSessionItem(WALLET_STORAGE_KEYS.METAMASK_SIGNATURE);
        const savedMessage = getSessionItem(WALLET_STORAGE_KEYS.METAMASK_MESSAGE);

        if (savedAddress) setPublicKey(savedAddress);
        if (savedSignature) setLastSignature(savedSignature);
        if (savedMessage) setLastMessage(savedMessage);

      } catch (err) {
        logger.error('MetaMask SDK initialization failed', {}, err instanceof Error ? err : new Error(String(err)));
        setError('Failed to initialize MetaMask');
        setIsReady(true); // Still set ready so UI can show error state
      }
    };

    initSDK();

    // Cleanup on unmount
    return () => {
      if (sdkRef.current) {
        // SDK cleanup if needed
      }
    };
  }, []);

  // Listen for account changes
  useEffect(() => {
    const provider = providerRef.current;
    if (!provider) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        // User disconnected
        setPublicKey(null);
        setLastSignature(null);
        setLastMessage(null);
        removeSessionItem(WALLET_STORAGE_KEYS.METAMASK_ADDRESS);
        removeSessionItem(WALLET_STORAGE_KEYS.METAMASK_SIGNATURE);
        removeSessionItem(WALLET_STORAGE_KEYS.METAMASK_MESSAGE);
      } else {
        setPublicKey(accounts[0]);
        setSessionItem(WALLET_STORAGE_KEYS.METAMASK_ADDRESS, accounts[0]);
      }
    };

    const handleChainChanged = (chainId: string) => {
      logger.debug('MetaMask chain changed', { chainId });
      // We could add chain validation here if needed
    };

    const handleDisconnect = () => {
      setPublicKey(null);
      setLastSignature(null);
      setLastMessage(null);
      removeSessionItem(WALLET_STORAGE_KEYS.METAMASK_ADDRESS);
      removeSessionItem(WALLET_STORAGE_KEYS.METAMASK_SIGNATURE);
      removeSessionItem(WALLET_STORAGE_KEYS.METAMASK_MESSAGE);
    };

    provider.on('accountsChanged', handleAccountsChanged);
    provider.on('chainChanged', handleChainChanged);
    provider.on('disconnect', handleDisconnect);

    return () => {
      // Use the captured provider reference for cleanup
      provider.removeListener('accountsChanged', handleAccountsChanged);
      provider.removeListener('chainChanged', handleChainChanged);
      provider.removeListener('disconnect', handleDisconnect);
    };
  }, []);

  // Connect to MetaMask
  const connect = useCallback(async () => {
    if (!sdkRef.current || !providerRef.current) {
      setError('MetaMask SDK not initialized');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      // Request accounts
      const accounts = await providerRef.current.request({
        method: 'eth_requestAccounts',
      }) as string[];

      if (accounts && accounts.length > 0) {
        const address = accounts[0];
        setPublicKey(address);
        setSessionItem(WALLET_STORAGE_KEYS.METAMASK_ADDRESS, address);
        setError(null);
      } else {
        setError('No accounts returned from MetaMask');
      }
    } catch (err: any) {
      logger.error('MetaMask connect error', {}, err instanceof Error ? err : new Error(String(err)));

      if (isUserRejectionError(err)) {
        setError('Connection cancelled by user');
      } else {
        setError(getWalletErrorMessage(err, 'Failed to connect to MetaMask'));
      }
    } finally {
      setIsConnecting(false);
    }
  }, []);

  // Sign message with MetaMask
  const signMessage = useCallback(async (customMessage?: string) => {
    if (!providerRef.current) {
      setError('MetaMask not connected');
      return;
    }

    const addressToUse = publicKey || getSessionItem(WALLET_STORAGE_KEYS.METAMASK_ADDRESS);
    if (!addressToUse) {
      setError('No wallet address. Please connect first.');
      return;
    }

    setIsSigning(true);
    setError(null);

    try {
      // Use shared SIWE message builder or custom message
      const message = customMessage || buildSIWEMessage(addressToUse);
      setLastMessage(message);
      setSessionItem(WALLET_STORAGE_KEYS.METAMASK_MESSAGE, message);

      // Convert message to hex using native API (no Buffer dependency)
      const msgHex = '0x' + Array.from(new TextEncoder().encode(message))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      // Request signature using personal_sign
      const signature = await providerRef.current.request({
        method: 'personal_sign',
        params: [msgHex, addressToUse],
      }) as string;

      if (signature) {
        setLastSignature(signature);
        setSessionItem(WALLET_STORAGE_KEYS.METAMASK_SIGNATURE, signature);
        setError(null);
      } else {
        setError('No signature returned');
      }
    } catch (err: any) {
      logger.error('MetaMask sign error', {}, err instanceof Error ? err : new Error(String(err)));

      if (isUserRejectionError(err)) {
        setError('Signature cancelled by user');
      } else {
        setError(getWalletErrorMessage(err, 'Failed to sign message'));
      }
    } finally {
      setIsSigning(false);
    }
  }, [publicKey]);

  // Disconnect from MetaMask
  const disconnect = useCallback(() => {
    setPublicKey(null);
    setLastSignature(null);
    setLastMessage(null);
    setError(null);

    // Clear session storage
    removeSessionItem(WALLET_STORAGE_KEYS.METAMASK_ADDRESS);
    removeSessionItem(WALLET_STORAGE_KEYS.METAMASK_SIGNATURE);
    removeSessionItem(WALLET_STORAGE_KEYS.METAMASK_MESSAGE);
    removeSessionItem(WALLET_STORAGE_KEYS.MOBILE_WALLET_CONNECTING);
  }, []);

  // Get credentials for auth (AuthMethod interface)
  const getCredentials = useCallback(async (): Promise<{
    walletAddress: string;
    email?: string;
    signature?: string;
    message?: string;
  }> => {
    const address = publicKey || getSessionItem(WALLET_STORAGE_KEYS.METAMASK_ADDRESS);
    if (!address) {
      throw new Error('No wallet connected. Please connect first.');
    }

    return {
      walletAddress: address,
      signature: lastSignature || getSessionItem(WALLET_STORAGE_KEYS.METAMASK_SIGNATURE) || undefined,
      message: lastMessage || getSessionItem(WALLET_STORAGE_KEYS.METAMASK_MESSAGE) || undefined,
    };
  }, [publicKey, lastSignature, lastMessage]);

  // Cleanup method (AuthMethod interface)
  const cleanup = useCallback(async () => {
    disconnect();
  }, [disconnect]);

  return {
    isReady,
    getCredentials,
    cleanup,
    connect,
    signMessage,
    disconnect,
    publicKey,
    isConnecting,
    isSigning,
    lastSignature,
    lastMessage,
    error,
  };
};
