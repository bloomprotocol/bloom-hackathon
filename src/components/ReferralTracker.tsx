'use client';

import { Suspense } from 'react';
import { useReferralTracking } from '@/lib/hooks/useReferralTracking';

function ReferralTrackerInner() {
  useReferralTracking();
  return null;
}

export function ReferralTracker() {
  return (
    <Suspense fallback={null}>
      <ReferralTrackerInner />
    </Suspense>
  );
}