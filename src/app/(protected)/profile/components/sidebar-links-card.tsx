"use client";

import Link from "next/link";
import { useAuthGuard } from "@/lib/hooks";
import { usePublicProfile } from "../contexts/public-profile-context";
import { ToggleSwitch } from "./shared";

export default function SidebarLinksCard() {
  const { userId } = useAuthGuard();

  // Use shared public profile context
  const {
    isPublicProfileEnabled,
    isLoading,
    isUpdating,
    handleTogglePublicProfile,
  } = usePublicProfile();

  return (
    <div className="bg-white rounded-[16px] border border-[#e6e8ec] p-6">
      <div className="flex flex-col gap-4">
        {/* Header */}
        <h2 className="font-semibold text-[20px] text-[#393f49]" style={{ fontFamily: 'Times, serif' }}>
          Quick Links
        </h2>

        {/* Links */}
        <div className="flex flex-col gap-3">
          {/* X402 Payment Settings */}
          <Link
            href="/profile/x402"
            className="flex items-center gap-3 p-4 rounded-[8px] border border-[#e6e8ec] bg-white hover:bg-[#f9fafb] transition-colors group"
          >
            <div className="flex flex-col gap-1 flex-1 min-w-0">
              <p className="font-['Outfit'] font-medium text-[14px] text-[#393f49] group-hover:text-[#eb7cff] transition-colors">
                X402 Settings
              </p>
              <p className="font-['Outfit'] font-normal text-[12px] text-[#9ca3af] truncate">
                Manage your payment links and receive USDT
              </p>
            </div>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className="flex-shrink-0 text-[#9ca3af] group-hover:text-[#eb7cff] transition-colors"
            >
              <path
                d="M6 4L10 8L6 12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>

          {/* Public Profile - Opens in new tab (only shown when enabled) */}
          {userId && isPublicProfileEnabled && (
            <a
              href={`/${userId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 rounded-[8px] border border-[#e6e8ec] bg-white hover:bg-[#f9fafb] transition-colors group"
            >
              <div className="flex flex-col gap-1 flex-1 min-w-0">
                <p className="font-['Outfit'] font-medium text-[14px] text-[#393f49] group-hover:text-[#eb7cff] transition-colors">
                  Public Page
                </p>
                <p className="font-['Outfit'] font-normal text-[12px] text-[#9ca3af] truncate">
                  View and share your public page
                </p>
              </div>
              {/* External link icon */}
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                className="flex-shrink-0 text-[#9ca3af] group-hover:text-[#eb7cff] transition-colors"
              >
                <path
                  d="M6 10L10 6M10 6H6.5M10 6V9.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M14 8.66667V12.6667C14 13.403 13.403 14 12.6667 14H3.33333C2.59695 14 2 13.403 2 12.6667V3.33333C2 2.59695 2.59695 2 3.33333 2H7.33333"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          )}

          {/* Public Profile Visibility Toggle */}
          <div className="flex items-center justify-between p-4 rounded-[8px] border border-[#e6e8ec] bg-white">
            <div className="flex flex-col gap-1">
              <p className="font-['Outfit'] font-medium text-[14px] text-[#393f49]">
                Enable Public Page
              </p>
              <p className="font-['Outfit'] font-normal text-[12px] text-[#9ca3af]">
                Allow others to view your public page
              </p>
            </div>
            <ToggleSwitch
              enabled={isPublicProfileEnabled}
              onChange={handleTogglePublicProfile}
              disabled={isLoading || isUpdating}
            />
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-[rgba(247,89,255,0.1)] rounded-[12px] p-[10px] mt-2">
          <p className="font-['Outfit'] font-medium text-[12px] text-[#393f49] mb-2">
            Need Help?
          </p>
          <p className="font-['Outfit'] font-light text-[12px] text-[#696f8c]">
            Visit our{" "}
            <a href="https://docs.bloomprotocol.ai" target="_blank" rel="noopener noreferrer" className="text-[#eb7cff] hover:underline">
              documentation
            </a>{" "}
            or contact support for assistance.
          </p>
        </div>
      </div>
    </div>
  );
}
