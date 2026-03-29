/**
 * Project Detail Page Types
 * Re-exports and extends types from projectService for use in project detail components
 */

// Constants
export const BREAKPOINTS = {
  desktop: 1280,
} as const;

export const ANIMATION_DURATION = {
  smoothScroll: 600, // ms - smooth scroll animation duration
} as const;

export const AUTH_DELAY = 500; // ms - delay for auth process to complete
export const PENDING_REVIEW_TTL = 300; // seconds - 5 minutes

// Re-export base types from projectService
export type {
  ProjectDetail,
  ProjectLinks,
  ProjectContent,
  TeamMember,
  RoadmapPhase,
  TokenomicsItem,
  Review,
} from '@/lib/api/services/projectService';

import type {
  ProjectDetail,
  ProjectLinks,
  ProjectContent,
  TeamMember,
  RoadmapPhase,
  TokenomicsItem,
} from '@/lib/api/services/projectService';

// Extended project type with additional fields from API
export interface Project extends ProjectDetail {
  slug: string;
  uid: number;
  createdAt?: string;
}

// Project stats
export interface ProjectStats {
  saveCount: number;
  reviewCount: number;
  voteCount: number;
}

// Why Support item
export interface WhySupportItem {
  title: string;
  description: string;
  image_url?: string | null;
}

// Traction item
export interface TractionItem {
  title: string;
  description: string;
}

// Why This Matters item
export interface WhyThisMattersItem {
  title: string;
  description: string;
}

// Update item for activity
export interface UpdateItem {
  title: string;
  description: string;
  created_at: string | Date;
}

// Updates grouped by type
export interface Updates {
  NEW_REVIEW?: UpdateItem[];
  BUILDER_UPDATE?: UpdateItem[];
  QUEST_ADDED?: UpdateItem[];
  MILESTONE_REACHED?: UpdateItem[];
}

// Mission reward type
export interface MissionReward {
  name: string;
  type: string;
  amount: number | null;
  description?: string;
  icon: string | null;
}

// Mission type (matches ProjectMissions component)
export interface Mission {
  id: string;
  title: string;
  description: string;
  slug: string;
  imageUrl: string;
  rewards: MissionReward[];
  startTime: string | null;
  endTime: string | null;
}

// User type (matches AuthContext user type)
export interface User {
  uid: string;
  walletAddress: string;
  roles: string[];
  email?: string | null;
}

// Display config for conditional rendering
export interface DisplayConfig {
  teamMembers: boolean;
  roadmap: boolean;
  tokenomics: boolean;
  projectUpdates: boolean;
  links: boolean;
}

// Full project data structure from API
export interface ProjectData {
  project: Project;
  content: ProjectContent;
  links: ProjectLinks;
  teamMembers: TeamMember[];
  roadmap: RoadmapPhase[];
  tokenomics: TokenomicsItem[];
  stats: ProjectStats;
  updates?: Updates;
  missions?: Mission[];
  whySupport?: WhySupportItem[];
  traction?: TractionItem[];
  whyThisMatters?: { content: string };
}

// Mapped project structure for components
export interface MappedProjectData {
  project: Project;
  content: ProjectContent;
  links: ProjectLinks;
  team: TeamMember[];
  roadmap: RoadmapPhase[];
  tokenomics: TokenomicsItem[];
  stats: ProjectStats;
  updates?: Updates;
  whySupport?: WhySupportItem[];
  traction?: TractionItem[];
  whyThisMatters?: WhyThisMattersItem[];
}

/**
 * Maps raw API project data to the structure expected by components
 */
export function mapProjectData(projectData: ProjectData): MappedProjectData {
  return {
    project: projectData.project,
    content: projectData.content,
    links: projectData.links,
    team: projectData.teamMembers,
    roadmap: projectData.roadmap,
    tokenomics: projectData.tokenomics,
    stats: projectData.stats,
    updates: projectData.updates,
    whySupport: projectData.whySupport,
    traction: projectData.traction,
    whyThisMatters: projectData.whyThisMatters?.content
      ? [{ title: 'Why This Matters', description: projectData.whyThisMatters.content }]
      : undefined,
  };
}
