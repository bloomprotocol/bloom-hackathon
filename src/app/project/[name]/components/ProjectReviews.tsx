import { ReviewCard } from '@/components/project/ReviewCard';
import type { Review, User } from '../types';

interface ProjectReviewsProps {
  project: { uid: number };
  reviews: Review[];
  totalReviews: number;
  hasMoreReviews: boolean;
  loadingMore: boolean;
  reviewSortBy: 'newest' | 'most_helpful';
  user: User | null;
  showDesktopReviewForm: boolean;
  reviewContent: string;
  replyToReview: { id: string; preview: string } | null;
  onSortChange: (sort: 'newest' | 'most_helpful') => void;
  onLoadMore: () => void;
  onCreateReview: (content: string) => void;
  onCreateReplyDirect: (content: string, parentId: string) => Promise<void>;
  onReplyToReview: (review: Review | null) => void;
  onVoteReview: (reviewId: string, vote: 'helpful' | 'not_helpful') => void;
  onWriteReviewClick: () => void;
  onReviewContentChange: (content: string) => void;
  onToggleDesktopReviewForm: () => void;
  onCancelReply: () => void;
}

export function ProjectReviews({
  project,
  reviews,
  totalReviews,
  hasMoreReviews,
  loadingMore,
  reviewSortBy,
  user,
  showDesktopReviewForm,
  reviewContent,
  replyToReview,
  onSortChange,
  onLoadMore,
  onCreateReview,
  onCreateReplyDirect,
  onReplyToReview,
  onVoteReview,
  onWriteReviewClick,
  onReviewContentChange,
  onToggleDesktopReviewForm,
  onCancelReply
}: ProjectReviewsProps) {
  return (
    <div className="common-pdp-card-style">
      {/* Title */}
      <div className="common-pdp-card-title">
        <p>Reviews</p>
      </div>
      
      {/* Desktop Review Form */}
      {showDesktopReviewForm && user && (
        <div className="bg-[rgba(255,255,255,0.6)] border border-[#dad9e5] rounded-xl p-3 w-full">
              <textarea
                value={reviewContent}
                onChange={(e) => onReviewContentChange(e.target.value)}
                placeholder="Enter your review"
                className="w-full bg-transparent text-[#393f49] text-[14px] leading-[1.4] tracking-[-0.28px] placeholder-[#696f8c] resize-none outline-none"
                rows={3}
                maxLength={500}
              />
              <div className="flex justify-end gap-3 mt-3">
                <button
                  onClick={onToggleDesktopReviewForm}
                  className="bg-white border-2 border-[#dad9e5] rounded-[27px] h-7 w-20 shadow-[0px_3px_0px_-1px_#393f49] flex items-center justify-center hover:opacity-90 transition-opacity"
                >
                  <span className="text-[#393f49] text-[12px] font-semibold leading-none">Cancel</span>
                </button>
                <button
                  onClick={() => onCreateReview(reviewContent)}
                  disabled={!reviewContent.trim()}
                  className="bg-[#e7e6f2] rounded-[27px] h-7 w-20 shadow-[0px_3px_0px_-1px_#393f49] flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  <span className="text-[#393f49] text-[12px] font-semibold leading-none">Post</span>
                </button>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="flex flex-col w-full">
            {reviews.map((review, index) => (
              <div key={review.id}>
                <ReviewCard
                  review={{
                    ...review,
                    userHelpfulVote: review.isHelpful || false,
                    helpfulCount: review._count?.helpful_votes || 0,
                    createdAt: review.updatedAt,
                    replies: review.replies?.map((reply: Review) => ({
                      ...reply,
                      userHelpfulVote: reply.isHelpful || false,
                      helpfulCount: reply._count?.helpful_votes || 0,
                      createdAt: reply.updatedAt
                    })) || []
                  }}
                  projectBuilderId={project.uid}
                  onReply={(reviewId, content) => {
                    // Find the review object by ID
                    const review = reviews.find(r => r.id === reviewId);
                    if (review) {
                      onReplyToReview(review);
                    } else {
                      onReplyToReview(null);
                    }
                  }}
                  onCreateReply={onCreateReplyDirect}
                  onHelpfulVote={(reviewId) => onVoteReview(reviewId, 'helpful')}
                  onRemoveHelpfulVote={(reviewId) => onVoteReview(reviewId, 'not_helpful')}
                />
                {index < reviews.length - 1 && (
                  <div className="h-px bg-[#dad9e5]" />
                )}
              </div>
            ))}
      </div>

      {/* Load More */}
      {hasMoreReviews && (
        <div className="flex justify-center pt-4">
          <button
            onClick={onLoadMore}
            disabled={loadingMore}
            className="px-6 py-3 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-lg font-medium text-black transition-colors disabled:opacity-50"
          >
            {loadingMore ? 'Loading...' : 'Load More Reviews'}
          </button>
        </div>
      )}

      {/* Empty State */}
      {reviews.length === 0 && !showDesktopReviewForm && (
        <div className="flex items-center justify-center py-12">
          <p className="text-black/60">No reviews yet. Be the first to review!</p>
        </div>
      )}
    </div>
  );
}