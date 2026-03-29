'use client';

import Link from 'next/link';
import { useBuilderMission } from '../contexts/builder-mission-context';

export default function BreadcrumbNav() {
  const { mission } = useBuilderMission();

  return (
    <nav className="breadcrumb-style">
      <Link href="/builder" className="breadcrumb-link hover:underline cursor-pointer">
        Builder
      </Link>
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        className="breadcrumb-separator"
      >
        <path
          d="M6 4L10 8L6 12"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="breadcrumb-current">{mission?.title || 'Mission'}</span>
    </nav>
  );
}
