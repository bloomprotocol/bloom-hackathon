'use client';

import { useState, useCallback } from 'react';
import { encodeFunctionData } from 'viem';
import { logger } from '@/lib/utils/logger';
import {
  ESCROW_ADDRESS,
  ESCROW_ABI,
  ERC20_ABI,
  BASE_USDC_ADDRESS,
  USDC_DECIMALS,
  slugToSkillHash,
  parseUsdcAmount,
} from '@/lib/contracts/escrowAbi';
import { baseClient } from '@/lib/contracts/viemClients';
import { ensureBaseConnection, hasEvmWallet, waitForReceipt } from '@/lib/contracts/evmProvider';

export type EscrowStep = 'idle' | 'approving' | 'depositing' | 'done';

/**
 * Hook for depositing USDC into the BloomSkillEscrow contract.
 * Two-step flow: approve USDC spending → deposit to escrow.
 * Supports single and batch deposits.
 */
export function useEscrowDeposit() {
  const [isDepositing, setIsDepositing] = useState(false);
  const [lastTxHash, setLastTxHash] = useState<string | null>(null);
  const [step, setStep] = useState<EscrowStep>('idle');

  const checkBalance = useCallback(async (): Promise<number | null> => {
    try {
      const { address } = await ensureBaseConnection();

      const balance = await baseClient.readContract({
        address: BASE_USDC_ADDRESS as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [address],
      });

      return Number(balance) / (10 ** USDC_DECIMALS);
    } catch {
      return null;
    }
  }, []);

  /**
   * Deposit USDC into the escrow contract for one or more skills.
   * Handles approve + deposit in two steps.
   */
  const depositToEscrow = useCallback(async (
    items: { slug: string; amount: number }[],
  ): Promise<string> => {
    if (!ESCROW_ADDRESS) {
      throw new Error('Escrow contract address not configured');
    }

    setIsDepositing(true);
    setLastTxHash(null);
    setStep('idle');

    try {
      const { provider, address: senderAddress } = await ensureBaseConnection();

      const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

      logger.info('Escrow deposit', { items: items.length, totalAmount, sender: senderAddress });

      // Step 1: Approve USDC spending
      setStep('approving');
      const approveData = encodeFunctionData({
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [ESCROW_ADDRESS as `0x${string}`, parseUsdcAmount(totalAmount)],
      });

      const approveTxHash: string = await provider.request({
        method: 'eth_sendTransaction',
        params: [{
          from: senderAddress,
          to: BASE_USDC_ADDRESS,
          data: approveData,
          gas: '0x' + (60000).toString(16),
        }],
      });

      await waitForReceipt(provider, approveTxHash);

      // Step 2: Deposit to escrow
      setStep('depositing');

      let depositData: string;
      let gasEstimate: number;

      if (items.length === 1) {
        depositData = encodeFunctionData({
          abi: ESCROW_ABI,
          functionName: 'deposit',
          args: [slugToSkillHash(items[0].slug), parseUsdcAmount(items[0].amount)],
        });
        gasEstimate = 150000;
      } else {
        const skillHashes = items.map(i => slugToSkillHash(i.slug));
        const amounts = items.map(i => parseUsdcAmount(i.amount));

        depositData = encodeFunctionData({
          abi: ESCROW_ABI,
          functionName: 'depositBatch',
          args: [skillHashes, amounts],
        });
        gasEstimate = 100000 + items.length * 60000;
      }

      const txHash: string = await provider.request({
        method: 'eth_sendTransaction',
        params: [{
          from: senderAddress,
          to: ESCROW_ADDRESS,
          data: depositData,
          gas: '0x' + gasEstimate.toString(16),
        }],
      });

      // Wait for deposit tx to be mined (C-1 fix: prevent phantom backings)
      await waitForReceipt(provider, txHash);

      setLastTxHash(txHash);
      setStep('done');
      logger.info('Escrow deposit confirmed', { txHash });

      return txHash;
    } catch (error) {
      logger.error('Escrow deposit failed', { error });
      setStep('idle');
      throw error;
    } finally {
      setIsDepositing(false);
    }
  }, []);

  return {
    depositToEscrow,
    isDepositing,
    lastTxHash,
    checkBalance,
    step,
    hasWallet: hasEvmWallet(),
  };
}
