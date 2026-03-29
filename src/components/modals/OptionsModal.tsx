'use client';

import { useState, useEffect, useRef } from 'react';
import { BaseModal } from '@/components/ui/BaseModal';
import { logger } from '@/lib/utils/logger';

interface Option {
  id: string;
  text: string;
}

interface OptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { selectedOptions: string[] }) => Promise<void>;
  question: string;
  options: Option[];
  multipleChoice?: boolean;
}

export default function OptionsModal({
  isOpen,
  onClose,
  onSubmit,
  question,
  options,
  multipleChoice = false,
}: OptionsModalProps) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const firstOptionRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && firstOptionRef.current) {
      firstOptionRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    // Reset selection when modal opens
    if (isOpen) {
      setSelectedOptions([]);
    }
  }, [isOpen]);

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

    setIsSubmitting(true);
    try {
      await onSubmit({ selectedOptions });
      handleClose();
    } catch (error) {
      logger.error('Failed to submit', { error });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedOptions([]);
    onClose();
  };

  const canSubmit = selectedOptions.length > 0 && !isSubmitting;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      logo={{
        src: "https://statics.bloomprotocol.ai/logo/bp_logo_icon.svg",
        alt: "Bloom Protocol",
        width: 34.62,
        height: 34
      }}
      caption={<span className="modal-title-text">{multipleChoice ? 'Select Your Choices' : 'Make Your Choice'}</span>}
    >
      <div className="bg-[rgba(255,255,255,0.6)] border border-[#dad9e5] rounded-xl p-3">
        <div className="space-y-3">
          {/* Question */}
          <div className="text-[14px] text-[#393f49] font-medium mb-3">
            {question}
          </div>

          {/* Options */}
          <div className="space-y-2">
            {options.map((option, index) => (
              <label
                key={option.id}
                className="flex items-center p-3 rounded-lg border border-[#dad9e5] cursor-pointer transition-all duration-200 hover:bg-[rgba(142,56,255,0.05)] bg-transparent"
              >
                <input
                  ref={index === 0 ? firstOptionRef : undefined}
                  type={multipleChoice ? 'checkbox' : 'radio'}
                  name="options"
                  value={option.id}
                  checked={selectedOptions.includes(option.id)}
                  onChange={() => handleOptionToggle(option.id)}
                  className="sr-only"
                />

                {/* Custom Radio/Checkbox */}
                <div className={`
                  flex-shrink-0 w-5 h-5 rounded-full border-2 mr-3
                  flex items-center justify-center transition-all
                  ${multipleChoice ? 'rounded-md' : 'rounded-full'}
                  ${selectedOptions.includes(option.id)
                    ? 'border-[#8e38ff] bg-[#8e38ff]'
                    : 'border-[#dad9e5]'
                  }
                `}>
                  {selectedOptions.includes(option.id) && (
                    <svg
                      className="w-3 h-3 text-white"
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
                  text-[14px] leading-[1.4] tracking-[-0.28px]
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
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        {/* Cancel - Pending style */}
        <button
          onClick={handleClose}
          disabled={isSubmitting}
          className="relative rounded-[27px] px-[16px] py-[8px] flex items-center justify-center gap-[4px] bg-[#e7e6f2] text-[#696f8c] text-[12px] font-medium leading-none"
        >
          Cancel
        </button>
        {/* Submit - Initial style when ready, Pending style when submitting */}
        {isSubmitting ? (
          <button
            className="relative rounded-[27px] px-[16px] py-[8px] flex items-center justify-center gap-[4px] bg-[#e7e6f2] text-[#696f8c] text-[12px] font-medium leading-none"
            disabled
          >
            Submitting...
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="relative rounded-[27px] px-[16px] py-[8px] flex items-center justify-center bg-[#eb7cff] backdrop-blur-[10px] shadow-[0px_1px_1px_0.05px_rgba(24,24,27,0.24),0px_4px_10px_0px_rgba(0,0,0,0.25)] text-white text-[12px] font-medium leading-none overflow-hidden hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            Submit
            <div className="absolute inset-0 pointer-events-none rounded-[27px] shadow-[inset_0px_2px_0px_0px_rgba(255,255,255,0.1),inset_0px_8px_16px_0px_rgba(255,255,255,0.16)]" />
          </button>
        )}
      </div>
    </BaseModal>
  );
}