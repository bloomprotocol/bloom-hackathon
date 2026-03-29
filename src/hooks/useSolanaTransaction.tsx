'use client';

import { useState, useCallback, useEffect } from 'react';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { createTransferInstruction, getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { OKXUniversalProvider } from '@okxconnect/universal-provider';
import { OKXSolanaProvider } from '@okxconnect/solana-provider';
import { logger } from '@/lib/utils/logger';

// Testing configuration from environment
const TESTING_MODE = process.env.NEXT_PUBLIC_TESTING_MODE === 'true';
const TEST_AMOUNT = Number(process.env.NEXT_PUBLIC_TEST_AMOUNT) || 0.001;

// Solana USDC token address (mainnet)
const SOLANA_USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

// Solana RPC from environment variable
const SOLANA_RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';

// Solana chain configuration
const SOLANA_CHAIN_NAMESPACE = 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'; // Solana mainnet

export const useSolanaTransaction = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [universalProvider, setUniversalProvider] = useState<any>(null);
  const [okxSolanaProvider, setOkxSolanaProvider] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Check if OKX wallet extension with Solana support is installed (Desktop)
  const isOKXExtensionInstalled = () => {
    return typeof window !== 'undefined' && (window as any).okxwallet?.solana;
  };

  // Check if device is mobile
  const checkIsMobile = () => {
    if (typeof window === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  // Unified check: returns true if either extension or universal provider can be used
  const isOKXInstalled = () => {
    return isOKXExtensionInstalled() || universalProvider !== null;
  };

  // Initialize OKX Universal Provider (for mobile or when extension not available)
  useEffect(() => {
    const initProvider = async () => {
      const mobile = checkIsMobile();
      setIsMobile(mobile);

      // If desktop and extension installed, no need for universal provider
      if (!mobile && isOKXExtensionInstalled()) {
        return;
      }

      // Initialize universal provider for mobile or desktop without extension
      try {
        const provider = await OKXUniversalProvider.init({
          dappMetaData: {
            name: 'Bloom Protocol',
            icon: 'https://statics.bloomprotocol.ai/logo/bp_logo_icon.png'
          }
        });

        setUniversalProvider(provider);

        // Create OKXSolanaProvider wrapper
        const solanaProvider = new OKXSolanaProvider(provider);
        setOkxSolanaProvider(solanaProvider);

        // Check if already connected
        const connected = await provider.connected();
        if (connected && provider.session) {
          const solanaAccounts = provider.session.namespaces?.solana?.accounts;
          if (solanaAccounts && solanaAccounts.length > 0) {
            // Format: solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp:publicKey
            const accountParts = solanaAccounts[0].split(':');
            const account = accountParts[accountParts.length - 1];
            setAddress(account);
            setIsConnected(true);
          }
        }

        // Listen for session updates
        provider.on('session_update', (session: any) => {
          if (session) {
            const solanaAccounts = session.namespaces?.solana?.accounts;
            if (solanaAccounts && solanaAccounts.length > 0) {
              const accountParts = solanaAccounts[0].split(':');
              const account = accountParts[accountParts.length - 1];
              setAddress(account);
              setIsConnected(true);
            }
          }
        });

        // Listen for disconnection
        provider.on('session_delete', () => {
          setAddress(null);
          setIsConnected(false);
        });
      } catch (error) {
        logger.error('Failed to initialize OKX Universal Provider', { error });
      }
    };

    initProvider();
  }, []);

  // Connect to OKX wallet (hybrid mode: extension or universal provider)
  const connectOKX = useCallback(async () => {
    setIsConnecting(true);
    try {
      // Strategy 1: Use extension if available (Desktop priority)
      if (isOKXExtensionInstalled()) {
        const provider = (window as any).okxwallet.solana;
        const response = await provider.connect();

        if (response && response.publicKey) {
          const publicKeyStr = response.publicKey.toString();
          setAddress(publicKeyStr);
          setIsConnected(true);
        }
        return;
      }

      // Strategy 2: Use universal provider (Mobile or Desktop without extension)
      if (!universalProvider) {
        throw new Error('OKX Wallet not available. Please install OKX Wallet app or extension.');
      }

      const session = await universalProvider.connect({
        namespaces: {
          solana: {
            chains: [SOLANA_CHAIN_NAMESPACE]
          }
        },
        sessionConfig: {
          redirect: 'back'
        }
      });

      if (session) {
        const solanaAccounts = session.namespaces?.solana?.accounts;
        if (solanaAccounts && solanaAccounts.length > 0) {
          const accountParts = solanaAccounts[0].split(':');
          const account = accountParts[accountParts.length - 1];
          setAddress(account);
          setIsConnected(true);
        }
      }
    } catch (error) {
      logger.error('Failed to connect', { error });
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, [universalProvider]);

  // Send payment transaction on Solana (hybrid mode: extension or universal provider)
  const sendPayment = useCallback(async (amount: number, recipientAddress: string, isCustomAmount: boolean = false) => {
    let senderAddress = address;

    // If not connected, connect first
    if (!isConnected || !senderAddress) {
      // Try to get address from extension first
      if (isOKXExtensionInstalled()) {
        const provider = (window as any).okxwallet.solana;
        const response = await provider.connect();
        if (response && response.publicKey) {
          senderAddress = response.publicKey.toString();
          setAddress(senderAddress);
          setIsConnected(true);
        }
      }
      // Or from universal provider
      else if (universalProvider) {
        const session = await universalProvider.connect({
          namespaces: {
            solana: {
              chains: [SOLANA_CHAIN_NAMESPACE]
            }
          },
          sessionConfig: {
            redirect: 'back'
          }
        });

        if (session) {
          const solanaAccounts = session.namespaces?.solana?.accounts;
          if (solanaAccounts && solanaAccounts.length > 0) {
            const accountParts = solanaAccounts[0].split(':');
            senderAddress = accountParts[accountParts.length - 1];
            setAddress(senderAddress);
            setIsConnected(true);
          }
        }
      }

      if (!senderAddress) {
        throw new Error('Failed to get wallet address');
      }
    }

    // Use test amount for fixed amounts, actual amount for custom
    const actualAmount = (TESTING_MODE && !isCustomAmount) ? TEST_AMOUNT : amount;

    console.log('Transaction details:', {
      requestedAmount: amount,
      actualAmount: actualAmount,
      recipient: recipientAddress,
      sender: senderAddress,
      isCustomAmount: isCustomAmount,
      testingMode: TESTING_MODE,
      mode: isOKXExtensionInstalled() ? 'extension' : 'universal-provider'
    });

    try {
      // Convert addresses to PublicKey
      const senderPubkey = new PublicKey(senderAddress);
      const recipientPubkey = new PublicKey(recipientAddress);
      const mintPubkey = new PublicKey(SOLANA_USDC_MINT);

      // Get associated token accounts
      const senderTokenAccount = await getAssociatedTokenAddress(
        mintPubkey,
        senderPubkey
      );

      const recipientTokenAccount = await getAssociatedTokenAddress(
        mintPubkey,
        recipientPubkey
      );

      // USDC has 6 decimals on Solana
      const amountInSmallestUnit = Math.floor(actualAmount * 10**6);

      // Create transfer instruction
      const transferInstruction = createTransferInstruction(
        senderTokenAccount,
        recipientTokenAccount,
        senderPubkey,
        amountInSmallestUnit,
        [],
        TOKEN_PROGRAM_ID
      );

      // Create transaction and set required parameters
      const connection = new Connection(SOLANA_RPC_URL);
      const transaction = new Transaction();
      transaction.add(transferInstruction);

      // Get blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = senderPubkey;

      let signature: string;

      // Strategy 1: Use extension if available
      if (isOKXExtensionInstalled()) {
        const provider = (window as any).okxwallet.solana;
        const result = await provider.signAndSendTransaction(transaction);
        signature = result.signature;
      }
      // Strategy 2: Use universal provider
      else if (okxSolanaProvider) {
        const result = await okxSolanaProvider.signAndSendTransaction(
          transaction,
          SOLANA_CHAIN_NAMESPACE
        );
        signature = result.signature;
      } else {
        throw new Error('No wallet provider available');
      }

      return signature;
    } catch (error: any) {
      logger.error('Transaction failed', { error });
      throw error;
    }
  }, [isConnected, address, universalProvider, okxSolanaProvider]);

  // Check extension connection on mount (universal provider handled in init useEffect)
  useEffect(() => {
    if (isOKXExtensionInstalled()) {
      const provider = (window as any).okxwallet.solana;

      // Check if already connected
      if (provider.isConnected && provider.publicKey) {
        setAddress(provider.publicKey.toString());
        setIsConnected(true);
      }

      // Listen for account changes
      provider.on?.('accountChanged', (publicKey: any) => {
        if (publicKey) {
          setAddress(publicKey.toString());
          setIsConnected(true);
        } else {
          setAddress(null);
          setIsConnected(false);
        }
      });

      // Listen for disconnect
      provider.on?.('disconnect', () => {
        setAddress(null);
        setIsConnected(false);
      });
    }
  }, []);

  // Listen for page focus to re-check connection status (Mobile flow)
  useEffect(() => {
    const checkConnectionOnFocus = async () => {
      console.log('[MOBILE SOLANA] Page regained focus, checking connection status...');

      // Check extension first
      if (isOKXExtensionInstalled()) {
        try {
          const provider = (window as any).okxwallet.solana;
          if (provider.isConnected && provider.publicKey && provider.publicKey.toString() !== address) {
            console.log('[MOBILE SOLANA] Extension connected:', provider.publicKey.toString());
            setAddress(provider.publicKey.toString());
            setIsConnected(true);
          }
        } catch (error) {
          logger.error('[MOBILE SOLANA] Extension check failed', { error });
        }
      }
      // Check universal provider
      else if (universalProvider) {
        try {
          const connected = await universalProvider.connected();
          console.log('[MOBILE SOLANA] Universal provider connected:', connected);

          if (connected && universalProvider.session) {
            const solanaAccounts = universalProvider.session.namespaces?.solana?.accounts;
            if (solanaAccounts && solanaAccounts.length > 0) {
              const accountParts = solanaAccounts[0].split(':');
              const account = accountParts[accountParts.length - 1];

              if (account !== address) {
                console.log('[MOBILE SOLANA] Connection detected on focus:', account);
                setAddress(account);
                setIsConnected(true);
              }
            }
          }
        } catch (error) {
          logger.error('[MOBILE SOLANA] Universal provider check failed', { error });
        }
      }
    };

    window.addEventListener('focus', checkConnectionOnFocus);
    return () => window.removeEventListener('focus', checkConnectionOnFocus);
  }, [universalProvider, address]);

  // Disconnect wallet
  const disconnect = useCallback(async () => {
    try {
      // Disconnect universal provider if exists
      if (universalProvider) {
        await universalProvider.disconnect();
      }

      // Disconnect extension if exists
      if (isOKXExtensionInstalled()) {
        const provider = (window as any).okxwallet.solana;
        if (provider?.disconnect) {
          await provider.disconnect();
        }
      }

      // Clear states
      setAddress(null);
      setIsConnected(false);
      setIsConnecting(false);

      console.log('[SOLANA] Wallet disconnected');
    } catch (error) {
      logger.error('[SOLANA] Failed to disconnect', { error });
    }
  }, [universalProvider]);

  return {
    isConnected,
    address,
    isConnecting,
    connectOKX,
    sendPayment,
    disconnect,
    isOKXInstalled: isOKXInstalled(),
    isMobile // Export for debugging/UI purposes
  };
};
