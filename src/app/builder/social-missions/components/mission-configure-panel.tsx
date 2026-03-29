'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useBuilderMission } from '../contexts/builder-mission-context';
import { MS_PER_DAY, MS_PER_HOUR, MS_PER_MINUTE, MS_PER_SECOND } from '../constants';
import { logger } from '@/lib/utils/logger';
import { builderService } from '@/lib/api/services/builderService';
import { Lock, Pencil } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// Chain options for selection with supported tokens
const CHAIN_OPTIONS = [
  { id: 8453, name: 'Base', tokens: ['USDC'] as const, defaultToken: 'USDC' as const },
  { id: 56, name: 'BSC', tokens: ['USDT', 'USDC'] as const, defaultToken: 'USDT' as const },
  { id: 'solana', name: 'Solana', tokens: ['USDC'] as const, defaultToken: 'USDC' as const },
] as const;

// Helper to get supported tokens for a chain
const getChainTokens = (chainId: number | string) => {
  const chain = CHAIN_OPTIONS.find(c => String(c.id) === String(chainId));
  return chain?.tokens || ['USDC'];
};

// Edit Title Modal for mobile
function EditTitleModal({
  isOpen,
  onClose,
  currentTitle,
  onSave,
  isSubmitting,
}: {
  isOpen: boolean;
  onClose: () => void;
  currentTitle: string;
  onSave: (title: string) => void;
  isSubmitting: boolean;
}) {
  const [title, setTitle] = useState(currentTitle);

  useEffect(() => {
    if (isOpen) {
      setTitle(currentTitle);
    }
  }, [isOpen, currentTitle]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl p-6 w-[90%] max-w-md shadow-xl">
        <h3 className="text-[18px] font-bold text-[#393f49] mb-4" style={{ fontFamily: 'Times, serif' }}>
          Edit Mission Title
        </h3>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter mission title"
          maxLength={200}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8e38ff] focus:border-[#8e38ff] text-[14px]"
          style={{ fontFamily: 'Outfit, sans-serif' }}
          autoFocus
        />
        <div className="text-[12px] text-[#696f8c] mt-1 text-right">
          {title.length}/200
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-[14px] text-[#393f49] hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(title)}
            disabled={!title.trim() || isSubmitting}
            className="px-4 py-2 text-[14px] text-white bg-[#8e38ff] rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Date Picker Modal for customize duration
function DatePickerModal({
  isOpen,
  onClose,
  currentEndTime,
  onSave,
  isSubmitting,
}: {
  isOpen: boolean;
  onClose: () => void;
  currentEndTime: string | undefined;
  onSave: (date: Date) => void;
  isSubmitting: boolean;
}) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      const current = currentEndTime ? new Date(currentEndTime) : now;
      setSelectedDate(current > now ? current : now);
    }
  }, [isOpen, currentEndTime]);

  if (!isOpen) return null;

  const now = new Date();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl p-6 w-[90%] max-w-md shadow-xl">
        <h3 className="text-[18px] font-bold text-[#393f49] mb-4" style={{ fontFamily: 'Times, serif' }}>
          Set End Time
        </h3>
        <div className="flex justify-center">
          <DatePicker
            selected={selectedDate}
            onChange={(date: Date | null) => date && setSelectedDate(date)}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={15}
            dateFormat="MMMM d, yyyy h:mm aa"
            minDate={now}
            inline
            className="w-full"
          />
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-[14px] text-[#393f49] hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(selectedDate)}
            disabled={isSubmitting || selectedDate <= new Date()}
            className="px-4 py-2 text-[14px] text-white bg-[#8e38ff] rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MissionConfigurePanel() {
  const {
    mission,
    isMobile,
    isSubmitting,
    postId,
    handleUpdateTitle,
    handleUpdateDuration,
    rewardSettings,
    selectedStablecoin,
    setSelectedStablecoin,
    stablecoinAmount,
    setStablecoinAmount,
    selectedChain,
    setSelectedChain,
    isRewardLocked,
    handleSaveStablecoinReward,
    autoDistributeDropsOnApprove,
    setAutoDistributeDropsOnApprove,
    isLoadingApprovalSettings,
  } = useBuilderMission();

  // Title editing state
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitleValue, setEditTitleValue] = useState('');
  const [showTitleModal, setShowTitleModal] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Duration state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Reward editing state
  const [isEditingStablecoin, setIsEditingStablecoin] = useState(false);

  const formatTimeUnit = (value: number) => String(value).padStart(2, '0');

  // Countdown timer
  useEffect(() => {
    if (!mission?.endTime) return;

    const calculateTimeLeft = () => {
      const end = new Date(mission.endTime).getTime();
      const now = new Date().getTime();
      const diff = end - now;

      if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

      return {
        days: Math.floor(diff / MS_PER_DAY),
        hours: Math.floor((diff % MS_PER_DAY) / MS_PER_HOUR),
        minutes: Math.floor((diff % MS_PER_HOUR) / MS_PER_MINUTE),
        seconds: Math.floor((diff % MS_PER_MINUTE) / MS_PER_SECOND),
      };
    };

    setCountdown(calculateTimeLeft());
    const timer = setInterval(() => setCountdown(calculateTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, [mission?.endTime]);

  // Title editing handlers
  const handleTitleEditClick = () => {
    if (isMobile) {
      setShowTitleModal(true);
    } else {
      setEditTitleValue(mission?.title || '');
      setIsEditingTitle(true);
      setTimeout(() => titleInputRef.current?.focus(), 0);
    }
  };

  const handleSaveTitleInline = async () => {
    if (!editTitleValue.trim()) return;
    try {
      await handleUpdateTitle(editTitleValue.trim());
      setIsEditingTitle(false);
    } catch {
      // Error handled in context
    }
  };

  const handleSaveTitleModal = async (title: string) => {
    if (!title.trim()) return;
    try {
      await handleUpdateTitle(title.trim());
      setShowTitleModal(false);
    } catch {
      // Error handled in context
    }
  };

  const handleCancelTitleEdit = () => {
    setIsEditingTitle(false);
    setEditTitleValue('');
  };

  // Duration handlers
  const handleExtendDuration = async (days: number) => {
    if (!mission?.endTime) {
      logger.error('Mission end time not available', {});
      return;
    }
    const currentEndTime = new Date(mission.endTime);
    const newEndTime = new Date(currentEndTime);
    newEndTime.setDate(newEndTime.getDate() + days);

    try {
      await handleUpdateDuration(newEndTime.toISOString());
    } catch {
      // Error handled in context
    }
  };

  const handleSaveCustomDuration = async (date: Date) => {
    try {
      await handleUpdateDuration(date.toISOString());
      setShowDatePicker(false);
    } catch {
      // Error handled in context
    }
  };

  // Handle distribute drops toggle change
  const handleDistributeDropsToggle = useCallback(async () => {
    if (!postId || isLoadingApprovalSettings) return;
    const newValue = !autoDistributeDropsOnApprove;
    setAutoDistributeDropsOnApprove(newValue);
    try {
      const response = await builderService.updateApprovalSettings(postId, newValue);
      if (!response.success) {
        setAutoDistributeDropsOnApprove(!newValue);
        logger.error('Failed to update approval settings', {});
      }
    } catch (error) {
      setAutoDistributeDropsOnApprove(!newValue);
      logger.error('Failed to update approval settings', { error });
    }
  }, [postId, autoDistributeDropsOnApprove, isLoadingApprovalSettings, setAutoDistributeDropsOnApprove]);

  const durationPillStyle = 'bg-[#f0eefb] text-[#8478e0] text-[11px] font-semibold px-2.5 py-1 rounded-full hover:bg-[#e7e4f8] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';

  return (
    <div className="flex flex-col gap-6" style={{ fontFamily: 'Outfit, sans-serif' }}>
      {/* ===== TITLE SECTION ===== */}
      <div>
        <div className="text-[14px] font-medium text-[#393f49] mb-3">
          Title
        </div>
        {isEditingTitle ? (
          <div className="flex items-center gap-2">
            <input
              ref={titleInputRef}
              type="text"
              value={editTitleValue}
              onChange={(e) => setEditTitleValue(e.target.value)}
              maxLength={200}
              className="flex-1 text-[16px] text-[#393f49] px-3 py-2 border border-[#8e38ff] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8e38ff]"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveTitleInline();
                if (e.key === 'Escape') handleCancelTitleEdit();
              }}
            />
            <button
              onClick={handleSaveTitleInline}
              disabled={!editTitleValue.trim() || isSubmitting}
              className="bg-[#8e38ff] rounded-[27px] h-8 px-4 flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              <span className="text-white text-[12px] font-semibold leading-none">
                {isSubmitting ? '...' : 'Save'}
              </span>
            </button>
            <button
              onClick={handleCancelTitleEdit}
              disabled={isSubmitting}
              className="bg-gray-200 rounded-[27px] h-8 px-4 flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-50 shrink-0"
            >
              <span className="text-[#393f49] text-[12px] font-semibold leading-none">Cancel</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 group">
            <span className="text-[16px] text-[#393f49]">
              {mission?.title || 'Mission'}
            </span>
            <button
              onClick={handleTitleEditClick}
              disabled={isSubmitting}
              className="opacity-40 desktop:opacity-0 desktop:group-hover:opacity-100 transition-opacity text-[#696f8c] hover:text-[#8478e0] disabled:opacity-50 shrink-0"
              title="Edit title"
            >
              <Pencil className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* ===== DURATION SECTION ===== */}
      <div>
        <div className="text-[14px] font-medium text-[#393f49] mb-3">
          Duration
        </div>
        <div className="flex flex-col desktop:flex-row desktop:items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[14px] text-[#696f8c] font-medium">
              Ends in
            </span>
            <div className="flex items-center gap-1.5">
              {[
                { value: countdown.days, unit: 'd' },
                { value: countdown.hours, unit: 'h' },
                { value: countdown.minutes, unit: 'm' },
              ].map((item, i) => (
                <div key={item.unit} className="flex items-center gap-1.5">
                  {i > 0 && <span className="text-[#c0bfcf] text-[16px] font-medium">:</span>}
                  <div className="bg-[#f0eefb] rounded-lg px-2 py-1.5 flex items-center gap-1 min-w-[40px] justify-center">
                    <span className="text-[#393f49] text-[16px] font-bold tabular-nums">
                      {formatTimeUnit(item.value)}
                    </span>
                    <span className="text-[#696f8c] text-[11px] font-medium">
                      {item.unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Duration quick-action pills */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleExtendDuration(3)}
              disabled={isSubmitting}
              className={durationPillStyle}
            >
              +3d
            </button>
            <button
              onClick={() => handleExtendDuration(7)}
              disabled={isSubmitting}
              className={durationPillStyle}
            >
              +7d
            </button>
            <button
              onClick={() => setShowDatePicker(true)}
              disabled={isSubmitting}
              className={durationPillStyle}
            >
              Set
            </button>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-[#e6e8ec]" />

      {/* ===== REWARD SECTION ===== */}
      <div>
        <div className="text-[14px] font-medium text-[#393f49] mb-3">
          Reward
        </div>

        {/* USDT/C Reward */}
        <div className="flex flex-col gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[14px] font-normal text-[#393f49]">
              USDT/C Reward
            </span>

            {/* State: Already set (not editing) */}
            {rewardSettings?.stablecoinReward && !isEditingStablecoin && (
              <>
                <span className="text-[13px] text-[#00C853] font-medium">
                  {CHAIN_OPTIONS.find(c => String(c.id) === String(rewardSettings.stablecoinReward?.chainId))?.name || 'Base'} &bull; {rewardSettings.stablecoinReward.amountPerSubmission} {rewardSettings.stablecoinReward.tokenSymbol}
                </span>
                {isRewardLocked ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[11px] font-medium">
                    <Lock className="w-3 h-3" />
                    Locked
                  </span>
                ) : (
                  <button
                    onClick={() => setIsEditingStablecoin(true)}
                    disabled={isSubmitting}
                    className="bg-[#e7e6f2] rounded-[27px] h-7 px-4 shadow-[0px_3px_0px_-1px_#393f49] flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    <span className="text-[#393f49] text-[12px] font-semibold leading-none">Modify</span>
                  </button>
                )}
              </>
            )}

            {/* Optional badge when not set */}
            {!rewardSettings?.stablecoinReward && (
              <span className="text-[10px] text-[#696f8c] bg-gray-100 px-2 py-0.5 rounded-full font-medium">
                Optional
              </span>
            )}
          </div>

          {/* State: Not set OR editing - show input form */}
          {(!rewardSettings?.stablecoinReward || isEditingStablecoin) && !isRewardLocked && (
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={String(selectedChain)}
                onChange={(e) => {
                  const val = e.target.value;
                  const chainId = val === 'solana' ? 'solana' : parseInt(val);
                  setSelectedChain(chainId);
                  const chainConfig = CHAIN_OPTIONS.find(c => String(c.id) === val);
                  if (chainConfig) {
                    setSelectedStablecoin(chainConfig.defaultToken);
                  }
                }}
                disabled={isSubmitting}
                className="w-24 px-2 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8e38ff] focus:border-[#8e38ff] text-[14px] bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                {CHAIN_OPTIONS.map(chain => (
                  <option key={chain.id} value={String(chain.id)}>{chain.name}</option>
                ))}
              </select>
              <select
                value={selectedStablecoin}
                onChange={(e) => setSelectedStablecoin(e.target.value as 'USDT' | 'USDC')}
                disabled={isSubmitting || getChainTokens(selectedChain).length === 1}
                className="w-20 px-2 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8e38ff] focus:border-[#8e38ff] text-[14px] bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                {getChainTokens(selectedChain).map(token => (
                  <option key={token} value={token}>{token}</option>
                ))}
              </select>
              <input
                type="text"
                inputMode="decimal"
                value={stablecoinAmount}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || (/^\d*\.?\d{0,2}$/.test(value) && value !== '.')) {
                    setStablecoinAmount(value);
                  }
                }}
                placeholder="e.g. 10"
                disabled={isSubmitting}
                className="w-24 px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8e38ff] focus:border-[#8e38ff] text-[14px] disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <button
                onClick={async () => {
                  await handleSaveStablecoinReward();
                  setIsEditingStablecoin(false);
                }}
                disabled={!stablecoinAmount || isSubmitting}
                className="bg-[#8e38ff] rounded-[27px] h-7 px-4 shadow-[0px_3px_0px_-1px_#393f49] flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="text-white text-[12px] font-semibold leading-none">
                  {isSubmitting ? 'Saving...' : 'Save'}
                </span>
              </button>
              {isEditingStablecoin && (
                <button
                  onClick={() => setIsEditingStablecoin(false)}
                  disabled={isSubmitting}
                  className="bg-gray-200 rounded-[27px] h-7 px-4 flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  <span className="text-[#393f49] text-[12px] font-semibold leading-none">Cancel</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Custom Token Reward - Coming Soon (single line) */}
        <div className="flex items-center gap-2">
          <span className="text-[14px] font-normal text-[#393f49]">
            Custom Token
          </span>
          <span className="text-[10px] text-[#8478e0] bg-[rgba(132,120,224,0.1)] px-2 py-0.5 rounded-full font-medium">
            Coming Soon
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-[#e6e8ec]" />

      {/* ===== APPROVAL SECTION ===== */}
      <div>
        <div className="text-[14px] font-medium text-[#393f49] mb-3">
          Approval
        </div>

        {/* Distribute drops when approved */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-[14px] font-normal text-[#393f49]">
            Distribute drops when approved
          </span>
          <button
            onClick={handleDistributeDropsToggle}
            disabled={isLoadingApprovalSettings}
            className={`relative w-10 h-5 rounded-full transition-colors disabled:opacity-50 ${
              autoDistributeDropsOnApprove ? 'bg-[#8e38ff]' : 'bg-gray-300'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                autoDistributeDropsOnApprove ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Auto Approve - Coming Soon (single line) */}
        <div className="flex items-center gap-2">
          <span className="text-[14px] font-normal text-[#393f49]">
            Auto Approve
          </span>
          <span className="text-[10px] text-[#8478e0] bg-[rgba(132,120,224,0.1)] px-2 py-0.5 rounded-full font-medium">
            Coming Soon
          </span>
        </div>
      </div>

      {/* Mobile Title Edit Modal */}
      <EditTitleModal
        isOpen={showTitleModal}
        onClose={() => setShowTitleModal(false)}
        currentTitle={mission?.title || ''}
        onSave={handleSaveTitleModal}
        isSubmitting={isSubmitting}
      />

      {/* Date Picker Modal */}
      <DatePickerModal
        isOpen={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        currentEndTime={mission?.endTime}
        onSave={handleSaveCustomDuration}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
