'use client';

import { useState, useEffect } from 'react';
import { useBuilderMission } from '../contexts/builder-mission-context';
import MobileDisabledWrapper from './mobile-disabled-wrapper';

// Chain configurations for display
const CHAIN_CONFIG: Record<number, { name: string; symbol: string }> = {
  8453: { name: 'Base', symbol: 'BASE' },
  56: { name: 'BSC', symbol: 'BNB' },
};

// Blocking statuses - only these prevent new requests
const BLOCKING_STATUSES = ['pending_payment', 'payment_submitted'];

type DistributionStep = 'idle' | 'initiating' | 'awaiting_payment' | 'confirming' | 'verified' | 'failed';

/**
 * Card 1: Distribute Token Reward
 * - Shows eligible submissions and allows initiating new distribution
 * - Handles the payment flow (initiate -> await payment -> confirm)
 */
export default function DistributeTokenRewardCard() {
  const {
    isMobile,
    rewardSettings,
    missionHasTokenReward,
    tokenDistributionRequest,
    tokenDistributionLoading,
    tokenDistributionEligibleCount,
    handleInitiateTokenDistribution,
    handleConfirmTokenTransfer,
    fetchActiveDistributionRequest,
    fetchAllDistributionRequests,
    fetchTokenDistributionEligibleCount,
  } = useBuilderMission();

  const [isExpanded, setIsExpanded] = useState(true);
  const [step, setStep] = useState<DistributionStep>('idle');
  const [platformWallet, setPlatformWallet] = useState<string | null>(null);
  const [paymentInfo, setPaymentInfo] = useState<{
    tokenSymbol: string;
    totalAmount: number;
    amountPerSubmission: number;
    totalSubmissions: number;
    chainId: number;
  } | null>(null);
  const [txHash, setTxHash] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Get stablecoin reward info
  const stablecoinReward = rewardSettings?.stablecoinReward;
  const tokenSymbol = stablecoinReward?.tokenSymbol || 'USDT';
  const amountPerSubmission = stablecoinReward?.amountPerSubmission || 0;
  const chainId = Number(stablecoinReward?.chainId) || 8453;
  const chainInfo = CHAIN_CONFIG[chainId] || { name: 'Unknown', symbol: '?' };

  // Use eligible count from backend (accurate calculation including x402 link check)
  const eligibleCount = tokenDistributionEligibleCount;

  // Calculate total reward amount for eligible submissions
  const totalRewardAmount = eligibleCount * amountPerSubmission;

  // Sync step with existing distribution request
  // Only blocking statuses should change the step
  useEffect(() => {
    if (tokenDistributionRequest && BLOCKING_STATUSES.includes(tokenDistributionRequest.status)) {
      const status = tokenDistributionRequest.status;
      if (status === 'pending_payment') {
        setStep('awaiting_payment');
        setPlatformWallet(tokenDistributionRequest.platformWalletAddress);
        setPaymentInfo({
          tokenSymbol: tokenDistributionRequest.tokenSymbol,
          totalAmount: tokenDistributionRequest.totalAmount,
          amountPerSubmission: tokenDistributionRequest.amountPerSubmission,
          totalSubmissions: tokenDistributionRequest.totalSubmissions,
          chainId: tokenDistributionRequest.chainId,
        });
      } else if (status === 'payment_submitted') {
        setStep('confirming');
      }
    } else {
      // No blocking request, reset to idle
      setStep('idle');
      setPlatformWallet(null);
      setPaymentInfo(null);
    }
  }, [tokenDistributionRequest]);

  // Handle initiate distribution
  const handleInitiate = async () => {
    setErrorMessage(null);
    setStep('initiating');

    try {
      const response = await handleInitiateTokenDistribution();
      if (response) {
        setPlatformWallet(response.platformWallet.address);
        setPaymentInfo({
          tokenSymbol: response.payment.tokenSymbol,
          totalAmount: response.payment.totalAmount,
          amountPerSubmission: response.payment.amountPerSubmission,
          totalSubmissions: response.payment.totalSubmissions,
          chainId: response.platformWallet.chainId,
        });
        setStep('awaiting_payment');
        await fetchAllDistributionRequests();
        await fetchTokenDistributionEligibleCount();
      } else {
        setStep('failed');
        setErrorMessage('Failed to initiate distribution');
      }
    } catch (err) {
      setStep('failed');
      setErrorMessage(err instanceof Error ? err.message : 'Failed to initiate distribution');
    }
  };

  // Handle confirm transfer
  const handleConfirm = async () => {
    if (!txHash.trim()) {
      setErrorMessage('Please enter transaction hash');
      return;
    }

    if (!/^0x[a-fA-F0-9]{64}$/.test(txHash)) {
      setErrorMessage('Invalid transaction hash format');
      return;
    }

    setErrorMessage(null);
    setStep('confirming');

    try {
      const result = await handleConfirmTokenTransfer(txHash);
      if (result.success) {
        setStep('verified');
        await fetchAllDistributionRequests();
        // Reset after showing success briefly
        setTimeout(() => {
          setStep('idle');
          setTxHash('');
          setPlatformWallet(null);
          setPaymentInfo(null);
        }, 2000);
      } else {
        setStep('failed');
        setErrorMessage(result.message);
      }
    } catch (err) {
      setStep('failed');
      setErrorMessage(err instanceof Error ? err.message : 'Failed to confirm transfer');
    }
  };

  // Handle retry — go back to payment form, keep payment info so Builder can re-enter txHash
  const handleRetry = async () => {
    setTxHash('');
    setErrorMessage(null);
    // If we still have payment info, go back to awaiting_payment (not idle)
    // This way Builder can re-enter txHash without restarting the flow
    if (platformWallet && paymentInfo) {
      setStep('awaiting_payment');
    } else {
      setStep('idle');
      await fetchActiveDistributionRequest();
      await fetchAllDistributionRequests();
    }
  };

  // Copy platform wallet to clipboard
  const handleCopyWallet = async () => {
    if (platformWallet) {
      await navigator.clipboard.writeText(platformWallet);
    }
  };

  // Don't render if no token reward configured
  if (!missionHasTokenReward || !stablecoinReward) {
    return null;
  }

  const canDistribute = eligibleCount > 0 && step === 'idle';

  return (
    <div className="common-container-style flex w-full flex-col items-start gap-4">
      {/* Collapsible header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between font-bold text-[#393f49] text-[20px] leading-none hover:opacity-80 transition-opacity"
        style={{ fontFamily: 'Times, serif' }}
      >
        <span>Distribute Token Reward</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
        >
          <path
            d="M4 6L8 10L12 6"
            stroke="#696f8c"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isExpanded && (
        <>
          {/* Distribution Info */}
          <div className="flex flex-col gap-2 w-full">
            <div className="flex items-center justify-between">
              <span className="text-[14px] text-[#696f8c]" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Token
              </span>
              <span className="text-[14px] font-semibold text-[#393f49]" style={{ fontFamily: 'Outfit, sans-serif' }}>
                {tokenSymbol} ({chainInfo.name})
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[14px] text-[#696f8c]" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Per Submission
              </span>
              <span className="text-[14px] font-semibold text-[#393f49]" style={{ fontFamily: 'Outfit, sans-serif' }}>
                {amountPerSubmission} {tokenSymbol}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[14px] text-[#696f8c]" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Eligible Submissions
              </span>
              <span className="text-[14px] font-semibold text-[#393f49]" style={{ fontFamily: 'Outfit, sans-serif' }}>
                {eligibleCount}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[14px] text-[#696f8c]" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Total Amount
              </span>
              <span className="text-[14px] font-semibold text-[#00C853]" style={{ fontFamily: 'Outfit, sans-serif' }}>
                {totalRewardAmount.toFixed(2)} {tokenSymbol}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[14px] text-[#696f8c]" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Service Fee
              </span>
              <span className="text-[14px] font-semibold text-[#00C853]" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Free
              </span>
            </div>
          </div>

          {/* Step-based UI */}
          {step === 'idle' && (
            <MobileDisabledWrapper isMobile={isMobile} message="Please use desktop to distribute rewards">
              <button
                onClick={handleInitiate}
                disabled={!canDistribute || tokenDistributionLoading}
                className={`w-full h-10 rounded-[27px] px-4 py-2 flex items-center justify-center text-[14px] font-semibold ${
                  canDistribute
                    ? 'bg-[rgba(113,202,65,0.1)] text-[#71ca41] shadow-[0px_3px_0px_-1px_#a8d89a] border-2 border-[rgba(113,202,65,0.10)] hover:opacity-90 transition-opacity'
                    : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                }`}
              >
                {tokenDistributionLoading ? 'Loading...' : `Distribute Token Reward (${eligibleCount})`}
              </button>
            </MobileDisabledWrapper>
          )}

          {step === 'initiating' && (
            <div className="w-full flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#71ca41]" />
              <span className="ml-2 text-[14px] text-[#696f8c]">Initiating...</span>
            </div>
          )}

          {step === 'awaiting_payment' && platformWallet && paymentInfo && (
            <div className="flex flex-col gap-3 w-full">
              <div className="bg-[#f5f5f5] rounded-lg p-3">
                <div className="text-[12px] text-[#696f8c] mb-1">Transfer to Platform Wallet:</div>
                <div className="flex items-center gap-2">
                  <code className="text-[12px] text-[#393f49] break-all flex-1">
                    {platformWallet}
                  </code>
                  <button
                    onClick={handleCopyWallet}
                    className="text-[#71ca41] hover:opacity-70 p-1"
                    title="Copy address"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                    </svg>
                  </button>
                </div>
              </div>

              <div className="bg-[#fff3e0] rounded-lg p-3">
                <div className="text-[12px] text-[#e65100] font-medium">
                  Please transfer exactly {paymentInfo.totalAmount} {paymentInfo.tokenSymbol} on {CHAIN_CONFIG[paymentInfo.chainId]?.name || 'Unknown'} chain
                </div>
              </div>

              <div>
                <label className="text-[12px] text-[#696f8c] mb-1 block">Transaction Hash:</label>
                <input
                  type="text"
                  value={txHash}
                  onChange={(e) => setTxHash(e.target.value)}
                  placeholder="0x..."
                  className="w-full px-3 py-2 text-[14px] border border-gray-200 rounded-lg focus:outline-none focus:border-[#71ca41]"
                />
              </div>

              {errorMessage && (
                <div className="text-[12px] text-red-500">{errorMessage}</div>
              )}

              <button
                onClick={handleConfirm}
                disabled={!txHash.trim() || tokenDistributionLoading}
                className={`w-full h-10 rounded-[27px] px-4 py-2 flex items-center justify-center text-[14px] font-semibold ${
                  txHash.trim()
                    ? 'bg-[rgba(113,202,65,0.1)] text-[#71ca41] shadow-[0px_3px_0px_-1px_#a8d89a] border-2 border-[rgba(113,202,65,0.10)] hover:opacity-90 transition-opacity'
                    : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                }`}
              >
                {tokenDistributionLoading ? 'Verifying...' : 'Confirm Transfer'}
              </button>
            </div>
          )}

          {step === 'confirming' && (
            <div className="w-full flex flex-col items-center justify-center py-4 gap-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#71ca41]" />
              <span className="text-[14px] text-[#696f8c]">Verifying transaction on-chain...</span>
            </div>
          )}

          {step === 'verified' && (
            <div className="w-full flex flex-col items-center justify-center py-4 gap-2">
              <div className="w-12 h-12 rounded-full bg-[rgba(113,202,65,0.1)] flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#71ca41" strokeWidth="2">
                  <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-[14px] font-medium text-[#71ca41]">Transfer Verified!</span>
              <span className="text-[12px] text-[#696f8c]">
                Token distribution will be processed automatically.
              </span>
            </div>
          )}

          {step === 'failed' && (
            <div className="w-full flex flex-col items-center justify-center py-4 gap-3">
              <div className="w-12 h-12 rounded-full bg-[rgba(220,53,69,0.1)] flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dc3545" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M15 9l-6 6M9 9l6 6"/>
                </svg>
              </div>
              <span className="text-[14px] font-medium text-[#dc3545]">Verification Failed</span>
              {errorMessage && (
                <span className="text-[12px] text-[#696f8c] text-center">{errorMessage}</span>
              )}
              <button
                onClick={handleRetry}
                className="h-8 px-4 rounded-[27px] text-[12px] font-semibold bg-[rgba(113,202,65,0.1)] text-[#71ca41] border border-[rgba(113,202,65,0.3)] hover:opacity-90 transition-opacity"
              >
                {platformWallet && paymentInfo ? 'Re-enter Transaction Hash' : 'Try Again'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
