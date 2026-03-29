import { useQuery } from '@tanstack/react-query';
import { FALLBACK_MENU_ITEMS, FALLBACK_MENU_ROUTES, convertApiToMenuItems } from '@/lib/config/menuItems';
import { MenuItemCollection } from '@/lib/context/menu/menuTypes';
import { menuService } from '@/lib/api/services/menuService';
import { logger } from '@/lib/utils/logger';

/**
 * Custom hook to fetch menu items from API with React Query
 * Implements polling for automatic updates and fallback for reliability
 */
export const useMenuItems = () => {
  return useQuery<MenuItemCollection>({
    queryKey: ['menu-items'],
    
    queryFn: async () => {
      // Temporarily use fallback to control menu order from frontend
      return FALLBACK_MENU_ITEMS;
    },
    
    // Polling configuration - check for updates every 5 minutes
    refetchInterval: 5 * 60 * 1000,        // 5 minutes
    refetchIntervalInBackground: true,      // Keep polling even when tab not active
    
    // Cache configuration
    staleTime: 4 * 60 * 1000,              // Consider data fresh for 4 minutes
    gcTime: 10 * 60 * 1000,                // Keep in cache for 10 minutes (v5 uses gcTime instead of cacheTime)
    
    // Prevent excessive refetching
    refetchOnWindowFocus: false,            // Don't refetch when tab gains focus
    refetchOnReconnect: false,              // Don't refetch on reconnect
    refetchOnMount: false,                  // Don't refetch on component mount
    
    // Retry configuration
    retry: 3,                               // Retry failed requests 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    
    // Initial data - use fallback immediately while fetching
    placeholderData: FALLBACK_MENU_ITEMS,
  });
};

/**
 * Hook to get menu routes configuration
 * For now, this just returns the fallback routes
 * Can be extended to fetch from API if needed
 */
export const useMenuRoutes = () => {
  // For now, routes are static and don't need to be fetched
  // This can be extended later if routes become dynamic
  return {
    routes: FALLBACK_MENU_ROUTES,
    isLoading: false,
    error: null
  };
};