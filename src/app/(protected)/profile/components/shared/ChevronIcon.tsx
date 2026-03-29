"use client";

interface ChevronIconProps {
  /** Direction the chevron points - affects rotation */
  direction?: 'down' | 'up' | 'left' | 'right';
  /** Size in pixels - default 16 */
  size?: number;
  /** Stroke color - default #696f8c */
  color?: string;
  /** Additional class names */
  className?: string;
}

/**
 * Reusable chevron icon component
 * Used for expandable sections and navigation
 */
export function ChevronIcon({
  direction = 'down',
  size = 16,
  color = '#696f8c',
  className = '',
}: ChevronIconProps) {
  const rotationMap = {
    down: 0,
    up: 180,
    left: 90,
    right: -90,
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      className={`transition-transform duration-200 ${className}`}
      style={{ transform: `rotate(${rotationMap[direction]}deg)` }}
    >
      <path
        d="M4 6L8 10L12 6"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
