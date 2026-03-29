'use client';

import DimensionBar from './DimensionBar';
import { DimensionScores } from '@/lib/api/services/identityService';

interface DimensionBarsProps {
  dimensions: DimensionScores;
  className?: string;
}

/**
 * Dimension Bars container for Identity Card V2
 * Displays 2-axis dimensional system: Conviction ↔ Curiosity, Intuition ↔ Analysis
 * Only shown for OpenClaw-minted cards
 *
 * Note: Contribution is NOT displayed as a bar (it's a qualifier, not an axis)
 */
export default function DimensionBars({ dimensions, className = '' }: DimensionBarsProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Section Header */}
      <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
        Supporter Dimensions
      </div>

      {/* 2-Axis Dimension Bars */}
      <div className="space-y-5">
        <DimensionBar
          leftLabel="Conviction"
          rightLabel="Curiosity"
          value={dimensions.conviction}
          color="from-purple-500 to-purple-400"
        />
        <DimensionBar
          leftLabel="Intuition"
          rightLabel="Analysis"
          value={dimensions.intuition}
          color="from-blue-500 to-blue-400"
        />
      </div>

      {/* Helper Text */}
      <p className="text-xs text-gray-400 italic mt-3">
        AI-powered 2-axis personality analysis
      </p>
    </div>
  );
}
