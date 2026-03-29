'use client';

import { useState } from 'react';
import { Sprout } from 'lucide-react';

interface FloatingBuilderButtonProps {
  onClick: () => void;
}

export default function FloatingBuilderButton({ onClick }: FloatingBuilderButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="fixed bottom-6 right-6 z-50 transition-all duration-300 group"
      style={{
        transform: isHovered ? 'scale(1.05)' : 'scale(1)',
      }}
      aria-label="Submit your project"
    >
      {/* Button container */}
      <div
        className="flex items-center gap-3 px-5 py-3.5 rounded-full shadow-lg transition-all duration-300"
        style={{
          background: isHovered
            ? 'linear-gradient(135deg, rgba(72, 160, 120, 1) 0%, rgba(52, 140, 100, 1) 100%)'
            : 'linear-gradient(135deg, rgba(72, 160, 120, 0.95) 0%, rgba(52, 140, 100, 0.95) 100%)',
          boxShadow: isHovered
            ? '0 8px 24px rgba(72, 160, 120, 0.4), 0 0 0 4px rgba(72, 160, 120, 0.1)'
            : '0 4px 16px rgba(72, 160, 120, 0.3)',
        }}
      >
        {/* Icon */}
        <div
          className="transition-transform duration-300"
          style={{
            transform: isHovered ? 'rotate(12deg)' : 'rotate(0deg)',
          }}
        >
          <Sprout className="w-5 h-5 text-white" strokeWidth={2} />
        </div>

        {/* Text */}
        <span className="font-sans text-[14px] font-semibold text-white whitespace-nowrap">
          Submit Project
        </span>
      </div>

      {/* Subtle pulse effect */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: 'rgba(72, 160, 120, 0.2)',
          animation: 'pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          opacity: isHovered ? 0 : 1,
        }}
      />

      <style jsx>{`
        @keyframes pulse-ring {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.6;
          }
          100% {
            transform: scale(1.2);
            opacity: 0;
          }
        }
      `}</style>
    </button>
  );
}
