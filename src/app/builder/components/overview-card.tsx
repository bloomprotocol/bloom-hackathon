'use client';

import { useBuilderDashboard } from '../contexts/builder-dashboard-context';

/**
 * Overview Card
 * Shows key stats in a 2x2 visual grid with icons + colored accent pills
 */
export default function OverviewCard() {
  const { stats } = useBuilderDashboard();

  // Format number with commas (consistent between server/client to avoid hydration mismatch)
  const formatNumber = (num: number) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  const statItems = [
    {
      label: 'Total Missions',
      value: stats.totalMissions,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M3 7v1a3 3 0 006 0V7m0 0V4a1 1 0 011-1h4a1 1 0 011 1v3m0 0v1a3 3 0 006 0V7m-6 0h6M9 7H3m12 0h6" />
        </svg>
      ),
      bgColor: 'bg-[#f0eefb]',
      iconColor: 'text-[#8478e0]',
      valueColor: 'text-[#8478e0]',
    },
    {
      label: 'Active',
      value: stats.activeMissions,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      bgColor: 'bg-[#e8f9ef]',
      iconColor: 'text-[#00C853]',
      valueColor: 'text-[#00C853]',
    },
    {
      label: 'Supporters',
      value: formatNumber(stats.uniqueSubmissions),
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      bgColor: 'bg-[#e8f0fb]',
      iconColor: 'text-[#4A90D9]',
      valueColor: 'text-[#4A90D9]',
    },
    {
      label: 'Submissions',
      value: formatNumber(stats.totalSubmissions),
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      bgColor: 'bg-[#f3f3f5]',
      iconColor: 'text-[#696f8c]',
      valueColor: 'text-[#696f8c]',
    },
  ];

  return (
    <div className="common-container-style">
      {/* Card Title */}
      <h3
        className="text-[20px] font-bold text-[#393f49] mb-5"
        style={{ fontFamily: 'Times, serif' }}
      >
        OVERVIEW
      </h3>

      {/* 2x2 Stat Grid */}
      <div className="grid grid-cols-2 gap-3">
        {statItems.map((item) => (
          <div
            key={item.label}
            className={`${item.bgColor} rounded-2xl p-4 flex flex-col gap-2`}
          >
            <div className={`${item.iconColor}`}>
              {item.icon}
            </div>
            <div
              className={`text-[28px] font-bold leading-none ${item.valueColor}`}
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              {item.value}
            </div>
            <div
              className="text-[13px] text-[#696f8c] font-medium"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              {item.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
