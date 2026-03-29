'use client';

import { useState, useCallback } from 'react';
import { encodeFunctionData } from 'viem';
import { logger } from '@/lib/utils/logger';
import { EXCLUSIVE_PASS_ADDRESS } from '@/lib/contracts/exclusivePassAbi';
import { EXCLUSIVE_PASS_ABI, slugToSkillHash } from '@/lib/contracts/escrowAbi';
import { ensureBaseConnection, hasEvmWallet } from '@/lib/contracts/evmProvider';

/**
 * Hook for minting a BloomExclusivePass (soulbound NFT) after builder claim.
 * Builder calls mint(bytes32 skillHash) directly from their wallet.
 */
export function useExclusivePassMint() {
  const [isMinting, setIsMinting] = useState(false);
  const [lastTxHash, setLastTxHash] = useState<string | null>(null);

  /**
   * Mint an Exclusive Pass for a claimed skill.
   */
  const mintPass = useCallback(async (slug: string): Promise<string> => {
    if (!EXCLUSIVE_PASS_ADDRESS) {
      throw new Error('Exclusive Pass contract address not configured');
    }

    setIsMinting(true);
    setLastTxHash(null);

    try {
      const { provider, address: senderAddress } = await ensureBaseConnection();

      logger.info('Exclusive Pass mint', { slug, sender: senderAddress });

      const data = encodeFunctionData({
        abi: EXCLUSIVE_PASS_ABI,
        functionName: 'mint',
        args: [slugToSkillHash(slug)],
      });

      const txHash: string = await provider.request({
        method: 'eth_sendTransaction',
        params: [{
          from: senderAddress,
          to: EXCLUSIVE_PASS_ADDRESS,
          data,
          gas: '0x' + (150000).toString(16),
        }],
      });

      setLastTxHash(txHash);
      logger.info('Exclusive Pass minted', { txHash });

      return txHash;
    } catch (error) {
      logger.error('Exclusive Pass mint failed', { error });
      throw error;
    } finally {
      setIsMinting(false);
    }
  }, []);

  return {
    mintPass,
    isMinting,
    lastTxHash,
    hasWallet: hasEvmWallet(),
  };
}
