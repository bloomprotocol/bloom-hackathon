"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useAuthGuard, useXConnection } from "@/lib/hooks";
import { profileService } from "@/lib/api/services/profileService";
import { apiGet } from "@/lib/api/apiConfig";
import { logger } from "@/lib/utils/logger";
import { ChevronIcon } from "./shared";
import { PROFILE_CONSTANTS, type WalletInfo, type ApiResponse, type X402WalletsResponse } from "../types";

// Truncate address for display
function truncateAddress(address: string): string {
  if (!address) return "";
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Detect wallet type from address format
function detectWalletType(address: string): "Solana" | "BSC" | null {
  if (!address) return null;
  if (/^0x[a-fA-F0-9]{40}$/.test(address)) return "BSC";
  if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) return "Solana";
  return null;
}

export default function ConnectedAccountsCard() {
  const { userId } = useAuthGuard();
  const [isExpanded, setIsExpanded] = useState(false);
  const [wallets, setWallets] = useState<WalletInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // X Connection State - using shared hook with profile origin
  const {
    status: xConnectionStatus,
    isLoading: xStatusLoading,
    isConnecting,
    isConfirmingDisconnect,
    connectX: handleConnectX,
    disconnectX: handleDisconnectX,
  } = useXConnection({ origin: 'profile' });

  // Fetch wallet data
  useEffect(() => {
    if (!userId) return;

    const fetchWallets = async () => {
      setIsLoading(true);
      const walletList: WalletInfo[] = [];

      try {
        // 1. Fetch primary wallet from MySQL (via profileService)
        const initialData = await profileService.getInitialData();
        const primaryWalletAddress = initialData.userInfo.walletAddress;

        if (primaryWalletAddress) {
          const walletType = detectWalletType(primaryWalletAddress);
          if (walletType) {
            walletList.push({
              type: walletType,
              address: truncateAddress(primaryWalletAddress),
              fullAddress: primaryWalletAddress,
              label: "Primary Wallet",
            });
          }
        }

        // 2. Fetch X402 wallets from MongoDB
        try {
          const x402Response = await apiGet(`/x402/user/${userId}/wallets`) as ApiResponse<X402WalletsResponse['data']>;
          if (x402Response?.data && Array.isArray(x402Response.data)) {
            x402Response.data.forEach((wallet) => {
              // Skip if this is the same as primary wallet
              if (wallet.walletAddress === primaryWalletAddress) return;

              walletList.push({
                type: wallet.network,
                address: truncateAddress(wallet.walletAddress),
                fullAddress: wallet.walletAddress,
                label: "X402 Wallet",
              });
            });
          }
        } catch (x402Error) {
          const error = x402Error as { response?: { status: number }; status?: number };
          // 404 is expected if user has no X402 wallets configured
          if (error.response?.status !== 404 && error.status !== 404) {
            logger.error("Error fetching X402 wallets", { error: x402Error });
          }
        }

        setWallets(walletList);
      } catch (error) {
        logger.error("Error fetching wallet data", { error });
      } finally {
        setIsLoading(false);
      }
    };

    fetchWallets();
  }, [userId]);

  // Handle copy address
  const handleCopy = async (fullAddress: string) => {
    try {
      await navigator.clipboard.writeText(fullAddress);
      setCopiedAddress(fullAddress);

      // Clear previous timeout
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }

      // Reset after feedback duration
      copyTimeoutRef.current = setTimeout(() => {
        setCopiedAddress(null);
      }, PROFILE_CONSTANTS.FEEDBACK_DURATION);
    } catch (error) {
      logger.error("Failed to copy to clipboard", { error });
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="bg-white rounded-[16px] border border-[#e6e8ec] p-6">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between hover:opacity-80 transition-opacity"
        >
          <div className="flex items-center gap-3">
            <h2
              className="font-semibold text-[20px] text-[#393f49]"
              style={{ fontFamily: "Times, serif" }}
            >
              Connected Accounts
            </h2>
          </div>
          <ChevronIcon direction={isExpanded ? "up" : "down"} />
        </button>

        {isExpanded && (
          <>
            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-4">
                <div className="w-5 h-5 border-2 border-[#eb7cff] border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {/* Wallets Section */}
            {!isLoading && wallets.length > 0 && (
              <div className="flex flex-col gap-3">
                <label className="font-['Outfit'] font-medium text-[14px] text-[#393f49]">
                  Wallets
                </label>
                <div className="flex flex-col gap-2">
                  {wallets.map((wallet, index) => (
                    <button
                      key={`wallet-${index}`}
                      onClick={() => handleCopy(wallet.fullAddress)}
                      className="flex items-center justify-between p-4 rounded-[8px] border border-[#e6e8ec] bg-white hover:bg-[#f9fafb] transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <Image
                          src={
                            wallet.type === "Solana"
                              ? "https://statics.bloomprotocol.ai/icon/SOLANA.png"
                              : "https://statics.bloomprotocol.ai/icon/BSC.png"
                          }
                          alt={wallet.type}
                          width={20}
                          height={20}
                        />
                        <p className="font-['Outfit'] font-medium text-[14px] text-[#393f49]">
                          {wallet.type}:{" "}
                          <span className="font-mono text-[#696f8c]">{wallet.address}</span>
                          {wallet.label === "Primary Wallet" && (
                            <span className="ml-2 text-[12px] text-[#9ca3af]">(Primary)</span>
                          )}
                        </p>
                      </div>
                      {copiedAddress === wallet.fullAddress ? (
                        <span className="font-['Outfit'] text-[12px] text-[#71ca41]">
                          Copied!
                        </span>
                      ) : (
                        <Image
                          src="https://statics.bloomprotocol.ai/icon/yoona-copy.png"
                          alt="Copy"
                          width={16}
                          height={16}
                          className="opacity-50 hover:opacity-100 transition-opacity"
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && wallets.length === 0 && (
              <div className="py-4 text-center">
                <p className="font-['Outfit'] text-[14px] text-[#696f8c]">
                  No wallets connected
                </p>
              </div>
            )}

            {/* Social Accounts Section - X (Twitter) */}
            <div className="flex flex-col gap-3">
              <label className="font-['Outfit'] font-medium text-[14px] text-[#393f49]">
                Social Accounts
              </label>
              <div className="flex flex-col gap-2">
                {xStatusLoading ? (
                  // Loading state
                  <div className="flex items-center gap-3 p-4 rounded-[8px] border border-[#e6e8ec] bg-white">
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
                    className="flex items-center justify-between p-4 rounded-[8px] border border-[#e6e8ec] bg-white hover:bg-[#f9fafb] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center gap-3">
                      <Image
                        src="https://statics.bloomprotocol.ai/icon/remix-twitter-x-line.svg"
                        alt="X"
                        width={20}
                        height={20}
                      />
                      <p className="font-['Outfit'] font-medium text-[14px] text-[#393f49]">
                        {isConnecting ? 'Connecting...' : 'X (Twitter)'}
                      </p>
                    </div>
                    <span className="font-['Outfit'] text-[12px] text-[#eb7cff]">
                      Connect
                    </span>
                  </button>
                ) : (
                  // Connected State
                  <div className="flex items-center justify-between p-4 rounded-[8px] border border-[#e6e8ec] bg-white">
                    <div className="flex items-center gap-3">
                      <Image
                        src="https://statics.bloomprotocol.ai/icon/remix-twitter-x-line.svg"
                        alt="X"
                        width={20}
                        height={20}
                      />
                      <p className="font-['Outfit'] font-medium text-[14px] text-[#393f49]">
                        @{xConnectionStatus.xUsername}
                      </p>
                    </div>
                    <button
                      onClick={handleDisconnectX}
                      className="font-['Outfit'] text-[12px] font-medium text-[#9ca3af] hover:text-[#393f49] transition-colors"
                    >
                      {isConfirmingDisconnect ? 'Confirm?' : 'Disconnect'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-[rgba(76,190,255,0.1)] rounded-[12px] p-[10px]">
              <p className="font-['Outfit'] font-medium text-[12px] text-[#393f49] mb-2">
                Manage your wallets
              </p>
              <p className="font-['Outfit'] font-light text-[12px] text-[#696f8c]">
                Configure additional payment wallets in{" "}
                <a
                  href="/profile/x402"
                  className="text-[#eb7cff] hover:underline"
                >
                  X402 Settings
                </a>
                .
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
