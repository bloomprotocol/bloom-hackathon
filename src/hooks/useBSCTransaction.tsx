'use client';

import { useState, useCallback, useEffect } from 'react';
import { encodeFunctionData, parseAbi, parseUnits } from 'viem';
import { OKXUniversalProvider } from '@okxconnect/universal-provider';
import { logger } from '@/lib/utils/logger';

const BSC_ERC20_ABI = parseAbi([
  'function transfer(address to, uint256 amount) returns (bool)',
]);

// Testing configuration from environment
const TESTING_MODE = process.env.NEXT_PUBLIC_TESTING_MODE === 'true';
const TEST_AMOUNT = Number(process.env.NEXT_PUBLIC_TEST_AMOUNT) || 0.001;

// BSC chain configuration
const BSC_CHAIN_ID = '0x38'; // BSC mainnet = 56 = 0x38
const BSC_CHAIN_NAMESPACE = 'eip155:56'; // For OKXUniversalProvider
const BSC_USDT_ADDRESS = '0x55d398326f99059ff775485246999027b3197955';

export const useBSCTransaction = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [universalProvider, setUniversalProvider] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Check if OKX wallet extension is installed (Desktop)
  const isOKXExtensionInstalled = () => {
    return typeof window !== 'undefined' && (window as any).okxwallet;
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

        // Check if already connected
        const connected = await provider.connected();
        if (connected && provider.session) {
          const evmAccounts = provider.session.namespaces?.eip155?.accounts;
          if (evmAccounts && evmAccounts.length > 0) {
            // Format: eip155:56:0xAddress
            const accountParts = evmAccounts[0].split(':');
            const account = accountParts[accountParts.length - 1];
            setAddress(account);
            setIsConnected(true);
          }
        }

        // Listen for session updates
        provider.on('session_update', (session: any) => {
          if (session) {
            const evmAccounts = session.namespaces?.eip155?.accounts;
            if (evmAccounts && evmAccounts.length > 0) {
              const accountParts = evmAccounts[0].split(':');
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
        const accounts = await (window as any).okxwallet.request({
          method: 'eth_requestAccounts'
        });

        if (accounts && accounts.length > 0) {
          setAddress(accounts[0]);
          setIsConnected(true);

          // Switch to BSC network
          try {
            await (window as any).okxwallet.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: BSC_CHAIN_ID }]
            });
          } catch (switchError: any) {
            if (switchError.code === 4902) {
              await (window as any).okxwallet.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: BSC_CHAIN_ID,
                  chainName: 'BNB Smart Chain',
                  rpcUrls: ['https://bsc-dataseed.binance.org/'],
                  nativeCurrency: {
                    name: 'BNB',
                    symbol: 'BNB',
                    decimals: 18
                  },
                  blockExplorerUrls: ['https://bscscan.com/']
                }]
              });
            }
          }
        }
        return;
      }

      // Strategy 2: Use universal provider (Mobile or Desktop without extension)
      if (!universalProvider) {
        throw new Error('OKX Wallet not available. Please install OKX Wallet app or extension.');
      }

      const session = await universalProvider.connect({
        namespaces: {
          eip155: {
            chains: [BSC_CHAIN_NAMESPACE],
            defaultChain: '56'
          }
        },
        sessionConfig: {
          redirect: 'back'
        }
      });

      if (session) {
        const evmAccounts = session.namespaces?.eip155?.accounts;
        if (evmAccounts && evmAccounts.length > 0) {
          const accountParts = evmAccounts[0].split(':');
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

  // Send payment transaction on BSC (hybrid mode: extension or universal provider)
  const sendPayment = useCallback(async (amount: number, recipientAddress: string, isCustomAmount: boolean = false) => {
    let senderAddress = address;

    // If not connected, connect first
    if (!isConnected || !senderAddress) {
      // Try to get address from extension first
      if (isOKXExtensionInstalled()) {
        const accounts = await (window as any).okxwallet.request({
          method: 'eth_requestAccounts'
        });
        if (accounts && accounts.length > 0) {
          senderAddress = accounts[0];
          setAddress(accounts[0]);
          setIsConnected(true);
        }
      }
      // Or from universal provider
      else if (universalProvider) {
        const session = await universalProvider.connect({
          namespaces: {
            eip155: {
              chains: [BSC_CHAIN_NAMESPACE],
              defaultChain: '56'
            }
          },
          sessionConfig: {
            redirect: 'back'
          }
        });

        if (session) {
          const evmAccounts = session.namespaces?.eip155?.accounts;
          if (evmAccounts && evmAccounts.length > 0) {
            const accountParts = evmAccounts[0].split(':');
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

    logger.debug('Transaction details:', {
      requestedAmount: amount,
      actualAmount: actualAmount,
      recipient: recipientAddress,
      sender: senderAddress,
      isCustomAmount: isCustomAmount,
      testingMode: TESTING_MODE,
      mode: isOKXExtensionInstalled() ? 'extension' : 'universal-provider'
    });

    // ERC-20 transfer encoding via viem
    const data = encodeFunctionData({
      abi: BSC_ERC20_ABI,
      functionName: 'transfer',
      args: [recipientAddress as `0x${string}`, parseUnits(actualAmount.toString(), 18)],
    });

    const txParams = {
      from: senderAddress,
      to: BSC_USDT_ADDRESS,
      data: data,
      gas: '0x' + (100000).toString(16) // ~100k gas for ERC20 transfer
    };

    let txHash: string;

    // Strategy 1: Use extension if available
    if (isOKXExtensionInstalled()) {
      txHash = await (window as any).okxwallet.request({
        method: 'eth_sendTransaction',
        params: [txParams]
      });
    }
    // Strategy 2: Use universal provider
    else if (universalProvider) {
      txHash = await universalProvider.request(
        {
          method: 'eth_sendTransaction',
          params: [txParams]
        },
        BSC_CHAIN_NAMESPACE
      );
    } else {
      throw new Error('No wallet provider available');
    }

    return txHash;
  }, [isConnected, address, universalProvider, connectOKX]);

  // Check extension connection on mount (universal provider handled in init useEffect)
  useEffect(() => {
    if (isOKXExtensionInstalled()) {
      // Check if already connected via extension
      (window as any).okxwallet.request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts && accounts.length > 0) {
            setAddress(accounts[0]);
            setIsConnected(true);
          }
        })
        .catch((error: unknown) => logger.error('Failed to get accounts', { error }));
    }
  }, []);

  // Listen for page focus to re-check connection status (Mobile flow)
  useEffect(() => {
    const checkConnectionOnFocus = async () => {
      logger.debug('[MOBILE] Page regained focus, checking connection status...');

      // Check extension first
      if (isOKXExtensionInstalled()) {
        try {
          const accounts = await (window as any).okxwallet.request({ method: 'eth_accounts' });
          if (accounts && accounts.length > 0 && accounts[0] !== address) {
            logger.debug('[MOBILE] Extension connected:', accounts[0]);
            setAddress(accounts[0]);
            setIsConnected(true);
          }
        } catch (error) {
          logger.error('[MOBILE] Extension check failed', { error });
        }
      }
      // Check universal provider
      else if (universalProvider) {
        try {
          const connected = await universalProvider.connected();
          logger.debug('[MOBILE] Universal provider connected:', connected);

          if (connected && universalProvider.session) {
            const evmAccounts = universalProvider.session.namespaces?.eip155?.accounts;
            if (evmAccounts && evmAccounts.length > 0) {
              const accountParts = evmAccounts[0].split(':');
              const account = accountParts[accountParts.length - 1];

              if (account !== address) {
                logger.debug('[MOBILE] Connection detected on focus:', account);
                setAddress(account);
                setIsConnected(true);
              }
            }
          }
        } catch (error) {
          logger.error('[MOBILE] Universal provider check failed', { error });
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

      // Clear states
      setAddress(null);
      setIsConnected(false);
      setIsConnecting(false);

      logger.debug('[BSC] Wallet disconnected');
    } catch (error) {
      logger.error('[BSC] Failed to disconnect', { error });
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