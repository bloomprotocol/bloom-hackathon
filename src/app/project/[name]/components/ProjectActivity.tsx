import type { Updates } from '../types';

interface ProjectActivityProps {
  updates?: Updates;
}

export function ProjectActivity({ updates }: ProjectActivityProps) {
  // Combine BUILDER_UPDATE and MILESTONE_REACHED updates
  const activities = [
    ...(updates?.BUILDER_UPDATE || []),
    ...(updates?.MILESTONE_REACHED || [])
  ];

  return (
    <div className="common-pdp-card-style w-full desktop:w-[320px]">
      <div className="flex flex-col gap-4 items-start justify-start overflow-clip">
          {/* Header */}
          <div className="box-border content-stretch flex flex-row font-semibold items-center justify-between leading-[0] p-0 relative shrink-0 text-left text-nowrap w-full">
            <div className="common-pdp-card-title">
              <p>Recent Activity</p>
            </div>
            <div className="flex flex-col justify-center relative shrink-0 text-[#8478e0] text-[12px]">
              <p className="block leading-none text-nowrap whitespace-pre">View More</p>
            </div>
          </div>

          {/* Activity Items */}
          <div className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full">
            {activities.length > 0 ? (
              activities.map((update, index) => (
                <div key={index} className="w-full">
                  {index > 0 && (
                    <div className="h-0 relative w-full">
                      <div className="absolute bottom-0 left-0 right-0 top-[-2px]">
                        <img alt="" className="block max-w-none w-full h-full" src="https://statics.bloomprotocol.ai/images/divider-line.svg" />
                      </div>
                    </div>
                  )}
                  <div className="relative rounded-xl w-full">
                    <div className="relative size-full">
                      <div className="box-border content-stretch flex flex-col gap-3 items-start justify-start py-4 relative w-full">
                        {/* Main row */}
                        <div className="box-border content-stretch flex flex-row gap-3 items-center justify-start p-0 relative shrink-0 w-full">
                          <div className="basis-0 box-border content-stretch flex flex-col gap-1 grow items-start justify-start min-h-px min-w-px p-0 relative shrink-0">
                            {/* Title */}
                            <div className="flex flex-col font-medium h-[17px] justify-center leading-[0] overflow-ellipsis overflow-hidden relative shrink-0 text-[#393f49] text-[12px] text-left text-nowrap w-full">
                              <p className="block leading-[1.4] overflow-inherit">{update.title}</p>
                            </div>
                            {/* Meta - using description field */}
                            <div className="flex flex-col font-normal justify-center leading-[0] relative shrink-0 text-[#696f8c] text-[12px] text-left">
                              <p className="block leading-[1.4] line-clamp-2">{update.description}</p>
                            </div>
                          </div>
                          {/* Icon */}
                          <div className="bg-[#f6f6f6] relative rounded-[100px] shrink-0">
                            <div className="flex flex-row items-center relative size-full">
                              <div className="box-border content-stretch flex flex-row gap-2 items-center justify-start p-[10px] relative">
                                <div className="overflow-clip relative shrink-0 size-5">
                                  <img src="https://statics.bloomprotocol.ai/icon/yoona-share.svg" alt="update" className="w-full h-full" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-[#696f8c] text-[12px]">
                No recent activity
              </div>
            )}
          </div>
      </div>
    </div>
  );
}