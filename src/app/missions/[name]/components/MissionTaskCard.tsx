"use client";

import clsx from "clsx";
import React, { useState } from "react";
import { ProfileSelectedMission, ProfileTask } from "@/lib/api/services/profileService";
import { taskConfig, getTaskButtonText, buttonStyles } from "@/lib/config/taskConfig";
import UrlSubmissionModal from '@/components/modals/UrlSubmissionModal';
import BountyHunterModal from '@/components/modals/BountyHunterModal';
import OptionsModal from '@/components/modals/OptionsModal';
import RankingModal from '@/components/modals/RankingModal';
import { ReviewModal } from '@/components/project/ReviewModal';

type TaskActionValue = string | { url: string } | { caption: string; url: string } | { content: string; projectId?: string } | { title: string; content: string } | { selectedOptions: string[] } | { rankedOptions: Array<{ optionId: string; position: number }> };

export interface MissionTaskCardProps {
  mission: ProfileSelectedMission | null;
  onTaskAction: (taskId: string, value?: TaskActionValue) => void;
  isProcessing?: boolean;
  currentTaskId?: string;
  failedTaskId?: string;
  className?: string;
  isMissionUpcoming?: boolean;
}

// Icon component
const IconCircleCheckFilled = ({ fill, style }: { fill: string, style: React.CSSProperties }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
    <circle cx="12" cy="12" r="12" fill={fill} />
    <path d="M10 15.172L16.192 8.979L17.607 10.393L10 18L6.636 14.636L8.05 13.222L10 15.172Z" fill="white" />
  </svg>
);

// Task item component
const TaskItem = ({
  task,
  onTaskAction,
  isProcessing,
  currentTaskId,
  failedTaskId,
  isMissionUpcoming = false
}: {
  task: ProfileTask;
  onTaskAction: (taskId: string, value?: TaskActionValue) => void;
  isProcessing: boolean;
  currentTaskId?: string;
  failedTaskId?: string;
  isMissionUpcoming?: boolean;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDesktopReviewForm, setShowDesktopReviewForm] = useState(false);
  const [showDesktopUrlForm, setShowDesktopUrlForm] = useState(false);
  const [showDesktopBountyForm, setShowDesktopBountyForm] = useState(false);
  const [showDesktopOptionsForm, setShowDesktopOptionsForm] = useState(false);
  const [showDesktopRankingForm, setShowDesktopRankingForm] = useState(false);
  
  // Get config
  const configKey = task.content_type || task.task_type;
  const config = taskConfig[configKey] || taskConfig.DEFAULT;
  
  // Get button state
  const getButtonState = () => {
    if (task.completed || task.statusData?.status === 'COMPLETED') return 'completed';
    if (task.statusData?.status === 'FAILED' || failedTaskId === task.id) return 'failed';
    if (isProcessing && currentTaskId === task.id) return 'processing';
    if (task.statusData?.status === 'IN_PROGRESS') return 'in_progress';
    return 'initial';
  };

  const buttonState = getButtonState();
  const isDisabled = buttonState === 'completed' || buttonState === 'processing' || isMissionUpcoming;
  const buttonText = getTaskButtonText(task, buttonState, task.statusData);

  // Button component - 100% Figma
  const Button = ({ onClick, disabled }: { onClick?: () => void, disabled?: boolean }) => {
    const finalDisabled = disabled || isDisabled;

    // If mission is upcoming, use disabled style
    if (isMissionUpcoming) {
      return (
        <button
          className="bg-gray-300 h-7 relative rounded-[27px] px-6 py-2 flex items-center justify-center text-gray-500 text-[12px] font-semibold cursor-not-allowed opacity-50"
          onClick={onClick}
          disabled={true}
        >
          {buttonText}
        </button>
      );
    }

    // Initial state - Figma style solid pink button
    if (buttonState === 'initial') {
      return (
        <button
          className="relative rounded-[27px] px-[16px] py-[8px] flex items-center justify-center bg-[#eb7cff] backdrop-blur-[10px] shadow-[0px_1px_1px_0.05px_rgba(24,24,27,0.24),0px_4px_10px_0px_rgba(0,0,0,0.25)] text-white text-[12px] font-medium leading-none overflow-hidden hover:opacity-90 transition-opacity"
          onClick={onClick}
          disabled={finalDisabled}
        >
          {buttonText}
          <div className="absolute inset-0 pointer-events-none rounded-[27px] shadow-[inset_0px_2px_0px_0px_rgba(255,255,255,0.1),inset_0px_8px_16px_0px_rgba(255,255,255,0.16)]" />
        </button>
      );
    }

    // Pending state - Figma style
    if (buttonState === 'processing' || buttonState === 'in_progress') {
      return (
        <button
          className="relative rounded-[27px] px-[16px] py-[8px] flex items-center justify-center gap-[4px] bg-[#e7e6f2] text-[#696f8c] text-[12px] font-medium leading-none"
          onClick={onClick}
          disabled={finalDisabled}
        >
          {buttonText}
        </button>
      );
    }

    // Completed state - Figma style solid green button
    if (buttonState === 'completed') {
      return (
        <button
          className="relative rounded-[27px] px-[16px] py-[8px] flex items-center justify-center gap-[4px] bg-[#71ca41] text-white text-[12px] font-medium leading-none"
          onClick={onClick}
          disabled={finalDisabled}
        >
          {buttonText}
        </button>
      );
    }

    // Other states (failed, default)
    let bgColor, textColor;

    switch (buttonState) {
      case 'failed':
        bgColor = 'bg-[rgba(255,81,153,0.1)]';
        textColor = 'text-[#ff5199]';
        break;
      default:
        bgColor = 'bg-[#e7e6f2]';
        textColor = 'text-[#696f8c]';
    }

    return (
      <button
        className={`${bgColor} relative rounded-[27px] px-[16px] py-[8px] flex items-center justify-center ${textColor} text-[12px] font-medium leading-none`}
        onClick={onClick}
        disabled={finalDisabled}
      >
        {buttonText}
      </button>
    );
  };

  // Handle submission
  const handleModalSubmit = async (data: { caption: string; url: string } | { content: string; projectId?: string } | { title: string; content: string } | { selectedOptions: string[] } | { rankedOptions: Array<{ optionId: string; position: number }> }) => {
    await onTaskAction(task.id, data);
    setIsModalOpen(false);
  };

  const handleInputSubmit = async () => {
    if (!inputValue.trim()) return;
    await onTaskAction(task.id, inputValue);
    setInputValue("");
  };

  return (
    <>
      <div className="flex items-center py-4">
        <div className="flex-1 flex flex-col gap-0.5 min-w-0">
          <div className="text-[14px] font-medium text-[#393f49] tracking-[-0.28px] truncate">
            {task.title}
          </div>
          <div className="text-[12px] text-[#696f8c] truncate" style={{ fontFamily: 'Outfit, sans-serif' }}>
            {task.description}
          </div>
        </div>
        
        <div className="shrink-0 ml-3">
          {/* Modal type tasks - 用 CSS 控制 Desktop/Mobile 顯示不同按鈕 */}
          {config.component === 'modal' && (
            <>
              {/* Desktop 按鈕：顯示 inline form */}
              <div className="hidden desktop:block">
                <Button onClick={() => {
                  switch (config.modalType) {
                    case 'review':
                      setShowDesktopReviewForm(!showDesktopReviewForm);
                      setShowDesktopUrlForm(false);
                      setShowDesktopBountyForm(false);
                      setShowDesktopOptionsForm(false);
                      setShowDesktopRankingForm(false);
                      break;
                    case 'url_submission':
                      setShowDesktopUrlForm(!showDesktopUrlForm);
                      setShowDesktopReviewForm(false);
                      setShowDesktopBountyForm(false);
                      setShowDesktopOptionsForm(false);
                      setShowDesktopRankingForm(false);
                      break;
                    case 'bounty_hunter':
                      setShowDesktopBountyForm(!showDesktopBountyForm);
                      setShowDesktopReviewForm(false);
                      setShowDesktopUrlForm(false);
                      setShowDesktopOptionsForm(false);
                      setShowDesktopRankingForm(false);
                      break;
                    case 'options':
                      setShowDesktopOptionsForm(!showDesktopOptionsForm);
                      setShowDesktopReviewForm(false);
                      setShowDesktopUrlForm(false);
                      setShowDesktopBountyForm(false);
                      setShowDesktopRankingForm(false);
                      break;
                    case 'ranking':
                      setShowDesktopRankingForm(!showDesktopRankingForm);
                      setShowDesktopReviewForm(false);
                      setShowDesktopUrlForm(false);
                      setShowDesktopBountyForm(false);
                      setShowDesktopOptionsForm(false);
                      break;
                    default:
                      setIsModalOpen(true);
                  }
                }} />
              </div>
              {/* Mobile 按鈕：打開 modal */}
              <div className="block desktop:hidden">
                <Button onClick={() => setIsModalOpen(true)} />
              </div>
            </>
          )}
          
          {/* Button type tasks */}
          {config.component === 'button' && (
            <Button onClick={() => onTaskAction(task.id)} />
          )}
          
          {/* Input type tasks */}
          {config.component === 'input' && (
            <div className="flex items-center gap-2">
              {!task.completed && buttonState !== 'in_progress' && (
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={config.inputConfig?.placeholder || "Enter value"}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                  onKeyPress={(e) => e.key === 'Enter' && handleInputSubmit()}
                />
              )}
              <Button onClick={handleInputSubmit} />
            </div>
          )}
        </div>
      </div>
      
      {/* Mobile modals */}
      {config.modalType === 'url_submission' && (
        <UrlSubmissionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleModalSubmit}
        />
      )}
      {config.modalType === 'bounty_hunter' && (
        <BountyHunterModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleModalSubmit}
        />
      )}
      {config.modalType === 'review' && (
        <ReviewModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={async (content: string) => {
            await handleModalSubmit({ content, projectId: task.extra?.projectId });
          }}
        />
      )}
      {config.modalType === 'options' && task.extra && (
        <OptionsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleModalSubmit}
          question={task.extra.question || 'Please select an option'}
          options={task.extra.options || []}
          multipleChoice={task.extra.settings?.multipleChoice || false}
        />
      )}
      {config.modalType === 'ranking' && task.extra && (
        <RankingModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleModalSubmit}
          task={task}
        />
      )}
      
      {/* Desktop inline review form */}
      {showDesktopReviewForm && config.modalType === 'review' && (
        <div className="mt-3">
          <DesktopReviewForm
            task={task}
            onSubmit={async (data) => {
              await handleModalSubmit(data);
              setShowDesktopReviewForm(false);
            }}
            onClose={() => setShowDesktopReviewForm(false)}
            isProcessing={isProcessing && currentTaskId === task.id}
          />
        </div>
      )}
      
      {/* Desktop inline URL submission form */}
      {showDesktopUrlForm && config.modalType === 'url_submission' && (
        <div className="mt-3">
          <DesktopUrlSubmissionForm
            task={task}
            onSubmit={async (data) => {
              await handleModalSubmit(data);
              setShowDesktopUrlForm(false);
            }}
            onClose={() => setShowDesktopUrlForm(false)}
            isProcessing={isProcessing && currentTaskId === task.id}
          />
        </div>
      )}
      
      {/* Desktop inline bounty hunter form */}
      {showDesktopBountyForm && config.modalType === 'bounty_hunter' && (
        <div className="mt-3">
          <DesktopBountyHunterForm
            task={task}
            onSubmit={async (data) => {
              await handleModalSubmit(data);
              setShowDesktopBountyForm(false);
            }}
            onClose={() => setShowDesktopBountyForm(false)}
            isProcessing={isProcessing && currentTaskId === task.id}
          />
        </div>
      )}
      
      {/* Desktop inline options form */}
      {showDesktopOptionsForm && config.modalType === 'options' && task.extra && (
        <div className="mt-3">
          <DesktopOptionsForm
            task={task}
            onSubmit={async (data) => {
              await handleModalSubmit(data);
              setShowDesktopOptionsForm(false);
            }}
            onClose={() => setShowDesktopOptionsForm(false)}
            isProcessing={isProcessing && currentTaskId === task.id}
          />
        </div>
      )}
      
      {/* Desktop inline ranking form */}
      {showDesktopRankingForm && config.modalType === 'ranking' && task.extra && (
        <div className="mt-3">
          <DesktopRankingForm
            task={task}
            onSubmit={async (data) => {
              await handleModalSubmit(data);
              setShowDesktopRankingForm(false);
            }}
            onClose={() => setShowDesktopRankingForm(false)}
            isProcessing={isProcessing && currentTaskId === task.id}
          />
        </div>
      )}
    </>
  );
};

// Desktop forms
interface DesktopFormProps {
  task: ProfileTask;
  onSubmit: (data: { caption: string; url: string }) => Promise<void>;
  onClose: () => void;
  isProcessing: boolean;
}

interface DesktopBountyFormProps {
  task: ProfileTask;
  onSubmit: (data: { title: string; content: string }) => Promise<void>;
  onClose: () => void;
  isProcessing: boolean;
}

const DesktopUrlSubmissionForm = ({ task, onSubmit, onClose, isProcessing }: DesktopFormProps) => {
  const [caption, setCaption] = useState("");
  const [url, setUrl] = useState("");

  const handleSubmit = async () => {
    if (!caption.trim() || !url.trim() || !isValidUrl(url)) return;
    await onSubmit({ caption, url });
    setCaption("");
    setUrl("");
    onClose();
  };

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  return (
    <div className="bg-[rgba(255,255,255,0.6)] border border-[#dad9e5] rounded-xl p-3 w-full mb-4">
      <div className="space-y-3">
        {/* URL field - first like title */}
        <div>
          <label className="text-[12px] text-[#696f8c] mb-1 block">
            URL (Required)
          </label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8e38ff] focus:border-[#8e38ff] text-[14px]"
          />
          {url && !isValidUrl(url) && (
            <p className="text-[12px] text-[#ff5199] mt-1">Please enter a valid URL</p>
          )}
        </div>
        
        {/* Caption field - second like content */}
        <div>
          <label className="text-[12px] text-[#696f8c] mb-1 block">
            Caption (Required)
          </label>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Describe your creative content..."
            className="w-full p-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#8e38ff] focus:border-[#8e38ff] text-[14px]"
            rows={3}
            maxLength={200}
          />
          <div className="text-[12px] text-[#696f8c] mt-1 text-right">{caption.length}/200</div>
        </div>
      </div>
      <div className="flex justify-end gap-3 mt-3">
        {/* Cancel - Pending style */}
        <button
          onClick={onClose}
          className="relative rounded-[27px] px-[16px] py-[8px] flex items-center justify-center gap-[4px] bg-[#e7e6f2] text-[#696f8c] text-[12px] font-medium leading-none"
        >
          Cancel
        </button>
        {/* Submit - Initial style when ready, Pending style when processing */}
        {isProcessing ? (
          <button
            className="relative rounded-[27px] px-[16px] py-[8px] flex items-center justify-center gap-[4px] bg-[#e7e6f2] text-[#696f8c] text-[12px] font-medium leading-none"
            disabled
          >
            Submitting...
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!caption.trim() || !url.trim() || !isValidUrl(url)}
            className="relative rounded-[27px] px-[16px] py-[8px] flex items-center justify-center bg-[#eb7cff] backdrop-blur-[10px] shadow-[0px_1px_1px_0.05px_rgba(24,24,27,0.24),0px_4px_10px_0px_rgba(0,0,0,0.25)] text-white text-[12px] font-medium leading-none overflow-hidden hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            Submit
            <div className="absolute inset-0 pointer-events-none rounded-[27px] shadow-[inset_0px_2px_0px_0px_rgba(255,255,255,0.1),inset_0px_8px_16px_0px_rgba(255,255,255,0.16)]" />
          </button>
        )}
      </div>
    </div>
  );
};

const DesktopBountyHunterForm = ({ task, onSubmit, onClose, isProcessing }: DesktopBountyFormProps) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = async () => {
    if (!content.trim()) return;
    await onSubmit({ title, content });
    setTitle("");
    setContent("");
    onClose();
  };

  return (
    <div className="bg-[rgba(255,255,255,0.6)] border border-[#dad9e5] rounded-xl p-3 w-full mb-4">
      <div className="space-y-3">
        {/* Title field - optional */}
        <div>
          <label className="text-[12px] text-[#696f8c] mb-1 block">
            Title (Optional)
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What's your submission about?"
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8e38ff] focus:border-[#8e38ff] text-[14px]"
            maxLength={100}
          />
        </div>
        
        {/* Content field - required */}
        <div>
          <label className="text-[12px] text-[#696f8c] mb-1 block">
            Content (Required)
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your content here. Be detailed and clear..."
            className="w-full p-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#8e38ff] focus:border-[#8e38ff] text-[14px]"
            rows={3}
            maxLength={1000}
          />
          <div className="text-[12px] text-[#696f8c] mt-1 text-right">{content.length}/1000</div>
        </div>
      </div>
      
      <div className="flex justify-end gap-3 mt-3">
        {/* Cancel - Pending style */}
        <button
          onClick={onClose}
          className="relative rounded-[27px] px-[16px] py-[8px] flex items-center justify-center gap-[4px] bg-[#e7e6f2] text-[#696f8c] text-[12px] font-medium leading-none"
        >
          Cancel
        </button>
        {/* Submit - Initial style when ready, Pending style when processing */}
        {isProcessing ? (
          <button
            className="relative rounded-[27px] px-[16px] py-[8px] flex items-center justify-center gap-[4px] bg-[#e7e6f2] text-[#696f8c] text-[12px] font-medium leading-none"
            disabled
          >
            Submitting...
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!content.trim()}
            className="relative rounded-[27px] px-[16px] py-[8px] flex items-center justify-center bg-[#eb7cff] backdrop-blur-[10px] shadow-[0px_1px_1px_0.05px_rgba(24,24,27,0.24),0px_4px_10px_0px_rgba(0,0,0,0.25)] text-white text-[12px] font-medium leading-none overflow-hidden hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            Submit
            <div className="absolute inset-0 pointer-events-none rounded-[27px] shadow-[inset_0px_2px_0px_0px_rgba(255,255,255,0.1),inset_0px_8px_16px_0px_rgba(255,255,255,0.16)]" />
          </button>
        )}
      </div>
    </div>
  );
};

interface DesktopReviewFormProps {
  task: ProfileTask;
  onSubmit: (data: { content: string; projectId?: string }) => Promise<void>;
  onClose: () => void;
  isProcessing: boolean;
}

const DesktopReviewForm = ({ task, onSubmit, onClose, isProcessing }: DesktopReviewFormProps) => {
  const [content, setContent] = useState("");

  const handleSubmit = async () => {
    if (!content.trim()) return;
    await onSubmit({ content, projectId: task.extra?.projectId });
    setContent(""); // Clear after submit
    onClose(); // Close form after submit
  };

  return (
    <div className="bg-[rgba(255,255,255,0.6)] border border-[#dad9e5] rounded-xl p-3 w-full mb-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Enter your review"
        className="w-full p-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#8e38ff] focus:border-[#8e38ff] text-[14px]"
        rows={3}
        maxLength={500}
      />
      <div className="flex justify-end gap-3 mt-3">
        {/* Cancel - Pending style */}
        <button
          onClick={onClose}
          className="relative rounded-[27px] px-[16px] py-[8px] flex items-center justify-center gap-[4px] bg-[#e7e6f2] text-[#696f8c] text-[12px] font-medium leading-none"
        >
          Cancel
        </button>
        {/* Post - Initial style when ready, Pending style when processing */}
        {isProcessing ? (
          <button
            className="relative rounded-[27px] px-[16px] py-[8px] flex items-center justify-center gap-[4px] bg-[#e7e6f2] text-[#696f8c] text-[12px] font-medium leading-none"
            disabled
          >
            Posting...
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!content.trim()}
            className="relative rounded-[27px] px-[16px] py-[8px] flex items-center justify-center bg-[#eb7cff] backdrop-blur-[10px] shadow-[0px_1px_1px_0.05px_rgba(24,24,27,0.24),0px_4px_10px_0px_rgba(0,0,0,0.25)] text-white text-[12px] font-medium leading-none overflow-hidden hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            Post
            <div className="absolute inset-0 pointer-events-none rounded-[27px] shadow-[inset_0px_2px_0px_0px_rgba(255,255,255,0.1),inset_0px_8px_16px_0px_rgba(255,255,255,0.16)]" />
          </button>
        )}
      </div>
    </div>
  );
};

interface DesktopOptionsFormProps {
  task: ProfileTask;
  onSubmit: (data: { selectedOptions: string[] }) => Promise<void>;
  onClose: () => void;
  isProcessing: boolean;
}

const DesktopOptionsForm = ({ task, onSubmit, onClose, isProcessing }: DesktopOptionsFormProps) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  
  const question = task.extra?.question || 'Please select an option';
  const options = task.extra?.options || [];
  const multipleChoice = task.extra?.settings?.multipleChoice || false;

  const handleOptionToggle = (optionId: string) => {
    if (multipleChoice) {
      // Multiple choice: toggle selection
      setSelectedOptions(prev =>
        prev.includes(optionId)
          ? prev.filter(id => id !== optionId)
          : [...prev, optionId]
      );
    } else {
      // Single choice: replace selection
      setSelectedOptions([optionId]);
    }
  };

  const handleSubmit = async () => {
    if (selectedOptions.length === 0) return;
    await onSubmit({ selectedOptions });
    setSelectedOptions([]);
    onClose();
  };

  return (
    <div className="bg-[rgba(255,255,255,0.6)] border border-[#dad9e5] rounded-xl p-3 w-full mb-4">
      {/* Question */}
      <div className="text-[14px] text-[#393f49] font-medium mb-3">
        {question}
      </div>

      {/* Options */}
      <div className="space-y-2 mb-3">
        {options.map((option: any) => (
          <label
            key={option.id}
            className="flex items-center p-2 rounded-lg border border-[#dad9e5] cursor-pointer transition-all duration-200 hover:bg-[rgba(142,56,255,0.05)] bg-transparent"
          >
            <input
              type={multipleChoice ? 'checkbox' : 'radio'}
              name="desktop-options"
              value={option.id}
              checked={selectedOptions.includes(option.id)}
              onChange={() => handleOptionToggle(option.id)}
              className="sr-only"
            />
            
            {/* Custom Radio/Checkbox */}
            <div className={`
              flex-shrink-0 w-4 h-4 rounded border-2 mr-2
              flex items-center justify-center transition-all
              ${multipleChoice ? 'rounded' : 'rounded-full'}
              ${selectedOptions.includes(option.id)
                ? 'border-[#8e38ff] bg-[#8e38ff]'
                : 'border-[#dad9e5]'
              }
            `}>
              {selectedOptions.includes(option.id) && (
                <svg
                  className="w-2.5 h-2.5 text-white"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  {multipleChoice ? (
                    // Checkmark for checkbox
                    <path d="M13.485 1.929a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-3-3a1 1 0 111.414-1.414L6 8.444l6.293-6.293a1 1 0 011.414 0l.778.778z" />
                  ) : (
                    // Circle for radio
                    <circle cx="8" cy="8" r="3" />
                  )}
                </svg>
              )}
            </div>

            {/* Option Text */}
            <span className={`
              text-[13px] leading-[1.4] tracking-[-0.28px]
              ${selectedOptions.includes(option.id)
                ? 'text-[#393f49] font-medium'
                : 'text-[#696f8c]'
              }
            `}>
              {option.text}
            </span>
          </label>
        ))}
      </div>

      {/* Helper Text */}
      <div className="text-[11px] text-[#696f8c] mb-2">
        {multipleChoice 
          ? `Select all that apply (${selectedOptions.length} selected)`
          : 'Choose the best answer'
        }
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        {/* Cancel - Pending style */}
        <button
          onClick={onClose}
          className="relative rounded-[27px] px-[16px] py-[8px] flex items-center justify-center gap-[4px] bg-[#e7e6f2] text-[#696f8c] text-[12px] font-medium leading-none"
        >
          Cancel
        </button>
        {/* Submit - Initial style when ready, Pending style when processing */}
        {isProcessing ? (
          <button
            className="relative rounded-[27px] px-[16px] py-[8px] flex items-center justify-center gap-[4px] bg-[#e7e6f2] text-[#696f8c] text-[12px] font-medium leading-none"
            disabled
          >
            Submitting...
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={selectedOptions.length === 0}
            className="relative rounded-[27px] px-[16px] py-[8px] flex items-center justify-center bg-[#eb7cff] backdrop-blur-[10px] shadow-[0px_1px_1px_0.05px_rgba(24,24,27,0.24),0px_4px_10px_0px_rgba(0,0,0,0.25)] text-white text-[12px] font-medium leading-none overflow-hidden hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            Submit
            <div className="absolute inset-0 pointer-events-none rounded-[27px] shadow-[inset_0px_2px_0px_0px_rgba(255,255,255,0.1),inset_0px_8px_16px_0px_rgba(255,255,255,0.16)]" />
          </button>
        )}
      </div>
    </div>
  );
};

// Desktop Ranking Form
interface DesktopRankingFormProps {
  task: ProfileTask;
  onSubmit: (data: { rankedOptions: Array<{ optionId: string; position: number }> }) => Promise<void>;
  onClose: () => void;
  isProcessing: boolean;
}

const DesktopRankingForm = ({ task, onSubmit, onClose, isProcessing }: DesktopRankingFormProps) => {
  const [rankings, setRankings] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    task.extra?.options?.forEach((option: any, index: number) => {
      initial[option.id] = String(index + 1);
    });
    return initial;
  });
  const [error, setError] = useState<string>('');
  
  const question = task.extra?.question || 'Please rank the options';
  const options = task.extra?.options || [];

  const handleRankingChange = (optionId: string, value: string) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;
    
    setRankings(prev => ({
      ...prev,
      [optionId]: value
    }));
    setError('');
  };

  const validateRankings = (): boolean => {
    const values = Object.values(rankings);
    const numbers = values.map(v => parseInt(v));
    
    // Check if all are filled
    if (values.some(v => !v)) {
      setError('Please rank all options');
      return false;
    }
    
    // Check number range
    const n = options.length;
    if (numbers.some(num => num < 1 || num > n)) {
      setError(`Rankings must be between 1 and ${n}`);
      return false;
    }
    
    // Check for duplicates
    const uniqueNumbers = new Set(numbers);
    if (uniqueNumbers.size !== numbers.length) {
      setError('Each ranking number can only be used once');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateRankings()) return;
    
    const rankedOptions = Object.entries(rankings).map(([optionId, position]) => ({
      optionId,
      position: parseInt(position)
    }));
    
    await onSubmit({ rankedOptions });
    setRankings({});
    setError('');
    onClose();
  };

  return (
    <div className="bg-[rgba(255,255,255,0.6)] border border-[#dad9e5] rounded-xl p-3 w-full mb-4">
      {/* Question */}
      <div className="text-[14px] text-[#393f49] font-medium mb-3">
        {question}
      </div>
      <p className="text-[12px] text-[#696f8c] mb-3">
        Enter 1 to {options.length} to rank (1 = highest priority)
      </p>

      {/* Options */}
      <div className="space-y-2 mb-3">
        {options.map((option: any) => (
          <div key={option.id} className="flex items-center gap-3">
            <input
              type="text"
              value={rankings[option.id]}
              onChange={(e) => handleRankingChange(option.id, e.target.value)}
              className="w-12 h-9 text-center border border-[#dad9e5] rounded-lg text-[14px] focus:outline-none focus:border-[#8e38ff]"
              maxLength={2}
              placeholder="#"
            />
            <span className="flex-1 text-[14px] text-[#393f49]">{option.text}</span>
          </div>
        ))}
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-3 p-2 bg-red-100 text-red-600 rounded-lg text-[12px]">
          {error}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex justify-end gap-3">
        {/* Cancel - Pending style */}
        <button
          onClick={onClose}
          disabled={isProcessing}
          className="relative rounded-[27px] px-[16px] py-[8px] flex items-center justify-center gap-[4px] bg-[#e7e6f2] text-[#696f8c] text-[12px] font-medium leading-none"
        >
          Cancel
        </button>
        {/* Submit - Initial style when ready, Pending style when processing */}
        {isProcessing ? (
          <button
            className="relative rounded-[27px] px-[16px] py-[8px] flex items-center justify-center gap-[4px] bg-[#e7e6f2] text-[#696f8c] text-[12px] font-medium leading-none"
            disabled
          >
            Submitting...
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={Object.values(rankings).some(v => !v)}
            className="relative rounded-[27px] px-[16px] py-[8px] flex items-center justify-center bg-[#eb7cff] backdrop-blur-[10px] shadow-[0px_1px_1px_0.05px_rgba(24,24,27,0.24),0px_4px_10px_0px_rgba(0,0,0,0.25)] text-white text-[12px] font-medium leading-none overflow-hidden hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            Submit
            <div className="absolute inset-0 pointer-events-none rounded-[27px] shadow-[inset_0px_2px_0px_0px_rgba(255,255,255,0.1),inset_0px_8px_16px_0px_rgba(255,255,255,0.16)]" />
          </button>
        )}
      </div>
    </div>
  );
};

// Main component
export function MissionTaskCard({
  mission,
  onTaskAction,
  isProcessing = false,
  currentTaskId,
  failedTaskId,
  className = "",
  isMissionUpcoming = false
}: MissionTaskCardProps) {
  
  if (!mission) {
    return (
      <div className={`common-container-style ${className}`}>
        <p className="text-center text-gray-500" style={{ fontFamily: 'Outfit, sans-serif' }}>No mission selected</p>
      </div>
    );
  }

  // Tasks are already grouped by category from backend
  const tasksByCategory = mission.tasks;

  return (
    
      <>
      
      {/* Render task groups vertically */}
      <div className="space-y-4">
        {Object.entries(tasksByCategory).map(([category, tasks], groupIndex) => (
          <div key={category} className="common-container-style" style={{ padding: 0 }}>
            <div className="px-4 py-1">
              {/* Task group header */}
              <div className="flex items-center justify-between py-5 border-b border-[#e7e6f2]">
                
                <h4 className="text-[14px] font-semibold text-[#393f49]" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {category}
                </h4>
                
                <div className="text-[12px]">
                  <span className="font-medium text-[#71ca41]" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    {(tasks as ProfileTask[]).filter((t: ProfileTask) => t.completed).length}
                  </span>
                  <span className="text-[#393f49]" style={{ fontFamily: 'Outfit, sans-serif' }}>/{(tasks as ProfileTask[]).length}</span>
                </div>
              </div>
              
              {/* Task items */}
              <div>
                {tasks.map((task, index) => (
                  <React.Fragment key={task.id}>
                    <TaskItem
                      task={task}
                      onTaskAction={onTaskAction}
                      isProcessing={isProcessing}
                      currentTaskId={currentTaskId}
                      failedTaskId={failedTaskId}
                      isMissionUpcoming={isMissionUpcoming}
                    />
                    {index < tasks.length - 1 && (
                      <div className="border-b border-[#e7e6f2]" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      </>
    
  );
}