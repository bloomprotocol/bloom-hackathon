"use client";

import { useState } from "react";
import Image from "next/image";
import { useX402 } from "../contexts/x402-context";
import { useXConnection } from "@/lib/hooks";
import { usePublicProfile } from "../../contexts/public-profile-context";

export default function ProfileCard() {
  const {
    displayName,
    setDisplayName,
    bio,
    setBio,
    profileError,
    isProfileSubmitting,
    isProfileSaved,
    handleSaveProfile,
  } = useX402();

  // Get public profile state from shared context (synced with /profile page)
  const { isPublicProfileEnabled } = usePublicProfile();

  const [isExpanded, setIsExpanded] = useState(false);

  // X Connection State - using shared hook with x402 origin
  const {
    status: xConnectionStatus,
    isLoading: xStatusLoading,
    isConnecting,
    isConfirmingDisconnect,
    connectX: handleConnectX,
    disconnectX: handleDisconnectX,
  } = useXConnection({ origin: 'x402' });

  // Profile card stays collapsed by default on both desktop and mobile
  // (unlike How It Works card which expands on desktop)

  // Only show when public profile is enabled
  if (!isPublicProfileEnabled) {
    return null;
  }

  return (
    <div className="bg-white rounded-[16px] border border-[#e6e8ec] p-6">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between hover:opacity-80 transition-opacity"
        >
          <h2 className="font-semibold text-[20px] text-[#393f49]" style={{ fontFamily: 'Times, serif' }}>
            Personalize Your Public Page
          </h2>
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

        {/* Display Name */}
        <div className="flex flex-col gap-2">
          <label className="font-['Outfit'] font-medium text-[14px] text-[#393f49]">
            Display Name
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your name or username"
            className="w-full px-4 py-3 rounded-[8px] border border-[#e6e8ec] bg-white font-['Outfit'] text-[14px] text-[#393f49] placeholder:text-[#9ca3af] focus:outline-none focus:border-[#696f8c] transition-colors"
          />
        </div>

        {/* Bio */}
        <div className="flex flex-col gap-2">
          <label className="font-['Outfit'] font-medium text-[14px] text-[#393f49]">
            Bio / Description (optional)
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell visitors about yourself..."
            maxLength={500}
            rows={4}
            className="w-full px-4 py-3 rounded-[8px] border border-[#e6e8ec] bg-white font-['Outfit'] text-[14px] text-[#393f49] placeholder:text-[#9ca3af] focus:outline-none focus:border-[#696f8c] transition-colors resize-none"
          />
          <div className="flex items-center justify-end">
            <p className="font-['Outfit'] font-normal text-[12px] text-[#9ca3af]">
              {bio.length}/500
            </p>
          </div>
        </div>

        {/* Social Links */}
        <div className="flex flex-col gap-2">
          <label className="font-['Outfit'] font-medium text-[14px] text-[#393f49]">
            Social Links (optional)
          </label>

          {/* Social Links Badges */}
          <div className="flex flex-col gap-3">
            {/* Twitter/X Connection - Functional */}
            {xStatusLoading ? (
              // Loading state
              <div className="flex items-center gap-3 p-4 rounded-[8px] border border-[#e6e8ec] bg-white w-full">
                <div className="w-5 h-5 rounded-full border-2 border-gray-200 border-t-purple-600 animate-spin" />
                <p className="font-['Outfit'] font-medium text-[14px] text-[#9ca3af]">
                  Loading...
                </p>
              </div>
            ) : !xConnectionStatus?.connected ? (
              // Not Connected State
              <button
                onClick={handleConnectX}
                disabled={isConnecting}
                className="flex items-center justify-between gap-3 p-4 rounded-[8px] border border-[#e6e8ec] bg-white hover:bg-[#f9fafb] transition-colors w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-3">
                  <Image
                    src="https://statics.bloomprotocol.ai/icon/remix-twitter-x-line.svg"
                    alt="X"
                    width={20}
                    height={20}
                  />
                  <p className="font-['Outfit'] font-medium text-[20x] text-[#393f49]">
                    {isConnecting ? 'Connecting...' : 'Connect Account'}
                  </p>
                </div>
              </button>
            ) : (
              // Connected State - Following X Brand Guidelines
              // Text scaled to 100% of logo height, with proper clear space
              <div className="flex items-center justify-between gap-3 p-4 rounded-[8px] border border-[#e6e8ec] bg-white w-full">
                <div className="flex items-center gap-3">
                  {/* X Logo with clear space (4px margin for brand guidelines) */}
                  <Image
                    src="https://statics.bloomprotocol.ai/icon/remix-twitter-x-line.svg"
                    alt="X"
                    width={20}
                    height={20}
                  />
                  {/* Username text at 100% of logo height (20px) - vertically centered */}
                  <p className="font-['Outfit'] font-medium text-[20px] text-[#393f49]">
                    @{xConnectionStatus.xUsername}
                  </p>
                </div>
                <button
                  onClick={handleDisconnectX}
                  className="font-['Outfit'] text-[14px] font-medium text-[#9ca3af] hover:text-[#393f49] transition-colors"
                >
                  {isConfirmingDisconnect ? 'Confirm?' : 'Disconnect'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {profileError && (
          <p className="font-['Outfit'] text-[14px] text-red-500">
            {profileError}
          </p>
        )}

        {/* Save Button */}
        <button
          onClick={handleSaveProfile}
          disabled={isProfileSubmitting || isProfileSaved}
          className="w-full relative rounded-[27px] bg-[#eb7cff] text-white hover:bg-[#E563FF] shadow-[0px_1px_1px_0.05px_rgba(24,24,27,0.24)] transition-colors px-[20px] py-[10px] flex items-center justify-center font-semibold text-[14px] leading-none disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProfileSubmitting ? 'Saving...' : isProfileSaved ? 'Saved' : 'Save Profile Changes'}
          <div className="absolute inset-0 pointer-events-none shadow-[0px_2px_0px_0px_inset_rgba(255,255,255,0.1),0px_8px_16px_0px_inset_rgba(255,255,255,0.16)] rounded-[27px]" />
        </button>
        </>
        )}
      </div>
    </div>
  );
}
