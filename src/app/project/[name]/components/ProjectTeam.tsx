import type { TeamMember } from '../types';

interface ProjectTeamProps {
  team: TeamMember[];
}

export function ProjectTeam({ team }: ProjectTeamProps) {
  if (!team || team.length === 0) {
    return null;
  }

  return (
    <div className="common-pdp-card-style">
      {/* Title */}
      <div className="common-pdp-card-title">
        <p>Team</p>
      </div>
      
      {/* Team Members - Mobile: Stack vertically, Desktop: Grid */}
      <div className="grid grid-cols-1 desktop:grid-cols-3 gap-4 w-full">
        {team.map((member, index) => (
          <div 
            key={index} 
            className="box-border flex flex-col gap-3 items-center justify-start px-3 py-4 relative rounded-xl w-full border border-neutral-200"
          >
              {/* Avatar - Placeholder since we're ignoring images */}
              <div className="relative shrink-0 size-14 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-2xl text-purple-600 font-semibold">
                  {member.name?.charAt(0) || '?'}
                </span>
              </div>
              
              {/* Content */}
              <div className="box-border flex flex-col gap-2 items-start justify-start p-0 relative shrink-0 w-full">
                <div className="box-border flex flex-col gap-2 items-center justify-start p-0 relative shrink-0 w-full">
                  {/* Role Badge - Exactly from Figma */}
                  {member.role && (
                    <div className="backdrop-blur-sm backdrop-filter bg-[rgba(132,120,224,0.1)] box-border flex flex-row gap-2 items-center justify-center px-2.5 py-1 relative rounded-[32px] shrink-0">
                      <div className="font-['Outfit'] font-medium relative shrink-0 text-[#8478e0] text-[12px] text-left text-nowrap">
                        <p className="block leading-[1.4] whitespace-pre">{member.role}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Name - Exactly from Figma */}
                  <div className="font-['Outfit'] font-medium relative shrink-0 text-[#393f49] text-[14px] text-center tracking-[-0.28px] w-full">
                    <p className="block leading-[1.4]">{member.name}</p>
                  </div>
                </div>
                
                {/* Bio - Exactly from Figma */}
                {member.bio && (
                  <div className="font-['Outfit'] font-normal relative shrink-0 text-[#696f8c] text-[12px] text-center w-full">
                    <p className="block leading-[1.4]">{member.bio}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}