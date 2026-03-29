import { Suspense } from 'react';
import StartClient from './StartClient';

export const dynamic = 'force-dynamic';

export default function StartPage() {
  return (
    <Suspense>
      <StartClient />
    </Suspense>
  );
}
