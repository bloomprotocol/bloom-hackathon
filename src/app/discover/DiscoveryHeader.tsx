'use client';

import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api/apiConfig';

interface DiscoveryStatsResponse {
  success: boolean;
  data: {
    totalPledgesThisWeek: number;
    activeScouts: number;
    totalPledgePowerUsed: number;
    projectsDiscovered: number;
    message: string;
  };
  statusCode: number;
}

export default function DiscoveryHeader() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['discovery-stats'],
    queryFn: async () => {
      const response = await apiGet<DiscoveryStatsResponse>('/public/discovery/stats');
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  if (isLoading) {
    return (
      <div className="relative rounded-[20px] p-6 mb-6 overflow-hidden animate-pulse">
        <div className="absolute inset-0 opacity-80 bg-gradient-to-br from-white/90 via-purple-50/60 to-violet-50/40" />
        <div className="relative">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  const totalPledges = stats?.totalPledgesThisWeek || 0;
  const activeScouts = stats?.activeScouts || 0;
  const totalPower = stats?.totalPledgePowerUsed || 0;
  const projectsDiscovered = stats?.projectsDiscovered || 0;
  const message = stats?.message || 'This week on Bloom';

  // Format numbers with "+" suffix
  const formatNumber = (num: number) => {
    if (num === 0) return '0';
    return `${num}+`;
  };

  return (
    <div className="relative rounded-[20px] p-6 mb-6 overflow-hidden backdrop-blur-sm border border-white/60">
      {/* Holographic gradient background */}
      <div
        className="absolute inset-0 opacity-80"
        style={{
          background: `linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.9) 0%,
            rgba(200, 220, 255, 0.6) 15%,
            rgba(230, 200, 255, 0.5) 30%,
            rgba(255, 220, 240, 0.4) 45%,
            rgba(255, 230, 200, 0.3) 55%,
            rgba(200, 255, 230, 0.4) 70%,
            rgba(180, 200, 255, 0.5) 85%,
            rgba(255, 255, 255, 0.9) 100%
          )`
        }}
      />

      <div className="relative">
        <h2 className="font-serif font-bold text-2xl text-[#1e1b4b] mb-1 tracking-[-0.48px]">
          Discover Projects
        </h2>
        <p className="font-['Outfit'] text-base text-[#6b7280] mb-6">
          {message}
        </p>

        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
          {/* Total Pledges */}
          <div>
            <div className="font-serif font-bold text-3xl text-[#1e1b4b] leading-none mb-1">
              {formatNumber(totalPledges)}
            </div>
            <div className="font-['Outfit'] text-sm text-[#6b7280]">
              pledges this week
            </div>
          </div>

          {/* Active Scouts */}
          <div>
            <div className="font-serif font-bold text-3xl text-[#1e1b4b] leading-none mb-1">
              {formatNumber(activeScouts)}
            </div>
            <div className="font-['Outfit'] text-sm text-[#6b7280]">
              active scouts
            </div>
          </div>

          {/* Total Pledge Power Used */}
          <div>
            <div className="font-serif font-bold text-3xl text-[#1e1b4b] leading-none mb-1">
              {formatNumber(totalPower)}
            </div>
            <div className="font-['Outfit'] text-sm text-[#6b7280]">
              Pledge Power used
            </div>
          </div>

          {/* Projects Discovered */}
          <div>
            <div className="font-serif font-bold text-3xl text-[#1e1b4b] leading-none mb-1">
              {formatNumber(projectsDiscovered)}
            </div>
            <div className="font-['Outfit'] text-sm text-[#6b7280]">
              projects discovered
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
