/**
 * Shared EVM provider utilities for injected wallets.
 * Handles wallet detection, account connection, and chain switching.
 */
import { createWalletClient, custom } from 'viem';
import { base } from 'viem/chains';
import type { WalletClient, Address } from 'viem';

const BASE_CHAIN_ID = '0x2105'; // 8453

/**
 * Get the injected EVM provider (Coinbase Wallet, MetaMask, etc.)
 */
export function getEvmProvider(): any | null {
  if (typeof window === 'undefined') return null;
  if ((window as any).coinbaseWalletExtension) return (window as any).coinbaseWalletExtension;
  if ((window as any).ethereum) return (window as any).ethereum;
  return null;
}

/**
 * Check if an EVM wallet is available.
 */
export function hasEvmWallet(): boolean {
  return getEvmProvider() !== null;
}

/**
 * Connect to injected wallet and switch to Base chain.
 * Returns the connected address.
 */
export async function ensureBaseConnection(): Promise<{ provider: any; address: Address }> {
  const provider = getEvmProvider();
  if (!provider) {
    throw new Error('No EVM wallet detected. Please install Coinbase Wallet or MetaMask.');
  }

  const accounts = await provider.request({ method: 'eth_requestAccounts' });
  if (!accounts || accounts.length === 0) {
    throw new Error('No accounts available. Please connect your wallet.');
  }

  try {
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: BASE_CHAIN_ID }],
    });
  } catch (switchError: any) {
    if (switchError.code === 4902) {
      await provider.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: BASE_CHAIN_ID,
          chainName: 'Base',
          rpcUrls: ['https://mainnet.base.org'],
          nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
          blockExplorerUrls: ['https://basescan.org/'],
        }],
      });
    } else {
      throw switchError;
    }
  }

  return { provider, address: accounts[0] as Address };
}

/**
 * Create a viem WalletClient from the injected provider for Base chain.
 */
export function createBaseWalletClient(provider: any, account: Address): WalletClient {
  return createWalletClient({
    account,
    chain: base,
    transport: custom(provider),
  });
}

/**
 * Poll for a transaction receipt until it is mined.
 */
export async function waitForReceipt(
  provider: any,
  txHash: string,
  maxAttempts = 60,
  intervalMs = 2000,
): Promise<void> {
  for (let i = 0; i < maxAttempts; i++) {
    const receipt = await provider.request({
      method: 'eth_getTransactionReceipt',
      params: [txHash],
    });
    if (receipt) {
      if (receipt.status === '0x0') {
        throw new Error(`Transaction reverted: ${txHash}`);
      }
      return;
    }
    await new Promise(r => setTimeout(r, intervalMs));
  }
  throw new Error(`Transaction not confirmed in time: ${txHash}`);
}
