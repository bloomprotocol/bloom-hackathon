"use client";

interface MissionSelectionCriteriaCardProps {
  criteria?: string[];
  className?: string;
}

export function MissionSelectionCriteriaCard({ 
  criteria = [],
  className = ""
}: MissionSelectionCriteriaCardProps) {

  return (
    <div className={`backdrop-blur-[5px] bg-white/50 flex w-full desktop:w-[320px] flex-col gap-4 items-start justify-start p-5 rounded-2xl shadow-[0px_6px_10px_-4px_rgba(0,0,0,0.12),0px_0px_0px_1px_rgba(0,0,0,0.05)] ${className}`}>
      {/* Header - Figma specific typography */}
      <div className="flex flex-col gap-2 w-full">
        <div className="font-bold text-[#393f49] text-[18px] leading-none" style={{ fontFamily: 'Times, serif' }}>
          Selection Criteria
        </div>
      </div>

      {/* Criteria List - Using native HTML list as per Figma */}
      {criteria.length > 0 ? (
        <ul 
          className="list-disc text-[#696f8c] text-[14px] tracking-[-0.28px] w-full pl-[21px]" 
          style={{ fontFamily: 'Outfit, sans-serif' }}
        >
          {criteria.map((criterion, index) => (
            <li key={index} className="mb-1 last:mb-0">
              <span className="leading-[1.4]">{criterion}</span>
            </li>
          ))}
        </ul>
      ) : (
        <div 
          className="text-[14px] text-[#696f8c] text-center py-4 w-full" 
          style={{ fontFamily: 'Outfit, sans-serif' }}
        >
          No specific criteria required
        </div>
      )}
    </div>
  );
}