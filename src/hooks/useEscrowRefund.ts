'use client';

import { useState, useCallback } from 'react';
import { encodeFunctionData } from 'viem';
import { logger } from '@/lib/utils/logger';
import {
  ESCROW_ADDRESS,
  ESCROW_ABI,
  slugToSkillHash,
} from '@/lib/contracts/escrowAbi';
import { baseClient } from '@/lib/contracts/viemClients';
import { ensureBaseConnection, hasEvmWallet } from '@/lib/contracts/evmProvider';

/**
 * Hook for backer self-service refunds from the BloomSkillEscrow contract.
 * Allows backers to reclaim USDC after 90 days if the skill is unclaimed.
 */
export function useEscrowRefund() {
  const [isRefunding, setIsRefunding] = useState(false);
  const [lastTxHash, setLastTxHash] = useState<string | null>(null);

  /**
   * Check if a backer is eligible for a refund on a skill.
   */
  const checkRefundEligibility = useCallback(async (
    slug: string,
  ): Promise<{ eligible: boolean; eligibleAt: number } | null> => {
    try {
      const { address } = await ensureBaseConnection();

      const result = await baseClient.readContract({
        address: ESCROW_ADDRESS as `0x${string}`,
        abi: ESCROW_ABI,
        functionName: 'isRefundEligible',
        args: [slugToSkillHash(slug), address],
      });

      // Returns [bool eligible, uint256 eligibleAt]
      const [eligible, eligibleAt] = result as [boolean, bigint];
      return { eligible, eligibleAt: Number(eligibleAt) };
    } catch {
      return null;
    }
  }, []);

  /**
   * Claim a refund for a skill after 90 days.
   */
  const claimRefund = useCallback(async (slug: string): Promise<string> => {
    if (!ESCROW_ADDRESS) {
      throw new Error('Escrow contract address not configured');
    }

    setIsRefunding(true);
    setLastTxHash(null);

    try {
      const { provider, address: senderAddress } = await ensureBaseConnection();

      logger.info('Escrow refund', { slug, sender: senderAddress });

      const data = encodeFunctionData({
        abi: ESCROW_ABI,
        functionName: 'claimRefund',
        args: [slugToSkillHash(slug)],
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
      logger.info('Escrow refund successful', { txHash });

      return txHash;
    } catch (error) {
      logger.error('Escrow refund failed', { error });
      throw error;
    } finally {
      setIsRefunding(false);
    }
  }, []);

  return {
    claimRefund,
    checkRefundEligibility,
    isRefunding,
    lastTxHash,
    hasWallet: hasEvmWallet(),
  };
}
