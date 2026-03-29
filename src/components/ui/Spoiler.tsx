"use client";

import React, { useEffect, useRef } from 'react';

interface SpoilerProps {
  children: React.ReactNode;
  className?: string;
}

export function Spoiler({ children, className = '' }: SpoilerProps) {
  const dotsRef = useRef<HTMLDivElement>(null);
  const spoilerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dotsRef.current || !spoilerRef.current) return;

    const dotsContainer = dotsRef.current;
    const spoilerEl = spoilerRef.current;
    const numDots = 500; // Reduced from 5000 for better performance

    function createDots(startIndex: number, batchSize: number, totalDots: number) {
      const endIndex = Math.min(startIndex + batchSize, totalDots);
      const spoilerWidth = spoilerEl.offsetWidth;
      const spoilerHeight = spoilerEl.offsetHeight;

      for (let i = startIndex; i < endIndex; i++) {
        const dot = document.createElement('span');
        dot.classList.add('spoiler-dot');
        dotsContainer.appendChild(dot);

        const containerPadding = 30;
        const startX = Math.random() * (spoilerWidth + containerPadding * 2) - containerPadding;
        const startY = Math.random() * (spoilerHeight + 20) - 10;

        const moveDistance = 15 + Math.random() * 25;
        const angle = Math.random() * Math.PI * 2;

        const endX = startX + Math.cos(angle) * moveDistance;
        const endY = startY + Math.sin(angle) * moveDistance;

        const duration = Math.random() * 2 + 2;
        const delay = Math.random() * -8;

        dot.style.setProperty('--x-start', `${startX}px`);
        dot.style.setProperty('--y-start', `${startY}px`);
        dot.style.setProperty('--x-end', `${endX}px`);
        dot.style.setProperty('--y-end', `${endY}px`);
        dot.style.animationDuration = `${duration}s`;
        dot.style.animationDelay = `${delay}s`;
      }

      if (endIndex < totalDots) {
        setTimeout(() => createDots(endIndex, batchSize, totalDots), 0);
      }
    }

    createDots(0, 100, numDots);

    // Cleanup function
    return () => {
      dotsContainer.innerHTML = '';
    };
  }, []);

  return (
    <span className={`spoiler-wrapper ${className}`}>
      <span ref={spoilerRef} className="spoiler-container">
        <span ref={dotsRef} className="spoiler-dots"></span>
        <span className="spoiler-text">{children}</span>
      </span>
    </span>
  );
}