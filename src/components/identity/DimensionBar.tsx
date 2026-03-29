'use client';

interface DimensionBarProps {
  leftLabel: string;   // e.g., "Conviction"
  rightLabel: string;  // e.g., "Curiosity"
  value: number;       // 0-100
  color?: string;      // Tailwind gradient class (e.g., 'from-purple-500 to-purple-400')
}

/**
 * Single dimension bar component for Identity Card V2
 * Shows dual-ended spectrum labels and visual progress bar
 */
export default function DimensionBar({
  leftLabel,
  rightLabel,
  value,
  color = 'from-purple-500 to-purple-400'
}: DimensionBarProps) {
  // Ensure value is between 0-100
  const normalizedValue = Math.min(Math.max(value, 0), 100);

  return (
    <div className="space-y-2">
      {/* Dual Labels with Dots */}
      <div className="flex items-center justify-between text-xs font-['IBM_Plex_Mono'] text-gray-600">
        <span>{leftLabel}</span>
        <span className="text-gray-400 opacity-50 mx-1">• •</span>
        <span>{rightLabel}</span>
      </div>

      {/* Progress Bar */}
      <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        {/* Fill */}
        <div
          className={`absolute inset-y-0 left-0 bg-gradient-to-r ${color} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${normalizedValue}%` }}
        />
        {/* Subtle shine effect */}
        <div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          style={{ width: `${normalizedValue}%` }}
        />
      </div>

      {/* Value (optional display) */}
      <div className="text-right">
        <span className="text-xs font-['IBM_Plex_Mono'] text-gray-500">{normalizedValue}</span>
      </div>
    </div>
  );
}
