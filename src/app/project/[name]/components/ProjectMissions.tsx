import Link from "next/link";
import { isMissionExpired } from "@/lib/utils/missionUtils";

interface Mission {
  id: string;
  title: string;
  description: string;
  slug: string;
  imageUrl: string;
  rewards: Array<{
    name: string;
    type: string;
    amount: number | null;
    description?: string;
    icon: string | null;
  }>;
  startTime: string | null;
  endTime: string | null;
}

interface ProjectMissionsProps {
  missions?: Mission[];
}

export function ProjectMissions({ missions = [] }: ProjectMissionsProps) {
  // If no missions, show placeholder
  if (missions.length === 0) {
    return null; // Don't show the card if no missions
  }

  // Get first POINTS reward for each mission (consistent with Mission Detail Page)
  function getMissionPoints(mission: Mission) {
    const pointReward = mission.rewards.find(
      (r) => r.type === "POINTS" && r.amount
    );
    return pointReward?.amount || null;
  }

  return (
    <div className="flex w-full desktop:w-[320px] p-[20px] flex-col items-start gap-4 rounded-[20px] border border-[#E5E5E5] bg-[#8478E0]/10 backdrop-blur-sm shadow-[0px_6px_10px_-4px_rgba(0,0,0,0.12)]">
      {/* Header */}
      <div className="common-pdp-card-title">
        <p>Mission</p>
      </div>

      {/* Mission List */}
      {missions.slice(0, 3).map((mission) => {
        // Show max 3 missions
        const points = getMissionPoints(mission);

        return (
          <div
            key={mission.id}
            className="flex p-[12px] items-center gap-3 self-stretch rounded-xl bg-[rgba(255,255,255,0.60)] shadow-[0px_0px_12px_0px_rgba(0,0,0,0.08)]"
          >
            <Link
              href={`/missions/${mission.slug}`}
              className="flex items-center gap-3 w-full"
            >
              {/* Mission Image - 126x126 */}
              <div className="relative size-[126px] rounded-[9.333px] shrink-0 overflow-hidden">
                {mission.imageUrl ? (
                  <img
                    src={mission.imageUrl}
                    alt={mission.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100" />
                )}
              </div>

              {/* Mission Content */}
              <div className="flex-1 flex flex-col gap-[12px] justify-center">
                <div className="flex flex-col gap-[4px]">
                  <h4 className="text-[#393f49] text-[14px] font-semibold leading-[1.2] line-clamp-1">
                    {mission.title}
                  </h4>
                  <p className="text-[#696f8c] text-[12px] font-normal leading-[1.4] line-clamp-2">
                    {mission.description}
                  </p>
                </div>
                <div className="bg-[rgba(255,255,255,0.8)] border-[0.5px] border-[#e7e6f2] border-solid rounded-[27px] shadow-[0px_0px_12px_0px_rgba(0,0,0,0.08)] w-fit">
                  <div className="flex flex-row items-center px-[6px] py-[4px] gap-[2px]">
                    <div className="size-4 shrink-0">
                      <img
                        alt="points"
                        className="block size-full"
                        src="https://statics.bloomprotocol.ai/logo/water-drop-icon.svg"
                      />
                    </div>
                    <div className="font-normal text-[#393f49] text-[14px] leading-none">
                      {points || '0'}
                    </div>
                  </div>
                </div>
                {isMissionExpired(mission.endTime) ? (
                  <button className="w-full h-[24px] rounded-[27px] bg-gray-300 text-gray-500 hover:bg-gray-400 transition-colors px-[16px] py-[8px] flex items-center justify-center font-medium text-[12px] leading-none">
                    Ended
                  </button>
                ) : (
                  <button className="w-full h-[24px] relative rounded-[27px] bg-[#eb7cff] text-white hover:bg-[#E563FF] shadow-[0px_1px_1px_0.05px_rgba(24,24,27,0.24)] transition-colors px-[16px] py-[8px] flex items-center justify-center gap-[4px] font-medium text-[12px] leading-none">
                    Start
                    <div className="absolute inset-0 pointer-events-none shadow-[0px_2px_0px_0px_inset_rgba(255,255,255,0.1),0px_8px_16px_0px_inset_rgba(255,255,255,0.16)] rounded-[27px]" />
                  </button>
                )}
              </div>
            </Link>
          </div>
        );
      })}
    </div>
  );
}
