'use client';

import { useState, useEffect } from 'react';
import { ReviewModal } from '@/components/project/ReviewModal';
import { useAuthenticatedBookmark } from '@/hooks/useAuthenticatedBookmark';
import { usePublicProjectReviews } from '@/hooks/usePublicProjectReviews';
import { useReviewMutations } from '@/hooks/useReviewMutations';
import { useAuth } from '@/lib/context/AuthContext';
import { useModal } from '@/lib/context/ModalContext';
import { setCookie, getCookie, deleteCookie, COOKIE_KEYS } from '@/lib/utils/storage/cookieService';
import { ProjectDetailLeftColumn } from './ProjectDetailLeftColumn';
import { ProjectDetailRightColumn } from './ProjectDetailRightColumn';
import { mapProjectData, AUTH_DELAY, PENDING_REVIEW_TTL, type ProjectData, type DisplayConfig, type Review } from './types';

interface ProjectDetailPageClientProps {
  projectData: ProjectData;
  displayConfig: DisplayConfig;
}


export default function ProjectDetailPageClient({ projectData, displayConfig }: ProjectDetailPageClientProps) {
  // Map the API data structure to component structure
  const project = mapProjectData(projectData);
  const { openAuthModal } = useModal();
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [replyToReview, setReplyToReview] = useState<{ id: string; preview: string } | null>(null);
  const [reviewSortBy, setReviewSortBy] = useState<'newest' | 'most_helpful'>('newest');
  const { user } = useAuth();
  
  // React Query hooks
  const {
    reviews,
    total: totalReviews,
    hasMore: hasMoreReviews,
    loadMore,
    isFetchingNextPage: loadingMore
  } = usePublicProjectReviews({
    slug: project.project.slug,
    sort: reviewSortBy === 'newest' ? 'recent' : 'helpful'
  });
  const { createReview, voteHelpful } = useReviewMutations(project.project.id, project.project.slug);
  
  // 使用 useAuthenticatedBookmark 處理未登入狀態
  const { isSaved: isBookmarked, saveCount, handleBookmarkClick } = useAuthenticatedBookmark({
    projectId: project.project.id,
    projectName: project.project.name
  });


  // Handle pending review after authentication
  useEffect(() => {
    if (user) {
      const timer = setTimeout(() => {
        // Give auth process time to complete
        const pendingReviewCookie = getCookie(COOKIE_KEYS.PENDING_REVIEW);
        if (pendingReviewCookie) {
          try {
            const review = JSON.parse(pendingReviewCookie as string);
            // Check if this is the same project
            if (review.projectId === project.project.id) {
              // Delete the cookie first to prevent loops
              deleteCookie(COOKIE_KEYS.PENDING_REVIEW);
              // Set the reply context if it was a reply
              if (review.parentId) {
                setReplyToReview({ id: review.parentId, preview: '' });
              }
              // Create the review
              handleCreateReview(review.content);
            }
          } catch {
            deleteCookie(COOKIE_KEYS.PENDING_REVIEW);
          }
        }
      }, AUTH_DELAY);
      
      return () => clearTimeout(timer);
    }
  }, [user, project.project.id]);

  const handleCreateReview = async (content: string) => {
    if (!user) {
      // Store the review content in cookie for after authentication
      setCookie(COOKIE_KEYS.PENDING_REVIEW, JSON.stringify({
        projectId: project.project.id,
        projectName: project.project.name,
        content,
        parentId: replyToReview?.id,
        timestamp: Date.now()
      }), {
        maxAge: PENDING_REVIEW_TTL,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
      });
      
      openAuthModal();
      return;
    }

    // Use React Query mutation
    createReview.mutate({
      projectId: project.project.id,
      content,
      parentId: replyToReview?.id
    }, {
      onSuccess: () => {
        setShowReviewModal(false);
        setReplyToReview(null);
      }
    });
  };

  const handleReply = (review: Review | null) => {
    if (!review) {
      setReplyToReview(null);
      return;
    }
    // 設置回覆對象（移動端和桌面端都需要）
    const content = review.content || '';
    setReplyToReview({
      id: review.id,
      preview: content.length > 50 ? content.substring(0, 50) + '...' : content
    });
  };

  const handleCreateReplyDirect = async (content: string, parentId: string) => {
    if (!user) {
      openAuthModal();
      return;
    }

    // Use React Query mutation
    createReview.mutate({
      projectId: project.project.id,
      content,
      parentId
    });
  };

  const handleVoteReview = (reviewId: string, vote: 'helpful' | 'not_helpful') => {
    if (!user) {
      openAuthModal();
      return;
    }

    // Use React Query mutation
    voteHelpful.mutate({ reviewId, remove: vote === 'not_helpful' });
  };

  return (
    <>
      <div className="flex flex-col desktop:flex-row gap-6">
        {/* Left column - Main content */}
        <div className="w-full desktop:w-[780px]">
          <ProjectDetailLeftColumn
                project={project.project}
                content={project.content}
                links={project.links}
                team={project.team}
                roadmap={project.roadmap}
                tokenomics={project.tokenomics}
                stats={project.stats}
                reviews={reviews}
                totalReviews={totalReviews}
                hasMoreReviews={hasMoreReviews}
                loadingMore={loadingMore}
                user={user}
                isBookmarked={isBookmarked}
                saveCount={saveCount}
                reviewSortBy={reviewSortBy}
                replyToReview={replyToReview}
                missions={projectData.missions}
                updates={project.updates}
                whySupport={project.whySupport}
                traction={project.traction}
                whyThisMatters={project.whyThisMatters}
                displayConfig={displayConfig}
                onBookmarkClick={handleBookmarkClick}
                onLoadMoreReviews={loadMore}
                onCreateReview={handleCreateReview}
                onCreateReplyDirect={handleCreateReplyDirect}
                onReplyToReview={handleReply}
                onVoteReview={handleVoteReview}
                onSortChange={setReviewSortBy}
                onWriteReviewClick={() => {
                  if (!user) {
                    openAuthModal();
                  } else {
                    setShowReviewModal(true);
                  }
                }}
          />
        </div>

        {/* Right column - 320px width, desktop only */}
        <div className="hidden desktop:block desktop:w-[320px]">
          <ProjectDetailRightColumn project={project.project} missions={projectData.missions} />
        </div>
      </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => {
          setShowReviewModal(false);
          setReplyToReview(null);
        }}
        onSubmit={handleCreateReview}
        replyTo={replyToReview?.preview}
      />
    </>
  );
}