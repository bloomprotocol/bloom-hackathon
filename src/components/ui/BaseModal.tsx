'use client';

import { useEffect, ReactNode, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';

// 關閉策略類型定義
type CloseStrategy = 'all' | 'overlay' | 'esc' | 'none' | 'custom';

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Header 相关
  logo?: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
  };
  caption?: string | ReactNode;
  headerRight?: ReactNode; // Header 右側自定義內容
  hideHeader?: boolean; // 新增：是否隐藏header
  // 内容
  children: ReactNode;
  // 可选：自定义类名
  className?: string;
  contentClassName?: string;
  // 關閉策略配置
  closeStrategy?: CloseStrategy;
  customCloseHandler?: {
    overlay?: boolean;
    esc?: boolean;
  };
}

export function BaseModal({
  isOpen,
  onClose,
  logo,
  caption,
  headerRight,
  hideHeader = false,
  children,
  className = '',
  contentClassName = '',
  closeStrategy = 'all',
  customCloseHandler
}: BaseModalProps) {
  // Portal mount state
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 处理 ESC 键关闭
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        // 根據 closeStrategy 決定是否關閉
        const shouldClose =
          closeStrategy === 'all' ||
          closeStrategy === 'esc' ||
          (closeStrategy === 'custom' && customCloseHandler?.esc !== false);

        if (shouldClose) {
          onClose();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose, closeStrategy, customCloseHandler]);

  // Don't render on server or before mount
  if (!mounted) return null;

  const modalContent = (
    <>
      {/* Modal Overlay */}
      <div
        className={`fixed inset-0 z-[99999] flex items-end justify-center bg-white/70 backdrop-blur-[10px] transition-all duration-[400ms] desktop:items-center ${isOpen ? 'visible opacity-100' : 'invisible opacity-0'
          } ${className}`}
        onClick={(e) => {
          if (e.target !== e.currentTarget) return;

          // 根據 closeStrategy 決定是否關閉
          const shouldClose =
            closeStrategy === 'all' ||
            closeStrategy === 'overlay' ||
            (closeStrategy === 'custom' && customCloseHandler?.overlay !== false);

          if (shouldClose) {
            onClose();
          }
        }}
        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
      >
        {/* Modal Content - 高度自适应 */}
        <div
          className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[500px] rounded-t-[30px] bg-gradient-to-br from-white to-[#f8f0f6] bg-white/66 backdrop-blur-[20px] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] transition-transform duration-[500ms] desktop:relative desktop:bottom-auto desktop:left-auto desktop:translate-x-0 desktop:max-w-[450px] desktop:rounded-[30px] ${isOpen
              ? 'translate-y-0 desktop:scale-100 desktop:translate-y-0'
              : 'translate-y-full desktop:scale-90 desktop:translate-y-5'
            } ${contentClassName}`}
          style={{
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Modal Header - Fixed */}
          {!hideHeader && (
            <div className="flex-shrink-0 p-[24px]">
              <div className="flex items-center justify-between">
                {/* Left side: Logo + Caption */}
                <div className="flex items-center gap-[8px]">
                  {logo && (
                    <Image
                      src={logo.src}
                      alt={logo.alt}
                      width={34.62}
                      height={34}
                    />
                  )}
                  {caption && (
                    <h2 className="font-['Times'] font-bold text-[20px] text-[#393F49] leading-[1.2]">
                      {caption}
                    </h2>
                  )}
                </div>
                {/* Right side: Custom content */}
                {headerRight && (
                  <div className="flex items-center">
                    {headerRight}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Modal Body - Scrollable */}
          <div
            className="modal-body flex flex-col gap-[24px] flex-1 min-h-0 overflow-y-auto px-[24px] pb-[24px] scrollbar-hide"
            style={{
              WebkitOverflowScrolling: 'touch',
              overscrollBehavior: 'contain'
            }}
          >
            {children}
          </div>

          {/* Floating Particles */}
          {[0, 0.5, 1, 1.5, 2].map((delay, index) => (
            <div
              key={index}
              className="pointer-events-none absolute h-1 w-1 animate-[float_3s_ease-in-out_infinite] rounded-full bg-[#7ed321]/60"
              style={{
                left: `${10 + index * 20}%`,
                animationDelay: `${delay}s`
              }}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100px) translateX(30px);
            opacity: 0;
          }
        }
      `}</style>
      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;  /* Chrome, Safari and Opera */
        }
      `}</style>
    </>
  );

  // Use portal to render modal at document body level
  // This ensures modal is not affected by parent's overflow, transform, or backdrop-filter
  return createPortal(modalContent, document.body);
}