'use client';

import { useEffect, useState } from 'react';

interface FirstPledgeCelebrationProps {
  isOpen: boolean;
  onClose: () => void;
  projectName: string;
  pledgePower: number;
  weeklyPowerUsed: number;
  weeklyPowerTarget: number;
}

export default function FirstPledgeCelebration({
  isOpen,
  onClose,
  projectName,
  pledgePower,
  weeklyPowerUsed,
  weeklyPowerTarget,
}: FirstPledgeCelebrationProps) {
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

  const weeklyProgressPercent = Math.min((weeklyPowerUsed / weeklyPowerTarget) * 100, 100);
  const remainingPower = Math.max(weeklyPowerTarget - weeklyPowerUsed, 0);

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
        {/* Celebration Header */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="font-serif font-bold text-2xl text-[#393f49] mb-2">
            First Pledge Complete!
          </h2>
          <p className="font-['Outfit'] text-sm text-[#696f8c]">
            You just backed <span className="font-semibold text-[#393f49]">{projectName}</span> with{' '}
            <span className="font-semibold text-[#393f49]">{pledgePower} Pledge Power</span>
          </p>
        </div>

        {/* Weekly Power Progress */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="font-['Outfit'] font-semibold text-sm text-[#393f49]">
              Weekly Power Progress
            </span>
            <span className="font-['Outfit'] text-xs text-[#696f8c]">
              {weeklyPowerUsed} / {weeklyPowerTarget}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
            <div
              className="bg-gradient-to-r from-[#a59af3] to-[#eb7cff] h-3 rounded-full transition-all duration-500"
              style={{ width: `${weeklyProgressPercent}%` }}
            />
          </div>
          {remainingPower > 0 && (
            <p className="font-['Outfit'] text-xs text-[#696f8c]">
              <span className="font-semibold text-[#393f49]">{remainingPower} more</span> to unlock your Supporter Identity
            </p>
          )}
        </div>

        {/* What You'll Unlock */}
        <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-4 mb-6 border border-purple-100">
          <h4 className="font-['Outfit'] font-semibold text-sm text-[#393f49] mb-3 flex items-center gap-2">
            <span className="text-base">🎁</span>
            What You'll Unlock
          </h4>
          <div className="space-y-2">
            {[
              { icon: '✨', text: 'Your unique Supporter Identity Card (shareable on X)' },
              { icon: '💧', text: 'Earn Drops as rewards for your support' },
              { icon: '🎯', text: 'Get exclusive perks from projects you back' },
              { icon: '📊', text: 'Build your early-supporter track record' },
            ].map(({ icon, text }, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-sm shrink-0">{icon}</span>
                <span className="font-['Outfit'] text-xs text-[#696f8c] leading-relaxed">
                  {text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* What to do next */}
        <div className="mb-6">
          <h4 className="font-['Outfit'] font-semibold text-sm text-[#393f49] mb-3">
            What to do next:
          </h4>
          <div className="space-y-2.5">
            {[
              { step: '1', text: `Use your remaining ${remainingPower} Weekly Power to unlock your Supporter Identity` },
              { step: '2', text: 'Explore and support more early-stage projects' },
              { step: '3', text: 'Come back next week for fresh Weekly Power' },
            ].map(({ step, text }) => (
              <div key={step} className="flex items-start gap-2.5">
                <div className="size-5 rounded-full bg-[#a59af3] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="font-['Outfit'] text-[10px] font-bold text-white">{step}</span>
                </div>
                <span className="font-['Outfit'] text-xs text-[#696f8c]">
                  {text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 6. CTA Button */}
        <button
          onClick={handleClose}
          className="w-full py-3 rounded-xl font-['Outfit'] font-semibold text-sm text-white bg-gradient-to-r from-[#a59af3] to-[#eb7cff] hover:opacity-90 transition-opacity shadow-[0px_1px_1px_0.05px_rgba(24,24,27,0.24)]"
        >
          Continue Exploring
        </button>
      </div>
    </div>
  );
}
