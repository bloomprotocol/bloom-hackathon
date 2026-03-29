'use client';

import { createContext, useContext, useState, useMemo, useCallback, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { usePlatform } from '@/lib/utils/platform';
import { useAuth } from '@/lib/context/AuthContext';
import { generateCodeVerifier, generateCodeChallenge, generateRandomString } from '@/lib/oauth/pkce';
import { getCookie, COOKIE_KEYS } from '@/lib/utils/storage/cookieService';
import { builderService } from '@/lib/api/services/builderService';
import {
  DashboardState,
  ConnectedXAccount,
  MissionSummary,
  DashboardStats,
  PendingInfo,
  ClaimedSkill,
  MS_PER_DAY,
  MS_PER_HOUR,
} from '../constants';
import type { ClaimRequest } from '../constants';
import { logger } from '@/lib/utils/logger';

// ============================================
// CONTEXT TYPE
// ============================================
interface BuilderDashboardContextType {
  // Platform
  isMobile: boolean;

  // Dashboard state (for design preview switching)
  dashboardState: DashboardState;
  setDashboardState: (state: DashboardState) => void;

  // Connected account
  connectedAccount: ConnectedXAccount | null;

  // Missions
  missions: MissionSummary[];

  // Stats
  stats: DashboardStats;

  // Pending info
  pendingInfo: PendingInfo;

  // Claimed skills
  claimedSkills: ClaimedSkill[];
  handleSubmitClaimRequest: (payload: ClaimRequest) => Promise<boolean>;

  // Important note dismissal
  isNoteDismissed: boolean;
  dismissNote: () => void;

  // Actions (design preview - console.log only)
  handleConnectX: () => void;
  handleDisconnectX: () => void;
  handleManageMission: (missionId: string) => void;
  handleViewMission: (missionId: string) => void;
  handleReviewPending: () => void;
  handleHowItWorks: () => void;

  // Utilities
  getTimeRemaining: (endTime: string) => string;
  getTimeAgo: (endTime: string) => string;
}

const BuilderDashboardContext = createContext<BuilderDashboardContextType | null>(null);

// ============================================
// PROVIDER
// ============================================
export function BuilderDashboardProvider({ children }: { children: ReactNode }) {
  // Router for navigation
  const router = useRouter();

  // Platform detection
  const { isMobile } = usePlatform();

  // Auth context
  const { isAuthenticated, hasRole } = useAuth();

  // State
  const [dashboardState, setDashboardState] = useState<DashboardState>('not_connected');
  const [isNoteDismissed, setIsNoteDismissed] = useState(false);
  const [realXProfile, setRealXProfile] = useState<ConnectedXAccount | null>(null);
  const [realMissions, setRealMissions] = useState<MissionSummary[]>([]);
  const [realStats, setRealStats] = useState<DashboardStats | null>(null);
  const [claimedSkills, setClaimedSkills] = useState<ClaimedSkill[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch dashboard data from API
  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await builderService.getDashboard();

      if (response.success && response.data) {
        const { stats, missions, xProfile } = response.data;

        // Set X profile
        setRealXProfile({
          xUsername: xProfile.xUsername,
          xDisplayName: xProfile.xDisplayName,
          profileImageUrl: xProfile.xProfileImageUrl || '',
          joinedDate: new Date().toISOString(),
        });

        // Transform missions to include default reward fields (not displayed but required by type)
        const transformedMissions: MissionSummary[] = missions.map((m) => ({
          id: m.id,
          title: m.title,
          status: m.status,
          totalSubmissions: m.totalSubmissions,
          approvedCount: m.approvedCount,
          distributedCount: m.distributedCount,
          rewardPerSubmission: 0, // Not used in dashboard display
          rewardToken: '', // Not used in dashboard display
          endTime: m.endTime,
        }));

        setRealMissions(transformedMissions);

        // Set stats with default distributed fields (not used in dashboard display)
        setRealStats({
          totalMissions: stats.totalMissions,
          activeMissions: stats.activeMissions,
          uniqueSubmissions: stats.uniqueSubmissions,
          totalSubmissions: stats.totalSubmissions,
          totalDistributed: 0, // Not used in dashboard display
          distributedToken: '', // Not used in dashboard display
        });

        // Set dashboard state based on missions count
        if (missions.length > 0) {
          setDashboardState('has_missions');
        } else {
          setDashboardState('no_missions');
        }

        console.log('[Builder] Dashboard data loaded:', missions.length, 'missions');

        // Fetch claimed skills (silent fail)
        try {
          const skills = await builderService.getClaimedSkills();
          setClaimedSkills(skills);
        } catch {
          setClaimedSkills([]);
        }
      }
    } catch (error: any) {
      logger.error('[Builder] Failed to fetch dashboard', { error });
      const status = error?.response?.status;

      if (status === 404) {
        // No X account connected
        setDashboardState('not_connected');
        setRealXProfile(null);
        setRealMissions([]);
        setRealStats(null);
      } else if (status === 401 || status === 403) {
        // Not authenticated or not authorized - show connect prompt
        setDashboardState('not_connected');
      } else {
        // Network error or server error - also show not_connected
        // User needs to retry or check their connection
        setDashboardState('not_connected');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check callback results and auth state on mount
  useEffect(() => {
    // 1. Check for callback results first (from /callback/x-builder)
    const successData = sessionStorage.getItem('builder_login_success');
    const noMissionsData = sessionStorage.getItem('builder_no_missions');
    const errorData = sessionStorage.getItem('builder_login_error');

    if (successData) {
      sessionStorage.removeItem('builder_login_success');
      try {
        const data = JSON.parse(successData);
        // Transform xProfile to ConnectedXAccount format
        if (data.xProfile) {
          setRealXProfile({
            xUsername: data.xProfile.xUsername,
            xDisplayName: data.xProfile.xDisplayName,
            profileImageUrl: data.xProfile.xProfileImageUrl || '',
            joinedDate: new Date().toISOString(),
          });
        }
        // Fetch full dashboard data from API
        fetchDashboardData();
        console.log('[Builder] Login successful, fetching dashboard data');
      } catch (e) {
        logger.error('[Builder] Failed to parse success data', { error: e });
      }
      return;
    }

    if (noMissionsData) {
      sessionStorage.removeItem('builder_no_missions');
      try {
        const data = JSON.parse(noMissionsData);
        if (data.xProfile) {
          setRealXProfile({
            xUsername: data.xProfile.xUsername,
            xDisplayName: data.xProfile.xDisplayName,
            profileImageUrl: data.xProfile.xProfileImageUrl || '',
            joinedDate: new Date().toISOString(),
          });
        }
        setDashboardState('no_missions');
        console.log('[Builder] No missions found');
      } catch (e) {
        logger.error('[Builder] Failed to parse no missions data', { error: e });
      }
      return;
    }

    if (errorData) {
      sessionStorage.removeItem('builder_login_error');
      logger.error('[Builder] Login error', { error: errorData });
      setDashboardState('not_connected');
      return;
    }

    // 2. No callback result - check current auth state
    const role = getCookie(COOKIE_KEYS.ROLE);
    if (isAuthenticated && role === 'BUILDER') {
      // Already a builder - set state first, then fetch real data from API
      setDashboardState('has_missions');
      fetchDashboardData();
      console.log('[Builder] Already authenticated as BUILDER, fetching data');
    } else {
      // Not logged in or USER role - show connect prompt
      setDashboardState('not_connected');
    }
  }, [isAuthenticated, hasRole, fetchDashboardData]);

  // Derived data based on dashboard state
  const connectedAccount = useMemo(() => {
    if (dashboardState === 'not_connected') return null;
    return realXProfile;
  }, [dashboardState, realXProfile]);

  const missions = useMemo(() => {
    if (dashboardState !== 'has_missions') return [];
    return realMissions;
  }, [dashboardState, realMissions]);

  const stats = useMemo(() => {
    if (dashboardState !== 'has_missions') {
      return { totalMissions: 0, activeMissions: 0, uniqueSubmissions: 0, totalSubmissions: 0, totalDistributed: 0, distributedToken: '' };
    }
    return realStats || { totalMissions: 0, activeMissions: 0, uniqueSubmissions: 0, totalSubmissions: 0, totalDistributed: 0, distributedToken: '' };
  }, [dashboardState, realStats]);

  const pendingInfo = useMemo(() => {
    // Calculate total pending from missions data (totalSubmissions - approvedCount)
    const totalPending = realMissions.reduce((sum, m) => sum + (m.totalSubmissions - m.approvedCount), 0);
    return { totalPending };
  }, [realMissions]);

  // Handlers
  const dismissNote = useCallback(() => {
    setIsNoteDismissed(true);
  }, []);

  // Submit skill claim request
  const handleSubmitClaimRequest = useCallback(async (payload: ClaimRequest): Promise<boolean> => {
    try {
      await builderService.submitClaimRequest(payload);
      // Refresh claimed skills list
      try {
        const skills = await builderService.getClaimedSkills();
        setClaimedSkills(skills);
      } catch {
        // silent
      }
      return true;
    } catch (error) {
      logger.error('[Builder] Failed to submit claim request', { error });
      return false;
    }
  }, []);

  // Real X OAuth handler
  const handleConnectX = useCallback(async () => {
    try {
      // 1. Generate PKCE parameters
      const codeVerifier = generateCodeVerifier();
      const codeChallenge = await generateCodeChallenge(codeVerifier);
      const state = generateRandomString(32);

      // 2. Store for callback validation
      sessionStorage.setItem('x_oauth_state', state);
      sessionStorage.setItem('x_code_verifier', codeVerifier);

      // 3. Get X OAuth config from env
      const clientId = process.env.NEXT_PUBLIC_X_CLIENT_ID;
      if (!clientId) {
        logger.error('[Builder] X_CLIENT_ID not configured', {});
        return;
      }

      // 4. Build OAuth URL - always use builder callback for this page
      const redirectUri = `${window.location.origin}/callback/x-builder`;
      const params = new URLSearchParams({
        response_type: 'code',
        client_id: clientId,
        redirect_uri: redirectUri,
        scope: 'users.read tweet.read',
        state,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
      });

      // 5. Redirect to X OAuth
      console.log('[Builder] Initiating X OAuth flow');
      window.location.href = `https://x.com/i/oauth2/authorize?${params.toString()}`;
    } catch (error) {
      logger.error('[Builder] Failed to initiate X OAuth', { error });
    }
  }, []);

  const handleDisconnectX = useCallback(() => {
    console.log('[Design Preview] Disconnect X clicked');
    setRealXProfile(null);
    setRealMissions([]);
    setDashboardState('not_connected');
  }, []);

  const handleManageMission = useCallback((missionId: string) => {
    // Navigate to mission management page
    // missionId is the tweetId (postId) returned from dashboard API
    router.push(`/builder/social-missions/${missionId}`);
  }, [router]);

  const handleViewMission = useCallback((missionId: string) => {
    // Navigate to mission management page (same for view)
    router.push(`/builder/social-missions/${missionId}`);
  }, [router]);

  const handleReviewPending = useCallback(() => {
    console.log('[Design Preview] Review pending submissions');
  }, []);

  const handleHowItWorks = useCallback(() => {
    console.log('[Design Preview] How it works clicked');
  }, []);

  // Utility: Get time remaining (e.g., "2d 23h")
  const getTimeRemaining = useCallback((endTime: string) => {
    const end = new Date(endTime).getTime();
    const now = Date.now();
    const diff = end - now;

    if (diff <= 0) return 'Ended';

    const days = Math.floor(diff / MS_PER_DAY);
    const hours = Math.floor((diff % MS_PER_DAY) / MS_PER_HOUR);

    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  }, []);

  // Utility: Get time ago (e.g., "3d ago")
  const getTimeAgo = useCallback((endTime: string) => {
    const end = new Date(endTime).getTime();
    const now = Date.now();
    const diff = now - end;

    if (diff <= 0) return 'Active';

    const days = Math.floor(diff / MS_PER_DAY);
    const hours = Math.floor((diff % MS_PER_DAY) / MS_PER_HOUR);

    if (days > 0) return `${days}d ago`;
    return `${hours}h ago`;
  }, []);

  const value = useMemo<BuilderDashboardContextType>(() => ({
    isMobile,
    dashboardState,
    setDashboardState,
    connectedAccount,
    missions,
    stats,
    pendingInfo,
    claimedSkills,
    handleSubmitClaimRequest,
    isNoteDismissed,
    dismissNote,
    handleConnectX,
    handleDisconnectX,
    handleManageMission,
    handleViewMission,
    handleReviewPending,
    handleHowItWorks,
    getTimeRemaining,
    getTimeAgo,
  }), [
    isMobile,
    dashboardState,
    connectedAccount,
    missions,
    stats,
    pendingInfo,
    claimedSkills,
    handleSubmitClaimRequest,
    isNoteDismissed,
    dismissNote,
    handleConnectX,
    handleDisconnectX,
    handleManageMission,
    handleViewMission,
    handleReviewPending,
    handleHowItWorks,
    getTimeRemaining,
    getTimeAgo,
  ]);

  return (
    <BuilderDashboardContext.Provider value={value}>
      {children}
    </BuilderDashboardContext.Provider>
  );
}

// ============================================
// HOOK
// ============================================
export function useBuilderDashboard() {
  const context = useContext(BuilderDashboardContext);
  if (!context) {
    throw new Error('useBuilderDashboard must be used within a BuilderDashboardProvider');
  }
  return context;
}
