'use client';

import { useState } from 'react';

interface EmailCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (email: string) => Promise<void>;
  personalityType: string;
  agentUserId: string;
}

const RESEND_COOLDOWN = 60;

export default function EmailCaptureModal({
  isOpen,
  onClose,
  onSubmit,
  personalityType,
  agentUserId,
}: EmailCaptureModalProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [savedEmail, setSavedEmail] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  if (!isOpen) return null;

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await onSubmit(email);
      setSavedEmail(email);
      setIsSuccess(true);
      setIsSubmitting(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;

    setIsSubmitting(true);
    setError('');

    try {
      await onSubmit(savedEmail);

      setResendCooldown(RESEND_COOLDOWN);
      const interval = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      setIsSubmitting(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setIsSuccess(false);
    setSavedEmail('');
    setError('');
    setResendCooldown(0);
    onClose();
  };

  // Success state
  if (isSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center animate-in fade-in zoom-in duration-200">
          {/* Success Icon */}
          <div className="mb-5">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 flex items-center justify-center">
              <svg className="w-7 h-7 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          <h2 className="font-serif text-xl font-bold text-[#393f49] mb-2">
            Check your inbox
          </h2>

          <p className="font-['Outfit'] text-sm text-[#696f8c] mb-5">
            We sent a magic link to <strong className="text-[#393f49]">{savedEmail}</strong>
          </p>

          <div className="bg-[#f8f7ff] rounded-xl p-4 mb-6">
            <p className="font-['Outfit'] text-xs text-[#696f8c]">
              Click the link in your email to save your card and access your dashboard. Link expires in 15 minutes.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="font-['Outfit'] text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handleClose}
              className="w-full py-3 bg-gradient-to-r from-[#a59af3] to-[#eb7cff] text-white rounded-xl font-['Outfit'] font-semibold text-sm hover:opacity-90 transition-opacity shadow-[0px_1px_1px_0.05px_rgba(24,24,27,0.24)]"
            >
              Got it
            </button>

            <button
              onClick={handleResend}
              disabled={resendCooldown > 0 || isSubmitting}
              className="w-full py-2 font-['Outfit'] text-xs text-[#696f8c] hover:text-[#393f49] disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                'Sending...'
              ) : resendCooldown > 0 ? (
                `Resend available in ${resendCooldown}s`
              ) : (
                "Didn't receive it? Resend link"
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Email capture state
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in duration-200 relative">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          disabled={isSubmitting}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <img
            src="https://statics.bloomprotocol.ai/logo/bp_logo_icon.svg"
            alt="Bloom Protocol"
            className="w-12 h-12 mx-auto mb-4"
          />
          <h2 className="font-serif text-xl font-bold text-[#393f49] mb-1">
            Save Your Identity Card
          </h2>
          <p className="font-['Outfit'] text-sm text-[#696f8c]">
            Keep your card safe and add it to your collection.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError('');
            }}
            placeholder="your@email.com"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl font-['Outfit'] text-sm text-[#393f49] placeholder-gray-400 focus:ring-2 focus:ring-[#a59af3] focus:border-transparent transition-all"
            disabled={isSubmitting}
            required
            autoFocus
          />

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="font-['Outfit'] text-sm text-red-800">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !email}
            className="w-full py-3 bg-gradient-to-r from-[#a59af3] to-[#eb7cff] text-white rounded-xl font-['Outfit'] font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0px_1px_1px_0.05px_rgba(24,24,27,0.24)]"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : (
              'Save My Card'
            )}
          </button>

          <p className="font-['Outfit'] text-xs text-center text-[#696f8c]">
            We'll send you a secure magic link. No password needed.
          </p>
        </form>
      </div>
    </div>
  );
}
