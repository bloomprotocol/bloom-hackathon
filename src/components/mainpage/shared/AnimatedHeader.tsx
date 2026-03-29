import React from 'react';
import styles from './AnimatedHeader.module.css';
import { COLORS } from './animations.config';

interface AnimatedHeaderProps {
  title: string;
  subtitle: string;
  variant: 'developer' | 'user';
  className?: string;
}

const AnimatedHeader: React.FC<AnimatedHeaderProps> = React.memo(({ 
  title, 
  subtitle, 
  variant,
  className = ''
}) => {
  const gradientStyle = {
    background: COLORS[variant].gradient,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  };

  return (
    <div className={`${styles.header} ${className}`}>
      <h1 className={styles.title} style={gradientStyle}>
        {title}
      </h1>
      <p className={styles.subtitle}>
        {subtitle}
      </p>
    </div>
  );
});

AnimatedHeader.displayName = 'AnimatedHeader';

export default AnimatedHeader; 