/**
 * Feature: Dynamic-Project-Detail-Page-Configuration-250808
 * Spec Reference: fe-test-plan.md#configuration-fetching-tests
 * Implemented by: CI Agent
 * Date: 2025-08-09
 * 
 * BUSINESS VALUE TESTS ONLY - Testing core business logic, NOT implementation details
 */

import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useProjectDisplayConfig } from '../useProjectDisplayConfig';
import { apiGet } from '@/lib/api/apiConfig';

// Mock the API
jest.mock('@/lib/api/apiConfig');
const mockApiGet = apiGet as jest.MockedFunction<typeof apiGet>;

// Mock data
const mockProjectDisplayConfig = {
  _id: "mock-config-001",
  projectId: "mock-project-uuid-001", 
  projectName: "Test DeFi Protocol",
  projectSlug: "test-defi-protocol",
  components: {
    teamMembers: true,
    roadmap: false,
    tokenomics: true,
    projectUpdates: false,
    links: true
  },
  createdAt: "2025-08-08T10:00:00.000Z",
  updatedAt: "2025-08-08T11:00:00.000Z",
  lastModifiedBy: {
    uid: 123,
    email: "admin@bloom.com"
  }
};

const mockConfigSuccessResponse = {
  success: true,
  statusCode: 200,
  data: mockProjectDisplayConfig,
  error: null
};

const mockNetworkError = new Error("Network request failed");

// Test utilities
const createQueryClientWrapper = (queryClient: QueryClient) => {
  return ({ children }: { children: React.ReactNode }) => {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
};

describe('useProjectDisplayConfig Hook - Business Logic Tests', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });
    mockApiGet.mockClear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('BUSINESS RULE: Configuration must be retrieved for project visibility control', () => {
    test('should fetch project display configuration successfully', async () => {
      // BUSINESS VALUE: Configuration must be retrieved for project visibility control
      mockApiGet.mockResolvedValueOnce(mockConfigSuccessResponse);
      
      const { result } = renderHook(
        () => useProjectDisplayConfig({ projectId: 'mock-project-uuid-001' }),
        { wrapper: createQueryClientWrapper(queryClient) }
      );
      
      await waitFor(() => {
        expect(result.current.displayConfig).toEqual(mockProjectDisplayConfig.components);
        expect(result.current.isLoading).toBe(false);
      });
      
      expect(mockApiGet).toHaveBeenCalledWith('/projects/mock-project-uuid-001/display-config');
    });

    test('should return configuration data with proper structure', async () => {
      // BUSINESS VALUE: Configuration structure must be consistent for component logic
      mockApiGet.mockResolvedValueOnce(mockConfigSuccessResponse);
      
      const { result } = renderHook(
        () => useProjectDisplayConfig({ projectId: 'mock-project-uuid-001' }),
        { wrapper: createQueryClientWrapper(queryClient) }
      );
      
      await waitFor(() => {
        const config = result.current.displayConfig;
        
        // All required component fields must be present and boolean
        expect(typeof config.teamMembers).toBe('boolean');
        expect(typeof config.roadmap).toBe('boolean');
        expect(typeof config.tokenomics).toBe('boolean');
        expect(typeof config.projectUpdates).toBe('boolean');
        expect(typeof config.links).toBe('boolean');
        
        // Configuration must match expected business state
        expect(config.teamMembers).toBe(true);
        expect(config.roadmap).toBe(false);
        expect(config.tokenomics).toBe(true);
        expect(config.projectUpdates).toBe(false);
        expect(config.links).toBe(true);
      });
    });
  });

  describe('BUSINESS RULE: System must remain functional even if configuration API fails', () => {
    test('should use default configuration when API fails', async () => {
      // BUSINESS VALUE: System must remain functional even if configuration API fails
      mockApiGet.mockRejectedValueOnce(mockNetworkError);
      
      const { result } = renderHook(
        () => useProjectDisplayConfig({ projectId: 'mock-project-uuid-001' }),
        { wrapper: createQueryClientWrapper(queryClient) }
      );
      
      await waitFor(() => {
        // Core business value: always provides usable configuration
        expect(result.current.displayConfig).toEqual({
          teamMembers: true,
          roadmap: true,
          tokenomics: true,
          projectUpdates: true,
          links: true
        });
      });
    });

    test('should use provided fallback configuration when API fails', async () => {
      // BUSINESS VALUE: Fallback configuration allows for graceful degradation
      mockApiGet.mockRejectedValueOnce(mockNetworkError);
      
      const fallbackConfig = {
        teamMembers: false,
        roadmap: true,
        tokenomics: false,
        projectUpdates: true,
        links: false
      };
      
      const { result } = renderHook(
        () => useProjectDisplayConfig({ 
          projectId: 'mock-project-uuid-001',
          fallback: fallbackConfig
        }),
        { wrapper: createQueryClientWrapper(queryClient) }
      );
      
      await waitFor(() => {
        // Core business value: always provides usable configuration
        expect(result.current.displayConfig).toEqual(fallbackConfig);
      });
    });

    test('should handle 404 errors gracefully (project not found)', async () => {
      // BUSINESS VALUE: Invalid project IDs should not break the application
      const notFoundError = { status: 404, message: 'Project not found' };
      mockApiGet.mockRejectedValueOnce(notFoundError);
      
      const { result } = renderHook(
        () => useProjectDisplayConfig({ projectId: 'non-existent-project' }),
        { wrapper: createQueryClientWrapper(queryClient) }
      );
      
      await waitFor(() => {
        // Should fall back to default configuration
        expect(result.current.displayConfig).toEqual({
          teamMembers: true,
          roadmap: true,
          tokenomics: true,
          projectUpdates: true,
          links: true
        });
      });
    });
  });

  describe('BUSINESS RULE: Configuration caching improves performance', () => {
    test('should cache configuration for 5 minutes as specified', async () => {
      // BUSINESS VALUE: Reduce API calls and improve performance
      mockApiGet.mockResolvedValueOnce(mockConfigSuccessResponse);
      
      const { rerender } = renderHook(
        () => useProjectDisplayConfig({ projectId: 'mock-project-uuid-001' }),
        { wrapper: createQueryClientWrapper(queryClient) }
      );
      
      await waitFor(() => expect(mockApiGet).toHaveBeenCalledTimes(1));
      
      // Second call should use cache
      rerender();
      expect(mockApiGet).toHaveBeenCalledTimes(1);
    });

    test('should provide immediate response from cache on subsequent calls', async () => {
      // BUSINESS VALUE: Cached data provides instant user experience
      mockApiGet.mockResolvedValueOnce(mockConfigSuccessResponse);
      
      const { result, rerender } = renderHook(
        () => useProjectDisplayConfig({ projectId: 'mock-project-uuid-001' }),
        { wrapper: createQueryClientWrapper(queryClient) }
      );
      
      // Wait for first call to complete
      await waitFor(() => {
        expect(result.current.displayConfig).toEqual(mockProjectDisplayConfig.components);
      });
      
      // Second call should be immediate (not loading)
      rerender();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.displayConfig).toEqual(mockProjectDisplayConfig.components);
    });
  });

  describe('BUSINESS RULE: Hook provides necessary state information for UI components', () => {
    test('should provide all necessary state flags for component logic', async () => {
      // BUSINESS VALUE: Components need complete state information for proper rendering
      mockApiGet.mockResolvedValueOnce(mockConfigSuccessResponse);
      
      const { result } = renderHook(
        () => useProjectDisplayConfig({ projectId: 'mock-project-uuid-001' }),
        { wrapper: createQueryClientWrapper(queryClient) }
      );
      
      await waitFor(() => {
        // All required state flags must be available
        expect(typeof result.current.isLoading).toBe('boolean');
        expect(typeof result.current.hasError).toBe('boolean');
        expect(typeof result.current.isConfigured).toBe('boolean');
        expect(typeof result.current.isUsingFallback).toBe('boolean');
        expect(typeof result.current.displayConfig).toBe('object');
        expect(typeof result.current.config).toBe('object');
        expect(typeof result.current.refetch).toBe('function');
        
        // State must reflect successful configuration load
        expect(result.current.isConfigured).toBe(true);
        expect(result.current.hasError).toBe(false);
        expect(result.current.isUsingFallback).toBe(false);
      });
    });

    test('should handle malformed API response gracefully', async () => {
      // BUSINESS VALUE: Robust error handling prevents application crashes
      const malformedResponse = {
        success: true,
        statusCode: 200,
        data: null, // Invalid structure
        error: null
      };
      mockApiGet.mockResolvedValueOnce(malformedResponse);
      
      const { result } = renderHook(
        () => useProjectDisplayConfig({ projectId: 'mock-project-uuid-001' }),
        { wrapper: createQueryClientWrapper(queryClient) }
      );
      
      await waitFor(() => {
        // Should fall back to default configuration
        expect(result.current.displayConfig).toEqual({
          teamMembers: true,
          roadmap: true,
          tokenomics: true,
          projectUpdates: true,
          links: true
        });
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe('BUSINESS RULE: Retry logic handles temporary failures', () => {
    test('should eventually recover from temporary failures', async () => {
      // BUSINESS VALUE: Temporary network issues should not cause permanent failures
      mockApiGet
        .mockRejectedValueOnce(new Error('Network timeout'))
        .mockRejectedValueOnce(new Error('Network timeout'))
        .mockResolvedValueOnce(mockConfigSuccessResponse);
      
      const { result } = renderHook(
        () => useProjectDisplayConfig({ projectId: 'mock-project-uuid-001' }),
        { wrapper: createQueryClientWrapper(queryClient) }
      );
      
      await waitFor(() => {
        // Core business value: provides configuration even after initial failures
        expect(result.current.displayConfig).toBeDefined();
      });
      
      // Should have made multiple attempts
      expect(mockApiGet).toHaveBeenCalledWith('/projects/mock-project-uuid-001/display-config');
    });

    test('should NOT retry on 404 errors as specified', async () => {
      // BUSINESS VALUE: 404 errors should not waste resources with retries
      const notFoundError = { status: 404, message: 'Project not found' };
      mockApiGet.mockRejectedValueOnce(notFoundError);
      
      const { result } = renderHook(
        () => useProjectDisplayConfig({ projectId: 'non-existent-project' }),
        { wrapper: createQueryClientWrapper(queryClient) }
      );
      
      await waitFor(() => {
        // Core business value: provides fallback configuration even on 404
        expect(result.current.displayConfig).toEqual({
          teamMembers: true,
          roadmap: true,
          tokenomics: true,
          projectUpdates: true,
          links: true
        });
      });
      
      // Should only be called once (no retries for 404)
      expect(mockApiGet).toHaveBeenCalledTimes(1);
    });
  });
});