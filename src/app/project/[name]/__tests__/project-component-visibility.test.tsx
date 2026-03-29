/**
 * Feature: Dynamic-Project-Detail-Page-Configuration-250808
 * Spec Reference: fe-test-plan.md#component-visibility-tests
 * Implemented by: CI Agent
 * Date: 2025-08-09
 * 
 * BUSINESS VALUE TESTS ONLY - Testing component visibility business rules
 */

import { render, screen } from '@testing-library/react';
import { ProjectDetailLeftColumn } from '../ProjectDetailLeftColumn';

// Mock the child components to focus on visibility logic
jest.mock('../components/ProjectOverview', () => ({
  ProjectOverview: ({ project }: any) => <div data-testid="project-overview">{project.name} Overview</div>
}));

jest.mock('../components/ProjectTeam', () => ({
  ProjectTeam: () => <div data-testid="project-team-members">Team Members Section</div>
}));

jest.mock('../components/ProjectRoadmap', () => ({
  ProjectRoadmap: () => <div data-testid="project-roadmap">Roadmap Section</div>
}));

jest.mock('../components/ProjectTokenomics', () => ({
  ProjectTokenomics: () => <div data-testid="project-tokenomics">Tokenomics Section</div>
}));

jest.mock('../components/ProjectActivity', () => ({
  ProjectActivity: () => <div data-testid="project-updates">Project Updates Section</div>
}));

jest.mock('../components/ProjectHeader', () => ({
  ProjectHeader: ({ project, links }: any) => (
    <div data-testid="project-header">
      <h1>{project.name}</h1>
      {links && <div data-testid="project-links">Links Available</div>}
    </div>
  )
}));

// Mock other components that aren't part of our test focus
jest.mock('../components/ProjectReviews', () => ({
  ProjectReviews: () => <div data-testid="project-reviews">Reviews Section</div>
}));

jest.mock('../components/ProjectPledge', () => ({
  ProjectPledge: () => <div data-testid="project-pledge">Pledge Section</div>
}));

jest.mock('../components/ProjectFooterActions', () => ({
  ProjectFooterActions: () => <div data-testid="project-footer">Footer Actions</div>
}));

jest.mock('../components/ProjectMissions', () => ({
  ProjectMissions: () => <div data-testid="project-missions">Missions Section</div>
}));

// Mock data
const mockProject = {
  id: "mock-project-uuid-001",
  name: "Test DeFi Protocol",
  slug: "test-defi-protocol",
  status: "active",
  avatarUrl: "https://example.com/avatar.jpg"
};

const mockContent = {
  description: "A test DeFi protocol for testing purposes"
};

const mockLinks = {
  website: "https://testdefi.com",
  twitter: "https://twitter.com/testdefi",
  discord: "https://discord.gg/testdefi",
  github: "https://github.com/testdefi"
};

const mockTeamMembers = [
  { id: "member-001", name: "John Doe", role: "Founder & CEO" },
  { id: "member-002", name: "Jane Smith", role: "CTO" }
];

const mockRoadmap = [
  { id: "milestone-001", title: "Phase 1: Core Development", status: "completed" },
  { id: "milestone-002", title: "Phase 2: Testnet Launch", status: "in_progress" }
];

const mockTokenomics = {
  totalSupply: "1000000000",
  initialPrice: "0.001"
};

const mockStats = {
  saves: 42,
  votes: 128
};

const mockUpdates = [
  { id: "update-001", title: "Weekly Development Update #1", createdAt: "2025-08-01T10:00:00.000Z" }
];

const defaultProps = {
  project: mockProject,
  content: mockContent,
  links: mockLinks,
  team: mockTeamMembers,
  roadmap: mockRoadmap,
  tokenomics: mockTokenomics,
  stats: mockStats,
  reviews: [],
  totalReviews: 0,
  hasMoreReviews: false,
  loadingMore: false,
  user: null,
  isBookmarked: false,
  saveCount: 42,
  reviewSortBy: "newest" as const,
  replyToReview: null,
  missions: [],
  updates: mockUpdates,
  onBookmarkClick: jest.fn(),
  onLoadMoreReviews: jest.fn(),
  onCreateReview: jest.fn(),
  onCreateReplyDirect: jest.fn(),
  onReplyToReview: jest.fn(),
  onVoteReview: jest.fn(),
  onSortChange: jest.fn(),
  onWriteReviewClick: jest.fn()
};

describe('Project Component Visibility - Business Logic Tests', () => {
  // Mock window.innerWidth for mobile/desktop detection
  beforeEach(() => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1440, // Desktop width
    });
  });

  describe('BUSINESS RULE: All components visible with default configuration', () => {
    test('should render all components when configuration shows all visible', () => {
      // BUSINESS VALUE: Default behavior shows all components for complete project display
      const allVisibleConfig = {
        teamMembers: true,
        roadmap: true,
        tokenomics: true,
        projectUpdates: true,
        links: true
      };

      render(
        <ProjectDetailLeftColumn 
          {...defaultProps}
          displayConfig={allVisibleConfig}
        />
      );
      
      // All major sections should be present
      expect(screen.getByTestId('project-overview')).toBeInTheDocument();
      expect(screen.getByTestId('project-team-members')).toBeInTheDocument();
      expect(screen.getByTestId('project-roadmap')).toBeInTheDocument();
      expect(screen.getByTestId('project-tokenomics')).toBeInTheDocument();
      expect(screen.getByTestId('project-links')).toBeInTheDocument();
      
      // Navigation tabs should be present for all sections
      expect(screen.getAllByText('Team')).toHaveLength(2); // Mobile + Desktop
      expect(screen.getAllByText('Roadmap')).toHaveLength(2); // Mobile + Desktop
      expect(screen.getAllByText('Tokenomics')).toHaveLength(2); // Mobile + Desktop
    });
  });

  describe('BUSINESS RULE: Admin-configured components must be properly hidden', () => {
    test('should hide components based on configuration', () => {
      // BUSINESS VALUE: Admin-configured components must be properly hidden
      const partiallyHiddenConfig = {
        teamMembers: false,
        roadmap: false,
        tokenomics: true,
        projectUpdates: true,
        links: false
      };

      render(
        <ProjectDetailLeftColumn 
          {...defaultProps}
          displayConfig={partiallyHiddenConfig}
        />
      );
      
      // Hidden components should not exist in DOM
      expect(screen.queryByTestId('project-team-members')).not.toBeInTheDocument();
      expect(screen.queryByTestId('project-roadmap')).not.toBeInTheDocument();
      expect(screen.queryByTestId('project-links')).not.toBeInTheDocument();
      
      // Visible components should exist
      expect(screen.getByTestId('project-overview')).toBeInTheDocument(); // Always shown
      expect(screen.getByTestId('project-tokenomics')).toBeInTheDocument();
      
      // Navigation tabs should only exist for visible sections
      expect(screen.queryAllByText('Team')).toHaveLength(0);
      expect(screen.queryAllByText('Roadmap')).toHaveLength(0);
      expect(screen.getAllByText('Tokenomics')).toHaveLength(2); // Mobile + Desktop
    });

    test('should handle all components hidden except overview', () => {
      // BUSINESS VALUE: Overview should always be visible, other components respect configuration
      const allHiddenConfig = {
        teamMembers: false,
        roadmap: false,
        tokenomics: false,
        projectUpdates: false,
        links: false
      };

      render(
        <ProjectDetailLeftColumn 
          {...defaultProps}
          displayConfig={allHiddenConfig}
        />
      );
      
      // Overview should always be present (business requirement)
      expect(screen.getByTestId('project-overview')).toBeInTheDocument();
      
      // All other components should be hidden
      expect(screen.queryByTestId('project-team-members')).not.toBeInTheDocument();
      expect(screen.queryByTestId('project-roadmap')).not.toBeInTheDocument();
      expect(screen.queryByTestId('project-tokenomics')).not.toBeInTheDocument();
      expect(screen.queryByTestId('project-links')).not.toBeInTheDocument();
      
      // Navigation should only show overview
      expect(screen.queryAllByText('Team')).toHaveLength(0);
      expect(screen.queryAllByText('Roadmap')).toHaveLength(0);
      expect(screen.queryAllByText('Tokenomics')).toHaveLength(0);
    });
  });

  describe('BUSINESS RULE: Links configuration affects header display', () => {
    test('should show links in header when links are enabled', () => {
      // BUSINESS VALUE: Links configuration must control header link display
      const linksEnabledConfig = {
        teamMembers: true,
        roadmap: true,
        tokenomics: true,
        projectUpdates: true,
        links: true
      };

      render(
        <ProjectDetailLeftColumn 
          {...defaultProps}
          displayConfig={linksEnabledConfig}
        />
      );
      
      expect(screen.getByTestId('project-links')).toBeInTheDocument();
    });

    test('should hide links in header when links are disabled', () => {
      // BUSINESS VALUE: Links configuration must control header link display
      const linksDisabledConfig = {
        teamMembers: true,
        roadmap: true,
        tokenomics: true,
        projectUpdates: true,
        links: false
      };

      render(
        <ProjectDetailLeftColumn 
          {...defaultProps}
          displayConfig={linksDisabledConfig}
        />
      );
      
      expect(screen.queryByTestId('project-links')).not.toBeInTheDocument();
    });
  });

  describe('BUSINESS RULE: Configuration changes must be immediately reflected', () => {
    test('should update component visibility when configuration changes', () => {
      // BUSINESS VALUE: Configuration changes must be immediately reflected
      const initialConfig = {
        teamMembers: true,
        roadmap: true,
        tokenomics: true,
        projectUpdates: true,
        links: true
      };

      const { rerender } = render(
        <ProjectDetailLeftColumn 
          {...defaultProps}
          displayConfig={initialConfig}
        />
      );
      
      expect(screen.getByTestId('project-team-members')).toBeInTheDocument();
      expect(screen.getByTestId('project-roadmap')).toBeInTheDocument();
      
      // Simulate configuration change
      const updatedConfig = {
        teamMembers: false,
        roadmap: false,
        tokenomics: true,
        projectUpdates: true,
        links: true
      };

      rerender(
        <ProjectDetailLeftColumn 
          {...defaultProps}
          displayConfig={updatedConfig}
        />
      );
      
      expect(screen.queryByTestId('project-team-members')).not.toBeInTheDocument();
      expect(screen.queryByTestId('project-roadmap')).not.toBeInTheDocument();
      expect(screen.getByTestId('project-tokenomics')).toBeInTheDocument();
    });
  });

  describe('BUSINESS RULE: Component configuration preserves navigation functionality', () => {
    test('should maintain proper navigation behavior with mixed visibility', () => {
      // BUSINESS VALUE: Navigation must work correctly regardless of configuration
      const mixedConfig = {
        teamMembers: true,
        roadmap: false, // Hidden
        tokenomics: true,
        projectUpdates: false, // Hidden
        links: true
      };

      render(
        <ProjectDetailLeftColumn 
          {...defaultProps}
          displayConfig={mixedConfig}
        />
      );
      
      // Only visible sections should have navigation tabs
      expect(screen.getAllByText('Overview')).toHaveLength(2); // Mobile + Desktop
      expect(screen.getAllByText('Team')).toHaveLength(2); // Mobile + Desktop
      expect(screen.queryAllByText('Roadmap')).toHaveLength(0); // Hidden
      expect(screen.getAllByText('Tokenomics')).toHaveLength(2); // Mobile + Desktop
      
      // Corresponding content sections
      expect(screen.getByTestId('project-overview')).toBeInTheDocument();
      expect(screen.getByTestId('project-team-members')).toBeInTheDocument();
      expect(screen.queryByTestId('project-roadmap')).not.toBeInTheDocument(); // Hidden
      expect(screen.getByTestId('project-tokenomics')).toBeInTheDocument();
    });
  });
});