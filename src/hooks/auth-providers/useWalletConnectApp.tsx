'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type { AuthMethod, NetworkType } from '@/lib/types/auth';
import { getPlatform } from '@/lib/utils/platform';
import {
  generateSecureNonce,
  isUserRejectionError,
  getWalletErrorMessage,
  getSessionItem,
  setSessionItem,
  removeSessionItem,
  WALLET_STORAGE_KEYS,
} from '@/lib/utils/auth';
import { logger } from '@/lib/utils/logger';

export interface WalletConnectHookState {
  isReady: boolean;
  publicKey: string | null;
  selectedNetwork: NetworkType | null;
  lastSignature: string | null;
  lastMessage: string | null;
  isConnecting: boolean;
  isSigning: boolean;
  error: string | null;
}

export const useWalletConnectApp = (): AuthMethod & {
  isReady: boolean;
  connect: (network: NetworkType, walletId?: string) => Promise<void>;
  signMessage: () => Promise<void>;
  disconnect: () => Promise<void>;
  publicKey: string | null;
  selectedNetwork: NetworkType | null;
  isConnecting: boolean;
  isSigning: boolean;
  lastSignature: string | null;
  lastMessage: string | null;
  error: string | null;
} => {
  const [isReady, setIsReady] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkType | null>(null);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [lastSignature, setLastSignature] = useState<string | null>(null);
  const [lastMessage, setLastMessage] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Store AppKit instance and SIWX instance
  const appKitRef = useRef<any>(null);
  const siwxRef = useRef<any>(null);
  const unsubscribeAccountRef = useRef<any>(null);
  const unsubscribeEventsRef = useRef<any>(null);

  // Initialize AppKit with SIWX on mount - MOBILE ONLY
  useEffect(() => {
    // Skip initialization on desktop - WalletConnect is only for mobile devices
    // Use userAgent detection, not screen width
    const platform = getPlatform();
    const isMobileDevice = platform.isIOS || platform.isAndroid;
    if (!isMobileDevice) {
      setIsReady(true);
      return;
    }

    const initAppKit = async () => {
      try {
        // Dynamically import to avoid SSR issues
        const { createAppKit } = await import('@reown/appkit/react');
        const { WagmiAdapter } = await import('@reown/appkit-adapter-wagmi');
        const { SolanaAdapter } = await import('@reown/appkit-adapter-solana');
        const networks = await import('@reown/appkit/networks');

        const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

        if (!projectId) {
          logger.warn('[WalletConnect] NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID not configured');
          setIsReady(true);
          return;
        }

        // Create adapters
        const wagmiAdapter = new WagmiAdapter({
          networks: [networks.mainnet, networks.base, networks.bsc],
          projectId,
        });

        const solanaAdapter = new SolanaAdapter();

        // Import SIWX
        const { DefaultSIWX, InformalMessenger, EIP155Verifier, SolanaVerifier, LocalStorage } = await import('@reown/appkit-siwx');

        // Create SIWX config with custom handlers
        // This enables one-click auth: connect + sign in one flow
        const siwxInstance = new DefaultSIWX({
          messenger: new InformalMessenger({
            domain: typeof window !== 'undefined' ? window.location.host : 'bloomprotocol.ai',
            uri: typeof window !== 'undefined' ? window.location.origin : 'https://bloomprotocol.ai',
            getNonce: async () => {
              // Use shared secure nonce generator
              return generateSecureNonce();
            },
          }),
          verifiers: [new EIP155Verifier(), new SolanaVerifier()],
          storage: new LocalStorage({ key: '@bp/siwx' }),
        });

        siwxRef.current = siwxInstance;

        // Create AppKit with SIWX
        const appKit = createAppKit({
          adapters: [wagmiAdapter, solanaAdapter],
          networks: [networks.mainnet, networks.base, networks.bsc, networks.solana],
          projectId,
          metadata: {
            name: 'Bloom Protocol',
            description: 'Decentralized project submission platform',
            url: typeof window !== 'undefined' ? window.location.origin : 'https://bloomprotocol.ai',
            icons: ['https://statics.bloomprotocol.ai/logo/bp_logo_icon.svg']
          },
          features: {
            analytics: false,
            email: false,
            socials: [],
          },
          // Featured wallets shown first in Connect view
          featuredWalletIds: [
            '8a0ee50d1f22f6651afcae7eb4253e52a3310b90af5daef78a8c4929a9bb99d4', // Binance Wallet
            '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0', // Trust Wallet
          ],
          siwx: siwxInstance, // Enable SIWX one-click auth
        });

        appKitRef.current = appKit;

        // Subscribe to account changes
        const unsubscribeAccount = appKit.subscribeAccount((account: { address?: string; isConnected?: boolean }) => {
          logger.debug('[WalletConnect] Account', { account });

          if (account.isConnected && account.address) {
            setPublicKey(account.address);
            setSessionItem(WALLET_STORAGE_KEYS.WC_WALLET_ADDRESS, account.address);
            setIsConnecting(false);
          } else if (!account.isConnected) {
            const savedAddress = getSessionItem(WALLET_STORAGE_KEYS.WC_WALLET_ADDRESS);
            if (savedAddress) {
              setPublicKey(null);
              removeSessionItem(WALLET_STORAGE_KEYS.WC_WALLET_ADDRESS);
            }
          }
        });
        unsubscribeAccountRef.current = unsubscribeAccount;

        // Subscribe to events for SIWX
        const unsubscribeEvents = appKit.subscribeEvents((event: { data: { event: string; properties?: any } }) => {
          const eventName = event.data.event;
          logger.debug('[WalletConnect] Event', { eventName, properties: event.data.properties });

          switch (eventName) {
            case 'CONNECT_SUCCESS':
              setIsConnecting(false);
              break;

            case 'CONNECT_ERROR':
              const errorMsg = event.data.properties?.message || '';
              if (!errorMsg.includes('already connected')) {
                setIsConnecting(false);
                setError('Connection failed');
              }
              break;

            case 'DISCONNECT_SUCCESS':
              setPublicKey(null);
              setLastSignature(null);
              setLastMessage(null);
              setIsConnecting(false);
              removeSessionItem(WALLET_STORAGE_KEYS.WC_WALLET_ADDRESS);
              removeSessionItem(WALLET_STORAGE_KEYS.WC_SELECTED_NETWORK);
              break;

            case 'MODAL_CLOSE':
              const currentAddress = getSessionItem(WALLET_STORAGE_KEYS.WC_WALLET_ADDRESS);
              if (!currentAddress) {
                setIsConnecting(false);
              }
              break;

            // SIWX specific events
            case 'SIWE_AUTH_SUCCESS':
            case 'SIWX_AUTH_SUCCESS':
              logger.debug('[WalletConnect] SIWX Auth Success', { properties: event.data.properties });
              // Get the signature and message from SIWX storage
              (async () => {
                try {
                  const network = event.data.properties?.network; // e.g., "eip155:1" or "solana:mainnet"

                  // Get address from AppKit directly, not from sessionStorage
                  // This avoids race condition where subscribeAccount hasn't run yet
                  let address: string | undefined = appKit.getAddress() || undefined;

                  // Fallback to sessionStorage if AppKit doesn't have it yet
                  if (!address) {
                    address = getSessionItem(WALLET_STORAGE_KEYS.WC_WALLET_ADDRESS) || undefined;
                  }

                  logger.debug('[WalletConnect] SIWX Auth', { network, address });

                  if (siwxRef.current && address && network) {
                    const sessions = await siwxRef.current.getSessions(network, address);
                    logger.debug('[WalletConnect] SIWX Sessions', { sessionsCount: sessions?.length });

                    if (sessions && sessions.length > 0) {
                      const latestSession = sessions[sessions.length - 1];
                      if (latestSession.signature && latestSession.message) {
                        setLastSignature(latestSession.signature);
                        setLastMessage(latestSession.message);
                        setSessionItem(WALLET_STORAGE_KEYS.WC_SIGNATURE, latestSession.signature);
                        setSessionItem(WALLET_STORAGE_KEYS.WC_MESSAGE, latestSession.message);

                        // Also ensure publicKey is set (in case subscribeAccount hasn't run)
                        if (!getSessionItem(WALLET_STORAGE_KEYS.WC_WALLET_ADDRESS)) {
                          setPublicKey(address);
                          setSessionItem(WALLET_STORAGE_KEYS.WC_WALLET_ADDRESS, address);
                        }

                        logger.debug('[WalletConnect] Got signature from SIWX session');
                      }
                    }
                  } else {
                    logger.warn('[WalletConnect] SIWX Auth - missing required data', {
                      hasSiwx: !!siwxRef.current,
                      address,
                      network
                    });
                  }
                } catch (err) {
                  logger.error('[WalletConnect] Error getting SIWX session', {}, err instanceof Error ? err : new Error(String(err)));
                }
                setIsSigning(false);
              })();
              break;

            case 'SIWE_AUTH_ERROR':
            case 'SIWX_AUTH_ERROR':
              logger.debug('[WalletConnect] SIWX Auth Error', { properties: event.data.properties });
              setError('Authentication failed');
              setIsSigning(false);
              break;
          }
        });
        unsubscribeEventsRef.current = unsubscribeEvents;

        // Restore state from sessionStorage
        const savedNetwork = getSessionItem(WALLET_STORAGE_KEYS.WC_SELECTED_NETWORK) as NetworkType | null;
        const savedAddress = getSessionItem(WALLET_STORAGE_KEYS.WC_WALLET_ADDRESS);
        const savedSignature = getSessionItem(WALLET_STORAGE_KEYS.WC_SIGNATURE);
        const savedMessage = getSessionItem(WALLET_STORAGE_KEYS.WC_MESSAGE);

        if (savedNetwork) setSelectedNetwork(savedNetwork);
        if (savedAddress) setPublicKey(savedAddress);
        if (savedSignature) setLastSignature(savedSignature);
        if (savedMessage) setLastMessage(savedMessage);

        setIsReady(true);
      } catch (err: any) {
        logger.error('[WalletConnect] Failed to initialize AppKit', {}, err instanceof Error ? err : new Error(String(err)));
        setError('Failed to initialize WalletConnect');
        setIsReady(true);
      }
    };

    initAppKit();

    return () => {
      if (unsubscribeAccountRef.current) {
        unsubscribeAccountRef.current();
      }
      if (unsubscribeEventsRef.current) {
        unsubscribeEventsRef.current();
      }
    };
  }, []);

  // Store wallet button connect function - lazy initialized only when needed
  const walletButtonConnectRef = useRef<((walletId: string) => Promise<void>) | null>(null);
  const walletButtonInitializedRef = useRef(false);

  // Lazy initialize wallet button - only called when walletId is provided in connect()
  const initWalletButton = useCallback(async () => {
    if (walletButtonInitializedRef.current) return;

    // Only initialize on real mobile devices
    const platform = getPlatform();
    if (!platform.isIOS && !platform.isAndroid) {
      return;
    }

    try {
      const { createAppKitWalletButton } = await import('@reown/appkit-wallet-button');
      const wb = createAppKitWalletButton();
      walletButtonConnectRef.current = async (walletId: string) => {
        await (wb.connect as unknown as (id: string) => Promise<void>)(walletId);
      };
      walletButtonInitializedRef.current = true;
    } catch (err) {
      logger.warn('[WalletConnect] Failed to init wallet button', { error: err instanceof Error ? err.message : String(err) });
    }
  }, []);

  // Connect function - opens AppKit modal with SIWX (one-click auth)
  // If walletId is provided, directly connect to that wallet without showing modal
  const connect = useCallback(async (network: NetworkType, walletId?: string) => {
    if (!appKitRef.current) {
      setError('WalletConnect not initialized');
      return;
    }

    setIsConnecting(true);
    setIsSigning(true); // SIWX handles both connect + sign
    setError(null);
    setLastSignature(null);
    setLastMessage(null);
    setSelectedNetwork(network);
    setSessionItem(WALLET_STORAGE_KEYS.WC_SELECTED_NETWORK, network);

    try {
      // Switch to the selected network before connecting
      const networks = await import('@reown/appkit/networks');
      if (network === 'solana') {
        await appKitRef.current.switchNetwork(networks.solana);
      } else {
        await appKitRef.current.switchNetwork(networks.mainnet);
      }

      if (walletId) {
        // Lazy initialize wallet button if needed (only on mobile)
        await initWalletButton();

        if (walletButtonConnectRef.current) {
          // Direct connection to specific wallet - no modal
          await walletButtonConnectRef.current(walletId);
          return;
        }
        // Fallback to modal if wallet button init failed
      }

      // Open AppKit modal - SIWX will handle connect + sign in one flow
      // Use 'AllWallets' view to show all wallets (featured wallets prioritized)
      await appKitRef.current.open({ view: 'AllWallets' });
    } catch (err: any) {
      if (isUserRejectionError(err)) {
        setError('Connection cancelled by user');
      } else {
        setError(getWalletErrorMessage(err, 'Connection failed'));
      }
      setIsConnecting(false);
      setIsSigning(false);
    }
  }, [initWalletButton]);

  // Sign message function (for manual signing if needed)
  const signMessage = useCallback(async () => {
    // With SIWX, signing is handled automatically during connect
    // This is kept for API compatibility
    logger.debug('[WalletConnect] signMessage called - SIWX handles this automatically');
  }, []);

  // Disconnect function
  const disconnect = useCallback(async () => {
    if (appKitRef.current) {
      try {
        await appKitRef.current.disconnect();
      } catch (err) {
        logger.warn('[WalletConnect] Disconnect error', { error: err instanceof Error ? err.message : String(err) });
      }
    }

    setPublicKey(null);
    setLastSignature(null);
    setLastMessage(null);
    setSelectedNetwork(null);
    setError(null);
    setIsConnecting(false);
    setIsSigning(false);

    removeSessionItem(WALLET_STORAGE_KEYS.WC_SELECTED_NETWORK);
    removeSessionItem(WALLET_STORAGE_KEYS.WC_WALLET_ADDRESS);
    removeSessionItem(WALLET_STORAGE_KEYS.WC_SIGNATURE);
    removeSessionItem(WALLET_STORAGE_KEYS.WC_MESSAGE);
  }, []);

  // AuthMethod interface implementation
  const getCredentials = useCallback(async (): Promise<{
    walletAddress: string;
    email?: string;
    signature?: string;
  }> => {
    if (!publicKey) {
      throw new Error('No wallet connected. Please connect first.');
    }

    return {
      walletAddress: publicKey,
      signature: lastSignature || undefined,
    };
  }, [publicKey, lastSignature]);

  const cleanup = useCallback(async () => {
    await disconnect();
  }, [disconnect]);

  return {
    isReady,
    getCredentials,
    cleanup,
    connect,
    signMessage,
    disconnect,
    publicKey,
    selectedNetwork,
    isConnecting,
    isSigning,
    lastSignature,
    lastMessage,
    error,
  };
};
