'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { TokenomicsItem } from '@/lib/api/services/projectService';
import { useEffect, useState } from 'react';

interface TokenomicsPieChartProps {
  data: TokenomicsItem[];
}

// Define colors for the pie chart segments
const COLORS = [
  '#8B5CF6', // Purple
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#6366F1', // Indigo
  '#EC4899', // Pink
  '#14B8A6', // Teal
];

export default function TokenomicsPieChart({ data }: TokenomicsPieChartProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1280);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Transform data for recharts
  const chartData = data.map((item) => ({
    name: item.category,
    value: Number(item.percentage) || 0, // Ensure it's a number
    description: item.description,
    vestingSchedule: item.vestingSchedule,
  }));

  // Custom label renderer for desktop (percentage only)
  const renderCustomLabel = (entry: any) => {
    return null; // Don't display percentage on the chart
  };

  // Custom label for mobile with name and percentage on separate lines
  const renderMobileLabel = (props: any) => {
    return null; // Don't display labels on mobile either
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-black">{data.name}</p>
          <p className="text-black">{data.value}%</p>
          {data.description && (
            <p className="text-sm text-gray-600 mt-1">{data.description}</p>
          )}
          {data.vestingSchedule && (
            <p className="text-sm text-gray-500 mt-1">Vesting: {data.vestingSchedule}</p>
          )}
        </div>
      );
    }
    return null;
  };

  // Custom legend content for desktop
  const renderDesktopLegend = () => (
    <div className="box-border content-stretch flex flex-col gap-4 items-start justify-start p-0 relative shrink-0 w-full desktop:w-auto desktop:flex-1">
      {chartData.map((item, index) => (
        <div key={`legend-${item.name}-${index}`} className="box-border content-stretch flex flex-row gap-3 items-start justify-start p-0 relative shrink-0 w-full">
          <div 
            className="min-h-5 min-w-5 rounded shrink-0 size-5" 
            style={{ backgroundColor: COLORS[index % COLORS.length] }}
          />
          <div className="basis-0 box-border content-stretch flex flex-col gap-1 grow items-start justify-start min-h-px min-w-px p-0 relative shrink-0">
            <div className="box-border content-stretch flex flex-row items-center justify-start p-0 relative shrink-0 w-full">
              <div className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0">
                <div className="font-normal leading-[0] relative shrink-0 text-[#393f49] text-[14px] text-left text-nowrap tracking-[-0.28px]">
                  <p className="adjustLetterSpacing block leading-[1.4] whitespace-pre">{item.name}</p>
                </div>
              </div>
            </div>
            {(item.description || item.vestingSchedule) && (
              <div className="font-normal leading-[0] relative shrink-0 text-[#696f8c] text-[12px] text-left w-full">
                <p className="block leading-[1.4]">
                  {item.vestingSchedule || item.description || ''}
                </p>
              </div>
            )}
          </div>
          <div className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0">
            <div className="font-semibold leading-[0] relative shrink-0 text-[#393f49] text-[14px] text-left text-nowrap">
              <p className="block leading-[1.2] whitespace-pre">{item.value}%</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="common-pdp-card-style">
      {/* Title */}
      <div className="common-pdp-card-title">
        <p>Tokenomics</p>
      </div>
      
      {/* Content */}
      <div className="self-stretch flex flex-col desktop:flex-row gap-8 items-start justify-start">
        {/* Pie Chart - left aligned on mobile */}
        <div className="w-[160px] desktop:w-auto desktop:shrink-0 h-[160px] desktop:h-[160px]" style={{ pointerEvents: 'none' }}>
        <ResponsiveContainer width={160} height={160}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={isMobile ? renderMobileLabel : renderCustomLabel}
              outerRadius={isMobile ? 70 : 80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

        {/* Legend - show on both mobile and desktop */}
        {renderDesktopLegend()}
      </div>
    </div>
  );
}