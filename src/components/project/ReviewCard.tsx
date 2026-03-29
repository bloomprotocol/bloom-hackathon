'use client';

import { useState } from 'react';
import { logger } from '@/lib/utils/logger';

interface ReviewCardProps {
  review: {
    id: string;
    content: string;
    user: {
      name: string;
      uid: number;
    };
    createdAt: string;
    helpfulCount: number;
    userHelpfulVote?: boolean;
    isBuilder?: boolean;
    replies?: Array<{
      id: string;
      content: string;
      user: {
        name: string;
        uid: number;
      };
      createdAt: string;
      helpfulCount: number;
      userHelpfulVote?: boolean;
      isBuilder?: boolean;
    }>;
  };
  projectBuilderId?: number;
  onReply: (reviewId: string, content: string) => void;
  onCreateReply?: (content: string, parentId: string) => Promise<void>;
  onHelpfulVote: (reviewId: string) => void;
  onRemoveHelpfulVote: (reviewId: string) => void;
}

// Simple date formatting function
function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 604800)}w ago`;
  return `${Math.floor(seconds / 2592000)}mo ago`;
}

export function ReviewCard({ 
  review, 
  projectBuilderId,
  onReply, 
  onCreateReply,
  onHelpfulVote,
  onRemoveHelpfulVote 
}: ReviewCardProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State for nested reply forms (for replies to replies)
  const [showNestedReplyForms, setShowNestedReplyForms] = useState<Record<string, boolean>>({});
  const [nestedReplyContents, setNestedReplyContents] = useState<Record<string, string>>({});
  const [nestedSubmitting, setNestedSubmitting] = useState<Record<string, boolean>>({});

  const isBuilder = review.user.uid === projectBuilderId;

  // Function to collect all replies recursively and flatten them
  const collectAllReplies = (replies: any[] | undefined): any[] => {
    if (!replies || replies.length === 0) return [];
    
    const allReplies: any[] = [];
    
    const processReply = (reply: any) => {
      allReplies.push(reply);
      if (reply.replies && reply.replies.length > 0) {
        reply.replies.forEach(processReply);
      }
    };
    
    replies.forEach(processReply);
    return allReplies;
  };

  // Get all flattened replies
  const flattenedReplies = collectAllReplies(review.replies);

  const handleReplySubmit = async () => {
    if (!replyContent.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      if (onCreateReply) {
        await onCreateReply(replyContent, review.id);
      } else {
        // Fallback to the old method (opens modal)
        onReply(review.id, replyContent);
      }
      setReplyContent('');
      setShowReplyForm(false);
    } catch (error) {
      logger.error('Failed to submit reply', { error });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleHelpfulClick = () => {
    if (review.helpfulCount > 0) {
      onRemoveHelpfulVote(review.id);
    } else {
      onHelpfulVote(review.id);
    }
  };

  const handleNestedReplySubmit = async (replyId: string) => {
    const content = nestedReplyContents[replyId];
    if (!content?.trim() || nestedSubmitting[replyId]) return;
    
    logger.debug('ReviewCard: Submitting nested reply', {
      replyId,
      content: content.substring(0, 30),
      replyIdType: typeof replyId,
      replyIdLength: replyId?.length
    });
    
    setNestedSubmitting(prev => ({ ...prev, [replyId]: true }));
    try {
      if (onCreateReply) {
        // Always reply to the main review to keep all replies at level 2
        await onCreateReply(content, review.id);
      } else {
        // Fallback to the old method (opens modal)
        onReply(review.id, content);
      }
      setNestedReplyContents(prev => ({ ...prev, [replyId]: '' }));
      setShowNestedReplyForms(prev => ({ ...prev, [replyId]: false }));
    } catch (error) {
      logger.error('Failed to submit nested reply', { error });
    } finally {
      setNestedSubmitting(prev => ({ ...prev, [replyId]: false }));
    }
  };

  const toggleNestedReplyForm = (replyId: string) => {
    setShowNestedReplyForms(prev => ({ ...prev, [replyId]: !prev[replyId] }));
    if (showNestedReplyForms[replyId]) {
      setNestedReplyContents(prev => ({ ...prev, [replyId]: '' }));
    }
  };

  return (
    <div className="py-5">
      <div className="flex gap-2">
        {/* Profile Image */}
        <div className="size-10 rounded-[32px] bg-gradient-to-br from-blue-400 to-purple-600 shrink-0" />
        
        <div className="flex-1 flex flex-col gap-3">
          {/* Header */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-[#393f49] text-[14px] font-semibold leading-[1.2]">
                  {review.user.name || (isBuilder ? 'Builder' : `User ${review.user.uid}`)}
                </span>
                {isBuilder && (
                  <div className="bg-[rgba(247,89,255,0.1)] px-2.5 py-1 rounded-[32px]">
                    <span className="text-[#eb7cff] text-[12px] font-medium leading-[1.4]">Builder</span>
                  </div>
                )}
              </div>
              <span className="text-[#696f8c] text-[12px] font-normal leading-[1.4]">
                {formatTimeAgo(review.createdAt)}
              </span>
            </div>
            <p className="text-[#393f49] text-[14px] font-normal leading-[1.4] tracking-[-0.28px]">
              {review.content}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            {/* Helpful Button */}
            <button
              onClick={handleHelpfulClick}
              className="bg-white rounded-[27px] h-7 px-3 py-2 flex items-center justify-center gap-1 hover:opacity-90 transition-opacity"
            >
              <img 
                src="https://statics.bloomprotocol.ai/icon/yoona-helpful.png"
                alt="helpful" 
                className={`w-4 h-4 ${review.helpfulCount > 0 ? 'brightness-0 saturate-100' : ''}`}
                style={review.helpfulCount > 0 ? { filter: 'brightness(0) saturate(100%) invert(65%) sepia(89%) saturate(445%) hue-rotate(54deg) brightness(94%) contrast(87%)' } : {}}
              />
              <span className={`text-[12px] font-normal leading-none ${review.helpfulCount > 0 ? 'text-[#71CA41]' : 'text-[#393F49]'}`}>
                Helpful
              </span>
              {review.helpfulCount > 0 && (
                <span className={`text-[12px] font-normal leading-none ml-1 ${review.helpfulCount > 0 ? 'text-[#71CA41]' : 'text-[#393F49]'}`}>
                  {review.helpfulCount}
                </span>
              )}
            </button>
            
            {/* Reply Button */}
            <button
              onClick={() => {
                // 移動端和桌面端都顯示內嵌表單
                setShowReplyForm(!showReplyForm);
                // 同時調用 onReply 來設置回覆對象
                if (showReplyForm) {
                  onReply('', '');
                } else {
                  onReply(review.id, review.content);
                }
              }}
              className="btn-secondary-action flex items-center justify-center"
            >
              <span className="text-[#393f49] text-[12px] font-semibold leading-none">Reply</span>
            </button>
          </div>

          {/* Reply Form */}
          {showReplyForm && (
            <div className="bg-[rgba(255,255,255,0.6)] border border-[#dad9e5] rounded-xl p-3">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Enter your reply"
                className="w-full bg-transparent text-[#393f49] text-[14px] leading-[1.4] tracking-[-0.28px] placeholder-[#696f8c] resize-none outline-none"
                rows={2}
                maxLength={500}
              />
              <div className="flex justify-end gap-3 mt-3">
                <button
                  onClick={() => {
                    setShowReplyForm(false);
                    setReplyContent('');
                  }}
                  className="btn-secondary-action w-20 flex items-center justify-center"
                >
                  <span className="text-[#393f49] text-[12px] font-semibold leading-none">Cancel</span>
                </button>
                <button
                  onClick={handleReplySubmit}
                  disabled={!replyContent.trim() || isSubmitting}
                  className="btn-primary-action w-20 flex items-center justify-center"
                >
                  <span className="text-[#393f49] text-[12px] font-semibold leading-none">
                    {isSubmitting ? 'Send...' : 'Send'}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Replies */}
      {flattenedReplies.length > 0 && (
        <div className="pl-12 pt-4">
          {flattenedReplies.map((reply) => {
            const isReplyBuilder = reply.user.uid === projectBuilderId;
            return (
              <div key={reply.id} className="bg-[#f6f6f6] rounded-xl p-3 mb-2">
                <div className="flex gap-2">
                  {/* Smaller Profile Image */}
                  <div className="size-6 rounded-[32px] bg-gradient-to-br from-green-400 to-blue-600 shrink-0" />
                  
                  <div className="flex-1 flex flex-col gap-2">
                    {/* Reply Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="text-[#393f49] text-[14px] font-semibold leading-[1.2]">
                          {reply.user.name || (isReplyBuilder ? 'Builder' : `User ${reply.user.uid}`)}
                        </span>
                        {isReplyBuilder && (
                          <div className="bg-[rgba(247,89,255,0.1)] px-2.5 py-1 rounded-[32px]">
                            <span className="text-[#eb7cff] text-[12px] font-medium leading-[1.4]">Builder</span>
                          </div>
                        )}
                      </div>
                      <span className="text-[#696f8c] text-[12px] font-normal leading-[1.4]">
                        {formatTimeAgo(reply.createdAt || reply.created_at)}
                      </span>
                    </div>
                    <p className="text-[#393f49] text-[14px] font-normal leading-[1.4] tracking-[-0.28px]">
                      {reply.content}
                    </p>
                    
                    {/* Reply Action Buttons */}
                    <div className="flex justify-end mt-2 gap-3">
                      {/* Helpful Button for Reply */}
                      <button
                        onClick={() => {
                          if (reply.helpfulCount > 0) {
                            onRemoveHelpfulVote(reply.id);
                          } else {
                            onHelpfulVote(reply.id);
                          }
                        }}
                        className="bg-white rounded-[27px] h-7 px-3 py-2 flex items-center justify-center gap-1 hover:opacity-90 transition-opacity"
                      >
                        <img 
                          src="https://statics.bloomprotocol.ai/icon/yoona-helpful.png"
                          alt="helpful" 
                          className={`w-4 h-4 ${reply.helpfulCount > 0 ? 'brightness-0 saturate-100' : ''}`}
                          style={reply.helpfulCount > 0 ? { filter: 'brightness(0) saturate(100%) invert(65%) sepia(89%) saturate(445%) hue-rotate(54deg) brightness(94%) contrast(87%)' } : {}}
                        />
                        <span className={`text-[12px] font-normal leading-none ${reply.helpfulCount > 0 ? 'text-[#71CA41]' : 'text-[#393F49]'}`}>
                          Helpful
                        </span>
                        {reply.helpfulCount > 0 && (
                          <span className={`text-[12px] font-normal leading-none ml-1 ${reply.helpfulCount > 0 ? 'text-[#71CA41]' : 'text-[#393F49]'}`}>
                            {reply.helpfulCount}
                          </span>
                        )}
                      </button>
                      
                      {/* Reply Button */}
                      <button
                        onClick={() => {
                          // 移動端和桌面端都顯示內嵌表單
                          toggleNestedReplyForm(reply.id);
                          // 同時調用 onReply 來設置回覆對象
                          if (showNestedReplyForms[reply.id]) {
                            onReply('', '');
                          } else {
                            onReply(reply.id, reply.content);
                          }
                        }}
                        className="bg-white border-2 border-[#dad9e5] rounded-[27px] h-7 px-3 py-2 shadow-[0px_3px_0px_-1px_#393f49] flex items-center justify-center hover:opacity-90 transition-opacity"
                      >
                        <span className="text-[#393f49] text-[12px] font-semibold leading-none">Reply</span>
                      </button>
                    </div>

                    {/* Nested Reply Form */}
                    {showNestedReplyForms[reply.id] && (
                      <div className="mt-3 bg-[rgba(255,255,255,0.6)] border border-[#dad9e5] rounded-xl p-3">
                        <textarea
                          value={nestedReplyContents[reply.id] || ''}
                          onChange={(e) => setNestedReplyContents(prev => ({ 
                            ...prev, 
                            [reply.id]: e.target.value 
                          }))}
                          placeholder="Enter your reply"
                          className="w-full bg-transparent text-[#393f49] text-[14px] leading-[1.4] tracking-[-0.28px] placeholder-[#696f8c] resize-none outline-none"
                          rows={2}
                          maxLength={500}
                        />
                        <div className="flex justify-end gap-3 mt-3">
                          <button
                            onClick={() => toggleNestedReplyForm(reply.id)}
                            className="bg-white border-2 border-[#dad9e5] rounded-[27px] h-7 w-20 shadow-[0px_3px_0px_-1px_#393f49] flex items-center justify-center hover:opacity-90 transition-opacity"
                          >
                            <span className="text-[#393f49] text-[12px] font-semibold leading-none">Cancel</span>
                          </button>
                          <button
                            onClick={() => handleNestedReplySubmit(reply.id)}
                            disabled={!(nestedReplyContents[reply.id]?.trim()) || nestedSubmitting[reply.id]}
                            className="btn-primary-action w-20 flex items-center justify-center"
                          >
                            <span className="text-[#393f49] text-[12px] font-semibold leading-none">
                              {nestedSubmitting[reply.id] ? 'Send...' : 'Send'}
                            </span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}