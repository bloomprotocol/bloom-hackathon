import { TRIBE_COLOR } from '@/constants/tribe-definitions';

interface TribeTotemProps {
  tribeId: string;
  size?: number;
}

export default function TribeTotem({ tribeId, size = 48 }: TribeTotemProps) {
  const c = TRIBE_COLOR;

  switch (tribeId) {
    case 'launch':
      // Rocket / launchpad: validation + liftoff
      return (
        <svg viewBox="0 0 48 48" width={size} height={size}>
          <path d="M24 8 Q20 16 20 28 L28 28 Q28 16 24 8Z" fill={c} opacity="0.7" />
          <path d="M20 28 L16 34 L20 32" fill={c} opacity="0.5" />
          <path d="M28 28 L32 34 L28 32" fill={c} opacity="0.5" />
          <circle cx="24" cy="20" r="3" fill="none" stroke={c} strokeWidth="1.5" opacity="0.9" />
          <rect x="18" y="34" width="12" height="3" rx="1" fill={c} opacity="0.3" />
        </svg>
      );
    case 'sanctuary':
      // Leaf / shelter: care + restoration
      return (
        <svg viewBox="0 0 48 48" width={size} height={size}>
          <path d="M24 38 L24 24" stroke={c} strokeWidth="2" opacity="0.5" />
          <path d="M24 24 Q12 20 10 10 Q20 12 24 24" fill={c} opacity="0.6" />
          <path d="M24 24 Q36 20 38 10 Q28 12 24 24" fill={c} opacity="0.4" />
          <circle cx="24" cy="38" r="3" fill={c} opacity="0.3" />
        </svg>
      );
    case 'build':
      return (
        <svg viewBox="0 0 48 48" width={size} height={size}>
          <rect x="14" y="30" width="20" height="6" rx="1" fill={c} opacity="0.9" />
          <rect x="17" y="22" width="14" height="6" rx="1" fill={c} opacity="0.7" />
          <rect x="20" y="14" width="8" height="6" rx="1" fill={c} opacity="0.5" />
        </svg>
      );
    case 'create':
      return (
        <svg viewBox="0 0 48 48" width={size} height={size}>
          <path d="M8 28 Q16 16 24 28 Q32 40 40 28" fill="none" stroke={c} strokeWidth="2.5" opacity="0.9" />
          <path d="M12 24 Q20 14 28 24 Q36 34 44 24" fill="none" stroke={c} strokeWidth="1.5" opacity="0.5" />
          <circle cx="24" cy="20" r="2.5" fill={c} opacity="0.7" />
        </svg>
      );
    case 'grow':
      return (
        <svg viewBox="0 0 48 48" width={size} height={size}>
          <path d="M24 36 L24 18" stroke={c} strokeWidth="2" opacity="0.4" />
          <path d="M18 28 Q24 12 30 28" fill={c} opacity="0.5" />
          <path d="M15 22 Q24 6 33 22" fill={c} opacity="0.3" />
          <path d="M20 32 Q24 20 28 32" fill={c} opacity="0.8" />
        </svg>
      );
    case 'connect':
      return (
        <svg viewBox="0 0 48 48" width={size} height={size}>
          <circle cx="19" cy="24" r="9" fill="none" stroke={c} strokeWidth="2" opacity="0.7" />
          <circle cx="29" cy="24" r="9" fill="none" stroke={c} strokeWidth="2" opacity="0.7" />
        </svg>
      );
    case 'publish':
      return (
        <svg viewBox="0 0 48 48" width={size} height={size}>
          <rect x="21" y="20" width="6" height="18" rx="1" fill={c} opacity="0.8" />
          <path d="M24 20 L24 10" stroke={c} strokeWidth="2" opacity="0.6" />
          <circle cx="24" cy="8" r="3" fill={c} opacity="0.9" />
          <path d="M14 16 Q24 12 34 16" fill="none" stroke={c} strokeWidth="1.5" opacity="0.3" />
          <path d="M10 20 Q24 14 38 20" fill="none" stroke={c} strokeWidth="1" opacity="0.2" />
        </svg>
      );
    case 'analyze':
      return (
        <svg viewBox="0 0 48 48" width={size} height={size}>
          <polygon points="24,8 38,34 10,34" fill="none" stroke={c} strokeWidth="2" opacity="0.6" />
          <circle cx="24" cy="24" r="4" fill="none" stroke={c} strokeWidth="2" opacity="0.9" />
          <circle cx="24" cy="24" r="1.5" fill={c} opacity="0.8" />
        </svg>
      );
    case 'raise':
      // Seed → sprout: value discovery + early project validation
      return (
        <svg viewBox="0 0 48 48" width={size} height={size}>
          <ellipse cx="24" cy="36" rx="8" ry="4" fill={c} opacity="0.25" />
          <path d="M24 36 L24 20" stroke={c} strokeWidth="2" opacity="0.6" />
          <path d="M24 20 Q18 14 16 8" fill="none" stroke={c} strokeWidth="1.5" opacity="0.5" />
          <path d="M24 20 Q30 14 32 8" fill="none" stroke={c} strokeWidth="1.5" opacity="0.5" />
          <path d="M24 24 Q20 18 17 14" fill="none" stroke={c} strokeWidth="1.5" opacity="0.4" />
          <path d="M24 24 Q28 18 31 14" fill="none" stroke={c} strokeWidth="1.5" opacity="0.4" />
          <circle cx="16" cy="8" r="2" fill={c} opacity="0.7" />
          <circle cx="32" cy="8" r="2" fill={c} opacity="0.7" />
        </svg>
      );
    case 'think':
      return (
        <svg viewBox="0 0 48 48" width={size} height={size}>
          <ellipse cx="24" cy="30" rx="6" ry="3" fill={c} opacity="0.3" />
          <ellipse cx="24" cy="26" rx="8" ry="4" fill={c} opacity="0.25" />
          <ellipse cx="24" cy="22" rx="10" ry="5" fill={c} opacity="0.2" />
          <ellipse cx="24" cy="28" rx="4" ry="2" fill={c} opacity="0.6" />
        </svg>
      );
    default:
      return null;
  }
}
