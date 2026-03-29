/**
 * Feature: Dynamic-Project-Detail-Page-Configuration-250808
 * Spec Reference: fe-tech-spec.md#useprojectdisplayconfig-hook
 * Implemented by: CI Agent
 * Date: 2025-08-09
 */

import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api/apiConfig';
import { ApiResponse } from '@/types/api';

export interface ComponentConfig {
  teamMembers: boolean;
  roadmap: boolean;
  tokenomics: boolean;
  projectUpdates: boolean;
  links: boolean;
}

export interface ProjectDisplayConfigData {
  _id: string;
  projectId: string;
  projectName: string;
  projectSlug: string;
  components: ComponentConfig;
  createdAt: string;
  updatedAt: string;
  lastModifiedBy: {
    uid: number;
    email: string;
  };
  changeHistory?: Array<{
    timestamp: string;
    changes: Record<string, { from: boolean; to: boolean }>;
    note?: string;
    modifiedBy: {
      uid: number;
      email: string;
    };
  }>;
}

interface UseProjectDisplayConfigOptions {
  projectId: string;
  fallback?: ComponentConfig;
}

/**
 * Hook to fetch and cache project display configuration
 * Provides graceful fallback behavior if API fails
 */
export function useProjectDisplayConfig({ projectId, fallback }: UseProjectDisplayConfigOptions) {
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ['project-display-config', projectId],
    queryFn: async () => {
      const response = await apiGet<ApiResponse<ProjectDisplayConfigData>>(`/projects/${projectId}/display-config`);
      return response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - per specification
    gcTime: 10 * 60 * 1000, // 10 minutes cache time
    retry: (failureCount, error) => {
      // Don't retry on 404 (project not found) - per specification
      if (error && 'status' in error && (error as any).status === 404) {
        return false;
      }
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
    // Transform response to extract config data
    select: (response) => {
      if (response?.data) {
        return response.data as ProjectDisplayConfigData;
      }
      return null;
    }
  });

  // Get default configuration - per specification
  const getDefaultConfig = (): ComponentConfig => ({
    teamMembers: true,
    roadmap: true,
    tokenomics: true,
    projectUpdates: true,
    links: true
  });

  // Provide display config with fallback behavior - CRITICAL for graceful degradation
  const displayConfig = data?.components || fallback || getDefaultConfig();

  return {
    config: data,
    isLoading,
    error,
    refetch,
    // This is the key field that components will use - always returns valid config
    displayConfig,
    // Helper methods
    isConfigured: Boolean(data),
    hasError: Boolean(error),
    isUsingFallback: Boolean(error) || (!data && !isLoading)
  };
}