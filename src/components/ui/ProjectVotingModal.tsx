'use client';

import { PenSquare } from 'lucide-react';

interface ProjectVotingModalProps {
  projectId: string;
  projectName: string;
  isBookmarked: boolean;
  onBookmarkClick: () => void;
  onWriteReviewClick: () => void;
  onNavigatePrevious?: () => void;
  onNavigateNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

export function ProjectVotingModal({ 
  projectId,
  projectName,
  isBookmarked,
  onBookmarkClick,
  onWriteReviewClick,
  onNavigatePrevious,
  onNavigateNext,
  hasPrevious = false,
  hasNext = false
}: ProjectVotingModalProps) {
  return (
    <div className="fixed bottom-4 left-0 right-0 z-50 desktop:hidden">
      <div className="max-w-[500px] mx-auto px-4">
        <div className="bg-white rounded-[28px] shadow-md px-8 h-14 flex items-center justify-between">
          {/* Left navigation - KEEP EXISTING */}
          <button
            onClick={onNavigatePrevious}
            disabled={!hasPrevious}
            className={`flex-shrink-0 ${
              hasPrevious
                ? ''
                : 'opacity-30'
            }`}
          >
            <img src="https://statics.bloomprotocol.ai/icon/hi-chevron-left.svg" alt="Previous" className="w-6 h-6" />
          </button>
          
          {/* Bookmark icon */}
          <button
            onClick={onBookmarkClick}
            className={`p-2 rounded-full transition-colors mx-4 ${
              isBookmarked 
                ? 'text-purple-600 bg-purple-50' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
          >
            <img 
              src={isBookmarked ? "https://statics.bloomprotocol.ai/icon/yoona-bookmarked.png" : "https://statics.bloomprotocol.ai/icon/yoona-bookmark.png"} 
              alt={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
              className={`w-5 h-5 ${isBookmarked ? 'opacity-100' : 'opacity-60'}`}
              style={isBookmarked ? { filter: 'brightness(0) saturate(100%) invert(35%) sepia(85%) saturate(4143%) hue-rotate(263deg) brightness(92%) contrast(96%)' } : {}}
            />
          </button>
          
          {/* Project name display - centered */}
          <div className="text-gray-600 font-medium text-center flex-1 px-2 truncate">
            {projectName}
          </div>
          
          {/* Write review icon */}
          <button
            onClick={onWriteReviewClick}
            className="p-2 rounded-full text-gray-600 hover:bg-gray-100 transition-colors mx-4"
            aria-label="Write review"
          >
            <PenSquare className="w-5 h-5" />
          </button>
          
          {/* Right navigation - KEEP EXISTING */}
          <button
            onClick={onNavigateNext}
            disabled={!hasNext}
            className={`flex-shrink-0 ${
              hasNext
                ? ''
                : 'opacity-30'
            }`}
          >
            <img src="https://statics.bloomprotocol.ai/icon/hi-chevron-right.svg" alt="Next" className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}