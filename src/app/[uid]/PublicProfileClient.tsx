'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { BaseModal } from '@/components/ui';
import { useBSCTransaction } from '@/hooks/useBSCTransaction';
import { useSolanaTransaction } from '@/hooks/useSolanaTransaction';
import { useBaseUsdcTransfer } from '@/hooks/useBaseUsdcTransfer';
import { logger } from '@/lib/utils/logger';

type PaymentNetwork = 'BSC' | 'Solana' | 'Base';

interface PublicProfileClientProps {
  userId: string;
  initialWalletAddress: string;
  displayName?: string;
  bio?: string;
  externalLinks?: Array<{ type: string; url: string }>;
  avatarUrl?: string | null;
  xProfileImageUrl?: string | null;
  xUsername?: string | null;
  xDisplayName?: string | null;
  availableNetworks: Array<'BSC' | 'Solana' | 'Base'>;
  defaultNetwork: 'BSC' | 'Solana' | 'Base';
}

export default function PublicProfileClient({
  userId,
  initialWalletAddress,
  displayName,
  bio,
  externalLinks,
  avatarUrl,
  xProfileImageUrl,
  xUsername,
  xDisplayName,
  availableNetworks,
  defaultNetwork
}: PublicProfileClientProps) {
  // Display name priority: custom displayName > X display name > X username > User #[uid]
  const actualDisplayName = displayName || xDisplayName || xUsername || `User #${userId}`;
  const router = useRouter();

  // Initialize transaction hooks
  const bscHook = useBSCTransaction();
  const solanaHook = useSolanaTransaction();
  const baseHook = useBaseUsdcTransfer();

  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  const [selectedNetwork, setSelectedNetwork] = useState<PaymentNetwork>(defaultNetwork);
  const [isProcessing, setIsProcessing] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recipientWalletAddress, setRecipientWalletAddress] = useState<string | null>(initialWalletAddress);
  const [loading, setLoading] = useState(false);
  const [shouldShakeConnectButton, setShouldShakeConnectButton] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'timeout'>('idle');
  const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutStartTimeRef = useRef<number | null>(null);
  const remainingTimeRef = useRef<number>(15000);

  // Track previous network to detect changes
  const prevNetworkRef = useRef<PaymentNetwork>(selectedNetwork);

  // Get the current hook based on selected network
  // Base uses useBaseUsdcTransfer which has a different API shape
  const currentHook = selectedNetwork === 'Base' ? null : (selectedNetwork === 'BSC' ? bscHook : solanaHook);
  const isConnected = selectedNetwork === 'Base' ? baseHook.hasWallet : currentHook?.isConnected ?? false;
  const address = selectedNetwork === 'Base' ? null : currentHook?.address;
  const isOKXInstalled = selectedNetwork === 'Base' ? baseHook.hasWallet : currentHook?.isOKXInstalled ?? false;

  // Disconnect other wallet when network changes (separate effect to avoid deps issues)
  useEffect(() => {
    const prevNetwork = prevNetworkRef.current;

    // Only disconnect if network actually changed
    if (prevNetwork !== selectedNetwork) {
      if (prevNetwork !== 'Base') {
        const hookToDisconnect = prevNetwork === 'BSC' ? bscHook : solanaHook;
        if (hookToDisconnect.isConnected && hookToDisconnect.disconnect) {
          console.log(`[NETWORK SWITCH] Disconnecting ${prevNetwork} wallet...`);
          hookToDisconnect.disconnect();
        }
      }

      // Update ref
      prevNetworkRef.current = selectedNetwork;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedNetwork]); // Only depend on selectedNetwork, not hook objects (they change every render)

  // Trigger shake animation when needed
  useEffect(() => {
    if (shouldShakeConnectButton) {
      const timer = setTimeout(() => setShouldShakeConnectButton(false), 600);
      return () => clearTimeout(timer);
    }
  }, [shouldShakeConnectButton]);

  // Monitor connection status and handle timeout
  useEffect(() => {
    // When connected, clear timeout and reset status
    if (isConnected) {
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
        connectionTimeoutRef.current = null;
      }
      setConnectionStatus('idle');
    }

    // Cleanup on unmount
    return () => {
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
      }
    };
  }, [isConnected]);

  // Handle timeout status display
  useEffect(() => {
    if (connectionStatus === 'timeout') {
      const timer = setTimeout(() => {
        setConnectionStatus('idle');
        remainingTimeRef.current = 15000; // Reset for next time
      }, 1500); // Show "Oops" message for 1.5 seconds
      return () => clearTimeout(timer);
    }
  }, [connectionStatus]);

  // Pause/resume timeout when page loses/gains focus
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (connectionStatus !== 'connecting') return;

      if (document.hidden) {
        // Page hidden (user went to OKX App) - pause timeout
        if (connectionTimeoutRef.current && timeoutStartTimeRef.current) {
          clearTimeout(connectionTimeoutRef.current);
          const elapsed = Date.now() - timeoutStartTimeRef.current;
          remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed);
          console.log('[TIMEOUT] Paused. Remaining:', remainingTimeRef.current, 'ms');
        }
      } else {
        // Page visible (user returned) - resume timeout
        if (connectionStatus === 'connecting' && remainingTimeRef.current > 0) {
          console.log('[TIMEOUT] Resumed. Remaining:', remainingTimeRef.current, 'ms');
          timeoutStartTimeRef.current = Date.now();
          connectionTimeoutRef.current = setTimeout(() => {
            setConnectionStatus('timeout');
          }, remainingTimeRef.current);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [connectionStatus]);

  // Fetch wallet address when network changes (default network wallet already loaded from server)
  useEffect(() => {
    // Clear transaction hash when network changes
    setTxHash(null);
    // Clear processing state when network changes
    setIsProcessing(false);
    // Clear errors when network changes
    setError(null);

    // Skip if still on default network (already have initial wallet)
    if (selectedNetwork === defaultNetwork) {
      setRecipientWalletAddress(initialWalletAddress);
      return;
    }

    const fetchWalletAddress = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch wallet for different network (e.g., Solana)
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';
        const response = await fetch(`${apiUrl}/x402/user/${userId}/wallet?network=${selectedNetwork}`);

        if (!response.ok) {
          // User doesn't have wallet for this network
          setRecipientWalletAddress(null);
          setError(`No ${selectedNetwork} wallet configured for this user`);
          return;
        }

        const result = await response.json();

        if (result.data?.walletAddress) {
          setRecipientWalletAddress(result.data.walletAddress);
          setError(null);
        } else {
          setRecipientWalletAddress(null);
          setError(`No ${selectedNetwork} wallet configured for this user`);
        }
      } catch (error) {
        logger.error('Failed to fetch wallet address', { error });
        setRecipientWalletAddress(null);
        setError('Failed to load wallet address');
      } finally {
        setLoading(false);
      }
    };

    fetchWalletAddress();
  }, [userId, selectedNetwork, initialWalletAddress, defaultNetwork]); // Re-fetch when network changes

  // Get token label for the current network
  const tokenLabel = selectedNetwork === 'BSC' ? 'USDT' : 'USDC';

  // Error handling helper
  const handlePaymentError = (err: any) => {
    if (err.code === 4001) {
      setError('Transaction cancelled by user');
    } else if (err.code === -32002) {
      setError('Please check your wallet - a request is pending');
    } else if (err.message?.includes('insufficient')) {
      setError(`Insufficient ${tokenLabel} balance`);
    } else if (err.message?.includes('Failed to get wallet address')) {
      setError('Failed to connect wallet. Please try again.');
    } else {
      setError(err.message || 'Transaction failed. Please try again.');
    }
  };

  const handlePayment = async (amount: number, isCustomAmount: boolean = false) => {
    setSelectedAmount(amount);
    setError(null);
    setTxHash(null);

    // Check if wallet address is still loading
    if (loading) {
      setError(`Loading ${selectedNetwork} wallet address...`);
      return;
    }

    // Check if wallet address is loaded
    if (!recipientWalletAddress) {
      setError(`No ${selectedNetwork} wallet configured for this user`);
      return;
    }

    // Check if wallet is available
    if (!isOKXInstalled) {
      if (selectedNetwork === 'Base') {
        setError('No EVM wallet detected. Please install Coinbase Wallet or MetaMask.');
      } else {
        setError('Please install OKX Wallet to send payment');
        window.open('https://www.okx.com/web3', '_blank');
      }
      return;
    }

    // For non-Base networks, check connection and shake button
    if (selectedNetwork !== 'Base' && !isConnected) {
      console.log('Wallet not connected. Shaking Connect Wallet button...');
      setShouldShakeConnectButton(true);
      setError('Please connect your wallet first');
      return;
    }

    // Execute payment
    setIsProcessing(true);

    try {
      let transactionHash: string;

      if (selectedNetwork === 'Base') {
        // Base uses useBaseUsdcTransfer — sends to recipient address
        transactionHash = await baseHook.sendTransfer(amount, recipientWalletAddress!);
      } else {
        // BSC/Solana use OKX-based hooks
        transactionHash = await currentHook!.sendPayment(amount, recipientWalletAddress, isCustomAmount);
      }

      setTxHash(transactionHash);
      console.log('Payment successful:', transactionHash);
      console.log('Amount displayed:', amount, tokenLabel);
      console.log('Recipient:', recipientWalletAddress);

      // Clear selected amount after successful transaction
      setSelectedAmount(null);

      // TODO: Save to backend when endpoint is ready
      // await fetch('/api/payments/record', {
      //   method: 'POST',
      //   body: JSON.stringify({
      //     userId,
      //     amount,
      //     txHash: transactionHash,
      //     senderAddress: address,
      //     network: 'BSC'
      //   })
      // });

    } catch (err: any) {
      logger.error('Payment failed', { error: err });
      handlePaymentError(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCustomPayment = async () => {
    if (!customAmount || parseFloat(customAmount) <= 0) return;
    const amount = parseFloat(customAmount);
    setShowCustomModal(false);
    setCustomAmount('');
    // Pass true for isCustomAmount to use the actual amount
    await handlePayment(amount, true);
  };

  return (
    <>
      {/* Background */}
      <div className="fixed inset-0 bg-[#f8f9fa] -z-10" />

      {/* Page Content */}
      <div className="min-h-screen font-[family-name:var(--font-outfit)] flex items-center justify-center">
        <div className="mx-auto max-w-[480px] w-full px-4">
          <div className="common-container-style p-8">
            {/* Profile Header */}
            <header className="mb-8">
              <div className="flex items-center gap-4 mb-4 justify-center">
                {/* Avatar: xProfileImageUrl > avatarUrl > fallback */}
                {(xProfileImageUrl || avatarUrl) ? (
                  <img
                    src={(xProfileImageUrl || avatarUrl) as string}
                    alt={actualDisplayName}
                    className="w-[52px] h-[52px] rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-[52px] h-[52px] rounded-full bg-white border-[3px] border-[#eb7cff] flex items-center justify-center overflow-hidden flex-shrink-0">
                    <div className="w-full h-full bg-gradient-to-br from-purple-200 to-pink-200 flex items-center justify-center text-lg font-bold text-[#eb7cff]">
                      {actualDisplayName.charAt(0)}
                    </div>
                  </div>
                )}

                {/* Display Name and Social Links - Column Layout */}
                <div className="flex flex-col gap-1 flex-shrink-0">
                  {/* Display Name */}
                  <h1 className="text-base font-semibold text-[#393f49]">{actualDisplayName}</h1>

                  {/* Social Links */}
                  {externalLinks && externalLinks.length > 0 && (
                    <div className="flex gap-3">
                      {externalLinks.map((link, index) => {
                        const linkIcons: Record<string, string> = {
                          twitter: 'https://statics.bloomprotocol.ai/icon/remix-twitter-x-line.svg',
                          github: 'https://statics.bloomprotocol.ai/icon/remix-github-fill.svg',
                          website: 'https://statics.bloomprotocol.ai/icon/hi-globe-alt.svg',
                          telegram: 'https://statics.bloomprotocol.ai/icon/hi-globe-alt.svg',
                          discord: 'https://statics.bloomprotocol.ai/icon/hi-globe-alt.svg',
                          linkedin: 'https://statics.bloomprotocol.ai/icon/hi-globe-alt.svg'
                        };

                        return (
                          <a
                            key={index}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative flex items-center justify-center hover:opacity-90 transition-opacity"
                            title={link.type}
                          >
                            <img src={linkIcons[link.type] || linkIcons.website} alt={link.type} className="w-4 h-4 relative" />
                          </a>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Bio */}
              {bio && (
                <p className="text-sm text-[#696f8c] leading-relaxed text-center max-w-md mx-auto">{bio}</p>
              )}
            </header>

            {/* Network Selection - Only show if multiple networks available */}
            {availableNetworks.length > 1 && (
              <div className="mb-6">
                <div className="flex justify-center gap-3">
                  {availableNetworks.includes('Base') && (
                    <button
                      onClick={() => setSelectedNetwork('Base')}
                      className={`px-4 py-2 rounded-[16px] text-sm font-medium bg-white transition-colors flex items-center gap-2 ${
                        selectedNetwork === 'Base'
                          ? 'border-[3px] border-[#0052FF] text-[#393f49]'
                          : 'border border-[#e6e8ec] text-[#696f8c]'
                      }`}
                    >
                      <img src="https://statics.bloomprotocol.ai/icon/BASE.png" alt="Base" className="w-4 h-4" />
                      Base
                    </button>
                  )}
                  {availableNetworks.includes('Solana') && (
                    <button
                      onClick={() => setSelectedNetwork('Solana')}
                      className={`px-4 py-2 rounded-[16px] text-sm font-medium bg-white transition-colors flex items-center gap-2 ${
                        selectedNetwork === 'Solana'
                          ? 'border-[3px] border-[#9b6bff] text-[#393f49]'
                          : 'border border-[#e6e8ec] text-[#696f8c]'
                      }`}
                    >
                      <img src="https://statics.bloomprotocol.ai/icon/SOLANA.png" alt="Solana" className="w-4 h-4" />
                      Solana
                    </button>
                  )}
                  {availableNetworks.includes('BSC') && (
                    <button
                      onClick={() => setSelectedNetwork('BSC')}
                      className={`px-4 py-2 rounded-[16px] text-sm font-medium bg-white transition-colors flex items-center gap-2 ${
                        selectedNetwork === 'BSC'
                          ? 'border-[3px] border-[#eb7cff] text-[#393f49]'
                          : 'border border-[#e6e8ec] text-[#696f8c]'
                      }`}
                    >
                      <img src="https://statics.bloomprotocol.ai/icon/BSC.png" alt="BSC" className="w-4 h-4" />
                      BSC
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="mb-6 text-center">
                <p className="text-sm text-[#696f8c]">Loading payment information...</p>
              </div>
            )}

            {/* Payment Options */}
            <div className="space-y-3 mb-8">
              {/* $5 */}
              <button
                onClick={() => handlePayment(5, false)}
                disabled={isProcessing || loading || !recipientWalletAddress}
                className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-[16px] text-[#393f49] font-medium text-base ${
                  selectedAmount === 5
                    ? 'bg-[rgba(247,89,255,0.1)] border border-[#eb7cff]'
                    : 'bg-white border border-[#e6e8ec] hover:border-[#eb7cff]'
                } ${(isProcessing || loading || !recipientWalletAddress) ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(235,124,255,0.15)]'}`}
              >
                <span className="text-xl">💵</span>
                <span className="flex-1 text-center">
                  {isProcessing && selectedAmount === 5 ? 'Processing...' : `Support with $5 ${tokenLabel}`}
                </span>
              </button>

              {/* $10 */}
              <button
                onClick={() => handlePayment(10, false)}
                disabled={isProcessing || loading || !recipientWalletAddress}
                className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-[16px] text-[#393f49] font-medium text-base ${
                  selectedAmount === 10
                    ? 'bg-[rgba(247,89,255,0.1)] border border-[#eb7cff]'
                    : 'bg-white border border-[#e6e8ec] hover:border-[#eb7cff]'
                } ${(isProcessing || loading || !recipientWalletAddress) ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(235,124,255,0.15)]'}`}
              >
                <span className="text-xl">💸</span>
                <span className="flex-1 text-center">
                  {isProcessing && selectedAmount === 10 ? 'Processing...' : `Support with $10 ${tokenLabel}`}
                </span>
              </button>

              {/* $25 */}
              <button
                onClick={() => handlePayment(25, false)}
                disabled={isProcessing || loading || !recipientWalletAddress}
                className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-[16px] text-[#393f49] font-medium text-base ${
                  selectedAmount === 25
                    ? 'bg-[rgba(247,89,255,0.1)] border border-[#eb7cff]'
                    : 'bg-white border border-[#e6e8ec] hover:border-[#eb7cff]'
                } ${(isProcessing || loading || !recipientWalletAddress) ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(235,124,255,0.15)]'}`}
              >
                <span className="text-xl">💎</span>
                <span className="flex-1 text-center">
                  {isProcessing && selectedAmount === 25 ? 'Processing...' : `Support with $25 ${tokenLabel}`}
                </span>
              </button>

              {/* Custom Amount */}
              <button
                onClick={() => {
                  setSelectedAmount(null); // Clear selection when opening custom amount
                  setShowCustomModal(true);
                }}
                className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-[16px] text-[#393f49] font-medium text-base hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(235,124,255,0.15)] ${
                  selectedAmount !== null && selectedAmount !== 5 && selectedAmount !== 10 && selectedAmount !== 25
                    ? 'bg-[rgba(247,89,255,0.1)] border border-[#eb7cff]'
                    : 'bg-white border border-[#e6e8ec] hover:border-[#eb7cff]'
                }`}
              >
                <span className="text-xl">✏️</span>
                <span className="flex-1 text-center">
                  {selectedAmount !== null && selectedAmount !== 5 && selectedAmount !== 10 && selectedAmount !== 25
                    ? `$${selectedAmount} ${tokenLabel}`
                    : 'Custom Amount...'}
                </span>
              </button>
            </div>

            {/* Transaction Status */}
            {txHash && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-center">
                <a
                  href={
                    selectedNetwork === 'Base'
                      ? `https://basescan.org/tx/${txHash}`
                      : selectedNetwork === 'BSC'
                        ? `https://bscscan.com/tx/${txHash}`
                        : `https://solscan.io/tx/${txHash}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-700 text-sm font-medium hover:underline"
                >
                  Transaction sent! View on {selectedNetwork === 'Base' ? 'BaseScan' : selectedNetwork === 'BSC' ? 'BSCScan' : 'Solscan'}
                </a>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className={`mb-4 p-3 rounded-lg ${
                error === 'Please connect your wallet first'
                  ? 'bg-purple-50 border border-purple-200'
                  : 'bg-red-50 border border-red-200'
              }`}>
                <p className={`text-sm ${
                  error === 'Please connect your wallet first'
                    ? 'text-purple-700'
                    : 'text-red-700'
                }`}>{error}</p>
              </div>
            )}

            {/* Wallet Status / Connect Button */}
            <div className="text-center mb-4">
              {selectedNetwork === 'Base' ? (
                <p className="text-xs text-[#696f8c]">
                  {baseHook.hasWallet ? 'EVM wallet detected' : 'No EVM wallet detected'}
                  {baseHook.isTransferring && ' • Processing...'}
                </p>
              ) : isConnected ? (
                <p className="text-xs text-[#696f8c]">
                  Wallet connected: {address?.slice(0, 6)}...{address?.slice(-4)}
                  {' • '}
                  <button
                    onClick={() => currentHook?.disconnect?.()}
                    className="text-[#eb7cff] hover:underline"
                  >
                    Disconnect
                  </button>
                </p>
              ) : connectionStatus === 'connecting' ? (
                <p className="text-xs text-[#eb7cff] animate-pulse">
                  Connecting<span className="animate-dots">...</span>
                </p>
              ) : connectionStatus === 'timeout' ? (
                <p className="text-xs text-orange-600">
                  Oops, try connect again
                </p>
              ) : (
                <button
                  onClick={() => {
                    // Immediately show connecting status
                    setConnectionStatus('connecting');

                    // Initialize timeout tracking
                    remainingTimeRef.current = 15000;
                    timeoutStartTimeRef.current = Date.now();

                    // Set 15 second timeout (will pause when user switches to OKX App)
                    connectionTimeoutRef.current = setTimeout(() => {
                      setConnectionStatus('timeout');
                    }, 15000);

                    // Connect wallet (async, but don't await)
                    currentHook?.connectOKX().catch((err: any) => {
                      logger.error('Connect failed', { error: err });
                      if (connectionTimeoutRef.current) {
                        clearTimeout(connectionTimeoutRef.current);
                      }
                      setConnectionStatus('timeout');
                    });
                  }}
                  className={`text-xs text-[#eb7cff] hover:underline ${shouldShakeConnectButton ? 'animate-shake' : ''}`}
                >
                  Connect Wallet
                </button>
              )}
            </div>

            {/* Footer */}
            <footer className="text-center text-[#696f8c] text-[13px] font-['Times']">
              <p>Powered by <strong className="text-[#eb7cff]">Bloom Protocol</strong></p>
            </footer>
          </div>
        </div>
      </div>

      {/* Custom Amount Modal */}
      <BaseModal
        isOpen={showCustomModal}
        onClose={() => {
          setShowCustomModal(false);
          setCustomAmount('');
        }}
        logo={{
          src: "https://statics.bloomprotocol.ai/logo/bp_logo_icon.svg",
          alt: "Bloom Protocol",
          width: 34.62,
          height: 34
        }}
        caption={
          <span className="font-['Times'] font-bold text-[20px] text-[#393F49]">
            Custom Amount
          </span>
        }
        closeStrategy="all"
      >
        <div className="block">
          {/* Amount Input */}
          <div className="flex items-center gap-2 bg-white border border-[#e6e8ec] rounded-xl px-4 py-3 mb-6 focus-within:border-[#eb7cff]">
            <span className="text-xl font-bold text-[#696f8c]">$</span>
            <input
              type="number"
              inputMode="decimal"
              placeholder="0.00"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              className="flex-1 text-2xl font-semibold text-[#393f49] border-none outline-none bg-transparent placeholder:text-[#e6e8ec]"
              min="0.01"
              step="0.01"
            />
            <span className="text-sm font-medium text-[#696f8c]">{tokenLabel}</span>
          </div>

          {/* Send Button */}
          <button
            onClick={handleCustomPayment}
            disabled={!customAmount || parseFloat(customAmount) <= 0 || loading || !recipientWalletAddress || isProcessing}
            className="w-full px-8 py-3 bg-[#eb7cff] rounded-[27px] text-white font-semibold text-base disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#d96aef] hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(235,124,255,0.3)]"
          >
            {loading ? 'Loading...' : isProcessing ? 'Processing...' : `Send ${customAmount || '0'} ${tokenLabel}`}
          </button>
        </div>
      </BaseModal>
    </>
  );
}
