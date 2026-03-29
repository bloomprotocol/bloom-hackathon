/**
 * Business logic for dashboard view synchronization after role change
 */

interface DashboardRoleSyncParams {
  currentRole: string;
  switchToBuilder: () => Promise<{ success: boolean }>;
  invalidateQueries: (queryKey: string[]) => void;
  getDashboardData: () => { userInfo: { role: string }, viewMode: string };
  isPageRefresh?: boolean;
}

interface DashboardRoleSyncResult {
  expectedView: string;
  roleChanged: boolean;
  success: boolean;
}

export async function extractDashboardRoleSyncLogic({
  currentRole,
  switchToBuilder,
  invalidateQueries,
  getDashboardData,
  isPageRefresh = false,
}: DashboardRoleSyncParams): Promise<DashboardRoleSyncResult> {
  // Business Rule: Call API to switch role
  const apiResult = await switchToBuilder();
  
  if (!apiResult.success) {
    return {
      expectedView: currentRole === 'BUILDER' ? 'builder' : 'supporter',
      roleChanged: false,
      success: false,
    };
  }

  // Business Rule: Invalidate cache to get fresh data
  invalidateQueries(['profileInitialData']);

  // Business Rule: Determine expected view after role change
  const newRole = currentRole === 'BUILDER' ? 'USER' : 'BUILDER';
  const expectedView = newRole === 'BUILDER' ? 'builder' : 'supporter';

  return {
    expectedView,
    roleChanged: true,
    success: true,
  };
}