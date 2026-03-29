'use client';

interface Supporter {
  id: string;
  name: string;
  avatarUrl?: string;
}

interface AvatarStripProps {
  supporters: Supporter[];
  maxVisible?: number;
  size?: number;
  className?: string;
}

// Deterministic color from string
function hashColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 45%, 65%)`;
}

export default function AvatarStrip({
  supporters,
  maxVisible = 5,
  size = 24,
  className = '',
}: AvatarStripProps) {
  if (!supporters || supporters.length === 0) return null;

  const visible = supporters.slice(0, maxVisible);
  const overflow = supporters.length - maxVisible;

  return (
    <div className={`flex items-center ${className}`}>
      {visible.map((s, i) => (
        <div
          key={s.id}
          title={s.name}
          style={{
            width: size,
            height: size,
            borderRadius: '50%',
            border: '2px solid white',
            marginLeft: i === 0 ? 0 : -(size * 0.25),
            background: s.avatarUrl ? `url(${s.avatarUrl}) center/cover` : hashColor(s.id),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: size * 0.4,
            fontWeight: 600,
            color: 'white',
            flexShrink: 0,
            position: 'relative',
            zIndex: maxVisible - i,
          }}
        >
          {!s.avatarUrl && s.name.charAt(0).toUpperCase()}
        </div>
      ))}
      {overflow > 0 && (
        <div
          style={{
            width: size,
            height: size,
            borderRadius: '50%',
            border: '2px solid white',
            marginLeft: -(size * 0.25),
            background: '#e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            position: 'relative',
            zIndex: 0,
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-dm-sans), sans-serif',
              fontSize: size * 0.38,
              fontWeight: 600,
              color: '#6b7280',
            }}
          >
            +{overflow}
          </span>
        </div>
      )}
    </div>
  );
}
