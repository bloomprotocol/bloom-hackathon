'use client';

import { useMemo, useEffect, useCallback, useState } from 'react';
import { ConnectionProvider, WalletProvider, useWallet } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { clusterApiUrl } from '@solana/web3.js';
import bs58 from 'bs58';
import { logger } from '@/lib/utils/logger';

interface SolanaWalletConnectorProps {
  walletName: string;
  onSuccess: (address: string, signature: string, message: string) => void;
  onError: (error: string) => void;
  onCancel: () => void;
}

// Inner component that uses useWallet hook
function SolanaConnectorInner({
  walletName,
  onSuccess,
  onError,
  onCancel
}: SolanaWalletConnectorProps) {
  const {
    wallets,
    select,
    connect,
    publicKey,
    connected,
    connecting,
    signMessage,
    wallet
  } = useWallet();

  const [stage, setStage] = useState<'selecting' | 'connecting' | 'signing' | 'done'>('selecting');
  const [error, setError] = useState<string | null>(null);

  // Find matching wallet from available wallets
  // Handle wallet name variations (e.g., "Binance Web3 Wallet" vs "Binance Wallet")
  const targetWallet = useMemo(() => {
    const normalizedName = walletName.toLowerCase();

    // Try exact match first
    let found = wallets.find(w =>
      w.adapter.name.toLowerCase() === normalizedName
    );
    if (found) return found;

    // Try partial match - wallet name contains our search term
    found = wallets.find(w =>
      w.adapter.name.toLowerCase().includes(normalizedName)
    );
    if (found) return found;

    // Try reverse partial match - our search term contains wallet name
    found = wallets.find(w =>
      normalizedName.includes(w.adapter.name.toLowerCase())
    );
    if (found) return found;

    // Special case: match by key words
    const keyWords = normalizedName.split(' ').filter(word =>
      !['web3', 'wallet', 'the'].includes(word)
    );
    found = wallets.find(w => {
      const adapterName = w.adapter.name.toLowerCase();
      return keyWords.some(word => adapterName.includes(word));
    });

    return found;
  }, [wallets, walletName]);

  // Debug: log available wallets
  useEffect(() => {
    logger.debug('[SolanaWalletConnector] Available wallets', {
      wallets: wallets.map(w => ({ name: w.adapter.name, readyState: w.adapter.readyState })),
      lookingFor: walletName,
      foundWallet: targetWallet?.adapter.name
    });
  }, [wallets, walletName, targetWallet]);

  // Step 1: Select wallet
  useEffect(() => {
    if (stage !== 'selecting') return;

    if (!targetWallet) {
      // Wait a bit for wallets to be detected
      const timer = setTimeout(() => {
        if (!targetWallet) {
          setError(`${walletName} Solana wallet not found. Please make sure it's installed and supports Solana.`);
          onError(`${walletName} Solana wallet not found`);
        }
      }, 2000);
      return () => clearTimeout(timer);
    }

    logger.debug('[SolanaWalletConnector] Selecting wallet', { wallet: targetWallet.adapter.name });
    select(targetWallet.adapter.name);
    setStage('connecting');
  }, [stage, targetWallet, walletName, select, onError]);

  // Step 2: Connect wallet
  useEffect(() => {
    if (stage !== 'connecting') return;
    if (!wallet) return;

    const doConnect = async () => {
      try {
        logger.debug('[SolanaWalletConnector] Connecting...');
        await connect();
        logger.debug('[SolanaWalletConnector] Connected!');
      } catch (err: any) {
        logger.error('[SolanaWalletConnector] Connect error', {}, err instanceof Error ? err : new Error(String(err)));
        setError(err.message || 'Failed to connect wallet');
        onError(err.message || 'Failed to connect wallet');
      }
    };

    doConnect();
  }, [stage, wallet, connect, onError]);

  // Step 3: Sign message when connected
  useEffect(() => {
    if (stage !== 'connecting') return;
    if (!connected || !publicKey || !signMessage) return;

    setStage('signing');

    const doSign = async () => {
      try {
        logger.debug('[SolanaWalletConnector] Signing message...');

        // Build SIWS-style message
        const address = publicKey.toBase58();
        const domain = window.location.host;
        const uri = window.location.origin;
        const nonce = generateNonce();
        const issuedAt = new Date().toISOString();

        const message = `${domain} wants you to sign in with your Solana account:
${address}

Sign in to Bloom Protocol

URI: ${uri}
Version: 1
Chain ID: mainnet
Nonce: ${nonce}
Issued At: ${issuedAt}`;

        const encodedMessage = new TextEncoder().encode(message);
        const signature = await signMessage(encodedMessage);
        const signatureBase58 = bs58.encode(signature);

        logger.debug('[SolanaWalletConnector] Signature obtained!');
        setStage('done');
        onSuccess(address, signatureBase58, message);
      } catch (err: any) {
        logger.error('[SolanaWalletConnector] Sign error', {}, err instanceof Error ? err : new Error(String(err)));
        setError(err.message || 'Failed to sign message');
        onError(err.message || 'Failed to sign message');
      }
    };

    doSign();
  }, [stage, connected, publicKey, signMessage, onSuccess, onError]);

  // Generate cryptographically secure nonce
  const generateNonce = () => {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  };

  // Render loading/error UI
  if (error) {
    return (
      <div className="text-center py-4">
        <div className="mb-4">
          <svg className="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="font-['Outfit'] text-gray-700 mb-2">Connection failed</p>
        <p className="font-['Outfit'] text-sm text-gray-500 mb-4">{error}</p>
        <button
          onClick={onCancel}
          className="px-4 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-all duration-200 font-['Outfit']"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="text-center py-4">
      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent mb-4"></div>
      <p className="font-['Outfit'] text-gray-700">
        {stage === 'selecting' && 'Detecting wallet...'}
        {stage === 'connecting' && (connecting ? 'Connecting...' : 'Please approve in your wallet')}
        {stage === 'signing' && 'Please sign the message in your wallet'}
        {stage === 'done' && 'Success!'}
      </p>
      <p className="font-['Outfit'] text-sm text-gray-500 mt-2">
        {walletName} • Solana Network
      </p>
    </div>
  );
}

// Wrapper component with WalletProvider
export default function SolanaWalletConnector(props: SolanaWalletConnectorProps) {
  const network = WalletAdapterNetwork.Mainnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  // Empty wallets array - Wallet Standard wallets are auto-detected
  const wallets = useMemo(() => [], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={false}>
        <SolanaConnectorInner {...props} />
      </WalletProvider>
    </ConnectionProvider>
  );
}
