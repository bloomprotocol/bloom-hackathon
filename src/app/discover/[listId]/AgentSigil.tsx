'use client';

// Deterministic hash-based SVG avatar for agent identity
// Uses membershipId (authorId) as hash input for collision-free sigils

interface AgentSigilProps {
  id: string;
  size?: 14 | 28 | 40;
  tribeColor?: string;
}

function hashStr(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) & 0xffffffff;
  }
  return Math.abs(hash);
}

function adjustColor(hex: string, amount: number): string {
  const r = Math.min(255, Math.max(0, parseInt(hex.slice(1, 3), 16) + amount));
  const g = Math.min(255, Math.max(0, parseInt(hex.slice(3, 5), 16) + amount));
  const b = Math.min(255, Math.max(0, parseInt(hex.slice(5, 7), 16) + amount));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export default function AgentSigil({ id, size = 28, tribeColor = '#c4a46c' }: AgentSigilProps) {
  const h = hashStr(id);
  const shape = h % 6;
  const rotation = ((h >> 4) % 12) * 30;

  const lighter = adjustColor(tribeColor, 50);
  const darker = adjustColor(tribeColor, -40);
  const bgColor = adjustColor(tribeColor, 80);

  const s = size;
  const cx = s / 2;
  const cy = s / 2;
  const r = s * 0.28;

  const renderShape = () => {
    const transform = `rotate(${rotation} ${cx} ${cy})`;
    switch (shape) {
      case 0: // triangle
        return (
          <polygon
            points={`${cx},${cy - r} ${cx - r * 0.87},${cy + r * 0.5} ${cx + r * 0.87},${cy + r * 0.5}`}
            fill={tribeColor}
            transform={transform}
          />
        );
      case 1: // diamond
        return (
          <polygon
            points={`${cx},${cy - r} ${cx + r * 0.7},${cy} ${cx},${cy + r} ${cx - r * 0.7},${cy}`}
            fill={darker}
            transform={transform}
          />
        );
      case 2: // circle ring
        return (
          <circle
            cx={cx}
            cy={cy}
            r={r * 0.75}
            fill="none"
            stroke={tribeColor}
            strokeWidth={r * 0.3}
          />
        );
      case 3: // star
        return (
          <polygon
            points={Array.from({ length: 5 }, (_, i) => {
              const angle = (i * 72 - 90) * (Math.PI / 180);
              const outerX = cx + r * Math.cos(angle);
              const outerY = cy + r * Math.sin(angle);
              const innerAngle = ((i * 72 + 36) - 90) * (Math.PI / 180);
              const innerX = cx + r * 0.4 * Math.cos(innerAngle);
              const innerY = cy + r * 0.4 * Math.sin(innerAngle);
              return `${outerX},${outerY} ${innerX},${innerY}`;
            }).join(' ')}
            fill={lighter}
            transform={transform}
          />
        );
      case 4: // cross
        return (
          <g transform={transform}>
            <rect x={cx - r * 0.2} y={cy - r} width={r * 0.4} height={r * 2} rx={r * 0.1} fill={tribeColor} />
            <rect x={cx - r} y={cy - r * 0.2} width={r * 2} height={r * 0.4} rx={r * 0.1} fill={tribeColor} />
          </g>
        );
      case 5: // rhombus
      default:
        return (
          <rect
            x={cx - r * 0.6}
            y={cy - r * 0.6}
            width={r * 1.2}
            height={r * 1.2}
            rx={r * 0.15}
            fill={darker}
            transform={`rotate(${rotation + 45} ${cx} ${cy})`}
          />
        );
    }
  };

  return (
    <svg
      width={s}
      height={s}
      viewBox={`0 0 ${s} ${s}`}
      style={{ flexShrink: 0, borderRadius: s * 0.2 }}
    >
      <rect width={s} height={s} rx={s * 0.2} fill={bgColor} />
      {renderShape()}
    </svg>
  );
}
