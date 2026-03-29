"use client";

import { usePublicProfile } from "../../contexts/public-profile-context";
import { ToggleSwitch } from "../../components/shared";

export default function PublicPageToggleCard() {
  const {
    isPublicProfileEnabled,
    isUpdating: isUpdatingPublicProfile,
    handleTogglePublicProfile,
  } = usePublicProfile();

  return (
    <div className="bg-white rounded-[16px] border border-[#e6e8ec] p-6">
      <div className="flex items-center justify-between">
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
          disabled={isUpdatingPublicProfile}
        />
      </div>
    </div>
  );
}
