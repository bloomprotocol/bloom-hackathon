"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useAuthGuard } from "@/lib/hooks";
import apiInstance, { apiGet, apiPatch } from "@/lib/api/apiConfig";
import { logger } from "@/lib/utils/logger";
import { ChevronIcon } from "./shared";
import { PROFILE_CONSTANTS, type ApiResponse, type X402ProfileData, type FileUploadResponse } from "../types";

const DEFAULT_AVATAR = "https://statics.bloomprotocol.ai/logo/bloom-protocol-avatar.png";

export default function ProfileInfoCard() {
  const { userId } = useAuthGuard();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  // Profile data from API
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Save state
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState("");

  // Avatar upload state
  const [isUploading, setIsUploading] = useState(false);

  // Fetch profile data on mount
  useEffect(() => {
    if (!userId) return;

    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const response = await apiGet("/users/x402-profile") as ApiResponse<X402ProfileData>;
        if (response?.success && response?.data) {
          setDisplayName(response.data.displayName || "");
          setBio(response.data.bio || "");
          setAvatarUrl(response.data.avatarUrl || "");
        }
      } catch {
        // Profile not configured yet, ignore
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  // Handle avatar click - open file picker
  const handleAvatarClick = () => {
    if (isUploading) return;
    fileInputRef.current?.click();
  };

  // Handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!PROFILE_CONSTANTS.ALLOWED_AVATAR_TYPES.includes(file.type)) {
      setError("Please select a valid image (JPG, PNG, GIF, or WebP)");
      return;
    }

    // Validate file size
    if (file.size > PROFILE_CONSTANTS.MAX_AVATAR_FILE_SIZE) {
      setError("Image must be less than 2MB");
      return;
    }

    setError("");
    setIsUploading(true);

    try {
      // 1. Upload file to R2
      const formData = new FormData();
      formData.append("file", file);
      formData.append("path", "user/avatar");

      const uploadResponse = await apiInstance.post("/common/upload/file", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const uploadData = uploadResponse.data as ApiResponse<FileUploadResponse>;
      if (!uploadData?.success || !uploadData?.data?.url) {
        throw new Error("Upload failed");
      }

      const newAvatarUrl = uploadData.data.url;

      // 2. Save avatarUrl to profile
      const saveResult = await apiPatch("/users/x402-profile", {
        avatarUrl: newAvatarUrl,
      }) as ApiResponse<X402ProfileData>;

      if (!saveResult.success) {
        throw new Error("Failed to save avatar");
      }

      // 3. Update local state
      setAvatarUrl(newAvatarUrl);
    } catch (err) {
      const error = err as Error;
      logger.error("Avatar upload error", { error });
      setError(error.message || "Failed to upload avatar. Please try again.");
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Handle save
  const handleSave = async () => {
    setIsSaving(true);
    setError("");

    try {
      const result = await apiPatch("/users/x402-profile", {
        displayName: displayName.trim() || undefined,
        bio: bio.trim() || undefined,
      }) as ApiResponse<X402ProfileData>;

      if (!result.success) {
        setError(result.error || "Failed to save profile. Please try again.");
        setIsSaving(false);
        return;
      }

      // Show "Saved" feedback
      setIsSaved(true);
      setTimeout(() => {
        setIsSaved(false);
      }, PROFILE_CONSTANTS.FEEDBACK_DURATION);
    } catch (err) {
      const error = err as Error;
      setError(error.message || "Failed to save profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

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
              Profile Information
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

            {!isLoading && (
              <>
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {/* Avatar Section */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-[#f3f4f6] overflow-hidden">
                      {isUploading ? (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-5 h-5 border-2 border-[#eb7cff] border-t-transparent rounded-full animate-spin" />
                        </div>
                      ) : (
                        <Image
                          src={avatarUrl || DEFAULT_AVATAR}
                          alt="Profile avatar"
                          width={48}
                          height={48}
                          className="object-cover w-full h-full"
                          unoptimized
                        />
                      )}
                    </div>
                    <button
                      onClick={handleAvatarClick}
                      disabled={isUploading}
                      className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#eb7cff] flex items-center justify-center hover:bg-[#E563FF] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M3 17.25V21H6.75L17.81 9.94L14.06 6.19L3 17.25ZM20.71 7.04C21.1 6.65 21.1 6.02 20.71 5.63L18.37 3.29C17.98 2.9 17.35 2.9 16.96 3.29L15.13 5.12L18.88 8.87L20.71 7.04Z"
                          fill="white"
                        />
                      </svg>
                    </button>
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="font-['Outfit'] font-medium text-[14px] text-[#393f49]">
                      Profile Picture
                    </p>
                    <p className="font-['Outfit'] font-normal text-[12px] text-[#9ca3af]">
                      JPG, PNG, GIF or WebP. Max 2MB.
                    </p>
                  </div>
                </div>

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
                    Bio (optional)
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell others about yourself..."
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

                {/* Error Message */}
                {error && (
                  <p className="font-['Outfit'] text-[14px] text-red-500">{error}</p>
                )}

                {/* Save Button */}
                <button
                  onClick={handleSave}
                  disabled={isSaving || isSaved}
                  className="w-full relative rounded-[27px] bg-[#eb7cff] text-white hover:bg-[#E563FF] shadow-[0px_1px_1px_0.05px_rgba(24,24,27,0.24)] transition-colors px-[20px] py-[10px] flex items-center justify-center font-semibold text-[14px] leading-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? "Saving..." : isSaved ? "Saved" : "Save Changes"}
                  <div className="absolute inset-0 pointer-events-none shadow-[0px_2px_0px_0px_inset_rgba(255,255,255,0.1),0px_8px_16px_0px_inset_rgba(255,255,255,0.16)] rounded-[27px]" />
                </button>

                {/* Info Box */}
                <div className="bg-[rgba(76,190,255,0.1)] rounded-[12px] p-[10px]">
                  <p className="font-['Outfit'] font-light text-[12px] text-[#696f8c]">
                    This information is displayed on your{" "}
                    <a href="https://docs.bloomprotocol.ai/platform/public-page" target="_blank" rel="noopener noreferrer" className="text-[#eb7cff] hover:underline">
                      learn more about the public page
                    </a>
                    .
                  </p>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
