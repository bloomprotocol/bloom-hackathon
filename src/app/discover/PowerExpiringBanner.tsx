'use client';

interface PowerExpiringBannerProps {
  remaining: number;
  hoursUntilReset: number;
}

export default function PowerExpiringBanner({ remaining, hoursUntilReset }: PowerExpiringBannerProps) {
  // Only show if less than 24 hours until reset and remaining < 200
  if (hoursUntilReset >= 24 || remaining >= 200) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl px-4 py-3 border border-orange-200 mb-4">
      <div className="flex items-center gap-2">
        <span className="text-xl">⏰</span>
        <p className="font-['Outfit'] text-sm text-[#393f49]">
          Your <span className="font-semibold">1000 Pledge Power</span> resets in{' '}
          <span className="font-semibold">{hoursUntilReset} hours</span>. Use{' '}
          <span className="font-semibold text-orange-600">{remaining} remaining power</span> before it expires!
        </p>
      </div>
    </div>
  );
}
