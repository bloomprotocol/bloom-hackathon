'use client';

import { Suspense } from 'react';
import SkillsPageClient from './SkillsPageClient';

export default function SkillsPage() {
  return (
    <Suspense>
      <SkillsPageClient />
    </Suspense>
  );
}
