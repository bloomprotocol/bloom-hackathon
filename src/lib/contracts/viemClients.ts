/**
 * Shared viem public clients for read-only on-chain calls.
 * Wallet write operations still use window.ethereum (injected provider).
 */
import { createPublicClient, http } from 'viem';
import { base, bsc } from 'viem/chains';

export const baseClient = createPublicClient({
  chain: base,
  transport: http(),
});

export const bscClient = createPublicClient({
  chain: bsc,
  transport: http(),
});
