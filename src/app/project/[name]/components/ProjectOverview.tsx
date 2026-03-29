'use client';

import { useEffect, useState } from 'react';
import type { Project, ProjectContent, ProjectStats } from '../types';

interface ProjectOverviewProps {
  project: Project;
  content: ProjectContent | null;
  stats: ProjectStats | null;
}

export function ProjectOverview({ project, content, stats }: ProjectOverviewProps) {
  const [sanitizedOverview, setSanitizedOverview] = useState<string>('');
  const [sanitizedSections, setSanitizedSections] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    // Dynamic import to avoid Turbopack ESM issues
    import('isomorphic-dompurify').then((DOMPurify) => {
      const sanitize = DOMPurify.default.sanitize;

      // Sanitize overview
      setSanitizedOverview(sanitize(content?.overview || project.whyMe || 'No description available.'));

      // Sanitize custom sections
      if (content?.custom && content.custom.length > 0) {
        const sections: { [key: string]: string } = {};
        content.custom.forEach((section: any) => {
          if (section.content) {
            sections[section.id] = sanitize(section.content);
          }
        });
        setSanitizedSections(sections);
      }
    });
  }, [content, project.whyMe]);

  return (
    <div className="space-y-6">
      {/* Overview - Matching Figma design */}
      <div className="common-pdp-card-style">
        {/* Title - Exactly from Figma */}
        <div className="common-pdp-card-title">
          <p>Overview</p>
        </div>
        {/* Description - Exactly from Figma */}
        <div className="font-['Outfit'] font-normal relative shrink-0 text-[#696f8c] text-[14px] tracking-[-0.28px] w-full">
          <p
            className="block leading-[1.4]"
            dangerouslySetInnerHTML={{ __html: sanitizedOverview }}
          />
        </div>
      </div>

      {/* Custom Content Sections */}
      {content?.custom && content.custom.length > 0 &&
        content.custom.map((section: any) => (
          <div key={section.id} className="self-stretch project-section-card">
            <div className="self-stretch justify-center text-[#393f49] text-base font-semibold font-['Wix_Madefor_Display'] leading-tight">
              {section.title || section.sectionType}
            </div>
            {section.content && sanitizedSections[section.id] && (
              <div
                className="self-stretch justify-center text-[#696f8c] text-sm font-normal font-['Wix_Madefor_Display'] leading-tight"
                dangerouslySetInnerHTML={{ __html: sanitizedSections[section.id] }}
              />
            )}
          </div>
        ))
      }
    </div>
  );
}
