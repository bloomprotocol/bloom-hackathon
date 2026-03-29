import { apiGet, apiPost } from '../apiConfig';

export interface SocialMissionDetail {
  mission: {
    id: string;
    title: string;
    description: string;
    postedBy: string;
    postedByUsername: string;
    postedAt: string;
    originalPostUrl: string;
    startTime: string;
    endTime: string;
  };
  stats: {
    totalSubmissions: number;
    verifiedCount: number;
    pendingCount: number;
  };
  rewards: Array<{
    typeId: string;
    amount: number;
    name: string;
    icon: string;
  }>;
}

export interface Submission {
  id: number;
  username: string;
  submittedAt: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'FAILED';
  dropsStatus: string | null;
  tokenStatus: string | null;
  text: string;
  xPostUrl: string;
  llmV2ReviewStatus?: {
    status: boolean;
    result?: {
      quality_score: number;
      ai_likelihood: number;
      message: string;
    };
    reviewed_at?: string;
  };
  isAnonymous: boolean;
}

export interface SubmissionsResponse {
  submissions: Submission[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  };
}

export interface ManualSubmissionResponse {
  success: boolean;
  statusCode: number;
  data: {
    status: 'success' | 'approved' | 'error';
    message: string;
  };
  error?: string | null;
}

class SocialMissionService {
  async getMissionByTweetId(tweetId: string): Promise<SocialMissionDetail> {
    const response = await apiGet<SocialMissionDetail>(`/social-missions/${tweetId}`);
    return response;
  }

  async getSubmissions(
    tweetId: string,
    page: number = 1,
    status: 'all' | 'COMPLETED' | 'IN_PROGRESS' = 'all'
  ): Promise<SubmissionsResponse> {
    const response = await apiGet<SubmissionsResponse>(
      `/social-missions/${tweetId}/submissions?page=${page}&status=${status}`
    );
    return response;
  }

  async checkManualSubmission(
    postId: string,
    xPostUrl: string
  ): Promise<ManualSubmissionResponse> {
    const response = await apiPost<ManualSubmissionResponse>(
      `/social-missions/${postId}/manual-submission`,
      { xPostUrl }
    );
    return response;
  }
}

export const socialMissionService = new SocialMissionService();
