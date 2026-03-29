"use client";

import { useState } from "react";
import { usePublicProfile } from "../contexts/public-profile-context";
import { ToggleSwitch, ChevronIcon } from "./shared";

export default function SettingsCard() {
  const [isExpanded, setIsExpanded] = useState(false);

  // Use shared public profile context
  const {
    isPublicProfileEnabled,
    isLoading: isLoadingProfile,
    isUpdating: isUpdatingProfile,
    handleTogglePublicProfile,
  } = usePublicProfile();

  return (
    <div className="bg-white rounded-[16px] border border-[#e6e8ec] p-6">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between hover:opacity-80 transition-opacity"
        >
          <div className="flex items-center gap-3">
            
            <h2 className="font-semibold text-[20px] text-[#393f49]" style={{ fontFamily: 'Times, serif' }}>
              Settings
            </h2>
          </div>
          <ChevronIcon direction={isExpanded ? "up" : "down"} />
        </button>

        {isExpanded && (
          <>
            {/* Public Profile Section */}
            <div className="flex flex-col gap-3">
              <label className="font-['Outfit'] font-medium text-[14px] text-[#393f49]">
                Public Page
              </label>

              {/* Public Profile Toggle */}
              <div className="flex items-center justify-between p-4 rounded-[8px] border border-[#e6e8ec] bg-white">
                <div className="flex flex-col gap-1">
                  <p className="font-['Outfit'] font-medium text-[14px] text-[#393f49]">
                    Enable
                  </p>
                  <p className="font-['Outfit'] font-normal text-[12px] text-[#9ca3af]">
                    Allow others to view your profile page
                  </p>
                </div>
                <ToggleSwitch
                  enabled={isPublicProfileEnabled}
                  onChange={handleTogglePublicProfile}
                  disabled={isLoadingProfile || isUpdatingProfile}
                />
              </div>
            </div>

            {/* Account Actions */}
            <div className="flex flex-col gap-3">
              <label className="font-['Outfit'] font-medium text-[14px] text-[#393f49]">
                Account
              </label>

              {/* Delete Account */}
              <button className="font-['Outfit'] text-[14px] font-medium text-[#9ca3af] hover:text-red-500 transition-colors py-2">
                Delete Account
              </button>
            </div>

            {/* Warning Box */}
            <div className="bg-[rgba(255,89,89,0.1)] rounded-[12px] p-[10px]">
              <p className="font-['Outfit'] font-medium text-[12px] text-[#393f49] mb-2">
                Warning
              </p>
              <p className="font-['Outfit'] font-light text-[12px] text-[#696f8c]">
                Deleting your account is permanent and cannot be undone. All your data, including missions progress and rewards, will be lost.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
