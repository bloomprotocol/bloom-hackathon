'use client';

import { useCallback } from 'react';
import bs58 from 'bs58';
import type { NetworkType, DetectedWallet } from './useWalletDetection';
import { buildSIWEMessage, buildSIWSMessage, isUserRejectionError } from '@/lib/utils/auth';

/**
 * Hook for desktop wallet connection and signing
 *
 * Responsibilities:
 * - Connect to desktop wallets (EVM and Solana)
 * - Build sign messages (SIWE/SIWS style)
 * - Sign messages with wallet
 *
 * Does NOT handle:
 * - Wallet detection (use useWalletDetection)
 * - Backend authentication (use AuthContext.loginWithWallet)
 * - Mobile wallet flows (handled separately)
 * - Wallet Standard wallets (use SolanaWalletConnector component)
 */

export interface WalletConnectionResult {
  address: string;
  signature: string;
  message: string;
  networkType: NetworkType;
}

// EVM Chain configurations
const EVM_CHAINS = {
  ETH: { chainId: '0x1', chainIdDecimal: '1', name: 'Ethereum' },
  BSC: { chainId: '0x38', chainIdDecimal: '56', name: 'BNB Smart Chain' },
  BASE: { chainId: '0x2105', chainIdDecimal: '8453', name: 'Base' },
};

export const useDesktopWalletConnect = () => {

  // Get preferred chain for wallet, with fallback to ETH
  const getPreferredChain = useCallback(async (
    walletName: string,
    provider: any
  ): Promise<{ chainId: string; chainIdDecimal: string; name: string }> => {
    // Determine preferred chain based on wallet
    let preferredChain = EVM_CHAINS.ETH;

    if (walletName === 'Binance Wallet' || walletName === 'Trust Wallet') {
      preferredChain = EVM_CHAINS.BSC;
    } else if (walletName === 'Coinbase Wallet') {
      preferredChain = EVM_CHAINS.BASE;
    }

    // If preferred chain is ETH, no need to check/switch
    if (preferredChain === EVM_CHAINS.ETH) {
      return { chainId: preferredChain.chainId, chainIdDecimal: preferredChain.chainIdDecimal, name: preferredChain.name };
    }

    try {
      // Try to switch to preferred chain
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: preferredChain.chainId }],
      });
      return { chainId: preferredChain.chainId, chainIdDecimal: preferredChain.chainIdDecimal, name: preferredChain.name };
    } catch (switchError: any) {
      // Error code 4902 means chain not added, other errors mean switch failed
      // In both cases, fall back to ETH
      console.log(`[useDesktopWalletConnect] Could not switch to ${preferredChain.name}, using ETH`);
      return { chainId: EVM_CHAINS.ETH.chainId, chainIdDecimal: EVM_CHAINS.ETH.chainIdDecimal, name: EVM_CHAINS.ETH.name };
    }
  }, []);

  // Sign message with Solana wallet adapter
  const signWithSolanaAdapter = useCallback(async (adapter: any, message: string): Promise<string> => {
    const messageBytes = new TextEncoder().encode(message);
    const signatureBytes = await adapter.signMessage(messageBytes);
    // signatureBytes can be Uint8Array or { signature: Uint8Array }
    const signature = signatureBytes.signature || signatureBytes;
    return bs58.encode(signature);
  }, []);

  // Connect and sign with EVM wallet
  const connectEvmWallet = useCallback(async (
    wallet: DetectedWallet
  ): Promise<WalletConnectionResult> => {
    const provider = wallet.evmProvider;
    if (!provider) {
      throw new Error(`${wallet.name} EVM provider not found. Please ensure the wallet extension is installed.`);
    }

    // First, try to switch to preferred chain before connecting
    // This ensures user sees the correct chain from the start
    const { chainIdDecimal, name: chainName } = await getPreferredChain(wallet.name, provider);

    // Request accounts (triggers connect popup if not connected)
    const accounts = await provider.request({ method: 'eth_requestAccounts' }) as string[];
    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts returned from wallet');
    }
    const address = accounts[0];

    // Build SIWE message with the selected chain ID and name
    const message = buildSIWEMessage(address, chainIdDecimal, chainName);
    const msgHex = '0x' + Array.from(new TextEncoder().encode(message))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    const signature = await provider.request({
      method: 'personal_sign',
      params: [msgHex, address],
    }) as string;

    return {
      address,
      signature,
      message,
      networkType: 'evm',
    };
  }, [getPreferredChain]);

  // Connect and sign with Solana wallet (traditional injection, not Wallet Standard)
  const connectSolanaWallet = useCallback(async (
    wallet: DetectedWallet
  ): Promise<WalletConnectionResult> => {
    const adapter = wallet.solanaProvider || wallet.adapter;
    if (!adapter) {
      throw new Error(`${wallet.name} Solana provider not found`);
    }

    let publicKey: string;

    // Check if already connected
    if (adapter.publicKey) {
      publicKey = adapter.publicKey.toString();
    } else {
      // Connect the wallet
      const connected = await adapter.connect();
      const connectedPublicKey = connected?.publicKey || adapter.publicKey;
      if (!connectedPublicKey) {
        throw new Error('Failed to get public key after connection');
      }
      publicKey = connectedPublicKey.toString();
    }

    // Build and sign message
    const message = buildSIWSMessage(publicKey);
    const signature = await signWithSolanaAdapter(adapter, message);

    return {
      address: publicKey,
      signature,
      message,
      networkType: 'solana',
    };
  }, [signWithSolanaAdapter]);

  // Main connect function - determines which flow to use
  const connectDesktopWallet = useCallback(async (
    wallet: DetectedWallet,
    network: NetworkType
  ): Promise<WalletConnectionResult> => {
    if (network === 'evm') {
      return connectEvmWallet(wallet);
    } else {
      return connectSolanaWallet(wallet);
    }
  }, [connectEvmWallet, connectSolanaWallet]);

  // Check if user cancelled the operation (using shared utility)
  const isUserCancellation = useCallback((error: unknown): boolean => {
    return isUserRejectionError(error);
  }, []);

  return {
    connectDesktopWallet,
    connectEvmWallet,
    connectSolanaWallet,
    buildSolanaSignMessage: buildSIWSMessage,
    buildEvmSignMessage: buildSIWEMessage,
    isUserCancellation,
  };
};
