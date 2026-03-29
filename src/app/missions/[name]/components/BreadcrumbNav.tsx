'use client';

import Link from 'next/link';

interface BreadcrumbNavProps {
  mission: {
    title: string;
    project?: {
      id: string;
      name: string;
      slug: string;
    } | null;
  } | null;
}

export default function BreadcrumbNav({ mission }: BreadcrumbNavProps) {
  // Determine the parent link and label based on whether mission has a project
  const project = mission?.project;
  const parentHref = project ? `/project/${project.slug}` : '/missions';
  const parentLabel = project ? project.name : 'Missions';

  return (
    <nav className="breadcrumb-style">
      <Link href={parentHref} className="breadcrumb-link hover:underline cursor-pointer">
        {parentLabel}
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
