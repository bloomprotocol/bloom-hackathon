// Bloom Protocol Icons

interface IconProps {
  className?: string;
  size?: number;
}

// Bloom/Tulip icon for Bloom Score - represents growth and potential
// Updated design with organic leaf and flower shapes
export function BloomIcon({ className = "", size = 16 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Green leaf (right side) - organic flowing shape */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M17.795 10.848C16.125 11.204 14.527 12.301 13.699 13.7C13.358 14.267 12.858 15.584 12.602 16.577C12.375 17.447 12.359 17.766 12.499 17.766C12.559 17.766 12.828 17.526 13.143 17.225C13.773 16.622 14.469 16.253 15.313 15.993C16.287 15.688 16.951 15.285 17.622 14.611C18.577 13.653 19.094 12.545 19.16 11.322L19.204 10.715L18.788 10.729C18.554 10.737 18.104 10.786 17.795 10.848Z"
        fill="#71ca41"
      />
      {/* Green leaf (left side) - organic flowing shape */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.345 10.869C5.293 10.977 5.362 11.638 5.525 12.276C5.766 13.265 6.542 14.403 7.378 15.042C7.952 15.461 8.261 15.613 9.202 15.958C10.254 16.339 10.676 16.567 11.482 17.304C11.624 17.434 11.82 17.624 11.919 17.725L12.101 17.895L12.021 17.413C11.905 16.722 11.489 15.331 10.925 14.159C10.477 13.242 10.306 12.979 9.866 12.54C8.936 11.613 7.766 11.076 6.397 10.873C5.618 10.766 5.398 10.765 5.345 10.869Z"
        fill="#71ca41"
      />
      {/* Purple flower (center top) - organic petal shape */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.743 6.736C11.246 7.23 10.396 8.44 10.206 9.008C10.006 9.605 9.973 10.503 10.151 11.028C10.311 11.506 10.488 11.772 11.184 12.791C11.751 13.549 12.038 14.059 12.12 14.488L12.177 14.783L12.397 14.264C12.625 13.725 12.932 13.313 13.522 12.397C14.041 11.598 14.239 11.105 14.294 10.336C14.352 9.519 14.186 9.008 13.881 8.201C13.616 7.543 12.493 6.306 12.288 6.306C12.223 6.306 11.981 6.502 11.743 6.736Z"
        fill="#a855f7"
      />
    </svg>
  );
}

// Lightning/Energy icon for Pledge Power
export function LightningIcon({ className = "", size = 16 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M13 2L3 14h8l-1 8 10-12h-8l1-8z"
        fillRule="evenodd"
        clipRule="evenodd"
      />
    </svg>
  );
}
