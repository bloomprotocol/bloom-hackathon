'use client';

import { useState, ReactNode } from 'react';

interface MobileDisabledWrapperProps {
  children: ReactNode;
  isMobile: boolean;
  message?: string;
}

export default function MobileDisabledWrapper({
  children,
  isMobile,
  message = 'This feature is only available on desktop',
}: MobileDisabledWrapperProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  if (!isMobile) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      <div
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setShowTooltip(true);
          setTimeout(() => setShowTooltip(false), 2000);
        }}
        className="cursor-not-allowed"
      >
        <div className="pointer-events-none opacity-50">
          {children}
        </div>
      </div>
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-[#393f49] text-white text-[12px] rounded-lg whitespace-nowrap z-50 animate-fade-in">
          {message}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#393f49]" />
        </div>
      )}
    </div>
  );
}
