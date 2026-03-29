"use client";

import { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { apiGet, apiPatch } from "@/lib/api/apiConfig";
import { logger } from "@/lib/utils/logger";
import { type ApiResponse, type X402ProfileData } from "../types";

export interface PublicProfileContextType {
  isPublicProfileEnabled: boolean;
  isLoading: boolean;
  isUpdating: boolean;
  handleTogglePublicProfile: () => Promise<void>;
}

const PublicProfileContext = createContext<PublicProfileContextType | null>(null);

export const PublicProfileProvider = ({ children }: { children: React.ReactNode }) => {
  const [isPublicProfileEnabled, setIsPublicProfileEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch current profile visibility status
  useEffect(() => {
    async function fetchProfileStatus() {
      try {
        const response = await apiGet('/users/x402-profile') as ApiResponse<X402ProfileData>;
        if (response.success && response.data) {
          setIsPublicProfileEnabled(response.data.isPublicProfileEnabled ?? false);
        }
      } catch {
        // Profile not set yet, default to false
        setIsPublicProfileEnabled(false);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfileStatus();
  }, []);

  // Handle toggle change
  const handleTogglePublicProfile = useCallback(async () => {
    if (isUpdating) return;

    const newValue = !isPublicProfileEnabled;
    setIsUpdating(true);

    // Optimistic update
    setIsPublicProfileEnabled(newValue);

    try {
      await apiPatch('/users/x402-profile', {
        isPublicProfileEnabled: newValue,
      });
    } catch (error) {
      // Revert on error
      setIsPublicProfileEnabled(!newValue);
      logger.error('Failed to update public profile visibility', { error });
    } finally {
      setIsUpdating(false);
    }
  }, [isUpdating, isPublicProfileEnabled]);

  const value = useMemo(() => ({
    isPublicProfileEnabled,
    isLoading,
    isUpdating,
    handleTogglePublicProfile,
  }), [isPublicProfileEnabled, isLoading, isUpdating, handleTogglePublicProfile]);

  return (
    <PublicProfileContext.Provider value={value}>
      {children}
    </PublicProfileContext.Provider>
  );
};

export const usePublicProfile = () => {
  const context = useContext(PublicProfileContext);
  if (!context) {
    throw new Error("usePublicProfile must be used within PublicProfileProvider");
  }
  return context;
};
