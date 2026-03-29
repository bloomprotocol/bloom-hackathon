"use client";

import { useEffect, useState, useMemo } from 'react';

interface WhyThisMattersItem {
  title: string;
  description: string;
}

interface ProjectWhyThisMatterProps {
  data: WhyThisMattersItem[];
  className?: string;
}

export function ProjectWhyThisMatters({ data, className }: ProjectWhyThisMatterProps) {
  const [sanitizedDescription, setSanitizedDescription] = useState<string>('');

  // Get valid item first
  const item = useMemo(() => {
    if (!data || data.length === 0) return null;
    const first = data[0];
    if (!first || !first.title || !first.description) return null;
    return first;
  }, [data]);

  useEffect(() => {
    if (!item) return;
    // Dynamic import to avoid Turbopack ESM issues
    import('isomorphic-dompurify').then((DOMPurify) => {
      setSanitizedDescription(DOMPurify.default.sanitize(item.description));
    });
  }, [item]);

  if (!item) {
    return null;
  }

  return (
    <div className={`common-pdp-card-style ${className || ''}`}>
      {/* Title - Exactly from Overview */}
      <div className="common-pdp-card-title">
        <p>{item.title}</p>
      </div>

      {/* Description - Exactly from Overview */}
      <div className="font-['Outfit'] font-normal relative shrink-0 text-[#696f8c] text-[14px] tracking-[-0.28px] w-full">
        <p
          className="block leading-[1.4]"
          dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
        />
      </div>
    </div>
  );
}
