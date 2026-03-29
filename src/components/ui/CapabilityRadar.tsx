'use client';

import type { CapabilityScore } from '@/constants/agent-capabilities';

interface CapabilityRadarProps {
  capabilities: CapabilityScore[];
  size?: number;
}

/**
 * SVG radar chart showing agent capability levels across 8 dimensions.
 * Pure CSS + SVG, no external chart library needed.
 */
export default function CapabilityRadar({ capabilities, size = 280 }: CapabilityRadarProps) {
  const center = size / 2;
  const radius = size * 0.38; // Leave room for labels
  const n = capabilities.length;
  if (n === 0) return null;

  const angleStep = (2 * Math.PI) / n;
  // Start from top (-π/2) so first axis points up
  const startAngle = -Math.PI / 2;

  function polarToXY(index: number, r: number): [number, number] {
    const angle = startAngle + index * angleStep;
    return [center + r * Math.cos(angle), center + r * Math.sin(angle)];
  }

  // Grid rings at 25%, 50%, 75%, 100%
  const rings = [0.25, 0.5, 0.75, 1.0];

  // Data polygon
  const dataPoints = capabilities.map((cap, i) => {
    const r = (cap.level / 100) * radius;
    return polarToXY(i, r);
  });
  const dataPath = dataPoints.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x},${y}`).join(' ') + ' Z';

  // Axis lines
  const axes = capabilities.map((_, i) => {
    const [x, y] = polarToXY(i, radius);
    return { x1: center, y1: center, x2: x, y2: y };
  });

  // Labels positioned outside the chart
  const labelRadius = radius + 24;
  const labels = capabilities.map((cap, i) => {
    const [x, y] = polarToXY(i, labelRadius);
    const angle = startAngle + i * angleStep;
    // Determine text-anchor based on position
    const anchor: 'start' | 'middle' | 'end' = Math.abs(Math.cos(angle)) < 0.1 ? 'middle'
      : Math.cos(angle) > 0 ? 'start'
      : 'end';
    return { x, y, label: cap.shortLabel, level: cap.level, color: cap.color, anchor };
  });

  const hasData = capabilities.some((c) => c.level > 0);

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Grid rings */}
        {rings.map((pct) => {
          const r = pct * radius;
          const ringPoints = capabilities.map((_, i) => polarToXY(i, r));
          const ringPath = ringPoints.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x},${y}`).join(' ') + ' Z';
          return (
            <path
              key={pct}
              d={ringPath}
              fill="none"
              stroke="rgba(0,0,0,0.06)"
              strokeWidth={1}
            />
          );
        })}

        {/* Axis lines */}
        {axes.map((axis, i) => (
          <line
            key={i}
            x1={axis.x1}
            y1={axis.y1}
            x2={axis.x2}
            y2={axis.y2}
            stroke="rgba(0,0,0,0.08)"
            strokeWidth={1}
          />
        ))}

        {/* Data polygon */}
        {hasData && (
          <>
            <path
              d={dataPath}
              fill="rgba(196,164,108,0.15)"
              stroke="#c4a46c"
              strokeWidth={2}
              strokeLinejoin="round"
            />
            {/* Data points */}
            {dataPoints.map(([x, y], i) => (
              capabilities[i].level > 0 && (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r={3}
                  fill={capabilities[i].color}
                  stroke="white"
                  strokeWidth={1.5}
                />
              )
            ))}
          </>
        )}

        {/* Labels */}
        {labels.map((l, i) => (
          <g key={i}>
            <text
              x={l.x}
              y={l.y - 5}
              textAnchor={l.anchor}
              className="text-[10px] font-medium fill-gray-600"
              style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}
            >
              {l.label}
            </text>
            <text
              x={l.x}
              y={l.y + 8}
              textAnchor={l.anchor}
              className="text-[9px] font-bold"
              style={{ fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace' }}
              fill={l.level > 0 ? l.color : '#d1d5db'}
            >
              {l.level}
            </text>
          </g>
        ))}
      </svg>

      {!hasData && (
        <p className="text-[11px] text-gray-400 -mt-4 italic text-center">
          Capabilities grow as your agent participates in tribes
        </p>
      )}
    </div>
  );
}
