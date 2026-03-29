"use client";

import { useState } from "react";
import { BaseModal } from "@/components/ui";

interface UpdateWalletAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeNetwork: 'BSC' | 'Solana' | 'Base';
  currentAddress: string;
  onUpdate: (address: string) => Promise<void>;
  onRemove: () => Promise<void>;
  canRemove: boolean;
  isSubmitting: boolean;
  addressError: string;
  setAddressError: (error: string) => void;
}

export default function UpdateWalletAddressModal({
  isOpen,
  onClose,
  activeNetwork,
  currentAddress,
  onUpdate,
  onRemove,
  canRemove,
  isSubmitting,
  addressError,
  setAddressError,
}: UpdateWalletAddressModalProps) {
  const [newAddress, setNewAddress] = useState('');
  const [isRemoveConfirming, setIsRemoveConfirming] = useState(false);

  // Short address display
  const shortAddress = currentAddress
    ? `${currentAddress.slice(0, 6)}...${currentAddress.slice(-4)}`
    : '';

  // Validate address format
  const validateAddress = (address: string) => {
    if (!address) return;

    if (activeNetwork === 'BSC' || activeNetwork === 'Base') {
      if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
        setAddressError(`Invalid ${activeNetwork} address format. Must start with 0x followed by 40 hex characters.`);
      }
    } else {
      if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) {
        setAddressError('Invalid Solana address format.');
      }
    }
  };

  const handleClose = () => {
    setNewAddress('');
    setIsRemoveConfirming(false);
    setAddressError('');
    onClose();
  };

  const handleUpdate = async () => {
    await onUpdate(newAddress);
    if (!addressError) {
      setNewAddress('');
    }
  };

  const handleRemove = async () => {
    await onRemove();
    setIsRemoveConfirming(false);
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      logo={{
        src: "https://statics.bloomprotocol.ai/logo/bp_logo_icon.svg",
        alt: "Bloom Protocol"
      }}
      caption="Update Payment Address"
    >
      <div className="bg-[#f9fafb] rounded-[8px] p-3">
        <p className="font-['Outfit'] text-[12px] text-[#696f8c]">
          Current: <span className="font-mono">{shortAddress}</span>
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label className="font-['Outfit'] font-medium text-[14px] text-[#393f49]">
          New {activeNetwork === 'Base' ? 'Base' : activeNetwork === 'BSC' ? 'BSC' : 'Solana'} Address
        </label>
        <input
          type="text"
          value={newAddress}
          onChange={(e) => {
            setNewAddress(e.target.value);
            setAddressError('');
          }}
          onBlur={() => validateAddress(newAddress)}
          placeholder={(activeNetwork === 'BSC' || activeNetwork === 'Base') ? '0x...' : 'Enter your Solana address'}
          className="w-full px-4 py-3 rounded-[8px] border border-[#e6e8ec] bg-white font-['Outfit'] text-[14px] text-[#393f49] placeholder:text-[#9ca3af] focus:outline-none focus:border-[#696f8c] transition-colors"
        />
        {addressError && (
          <p className="font-['Outfit'] text-[12px] text-red-500">
            {addressError}
          </p>
        )}
      </div>

      <div className="bg-[rgba(247,89,255,0.1)] rounded-[12px] p-[10px]">
        <p className="font-['Outfit'] font-light text-[12px] text-[#696f8c] leading-[1.4]">
          Your payment link will remain the same, but future payments will go to the new address.
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleUpdate}
          disabled={isSubmitting || !newAddress}
          className="flex-1 relative rounded-[27px] bg-[#eb7cff] text-white hover:bg-[#E563FF] shadow-[0px_1px_1px_0.05px_rgba(24,24,27,0.24)] transition-colors px-[20px] py-[10px] flex items-center justify-center font-semibold text-[14px] leading-none disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving...' : 'Save New Address'}
          <div className="absolute inset-0 pointer-events-none shadow-[0px_2px_0px_0px_inset_rgba(255,255,255,0.1),0px_8px_16px_0px_inset_rgba(255,255,255,0.16)] rounded-[27px]" />
        </button>
        <button
          onClick={handleClose}
          disabled={isSubmitting}
          className="flex-1 relative rounded-[27px] bg-[#393f49] text-white hover:bg-[#4a5058] shadow-[0px_1px_1px_0.05px_rgba(24,24,27,0.24)] transition-colors px-[20px] py-[10px] flex items-center justify-center font-semibold text-[14px] leading-none disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
          <div className="absolute inset-0 pointer-events-none shadow-[0px_2px_0px_0px_inset_rgba(255,255,255,0.1),0px_8px_16px_0px_inset_rgba(255,255,255,0.16)] rounded-[27px]" />
        </button>
      </div>

      {/* Remove Address Section */}
      {canRemove && (
        <div className="border-t border-[#e6e8ec] pt-4 mt-2">
          {!isRemoveConfirming ? (
            <button
              onClick={() => setIsRemoveConfirming(true)}
              className="font-['Outfit'] text-[14px] font-medium text-[#9ca3af] hover:text-red-500 transition-colors"
            >
              Remove this address
            </button>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="font-['Outfit'] text-[12px] text-red-500">
                This action will disable {activeNetwork} x402 link.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleRemove}
                  disabled={isSubmitting}
                  className="flex-1 py-2 px-4 rounded-[8px] bg-red-500 text-white text-[14px] font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Removing...' : 'Yes, Remove'}
                </button>
                <button
                  onClick={() => setIsRemoveConfirming(false)}
                  disabled={isSubmitting}
                  className="flex-1 py-2 px-4 rounded-[8px] bg-[#f3f4f6] text-[#393f49] text-[14px] font-medium hover:bg-[#e6e8ec] transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Show info if address cannot be removed */}
      {!canRemove && (
        <div className="border-t border-[#e6e8ec] pt-4 mt-2">
          <p className="font-['Outfit'] text-[12px] text-[#9ca3af]">
            This is your login wallet address and cannot be removed.
          </p>
        </div>
      )}
    </BaseModal>
  );
}
