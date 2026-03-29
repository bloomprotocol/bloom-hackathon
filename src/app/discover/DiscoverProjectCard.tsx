'use client';

import { useState, useRef } from 'react';
import { useAuthenticatedBookmark } from '@/hooks/useAuthenticatedBookmark';
import { BloomIcon, LightningIcon } from './icons';

interface Product {
  projectId: string;
  name: string;
  tagline: string;
  thumbnailUrl: string;
  website: string;
  votesCount: number;
  pledgeStats?: {
    backerCount: number;
    totalPower: number;
    trending: boolean;
  };
}

interface PledgeInfo {
  pledgeId: string;
  pledgePower: number;
}

interface DiscoverProjectCardProps {
  product: Product;
  index: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  pledgeAmount: string;
  onPledgeAmountChange: (value: string) => void;
  selectedQuickAmount: number;
  onQuickAmountSelect: (amount: number) => void;
  pledgeMessage: string;
  onPledgeMessageChange: (value: string) => void;
  pledgeInfo?: PledgeInfo;
  pledgeError: string | null;
  onPledgeSubmit: (projectId: string, e?: React.MouseEvent) => void;
  onCancelPledge: (projectId: string, e?: React.MouseEvent) => void;
  isPledgePending: boolean;
  isCancelPending: boolean;
}

export default function DiscoverProjectCard({
  product,
  index,
  isExpanded,
  onToggleExpand,
  pledgeAmount,
  onPledgeAmountChange,
  selectedQuickAmount,
  onQuickAmountSelect,
  pledgeMessage,
  onPledgeMessageChange,
  pledgeInfo,
  pledgeError,
  onPledgeSubmit,
  onCancelPledge,
  isPledgePending,
  isCancelPending,
}: DiscoverProjectCardProps) {
  const { isSaved: isBookmarked, handleBookmarkClick } = useAuthenticatedBookmark({
    projectId: product.projectId,
    projectName: product.name,
  });

  const [showScoreTooltip, setShowScoreTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  // Calculate tooltip position based on button element
  const updateTooltipPosition = (buttonElement: HTMLElement) => {
    const rect = buttonElement.getBoundingClientRect();
    setTooltipPosition({
      top: rect.bottom + 6, // 6px below the button
      left: rect.left + rect.width / 2, // center of the button
    });
  };

  const handleShowTooltip = (e: React.MouseEvent<HTMLButtonElement>) => {
    updateTooltipPosition(e.currentTarget);
    setShowScoreTooltip(true);
  };

  const handleToggleTooltip = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    updateTooltipPosition(e.currentTarget);
    setShowScoreTooltip(!showScoreTooltip);
  };

  // Calculate Bloom Score
  // Formula: (PH Votes × 0.6) + (Backers × 10) + (Pledge Power / 40)
  const calculateBloomScore = (): number => {
    const phVotes = product.votesCount || 0;
    const backers = product.pledgeStats?.backerCount || 0;
    const pledgePower = product.pledgeStats?.totalPower || 0;

    const score = (phVotes * 0.6) + (backers * 10) + (pledgePower / 40);
    return Math.ceil(score); // Round up
  };

  const bloomScore = calculateBloomScore();

  // Helper function to format backer text
  const getBackerText = () => {
    const count = product.pledgeStats?.backerCount || 0;
    if (count < 3) return null;
    if (count < 15) return `${count} early supporters`;
    return `${count}+ supporters`;
  };

  return (
    <div className="common-discover-card-style">
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        {/* Logo and Project Info */}
        <div className="flex items-center gap-4 desktop:flex-1">
          <div
            className="size-12 rounded-full bg-center bg-no-repeat bg-cover shrink-0"
            style={{ backgroundImage: `url('${product.thumbnailUrl}')` }}
          />
          {/* Desktop: show info inline */}
          <div className="hidden desktop:flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <p className="font-serif font-bold text-base text-[#393f49] leading-none">
                {product.name}
              </p>

              {/* Bloom Score Badge */}
              <div className="relative">
                <button
                  onMouseEnter={handleShowTooltip}
                  onMouseLeave={() => setShowScoreTooltip(false)}
                  onClick={handleToggleTooltip}
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-700 rounded-md text-xs font-['Outfit'] font-medium hover:bg-purple-100 transition-colors"
                >
                  <BloomIcon size={16} className="text-purple-600" />
                  <span>{bloomScore}</span>
                </button>
              </div>
            </div>
            <p className="font-['Outfit'] text-xs text-[#696f8c] leading-[1.4]">
              {product.tagline}
            </p>
            {/* Pledge Stats - Phase 1 */}
            {getBackerText() && (
              <div className="flex items-center gap-1.5 text-xs text-[#696f8c]">
                <span>👥</span>
                <span className="font-['Outfit']">{getBackerText()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {/* Website Link */}
          <a
            href={product.website}
            target="_blank"
            rel="noopener noreferrer"
            className="size-8 rounded-full bg-[#f6f6f6] flex items-center justify-center"
          >
            <img
              src="https://statics.bloomprotocol.ai/icon/discover-website.png"
              alt="Website"
              className="size-4"
            />
          </a>

          {/* Bookmark */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleBookmarkClick(e);
            }}
            className="size-8 rounded-full bg-[#f6f6f6] flex items-center justify-center hover:opacity-90 transition-opacity"
          >
            <img
              src={isBookmarked
                ? "https://statics.bloomprotocol.ai/icon/favorite_solid.png"
                : "https://statics.bloomprotocol.ai/icon/favorite_stroke.png"
              }
              alt="Bookmark"
              className="size-4"
            />
          </button>

          {/* Pledge Toggle */}
          <div className="flex items-center gap-2">
            {pledgeInfo ? (
              <>
                <button
                  onClick={onToggleExpand}
                  className="flex items-center gap-1 hover:opacity-80 transition-opacity"
                >
                  <LightningIcon size={16} className="text-[#71ca41]" />
                  <span className="font-['Outfit'] font-semibold text-sm text-[#71ca41]">
                    {pledgeInfo.pledgePower} Pledged
                  </span>
                  <svg className="size-5" viewBox="0 0 20 20" fill="#71ca41">
                    <path d={isExpanded ? "M10 7.5L14 12.5H6L10 7.5Z" : "M10 12.5L14 7.5H6L10 12.5Z"} />
                  </svg>
                </button>
                <button
                    onClick={(e) => onCancelPledge(product.projectId, e)}
                    disabled={isCancelPending}
                    className="size-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                    title="Cancel pledge"
                  >
                    {isCancelPending ? (
                      <span className="text-xs text-gray-400">...</span>
                    ) : (
                      <svg className="size-3 text-gray-500" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M2 2L10 10M10 2L2 10" />
                      </svg>
                    )}
                  </button>
              </>
            ) : (
              <button
                onClick={onToggleExpand}
                className="flex items-center gap-1 hover:opacity-80 transition-opacity"
              >
                <span className="font-['Outfit'] font-semibold text-sm text-[#a59af3]">
                  Pledge
                </span>
                <svg className="size-5" viewBox="0 0 20 20" fill="#a59af3">
                  <path d={isExpanded ? "M10 7.5L14 12.5H6L10 7.5Z" : "M10 12.5L14 7.5H6L10 12.5Z"} />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile: Project Info */}
      <div className="desktop:hidden flex flex-col gap-1.5 w-full">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-serif font-bold text-base text-[#393f49] leading-none">
            {product.name}
          </p>

          {/* Bloom Score Badge */}
          <div className="relative">
            <button
              onMouseEnter={handleShowTooltip}
              onMouseLeave={() => setShowScoreTooltip(false)}
              onClick={handleToggleTooltip}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-700 rounded-md text-xs font-['Outfit'] font-medium hover:bg-purple-100 transition-colors"
            >
              <BloomIcon size={14} className="text-purple-600" />
              <span>{bloomScore}</span>
            </button>
          </div>
        </div>
        <p className="font-['Outfit'] text-xs text-[#696f8c] leading-[1.4]">
          {product.tagline}
        </p>
        {/* Pledge Stats - Phase 1 */}
        {getBackerText() && (
          <div className="flex items-center gap-1.5 text-xs text-[#696f8c]">
            <span>👥</span>
            <span className="font-['Outfit']">{getBackerText()}</span>
          </div>
        )}
      </div>

      {/* Pledge Form - Expandable */}
      {isExpanded && (
        <div className="w-full">
          <div className="bg-white/50 rounded-xl shadow-[0px_0px_12px_0px_rgba(0,0,0,0.08)] p-3">
            {/* Pledge Input or Pledged State */}
            <div className="flex flex-col gap-3 w-full">
              {pledgeInfo ? (
                /* Pledged State */
                <>
                  <div className="relative bg-[#f0fdf4] rounded-xl border border-[#71ca41]/30 p-3 flex items-center gap-3 overflow-hidden">
                    <span className="font-['Outfit'] font-semibold text-base text-[#393f49]">
                      {pledgeInfo.pledgePower}
                    </span>
                    <div className="shrink-0 flex items-center gap-1">
                      <LightningIcon size={18} className="text-[#71ca41]" />
                      <span className="font-['Outfit'] text-sm text-[#393f49]">Power</span>
                    </div>
                    <button
                        onClick={(e) => onCancelPledge(product.projectId, e)}
                        disabled={isCancelPending}
                        className="shrink-0 h-7 px-4 rounded-full font-['Outfit'] font-semibold text-xs border border-[#e5e5e5] bg-white text-[#696f8c] hover:bg-gray-50 transition-colors"
                      >
                        {isCancelPending ? 'Canceling...' : 'Cancel'}
                      </button>
                  </div>
                  <p className="font-['Outfit'] text-xs text-[#696f8c]">
                    Your Pledge Power will be refunded if you cancel.
                  </p>
                </>
              ) : (
                /* Input State */
                <>
                  <div className="relative bg-white/60 rounded-xl border border-[#dad9e5] p-3 flex items-center gap-3 overflow-hidden">
                    <input
                      type="text"
                      value={pledgeAmount}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^\d*\.?\d*$/.test(value) || value === '') {
                          onPledgeAmountChange(value);
                        }
                      }}
                      className="min-w-0 flex-1 font-['Outfit'] font-semibold text-base text-[#393f49] bg-transparent outline-none"
                      placeholder="0.00"
                    />
                    <div className="shrink-0 flex items-center gap-1">
                      <LightningIcon size={18} className="text-[#71ca41]" />
                      <span className="font-['Outfit'] text-sm text-[#393f49]">Power</span>
                    </div>
                    <button
                      onClick={(e) => onPledgeSubmit(product.projectId, e)}
                      disabled={isPledgePending}
                      className={`shrink-0 h-7 px-4 rounded-full font-['Outfit'] font-semibold text-xs transition-colors shadow-[0px_1px_1px_0.05px_rgba(24,24,27,0.24)] ${pledgeError === product.projectId ? 'bg-red-500 text-white'
                          : isPledgePending ? 'bg-gray-400 text-white'
                            : 'bg-[#eb7cff] text-white'
                        }`}
                    >
                      {pledgeError === product.projectId ? 'Error!'
                        : isPledgePending ? 'Loading...'
                          : 'Submit'}
                    </button>
                  </div>
                  <div className="flex gap-3">
                    {[50, 100, 200].map((amount) => (
                      <button
                        key={amount}
                        onClick={() => onQuickAmountSelect(amount)}
                        className={`flex-1 py-2 rounded-xl border border-[#dad9e5] font-['Outfit'] text-sm text-[#393f49] ${selectedQuickAmount === amount ? 'bg-[#e7e6f2]' : 'bg-white/60'
                          }`}
                      >
                        {amount}
                      </button>
                    ))}
                  </div>

                  {/* Message textarea */}
                  <div className="mt-3">
                    <label className="font-['Outfit'] text-xs text-[#696f8c] mb-1.5 block flex items-center gap-1">
                      <span>💬</span>
                      <span>Message to the team (optional)</span>
                    </label>
                    <textarea
                      value={pledgeMessage}
                      onChange={(e) => onPledgeMessageChange(e.target.value)}
                      placeholder="Why are you supporting this project?"
                      maxLength={200}
                      rows={2}
                      className="w-full px-3 py-2 rounded-lg border border-[#dad9e5] font-['Outfit'] text-sm text-[#393f49] placeholder-[#9ca3af] focus:border-[#a59af3] focus:outline-none resize-none bg-white/60"
                    />
                    <div className="text-right text-xs text-[#9ca3af] mt-1">
                      {pledgeMessage.length}/200
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Global Tooltip */}
      {showScoreTooltip && (
        <div
          className="fixed w-56 p-2.5 rounded-lg shadow-lg z-[100] backdrop-blur-md bg-purple-50/90 border border-purple-100 -translate-x-1/2"
          style={{
            top: `${tooltipPosition.top}px`,
            left: `${tooltipPosition.left}px`
          }}
        >
          <p className="font-['Outfit'] font-semibold text-xs text-purple-900 mb-1">
            Bloom Score
          </p>
          <p className="font-['Outfit'] text-[11px] text-purple-700 leading-relaxed">
            Combines votes, pledges, and power to show real community support.
          </p>
        </div>
      )}
    </div>
  );
}
