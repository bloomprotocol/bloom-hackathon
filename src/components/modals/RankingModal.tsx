'use client';

import { useState, useEffect, useRef } from 'react';
import { BaseModal } from '@/components/ui/BaseModal';
import { logger } from '@/lib/utils/logger';

interface RankingOption {
  id: string;
  text: string;
}

interface RankingModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: {
    id: string;
    extra: {
      question: string;
      options: RankingOption[];
    };
  };
  onSubmit: (data: { rankedOptions: Array<{ optionId: string; position: number }> }) => Promise<void>;
}

export default function RankingModal({ isOpen, onClose, task, onSubmit }: RankingModalProps) {
  // Initialize ranking values for each option
  const [rankings, setRankings] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    task.extra.options.forEach((option, index) => {
      initial[option.id] = String(index + 1);
    });
    return initial;
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const firstOptionRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && firstOptionRef.current) {
      firstOptionRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    // Reset rankings when modal opens
    if (isOpen) {
      const initial: Record<string, string> = {};
      task.extra.options.forEach((option, index) => {
        initial[option.id] = String(index + 1);
      });
      setRankings(initial);
      setError('');
    }
  }, [isOpen, task.extra.options]);

  const handleClose = () => {
    setRankings({});
    setError('');
    onClose();
  };

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
    const n = task.extra.options.length;
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
    
    setIsSubmitting(true);
    
    const rankedOptions = Object.entries(rankings).map(([optionId, position]) => ({
      optionId,
      position: parseInt(position)
    }));

    try {
      await onSubmit({ rankedOptions });
      handleClose();
    } catch (error) {
      logger.error('Failed to submit ranking', { error });
      setError('Failed to submit, please try again');
    } finally {
      setIsSubmitting(false);
    }
  };

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
      caption={<span className="modal-title-text">Rank Your Priorities</span>}
    >
      <div className="bg-[rgba(255,255,255,0.6)] border border-[#dad9e5] rounded-xl p-3">
        <div className="space-y-3">
          {/* Question */}
          <div className="text-[14px] text-[#393f49] font-medium mb-3">
            {task.extra.question}
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Enter 1 to {task.extra.options.length} to rank (1 = highest priority)
          </p>

          {/* Options */}
          <div className="space-y-2">
            {task.extra.options.map((option, index) => (
              <div key={option.id} className="flex items-center gap-3">
                <input
                  type="text"
                  value={rankings[option.id]}
                  onChange={(e) => handleRankingChange(option.id, e.target.value)}
                  className="w-12 h-10 text-center border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none"
                  maxLength={2}
                  placeholder="#"
                  ref={index === 0 ? firstOptionRef : undefined}
                />
                <span className="flex-1 text-gray-800">{option.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="p-2 bg-red-100 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}

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
            disabled={Object.values(rankings).some(v => !v)}
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