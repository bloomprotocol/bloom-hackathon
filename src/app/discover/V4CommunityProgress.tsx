'use client';

import type { TribeStatus } from '@/constants/v4-use-case-definitions';

interface V4CommunityProgressProps {
  claimCount: number;
  claimTarget: number;
  tribeStatus: TribeStatus;
  tribeLink?: string;
}

export default function V4CommunityProgress({
  claimCount,
  claimTarget,
  tribeStatus,
  tribeLink,
}: V4CommunityProgressProps) {
  const progress = claimTarget > 0
    ? Math.min((claimCount / claimTarget) * 100, 100)
    : 0;
  const remaining = Math.max(claimTarget - claimCount, 0);

  if (tribeStatus === 'open') {
    return (
      <div className="mt-3">
        <div className="w-full h-2 rounded-full bg-green-200">
          <div className="h-full rounded-full bg-green-500" style={{ width: '100%' }} />
        </div>
        <p className="mt-1.5 text-xs text-green-700 font-medium">
          Tribe open{tribeLink ? (
            <>
              {' — '}
              <a href={tribeLink} target="_blank" rel="noopener noreferrer" className="underline hover:text-green-900">
                join now →
              </a>
            </>
          ) : null}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-3">
      <div className="w-full h-2 rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-purple-500 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-1.5 text-xs text-gray-500">
        {claimTarget} to open tribe — {remaining} more needed
      </p>
    </div>
  );
}
