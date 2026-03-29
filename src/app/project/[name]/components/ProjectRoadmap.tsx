import type { RoadmapPhase } from '../types';

interface RoadmapMilestone extends RoadmapPhase {
  status?: 'completed' | 'in_progress' | 'pending';
  phase_number?: number;
}

interface ProjectRoadmapProps {
  roadmap: RoadmapMilestone[];
}

export function ProjectRoadmap({ roadmap }: ProjectRoadmapProps) {
  if (!roadmap || roadmap.length === 0) {
    return null;
  }

  return (
    <div className="common-pdp-card-style">
      {/* Title - Exactly matching pattern */}
      <div className="common-pdp-card-title">
        <p>Roadmap</p>
      </div>
      
      {/* Roadmap Content */}
      <div className="self-stretch relative">
            <div className="relative size-full">
              <div className="box-border content-stretch flex flex-col gap-6 items-start justify-start pl-2 pr-0 py-0 relative size-full">
                {roadmap.map((milestone, index) => (
                  <div 
                    key={index}
                    className="box-border content-stretch flex flex-row gap-6 items-center justify-start p-0 relative shrink-0 w-full"
                  >
                    {/* Timeline indicator */}
                    <div className="flex flex-row items-center self-stretch">
                      <div className="box-border content-stretch flex flex-col gap-4 h-full items-center justify-start p-0 relative shrink-0">
                        {/* Circle indicator */}
                        {milestone.status === 'completed' ? (
                          <div className="overflow-clip relative shrink-0 size-5">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                              <circle cx="10" cy="10" r="10" fill="#71ca41"/>
                              <path d="M8.5 10.5L9.5 11.5L12 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        ) : (
                          <div className="h-5 relative shrink-0 w-3">
                            <svg width="12" height="20" viewBox="0 0 12 20" fill="none">
                              <circle cx="6" cy="10" r="6" fill="#e7e6f2"/>
                            </svg>
                          </div>
                        )}
                        
                        {/* Vertical line (except for last item) */}
                        {index < roadmap.length - 1 && (
                          <div className={`${
                            milestone.status === 'completed' ? 'bg-[#71ca41]' : 'bg-[#e7e6f2]'
                          } flex-1 w-0.5`} />
                        )}
                      </div>
                    </div>
                    
                    {/* Content - Using Outfit font as per pattern */}
                    <div className="box-border flex flex-col gap-3 items-start justify-start p-0 relative text-left flex-1">
                      <div className="font-['Outfit'] font-medium relative shrink-0 text-[#393f49] text-[14px] tracking-[-0.28px]">
                        <p className="block leading-[1.4]">
                          {milestone.timeline || `Phase ${milestone.phaseNumber || index + 1}`}
                          {milestone.title ? ` — ${milestone.title}` : ''}
                        </p>
                      </div>
                      <div className="font-['Outfit'] font-normal relative shrink-0 text-[#696f8c] text-[14px] tracking-[-0.28px] w-full">
                        <p className="block leading-[1.4]">
                          {milestone.description || ''}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
      </div>
    </div>
  );
}