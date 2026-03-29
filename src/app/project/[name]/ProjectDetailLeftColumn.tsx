"use client";

import { useState, useRef, useEffect } from "react";
import { ProjectHeader } from "./components/ProjectHeader";
import { ProjectOverview } from "./components/ProjectOverview";
import { ProjectReviews } from "./components/ProjectReviews";
import { ProjectTeam } from "./components/ProjectTeam";
import { ProjectRoadmap } from "./components/ProjectRoadmap";
import { ProjectTokenomics } from "./components/ProjectTokenomics";
import { ProjectPledge } from "./components/ProjectPledge";
import { ProjectMissions } from "./components/ProjectMissions";
import { ProjectActivity } from "./components/ProjectActivity";
import { ProjectWhySupport } from "./components/ProjectWhySupport";
import { ProjectTraction } from "./components/ProjectTraction";
import { ProjectWhyThisMatters } from "./components/ProjectWhyThisMatters";
import { NavigationTab } from "./components/NavigationTab";
import {
  BREAKPOINTS,
  ANIMATION_DURATION,
  type Project,
  type ProjectContent,
  type ProjectLinks,
  type TeamMember,
  type RoadmapPhase,
  type TokenomicsItem,
  type ProjectStats,
  type Review,
  type User,
  type Mission,
  type Updates,
  type WhySupportItem,
  type TractionItem,
  type WhyThisMattersItem,
  type DisplayConfig,
} from "./types";

interface ProjectDetailLeftColumnProps {
  project: Project;
  content: ProjectContent | null;
  links: ProjectLinks | null;
  team: TeamMember[];
  roadmap: RoadmapPhase[];
  tokenomics: TokenomicsItem[];
  stats: ProjectStats | null;
  reviews: Review[];
  totalReviews: number;
  hasMoreReviews: boolean;
  loadingMore: boolean;
  user: User | null;
  isBookmarked: boolean;
  saveCount: number;
  reviewSortBy: "newest" | "most_helpful";
  replyToReview: { id: string; preview: string } | null;
  missions?: Mission[];
  updates?: Updates;
  whySupport?: WhySupportItem[];
  traction?: TractionItem[];
  whyThisMatters?: WhyThisMattersItem[];
  displayConfig: DisplayConfig;
  onBookmarkClick: () => void;
  onLoadMoreReviews: () => void;
  onCreateReview: (content: string) => void;
  onCreateReplyDirect: (content: string, parentId: string) => Promise<void>;
  onReplyToReview: (review: Review | null) => void;
  onVoteReview: (reviewId: string, vote: "helpful" | "not_helpful") => void;
  onSortChange: (sort: "newest" | "most_helpful") => void;
  onWriteReviewClick: () => void;
}

export function ProjectDetailLeftColumn({
  project,
  content,
  links,
  team,
  roadmap,
  tokenomics,
  stats,
  reviews,
  totalReviews,
  hasMoreReviews,
  loadingMore,
  user,
  isBookmarked,
  saveCount,
  reviewSortBy,
  replyToReview,
  missions,
  updates,
  whySupport,
  traction,
  whyThisMatters,
  displayConfig,
  onBookmarkClick,
  onLoadMoreReviews,
  onCreateReview,
  onCreateReplyDirect,
  onReplyToReview,
  onVoteReview,
  onSortChange,
  onWriteReviewClick,
}: ProjectDetailLeftColumnProps) {
  const [activeSection, setActiveSection] = useState<string>("overview");
  const [showReviewsView, setShowReviewsView] = useState(false);
  const [showDesktopReviewForm, setShowDesktopReviewForm] = useState(false);
  const [reviewContent, setReviewContent] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const isScrollingFromClickRef = useRef(false);
  const contentAreaRef = useRef<HTMLDivElement>(null);
  const reviewsAreaRef = useRef<HTMLDivElement>(null);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < BREAKPOINTS.desktop;
      setIsMobile(mobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Scroll to top when switching to reviews view
  useEffect(() => {
    if (showReviewsView && reviewsAreaRef.current) {
      reviewsAreaRef.current.scrollTop = 0;
    }
  }, [showReviewsView]);

  // Add dynamic bottom padding to ensure all sections can scroll to top
  useEffect(() => {
    if (showReviewsView) return; // Only apply to main content view
    
    const container = contentAreaRef.current;
    if (!container) return;
    
    // Use requestAnimationFrame to ensure DOM is updated
    requestAnimationFrame(() => {
      const containerHeight = container.clientHeight;
      const lastSection = document.getElementById('tokenomics');
      
      if (lastSection) {
        const lastSectionHeight = lastSection.offsetHeight;
        // Add extra padding so last section can scroll to top
        // Subtract a small amount (32px) to account for existing margins
        const extraPadding = Math.max(0, containerHeight - lastSectionHeight - 32);
        container.style.paddingBottom = `${extraPadding}px`;
      }
    });
  }, [content, team, roadmap, tokenomics, showReviewsView, isMobile]);

  // Track active section based on scroll position
  useEffect(() => {
    // Don't track scroll when in reviews view
    if (showReviewsView) return;
    
    const container = contentAreaRef.current;
    if (!container) return;

    const handleScroll = () => {
      // Skip scroll tracking during click-triggered scrolls
      if (isScrollingFromClickRef.current) return;
      
      const sections = ['overview', 'team', 'roadmap', 'tokenomics'];
      const scrollPosition = container.scrollTop;
      
      // Find the section that is at or has passed the top of the viewport
      let currentSection = 'overview';
      
      for (const sectionId of sections) {
        const section = document.getElementById(sectionId);
        if (!section) continue;
        
        // Get the section's position relative to the container
        const sectionTop = section.offsetTop;
        
        // If this section's top is at or above the current scroll position
        // (with a small offset of 10px for better UX)
        if (sectionTop <= scrollPosition + 10) {
          currentSection = sectionId;
        }
      }
      
      setActiveSection(currentSection);
    };

    container.addEventListener('scroll', handleScroll);
    handleScroll(); // Call once to set initial active section
    
    return () => container.removeEventListener('scroll', handleScroll);
  }, [isMobile, showReviewsView]); // Remove isScrollingFromClick from dependencies

  const handleAnchorClick = (e: React.MouseEvent, sectionId: string) => {
    e.preventDefault();
    setActiveSection(sectionId); // Set active immediately on click
    isScrollingFromClickRef.current = true; // Disable scroll tracking during animation
    
    const container = contentAreaRef.current;
    const section = document.getElementById(sectionId);
    
    if (container && section) {
      // Get accurate positions
      const containerRect = container.getBoundingClientRect();
      const sectionRect = section.getBoundingClientRect();
      
      // Calculate the exact scroll position to put section at top
      const scrollTop = container.scrollTop + (sectionRect.top - containerRect.top);
      
      container.scrollTo({
        top: scrollTop,
        behavior: 'smooth'
      });
      
      // Re-enable scroll tracking after animation completes
      setTimeout(() => {
        isScrollingFromClickRef.current = false;
      }, ANIMATION_DURATION.smoothScroll);
    }
  };

  const handleCreateReview = (content: string) => {
    onCreateReview(content);
    setReviewContent("");
    setShowDesktopReviewForm(false);
  };

  const handleReplyToReview = (review: Review | null) => {
    onReplyToReview(review);
  };

  // Navigation tabs configuration
  const tabs = [
    { id: 'overview', label: 'Overview', show: true },
    { id: 'team', label: 'Team', show: displayConfig.teamMembers },
    { id: 'roadmap', label: 'Roadmap', show: displayConfig.roadmap },
    { id: 'tokenomics', label: 'Tokenomics', show: displayConfig.tokenomics },
  ].filter(tab => tab.show);

  const handleTabClick = (e: React.MouseEvent, sectionId: string) => {
    setShowReviewsView(false);
    handleAnchorClick(e, sectionId);
  };

  return (
    <>
      <div 
        className="project-detail-container w-full desktop:bg-white/50 desktop:backdrop-blur-sm desktop:rounded-[20px] desktop:shadow-[0px_6px_10px_-4px_rgba(0,0,0,0.12)] desktop:border desktop:border-[#E5E5E5] h-[100vh] desktop:h-[828px] desktop:px-6 desktop:pt-6 inline-flex flex-col justify-start items-start desktop:items-center gap-6 relative overflow-hidden"
      >
        {/* Project Header - Always visible */}
        <ProjectHeader 
          project={project} 
          links={displayConfig.links ? links : null} 
          isBookmarked={isBookmarked}
          onBookmarkClick={onBookmarkClick}
        />

        {/* Project Pledge - Mobile only, inserted after header, only for pre-sale status */}
        {project.status === "pre_sale" && (
          <div className="block desktop:hidden w-full">
            <ProjectPledge />
          </div>
        )}

        {/* Mobile Navigation */}
        <div className="desktop:hidden mb-6 w-full">
          <div className="flex flex-row gap-8 items-start justify-start overflow-x-auto scrollbar-hide w-full">
            {tabs.map(tab => (
              <NavigationTab
                key={tab.id}
                id={tab.id}
                label={tab.label}
                isActive={!showReviewsView && activeSection === tab.id}
                onClick={(e) => handleTabClick(e, tab.id)}
                variant="mobile"
              />
            ))}
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="self-stretch flex flex-col justify-start items-start gap-4 flex-1 min-h-0">
          {/* Desktop Navigation */}
          <div className="hidden desktop:block self-stretch">
            <div className="self-stretch inline-flex justify-start items-center gap-8">
              {tabs.map(tab => (
                <NavigationTab
                  key={tab.id}
                  id={tab.id}
                  label={tab.label}
                  isActive={!showReviewsView && activeSection === tab.id}
                  onClick={(e) => handleTabClick(e, tab.id)}
                  variant="desktop"
                />
              ))}
            </div>
          </div>

          {/* Content Area - Conditional rendering based on view */}
          {!showReviewsView ? (
            <div ref={contentAreaRef} className="self-stretch flex-1 overflow-y-auto desktop:pb-6 desktop:px-2 desktop:pt-2">
              {/* Overview Section */}
              <section id="overview" className="mb-8">
                <ProjectOverview project={project} content={content} stats={stats} />
              </section>

              {/* WhySupport Section - NEW */}
              {whySupport && whySupport.length > 0 && (
                <section id="why-support" className="mb-8">
                  <ProjectWhySupport data={whySupport} />
                </section>
              )}

              {/* Traction Section - NEW */}
              {traction && traction.length > 0 && (
                <section id="traction" className="mb-8">
                  <ProjectTraction data={traction} />
                </section>
              )}

              {/* WhyThisMatters Section - NEW */}
              {whyThisMatters && whyThisMatters.length > 0 && (
                <section id="why-this-matters" className="mb-8">
                  <ProjectWhyThisMatters data={whyThisMatters} />
                </section>
              )}

              {/* Team Section - Conditionally rendered */}
              {displayConfig.teamMembers && (
                <section id="team" className="mb-8">
                  <ProjectTeam team={team} />
                </section>
              )}

              {/* Roadmap Section - Conditionally rendered */}
              {displayConfig.roadmap && (
                <section id="roadmap" className="mb-8">
                  <ProjectRoadmap roadmap={roadmap} />
                </section>
              )}

              {/* Tokenomics Section - Conditionally rendered */}
              {displayConfig.tokenomics && (
                <section id="tokenomics" className="mb-8 desktop:mb-16">
                  <ProjectTokenomics tokenomics={tokenomics} />
                </section>
              )}

            {/* Mobile Only: Missions Section */}
            {isMobile && missions && missions.length > 0 && (
              <section id="missions" className="mb-8">
                <ProjectMissions missions={missions} />
              </section>
            )}

              {/* Mobile Only: Activity Section - Conditionally rendered */}
              {isMobile && displayConfig.projectUpdates && (
                <section id="activity" className="mb-8">
                  <ProjectActivity updates={updates} />
                </section>
              )}
            </div>
          ) : (
            /* Reviews Only View */
            <div ref={reviewsAreaRef} className="self-stretch flex-1 overflow-y-auto pb-4 desktop:pb-6 desktop:px-2 desktop:pt-2">
              <ProjectReviews
                project={project}
                reviews={reviews}
                totalReviews={totalReviews}
                hasMoreReviews={hasMoreReviews}
                loadingMore={loadingMore}
                reviewSortBy={reviewSortBy}
                user={user}
                showDesktopReviewForm={showDesktopReviewForm}
                reviewContent={reviewContent}
                replyToReview={replyToReview}
                onSortChange={onSortChange}
                onLoadMore={onLoadMoreReviews}
                onCreateReview={handleCreateReview}
                onCreateReplyDirect={onCreateReplyDirect}
                onReplyToReview={handleReplyToReview}
                onVoteReview={onVoteReview}
                onWriteReviewClick={onWriteReviewClick}
                onReviewContentChange={setReviewContent}
                onToggleDesktopReviewForm={() =>
                  setShowDesktopReviewForm(!showDesktopReviewForm)
                }
                onCancelReply={() => {
                  onReplyToReview(null);
                  setShowDesktopReviewForm(false);
                }}
              />
            </div>
          )}
        </div>

      </div>

    </>
  );
}
