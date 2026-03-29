'use client';

import { useState, useCallback } from 'react';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import {
  createTransferInstruction,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
  getAccount,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { logger } from '@/lib/utils/logger';

// Solana USDC token address (mainnet)
const SOLANA_USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
const USDC_DECIMALS = 6;

// Solana RPC from environment variable
const SOLANA_RPC_URL =
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';

// Treasury address for Solana escrow deposits (Phase 1: direct transfer)
const SOLANA_TREASURY_ADDRESS =
  process.env.NEXT_PUBLIC_SOLANA_TREASURY_ADDRESS || '';

export type SolanaEscrowStep = 'idle' | 'connecting' | 'depositing' | 'done';

/**
 * Detect first available Solana wallet provider.
 * Priority: Phantom > Backpack > Solflare > OKX Solana > Coinbase Solana
 */
function getSolanaProvider(): any | null {
  if (typeof window === 'undefined') return null;

  // Phantom
  if ((window as any).phantom?.solana?.isPhantom) {
    return (window as any).phantom.solana;
  }
  // Backpack
  if ((window as any).backpack?.solana) {
    return (window as any).backpack.solana;
  }
  // Solflare
  if ((window as any).solflare?.isSolflare) {
    return (window as any).solflare;
  }
  // OKX
  if ((window as any).okxwallet?.solana) {
    return (window as any).okxwallet.solana;
  }
  // Coinbase Solana
  if ((window as any).coinbaseSolana) {
    return (window as any).coinbaseSolana;
  }

  return null;
}

/**
 * Hook for depositing USDC via Solana into the Bloom treasury.
 * Phase 1: Direct SPL token transfer (1 tx, better UX than EVM 2-step).
 * Interface aligns with useEscrowDeposit for seamless switching.
 */
export function useSolanaEscrowDeposit() {
  const [isDepositing, setIsDepositing] = useState(false);
  const [lastTxHash, setLastTxHash] = useState<string | null>(null);
  const [step, setStep] = useState<SolanaEscrowStep>('idle');

  /**
   * Check USDC balance of the connected Solana wallet.
   */
  const checkBalance = useCallback(async (): Promise<number | null> => {
    try {
      const provider = getSolanaProvider();
      if (!provider) return null;

      // Connect if not already (some wallets need explicit connect)
      if (!provider.isConnected && !provider.publicKey) {
        await provider.connect();
      }

      const publicKey = provider.publicKey;
      if (!publicKey) return null;

      const connection = new Connection(SOLANA_RPC_URL);
      const mintPubkey = new PublicKey(SOLANA_USDC_MINT);
      const ownerPubkey = new PublicKey(publicKey.toString());
      const ata = await getAssociatedTokenAddress(mintPubkey, ownerPubkey);

      try {
        const account = await getAccount(connection, ata);
        return Number(account.amount) / 10 ** USDC_DECIMALS;
      } catch {
        // Token account doesn't exist — balance is 0
        return 0;
      }
    } catch {
      return null;
    }
  }, []);

  /**
   * Deposit USDC to the Solana treasury for one or more skills.
   * Single SPL token transfer covering the total amount.
   * @param items Array of { slug, amount }
   * @returns Transaction signature
   */
  const depositToEscrow = useCallback(
    async (items: { slug: string; amount: number }[]): Promise<string> => {
      if (!SOLANA_TREASURY_ADDRESS) {
        throw new Error(
          'Solana treasury address not configured. Please set NEXT_PUBLIC_SOLANA_TREASURY_ADDRESS.',
        );
      }

      setIsDepositing(true);
      setLastTxHash(null);
      setStep('idle');

      try {
        const provider = getSolanaProvider();
        if (!provider) {
          throw new Error(
            'No Solana wallet detected. Please install Phantom, Backpack, or another Solana wallet.',
          );
        }

        // Connect wallet
        setStep('connecting');
        if (!provider.isConnected && !provider.publicKey) {
          await provider.connect();
        }

        const senderPublicKey = provider.publicKey;
        if (!senderPublicKey) {
          throw new Error('Failed to get wallet public key');
        }

        // Validate amounts
        for (const item of items) {
          if (!Number.isFinite(item.amount) || item.amount < 1) {
            throw new Error(
              `Invalid amount for skill "${item.slug}": minimum $1 required.`,
            );
          }
        }

        const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);
        if (!Number.isFinite(totalAmount) || totalAmount < 1) {
          throw new Error('Total deposit amount must be at least $1.');
        }

        logger.info('Solana escrow deposit', {
          items: items.length,
          totalAmount,
          sender: senderPublicKey.toString(),
          treasury: SOLANA_TREASURY_ADDRESS,
        });

        // Build SPL token transfer
        setStep('depositing');
        const connection = new Connection(SOLANA_RPC_URL);
        const mintPubkey = new PublicKey(SOLANA_USDC_MINT);
        const senderPubkey = new PublicKey(senderPublicKey.toString());
        const recipientPubkey = new PublicKey(SOLANA_TREASURY_ADDRESS);

        const senderAta = await getAssociatedTokenAddress(
          mintPubkey,
          senderPubkey,
        );
        const recipientAta = await getAssociatedTokenAddress(
          mintPubkey,
          recipientPubkey,
        );

        const amountInSmallestUnit = Math.round(totalAmount * 10 ** USDC_DECIMALS);

        const transferInstruction = createTransferInstruction(
          senderAta,
          recipientAta,
          senderPubkey,
          amountInSmallestUnit,
          [],
          TOKEN_PROGRAM_ID,
        );

        const transaction = new Transaction();

        // Ensure recipient ATA exists (create if needed — payer is sender)
        try {
          await getAccount(connection, recipientAta);
        } catch {
          transaction.add(
            createAssociatedTokenAccountInstruction(
              senderPubkey,
              recipientAta,
              recipientPubkey,
              mintPubkey,
            ),
          );
        }

        transaction.add(transferInstruction);

        const { blockhash, lastValidBlockHeight } =
          await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = senderPubkey;

        // Sign and send
        const { signature } =
          await provider.signAndSendTransaction(transaction);

        // Wait for finalized confirmation (financial transaction — must be irreversible)
        await connection.confirmTransaction(
          { signature, blockhash, lastValidBlockHeight },
          'finalized',
        );

        setLastTxHash(signature);
        setStep('done');
        logger.info('Solana escrow deposit confirmed', { signature });

        return signature;
      } catch (error) {
        logger.error('Solana escrow deposit failed', { error });
        setStep('idle');
        throw error;
      } finally {
        setIsDepositing(false);
      }
    },
    [],
  );

  return {
    depositToEscrow,
    isDepositing,
    lastTxHash,
    checkBalance,
    step,
    hasWallet: typeof window !== 'undefined' && !!getSolanaProvider(),
  };
}
