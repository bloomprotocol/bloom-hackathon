'use client';

import { Suspense, use } from 'react';
import ClaimPage from './ClaimPage';

export default function ClaimPageRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <Suspense fallback={
      <div className="max-w-lg mx-auto py-20 text-center">
        <div className="w-10 h-10 border-[3px] border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    }>
      <ClaimPage useCaseId={id} />
    </Suspense>
  );
}
