'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import TribeTotem from '@/components/tribes/TribeTotem';
import { Tribe, TRIBE_COLOR } from '@/constants/tribe-definitions';

interface TribeCardProps {
  tribe: Tribe;
  index: number;
}

export default function TribeCard({ tribe, index }: TribeCardProps) {
  const [hovered, setHovered] = useState(false);
  const router = useRouter();
  const isForming = tribe.status === 'forming';

  // Forming tribes: no hover animation, no click
  const effectiveHover = hovered && !isForming;

  const handleClick = useCallback(() => {
    if (isForming) return;
    router.push(`/discover/${tribe.id}`);
  }, [router, tribe.id, isForming]);

  return (
    <div
      onClick={handleClick}
      onMouseEnter={isForming ? undefined : () => setHovered(true)}
      onMouseLeave={isForming ? undefined : () => setHovered(false)}
      role={isForming ? undefined : 'button'}
      tabIndex={isForming ? undefined : 0}
      onKeyDown={isForming ? undefined : (e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(); }}
      aria-disabled={isForming || undefined}
      style={{
        background: effectiveHover ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.05)',
        borderRadius: 14,
        border: `1px solid ${effectiveHover ? `${TRIBE_COLOR}50` : isForming ? 'rgba(232,228,223,0.06)' : 'rgba(232,228,223,0.1)'}`,
        padding: '0 20px 22px',
        overflow: 'hidden',
        cursor: isForming ? 'default' : 'pointer',
        position: 'relative',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        boxShadow: effectiveHover
          ? `0 0 0 1px ${TRIBE_COLOR}30, 0 12px 40px rgba(0,0,0,0.35), 0 0 30px ${TRIBE_COLOR}0a`
          : '0 2px 16px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.04)',
        opacity: isForming ? 0.55 : 1,
        transform: effectiveHover ? 'translateY(-4px)' : 'translateY(0)',
        transition: `opacity 0.6s ease ${0.1 + index * 0.06}s, transform 0.3s ease, border-color 0.3s, box-shadow 0.3s, background 0.3s`,
      }}
    >
      {/* Gold accent line — dim for forming */}
      <div
        style={{
          height: 2,
          margin: '0 -20px 18px -20px',
          background: isForming
            ? 'linear-gradient(90deg, transparent, rgba(232,228,223,0.1), transparent)'
            : `linear-gradient(90deg, transparent, ${TRIBE_COLOR}50, transparent)`,
        }}
      />

      {/* Totem */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
        <TribeTotem tribeId={tribe.id} size={effectiveHover ? 44 : 40} />
      </div>

      {/* Name */}
      <h3
        style={{
          fontFamily: 'var(--font-newsreader), serif',
          fontSize: 20,
          fontWeight: 600,
          textAlign: 'center',
          margin: '0 0 8px',
          color: effectiveHover ? TRIBE_COLOR : '#E8E4DF',
          transition: 'color 0.3s',
          letterSpacing: '0.01em',
        }}
      >
        {tribe.name}
      </h3>

      {/* Tagline */}
      <p
        style={{
          fontSize: 13,
          color: isForming ? 'rgba(232,228,223,0.4)' : 'rgba(232,228,223,0.55)',
          textAlign: 'center',
          lineHeight: 1.5,
          margin: '0 0 16px',
          minHeight: 40,
        }}
      >
        {tribe.tagline}
      </p>

      {/* Meta */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        {tribe.status === 'active' ? (
          <>
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: TRIBE_COLOR,
                display: 'inline-block',
              }}
            />
            <span
              style={{
                fontFamily: 'var(--font-dm-mono), monospace',
                fontSize: 13,
                color: 'rgba(232,228,223,0.55)',
              }}
            >
              {tribe.memberCount} owners
            </span>
          </>
        ) : (
          <span
            style={{
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: 13,
              color: 'rgba(232,228,223,0.35)',
            }}
          >
            Opening soon
          </span>
        )}
      </div>
    </div>
  );
}
