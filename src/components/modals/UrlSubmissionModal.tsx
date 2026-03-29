'use client';

import { useState, useEffect, useRef } from 'react';
import { BaseModal } from '@/components/ui/BaseModal';
import { logger } from '@/lib/utils/logger';

interface UrlSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { caption: string; url: string }) => Promise<void>;
}

export default function UrlSubmissionModal({
  isOpen,
  onClose,
  onSubmit,
}: UrlSubmissionModalProps) {
  const [caption, setCaption] = useState('');
  const [url, setUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const captionRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen && captionRef.current) {
      captionRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!caption.trim() || !url.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({ caption, url });
      handleClose();
    } catch (error) {
      logger.error('Failed to submit', { error });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setCaption('');
    setUrl('');
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

  const canSubmit = caption.trim() && url.trim() && isValidUrl(url) && !isSubmitting;

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
      caption={<span className="modal-title-text">Submit Your Content</span>}
    >
      <div className="bg-[rgba(255,255,255,0.6)] border border-[#dad9e5] rounded-xl p-3">
        <div className="space-y-4">
          {/* URL Input - Now first like title */}
          <div>
            <label className="block text-sm font-medium mb-2">
              URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8e38ff] focus:border-[#8e38ff]"
            />
            {url && !isValidUrl(url) && (
              <p className="text-xs text-red-400 mt-1">
                Please enter a valid URL
              </p>
            )}
          </div>

          {/* Caption Input - Now second like content */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Caption for Your Creative
            </label>
            <textarea
              ref={captionRef}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Describe your creative content..."
              className="w-full min-h-[80px] p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#8e38ff] focus:border-[#8e38ff]"
              rows={3}
              maxLength={200}
            />
            <div className="text-xs text-gray-500 mt-1 text-right">
              {caption.length}/200
            </div>
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