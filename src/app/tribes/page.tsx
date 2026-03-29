import { Suspense } from 'react';
import TribesPageClient from './TribesPageClient';

export const dynamic = 'force-dynamic';

export default function TribesPage() {
  return (
    <Suspense>
      <TribesPageClient />
    </Suspense>
  );
}
