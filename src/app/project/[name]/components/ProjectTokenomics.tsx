import TokenomicsPieChart from '@/components/charts/TokenomicsPieChart';
import { TokenomicsItem } from '@/lib/api/services/projectService';

interface ProjectTokenomicsProps {
  tokenomics: TokenomicsItem[] | null;
}

export function ProjectTokenomics({ tokenomics }: ProjectTokenomicsProps) {
  if (!tokenomics || !Array.isArray(tokenomics) || tokenomics.length === 0) {
    return (
      <div className="flex items-center justify-center w-full min-h-[200px]">
        <p className="text-black/60">No tokenomics information available.</p>
      </div>
    );
  }

  // Filter out items with 0 or null percentage
  const chartData = tokenomics.filter(item => item.percentage && item.percentage > 0);

  return (
    <>
      {/* Distribution Chart */}
      {chartData.length > 0 ? (
        <TokenomicsPieChart data={chartData} />
      ) : (
        <div className="flex items-center justify-center w-full min-h-[200px]">
          <p className="text-black/60">No token distribution data available.</p>
        </div>
      )}
    </>
  );
}