"use client";

import type { ProjectStats, User } from "../types";

interface ProjectFooterActionsProps {
  stats: ProjectStats | null;
  user: User | null;
  activeTab: string;
  showDesktopReviewForm: boolean;
  onSetActiveTab: (tab: string) => void;
  onSetShowDesktopReviewForm: (show: boolean) => void;
  onSetShowReviewsView: (show: boolean) => void;
  onWriteReviewClick: () => void;
}

export function ProjectFooterActions({
  stats,
  user,
  activeTab,
  showDesktopReviewForm,
  onSetActiveTab,
  onSetShowDesktopReviewForm,
  onSetShowReviewsView,
  onWriteReviewClick,
}: ProjectFooterActionsProps) {
  return (
    <div className="backdrop-blur backdrop-filter bg-[rgba(255,255,255,0.3)] desktop:absolute desktop:bottom-0 desktop:left-0 desktop:right-0 desktop:rounded-b-2xl shadow-[0px_0px_12px_0px_rgba(0,0,0,0.04)]">
      <div className="flex flex-row items-center justify-end px-6 py-4">
        {/* open review & write review */}
        <div className="flex flex-row gap-3 items-center">
          <button
            onClick={() => {
              // Show reviews view instead of scrolling
              onSetShowReviewsView(true);
              onSetActiveTab("reviews");
            }}
            className={`${
              activeTab === "reviews" ? "bg-[#f6f6f6]" : ""
            } relative rounded-[30px] shrink-0 cursor-pointer hover:opacity-90 transition-opacity`}
          >
            <div className="absolute border border-[#8478e0] border-solid inset-0 pointer-events-none rounded-[30px]" />
            <div className="flex flex-row items-center justify-center relative size-full">
              <div className="box-border content-stretch flex flex-row gap-1 items-center justify-center pl-2.5 pr-3 py-2 relative">
                <div className="overflow-clip relative shrink-0 size-5">
                  <img
                    src="https://statics.bloomprotocol.ai/icon/yoona_comment-fill.png"
                    alt="Comments"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="font-medium leading-[0] relative shrink-0 text-[#393f49] text-[14px] text-center text-nowrap tracking-[-0.28px]">
                  <p className="block leading-[1.4] whitespace-pre">
                    {stats?.reviewCount || 0}
                  </p>
                </div>
              </div>
            </div>
          </button>
          {user && (
            <button
              onClick={() => {
                // Show reviews view first
                onSetShowReviewsView(true);
                onSetActiveTab("reviews");
                
                // Then handle write review
                if (window.innerWidth < 1280) {
                  onWriteReviewClick();
                } else {
                  onSetShowDesktopReviewForm(true);
                }
              }}
              className="bg-[#8478e0] relative rounded-[30px] shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
            >
              <div className="flex flex-row items-center justify-center relative size-full">
                <div className="box-border content-stretch flex flex-row gap-1 items-center justify-center px-3 py-2 relative">
                  <div className="font-medium leading-[0] relative shrink-0 text-white text-[14px] text-center text-nowrap tracking-[-0.28px]">
                    <p className="block leading-[1.4] whitespace-pre">
                      Write Review
                    </p>
                  </div>
                </div>
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
