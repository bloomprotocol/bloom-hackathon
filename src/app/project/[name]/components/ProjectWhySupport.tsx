"use client";

import { useState, useMemo } from "react";

interface WhySupportItem {
  title: string;
  description: string;
  image_url?: string | null;
}

interface ProjectWhySupportProps {
  data: WhySupportItem[];
  className?: string;
}

export function ProjectWhySupport({ data, className }: ProjectWhySupportProps) {
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  // Filter and validate data
  const validItems = useMemo(() => 
    (data || []).filter(item => 
      item && 
      typeof item === 'object' &&
      item.title && 
      item.title.trim() !== ''
      // Allow empty description - it's optional
    ), 
    [data]
  );

  // If no valid data, don't render component
  if (!validItems || validItems.length === 0) {
    return null;
  }

  const handleImageError = (index: number) => {
    setImageErrors(prev => new Set(prev).add(index));
  };

  // No need to pre-group items, let CSS handle the layout

  return (
    <div className={`common-pdp-card-style ${className || ''}`}>
      {/* Title - Exactly from Figma */}
      <div className="common-pdp-card-title">
        <p>Why Support?</p>
      </div>
      
      {/* Content Container - Grid layout for responsive design */}
      <div className="grid grid-cols-1 desktop:grid-cols-2 gap-4 w-full">
        {/* Map through items directly */}
        {validItems.map((item, index) => (
          <div key={index} className="box-border flex flex-row gap-3 items-center justify-start p-0 relative rounded-xl w-full">
            {/* Icon Container - Exactly from Figma */}
            <div className="bg-[rgba(76,190,255,0.1)] box-border flex flex-row gap-2 items-center justify-start p-[16px] relative rounded-lg shrink-0">
              {item.image_url && !imageErrors.has(index) ? (
                <img
                  src={item.image_url}
                  alt=""
                  className="shrink-0 w-[48px] h-[48px] object-cover"
                  onError={() => handleImageError(index)}
                />
              ) : (
                <div className="bg-[rgba(76,190,255,0.3)] shrink-0 w-[48px] h-[48px] rounded-md" />
              )}
            </div>
            
            {/* Text Content - Exactly from Figma */}
            <div className="flex flex-col gap-2 flex-1">
              <div className="font-['Outfit'] font-medium text-[#393f49] text-[14px] tracking-[-0.28px]">
                <p className="leading-[1.4]">{item.title}</p>
              </div>
              {item.description && item.description.trim() !== '' && (
                <div className="font-['Outfit'] font-normal text-[#696f8c] text-[12px]">
                  <p className="leading-[1.4]">{item.description}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}