/**
 * Reward Claiming Business Logic
 * Extracted from "@/app/(protected)/dashboard/contexts/user-profile-context.tsx for unit testing
 * 
 * Core Business Rules:
 * 1. Can only claim rewards for unclaimed completed missions
 * 2. Must validate mission completion status
 * 3. Must handle various error scenarios gracefully
 * 4. Must update multiple cache entries after successful claim
 */

export interface MissionData {
  id: string;
  claimed: boolean;
  status: 'Live' | 'Completed';
}

export interface ProfileInitialDataResponse {
  missions: MissionData[];
  statistics: {
    totalPoints: number;
  };
}

export interface ProfileSelectedMission {
  id: string;
  claimed: boolean;
}

export interface ClaimRewardResponse {
  success: boolean;
  data?: {
    updatedPoints: number;
  };
  error?: string;
}

export interface CacheUpdateActions {
  setUserPoints: (points: number) => void;
  setProfileInitialData: (updater: (old: ProfileInitialDataResponse | undefined) => ProfileInitialDataResponse | undefined) => void;
  setMissionDetail: (missionId: string, updater: (old: ProfileSelectedMission | undefined) => ProfileSelectedMission | undefined) => void;
  invalidateQueries: (queryKey: any[]) => Promise<void>;
}

/**
 * Validates if a reward can be claimed
 * Business Rule: Can only claim rewards for unclaimed completed missions
 */
export function canClaimReward(mission: ProfileSelectedMission | null): boolean {
  if (!mission) return false;
  return !mission.claimed;
}

/**
 * Processes successful reward claim response
 * Business Rule: Update all relevant cache entries with new claimed status and points
 */
export function processSuccessfulClaim(
  response: ClaimRewardResponse,
  mission: ProfileSelectedMission,
  cacheActions: CacheUpdateActions
): { success: boolean; updatedPoints?: number } {
  if (!response.success || !response.data) {
    return { success: false };
  }

  const updatedPoints = response.data.updatedPoints;

  // 1. Update user points cache
  cacheActions.setUserPoints(updatedPoints);

  // 2. Update profile initial data cache
  cacheActions.setProfileInitialData((oldData) => {
    if (!oldData) return oldData;

    return {
      ...oldData,
      // Update missions array
      missions: oldData.missions?.map(m =>
        m.id === mission.id ? { ...m, claimed: true } : m
      ),
      statistics: {
        ...oldData.statistics,
        totalPoints: updatedPoints
      }
    };
  });

  // 3. Update mission detail cache
  cacheActions.setMissionDetail(mission.id, (oldData) => {
    if (!oldData) return oldData;
    return { ...oldData, claimed: true };
  });

  return { success: true, updatedPoints };
}

/**
 * Handles reward claim error responses
 * Business Rule: Different error types require different cache invalidation strategies
 */
export async function handleClaimError(
  error: string,
  mission: ProfileSelectedMission,
  cacheActions: CacheUpdateActions
): Promise<{ errorType: string; actionTaken: string }> {
  switch (error) {
    case 'User has already claimed the reward':
      // Mission detail cache is out of sync
      await cacheActions.invalidateQueries(['missionDetail', mission.id]);
      return {
        errorType: 'already_claimed',
        actionTaken: 'invalidated_mission_detail'
      };

    case 'Mission not completed':
      // Profile data cache is out of sync
      await cacheActions.invalidateQueries(['profileInitialData']);
      return {
        errorType: 'not_completed',
        actionTaken: 'invalidated_profile_data'
      };

    default:
      return {
        errorType: 'unknown',
        actionTaken: 'none'
      };
  }
}

/**
 * Checks if a mission has unclaimed rewards
 * Business Rule: Mission must be completed and not claimed
 */
export function isUnclaimedMission(
  missionId: string,
  dashboardData: ProfileInitialDataResponse | undefined
): boolean {
  if (!dashboardData || !dashboardData.missions) return false;
  
  const mission = dashboardData.missions.find(m => m.id === missionId);
  if (!mission) return false;
  
  // Mission must be completed and not claimed
  return mission.status === 'Completed' && !mission.claimed;
}

/**
 * Validates reward claim eligibility with detailed reasons
 * Business Rule: Comprehensive validation before attempting API call
 */
export function validateRewardClaimEligibility(
  mission: ProfileSelectedMission | null,
  dashboardData: ProfileInitialDataResponse | undefined
): { 
  canClaim: boolean; 
  reason?: 'no_mission' | 'already_claimed' | 'not_completed' | 'not_found_in_data' 
} {
  if (!mission) {
    return { canClaim: false, reason: 'no_mission' };
  }

  if (mission.claimed) {
    return { canClaim: false, reason: 'already_claimed' };
  }

  if (!dashboardData || !dashboardData.missions) {
    return { canClaim: false, reason: 'not_found_in_data' };
  }

  // Check in missions array
  const missionData = dashboardData.missions.find(m => m.id === mission.id);
  if (missionData && missionData.status === 'Completed') {
    return { canClaim: true };
  }

  return { canClaim: false, reason: 'not_completed' };
}

/**
 * Calculates points difference after reward claim
 * Business Rule: Track points gained from reward claiming
 */
export function calculatePointsGained(
  oldPoints: number,
  newPoints: number
): number {
  return Math.max(0, newPoints - oldPoints);
}