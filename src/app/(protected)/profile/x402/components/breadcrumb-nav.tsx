'use client';

import Link from 'next/link';

export default function BreadcrumbNav() {
  return (
    <nav className="breadcrumb-style">
      <Link href="/profile" className="breadcrumb-link hover:underline cursor-pointer">
        Profile Settings
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
      <span className="breadcrumb-current">X402</span>
    </nav>
  );
}
