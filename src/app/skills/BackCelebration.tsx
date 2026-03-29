'use client';

import { useEffect, useState } from 'react';

interface BackCelebrationProps {
  isOpen: boolean;
  onClose: () => void;
  skillCount: number;
  skillNames: string[];
  totalAmount: number;
  isLoggedIn?: boolean;
}

export default function BackCelebration({
  isOpen,
  onClose,
  skillCount,
  skillNames,
  totalAmount,
  isLoggedIn,
}: BackCelebrationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  if (!isOpen) return null;

  // Build share text for X
  const shareText = `I just backed ${skillCount} AI agent skill${skillCount > 1 ? 's' : ''} on @Bloom__protocol! 🧩\n\n${skillNames.slice(0, 3).map(n => `- ${n}`).join('\n')}${skillNames.length > 3 ? `\n...and ${skillNames.length - 3} more` : ''}\n\nBack the skills you want to see thrive:`;
  const shareUrl = 'https://bloomprotocol.ai/skills';
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleClose}
    >
      <div
        className={`bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl transform transition-all duration-300 max-h-[90vh] overflow-y-auto ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="font-serif font-bold text-2xl text-[#393f49] mb-2">
            You backed {skillCount} skill{skillCount > 1 ? 's' : ''}!
          </h2>
          <p className="font-['Outfit'] text-sm text-[#696f8c]">
            ${totalAmount.toFixed(2)} USDC on Base
          </p>
        </div>

        {/* Skills backed */}
        <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-4 mb-6">
          <div className="space-y-2">
            {skillNames.map((name, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-sm">🧩</span>
                <span className="font-['Outfit'] text-sm text-[#393f49]">{name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Impact message */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 mb-6 border border-green-100">
          <p className="font-['Outfit'] text-sm text-[#393f49] leading-relaxed">
            Your backing tells creators that <span className="font-semibold">real demand exists</span> for these tools. When enough people back a skill, creators know it&apos;s worth building.
          </p>
        </div>

        {/* What happens next */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <p className="font-['Outfit'] font-semibold text-sm text-[#393f49] mb-3">What happens next</p>
          <div className="space-y-2.5">
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-['Outfit'] text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5">1</span>
              <p className="font-['Outfit'] text-xs text-[#696f8c] leading-relaxed">
                Your ${totalAmount.toFixed(2)} USDC is held safely — not spent yet.
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-['Outfit'] text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5">2</span>
              <p className="font-['Outfit'] text-xs text-[#696f8c] leading-relaxed">
                When a creator claims, you receive an <span className="font-medium text-[#7c3aed]">Exclusive Pass</span> with perks like early access and priority rewards.
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-gray-200 text-gray-600 font-['Outfit'] text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5">3</span>
              <p className="font-['Outfit'] text-xs text-[#696f8c] leading-relaxed">
                If no creator claims within 90 days, you get a full automatic refund.
              </p>
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex gap-3">
          <a
            href={twitterUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-3 rounded-xl font-['Outfit'] font-semibold text-sm text-center text-white bg-black hover:bg-gray-800 transition-colors"
          >
            Share on X
          </a>
          <button
            onClick={handleClose}
            className="flex-1 py-3 rounded-xl font-['Outfit'] font-semibold text-sm text-center text-white bg-gradient-to-r from-[#7c3aed] to-[#8b5cf6] hover:opacity-90 transition-opacity shadow-[0px_1px_1px_0.05px_rgba(24,24,27,0.24)]"
          >
            Continue Exploring
          </button>
        </div>

        {/* Dashboard CTA — logged in users */}
        {isLoggedIn && (
          <a
            href="/dashboard"
            className="block mt-3 py-2.5 rounded-xl font-['Outfit'] font-medium text-sm text-center text-[#7c3aed] hover:bg-purple-50 transition-colors"
          >
            View your passes on Dashboard →
          </a>
        )}
      </div>
    </div>
  );
}
