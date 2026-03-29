import { apiGet, apiPatch, apiPost } from '../apiConfig';
import apiInstance from '../apiConfig';
import type { ClaimedSkill, ClaimRequest, PayoutRequest, PayoutRecord } from '@/app/builder/constants';

// Dashboard stats
export interface BuilderDashboardStats {
  totalMissions: number;
  activeMissions: number;
  uniqueSubmissions: number;
  totalSubmissions: number;
}

// Mission summary for dashboard list
export interface BuilderMissionSummary {
  id: string;
  title: string;
  status: 'Active' | 'Ended';
  totalSubmissions: number;
  approvedCount: number;
  distributedCount: number;
  endTime: string;
}

// X profile for display
export interface BuilderXProfile {
  xUsername: string;
  xDisplayName: string;
  xProfileImageUrl: string;
}

// Dashboard API response
export interface BuilderDashboardResponse {
  success: boolean;
  statusCode: number;
  data: {
    stats: BuilderDashboardStats;
    missions: BuilderMissionSummary[];
    xProfile: BuilderXProfile;
  };
}

// Submission approval/rejection response
export interface SubmissionActionResponse {
  success: boolean;
  statusCode: number;
  data: {
    submissionId: number;
    status: string;
    autoDistributed?: boolean;
    dropsStatus?: string | null;
    message: string;
  };
}

// Drops distribution response (single)
export interface DistributeRewardResponse {
  success: boolean;
  statusCode: number;
  data: {
    submissionId: number;
    amount: number;
    dropsStatus: string;
    message: string;
  };
}

// Drops distribution response (batch)
export interface DistributeAllResponse {
  success: boolean;
  statusCode: number;
  data: {
    missionId: string;
    totalEligible: number;
    distributedCount: number;
    pendingDropsCount: number; // Anonymous users pending claim
    skippedCount: number;
    failedCount: number;
    failedRecordIds: number[];
    amount: number;
    totalDistributed: number;
    message: string;
  };
}

// Mission Settings - Update Title Response (Step 3)
export interface UpdateTitleResponse {
  success: boolean;
  statusCode: number;
  data: {
    missionId: string;
    title: string;
    message: string;
  };
}

// Mission Settings - Update Duration Response (Step 3)
export interface UpdateDurationResponse {
  success: boolean;
  statusCode: number;
  data: {
    missionId: string;
    endTime: string;
    message: string;
  };
}

// ==================== Reward Settings Types (Step 5) ====================

// Drops reward info
export interface DropsRewardInfo {
  rewardTypeId: number;
  amount: number;
  name: string;
}

// Stablecoin (USDT/USDC) reward info
export interface StablecoinRewardInfo {
  rewardTypeId: number;
  tokenSymbol: 'USDT' | 'USDC';
  amountPerSubmission: number;
  chainId: number | string;
  name: string;
}

// Custom token reward info
export interface CustomTokenRewardInfo {
  rewardTypeId: number;
  tokenSymbol: string;
  tokenAddress: string;
  amountPerSubmission: number;
  chainId: number | string;
  name: string;
}

// GET /builder/missions/:tweetId/reward-settings response
export interface RewardSettingsResponse {
  success: boolean;
  statusCode: number;
  data: {
    missionId: string;
    tweetId: string;
    drops: DropsRewardInfo | null;
    stablecoinReward: StablecoinRewardInfo | null;
    customTokenReward: CustomTokenRewardInfo | null;
    isLocked: boolean;
    lockedReason: string | null;
    // Per-reward-type lock status for granular control (追加獎勵 support)
    stablecoinLocked: boolean;
    customTokenLocked: boolean;
  };
}

// DTO for updating stablecoin reward
export interface UpdateStablecoinRewardDto {
  tokenSymbol: 'USDT' | 'USDC';
  amountPerSubmission: number;
  chainId: number | string;
}

// DTO for updating custom token reward
export interface UpdateCustomTokenRewardDto {
  tokenAddress: string;
  tokenSymbol: string;
  amountPerSubmission: number;
  chainId: number | string;
}

// PATCH /builder/missions/:tweetId/reward response
export interface UpdateStablecoinRewardResponse {
  success: boolean;
  statusCode: number;
  data: {
    missionId: string;
    rewardTypeId: number;
    tokenSymbol: 'USDT' | 'USDC';
    amountPerSubmission: number;
    chainId: number | string;
    message: string;
  };
}

// PATCH /builder/missions/:tweetId/custom-reward response
export interface UpdateCustomTokenRewardResponse {
  success: boolean;
  statusCode: number;
  data: {
    missionId: string;
    rewardTypeId: number;
    tokenAddress: string;
    tokenSymbol: string;
    amountPerSubmission: number;
    chainId: number | string;
    message: string;
  };
}

// GET/PATCH /builder/missions/:tweetId/approval-settings response
export interface ApprovalSettingsResponse {
  success: boolean;
  statusCode: number;
  data: {
    missionId: string;
    autoDistributeDropsOnApprove: boolean;
    message?: string;
  };
}

// ==================== Token Distribution Types (Step 6.1) ====================

// POST /builder/missions/:tweetId/token-distribution/initiate response
export interface InitiateTokenDistributionResponse {
  success: boolean;
  statusCode: number;
  data: {
    requestId: string;
    platformWallet: {
      address: string;
      network: string;
      chainId: number;
    };
    payment: {
      tokenSymbol: string;
      tokenAddress: string;
      totalAmount: number;
      amountPerSubmission: number;
      totalSubmissions: number;
    };
    status: string;
  };
}

// POST /builder/missions/:tweetId/token-distribution/:requestId/confirm request
export interface ConfirmTokenTransferDto {
  txHash: string;
}

// POST /builder/missions/:tweetId/token-distribution/:requestId/confirm response
export interface ConfirmTokenTransferResponse {
  success: boolean;
  statusCode: number;
  data: {
    requestId: string;
    status: string;
    message: string;
  };
}

// Token distribution request status
export interface TokenDistributionRequest {
  requestId: string;
  missionId: string;
  tweetId: string;
  builderId: number;
  tokenSymbol: 'USDT' | 'USDC';
  chainId: number;
  amountPerSubmission: number;
  totalSubmissions: number;
  totalAmount: number;
  recipientUserIds: number[];
  platformWalletAddress: string;
  builderTxHash?: string;
  status: 'pending_payment' | 'payment_submitted' | 'verified' | 'verification_failed' | 'distributing' | 'completed' | 'partial_completed' | 'failed';
  verifiedAt?: string;
  verificationError?: string;
  distributedCount: number;
  failedCount: number;
  createdAt: string;
  updatedAt: string;
}

// GET /builder/missions/:tweetId/token-distribution/:requestId/status response
export interface TokenDistributionStatusResponse {
  success: boolean;
  statusCode: number;
  data: TokenDistributionRequest | null;
}

// GET /builder/missions/:tweetId/token-distribution/all response
export interface AllDistributionRequestsResponse {
  success: boolean;
  statusCode: number;
  data: TokenDistributionRequest[];
}

// GET /builder/missions/:tweetId/token-distribution/eligible response
export interface TokenDistributionEligibleResponse {
  success: boolean;
  statusCode: number;
  data: {
    eligibleCount: number;
    chainId: number;
    networkName: string;
  };
}

// ==================== API Key Types ====================

export interface ApiKeyInfo {
  id: string;
  name: string;
  keyPrefix: string;
  tier: string;
  isActive: boolean;
  createdAt: string;
  lastUsedAt: string | null;
}

export interface GetApiKeysResponse {
  success: boolean;
  statusCode: number;
  data: {
    keys: ApiKeyInfo[];
    maxKeys: number;
    canCreateMore: boolean;
  };
}

export interface CreateApiKeyResponse {
  success: boolean;
  statusCode: number;
  data: {
    apiKey: string;
    keyPrefix: string;
    name: string;
    message: string;
  };
}

export interface RevokeApiKeyResponse {
  success: boolean;
  statusCode: number;
  data: {
    success: boolean;
  };
}

export interface ApiUsageStats {
  period: {
    startDate: string;
    endDate: string;
  };
  summary: {
    totalCalls: number;
    successCalls: number;
    failedCalls: number;
    successRate: number;
  };
  dailyTrend: Array<{ date: string; calls: number }>;
}

export interface GetApiUsageResponse {
  success: boolean;
  statusCode: number;
  data: ApiUsageStats;
}

class BuilderService {
  // ==================== API Key Methods ====================

  /**
   * Get all API Keys for the builder
   */
  async getApiKeys(): Promise<GetApiKeysResponse> {
    const response = await apiGet<GetApiKeysResponse>('/builder/api-keys');
    return response;
  }

  /**
   * Create a new API Key
   */
  async createApiKey(name: string): Promise<CreateApiKeyResponse> {
    const response = await apiPost<CreateApiKeyResponse>('/builder/api-keys', { name });
    return response;
  }

  /**
   * Revoke an API Key
   */
  async revokeApiKey(keyId: string): Promise<RevokeApiKeyResponse> {
    const response = await apiInstance.delete<RevokeApiKeyResponse>(`/builder/api-keys/${keyId}`);
    return response.data;
  }

  /**
   * Get API usage statistics
   */
  async getApiUsageStats(startDate?: string, endDate?: string): Promise<GetApiUsageResponse> {
    const params = new URLSearchParams();
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    const queryString = params.toString();
    const url = queryString ? `/builder/api-keys/usage?${queryString}` : '/builder/api-keys/usage';
    const response = await apiGet<GetApiUsageResponse>(url);
    return response;
  }

  async getDashboard(): Promise<BuilderDashboardResponse> {
    const response = await apiGet<BuilderDashboardResponse>('/builder/dashboard');
    return response;
  }

  // Builder submission review actions
  async approveSubmission(submissionId: number): Promise<SubmissionActionResponse> {
    const response = await apiPatch<SubmissionActionResponse>(
      `/builder/submissions/${submissionId}/approve`
    );
    return response;
  }

  async rejectSubmission(submissionId: number, reason?: string): Promise<SubmissionActionResponse> {
    const response = await apiPatch<SubmissionActionResponse>(
      `/builder/submissions/${submissionId}/reject`,
      { reason }
    );
    return response;
  }

  async moveToPending(submissionId: number): Promise<SubmissionActionResponse> {
    const response = await apiPatch<SubmissionActionResponse>(
      `/builder/submissions/${submissionId}/reset`
    );
    return response;
  }

  // Drops distribution methods (Step 2)

  /**
   * Distribute Drops reward to a single submission
   * Amount is read from Mission configuration on backend
   */
  async distributeReward(submissionId: number): Promise<DistributeRewardResponse> {
    const response = await apiPost<DistributeRewardResponse>(
      `/builder/submissions/${submissionId}/distribute`
    );
    return response;
  }

  /**
   * Distribute Drops to all eligible submissions for a mission
   * Amount is read from Mission configuration on backend
   */
  async distributeAll(tweetId: string): Promise<DistributeAllResponse> {
    const response = await apiPost<DistributeAllResponse>(
      `/builder/missions/${tweetId}/distribute-all`
    );
    return response;
  }

  // Mission Settings methods (Step 3)

  /**
   * Update mission title
   */
  async updateMissionTitle(tweetId: string, title: string): Promise<UpdateTitleResponse> {
    const response = await apiPatch<UpdateTitleResponse>(
      `/builder/missions/${tweetId}/title`,
      { title }
    );
    return response;
  }

  /**
   * Update mission duration (end time)
   */
  async updateMissionDuration(tweetId: string, endTime: string): Promise<UpdateDurationResponse> {
    const response = await apiPatch<UpdateDurationResponse>(
      `/builder/missions/${tweetId}/duration`,
      { endTime }
    );
    return response;
  }

  // ==================== Reward Settings Methods (Step 5) ====================

  /**
   * Get reward settings for a mission
   */
  async getRewardSettings(tweetId: string): Promise<RewardSettingsResponse> {
    const response = await apiGet<RewardSettingsResponse>(
      `/builder/missions/${tweetId}/reward-settings`
    );
    return response;
  }

  /**
   * Update stablecoin (USDT/USDC) reward settings
   */
  async updateStablecoinReward(
    tweetId: string,
    data: UpdateStablecoinRewardDto
  ): Promise<UpdateStablecoinRewardResponse> {
    const response = await apiPatch<UpdateStablecoinRewardResponse>(
      `/builder/missions/${tweetId}/reward`,
      data
    );
    return response;
  }

  /**
   * Update custom token reward settings
   */
  async updateCustomTokenReward(
    tweetId: string,
    data: UpdateCustomTokenRewardDto
  ): Promise<UpdateCustomTokenRewardResponse> {
    const response = await apiPatch<UpdateCustomTokenRewardResponse>(
      `/builder/missions/${tweetId}/custom-reward`,
      data
    );
    return response;
  }

  // ==================== Export Methods (Step 4) ====================

  /**
   * Export all submissions as CSV
   * Uses apiInstance directly to get blob response
   * Token is auto-added by apiConfig request interceptor
   */
  async exportAllSubmissions(tweetId: string): Promise<void> {
    const response = await apiInstance.get(
      `/builder/missions/${tweetId}/export/all`,
      { responseType: 'blob' }
    );

    // Trigger browser download
    const blob = new Blob([response.data], { type: 'text/csv' });
    const contentDisposition = response.headers['content-disposition'];
    const filename = contentDisposition?.split('filename="')[1]?.split('"')[0]
      || `${tweetId}_all_submissions.csv`;

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  /**
   * Export approved submissions as CSV
   */
  async exportApprovedSubmissions(tweetId: string): Promise<void> {
    const response = await apiInstance.get(
      `/builder/missions/${tweetId}/export/approved`,
      { responseType: 'blob' }
    );

    const blob = new Blob([response.data], { type: 'text/csv' });
    const contentDisposition = response.headers['content-disposition'];
    const filename = contentDisposition?.split('filename="')[1]?.split('"')[0]
      || `${tweetId}_approved_submissions.csv`;

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  /**
   * Export distribution record as CSV
   */
  async exportDistributionRecord(tweetId: string): Promise<void> {
    const response = await apiInstance.get(
      `/builder/missions/${tweetId}/export/distribution`,
      { responseType: 'blob' }
    );

    const blob = new Blob([response.data], { type: 'text/csv' });
    const contentDisposition = response.headers['content-disposition'];
    const filename = contentDisposition?.split('filename="')[1]?.split('"')[0]
      || `${tweetId}_distribution_record.csv`;

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  // ==================== Token Distribution Methods (Step 6.1) ====================

  /**
   * Initiate token distribution - get platform wallet to transfer to
   */
  async initiateTokenDistribution(tweetId: string): Promise<InitiateTokenDistributionResponse> {
    const response = await apiPost<InitiateTokenDistributionResponse>(
      `/builder/missions/${tweetId}/token-distribution/initiate`
    );
    return response;
  }

  /**
   * Confirm token transfer - submit txHash for verification
   */
  async confirmTokenTransfer(
    tweetId: string,
    requestId: string,
    data: ConfirmTokenTransferDto
  ): Promise<ConfirmTokenTransferResponse> {
    const response = await apiPost<ConfirmTokenTransferResponse>(
      `/builder/missions/${tweetId}/token-distribution/${requestId}/confirm`,
      data
    );
    return response;
  }

  /**
   * Get token distribution status
   */
  async getTokenDistributionStatus(
    tweetId: string,
    requestId: string
  ): Promise<TokenDistributionStatusResponse> {
    const response = await apiGet<TokenDistributionStatusResponse>(
      `/builder/missions/${tweetId}/token-distribution/${requestId}/status`
    );
    return response;
  }

  /**
   * Get active distribution request for a mission (if any)
   */
  async getActiveDistributionRequest(tweetId: string): Promise<TokenDistributionStatusResponse> {
    const response = await apiGet<TokenDistributionStatusResponse>(
      `/builder/missions/${tweetId}/token-distribution/active`
    );
    return response;
  }

  /**
   * Get all distribution requests for a mission
   */
  async getAllDistributionRequests(tweetId: string): Promise<AllDistributionRequestsResponse> {
    const response = await apiGet<AllDistributionRequestsResponse>(
      `/builder/missions/${tweetId}/token-distribution/all`
    );
    return response;
  }

  /**
   * Get eligible count for token distribution
   */
  async getTokenDistributionEligibleCount(tweetId: string): Promise<TokenDistributionEligibleResponse> {
    const response = await apiGet<TokenDistributionEligibleResponse>(
      `/builder/missions/${tweetId}/token-distribution/eligible`
    );
    return response;
  }

  // Approval Settings methods

  /**
   * Get approval settings for a mission
   */
  async getApprovalSettings(tweetId: string): Promise<ApprovalSettingsResponse> {
    const response = await apiGet<ApprovalSettingsResponse>(
      `/builder/missions/${tweetId}/approval-settings`
    );
    return response;
  }

  /**
   * Update approval settings for a mission
   */
  async updateApprovalSettings(
    tweetId: string,
    autoDistributeDropsOnApprove: boolean
  ): Promise<ApprovalSettingsResponse> {
    const response = await apiPatch<ApprovalSettingsResponse>(
      `/builder/missions/${tweetId}/approval-settings`,
      { autoDistributeDropsOnApprove }
    );
    return response;
  }

  // ==================== Skill Claim Methods ====================

  /**
   * Submit a claim request for a skill
   */
  async submitClaimRequest(payload: ClaimRequest): Promise<{ success: boolean }> {
    const response = await apiPost<{ success: boolean }>(
      '/builder/skills/claim-request',
      payload
    );
    return response;
  }

  /**
   * Get all claimed skills for the current builder
   */
  async getClaimedSkills(): Promise<ClaimedSkill[]> {
    const response = await apiGet<{ success: boolean; data: ClaimedSkill[] }>(
      '/builder/skills/claimed'
    );
    return response.data || [];
  }

  // ==================== Payout / Withdrawal Methods ====================

  /**
   * Request withdrawal or donation of escrowed funds
   */
  async requestPayout(payload: PayoutRequest): Promise<{ success: boolean; data: PayoutRecord }> {
    const response = await apiPost<{ success: boolean; data: PayoutRecord }>(
      '/builder/skills/payout',
      payload
    );
    return response;
  }

  /**
   * Get payout history for the current builder
   */
  async getPayoutHistory(): Promise<PayoutRecord[]> {
    const response = await apiGet<{ success: boolean; data: PayoutRecord[] }>(
      '/builder/skills/payouts'
    );
    return response.data || [];
  }
}

export const builderService = new BuilderService();
