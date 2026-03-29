// Export all hooks from a central location
export { default as useCountdown } from './useCountdown';
export { useProfileInitialData } from './useProfileInitialData';
export { useTaskActions } from './useTaskActions';
export { useUnifiedAuth } from './useUnifiedAuth';
export { useUserPoints } from './useUserPoints';

// New hybrid auth hooks
export { useAuthGuard, useHasRole, useHasAllRoles } from './useAuthGuard';
export { 
  useUserProfile, 
  useMissions,
  useCurrentMissions, 
  useCompletedMissions
} from './useUserProfile';
export { useRandomProject } from './useRandomProject';
export { useXConnection } from './useXConnection';
export type { XConnectionStatus, UseXConnectionOptions, UseXConnectionReturn } from './useXConnection';