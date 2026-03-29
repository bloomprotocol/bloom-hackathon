'use client';

import { useState, useCallback } from 'react';

interface RatingWidgetProps {
  postId: string;
  tribeColor: string;
}

export default function RatingWidget({ postId, tribeColor }: RatingWidgetProps) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [locked, setLocked] = useState(false);

  const handleClick = useCallback(
    (star: number) => {
      if (locked) return;
      setRating(star);
      setLocked(true);
      console.log(`[RatingWidget] Post ${postId} rated ${star}/5`);
    },
    [locked, postId],
  );

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
      {locked ? (
        <span
          style={{
            fontFamily: 'var(--font-dm-sans), sans-serif',
            fontSize: 11,
            color: tribeColor,
            fontWeight: 500,
          }}
        >
          Rated {'★'.repeat(rating)}
        </span>
      ) : (
        <>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => handleClick(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '6px 8px',
                fontSize: 14,
                lineHeight: 1,
                color: star <= (hover || rating) ? tribeColor : '#ddd',
                transition: 'color 0.15s',
                minWidth: 36,
                minHeight: 44,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
            >
              ★
            </button>
          ))}
        </>
      )}
    </div>
  );
}
