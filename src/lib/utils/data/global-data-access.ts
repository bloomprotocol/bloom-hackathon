/**
 * Business logic for global data access pattern using React Query
 */

interface GlobalDataAccessParams {
  queryClient: {
    getQueryData: (key: string[]) => any;
  };
  queryKey: string[];
  isAuthenticated: boolean;
  onCacheInvalidate?: () => void;
}

interface GlobalDataAccessResult {
  userRole: string | null;
  referralCode: string | null;
  dataFromCache: boolean;
  canSwitchToUserView: boolean;
  canSwitchToBuilderRole: boolean;
  canAccessBuilderInbox: boolean;
  canCreateProject: boolean;
  canVoteOnProjects: boolean;
}

export function extractGlobalDataAccessLogic({
  queryClient,
  queryKey,
  isAuthenticated,
  onCacheInvalidate,
}: GlobalDataAccessParams): GlobalDataAccessResult {
  // Business Rule: Only access cache if authenticated
  if (!isAuthenticated) {
    return {
      userRole: null,
      referralCode: null,
      dataFromCache: false,
      canSwitchToUserView: false,
      canSwitchToBuilderRole: false,
      canAccessBuilderInbox: false,
      canCreateProject: false,
      canVoteOnProjects: false,
    };
  }

  // Business Rule: Get data from React Query cache
  const cachedData = queryClient.getQueryData(queryKey);
  const userRole = cachedData?.userInfo?.role || null;
  const referralCode = cachedData?.userInfo?.referralCode || null;

  // Business Rule: Determine available actions based on role
  const isBuilder = userRole === 'BUILDER';
  const isUser = userRole === 'USER';

  return {
    userRole,
    referralCode,
    dataFromCache: !!cachedData,
    canSwitchToUserView: isBuilder,
    canSwitchToBuilderRole: isUser,
    canAccessBuilderInbox: isBuilder,
    canCreateProject: isBuilder,
    canVoteOnProjects: isUser,
  };
}