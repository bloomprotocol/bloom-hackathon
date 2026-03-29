// ============================================
// TIME CONSTANTS
// ============================================
export const MS_PER_SECOND = 1000;
export const MS_PER_MINUTE = MS_PER_SECOND * 60;
export const MS_PER_HOUR = MS_PER_MINUTE * 60;
export const MS_PER_DAY = MS_PER_HOUR * 24;

// ============================================
// TYPE DEFINITIONS
// ============================================

// Dashboard page states
export type DashboardState = 'not_connected' | 'no_missions' | 'has_missions';

// Mission status for display
export type MissionStatus = 'Active' | 'Ended';

// Mission status filter (includes 'all')
export type MissionStatusFilter = 'all' | MissionStatus;

// Connected X account info
export interface ConnectedXAccount {
  xUsername: string;
  xDisplayName: string;
  profileImageUrl: string;
  joinedDate: string;
}

// Mission summary for dashboard list
export interface MissionSummary {
  id: string;
  title: string;
  status: MissionStatus;
  totalSubmissions: number;
  approvedCount: number;
  distributedCount: number;
  rewardPerSubmission: number;
  rewardToken: string;
  endTime: string;
}

// Dashboard stats
export interface DashboardStats {
  totalMissions: number;
  activeMissions: number;
  uniqueSubmissions: number;    // Deduplicated by X user ID
  totalSubmissions: number;     // All submissions
  totalDistributed: number;
  distributedToken: string;
}

// Pending submissions count
export interface PendingInfo {
  totalPending: number;
}

// ============================================
// SKILL CLAIM TYPES
// ============================================

export type ClaimStatus = 'pending' | 'approved' | 'rejected';

export interface ClaimedSkill {
  slug: string;
  name: string;
  claimedAt: string;
  claimStatus: ClaimStatus;
  perks: string[];
  backerCount: number;
  escrowUsdc: number;
}

export interface ClaimRequest {
  skillSlug: string;
  githubUsername: string;
  evidence?: string;
  perks: string[];
}

// ============================================
// PAYOUT / WITHDRAWAL TYPES
// ============================================

export type PayoutStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type PayoutMethod = 'withdraw' | 'donate';

export interface PayoutRequest {
  skillSlug: string;
  method: PayoutMethod;
  walletAddress: string;
  amount: number;
  donationPlatform?: string; // e.g. 'giveth', 'thegivingblock'
}

export interface PayoutRecord {
  id: string;
  skillSlug: string;
  skillName: string;
  method: PayoutMethod;
  amount: number;
  walletAddress: string;
  txHash?: string;
  status: PayoutStatus;
  donationPlatform?: string;
  createdAt: string;
}

// ============================================
// MOCK DATA FOR DESIGN PREVIEW
// ============================================

export const MOCK_CONNECTED_ACCOUNT: ConnectedXAccount = {
  xUsername: 'Bloom__Protocol',
  xDisplayName: 'Bloom Protocol',
  profileImageUrl: 'https://pbs.twimg.com/profile_images/1851562653498494976/fvFVcd2b_400x400.jpg',
  joinedDate: 'Dec 2024',
};

export const MOCK_MISSIONS: MissionSummary[] = [
  {
    id: 'mission-1',
    title: 'Share Our Launch Announcement',
    status: 'Active',
    totalSubmissions: 100,
    approvedCount: 45,
    distributedCount: 30,
    rewardPerSubmission: 10,
    rewardToken: 'USDT',
    endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 23 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'mission-2',
    title: 'Retweet Our Partner Announcement',
    status: 'Active',
    totalSubmissions: 50,
    approvedCount: 20,
    distributedCount: 15,
    rewardPerSubmission: 5,
    rewardToken: 'USDT',
    endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'mission-3',
    title: 'Follow Us Campaign',
    status: 'Ended',
    totalSubmissions: 200,
    approvedCount: 150,
    distributedCount: 150,
    rewardPerSubmission: 2,
    rewardToken: 'USDT',
    endTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const MOCK_DASHBOARD_STATS: DashboardStats = {
  totalMissions: 3,
  activeMissions: 2,
  uniqueSubmissions: 280,
  totalSubmissions: 350,
  totalDistributed: 4500,
  distributedToken: 'USDT',
};

export const MOCK_PENDING_INFO: PendingInfo = {
  totalPending: 25,
};

