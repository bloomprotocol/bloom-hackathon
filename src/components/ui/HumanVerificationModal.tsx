'use client';

import { useState, useEffect } from 'react';
import { TurnstileWidget, useTurnstile, isTurnstileConfigured } from '@/lib/integration/turnstile';
import { BaseModal } from '@/components/ui';
import Image from 'next/image';

interface HumanVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerificationComplete?: () => void;
}

export default function HumanVerificationModal({
  isOpen,
  onClose,
  onVerificationComplete
}: HumanVerificationModalProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  const {
    token: turnstileToken,
    error: turnstileError,
    isVerified,
    handleSuccess: handleTurnstileSuccess,
    handleError: handleTurnstileError,
    handleExpire: handleTurnstileExpire,
    reset: resetTurnstile,
  } = useTurnstile();

  // 確保 modal 至少顯示一段時間
  useEffect(() => {
    if (isOpen) {
      setShowSuccess(false);
      setMinTimeElapsed(false);
      resetTurnstile();

      // 設置最小顯示時間
      const timer = setTimeout(() => {
        setMinTimeElapsed(true);
      }, 1500); // 1.5 秒

      return () => clearTimeout(timer);
    }
  }, [isOpen, resetTurnstile]);

  // 處理驗證成功
  useEffect(() => {
    if (isVerified && isOpen && !showSuccess && minTimeElapsed) {
      setShowSuccess(true);

      // 顯示成功消息一段時間後關閉
      setTimeout(() => {
        onVerificationComplete?.();
        onClose();
      }, 1000);
    }
  }, [isVerified, isOpen, showSuccess, minTimeElapsed, onVerificationComplete, onClose]);

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
      caption={
        <span className="font-['Times'] font-bold text-[20px] text-[#393F49]">
          {!showSuccess ? "Verify you're human" : "Verification complete"}
        </span>
      }
    >
      {/* 包裝容器來覆蓋 BaseModal 的 flex 樣式 */}
      <div className="block">
        {/* Verification Container - 固定高度容器 */}
        <div className="relative mx-0 my-[30px] h-[65px]">
          {/* Turnstile Widget */}
          <div className={`absolute inset-0 flex ${showSuccess ? 'opacity-0 pointer-events-none' : 'opacity-100'
            } transition-opacity duration-300`}>
            {isTurnstileConfigured() ? (
              <TurnstileWidget
                onSuccess={handleTurnstileSuccess}
                onError={handleTurnstileError}
                onExpire={handleTurnstileExpire}
                theme="light"
                size="normal"
              />
            ) : (
              // Dev mode fallback
              <div>
                <p className="text-red-500 mb-4 font-['Outfit']">Turnstile not configured</p>
                <button
                  onClick={() => {
                    handleTurnstileSuccess('dev-token');
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 font-['Outfit']"
                >
                  Skip Verification (Dev Mode)
                </button>
              </div>
            )}
          </div>

          {/* Success Message */}
          <div className={`absolute inset-0 flex items-center transition-all duration-500 ${showSuccess ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}>
            <div className="flex items-center gap-2">
              <div className="inline-block h-5 w-5 animate-spin rounded-full border-4 border-solid border-[#7ed321] border-r-transparent"></div>
              <h3 className="text-[20px] text-[#2d1b69] font-semibold font-['Outfit']">
                Initiating...
              </h3>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {turnstileError && !showSuccess && (
          <div className="mt-4 text-center text-red-500 text-sm font-['Outfit']">
            {turnstileError}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes bounceIn {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </BaseModal>
  );
}