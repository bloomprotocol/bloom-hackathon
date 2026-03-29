import { apiGet, apiPost, apiPut } from '../apiConfig';

// 基础 API 响应包装
interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  data: T;
  error: string | null;
}

// 项目状态枚举
export enum ProjectStatus {
  DRAFT = 'draft',
  VOTE_IN_PROGRESS = 'vote_in_progress',
  ACTIVE = 'active',
  PRE_SALE = 'pre_sale',
  LAUNCH = 'launch',
  COMPLETED = 'completed',
}

// 项目链接类型枚举
export enum ProjectLinkType {
  WEBSITE = 'website',
  TWITTER = 'twitter',
  TELEGRAM = 'telegram',
  GITHUB = 'github',
}

// 项目列表项类型
export interface ProjectListItem {
  id: string;
  name: string;
  slug: string;
  symbol: string;
  caption: string | null;
  avatarUrl: string | null;
  categories: string[];
  blockchain: string;
  status: ProjectStatus;
  tokenUnlockDays: number | null;
  totalVotes: number;
  countdown?: string;
  endDate?: string | null;
  launchDate?: string | null;
  save_count?: number;
  review_count?: number;
  is_saved?: boolean;
}

// 项目详情类型
export interface ProjectDetail {
  id: string;
  name: string;
  symbol: string;
  whyMe: string | null;
  caption: string | null;
  avatarUrl: string | null;
  categories: string[];
  blockchain: string;
  framework: string | null;
  status: ProjectStatus;
  launchDate: string | null;
  endDate: string | null;
  tokenUnlockDays: number | null;
}

// 项目链接类型
export interface ProjectLinks {
  website?: string;
  twitter?: string;
  telegram?: string;
  github?: string;
}

// 团队成员类型
export interface TeamMember {
  id: string;
  name: string;
  role: string | null;
  bio: string | null;
  avatarUrl: string | null;
  twitterUrl: string | null;
}

// 项目内容类型
export interface ProjectContent {
  overview?: string;
  capabilities?: string;
  custom: Array<{
    id: string;
    sectionType: string;
    title: string | null;
    content: string | null;
    ordering: number;
  }>;
}

// 路线图阶段类型
export interface RoadmapPhase {
  phaseNumber: number;
  title: string | null;
  timeline: string | null;
  description: string | null;
}

// 代币经济学类型
export interface TokenomicsItem {
  category: string;
  percentage: number;
  description: string | null;
  vestingSchedule: string | null;
}

// Public API Types
export interface PublicProjectsParams {
  page?: number;
  limit?: number;
  status?: string;
  chain?: string;
  categories?: string[];
}

export interface PublicProjectsResponse {
  success: boolean;
  data: {
    projects: ProjectListItem[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
  statusCode: number;
}

export interface PublicProjectResponse {
  success: boolean;
  data: {
    project: ProjectDetail & {
      slug: string;
      uid: number;
      createdAt: string;
    };
    links: ProjectLinks;
    content: ProjectContent;
    teamMembers: Array<TeamMember & {
      avatar_url?: string;
      phase_number?: number;
    }>;
    roadmap: Array<RoadmapPhase & {
      phase_number?: number;
    }>;
    tokenomics: TokenomicsItem[];
    stats: {
      saveCount: number;
      reviewCount: number;
      voteCount: number;
    };
  };
  statusCode: number;
}

export interface PublicProjectReviewsParams {
  slug: string;
  sort?: 'recent' | 'helpful';
}

export interface Review {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: {
    uid: number;
    name: string;
  };
  _count?: {
    helpful_votes: number;
  };
  isHelpful?: boolean;
  replies?: Review[];
}

export interface PublicProjectReviewsResponse {
  success: boolean;
  data: {
    reviews: Review[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      hasMore: boolean;
    };
  };
  statusCode: number;
}

// 项目完整详情类型
export interface ProjectFullDetail {
  project: ProjectDetail;
  links: ProjectLinks;
  team: TeamMember[];
  content: ProjectContent;
  roadmap: RoadmapPhase[];
  tokenomics: TokenomicsItem[];
  totalVotes: number;
  userVote: number;
}

// 项目列表查询参数
export interface ProjectListQuery {
  status?: ProjectStatus | 'all';
  chain?: string;
  categories?: string;
  page?: number;
  limit?: number;
}

// 项目列表响应
export interface ProjectListResponse {
  projects: ProjectListItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// 投票响应
export interface VoteResponse {
  message: string;
  userVote: number;
  remainingPoints: number;
}

export const projectService = {
  /**
   * 获取项目列表
   * @endpoint GET /projects
   * @description 获取项目列表，支持筛选和分页
   * @param query 查询参数
   * @returns 项目列表和分页信息
   */
  getProjectList: async (query?: ProjectListQuery): Promise<ProjectListResponse> => {
    const params = new URLSearchParams();
    
    if (query?.status && query.status !== 'all') {
      params.append('status', query.status);
    }
    if (query?.chain) params.append('chain', query.chain);
    if (query?.categories) params.append('categories', query.categories);
    if (query?.page) params.append('page', String(query.page));
    if (query?.limit) params.append('limit', String(query.limit));
    
    const queryString = params.toString();
    const response = await apiGet<ApiResponse<ProjectListResponse>>(
      `/projects${queryString ? '?' + queryString : ''}`
    );
    return response.data;
  },

  /**
   * 获取项目详情
   * @endpoint GET /projects/:id
   * @description 获取项目的完整详情，包括所有相关数据
   * @param projectId 项目ID
   * @returns 项目的完整信息
   */
  getProjectDetail: async (projectId: string): Promise<ProjectFullDetail> => {
    const response = await apiGet<ApiResponse<ProjectFullDetail>>(`/projects/${projectId}`);
    return response.data;
  },

  /**
   * 通过 slug 获取项目详情
   * @endpoint GET /projects/by-slug/:slug
   * @description 通过项目 slug 获取完整详情
   * @param slug 项目 slug
   * @returns 项目的完整信息
   */
  getProjectDetailBySlug: async (slug: string): Promise<ProjectFullDetail> => {
    const response = await apiGet<ApiResponse<ProjectFullDetail>>(`/projects/by-slug/${slug}`);
    return response.data;
  },

  /**
   * 为项目投票
   * @endpoint PUT /projects/:id/vote
   * @description 为项目分配投票点数（0-25）
   * @param projectId 项目ID
   * @param points 投票点数（0-25）
   * @returns 投票结果和剩余点数
   */
  voteProject: async (projectId: string, points: number): Promise<ApiResponse<VoteResponse>> => {
    return apiPut(`/projects/${projectId}/vote`, { points });
  },

  /**
   * 创建新项目
   * @endpoint POST /projects
   * @description 创建新项目（需要相应权限）
   * @param data 项目基本信息
   * @returns 创建结果
   */
  createProject: async (data: {
    name: string;
    symbol: string;
    blockchain: string;
    whyMe: string;
    content: {
      overview: string;
    };
    teamMembers?: Array<{
      name: string;
      role: string;
      bio: string;
      avatarUrl?: string;
      twitterUrl?: string;
    }>;
    roadmapPhases?: Array<{
      phaseNumber: number;
      title: string;
      timeline: string;
      description: string;
    }>;
    links?: {
      website?: string;
      twitter?: string;
      telegram?: string;
      github?: string;
    };
  }): Promise<ApiResponse<{ projectId: string; message: string }>> => {
    return apiPost('/projects', data);
  },

  /**
   * 更新项目基本信息
   * @endpoint PUT /projects/:id
   * @description 更新项目基本信息
   * @param projectId 项目ID
   * @param data 要更新的数据
   * @returns 更新结果
   */
  updateProject: async (
    projectId: string,
    data: Partial<{
      // Core fields now included
      name: string;
      symbol: string;
      blockchain: string;
      whyMe: string;
      content?: {
        overview?: string;
      };
      // Existing fields
      caption: string;
      avatarUrl: string;
      categories: string[];
      framework: string;
      launchDate: string;
      endDate: string;
      tokenUnlockDays: number;
      teamMembers?: Array<{
        name: string;
        role: string;
        bio: string;
        avatarUrl?: string;
        twitterUrl?: string;
      }>;
      roadmapPhases?: Array<{
        phaseNumber: number;
        title: string;
        timeline: string;
        description: string;
      }>;
      links?: {
        website?: string;
        twitter?: string;
        telegram?: string;
        github?: string;
      };
      contentSections?: Array<{
        sectionType: string;
        title?: string;
        content?: string;
        ordering: number;
      }>;
    }>
  ): Promise<ApiResponse<{ message: string }>> => {
    return apiPut(`/projects/${projectId}`, data);
  },

  /**
   * 更新项目状态
   * @endpoint PUT /projects/:id/status
   * @description 更新项目状态（带验证）
   * @param projectId 项目ID
   * @param status 新状态
   * @returns 更新结果
   */
  updateProjectStatus: async (
    projectId: string,
    status: ProjectStatus
  ): Promise<ApiResponse<{ message: string }>> => {
    return apiPut(`/projects/${projectId}/status`, { status });
  },


  /**
   * 更新项目代币经济学
   * @endpoint PUT /projects/:id/tokenomics
   * @description 更新项目的代币分配方案
   * @param projectId 项目ID
   * @param tokenomics 代币经济学配置
   * @returns 更新结果
   */
  updateTokenomics: async (
    projectId: string,
    tokenomics: Array<{
      category: string;
      percentage: number;
      description?: string;
      vestingSchedule?: string;
    }>
  ): Promise<ApiResponse<{ message: string }>> => {
    return apiPut(`/projects/${projectId}/tokenomics`, { tokenomics });
  },

  /**
   * 获取当前用户的项目列表
   * @endpoint GET /projects/my-projects
   * @description 获取当前登录用户（Builder）的所有项目
   * @returns 用户的项目列表
   */
  getMyProjects: async (): Promise<ProjectListItem[]> => {
    const response = await apiGet<ApiResponse<{ projects: ProjectListItem[]; total: number }>>('/projects/my-projects');
    // Handle null or undefined data
    if (!response.data) {
      return [];
    }
    return response.data.projects || [];
  },
};

export default projectService;