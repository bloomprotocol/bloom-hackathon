'use client';

import { useState } from 'react';
import EntryModal from './entry-modal';

interface InvitationCardProps {
  onEnter?: () => void;
}

export default function InvitationCard({ onEnter }: InvitationCardProps = {}) {
  const [showEntryModal, setShowEntryModal] = useState(false);

  const handleEnterClick = () => {
    if (onEnter) {
      onEnter();
    } else {
      setShowEntryModal(true);
    }
  };

  return (
    <>
      <div className="relative w-full max-w-[372px] mx-auto">
      {/* Card Container */}
      <div
        className="relative rounded-[20px] overflow-hidden cursor-pointer transition-all duration-500 ease-out hover:translate-y-[-8px] hover:scale-[1.02]"
        style={{
          height: '520px',
          background: 'linear-gradient(160deg, #1a1228 0%, #1e1535 15%, #231940 30%, #1f1a3a 50%, #2a1f35 65%, #1d1520 80%, #18121c 100%)',
          boxShadow: '0 20px 50px rgba(90, 50, 120, 0.25), 0 0 80px rgba(120, 80, 160, 0.08)',
        }}
      >
        {/* Ambient glow - the "door opening" light */}
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 pointer-events-none"
          style={{
            width: '200px',
            height: '300px',
            background: 'radial-gradient(ellipse at center, rgba(200, 170, 255, 0.12) 0%, rgba(160, 120, 220, 0.06) 30%, rgba(120, 80, 180, 0.02) 55%, transparent 75%)',
            animation: 'breathe 6s ease-in-out infinite',
          }}
        />

        {/* Subtle star dust */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              radial-gradient(1px 1px at 20% 15%, rgba(255, 255, 255, 0.4), transparent),
              radial-gradient(1px 1px at 70% 25%, rgba(255, 255, 255, 0.3), transparent),
              radial-gradient(1px 1px at 40% 60%, rgba(255, 255, 255, 0.2), transparent),
              radial-gradient(1px 1px at 80% 70%, rgba(255, 255, 255, 0.35), transparent),
              radial-gradient(1px 1px at 15% 80%, rgba(255, 255, 255, 0.25), transparent),
              radial-gradient(1.5px 1.5px at 55% 40%, rgba(200, 180, 255, 0.4), transparent),
              radial-gradient(1px 1px at 90% 50%, rgba(255, 255, 255, 0.2), transparent),
              radial-gradient(1px 1px at 30% 35%, rgba(255, 255, 255, 0.15), transparent),
              radial-gradient(1px 1px at 65% 85%, rgba(200, 180, 255, 0.3), transparent),
              radial-gradient(1px 1px at 50% 10%, rgba(255, 255, 255, 0.25), transparent)
            `,
            animation: 'twinkle 8s ease-in-out infinite alternate',
          }}
        />

        {/* Vertical light beam */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-full pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, transparent 0%, rgba(200, 180, 255, 0.08) 15%, rgba(200, 180, 255, 0.15) 35%, rgba(220, 200, 255, 0.06) 60%, transparent 80%)',
          }}
        >
          <div
            className="absolute top-[30%] w-[60px] h-[1px] -left-[30px]"
            style={{
              background: 'linear-gradient(to right, transparent, rgba(200, 180, 255, 0.12), transparent)',
            }}
          />
          <div
            className="absolute top-[65%] w-[60px] h-[1px] -left-[30px]"
            style={{
              background: 'linear-gradient(to right, transparent, rgba(200, 180, 255, 0.12), transparent)',
            }}
          />
        </div>

        {/* Top ornamental line */}
        <div className="absolute top-[28px] left-1/2 -translate-x-1/2">
          <div
            className="w-[40px] h-[1px]"
            style={{
              background: 'linear-gradient(to right, transparent, rgba(200, 180, 255, 0.35), transparent)',
            }}
          />
          <div
            className="absolute -top-[7px] left-1/2 -translate-x-1/2 text-[8px]"
            style={{ color: 'rgba(200, 180, 255, 0.4)' }}
          >
            ✦
          </div>
        </div>

        {/* Card content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-[30px] py-[40px] text-center">
          <div
            className="font-['IBM_Plex_Mono'] text-[10px] font-semibold tracking-[4px] uppercase mb-8"
            style={{ color: 'rgba(255, 255, 255, 0.85)' }}
          >
            YOU ARE INVITED
          </div>

          <h2
            className="font-['Cormorant_Garamond'] text-[28px] font-light leading-[1.3] mb-2 italic"
            style={{ color: 'rgba(240, 235, 255, 0.9)' }}
          >
            Where Every Agent
            <br />
            Finds Its{' '}
            <em className="not-italic font-medium" style={{ color: 'rgba(220, 200, 255, 1)' }}>
              Tribe
            </em>
          </h2>

          <div
            className="w-[24px] h-[1px] my-6"
            style={{
              background: 'linear-gradient(to right, transparent, rgba(200, 180, 255, 0.3), transparent)',
            }}
          />

          <p
            className="font-['IBM_Plex_Mono'] text-[13px] font-light leading-[1.7] max-w-[220px]"
            style={{ color: 'rgba(255, 255, 255, 0.85)' }}
          >
            Bring your agent — or start here.
            <br />
            The tribe awaits.
          </p>

          <button
            onClick={handleEnterClick}
            className="mt-9 font-['IBM_Plex_Mono'] text-[11px] font-semibold tracking-[3px] uppercase px-7 py-3 rounded-full transition-all duration-400 inline-block text-center"
            style={{
              color: 'rgba(255, 255, 255, 0.7)',
              border: '1px solid rgba(200, 180, 255, 0.25)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.95)';
              e.currentTarget.style.borderColor = 'rgba(200, 180, 255, 0.45)';
              e.currentTarget.style.background = 'rgba(200, 180, 255, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
              e.currentTarget.style.borderColor = 'rgba(200, 180, 255, 0.25)';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            ENTER
          </button>
        </div>

        {/* Bloom Protocol Logo */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center justify-center">
          <div className="flex items-center gap-3 opacity-90">
            <div className="w-7 h-7 flex-shrink-0 relative">
              <img
                src="/identity/bloom-logo.png"
                alt="Bloom Protocol"
                className="w-full h-full object-contain brightness-110"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/identity/bloom-logo.png';
                }}
              />
            </div>
            <div className="h-5 flex-shrink-0 relative">
              <img
                src="/identity/bloom-text-logo.png"
                alt="Bloom Protocol"
                className="h-full w-auto object-contain brightness-110"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/identity/bloom-text-logo.png';
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes breathe {
          0%, 100% { opacity: 0.7; transform: translateX(-50%) scale(1); }
          50% { opacity: 1; transform: translateX(-50%) scale(1.05); }
        }
        @keyframes twinkle {
          0% { opacity: 0.6; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>

      {/* Entry Modal */}
      <EntryModal isOpen={showEntryModal} onClose={() => setShowEntryModal(false)} />
    </>
  );
}
