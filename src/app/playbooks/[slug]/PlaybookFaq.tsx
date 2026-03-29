'use client';

import { useState } from 'react';
import type { FaqItem } from '@/constants/playbook-page-data';

interface Props {
  items: FaqItem[];
}

export default function PlaybookFaq({ items }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-2">
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div
            key={i}
            className="border rounded-xl overflow-hidden"
            style={{
              borderColor: isOpen ? 'rgba(139,92,246,0.25)' : 'rgba(0,0,0,0.08)',
              background: isOpen ? 'rgba(139,92,246,0.03)' : 'white',
            }}
          >
            <button
              className="w-full text-left px-5 py-4 flex items-center justify-between gap-3"
              onClick={() => setOpenIndex(isOpen ? null : i)}
              aria-expanded={isOpen}
            >
              <span
                className="text-[14px] font-semibold text-gray-800 leading-snug"
                style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}
              >
                {item.q}
              </span>
              <span
                className="text-gray-400 text-[18px] flex-shrink-0 transition-transform duration-200"
                style={{ transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)' }}
              >
                +
              </span>
            </button>
            {isOpen && (
              <div
                className="px-5 pb-4 text-[13px] leading-relaxed text-gray-600"
                style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}
              >
                {item.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
