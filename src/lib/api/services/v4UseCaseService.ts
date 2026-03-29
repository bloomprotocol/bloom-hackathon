import { apiGet, apiPost } from '../apiConfig';
import type { UseCase, TribeStatus } from '@/constants/v4-use-case-definitions';

export interface UseCasesListResponse {
  success: boolean;
  data: {
    useCases: UseCase[];
    total: number;
  };
  statusCode: number;
}

export interface UseCaseDetailResponse {
  success: boolean;
  data: UseCase;
  statusCode: number;
}

export interface ClaimResponse {
  success: boolean;
  data: {
    claimId: string;
    claimCount: number;
    tribeStatus: TribeStatus;
    claimTarget: number;
  };
  statusCode: number;
}

export interface ClaimPayload {
  method: 'email' | 'wallet';
  walletAddress?: string;
  email?: string;
  projectDescription: string; // 50 chars min
  xHandle?: string;
}

export interface UserClaim {
  claimId: string;
  useCaseId: string;
  method: 'email' | 'wallet';
  projectDescription: string;
  claimedAt: string;
  useCase?: UseCase;
}

export interface UserClaimsResponse {
  success: boolean;
  data: {
    claims: UserClaim[];
  };
  statusCode: number;
}

export const v4UseCaseService = {
  getUseCases: async () => {
    return apiGet<UseCasesListResponse>('/use-cases');
  },

  getUseCaseById: async (id: string) => {
    return apiGet<UseCaseDetailResponse>(`/use-cases/${id}`);
  },

  getUseCaseConfig: async (id: string) => {
    return apiGet<string>(`/use-cases/${id}/config`);
  },

  claimUseCase: async (id: string, data: ClaimPayload) => {
    return apiPost<ClaimResponse>(`/use-cases/${id}/claim`, data);
  },

  getUserClaims: async () => {
    return apiGet<UserClaimsResponse>('/use-cases/my-claims');
  },
};

export default v4UseCaseService;
