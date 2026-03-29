import React, { useEffect, useState } from 'react';
import styles from './BackToTerminalButton.module.css';
import { ANIMATION_TIMINGS } from './animations.config';

interface BackToTerminalButtonProps {
  onBack: () => void;
  showDelay?: number;
  className?: string;
}

const BackToTerminalButton: React.FC<BackToTerminalButtonProps> = React.memo(({ 
  onBack, 
  showDelay = ANIMATION_TIMINGS.BACK_BUTTON_SHOW_DELAY,
  className = ''
}) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(true);
    }, showDelay);

    return () => clearTimeout(timer);
  }, [showDelay]);

  return (
    <button
      className={`${styles.backButton} ${show ? styles.show : ''} ${className}`}
      onClick={onBack}
      aria-label="Back to terminal"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12.5 15L7.5 10L12.5 5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      Back to Terminal
    </button>
  );
});

BackToTerminalButton.displayName = 'BackToTerminalButton';

export default BackToTerminalButton; 