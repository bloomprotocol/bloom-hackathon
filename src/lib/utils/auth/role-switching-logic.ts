/**
 * Core business logic for role switching
 * Extracted from ProfileModal.tsx for testing
 */

import { COOKIE_KEYS } from '@/lib/utils/storage/cookieService';

interface RoleSwitchingParams {
  currentRole: string;
  isOnDashboard?: boolean;
  switchToBuilder: () => Promise<{ success: boolean }>;
  invalidateQueries: (queryKey: string[]) => void;
  setCookie: (key: string, value: string) => void;
}

interface RoleSwitchingResult {
  newRole: string;
  isViewModeSwitch: boolean;
  success: boolean;
}

export async function extractRoleSwitchingLogic({
  currentRole,
  isOnDashboard = false,
  switchToBuilder,
  invalidateQueries,
  setCookie,
}: RoleSwitchingParams): Promise<RoleSwitchingResult> {
  // Business Rule: BUILDER on dashboard only switches view, not role
  if (currentRole === 'BUILDER' && isOnDashboard) {
    return {
      newRole: currentRole,
      isViewModeSwitch: true,
      success: true,
    };
  }

  // Business Rule: Call API to switch role
  const apiResult = await switchToBuilder();
  
  if (!apiResult.success) {
    return {
      newRole: currentRole,
      isViewModeSwitch: false,
      success: false,
    };
  }

  // Business Rule: Toggle between USER and BUILDER
  const newRole = currentRole === 'BUILDER' ? 'USER' : 'BUILDER';

  // Business Rule: Update role cookie (legacy format, to be removed)
  setCookie(COOKIE_KEYS.USER_ROLES_LEGACY, JSON.stringify([newRole]));

  // Business Rule: Invalidate React Query cache to refresh user data
  invalidateQueries(['profileInitialData']);

  return {
    newRole,
    isViewModeSwitch: false,
    success: true,
  };
}