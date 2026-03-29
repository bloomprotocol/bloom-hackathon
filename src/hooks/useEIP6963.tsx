'use client';

import { useState, useEffect, useCallback } from 'react';

// EIP-6963 types
export interface EIP6963ProviderInfo {
  uuid: string;
  name: string;
  icon: string;
  rdns: string; // Reverse domain name identifier
}

export interface EIP6963ProviderDetail {
  info: EIP6963ProviderInfo;
  provider: any; // EIP-1193 provider
}

export interface EIP6963AnnounceProviderEvent extends CustomEvent {
  detail: EIP6963ProviderDetail;
}

// Known wallet RDNS identifiers
const WALLET_RDNS = {
  METAMASK: 'io.metamask',
  COINBASE: 'com.coinbase.wallet',
  TRUST: 'com.trustwallet.app',
  OKX: 'com.okex.wallet',
  PHANTOM: 'app.phantom',
  BINANCE: 'com.binance',
} as const;

// Hook to detect EVM wallets using EIP-6963
export const useEIP6963 = () => {
  const [providers, setProviders] = useState<EIP6963ProviderDetail[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const detectedProviders: EIP6963ProviderDetail[] = [];

    // Handler for wallet announcements
    const handleAnnounceProvider = (event: Event) => {
      const e = event as EIP6963AnnounceProviderEvent;
      const { info, provider } = e.detail;

      // Check if this provider is already added (by uuid)
      const exists = detectedProviders.some(p => p.info.uuid === info.uuid);
      if (!exists) {
        detectedProviders.push({ info, provider });
        setProviders([...detectedProviders]);
      }
    };

    // Listen for provider announcements
    window.addEventListener('eip6963:announceProvider', handleAnnounceProvider);

    // Request providers to announce themselves
    window.dispatchEvent(new Event('eip6963:requestProvider'));

    // Give wallets some time to respond, then mark as ready
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 500);

    return () => {
      window.removeEventListener('eip6963:announceProvider', handleAnnounceProvider);
      clearTimeout(timer);
    };
  }, []);

  // Get provider by wallet name
  const getProviderByName = useCallback((walletName: string): any | null => {
    // Map wallet names to RDNS patterns
    const rdnsPatterns: Record<string, string[]> = {
      'MetaMask': [WALLET_RDNS.METAMASK],
      'Coinbase Wallet': [WALLET_RDNS.COINBASE],
      'Trust Wallet': [WALLET_RDNS.TRUST],
      'OKX Wallet': [WALLET_RDNS.OKX],
      'Phantom': [WALLET_RDNS.PHANTOM],
      'Binance Web3 Wallet': [WALLET_RDNS.BINANCE],
    };

    const patterns = rdnsPatterns[walletName];
    if (!patterns) return null;

    // Find provider matching any of the RDNS patterns
    const found = providers.find(p =>
      patterns.some(pattern => p.info.rdns.includes(pattern))
    );

    return found?.provider || null;
  }, [providers]);

  // Get provider by RDNS
  const getProviderByRdns = useCallback((rdns: string): any | null => {
    const found = providers.find(p => p.info.rdns === rdns);
    return found?.provider || null;
  }, [providers]);

  // Check if a specific wallet is available
  const hasWallet = useCallback((walletName: string): boolean => {
    return getProviderByName(walletName) !== null;
  }, [getProviderByName]);

  return {
    providers,
    isReady,
    getProviderByName,
    getProviderByRdns,
    hasWallet,
  };
};

// Utility: Get EVM provider with EIP-6963 fallback to window.ethereum
export const getEvmProviderWithFallback = (
  walletName: string,
  eip6963Providers: EIP6963ProviderDetail[]
): any | null => {
  // Map wallet names to RDNS patterns
  const rdnsPatterns: Record<string, string[]> = {
    'MetaMask': ['io.metamask'],
    'Coinbase Wallet': ['com.coinbase.wallet'],
    'Trust Wallet': ['com.trustwallet.app'],
    'OKX Wallet': ['com.okex.wallet'],
  };

  const patterns = rdnsPatterns[walletName];

  // Try EIP-6963 first
  if (patterns && eip6963Providers.length > 0) {
    const found = eip6963Providers.find(p =>
      patterns.some(pattern => p.info.rdns.includes(pattern))
    );
    if (found) return found.provider;
  }

  // Fallback to window.ethereum detection
  const ethereum = (window as any).ethereum;
  if (!ethereum) return null;

  // Check providers array (legacy multi-wallet detection)
  const legacyProviders = ethereum.providers || [];

  switch (walletName) {
    case 'MetaMask':
      if (legacyProviders.length > 0) {
        const metaMaskProvider = legacyProviders.find((p: any) =>
          p.isMetaMask && !p.isOKExWallet && !p.isBraveWallet && !p.isCoinbaseWallet && !p.isTrust
        );
        if (metaMaskProvider) return metaMaskProvider;
      }
      if (ethereum.isMetaMask && !ethereum.isOKExWallet && !ethereum.isBraveWallet && !ethereum.isCoinbaseWallet && !ethereum.isTrust) {
        return ethereum;
      }
      return null;

    case 'Coinbase Wallet':
      if ((window as any).coinbaseWalletExtension) {
        return (window as any).coinbaseWalletExtension;
      }
      if (legacyProviders.length > 0) {
        const coinbaseProvider = legacyProviders.find((p: any) => p.isCoinbaseWallet);
        if (coinbaseProvider) return coinbaseProvider;
      }
      if (ethereum.isCoinbaseWallet) return ethereum;
      return null;

    case 'Trust Wallet':
      if ((window as any).trustwallet?.ethereum) {
        return (window as any).trustwallet.ethereum;
      }
      if (legacyProviders.length > 0) {
        const trustProvider = legacyProviders.find((p: any) => p.isTrust || p.isTrustWallet);
        if (trustProvider) return trustProvider;
      }
      if (ethereum.isTrust || ethereum.isTrustWallet) return ethereum;
      return null;

    case 'OKX Wallet':
      // OKX has its own namespace for EVM
      if ((window as any).okxwallet?.ethereum) {
        return (window as any).okxwallet.ethereum;
      }
      if (legacyProviders.length > 0) {
        const okxProvider = legacyProviders.find((p: any) => p.isOKExWallet);
        if (okxProvider) return okxProvider;
      }
      if (ethereum.isOKExWallet) return ethereum;
      return null;

    default:
      return null;
  }
};
