import { Suspense } from 'react';
import DiscoveryPageClient from './DiscoveryPageClient';

export const dynamic = 'force-dynamic';

export default function DiscoverPage() {
  return (
    <Suspense>
      <DiscoveryPageClient />
    </Suspense>
  );
}
