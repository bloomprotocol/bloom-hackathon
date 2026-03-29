import React, { useMemo } from 'react';
import styles from './rpg.module.css';
import { ANIMATION_TIMINGS } from '../shared/animations.config';

interface Particle {
  id: number;
  color: string;
  left: string;
  delay: string;
  duration: string;
}

const MagicParticles: React.FC = React.memo(() => {
  const particles = useMemo(() => {
    const particleColors = ['#ff1493', '#ba55d3', '#00ff88'];
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      color: particleColors[Math.floor(Math.random() * particleColors.length)],
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 10}s`,
      duration: `${ANIMATION_TIMINGS.PARTICLE_DURATION_MIN / 1000 + Math.random() * (ANIMATION_TIMINGS.PARTICLE_DURATION_MAX - ANIMATION_TIMINGS.PARTICLE_DURATION_MIN) / 1000}s`
    }));
  }, []);

  return (
    <div className={styles.magicParticles}>
      {particles.map(particle => (
        <div
          key={particle.id}
          className={styles.particle}
          style={{
            '--particle-color': particle.color,
            left: particle.left,
            animationDelay: particle.delay,
            animationDuration: particle.duration
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
});

MagicParticles.displayName = 'MagicParticles';

export default MagicParticles; 