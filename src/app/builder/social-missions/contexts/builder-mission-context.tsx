'use client';

import { createContext, useContext, useState, useMemo, useCallback, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { usePlatform } from '@/lib/utils/platform';
import { useAuth } from '@/lib/context/AuthContext';
import { getCookie, COOKIE_KEYS } from '@/lib/utils/storage';
import { socialMissionService, Submission, SocialMissionDetail } from '@/lib/api/services/socialMissionService';
import {
  builderService,
  RewardSettingsResponse,
  UpdateStablecoinRewardDto,
  UpdateCustomTokenRewardDto,
  TokenDistributionRequest,
  InitiateTokenDistributionResponse,
} from '@/lib/api/services/builderService';
import {
  BuilderSubmission,
  StatusFilter,
  MissionStats,
  Mission,
  mapBackendToBuilderStatus,
  isSubmissionLocked,
  BackendSubmissionStatus,
} from '../constants';
import { logger } from '@/lib/utils/logger';
import { toast } from 'sonner';

// ============================================
// CONTEXT TYPE
// ============================================
interface BuilderMissionContextType {
  // Platform
  isMobile: boolean;

  // Loading states
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;

  // Mission data
  mission: Mission | null;
  stats: MissionStats;
  postId: string;

  // Submissions
  submissions: BuilderSubmission[];
  statusFilter: StatusFilter;
  setStatusFilter: (filter: StatusFilter) => void;
  hasMore: boolean;
  loadMore: () => void;

  // Reward settings (Step 5)
  rewardSettings: RewardSettingsResponse['data'] | null;
  selectedStablecoin: 'USDT' | 'USDC';
  setSelectedStablecoin: (token: 'USDT' | 'USDC') => void;
  stablecoinAmount: string;
  setStablecoinAmount: (amount: string) => void;
  selectedChain: number | string;
  setSelectedChain: (chain: number | string) => void;
  customTokenSymbol: string;
  setCustomTokenSymbol: (symbol: string) => void;
  customTokenAddress: string;
  setCustomTokenAddress: (address: string) => void;
  customTokenAmount: string;
  setCustomTokenAmount: (amount: string) => void;
  customTokenChain: number | string;
  setCustomTokenChain: (chain: number | string) => void;
  isRewardLocked: boolean;
  // Per-reward-type lock status for granular control (追加獎勵 support)
  stablecoinLocked: boolean;
  customTokenLocked: boolean;
  // Computed flag: whether mission has token reward configured
  missionHasTokenReward: boolean;

  // Legacy compatibility
  rewardAmount: string;
  setRewardAmount: (amount: string) => void;
  savedRewardAmount: string | null;
  effectiveRewardAmount: number;

  // Actions
  handleApprove: (id: number) => Promise<void>;
  handleReject: (id: number, reason?: string) => Promise<void>;
  handleMoveToPending: (id: number) => Promise<void>;
  handleBatchApprove: (ids: number[]) => Promise<{ success: number; failed: number; failedIds: number[] }>;
  handleBatchReject: (ids: number[], reason?: string) => Promise<{ success: number; failed: number; failedIds: number[] }>;
  batchProgress: { current: number; total: number; action: 'approve' | 'reject' | null };
  handleDistribute: (id: number) => void;
  handleSaveReward: () => void;
  handleDistributeAll: () => void;
  handleSaveStablecoinReward: () => Promise<void>;
  handleSaveCustomTokenReward: () => Promise<void>;
  fetchRewardSettings: () => Promise<void>;
  handleExportAll: () => void;
  handleExportApproved: () => void;
  handleExportDistributionRecord: () => void;

  // Mission Settings Actions (Step 3)
  handleUpdateTitle: (newTitle: string) => Promise<void>;
  handleUpdateDuration: (newEndTime: string) => Promise<void>;

  // Token Distribution (Step 6.1)
  tokenDistributionRequest: TokenDistributionRequest | null;
  allDistributionRequests: TokenDistributionRequest[];
  tokenDistributionLoading: boolean;
  tokenDistributionEligibleCount: number;
  handleInitiateTokenDistribution: () => Promise<InitiateTokenDistributionResponse['data'] | null>;
  handleConfirmTokenTransfer: (txHash: string) => Promise<{ success: boolean; message: string }>;
  fetchActiveDistributionRequest: () => Promise<void>;
  fetchAllDistributionRequests: () => Promise<void>;
  fetchTokenDistributionEligibleCount: () => Promise<void>;

  // Approval Settings
  autoDistributeDropsOnApprove: boolean;
  setAutoDistributeDropsOnApprove: (value: boolean) => void;
  isLoadingApprovalSettings: boolean;

  // Utilities
  getRelativeTime: (date: string) => string;
  refetch: () => Promise<void>;
}

const BuilderMissionContext = createContext<BuilderMissionContextType | null>(null);

// ============================================
// PROVIDER
// ============================================
interface BuilderMissionProviderProps {
  children: ReactNode;
  postId: string;
}

export function BuilderMissionProvider({ children, postId }: BuilderMissionProviderProps) {
  // Router for navigation
  const router = useRouter();

  // Auth context
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  // Platform detection
  const { isMobile } = usePlatform();

  // Auth guard: redirect to home if not authenticated as BUILDER
  useEffect(() => {
    // Wait for auth to finish loading
    if (isAuthLoading) return;

    const role = getCookie(COOKIE_KEYS.ROLE);
    if (!isAuthenticated || role !== 'BUILDER') {
      router.push('/');
    }
  }, [isAuthenticated, isAuthLoading, router]);

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [missionData, setMissionData] = useState<SocialMissionDetail | null>(null);
  const [submissions, setSubmissions] = useState<BuilderSubmission[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  // Reward settings (Step 5)
  const [rewardSettings, setRewardSettings] = useState<RewardSettingsResponse['data'] | null>(null);
  const [selectedStablecoin, setSelectedStablecoin] = useState<'USDT' | 'USDC'>('USDC'); // Default to USDC (Base default)
  const [stablecoinAmount, setStablecoinAmount] = useState('');
  const [selectedChain, setSelectedChain] = useState<number | string>(8453); // Default to Base
  const [customTokenSymbol, setCustomTokenSymbol] = useState('');
  const [customTokenAddress, setCustomTokenAddress] = useState('');
  const [customTokenAmount, setCustomTokenAmount] = useState('');
  const [customTokenChain, setCustomTokenChain] = useState<number | string>(8453);
  const [isRewardLocked, setIsRewardLocked] = useState(false);

  // Legacy compatibility
  const [rewardAmount, setRewardAmount] = useState('');
  const [savedRewardAmount, setSavedRewardAmount] = useState<string | null>(null);

  // Token Distribution (Step 6.1)
  const [tokenDistributionRequest, setTokenDistributionRequest] = useState<TokenDistributionRequest | null>(null);
  const [allDistributionRequests, setAllDistributionRequests] = useState<TokenDistributionRequest[]>([]);
  const [tokenDistributionLoading, setTokenDistributionLoading] = useState(false);
  const [tokenDistributionEligibleCount, setTokenDistributionEligibleCount] = useState(0);

  // Approval Settings
  const [autoDistributeDropsOnApprove, setAutoDistributeDropsOnApprove] = useState(false);
  const [isLoadingApprovalSettings, setIsLoadingApprovalSettings] = useState(false);

  // Batch operation progress
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number; action: 'approve' | 'reject' | null }>({
    current: 0,
    total: 0,
    action: null,
  });

  // Map backend submission to builder submission
  const mapSubmission = useCallback((sub: Submission): BuilderSubmission => {
    return {
      id: sub.id,
      username: sub.username,
      text: sub.text,
      xPostUrl: sub.xPostUrl,
      submittedAt: sub.submittedAt,
      status: mapBackendToBuilderStatus(sub.status as BackendSubmissionStatus, sub.dropsStatus),
      backendStatus: sub.status as BackendSubmissionStatus,
      dropsStatus: sub.dropsStatus,
      tokenStatus: sub.tokenStatus,
      llmV2ReviewStatus: sub.llmV2ReviewStatus,
      isAnonymous: sub.isAnonymous,
    };
  }, []);

  // Fetch mission and submissions
  const fetchData = useCallback(async (pageNum: number = 1, append: boolean = false) => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch mission details and submissions in parallel
      const [missionResponse, submissionsResponse] = await Promise.all([
        pageNum === 1 ? socialMissionService.getMissionByTweetId(postId) : Promise.resolve(null),
        socialMissionService.getSubmissions(postId, pageNum, 'all'),
      ]);

      if (missionResponse) {
        setMissionData(missionResponse);
      }

      const mappedSubmissions = submissionsResponse.submissions.map(mapSubmission);

      if (append) {
        setSubmissions(prev => [...prev, ...mappedSubmissions]);
      } else {
        setSubmissions(mappedSubmissions);
      }

      setHasMore(submissionsResponse.pagination.hasMore);
      setPage(pageNum);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load mission data';
      setError(errorMessage);
      logger.error('Failed to fetch mission data', { error: err });
    } finally {
      setIsLoading(false);
    }
  }, [postId, mapSubmission]);

  // Initial fetch
  useEffect(() => {
    fetchData(1);
  }, [fetchData]);

  // Refetch function
  const refetch = useCallback(async () => {
    await fetchData(1);
  }, [fetchData]);

  // Load more
  const loadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      fetchData(page + 1, true);
    }
  }, [hasMore, isLoading, page, fetchData]);

  // Mission object
  const mission = useMemo<Mission | null>(() => {
    if (!missionData) return null;
    return {
      id: missionData.mission.id,
      title: missionData.mission.title,
      description: missionData.mission.description,
      postedBy: missionData.mission.postedBy,
      postedByUsername: missionData.mission.postedByUsername,
      postedAt: missionData.mission.postedAt,
      originalPostUrl: missionData.mission.originalPostUrl,
      startTime: missionData.mission.startTime,
      endTime: missionData.mission.endTime,
    };
  }, [missionData]);

  // Calculate stats
  // Note: approvedCount includes anonymous users - they receive drops via pending_drops table
  const stats = useMemo<MissionStats>(() => ({
    totalSubmissions: submissions.length,
    approvedCount: submissions.filter(s => s.status === 'APPROVED').length,
    distributedCount: submissions.filter(s => s.status === 'DISTRIBUTED').length,
    pendingCount: submissions.filter(s => s.status === 'PENDING').length,
    rejectedCount: submissions.filter(s => s.status === 'REJECTED').length,
  }), [submissions]);

  // Get effective reward amount
  const effectiveRewardAmount = useMemo(() => {
    return savedRewardAmount !== null
      ? parseFloat(savedRewardAmount)
      : (rewardAmount ? parseFloat(rewardAmount) : 0);
  }, [savedRewardAmount, rewardAmount]);

  // Format relative time
  const getRelativeTime = useCallback((dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  }, []);

  // ==================== ACTION HANDLERS ====================

  // Approve submission
  const handleApprove = useCallback(async (id: number) => {
    const submission = submissions.find(s => s.id === id);
    if (!submission) return;

    // Check if locked
    if (isSubmissionLocked(submission.dropsStatus)) {
      logger.error('Cannot modify distributed submission', {});
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await builderService.approveSubmission(id);

      // Update based on response - handle auto distribution
      const newStatus = response.data.autoDistributed ? 'DISTRIBUTED' : 'APPROVED';
      const newDropsStatus = response.data.dropsStatus || submission.dropsStatus;

      setSubmissions(prev =>
        prev.map(s =>
          s.id === id
            ? {
                ...s,
                status: newStatus as 'APPROVED' | 'DISTRIBUTED',
                backendStatus: 'COMPLETED' as const,
                dropsStatus: newDropsStatus,
              }
            : s
        )
      );
      toast.success(response.data.autoDistributed ? 'Approved & drops distributed' : 'Submission approved');
    } catch (err) {
      logger.error('Failed to approve submission', { error: err });
      toast.error('Failed to approve submission');
      // Refetch to get correct state
      await refetch();
    } finally {
      setIsSubmitting(false);
    }
  }, [submissions, refetch]);

  // Reject submission
  const handleReject = useCallback(async (id: number, reason?: string) => {
    const submission = submissions.find(s => s.id === id);
    if (!submission) return;

    // Check if locked
    if (isSubmissionLocked(submission.dropsStatus)) {
      logger.error('Cannot modify distributed submission', {});
      return;
    }

    try {
      setIsSubmitting(true);
      await builderService.rejectSubmission(id, reason);

      // Optimistic update
      setSubmissions(prev =>
        prev.map(s =>
          s.id === id
            ? { ...s, status: 'REJECTED' as const, backendStatus: 'FAILED' as const }
            : s
        )
      );
      toast.success('Submission rejected');
    } catch (err) {
      logger.error('Failed to reject submission', { error: err });
      toast.error('Failed to reject submission');
      // Refetch to get correct state
      await refetch();
    } finally {
      setIsSubmitting(false);
    }
  }, [submissions, refetch]);

  // Move to pending (reset)
  const handleMoveToPending = useCallback(async (id: number) => {
    const submission = submissions.find(s => s.id === id);
    if (!submission) return;

    // Check if locked
    if (isSubmissionLocked(submission.dropsStatus)) {
      logger.error('Cannot modify distributed submission', {});
      return;
    }

    try {
      setIsSubmitting(true);
      await builderService.moveToPending(id);

      // Optimistic update
      setSubmissions(prev =>
        prev.map(s =>
          s.id === id
            ? { ...s, status: 'PENDING' as const, backendStatus: 'IN_PROGRESS' as const }
            : s
        )
      );
      toast.success('Moved to pending');
    } catch (err) {
      logger.error('Failed to move submission to pending', { error: err });
      toast.error('Failed to move to pending');
      // Refetch to get correct state
      await refetch();
    } finally {
      setIsSubmitting(false);
    }
  }, [submissions, refetch]);

  // Batch approve submissions
  const handleBatchApprove = useCallback(async (ids: number[]): Promise<{ success: number; failed: number; failedIds: number[] }> => {
    if (ids.length === 0) return { success: 0, failed: 0, failedIds: [] };

    let successCount = 0;
    let failedCount = 0;
    const failedIds: number[] = [];

    try {
      setIsSubmitting(true);
      setBatchProgress({ current: 0, total: ids.length, action: 'approve' });

      for (let i = 0; i < ids.length; i++) {
        const id = ids[i];
        const submission = submissions.find(s => s.id === id);

        if (!submission || isSubmissionLocked(submission.dropsStatus)) {
          failedCount++;
          failedIds.push(id);
          setBatchProgress({ current: i + 1, total: ids.length, action: 'approve' });
          continue;
        }

        try {
          const response = await builderService.approveSubmission(id);

          // Update based on response - handle auto distribution
          const newStatus = response.data.autoDistributed ? 'DISTRIBUTED' : 'APPROVED';
          const newDropsStatus = response.data.dropsStatus || submission.dropsStatus;

          setSubmissions(prev =>
            prev.map(s =>
              s.id === id
                ? {
                    ...s,
                    status: newStatus as 'APPROVED' | 'DISTRIBUTED',
                    backendStatus: 'COMPLETED' as const,
                    dropsStatus: newDropsStatus,
                  }
                : s
            )
          );
          successCount++;
        } catch (err) {
          logger.error('Failed to approve submission in batch', { error: err, submissionId: id });
          failedCount++;
          failedIds.push(id);
        }

        setBatchProgress({ current: i + 1, total: ids.length, action: 'approve' });
      }
    } finally {
      setIsSubmitting(false);
      // Clear progress after a short delay
      setTimeout(() => {
        setBatchProgress({ current: 0, total: 0, action: null });
      }, 2000);
    }

    return { success: successCount, failed: failedCount, failedIds };
  }, [submissions]);

  // Batch reject submissions
  const handleBatchReject = useCallback(async (ids: number[], reason?: string): Promise<{ success: number; failed: number; failedIds: number[] }> => {
    if (ids.length === 0) return { success: 0, failed: 0, failedIds: [] };

    let successCount = 0;
    let failedCount = 0;
    const failedIds: number[] = [];

    try {
      setIsSubmitting(true);
      setBatchProgress({ current: 0, total: ids.length, action: 'reject' });

      for (let i = 0; i < ids.length; i++) {
        const id = ids[i];
        const submission = submissions.find(s => s.id === id);

        if (!submission || isSubmissionLocked(submission.dropsStatus)) {
          failedCount++;
          failedIds.push(id);
          setBatchProgress({ current: i + 1, total: ids.length, action: 'reject' });
          continue;
        }

        try {
          await builderService.rejectSubmission(id, reason);

          setSubmissions(prev =>
            prev.map(s =>
              s.id === id
                ? { ...s, status: 'REJECTED' as const, backendStatus: 'FAILED' as const }
                : s
            )
          );
          successCount++;
        } catch (err) {
          logger.error('Failed to reject submission in batch', { error: err, submissionId: id });
          failedCount++;
          failedIds.push(id);
        }

        setBatchProgress({ current: i + 1, total: ids.length, action: 'reject' });
      }
    } finally {
      setIsSubmitting(false);
      // Clear progress after a short delay
      setTimeout(() => {
        setBatchProgress({ current: 0, total: 0, action: null });
      }, 2000);
    }

    return { success: successCount, failed: failedCount, failedIds };
  }, [submissions]);

  // Step 2: Drops Distribution
  const handleDistribute = useCallback(async (id: number) => {
    const submission = submissions.find(s => s.id === id);
    if (!submission) return;

    // Check if already distributed
    if (submission.dropsStatus === 'completed' || submission.dropsStatus === 'sent') {
      logger.error('Submission already distributed', {});
      return;
    }

    // Check if approved
    if (submission.backendStatus !== 'COMPLETED') {
      logger.error('Submission must be approved before distributing', {});
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await builderService.distributeReward(id);

      if (response.success) {
        // Optimistic update
        setSubmissions(prev =>
          prev.map(s =>
            s.id === id
              ? { ...s, status: 'DISTRIBUTED' as const, dropsStatus: 'completed' }
              : s
          )
        );
        toast.success('Drops distributed');
      }
    } catch (err) {
      logger.error('Failed to distribute drops', { error: err });
      toast.error('Failed to distribute drops');
      // Refetch to get correct state
      await refetch();
    } finally {
      setIsSubmitting(false);
    }
  }, [submissions, refetch]);

  const handleSaveReward = useCallback(() => {
    console.log('[Step 2] Save reward amount:', rewardAmount);
    setSavedRewardAmount(rewardAmount);
    setIsRewardLocked(true);
  }, [rewardAmount]);

  const handleDistributeAll = useCallback(async () => {
    try {
      setIsSubmitting(true);
      const response = await builderService.distributeAll(postId);

      if (response.success) {
        // Refetch to get updated state for all submissions
        await refetch();
        toast.success('All drops distributed');
      }
    } catch (err) {
      logger.error('Failed to distribute all drops', { error: err });
      toast.error('Failed to distribute drops');
      // Refetch to get correct state
      await refetch();
    } finally {
      setIsSubmitting(false);
    }
  }, [postId, refetch]);

  // ==================== Export Handlers (Step 4) ====================

  const handleExportAll = useCallback(async () => {
    try {
      setIsSubmitting(true);
      await builderService.exportAllSubmissions(postId);
      toast.success('Export downloaded');
    } catch (err) {
      logger.error('Failed to export submissions', { error: err });
      toast.error('Failed to export');
    } finally {
      setIsSubmitting(false);
    }
  }, [postId]);

  const handleExportApproved = useCallback(async () => {
    try {
      setIsSubmitting(true);
      await builderService.exportApprovedSubmissions(postId);
      toast.success('Export downloaded');
    } catch (err) {
      logger.error('Failed to export approved submissions', { error: err });
      toast.error('Failed to export');
    } finally {
      setIsSubmitting(false);
    }
  }, [postId]);

  // Export Distribution Record
  const handleExportDistributionRecord = useCallback(async () => {
    try {
      setIsSubmitting(true);
      await builderService.exportDistributionRecord(postId);
      toast.success('Distribution record exported');
    } catch (err) {
      logger.error('Failed to export distribution record', { error: err });
      toast.error('Failed to export distribution record');
    } finally {
      setIsSubmitting(false);
    }
  }, [postId]);

  // ==================== Mission Settings Handlers (Step 3) ====================

  // Update mission title
  const handleUpdateTitle = useCallback(async (newTitle: string) => {
    try {
      setIsSubmitting(true);
      await builderService.updateMissionTitle(postId, newTitle);
      // Optimistic update - update local state
      setMissionData(prev => prev ? {
        ...prev,
        mission: { ...prev.mission, title: newTitle }
      } : null);
      toast.success('Title updated');
    } catch (err) {
      logger.error('Failed to update title', { error: err });
      toast.error('Failed to update title');
      await refetch(); // Refetch on error to restore correct state
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, [postId, refetch]);

  // Update mission duration (end time)
  const handleUpdateDuration = useCallback(async (newEndTime: string) => {
    try {
      setIsSubmitting(true);
      await builderService.updateMissionDuration(postId, newEndTime);
      // Optimistic update - update local state
      setMissionData(prev => prev ? {
        ...prev,
        mission: { ...prev.mission, endTime: newEndTime }
      } : null);
      toast.success('Duration updated');
    } catch (err) {
      logger.error('Failed to update duration', { error: err });
      toast.error('Failed to update duration');
      await refetch(); // Refetch on error to restore correct state
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, [postId, refetch]);

  // ==================== Reward Settings Handlers (Step 5) ====================

  // Fetch reward settings from API
  const fetchRewardSettings = useCallback(async () => {
    try {
      const response = await builderService.getRewardSettings(postId);
      if (!response.data) {
        console.warn('No reward settings data returned');
        return;
      }
      setRewardSettings(response.data);
      setIsRewardLocked(response.data.isLocked ?? false);

      // Initialize UI from saved data
      if (response.data.stablecoinReward) {
        setSelectedStablecoin(response.data.stablecoinReward.tokenSymbol);
        setStablecoinAmount(response.data.stablecoinReward.amountPerSubmission.toString());
        setSelectedChain(response.data.stablecoinReward.chainId);
      }
      if (response.data.customTokenReward) {
        setCustomTokenSymbol(response.data.customTokenReward.tokenSymbol);
        setCustomTokenAddress(response.data.customTokenReward.tokenAddress);
        setCustomTokenAmount(response.data.customTokenReward.amountPerSubmission.toString());
        setCustomTokenChain(response.data.customTokenReward.chainId);
      }
    } catch (err) {
      logger.error('Failed to fetch reward settings', { error: err });
    }
  }, [postId]);

  // Fetch reward settings on mount
  useEffect(() => {
    fetchRewardSettings();
  }, [fetchRewardSettings]);

  // Save stablecoin (USDT/USDC) reward
  // Use stablecoinLocked instead of isRewardLocked to support 追加獎勵 scenario
  const handleSaveStablecoinReward = useCallback(async () => {
    const stablecoinLocked = rewardSettings?.stablecoinLocked ?? false;
    if (!stablecoinAmount || stablecoinLocked) return;

    try {
      setIsSubmitting(true);
      await builderService.updateStablecoinReward(postId, {
        tokenSymbol: selectedStablecoin,
        amountPerSubmission: parseFloat(stablecoinAmount),
        chainId: selectedChain,
      });
      // Refresh reward settings and submissions
      // Refetch submissions to update badge display (追加獎勵 scenario)
      await Promise.all([fetchRewardSettings(), refetch()]);
      toast.success('Stablecoin reward saved');
    } catch (err) {
      logger.error('Failed to save stablecoin reward', { error: err });
      toast.error('Failed to save reward settings');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, [postId, selectedStablecoin, stablecoinAmount, selectedChain, rewardSettings?.stablecoinLocked, fetchRewardSettings, refetch]);

  // Save custom token reward
  // Use customTokenLocked instead of isRewardLocked to support 追加獎勵 scenario
  const handleSaveCustomTokenReward = useCallback(async () => {
    const customTokenLocked = rewardSettings?.customTokenLocked ?? false;
    if (!customTokenSymbol || !customTokenAddress || !customTokenAmount || customTokenLocked) return;

    try {
      setIsSubmitting(true);
      await builderService.updateCustomTokenReward(postId, {
        tokenSymbol: customTokenSymbol,
        tokenAddress: customTokenAddress,
        amountPerSubmission: parseFloat(customTokenAmount),
        chainId: customTokenChain,
      });
      // Refresh reward settings and submissions
      // Refetch submissions to update badge display (追加獎勵 scenario)
      await Promise.all([fetchRewardSettings(), refetch()]);
      toast.success('Custom token reward saved');
    } catch (err) {
      logger.error('Failed to save custom token reward', { error: err });
      toast.error('Failed to save reward settings');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, [postId, customTokenSymbol, customTokenAddress, customTokenAmount, customTokenChain, rewardSettings?.customTokenLocked, fetchRewardSettings, refetch]);

  // ==================== Token Distribution Methods (Step 6.1) ====================

  // Fetch active distribution request
  const fetchActiveDistributionRequest = useCallback(async () => {
    try {
      const response = await builderService.getActiveDistributionRequest(postId);
      setTokenDistributionRequest(response.data);
    } catch (err) {
      logger.error('Failed to fetch active distribution request', { error: err });
      setTokenDistributionRequest(null);
    }
  }, [postId]);

  // Fetch all distribution requests
  const fetchAllDistributionRequests = useCallback(async () => {
    try {
      const response = await builderService.getAllDistributionRequests(postId);
      setAllDistributionRequests(response.data || []);
    } catch (err) {
      logger.error('Failed to fetch all distribution requests', { error: err });
      setAllDistributionRequests([]);
    }
  }, [postId]);

  // Fetch token distribution eligible count
  const fetchTokenDistributionEligibleCount = useCallback(async () => {
    try {
      const response = await builderService.getTokenDistributionEligibleCount(postId);
      setTokenDistributionEligibleCount(response.data?.eligibleCount || 0);
    } catch (err) {
      logger.error('Failed to fetch token distribution eligible count', { error: err });
      setTokenDistributionEligibleCount(0);
    }
  }, [postId]);

  // Initiate token distribution
  const handleInitiateTokenDistribution = useCallback(async (): Promise<InitiateTokenDistributionResponse['data'] | null> => {
    try {
      setTokenDistributionLoading(true);
      const response = await builderService.initiateTokenDistribution(postId);
      if (response.success) {
        // Fetch the active request to get full data
        await fetchActiveDistributionRequest();
        toast.success('Token distribution initiated');
        return response.data;
      }
      return null;
    } catch (err) {
      logger.error('Failed to initiate token distribution', { error: err });
      toast.error('Failed to initiate distribution');
      throw err;
    } finally {
      setTokenDistributionLoading(false);
    }
  }, [postId, fetchActiveDistributionRequest]);

  // Confirm token transfer
  const handleConfirmTokenTransfer = useCallback(async (
    txHash: string
  ): Promise<{ success: boolean; message: string }> => {
    if (!tokenDistributionRequest) {
      return { success: false, message: 'No active distribution request' };
    }

    try {
      setTokenDistributionLoading(true);
      const response = await builderService.confirmTokenTransfer(
        postId,
        tokenDistributionRequest.requestId,
        { txHash }
      );

      if (response.success) {
        // Refresh to get updated status
        await fetchActiveDistributionRequest();
        const verified = response.data.status === 'verified';
        if (verified) {
          toast.success('Transaction verified — distributing to users');
        } else {
          toast.error(response.data.message || 'Verification failed');
        }
        return {
          success: verified,
          message: response.data.message,
        };
      }
      return { success: false, message: 'Failed to confirm transfer' };
    } catch (err) {
      logger.error('Failed to confirm token transfer', { error: err });
      toast.error('Failed to verify transaction');
      const errorMessage = err instanceof Error ? err.message : 'Failed to confirm transfer';
      return { success: false, message: errorMessage };
    } finally {
      setTokenDistributionLoading(false);
    }
  }, [postId, tokenDistributionRequest, fetchActiveDistributionRequest]);

  // Fetch distribution requests on mount
  useEffect(() => {
    if (postId) {
      fetchActiveDistributionRequest();
      fetchAllDistributionRequests();
      fetchTokenDistributionEligibleCount();
    }
  }, [postId, fetchActiveDistributionRequest, fetchAllDistributionRequests, fetchTokenDistributionEligibleCount]);

  // Poll distribution status when there's an active processing request
  useEffect(() => {
    const isProcessing = tokenDistributionRequest &&
      ['verified', 'distributing'].includes(tokenDistributionRequest.status);

    if (!isProcessing || !postId) return;

    const interval = setInterval(async () => {
      await fetchActiveDistributionRequest();
      await fetchAllDistributionRequests();
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, [postId, tokenDistributionRequest?.status, fetchActiveDistributionRequest, fetchAllDistributionRequests]);

  // Fetch approval settings on mount
  useEffect(() => {
    const fetchApprovalSettings = async () => {
      if (!postId) return;
      setIsLoadingApprovalSettings(true);
      try {
        const response = await builderService.getApprovalSettings(postId);
        if (response.data) {
          setAutoDistributeDropsOnApprove(response.data.autoDistributeDropsOnApprove);
        }
      } catch (err) {
        logger.error('Failed to fetch approval settings', { error: err });
      } finally {
        setIsLoadingApprovalSettings(false);
      }
    };
    fetchApprovalSettings();
  }, [postId]);

  const value = useMemo<BuilderMissionContextType>(() => ({
    // Platform
    isMobile,

    // Loading states
    isLoading,
    isSubmitting,
    error,

    // Mission data
    mission,
    stats,
    postId,

    // Submissions
    submissions,
    statusFilter,
    setStatusFilter,
    hasMore,
    loadMore,

    // Reward settings (Step 5)
    rewardSettings,
    selectedStablecoin,
    setSelectedStablecoin,
    stablecoinAmount,
    setStablecoinAmount,
    selectedChain,
    setSelectedChain,
    customTokenSymbol,
    setCustomTokenSymbol,
    customTokenAddress,
    setCustomTokenAddress,
    customTokenAmount,
    setCustomTokenAmount,
    customTokenChain,
    setCustomTokenChain,
    isRewardLocked,
    // Per-reward-type lock status for granular control (追加獎勵 support)
    stablecoinLocked: rewardSettings?.stablecoinLocked ?? false,
    customTokenLocked: rewardSettings?.customTokenLocked ?? false,
    // Computed flag: whether mission has token reward configured
    missionHasTokenReward: !!(rewardSettings?.stablecoinReward || rewardSettings?.customTokenReward),

    // Legacy compatibility
    rewardAmount,
    setRewardAmount,
    savedRewardAmount,
    effectiveRewardAmount,

    // Actions
    handleApprove,
    handleReject,
    handleMoveToPending,
    handleBatchApprove,
    handleBatchReject,
    batchProgress,
    handleDistribute,
    handleSaveReward,
    handleDistributeAll,
    handleSaveStablecoinReward,
    handleSaveCustomTokenReward,
    fetchRewardSettings,
    handleExportAll,
    handleExportApproved,
    handleExportDistributionRecord,

    // Mission Settings Actions (Step 3)
    handleUpdateTitle,
    handleUpdateDuration,

    // Token Distribution (Step 6.1)
    tokenDistributionRequest,
    allDistributionRequests,
    tokenDistributionLoading,
    tokenDistributionEligibleCount,
    handleInitiateTokenDistribution,
    handleConfirmTokenTransfer,
    fetchActiveDistributionRequest,
    fetchAllDistributionRequests,
    fetchTokenDistributionEligibleCount,

    // Approval Settings
    autoDistributeDropsOnApprove,
    setAutoDistributeDropsOnApprove,
    isLoadingApprovalSettings,

    // Utilities
    getRelativeTime,
    refetch,
  }), [
    isMobile,
    isLoading,
    isSubmitting,
    error,
    mission,
    stats,
    postId,
    submissions,
    statusFilter,
    hasMore,
    loadMore,
    // Reward settings (Step 5)
    rewardSettings,
    selectedStablecoin,
    stablecoinAmount,
    selectedChain,
    customTokenSymbol,
    customTokenAddress,
    customTokenAmount,
    customTokenChain,
    isRewardLocked,
    // Legacy
    rewardAmount,
    savedRewardAmount,
    effectiveRewardAmount,
    // Actions
    handleApprove,
    handleReject,
    handleMoveToPending,
    handleBatchApprove,
    handleBatchReject,
    batchProgress,
    handleDistribute,
    handleSaveReward,
    handleDistributeAll,
    handleSaveStablecoinReward,
    handleSaveCustomTokenReward,
    fetchRewardSettings,
    handleExportAll,
    handleExportApproved,
    handleExportDistributionRecord,
    handleUpdateTitle,
    handleUpdateDuration,
    // Token Distribution (Step 6.1)
    tokenDistributionRequest,
    allDistributionRequests,
    tokenDistributionLoading,
    tokenDistributionEligibleCount,
    handleInitiateTokenDistribution,
    handleConfirmTokenTransfer,
    fetchActiveDistributionRequest,
    fetchAllDistributionRequests,
    fetchTokenDistributionEligibleCount,
    // Approval Settings
    autoDistributeDropsOnApprove,
    isLoadingApprovalSettings,
    getRelativeTime,
    refetch,
  ]);

  return (
    <BuilderMissionContext.Provider value={value}>
      {children}
    </BuilderMissionContext.Provider>
  );
}

// ============================================
// HOOK
// ============================================
export function useBuilderMission() {
  const context = useContext(BuilderMissionContext);
  if (!context) {
    throw new Error('useBuilderMission must be used within a BuilderMissionProvider');
  }
  return context;
}
