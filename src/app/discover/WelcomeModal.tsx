'use client';

import { useEffect, useState } from 'react';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WelcomeModal({ isOpen, onClose }: WelcomeModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for animation
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleClose}
    >
      <div
        className={`bg-white rounded-2xl p-8 max-w-lg w-full mx-4 shadow-2xl transform transition-all duration-300 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">🌸</div>
          <h2 className="font-serif font-bold text-3xl text-[#393f49] mb-2">
            Welcome to Discovery
          </h2>
          <p className="font-['Outfit'] text-base text-[#696f8c]">
            Support early-stage projects you believe in
          </p>
        </div>

        {/* What is Pledge Power */}
        <div className="mb-6">
          <h3 className="font-['Outfit'] font-semibold text-lg text-[#393f49] mb-3 flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            What is Pledge Power?
          </h3>
          <p className="font-['Outfit'] text-sm text-[#696f8c] leading-relaxed mb-3">
            Pledge Power is your <span className="font-semibold">free weekly signal</span> to show
            support for projects you're excited about. Every user gets{' '}
            <span className="font-semibold">1000 Pledge Power per week</span>.
          </p>
        </div>

        {/* How it Works */}
        <div className="mb-6">
          <h3 className="font-['Outfit'] font-semibold text-lg text-[#393f49] mb-3">
            How it works:
          </h3>
          <div className="space-y-3">
            {[
              {
                emoji: '🎯',
                title: 'Pledge to projects',
                description: 'Allocate your weekly Pledge Power to projects you want to support',
              },
              {
                emoji: '🔄',
                title: 'Risk-free',
                description: 'Cancel anytime for full refund before the project launches',
              },
              {
                emoji: '🏆',
                title: 'Earn rewards',
                description: 'Get verified proof of early support and unlock exclusive perks',
              },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-2xl">{item.emoji}</span>
                <div>
                  <h4 className="font-['Outfit'] font-semibold text-sm text-[#393f49]">
                    {item.title}
                  </h4>
                  <p className="font-['Outfit'] text-xs text-[#696f8c]">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Reset Info */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 mb-6">
          <p className="font-['Outfit'] text-xs text-[#696f8c] text-center">
            <span className="font-semibold text-[#393f49]">Pro tip:</span> Your Pledge Power
            resets every Monday at UTC 0:00. Unused power doesn't carry over!
          </p>
        </div>

        {/* CTA Button */}
        <button
          onClick={handleClose}
          className="w-full py-3 rounded-xl font-['Outfit'] font-semibold text-base text-white bg-gradient-to-r from-[#a59af3] to-[#eb7cff] hover:opacity-90 transition-opacity shadow-[0px_1px_1px_0.05px_rgba(24,24,27,0.24)]"
        >
          Start Exploring Projects
        </button>
      </div>
    </div>
  );
}
