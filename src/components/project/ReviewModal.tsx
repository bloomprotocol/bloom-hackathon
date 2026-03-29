'use client';

import { useState, useEffect } from 'react';
import { BaseModal } from '@/components/ui/BaseModal';
import { logger } from '@/lib/utils/logger';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (content: string) => Promise<void>;
  replyTo?: string; // First few words of the review being replied to
}

export function ReviewModal({ isOpen, onClose, onSubmit, replyTo }: ReviewModalProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset content when modal closes
  useEffect(() => {
    if (!isOpen) {
      setContent('');
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!content.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(content);
      setContent('');
      onClose();
    } catch (error) {
      logger.error('Failed to submit review', { error });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      logo={{
        src: "https://statics.bloomprotocol.ai/logo/bp_logo_icon.svg",
        alt: "Bloom Protocol",
        width: 34.62,
        height: 34
      }}
      caption={<span className="modal-title-text">Write Review</span>}
    >
      <div className="bg-[rgba(255,255,255,0.6)] border border-[#dad9e5] rounded-xl p-3">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Review Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your experience..."
              className="w-full min-h-[120px] p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#8e38ff] focus:border-[#8e38ff]"
              rows={6}
              maxLength={500}
              autoFocus
            />
            <div className="text-xs text-gray-500 mt-1 text-right">
              {content.length}/500
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        {/* Cancel - Pending style */}
        <button
          onClick={onClose}
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
            disabled={!content.trim()}
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