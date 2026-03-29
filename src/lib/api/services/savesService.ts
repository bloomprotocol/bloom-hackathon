import { apiGet, apiPost, apiDelete } from '../apiConfig';
import { ApiResponse } from '@/types/api';
import { ProjectListItem } from './projectService';

export interface SavedProject extends ProjectListItem {
  savedAt: string;
  reviewCount: number;
  saveCount: number;
}

export interface ProjectUpdate {
  id: string;
  project_id: string;
  type: 'NEW_REVIEW' | 'BUILDER_UPDATE' | 'QUEST_ADDED' | 'MILESTONE_REACHED';
  title: string;
  description?: string;
  metadata?: any;
  created_at: string;
  project: {
    id: string;
    name: string;
    symbol: string;
    avatar_url: string;
  };
}

export interface SavedProjectsParams {
  page?: number;
  limit?: number;
  sort?: 'newest' | 'most_active' | 'alphabetical';
}

export interface ProjectUpdatesParams {
  page?: number;
  limit?: number;
  fromDate?: string;
}

export interface RecentActivityItem {
  id: string;
  type: 'project_update' | 'task' | 'mission' | 'comment' | 'favorite' | 'helpful' | 'referral' | 'submission';
  action: string;
  title: string;
  description: string | null;
  timestamp: string;
  projectName: string | null;
  points: string | null;
  metadata: {
    updateType?: string;
    status?: string;
    hasHelpfulVotes?: boolean;
    referralCode?: string;
  };
}

export interface RecentActivityParams {
  page?: number;
  limit?: number;
}

export const savesService = {
  // Save a project
  saveProject: async (projectId: string) => {
    const response = await apiPost<ApiResponse<{
      saved: boolean;
      saveCount: number;
    }>>(`/projects/${projectId}/save`);
    return response.data;
  },

  // Unsave a project
  unsaveProject: async (projectId: string) => {
    const response = await apiDelete<ApiResponse<{
      saved: boolean;
      saveCount: number;
    }>>(`/projects/${projectId}/save`);
    return response.data;
  },

  // Check if current user has saved a project
  getSaveStatus: async (projectId: string) => {
    const response = await apiGet<ApiResponse<{
      isSaved: boolean;
      saveCount: number;
    }>>(`/projects/${projectId}/save-status`);
    return response.data;
  },

  // Check save status for multiple projects (batch operation)
  getBatchSaveStatus: async (projectIds: string[]) => {
    const response = await apiPost<ApiResponse<{
      statuses: Record<string, boolean>;
    }>>('/projects/save-status/batch', { projectIds });
    return response.data;
  },

  // Get user's saved projects (using updated /user route)
  getSavedProjects: async (params?: SavedProjectsParams) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.sort) queryParams.append('sort', params.sort);

    const response = await apiGet<ApiResponse<{
      projects: SavedProject[];
      total: number;
      page: number;
      hasMore: boolean;
    }>>(`/user/saved-projects${queryParams.toString() ? `?${queryParams}` : ''}`);
    return response.data;
  },

  // Get activity feed for saved projects (using updated /user route)
  getSavedProjectUpdates: async (params?: ProjectUpdatesParams) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.fromDate) queryParams.append('fromDate', params.fromDate);

    const response = await apiGet<ApiResponse<{
      updates: ProjectUpdate[];
      total: number;
      page: number;
      hasMore: boolean;
    }>>(`/user/saved-projects/updates${queryParams.toString() ? `?${queryParams}` : ''}`);
    return response.data;
  },

  // Get user activity summary (using updated /user route)
  getUserActivitySummary: async () => {
    const response = await apiGet<ApiResponse<{
      reviewsWritten: number;
      projectsSaved: number;
      helpfulVotesReceived: number;
      joinDate: string | null;
      lastActive: string | null;
    }>>('/user/activity-summary');
    return response.data;
  },

  // Get user stats (using updated /user route)
  getUserStats: async () => {
    const response = await apiGet<ApiResponse<{
      completedTaskCount: number;
      totalPoints: number;
      miniPoints: number;
      totalClicks: number;
      totalReferrals: number;
    }>>('/user/stats');
    return response.data;
  },

  // Get user recent activity
  getUserRecentActivity: async () => {
    const response = await apiGet<ApiResponse<{
      activities: RecentActivityItem[];
      total: number;
      page: number;
      hasMore: boolean;
    }>>('/users/activity/recent?limit=20');
    return response.data;
  },
};