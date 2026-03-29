"use client";

import { useMemo } from "react";

interface TractionItem {
  title: string;        // Large metric value (e.g., "5,000+", "150%")
  description: string;  // Metric description (e.g., "Test users", "Goal achieved")
}

interface ProjectTractionProps {
  data: TractionItem[];
  className?: string;
}

export function ProjectTraction({ data, className }: ProjectTractionProps) {
  // Filter and validate data
  const validItems = useMemo(() => 
    (data || []).filter(item => 
      item && 
      typeof item === 'object' &&
      item.title && 
      item.description && 
      item.title.trim() !== '' && 
      item.description.trim() !== ''
    ), 
    [data]
  );

  // If no valid data, don't render component
  if (!validItems || validItems.length === 0) {
    return null;
  }

  const formatMetricValue = (title: string) => {
    // Simple formatting - could be extended for specific metric types
    return title.trim();
  };

  return (
    <div className={`common-pdp-card-style ${className || ''}`}>
      {/* Title */}
      <div className="common-pdp-card-title">
        <p>Traction</p>
      </div>
      
      {/* Horizontal Metrics Row - Mobile: Stack vertically, Desktop: Horizontal row */}
      <div className="box-border flex flex-col gap-4 min-[768px]:flex-row items-start justify-start w-full">
        {validItems.map((item, index) => (
          <div
            key={index}
            className="bg-[rgba(113,202,65,0.1)] box-border flex flex-col gap-1 items-center justify-start p-[12px] relative rounded-xl 
                       w-full min-[768px]:basis-0 min-[768px]:grow min-[768px]:min-h-px min-[768px]:min-w-px min-[768px]:shrink-0 
                       text-center"
          >
            {/* Large Metric Value */}
            <div className="flex flex-col font-['Outfit'] font-medium justify-center text-[#71ca41] text-[20px] tracking-[-0.4px]">
              <p className="adjustLetterSpacing block leading-[1.4] text-nowrap whitespace-pre">
                {formatMetricValue(item.title)}
              </p>
            </div>
            
            {/* Metric Description */}
            <div className="flex flex-col font-['Outfit'] font-normal justify-center text-[#696f8c] text-[12px]">
              <p className="block leading-[1.4] text-nowrap whitespace-pre">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}