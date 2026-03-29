"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { apiPost } from "@/lib/api/apiConfig";
import { useX402 } from "../contexts/x402-context";
import { usePublicProfile } from "../../contexts/public-profile-context";
import { logger } from "@/lib/utils/logger";
import UpdateWalletAddressModal from "@/components/modals/UpdateWalletAddressModal";
import { PROFILE_CONSTANTS, type ApiResponse, type X402WalletData, type NetworkType } from "../../types";

// CSS for shake animation
const shakeStyles = `
    @keyframes shakeCute {
        0%, 100% { transform: translateX(0) rotate(0deg); }
        10% { transform: translateX(-2px) rotate(-5deg); }
        20% { transform: translateX(2px) rotate(5deg); }
        30% { transform: translateX(-2px) rotate(-5deg); }
        40% { transform: translateX(2px) rotate(5deg); }
        50% { transform: translateX(0) rotate(0deg) scale(1.1); }
        60% { transform: translateX(0) rotate(0deg) scale(1); }
    }

    .shake-cute {
        animation: shakeCute 0.6s ease-in-out;
    }
`;

export default function PaymentCards() {
  const {
    userId,
    savedAddress,
    setSavedAddress,
    bscAddress,
    setBscAddress,
    baseAddress,
    setBaseAddress,
    solanaAddress,
    setSolanaAddress,
    setPaymentLink,
    activeNetwork,
    setActiveNetwork,
    loginWalletType,
  } = useX402();

  const { isPublicProfileEnabled } = usePublicProfile();

  // Local state for claim form
  const [bnbAddress, setBnbAddress] = useState('');
  const [localSolanaAddress, setLocalSolanaAddress] = useState('');
  const [addressError, setAddressError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  // Refs for copy buttons
  const linkCopyRef = useRef<HTMLButtonElement>(null);
  const solanaCopyRef = useRef<HTMLButtonElement>(null);
  const bscCopyRef = useRef<HTMLButtonElement>(null);
  const baseCopyRef = useRef<HTMLButtonElement>(null);
  const addressCopyRef = useRef<HTMLButtonElement>(null);

  // Get the current address based on active network
  const currentAddress = activeNetwork === 'Base' ? baseAddress : activeNetwork === 'BSC' ? bscAddress : solanaAddress;
  const shortAddress = currentAddress ? `${currentAddress.slice(0, 6)}...${currentAddress.slice(-4)}` : '';

  // Validation
  const validateBnbAddress = (address: string): boolean => {
    if (!address) {
      setAddressError('BNB address is required');
      return false;
    }
    if (!address.startsWith('0x')) {
      setAddressError('Address must start with 0x');
      return false;
    }
    if (address.length !== 42) {
      setAddressError('Address must be 42 characters (0x + 40 hex)');
      return false;
    }
    if (!/^0x[0-9a-fA-F]{40}$/.test(address)) {
      setAddressError('Invalid hex characters in address');
      return false;
    }
    setAddressError('');
    return true;
  };

  const validateSolanaAddress = (address: string): boolean => {
    if (!address) {
      setAddressError('Solana address is required');
      return false;
    }
    // Base58 validation for Solana addresses (32-44 chars)
    if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) {
      setAddressError('Invalid Solana address format');
      return false;
    }
    setAddressError('');
    return true;
  };

  const validateAddress = (address: string, network: NetworkType): boolean => {
    if (network === 'BSC' || network === 'Base') {
      return validateBnbAddress(address);
    } else {
      return validateSolanaAddress(address);
    }
  };

  // Copy functionality
  const handleCopy = (text: string, buttonRef?: React.RefObject<HTMLButtonElement | null>) => {
    navigator.clipboard.writeText(text);
    if (buttonRef?.current) {
      buttonRef.current.classList.add('shake-cute');
      setTimeout(() => {
        buttonRef.current?.classList.remove('shake-cute');
      }, PROFILE_CONSTANTS.COPY_ANIMATION_DURATION);
    }
  };

  // Handle saving address
  const handleSaveAddress = async () => {
    const currentAddressToSave = (activeNetwork === 'BSC' || activeNetwork === 'Base') ? bnbAddress : localSolanaAddress;
    if (!validateAddress(currentAddressToSave, activeNetwork)) return;

    setIsSubmitting(true);
    setAddressError('');

    try {
      const result = await apiPost('/users/wallet-address', {
        network: activeNetwork,
        walletAddress: currentAddressToSave
      }) as ApiResponse<X402WalletData>;

      if (!result.success) {
        setAddressError(result.error || 'Failed to save address. Please try again.');
        return;
      }

      // Update the saved addresses in context
      if (activeNetwork === 'Base') {
        setBaseAddress(currentAddressToSave);
        setSavedAddress(currentAddressToSave);
        setBnbAddress('');
      } else if (activeNetwork === 'BSC') {
        setBscAddress(currentAddressToSave);
        setSavedAddress(currentAddressToSave);
        setBnbAddress('');
      } else {
        setSolanaAddress(currentAddressToSave);
        setSavedAddress(currentAddressToSave);
        setLocalSolanaAddress('');
      }

      // Update payment link
      const networkPath = activeNetwork.toLowerCase();
      setPaymentLink(`${PROFILE_CONSTANTS.X402_BASE_URL}/${networkPath}/${userId}`);
    } catch (error) {
      const err = error as { response?: { data?: { error?: string; message?: string } } };
      logger.error('Error saving address', { error });
      setAddressError(err.response?.data?.error || err.response?.data?.message || 'Failed to save address. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Auto-switch network selection based on address availability
  useEffect(() => {
    if (!baseAddress) {
      // Priority 1: If Base is empty, select Base
      setActiveNetwork('Base');
    } else if (!solanaAddress) {
      // Priority 2: If Solana is empty, select Solana
      setActiveNetwork('Solana');
    } else if (!bscAddress) {
      // Priority 3: If BSC is empty, select BSC
      setActiveNetwork('BSC');
    } else {
      // Priority 4: All have addresses, default to Base
      setActiveNetwork('Base');
    }
  }, [baseAddress, solanaAddress, bscAddress]);

  // Handle address update (called from modal)
  const handleUpdateAddress = async (addressToUpdate: string) => {
    if (!validateAddress(addressToUpdate, activeNetwork)) return;

    setIsSubmitting(true);
    setAddressError('');

    try {
      const result = await apiPost('/users/wallet-address', {
        network: activeNetwork,
        walletAddress: addressToUpdate
      }) as ApiResponse<X402WalletData>;

      if (!result.success) {
        setAddressError(result.error || 'Failed to update address. Please try again.');
        return;
      }

      // Update the saved addresses in context
      if (activeNetwork === 'Base') {
        setBaseAddress(addressToUpdate);
        setSavedAddress(addressToUpdate);
      } else if (activeNetwork === 'BSC') {
        setBscAddress(addressToUpdate);
        setSavedAddress(addressToUpdate);
      } else {
        setSolanaAddress(addressToUpdate);
        setSavedAddress(addressToUpdate);
      }

      setIsUpdateModalOpen(false);
    } catch (error) {
      const err = error as { response?: { data?: { error?: string; message?: string } } };
      logger.error('Error updating address', { error });
      setAddressError(err.response?.data?.error || err.response?.data?.message || 'Failed to update payment address. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if current network address can be removed (not the login wallet type)
  const canRemoveCurrentAddress = () => {
    if ((activeNetwork === 'BSC' || activeNetwork === 'Base') && loginWalletType === 'EVM') {
      return false; // Can't remove EVM address if logged in with EVM
    }
    if (activeNetwork === 'Solana' && loginWalletType === 'Solana') {
      return false; // Can't remove Solana address if logged in with Solana
    }
    return true;
  };

  // Handle remove address
  const handleRemoveAddress = async () => {
    if (!canRemoveCurrentAddress()) return;

    setIsSubmitting(true);
    setAddressError('');

    try {
      const result = await apiPost('/users/wallet-address/remove', {
        network: activeNetwork,
      }) as ApiResponse<void>;

      if (!result.success) {
        setAddressError(result.error || 'Failed to remove address. Please try again.');
        return;
      }

      // Clear the address in context
      if (activeNetwork === 'Base') {
        setBaseAddress('');
        setSavedAddress('');
      } else if (activeNetwork === 'BSC') {
        setBscAddress('');
        setSavedAddress('');
      } else {
        setSolanaAddress('');
        setSavedAddress('');
      }

      setIsUpdateModalOpen(false);
    } catch (error) {
      const err = error as { response?: { data?: { error?: string; message?: string } } };
      logger.error('Error removing address', { error });
      setAddressError(err.response?.data?.error || err.response?.data?.message || 'Failed to remove address. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <style jsx>{shakeStyles}</style>

      <div className="w-full flex flex-col gap-6">
        {/* Card 1: X402 Link */}
        <div>
          <div className="bg-white rounded-[16px] border border-[#e6e8ec] p-6">
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#71ca41] flex items-center justify-center">
                  <span className="text-[16px] text-white">✓</span>
                </div>
                <h2 className="font-semibold text-[20px] text-[#393f49]" style={{ fontFamily: 'Times, serif' }}>
                  x402 Link
                </h2>
              </div>

              <div className="flex flex-col gap-4">
                <p className="font-['Outfit'] font-normal text-[14px] text-[#696f8c]">
                  Support agent-to-agent transactions. This is how Bloom Protocol delivers your mission rewards.
                  <br />
                  We will enable customize endpoint features soon! 
                </p>

                {/* Solana X402 Link */}
                {solanaAddress && (
                  <div className="flex items-center gap-3">
                    <Image
                      src="https://statics.bloomprotocol.ai/icon/SOLANA.png"
                      alt="Solana"
                      width={24}
                      height={24}
                      className="shrink-0"
                    />
                    <div
                      className="flex-1 flex items-center gap-2 p-3 rounded-[8px] cursor-pointer bg-[#f9fafb] hover:bg-[#f3f4f6] transition-colors"
                      onClick={() => handleCopy(`${PROFILE_CONSTANTS.X402_BASE_URL}/solana/${userId}`, solanaCopyRef)}
                    >
                      <div className="flex-1 overflow-hidden">
                        <p className="font-['Outfit'] font-mono text-[14px] text-[#393f49] truncate font-medium">
                          {PROFILE_CONSTANTS.X402_BASE_URL}/solana/{userId}
                        </p>
                      </div>
                      <button
                        ref={solanaCopyRef}
                        className="shrink-0 hover:opacity-70 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(`${PROFILE_CONSTANTS.X402_BASE_URL}/solana/${userId}`, solanaCopyRef);
                        }}
                      >
                        <Image
                          src="https://statics.bloomprotocol.ai/icon/yoona-copy.png"
                          alt="Copy"
                          width={20}
                          height={20}
                        />
                      </button>
                    </div>
                  </div>
                )}

                {/* BSC X402 Link */}
                {bscAddress && (
                  <div className="flex items-center gap-3">
                    <Image
                      src="https://statics.bloomprotocol.ai/icon/BSC.png"
                      alt="BSC"
                      width={24}
                      height={24}
                      className="shrink-0"
                    />
                    <div
                      className="flex-1 flex items-center gap-2 p-3 rounded-[8px] cursor-pointer bg-[#f9fafb] hover:bg-[#f3f4f6] transition-colors"
                      onClick={() => handleCopy(`${PROFILE_CONSTANTS.X402_BASE_URL}/bsc/${userId}`, bscCopyRef)}
                    >
                      <div className="flex-1 overflow-hidden">
                        <p className="font-['Outfit'] font-mono text-[14px] text-[#393f49] truncate font-medium">
                          {PROFILE_CONSTANTS.X402_BASE_URL}/bsc/{userId}
                        </p>
                      </div>
                      <button
                        ref={bscCopyRef}
                        className="shrink-0 hover:opacity-70 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(`${PROFILE_CONSTANTS.X402_BASE_URL}/bsc/${userId}`, bscCopyRef);
                        }}
                      >
                        <Image
                          src="https://statics.bloomprotocol.ai/icon/yoona-copy.png"
                          alt="Copy"
                          width={20}
                          height={20}
                        />
                      </button>
                    </div>
                  </div>
                )}

                {/* Base X402 Link */}
                {baseAddress && (
                  <div className="flex items-center gap-3">
                    <Image
                      src="https://statics.bloomprotocol.ai/icon/BASE.png"
                      alt="Base"
                      width={24}
                      height={24}
                      className="shrink-0"
                    />
                    <div
                      className="flex-1 flex items-center gap-2 p-3 rounded-[8px] cursor-pointer bg-[#f9fafb] hover:bg-[#f3f4f6] transition-colors"
                      onClick={() => handleCopy(`${PROFILE_CONSTANTS.X402_BASE_URL}/base/${userId}`, baseCopyRef)}
                    >
                      <div className="flex-1 overflow-hidden">
                        <p className="font-['Outfit'] font-mono text-[14px] text-[#393f49] truncate font-medium">
                          {PROFILE_CONSTANTS.X402_BASE_URL}/base/{userId}
                        </p>
                      </div>
                      <button
                        ref={baseCopyRef}
                        className="shrink-0 hover:opacity-70 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(`${PROFILE_CONSTANTS.X402_BASE_URL}/base/${userId}`, baseCopyRef);
                        }}
                      >
                        <Image
                          src="https://statics.bloomprotocol.ai/icon/yoona-copy.png"
                          alt="Copy"
                          width={20}
                          height={20}
                        />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Manage Wallet Address */}
        <div>
          <div className="bg-white rounded-[16px] border border-[#e6e8ec] p-6">
            <div className="flex flex-col gap-6">
              <h2 className="font-semibold text-[20px] text-[#393f49]" style={{ fontFamily: 'Times, serif' }}>
                Manage Wallet Address for Incoming Payments
              </h2>

              <div className="flex gap-2 p-1 bg-[#f9fafb] rounded-[8px]">
                <button
                  onClick={() => setActiveNetwork('Base')}
                  className={`flex-1 py-2 px-4 rounded-[6px] font-['Outfit'] font-medium text-[14px] transition-colors ${
                    activeNetwork === 'Base'
                      ? 'bg-[#0052FF] text-white'
                      : 'bg-white border border-[#e6e8ec] text-[#696f8c] hover:bg-[#f3f4f6]'
                  }`}
                >
                  Base {baseAddress ? '(Active)' : '(Not Set)'}
                </button>
                <button
                  onClick={() => setActiveNetwork('Solana')}
                  className={`flex-1 py-2 px-4 rounded-[6px] font-['Outfit'] font-medium text-[14px] transition-colors ${
                    activeNetwork === 'Solana'
                      ? 'bg-[#9b6bff] text-white'
                      : 'bg-white border border-[#e6e8ec] text-[#696f8c] hover:bg-[#f3f4f6]'
                  }`}
                >
                  Solana {solanaAddress ? '(Active)' : '(Not Set)'}
                </button>
                <button
                  onClick={() => setActiveNetwork('BSC')}
                  className={`flex-1 py-2 px-4 rounded-[6px] font-['Outfit'] font-medium text-[14px] transition-colors ${
                    activeNetwork === 'BSC'
                      ? 'bg-[#71ca41] text-white'
                      : 'bg-white border border-[#e6e8ec] text-[#696f8c] hover:bg-[#f3f4f6]'
                  }`}
                >
                  EVM {bscAddress ? '(Active)' : '(Not Set)'}
                </button>
              </div>

              {/* Conditional content based on whether address is set */}
              {!currentAddress ? (
                // Show input form for network that hasn't been set
                <div className="flex flex-col gap-4 p-4 bg-[#f9fafb] rounded-[8px]">
                  <div className="flex flex-col gap-2">
                    <label className="font-['Outfit'] font-medium text-[14px] text-[#393f49]">
                      {activeNetwork === 'Base' ? 'Base Wallet Address' : activeNetwork === 'BSC' ? 'BSC Wallet Address' : 'Solana Wallet Address'}
                    </label>
                    <input
                      type="text"
                      value={(activeNetwork === 'BSC' || activeNetwork === 'Base') ? bnbAddress : localSolanaAddress}
                      onChange={(e) => {
                        if (activeNetwork === 'BSC' || activeNetwork === 'Base') {
                          setBnbAddress(e.target.value);
                        } else {
                          setLocalSolanaAddress(e.target.value);
                        }
                        setAddressError('');
                      }}
                      onBlur={() => validateAddress((activeNetwork === 'BSC' || activeNetwork === 'Base') ? bnbAddress : localSolanaAddress, activeNetwork)}
                      placeholder={(activeNetwork === 'BSC' || activeNetwork === 'Base') ? '0x...' : 'Enter your Solana address'}
                      className="w-full px-4 py-3 rounded-[8px] border border-[#e6e8ec] bg-white font-['Outfit'] text-[14px] text-[#393f49] placeholder:text-[#9ca3af] focus:outline-none focus:border-[#696f8c] transition-colors"
                    />
                    {addressError && (
                      <p className="font-['Outfit'] text-[12px] text-red-500">
                        {addressError}
                      </p>
                    )}
                    <p className="font-['Outfit'] font-normal text-[12px] text-[#9ca3af]">
                      Enter your {activeNetwork === 'Base' ? 'Base' : activeNetwork === 'BSC' ? 'BSC' : 'Solana'} wallet address to receive {activeNetwork === 'BSC' ? 'USDT' : 'USDC'} payments
                    </p>
                  </div>

                  <button
                    onClick={handleSaveAddress}
                    disabled={isSubmitting || ((activeNetwork === 'BSC' || activeNetwork === 'Base') ? !bnbAddress : !localSolanaAddress)}
                    className="w-full relative rounded-[27px] bg-[#eb7cff] text-white hover:bg-[#E563FF] shadow-[0px_1px_1px_0.05px_rgba(24,24,27,0.24)] transition-colors px-[20px] py-[10px] flex items-center justify-center font-semibold text-[14px] leading-none disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Saving...' : 'Save'}
                    <div className="absolute inset-0 pointer-events-none shadow-[0px_2px_0px_0px_inset_rgba(255,255,255,0.1),0px_8px_16px_0px_inset_rgba(255,255,255,0.16)] rounded-[27px]" />
                  </button>
                </div>
              ) : (
                // Show existing address
                <div className="flex flex-col gap-2">
                  <label className="font-['Outfit'] font-normal text-[14px] text-[#393f49]">
                    Payments are sent to this address
                  </label>
                  <div
                    className="w-full flex items-center gap-2 p-3 rounded-[8px] bg-[#f9fafb] border border-[#e6e8ec] cursor-pointer hover:bg-[#f3f4f6] transition-colors"
                    onClick={() => handleCopy(currentAddress, addressCopyRef)}
                  >
                    <div className="flex-1 overflow-hidden">
                      <p className="font-['Outfit'] font-mono text-[12px] text-[#393f49]">
                        {shortAddress}
                      </p>
                    </div>
                    <button
                      ref={addressCopyRef}
                      className="shrink-0 hover:opacity-70 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(currentAddress, addressCopyRef);
                      }}
                    >
                      <Image
                        src="https://statics.bloomprotocol.ai/icon/yoona-copy.png"
                        alt="Copy"
                        width={20}
                        height={20}
                      />
                    </button>
                  </div>
                  <p className="font-['Outfit'] font-normal text-[12px] text-[#9ca3af]">
                    <button
                      onClick={() => setIsUpdateModalOpen(true)}
                      className="font-['Outfit'] font-medium text-[12px] text-[#eb7cff] underline hover:text-[#E563FF] transition-colors"
                    >
                      Want to change your address?
                    </button>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Card 3: Public Page - Only show when enabled */}
        {isPublicProfileEnabled && (
        <div>
          <div className="bg-white rounded-[16px] border border-[#e6e8ec] p-6">
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#71ca41]">
                  <span className="text-[16px] text-white">✓</span>
                </div>
                <h2 className="font-semibold text-[20px] text-[#393f49]" style={{ fontFamily: 'Times, serif' }}>
                  x402 as Public Page ( Experiment feature )
                </h2>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <p className="font-['Outfit'] font-normal text-[14px] text-[#696f8c]">
                    Share this link to receive USDT payments<br />
                    We will enable more features to help you build your own platform!
                  </p>
                  <a
                    href={`/${userId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-['Outfit'] font-medium text-[12px] text-[#eb7cff] hover:text-[#E563FF] transition-colors underline"
                  >
                    View Page
                  </a>
                </div>

                <div
                  className="w-full flex items-center gap-2 p-3 rounded-[8px] bg-[rgba(235,124,255,0.1)] border-2 border-[#eb7cff] cursor-pointer hover:bg-[rgba(235,124,255,0.15)] transition-colors"
                  onClick={() => handleCopy(`${window.location.origin}/${userId}`, linkCopyRef)}
                >
                  <div className="flex-1 overflow-hidden">
                    <p className="font-['Outfit'] font-mono text-[14px] text-[#393f49] truncate font-medium">
                      {window.location.origin}/{userId}
                    </p>
                  </div>
                  <button
                    ref={linkCopyRef}
                    className="shrink-0 hover:opacity-70 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy(`${window.location.origin}/${userId}`, linkCopyRef);
                    }}
                  >
                    <Image
                      src="https://statics.bloomprotocol.ai/icon/yoona-copy.png"
                      alt="Copy"
                      width={20}
                      height={20}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        )}
      </div>

      {/* Update Address Modal */}
      <UpdateWalletAddressModal
        isOpen={isUpdateModalOpen}
        onClose={() => {
          setIsUpdateModalOpen(false);
          setAddressError('');
        }}
        activeNetwork={activeNetwork}
        currentAddress={currentAddress}
        onUpdate={handleUpdateAddress}
        onRemove={handleRemoveAddress}
        canRemove={canRemoveCurrentAddress()}
        isSubmitting={isSubmitting}
        addressError={addressError}
        setAddressError={setAddressError}
      />
    </>
  );
}
