import { useState, useCallback, useEffect } from 'react';
import type { AuthMethod, NetworkType } from '@/lib/types/auth';
import { OKXUniversalProvider } from '@okxconnect/universal-provider';
import { OKXSolanaProvider } from '@okxconnect/solana-provider';
import bs58 from 'bs58';
import {
  buildSIWEMessage,
  buildSIWSMessage,
  isUserRejectionError,
  getWalletErrorMessage,
  getSessionItem,
  setSessionItem,
  removeSessionItem,
  WALLET_STORAGE_KEYS,
} from '@/lib/utils/auth';

export { type NetworkType };

export const useOKXApp = (): AuthMethod & {
  isReady: boolean;
  connect: (network?: NetworkType) => Promise<void>;
  signMessage: (message: string) => Promise<void>;
  disconnect: () => Promise<void>;
  publicKey: string | null;
  connectedNetwork: NetworkType | null;
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
  const [connectedNetwork, setConnectedNetwork] = useState<NetworkType | null>(null);
  const [lastSignature, setLastSignature] = useState<string | null>(null);
  const [lastMessage, setLastMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [okxUniversalProvider, setOkxUniversalProvider] = useState<any>(null);
  const [okxSolanaProvider, setOkxSolanaProvider] = useState<any>(null);
  const [session, setSession] = useState<any>(null);

  // Initialize OKX Universal Provider on mount
  useEffect(() => {
    const initOKXProvider = async () => {
      try {
        const provider = await OKXUniversalProvider.init({
          dappMetaData: {
            name: 'Bloom Protocol',
            icon: 'https://statics.bloomprotocol.ai/images/logo.png'
          }
        });

        setOkxUniversalProvider(provider);

        // Create OKXSolanaProvider for signing operations
        const solanaProvider = new OKXSolanaProvider(provider);
        setOkxSolanaProvider(solanaProvider);

        // Listen for session updates (when connection state changes)
        provider.on('session_update', (newSession: any) => {
          if (newSession) {
            setSession(newSession);
            // Check for EVM accounts first
            const evmAccounts = newSession.namespaces?.eip155?.accounts;
            if (evmAccounts && evmAccounts.length > 0) {
              // Format: eip155:1:0xAddress
              const accountParts = evmAccounts[0].split(':');
              const account = accountParts[accountParts.length - 1];
              setPublicKey(account);
              setConnectedNetwork('evm');
            } else {
              // Check for Solana accounts
              const solanaAccounts = newSession.namespaces?.solana?.accounts;
              if (solanaAccounts && solanaAccounts.length > 0) {
                const accountParts = solanaAccounts[0].split(':');
                const account = accountParts[accountParts.length - 1];
                setPublicKey(account);
                setConnectedNetwork('solana');
              }
            }
          }
        });

        // Listen for session deletion (disconnect)
        provider.on('session_delete', () => {
          setSession(null);
          setPublicKey(null);
          setConnectedNetwork(null);
          setLastSignature(null);
          setError(null);
        });

        // Check if already connected
        const connected = await provider.connected();
        if (connected) {
          // Get current session if exists
          const existingSession = provider.session;
          if (existingSession) {
            setSession(existingSession);
            // Check for EVM accounts first
            const evmAccounts = existingSession.namespaces?.eip155?.accounts;
            if (evmAccounts && evmAccounts.length > 0) {
              // Format: eip155:1:0xAddress
              const accountParts = evmAccounts[0].split(':');
              const account = accountParts[accountParts.length - 1];
              setPublicKey(account);
              setConnectedNetwork('evm');
            } else {
              // Check for Solana accounts
              const solanaAccounts = existingSession.namespaces?.solana?.accounts;
              if (solanaAccounts && solanaAccounts.length > 0) {
                // Format: solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp:publicKey
                const accountParts = solanaAccounts[0].split(':');
                const account = accountParts[accountParts.length - 1];
                setPublicKey(account);
                setConnectedNetwork('solana');
              }
            }
          }
        }

        setIsReady(true);
      } catch (err: any) {
        setError('Failed to initialize OKX provider');
      }
    };

    initOKXProvider();
  }, []);

  // Check connection status when page regains focus (user returns from OKX app)
  useEffect(() => {
    const checkConnectionOnFocus = async () => {
      if (okxUniversalProvider && !publicKey) {
        const connected = await okxUniversalProvider.connected();
        if (connected && okxUniversalProvider.session) {
          const existingSession = okxUniversalProvider.session;
          setSession(existingSession);
          // Check for EVM accounts first
          const evmAccounts = existingSession.namespaces?.eip155?.accounts;
          if (evmAccounts && evmAccounts.length > 0) {
            const accountParts = evmAccounts[0].split(':');
            const account = accountParts[accountParts.length - 1];
            setPublicKey(account);
            setConnectedNetwork('evm');
          } else {
            // Check for Solana accounts
            const solanaAccounts = existingSession.namespaces?.solana?.accounts;
            if (solanaAccounts && solanaAccounts.length > 0) {
              const accountParts = solanaAccounts[0].split(':');
              const account = accountParts[accountParts.length - 1];
              setPublicKey(account);
              setConnectedNetwork('solana');
            }
          }
        }
      }
    };

    window.addEventListener('focus', checkConnectionOnFocus);
    return () => window.removeEventListener('focus', checkConnectionOnFocus);
  }, [okxUniversalProvider, publicKey]);

  const connect = useCallback(async (network: NetworkType = 'solana') => {
    setIsConnecting(true);
    setError(null);
    setLastSignature(null);

    try {
      // Initialize provider if not ready
      let provider = okxUniversalProvider;
      if (!provider) {
        provider = await OKXUniversalProvider.init({
          dappMetaData: {
            name: 'Bloom Protocol',
            icon: 'https://statics.bloomprotocol.ai/images/logo.png'
          }
        });

        setOkxUniversalProvider(provider);

        // Create OKXSolanaProvider for signing operations (only needed for Solana)
        const solanaProvider = new OKXSolanaProvider(provider);
        setOkxSolanaProvider(solanaProvider);
      }

      // Build namespaces based on network type
      const namespaces = network === 'evm'
        ? {
            eip155: {
              chains: ['eip155:1'], // Ethereum mainnet
            }
          }
        : {
            solana: {
              chains: ['solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'], // Solana mainnet
            }
          };

      // Store selected network for later use
      setSessionItem(WALLET_STORAGE_KEYS.OKX_SELECTED_NETWORK, network);

      // Connect to OKX wallet
      const sessionResult = await provider.connect({
        namespaces,
        sessionConfig: {
          redirect: 'back' // Return to current page after connection
        }
      });

      if (sessionResult) {
        setSession(sessionResult);

        if (network === 'evm') {
          // Extract the EVM account
          const evmAccounts = sessionResult.namespaces?.eip155?.accounts;
          if (evmAccounts && evmAccounts.length > 0) {
            // Format: eip155:1:0xAddress
            const accountParts = evmAccounts[0].split(':');
            const account = accountParts[accountParts.length - 1];
            setPublicKey(account);
            setConnectedNetwork('evm');
            setSessionItem(WALLET_STORAGE_KEYS.OKX_WALLET_PUBLIC_KEY, account);
          }
        } else {
          // Extract the Solana account
          const solanaAccounts = sessionResult.namespaces?.solana?.accounts;
          if (solanaAccounts && solanaAccounts.length > 0) {
            // Format: solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp:publicKey
            const accountParts = solanaAccounts[0].split(':');
            const account = accountParts[accountParts.length - 1];
            setPublicKey(account);
            setConnectedNetwork('solana');
            setSessionItem(WALLET_STORAGE_KEYS.OKX_WALLET_PUBLIC_KEY, account);
          }
        }
      } else {
        throw new Error('No session returned from OKX wallet');
      }
    } catch (err: any) {
      if (isUserRejectionError(err)) {
        setError('Connection cancelled by user');
      } else {
        setError(getWalletErrorMessage(err, 'Connection failed'));
      }
    } finally {
      setIsConnecting(false);
    }
  }, [okxUniversalProvider]);

  const signMessage = useCallback(async (message: string) => {
    if (!session || !publicKey) {
      setError('Please connect wallet first');
      return;
    }

    // Determine network from state or sessionStorage (for page reload scenarios)
    const network = connectedNetwork || getSessionItem(WALLET_STORAGE_KEYS.OKX_SELECTED_NETWORK) as NetworkType || 'solana';

    // For Solana, we need the Solana provider
    if (network === 'solana' && !okxSolanaProvider) {
      setError('Solana provider not initialized');
      return;
    }

    setIsSigning(true);
    setError(null);

    try {
      let formattedMessage: string;
      let signatureStr: string;

      if (network === 'evm') {
        // Use shared SIWE message builder
        formattedMessage = buildSIWEMessage(publicKey, '1', 'Ethereum');

        // Save message for later use
        setLastMessage(formattedMessage);
        setSessionItem(WALLET_STORAGE_KEYS.OKX_SIGN_MESSAGE, formattedMessage);

        // Convert message to hex for personal_sign
        const messageHex = '0x' + Array.from(new TextEncoder().encode(formattedMessage))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');

        // Use OKX Universal Provider for EVM signing
        const signResult = await okxUniversalProvider.request(
          {
            method: 'personal_sign',
            params: [messageHex, publicKey]
          },
          'eip155:1' // Ethereum mainnet
        );

        if (signResult) {
          // EVM signature is already a hex string
          signatureStr = signResult;
          setLastSignature(signatureStr);
        } else {
          throw new Error('No signature returned');
        }
      } else {
        // Use shared SIWS message builder
        formattedMessage = buildSIWSMessage(publicKey);

        // Save message for later use
        setLastMessage(formattedMessage);
        setSessionItem(WALLET_STORAGE_KEYS.OKX_SIGN_MESSAGE, formattedMessage);

        // Use OKXSolanaProvider for signing
        const signResult = await okxSolanaProvider.signMessage(
          formattedMessage,
          'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp' // Solana mainnet chain ID
        );

        if (signResult && signResult.signature) {
          // Convert Uint8Array signature to base58 string (backend expects base58)
          signatureStr = bs58.encode(Buffer.from(signResult.signature));
          setLastSignature(signatureStr);
        } else {
          throw new Error('No signature returned');
        }
      }
    } catch (err: any) {
      if (isUserRejectionError(err)) {
        setError('Signing cancelled by user');
      } else {
        setError(getWalletErrorMessage(err, 'Signing failed'));
      }
    } finally {
      setIsSigning(false);
    }
  }, [okxUniversalProvider, okxSolanaProvider, session, publicKey, connectedNetwork]);

  const disconnect = useCallback(async () => {
    if (!okxUniversalProvider) {
      setError('No provider initialized');
      return;
    }

    try {
      // Simple disconnect call
      await okxUniversalProvider.disconnect();
      // The session_delete event listener will handle clearing the state
    } catch (err: any) {
      setError(getWalletErrorMessage(err, 'Disconnect failed'));
    }
  }, [okxUniversalProvider]);

  // Get credentials for auth (AuthMethod interface)
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
      signature: lastSignature || undefined
    };
  }, [publicKey, lastSignature]);

  // Cleanup method (AuthMethod interface)
  // Note: This will reload the page if connected, similar to Phantom's deep link behavior
  const cleanup = useCallback(async () => {
    const wasConnected = publicKey !== null;

    // Always try to disconnect if provider exists, don't rely on our session state
    if (okxUniversalProvider) {
      try {
        // Check if OKX thinks we're connected
        const isConnected = await okxUniversalProvider.connected();
        if (isConnected) {
          await okxUniversalProvider.disconnect();
        }
      } catch (err) {
        // Ignore errors during cleanup
      }
    }

    // Always clear state
    setSession(null);
    setPublicKey(null);
    setConnectedNetwork(null);
    setLastSignature(null);
    setError(null);

    // Clear sessionStorage
    removeSessionItem(WALLET_STORAGE_KEYS.OKX_WALLET_PUBLIC_KEY);
    removeSessionItem(WALLET_STORAGE_KEYS.OKX_SIGN_MESSAGE);
    removeSessionItem(WALLET_STORAGE_KEYS.OKX_SELECTED_NETWORK);

    // Force reload to fully reset state (like Phantom does after deep link redirect)
    if (wasConnected) {
      window.location.reload();
    }
  }, [okxUniversalProvider, publicKey]);

  return {
    isReady,
    getCredentials,
    cleanup,
    connect,
    signMessage,
    disconnect,
    publicKey,
    connectedNetwork,
    isConnecting,
    isSigning,
    lastSignature,
    lastMessage,
    error
  };
};
