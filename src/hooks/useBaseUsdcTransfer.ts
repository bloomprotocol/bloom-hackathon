'use client';

import { useState, useCallback } from 'react';
import { encodeFunctionData } from 'viem';
import { logger } from '@/lib/utils/logger';
import { ERC20_ABI, BASE_USDC_ADDRESS, USDC_DECIMALS, parseUsdcAmount } from '@/lib/contracts/escrowAbi';
import { baseClient } from '@/lib/contracts/viemClients';
import { ensureBaseConnection, hasEvmWallet } from '@/lib/contracts/evmProvider';

// Treasury address from env
const TREASURY_ADDRESS = process.env.NEXT_PUBLIC_BLOOM_TREASURY_ADDRESS || '';

/**
 * Hook for sending USDC transfers on Base chain.
 * Supports injected wallets (Coinbase Wallet, MetaMask, etc.).
 */
export function useBaseUsdcTransfer() {
  const [isTransferring, setIsTransferring] = useState(false);
  const [lastTxHash, setLastTxHash] = useState<string | null>(null);

  /**
   * Check USDC balance of the connected wallet on Base chain.
   */
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
   * Send USDC transfer on Base chain.
   * @param amount - Total USDC amount to transfer
   * @param toAddress - Optional recipient address (defaults to treasury)
   * @returns Transaction hash
   */
  const sendTransfer = useCallback(async (amount: number, toAddress?: string): Promise<string> => {
    const recipientAddress = toAddress || TREASURY_ADDRESS;
    if (!recipientAddress) {
      throw new Error('Recipient address not configured');
    }

    setIsTransferring(true);
    setLastTxHash(null);

    try {
      const { provider, address: senderAddress } = await ensureBaseConnection();

      logger.info('Base USDC transfer', {
        amount,
        recipient: recipientAddress,
        sender: senderAddress,
        token: BASE_USDC_ADDRESS,
      });

      const data = encodeFunctionData({
        abi: ERC20_ABI,
        functionName: 'transfer',
        args: [recipientAddress as `0x${string}`, parseUsdcAmount(amount)],
      });

      const txHash: string = await provider.request({
        method: 'eth_sendTransaction',
        params: [{
          from: senderAddress,
          to: BASE_USDC_ADDRESS,
          data,
          gas: '0x' + (100000).toString(16),
        }],
      });

      setLastTxHash(txHash);
      logger.info('Base USDC transfer successful', { txHash });

      return txHash;
    } catch (error) {
      logger.error('Base USDC transfer failed', { error });
      throw error;
    } finally {
      setIsTransferring(false);
    }
  }, []);

  return {
    sendTransfer,
    checkBalance,
    isTransferring,
    lastTxHash,
    hasWallet: hasEvmWallet(),
  };
}
