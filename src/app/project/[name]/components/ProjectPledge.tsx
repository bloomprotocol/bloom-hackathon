export function ProjectPledge() {
  return (
    <div className="bg-white/50 backdrop-blur-sm rounded-[20px] shadow-[0px_6px_10px_-4px_rgba(0,0,0,0.12)] border border-[#E5E5E5] p-5">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="common-pdp-card-title">
          <p>Pledge</p>
        </div>
        <span className="bg-[#e6f4ff] text-[#52c7ff] text-[12px] px-2 py-1 rounded-full">
          Upcoming
        </span>
      </div>

      {/* Progress Circle */}
      <div className="flex flex-col items-center mb-4">
        <div className="relative size-24">
          <svg className="size-full -rotate-90" viewBox="0 0 36 36">
            <path
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#f0f0f0"
              strokeWidth="3"
            />
            <path
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#52c41a"
              strokeWidth="3"
              strokeDasharray="0, 100"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[#52c41a] text-[32px] font-semibold">0%</span>
          </div>
        </div>
      </div>

      {/* Funding Info */}
      <div className="text-center mb-4">
        <p className="text-[#696f8c] text-[14px] mb-1">Funding Thresholds</p>
        <p className="text-[#393f49] text-[14px] font-medium">0 / 10,000</p>
      </div>

      {/* Balance Section */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[#393f49] text-[24px] font-semibold">120.00</p>
            <p className="text-[#696f8c] text-[14px]">Balance:200.00 Max</p>
          </div>
          <div className="flex items-center gap-1">
            <img
              src="https://statics.bloomprotocol.ai/logo/water-drop-icon.svg"
              alt="Drops"
              className="size-6"
            />
            <span className="text-[#393f49] text-[14px]">Drops</span>
          </div>
        </div>
      </div>

      {/* Upcoming Button */}
      <button className="bg-[#ffb3ff] text-white w-full rounded-lg py-3 text-[16px] font-medium hover:opacity-90 transition-opacity">
        Upcoming
      </button>
    </div>
  );
}