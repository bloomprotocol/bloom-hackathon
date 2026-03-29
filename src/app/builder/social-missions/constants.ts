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

// Backend submission statuses from user_task_record.status
export type BackendSubmissionStatus = 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';

// Builder UI display statuses (mapped from backend)
// IN_PROGRESS -> PENDING (waiting for review)
// COMPLETED -> APPROVED (approved, ready for distribution)
// COMPLETED + dropsStatus=completed/sent/pending_claim -> DISTRIBUTED
// FAILED -> REJECTED
export type BuilderSubmissionStatus = 'PENDING' | 'APPROVED' | 'DISTRIBUTED' | 'REJECTED';

// Filter type for submissions
// APPROVED filter includes both approved and distributed submissions
export type StatusFilter = 'all' | 'PENDING' | 'REJECTED' | 'APPROVED';

// Mission data structure (matches SocialMissionDetail.mission from socialMissionService)
export interface Mission {
  id: string;
  title: string;
  description: string;
  postedBy: string;
  postedByUsername: string;
  postedAt: string;
  originalPostUrl: string;
  startTime?: string;
  endTime: string;
}

// Stats for builder view
export interface MissionStats {
  totalSubmissions: number;
  approvedCount: number;
  distributedCount: number;
  pendingCount: number;
  rejectedCount: number;
}

// LLM V2 Review Result
export interface LlmReviewResult {
  quality_score: number;      // 0-100, overall content quality
  ai_likelihood: number;      // 0-100, AI-generated likelihood (reference only)
  message: string;            // LLM analysis message
}

// LLM V2 Review Status
export interface LlmV2ReviewStatus {
  status: boolean;            // true if review completed
  result?: LlmReviewResult;   // present when status is true
  reviewed_at?: string;       // ISO date string
}

// Builder submission (extends backend Submission with builder-specific fields)
export interface BuilderSubmission {
  id: number;
  username: string;
  text: string;
  xPostUrl: string;
  submittedAt: string;
  status: BuilderSubmissionStatus;
  backendStatus: BackendSubmissionStatus; // Original backend status for API calls
  dropsStatus: string | null;
  tokenStatus: string | null;
  distributedAmount?: number;
  isAnonymous: boolean; // true if uid = -1 (non-registered user)
  // LLM V2 Review fields
  llmV2ReviewStatus?: LlmV2ReviewStatus;
}

// Connected X account
export interface ConnectedAccount {
  connected: boolean;
  xUsername?: string;
  xDisplayName?: string;
}

// ============================================
// STATUS MAPPING UTILITIES
// ============================================

/**
 * Map backend status to builder UI status
 */
export function mapBackendToBuilderStatus(
  backendStatus: BackendSubmissionStatus,
  dropsStatus: string | null
): BuilderSubmissionStatus {
  if (backendStatus === 'IN_PROGRESS') {
    return 'PENDING';
  }
  if (backendStatus === 'FAILED') {
    return 'REJECTED';
  }
  if (backendStatus === 'COMPLETED') {
    // Check if already distributed (includes pending_claim for anonymous users)
    if (dropsStatus === 'completed' || dropsStatus === 'sent' || dropsStatus === 'pending_claim') {
      return 'DISTRIBUTED';
    }
    return 'APPROVED';
  }
  return 'PENDING';
}

/**
 * Check if a submission is locked (cannot be modified)
 * Locked when drops are distributed or pending claim (anonymous user)
 */
export function isSubmissionLocked(dropsStatus: string | null): boolean {
  return dropsStatus === 'completed' || dropsStatus === 'sent' || dropsStatus === 'pending_claim';
}

// ============================================
// DISTRIBUTION BADGE UTILITIES
// ============================================

// Badge display configuration
export interface DistributionBadgeConfig {
  text: string;
  color: 'green' | 'orange';
  bgClass: string;
  textClass: string;
}

/**
 * Get distribution badge configuration based on submission status and mission reward config
 */
export function getDistributionBadge(
  dropsStatus: string | null,
  tokenStatus: string | null,
  missionHasTokenReward: boolean
): DistributionBadgeConfig | null {
  // pending_claim is treated as distributed (Builder doesn't need to know internal state)
  const dropsDistributed = dropsStatus === 'completed' || dropsStatus === 'sent' || dropsStatus === 'pending_claim';
  const tokenDistributed = tokenStatus === 'completed' || tokenStatus === 'sent';

  // No distribution has occurred - no badge needed
  if (!dropsDistributed && !tokenDistributed) {
    return null;
  }

  if (missionHasTokenReward) {
    // Mission has Token Reward configured (Drops + Token)
    if (dropsDistributed && tokenDistributed) {
      return {
        text: 'Paid',
        color: 'green',
        bgClass: 'bg-[#E4FFF0]',
        textClass: 'text-[#00C853]',
      };
    } else {
      // Either drops or token distributed, but not both
      return {
        text: 'Partial',
        color: 'orange',
        bgClass: 'bg-[#FFF4E5]',
        textClass: 'text-[#FF9800]',
      };
    }
  } else {
    // Mission only has Drops - if drops distributed, it's fully distributed
    return {
      text: 'Paid',
      color: 'green',
      bgClass: 'bg-[#E4FFF0]',
      textClass: 'text-[#00C853]',
    };
  }
}
