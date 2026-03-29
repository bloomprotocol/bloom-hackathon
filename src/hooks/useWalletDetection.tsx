import { useEffect, useState } from 'react';
import { useEIP6963, EIP6963ProviderDetail } from './useEIP6963';
import type { NetworkType } from '@/lib/types/auth';

export type { NetworkType };
export type SupportedNetworks = 'solana' | 'evm' | 'both';

export interface DetectedWallet {
  name: string;
  icon?: string;
  // Which networks this wallet supports
  supportedNetworks: SupportedNetworks;
  // Legacy adapter field (for Solana wallets)
  adapter?: any;
  // EVM provider (from EIP-6963 or window.ethereum)
  evmProvider?: any;
  // Solana provider
  solanaProvider?: any;
  // Use WalletConnect for connection (for mobile wallets like Binance Wallet)
  useWalletConnect?: boolean;
  // WalletConnect wallet ID for direct connection
  walletId?: string;
}

// Hook for detecting installed wallet extensions
export const useWalletDetection = () => {
  const [isReady, setIsReady] = useState(false);
  const [detectedWallets, setDetectedWallets] = useState<DetectedWallet[]>([]);
  const { providers: eip6963Providers, isReady: eip6963Ready } = useEIP6963();

  useEffect(() => {
    // Wait for EIP-6963 detection to complete
    if (!eip6963Ready) return;

    // Small delay to ensure window object is fully loaded
    const timer = setTimeout(() => {
      detectWallets(eip6963Providers);
      setIsReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, [eip6963Ready, eip6963Providers]);

  const detectWallets = (eip6963List: EIP6963ProviderDetail[]) => {
    const wallets: DetectedWallet[] = [];

    // ========== WALLET ORDER: Phantom, Binance, Coinbase, MetaMask, Backpack, Solflare ==========

    // 1. Phantom (Solana only)
    if ((window as any).phantom?.solana) {
      wallets.push({
        name: 'Phantom',
        icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxnIGNsaXAtcGF0aD0idXJsKCNjbGlwMF8yMF8yKSI+CjxwYXRoIGQ9Ik02NCAxMjhDOTkuMzQ2MiAxMjggMTI4IDk5LjM0NjIgMTI4IDY0QzEyOCAyOC42NTM4IDk5LjM0NjIgMCA2NCAwQzI4LjY1MzggMCAwIDI4LjY1MzggMCA2NEMwIDk5LjM0NjIgMjguNjUzOCAxMjggNjQgMTI4WiIgZmlsbD0idXJsKCNwYWludDBfbGluZWFyXzIwXzIpIi8+CjxwYXRoIGQ9Ik0xMTAuNjEzIDY5LjU0MjJDMTEyLjI2MyA1My4xNzMzIDEwMS42NDEgMzYuMDMxMSA4NC40MDg5IDI2Ljg4QzgwLjUzNzggMjQuODg4OSA3Ni4yMDQ0IDIzLjYyNjcgNzEuNjUzMyAyMy4xOTExQzY3LjAyMjIgMjIuNzU1NiA2Mi4yODQ0IDIzLjA4NDQgNTcuNjE3OCAyNC4yMDQ0QzQ2LjA0NDQgMjcuMDc1NiAzNS42NjIyIDMzLjYgMjguMTAyMiA0Mi41ODY3QzIwLjU0MjIgNTEuNTczMyAxNi4wNTMzIDYyLjYxMzMgMTUuMDc1NiA3NC4xMzMzQzE0LjY5MzMgNzguNzQ2NyAxNS4wNTc4IDgzLjM3NzggMTYuMTA2NyA4Ny44MzExQzE4LjU0MjIgOTguNDI2NyAyNi4xMjQ0IDEwNi45ODcgMzYuNDI2NyAxMTAuODI3QzQyLjQ3MTEgMTEzLjA2NyA0OS4xOTExIDExMy41NDcgNTUuNjk3OCAxMTIuMjEzQzY2Ljg4IDEwOS44OCA3Ni41Njg5IDEwMi44OTggODIuNTY4OSA5My4wNjY3QzgyLjU2ODkgOTMuMDY2NyA4My45Mjg5IDkwLjcwMjIgODQuNzExMSA4OS4xNTU2Qzg1LjQ5MzMgODcuNjA4OSA4Ny4xMjg5IDg3LjcxNTYgODcuMTI4OSA4Ny43MTU2Qzg3LjEyODkgODcuNzE1NiA4OC43NjQ0IDg3LjYwODkgODkuNTQ2NyA4OS4xNTU2QzkwLjMyODkgOTAuNzAyMiA5MS42ODg5IDkzLjA2NjcgOTEuNjg4OSA5My4wNjY3Qzk1LjI1MzMgMTAwLjQ5OCAxMDEuMTkxIDEwNi40NTMgMTA4LjQ2MiAxMDkuNjkzQzEwOC44ODkgMTA5Ljg4IDEwOS4zMzMgMTA5Ljk2NCAxMDkuNzk2IDEwOS45NjRDMTExLjA0IDEwOS45NjQgMTEyLjEwNyAxMDguOTYgMTEyLjEwNyAxMDcuNzE2QzExMi4xMDcgMTA3LjIxOCAxMTEuOTQ3IDEwNi43MiAxMTEuNjI3IDEwNi4yOTNDMTAzLjg0IDk1LjU5MTEgMTA2LjQgODMuMTI4OSAxMDYuNCA4My4xMjg5QzEwNi40IDgzLjEyODkgMTA4Ljk2IDg1LjkyIDExMC42MTMgNjkuNTQyMlpNNDQuMjg0NCA0NS45Mjg5QzQ0LjI4NDQgNDEuNzA2NyA0Ny42NjIyIDM4LjI4NDQgNTEuODMxMSAzOC4yODQ0QzU2LjAwODkgMzguMjg0NCA1OS4zNjg5IDQxLjcwNjcgNTkuMzY4OSA0NS45Mjg5QzU5LjM2ODkgNTAuMTUxMSA1Ni4wMDg5IDUzLjU3MzMgNTEuODMxMSA1My41NzMzQzQ3LjY2MjIgNTMuNTY0NCA0NC4yODQ0IDUwLjE0MjIgNDQuMjg0NCA0NS45Mjg5Wk02OC4yNjY3IDQ1LjkyODlDNjguMjY2NyA0MS43MDY3IDcxLjY0NDQgMzguMjg0NCA3NS44MTMzIDM4LjI4NDRDNzkuOTkxMSAzOC4yODQ0IDgzLjM1MTEgNDEuNzA2NyA4My4zNTExIDQ1LjkyODlDODMuMzUxMSA1MC4xNTExIDc5Ljk5MTEgNTMuNTczMyA3NS44MTMzIDUzLjU3MzNDNzEuNjQ0NCA1My41NjQ0IDY4LjI2NjcgNTAuMTQyMiA2OC4yNjY3IDQ1LjkyODlaIiBmaWxsPSJ1cmwoI3BhaW50MV9saW5lYXJfMjBfMikiLz4KPC9nPgo8ZGVmcz4KPGxpbmVhckdyYWRpZW50IGlkPSJwYWludDBfbGluZWFyXzIwXzIiIHgxPSI2NCIgeTE9IjAiIHgyPSI2NCIgeTI9IjEyOCIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPgo8c3RvcCBzdG9wLWNvbG9yPSIjNTM0QkI5Ii8+CjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iIzU1MUJGOSIvPgo8L2xpbmVhckdyYWRpZW50Pgo8bGluZWFyR3JhZGllbnQgaWQ9InBhaW50MV9saW5lYXJfMjBfMiIgeDE9IjY0IiB5MT0iMjMuMTA0IiB4Mj0iNjQiIHkyPSIxMTIuMTI4IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIHN0b3AtY29sb3I9IndoaXRlIi8+CjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0id2hpdGUiLz4KPC9saW5lYXJHcmFkaWVudD4KPGNsaXBQYXRoIGlkPSJjbGlwMF8yMF8yIj4KPHJlY3Qgd2lkdGg9IjEyOCIgaGVpZ2h0PSIxMjgiIGZpbGw9IndoaXRlIi8+CjwvY2xpcFBhdGg+CjwvZGVmcz4KPC9zdmc+',
        supportedNetworks: 'solana',
        solanaProvider: (window as any).phantom.solana,
        adapter: (window as any).phantom.solana,
      });
    }

    // 2. Binance Web3 Wallet (EVM + Solana via Wallet Standard)
    const hasBinanceEvm = !!(window as any).binancew3w?.ethereum ||
      (window as any).ethereum?.isBinance;
    if (hasBinanceEvm) {
      wallets.push({
        name: 'Binance Wallet',
        icon: 'https://statics.bloomprotocol.ai/icon/wallet/binance_wallet.png',
        supportedNetworks: 'both',
        evmProvider: (window as any).binancew3w?.ethereum || (window as any).ethereum,
      });
    }

    // 3. Coinbase Wallet (supports both Solana and EVM)
    const hasCoinbaseEvm = hasEip6963Provider(eip6963List, 'com.coinbase.wallet') ||
      !!(window as any).coinbaseWalletExtension ||
      (window as any).ethereum?.isCoinbaseWallet;
    const hasCoinbaseSolana = !!(window as any).coinbaseSolana;
    if (hasCoinbaseEvm || hasCoinbaseSolana) {
      wallets.push({
        name: 'Coinbase Wallet',
        icon: 'https://statics.bloomprotocol.ai/icon/wallet/base_wallet.png',
        supportedNetworks: (hasCoinbaseEvm && hasCoinbaseSolana) ? 'both' : (hasCoinbaseSolana ? 'solana' : 'evm'),
        evmProvider: getEvmProvider('Coinbase Wallet', eip6963List),
        solanaProvider: (window as any).coinbaseSolana,
      });
    }

    // 4. MetaMask (EVM + Solana via Wallet Standard)
    const hasMetaMaskEvm = hasEip6963Provider(eip6963List, 'io.metamask') || hasLegacyMetaMask();
    if (hasMetaMaskEvm) {
      wallets.push({
        name: 'MetaMask',
        icon: 'https://statics.bloomprotocol.ai/icon/wallet/metamask_wallet.svg',
        supportedNetworks: 'both',
        evmProvider: getEvmProvider('MetaMask', eip6963List),
      });
    }

    // 5. Backpack (Solana only)
    if ((window as any).backpack?.solana) {
      wallets.push({
        name: 'Backpack',
        icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiByeD0iMTAiIGZpbGw9IiMxMTExMTEiLz4KPHBhdGggZD0iTTI1IDM3LjVDMzEuOTAzNiAzNy41IDM3LjUgMzEuOTAzNiAzNy41IDI1QzM3LjUgMTguMDk2NCAzMS45MDM2IDEyLjUgMjUgMTIuNUMxOC4wOTY0IDEyLjUgMTIuNSAxOC4wOTY0IDEyLjUgMjVDMTIuNSAzMS45MDM2IDE4LjA5NjQgMzcuNSAyNSAzNy41WiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+',
        supportedNetworks: 'solana',
        solanaProvider: (window as any).backpack.solana,
        adapter: (window as any).backpack.solana,
      });
    }

    // 6. Solflare (Solana only)
    if ((window as any).solflare) {
      wallets.push({
        name: 'Solflare',
        icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGRlZnM+CjxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZGllbnQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgo8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojZmM1YzAwO3N0b3Atb3BhY2l0eToxIiAvPgo8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNmZGE2MDA7c3RvcC1vcGFjaXR5OjEiIC8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiByeD0iMTAiIGZpbGw9InVybCgjZ3JhZGllbnQpIi8+CjxwYXRoIGQ9Ik0yNSAzNUMzMC41MjI4IDM1IDM1IDMwLjUyMjggMzUgMjVDMzUgMTkuNDc3MiAzMC41MjI4IDE1IDI1IDE1QzE5LjQ3NzIgMTUgMTUgMTkuNDc3MiAxNSAyNUMxNSAzMC41MjI4IDE5LjQ3NzIgMzUgMjUgMzVaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4=',
        supportedNetworks: 'solana',
        solanaProvider: (window as any).solflare,
        adapter: (window as any).solflare,
      });
    }

    // ========== OTHER WALLETS (not in priority order) ==========

    // OKX Wallet (supports both Solana and EVM)
    const hasOkxSolana = !!(window as any).okxwallet?.solana;
    const hasOkxEvm = !!(window as any).okxwallet?.ethereum || hasEip6963Provider(eip6963List, 'com.okex.wallet');
    if (hasOkxSolana || hasOkxEvm) {
      wallets.push({
        name: 'OKX Wallet',
        icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiByeD0iMTAiIGZpbGw9ImJsYWNrIi8+CjxwYXRoIGQ9Ik0yOC4xIDIwLjlIMjEuOVYxNC43SDI4LjFWMjAuOU0zNS4zIDI4LjFIMjkuMVYyMS45SDM1LjNWMjguMU0yOC4xIDM1LjNIMjEuOVYyOS4xSDI4LjFWMzUuM00yMC45IDI4LjFIMTQuN1YyMS45SDIwLjlWMjguMU0yMC45IDIwLjlIMTQuN1YxNC43SDIwLjlWMjAuOU0zNS4zIDIwLjlIMjkuMVYxNC43SDM1LjNWMjAuOU0zNS4zIDM1LjNIMjkuMVYyOS4xSDM1LjNWMzUuM00yMC45IDM1LjNIMTQuN1YyOS4xSDIwLjlWMzUuMyIgZmlsbD0id2hpdGUiLz4KPC9zdmc+',
        supportedNetworks: 'both',
        solanaProvider: (window as any).okxwallet?.solana,
        evmProvider: getEvmProvider('OKX Wallet', eip6963List),
        adapter: (window as any).okxwallet?.solana,
      });
    }

    // Trust Wallet (supports both Solana and EVM)
    const hasTrustEvm = hasEip6963Provider(eip6963List, 'com.trustwallet.app') ||
      !!(window as any).trustwallet?.ethereum ||
      (window as any).ethereum?.isTrust ||
      (window as any).ethereum?.isTrustWallet;
    const hasTrustSolana = !!(window as any).trustwallet?.solana;
    if (hasTrustEvm || hasTrustSolana) {
      wallets.push({
        name: 'Trust Wallet',
        icon: 'https://statics.bloomprotocol.ai/icon/wallet/trust_wallet.svg',
        supportedNetworks: (hasTrustEvm && hasTrustSolana) ? 'both' : (hasTrustSolana ? 'solana' : 'evm'),
        evmProvider: getEvmProvider('Trust Wallet', eip6963List),
        solanaProvider: (window as any).trustwallet?.solana,
      });
    }

    setDetectedWallets(wallets);
  };

  // Helper: Check if EIP-6963 has a provider with given RDNS
  const hasEip6963Provider = (providers: EIP6963ProviderDetail[], rdnsPattern: string): boolean => {
    return providers.some(p => p.info.rdns.includes(rdnsPattern));
  };

  // Helper: Check for legacy MetaMask (without EIP-6963)
  const hasLegacyMetaMask = (): boolean => {
    const ethereum = (window as any).ethereum;
    if (!ethereum) return false;

    // Check providers array
    const providers = ethereum.providers || [];
    if (providers.length > 0) {
      return providers.some((p: any) =>
        p.isMetaMask && !p.isOKExWallet && !p.isBraveWallet && !p.isCoinbaseWallet && !p.isTrust
      );
    }

    // Check ethereum directly
    return ethereum.isMetaMask && !ethereum.isOKExWallet && !ethereum.isBraveWallet && !ethereum.isCoinbaseWallet && !ethereum.isTrust;
  };

  // Helper: Get EVM provider for a wallet
  const getEvmProvider = (walletName: string, eip6963List: EIP6963ProviderDetail[]): any => {
    // RDNS patterns for wallets
    const rdnsMap: Record<string, string> = {
      'MetaMask': 'io.metamask',
      'Coinbase Wallet': 'com.coinbase.wallet',
      'Trust Wallet': 'com.trustwallet.app',
      'OKX Wallet': 'com.okex.wallet',
    };

    const rdns = rdnsMap[walletName];

    // Try EIP-6963 first
    if (rdns) {
      const eip6963Provider = eip6963List.find(p => p.info.rdns.includes(rdns));
      if (eip6963Provider) return eip6963Provider.provider;
    }

    // Fallback to legacy detection
    const ethereum = (window as any).ethereum;
    if (!ethereum) return null;

    const providers = ethereum.providers || [];

    switch (walletName) {
      case 'MetaMask':
        if (providers.length > 0) {
          const p = providers.find((p: any) => p.isMetaMask && !p.isOKExWallet && !p.isBraveWallet && !p.isCoinbaseWallet && !p.isTrust);
          if (p) return p;
        }
        if (ethereum.isMetaMask && !ethereum.isOKExWallet && !ethereum.isBraveWallet && !ethereum.isCoinbaseWallet && !ethereum.isTrust) {
          return ethereum;
        }
        return null;

      case 'Coinbase Wallet':
        if ((window as any).coinbaseWalletExtension) return (window as any).coinbaseWalletExtension;
        if (providers.length > 0) {
          const p = providers.find((p: any) => p.isCoinbaseWallet);
          if (p) return p;
        }
        if (ethereum.isCoinbaseWallet) return ethereum;
        return null;

      case 'Trust Wallet':
        if ((window as any).trustwallet?.ethereum) return (window as any).trustwallet.ethereum;
        if (providers.length > 0) {
          const p = providers.find((p: any) => p.isTrust || p.isTrustWallet);
          if (p) return p;
        }
        if (ethereum.isTrust || ethereum.isTrustWallet) return ethereum;
        return null;

      case 'OKX Wallet':
        if ((window as any).okxwallet?.ethereum) return (window as any).okxwallet.ethereum;
        if (providers.length > 0) {
          const p = providers.find((p: any) => p.isOKExWallet);
          if (p) return p;
        }
        if (ethereum.isOKExWallet) return ethereum;
        return null;

      default:
        return null;
    }
  };

  // Filter wallets by network type
  const getSolanaOnlyWallets = () => detectedWallets.filter(w => w.supportedNetworks === 'solana');
  const getEvmOnlyWallets = () => detectedWallets.filter(w => w.supportedNetworks === 'evm');
  const getMultiNetworkWallets = () => detectedWallets.filter(w => w.supportedNetworks === 'both');

  return {
    isReady,
    detectedWallets,
    solanaOnlyWallets: getSolanaOnlyWallets(),
    evmOnlyWallets: getEvmOnlyWallets(),
    multiNetworkWallets: getMultiNetworkWallets(),
    refreshDetection: () => detectWallets(eip6963Providers),
  };
};
