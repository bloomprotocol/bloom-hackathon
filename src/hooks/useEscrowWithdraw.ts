'use client';

import { useState, useCallback } from 'react';
import { encodeFunctionData } from 'viem';
import { logger } from '@/lib/utils/logger';
import {
  ESCROW_ADDRESS,
  ESCROW_ABI,
  slugToSkillHash,
  parseUsdcAmount,
} from '@/lib/contracts/escrowAbi';
import { ensureBaseConnection, hasEvmWallet } from '@/lib/contracts/evmProvider';

/**
 * Hook for builder withdrawals from the BloomSkillEscrow contract.
 * Builder calls builderWithdraw(skillHash, amount) directly from their wallet.
 */
export function useEscrowWithdraw() {
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [lastTxHash, setLastTxHash] = useState<string | null>(null);

  /**
   * Withdraw USDC from the escrow contract.
   */
  const withdrawFromEscrow = useCallback(async (
    slug: string,
    amount: number,
  ): Promise<string> => {
    if (!ESCROW_ADDRESS) {
      throw new Error('Escrow contract address not configured');
    }

    setIsWithdrawing(true);
    setLastTxHash(null);

    try {
      const { provider, address: senderAddress } = await ensureBaseConnection();

      logger.info('Escrow withdraw', { slug, amount, sender: senderAddress });

      const data = encodeFunctionData({
        abi: ESCROW_ABI,
        functionName: 'builderWithdraw',
        args: [slugToSkillHash(slug), parseUsdcAmount(amount)],
      });

      const txHash: string = await provider.request({
        method: 'eth_sendTransaction',
        params: [{
          from: senderAddress,
          to: ESCROW_ADDRESS,
          data,
          gas: '0x' + (100000).toString(16),
        }],
      });

      setLastTxHash(txHash);
      logger.info('Escrow withdraw successful', { txHash });

      return txHash;
    } catch (error) {
      logger.error('Escrow withdraw failed', { error });
      throw error;
    } finally {
      setIsWithdrawing(false);
    }
  }, []);

  return {
    withdrawFromEscrow,
    isWithdrawing,
    lastTxHash,
    hasWallet: hasEvmWallet(),
  };
}
