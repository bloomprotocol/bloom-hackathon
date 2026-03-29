import { apiGet, apiPost } from '@/lib/api/apiConfig';
import { logger } from '@/lib/utils/logger';

interface X402WalletData {
  network: 'BSC' | 'Solana' | 'Base';
  walletAddress: string;
}

interface ApiResponse<T> {
  success?: boolean;
  data?: T;
}

/**
 * Auto-initialize x402 wallet link after login.
 * Fire-and-forget: errors are logged, never thrown.
 */
export async function autoInitX402Wallet(
  walletAddress: string,
  networkType: 'solana' | 'evm',
  userId: string
): Promise<void> {
  if (!walletAddress) return;

  const x402Network = networkType === 'solana' ? 'Solana' : 'Base';

  try {
    // Check if wallet already exists for this network
    const walletsResponse = await apiGet(`/x402/user/${userId}/wallets`) as ApiResponse<X402WalletData[]>;
    const existingNetworks = (walletsResponse?.data || []).map(w => w.network);

    if (existingNetworks.includes(x402Network)) {
      return; // Already initialized
    }

    // Create the x402 wallet link
    await apiPost('/users/wallet-address', {
      network: x402Network,
      walletAddress,
    });
  } catch (error) {
    // Silent failure - user can always init from /profile/x402
    const err = error as { response?: { status: number }; status?: number };
    if (err.response?.status !== 404 && err.status !== 404) {
      logger.warn('[x402AutoInit] Failed to auto-init wallet', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}
