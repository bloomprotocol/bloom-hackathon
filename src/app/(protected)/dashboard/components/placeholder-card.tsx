'use client';

export default function PlaceholderCard() {
  return (
    <div className="relative w-full max-w-[372px] mx-auto">
      {/* Card Container */}
      <div
        className="relative rounded-[20px] overflow-hidden cursor-pointer transition-all duration-500 ease-out hover:translate-y-[-8px] hover:scale-[1.02]"
        style={{
          height: '520px',
          background: 'linear-gradient(160deg, #1a1228 0%, #1e1535 15%, #211838 30%, #1d1634 50%, #251d38 65%, #1c1525 80%, #17121d 100%)',
          boxShadow: '0 20px 50px -12px rgba(90, 50, 120, 0.25), 0 0 80px rgba(120, 80, 160, 0.08)',
        }}
      >
        {/* Ambient glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(200, 170, 255, 0.08) 0%, transparent 70%)',
          }}
        />

        {/* Star particles - matching invitation card */}
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
              radial-gradient(1px 1px at 65% 85%, rgba(200, 180, 255, 0.3), transparent)
            `,
            animation: 'twinkle 8s ease-in-out infinite alternate',
          }}
        />

        {/* Subtle grain texture */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Dashed border hint */}
        <div
          className="absolute inset-[12px] rounded-[14px] pointer-events-none"
          style={{
            border: '1px dashed rgba(200, 180, 255, 0.12)',
          }}
        />

        {/* Card content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-[30px] py-[40px] text-center">
          {/* Dashed circle with subtle glow */}
          <div className="relative mb-8">
            {/* Subtle glow behind circle */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(200, 180, 255, 0.1) 0%, transparent 70%)',
                animation: 'pulse-glow 3s ease-in-out infinite',
                transform: 'scale(1.5)',
              }}
            />

            <div
              className="relative w-[72px] h-[72px] rounded-full flex items-center justify-center"
              style={{
                border: '1px dashed rgba(255, 255, 255, 0.4)',
                animation: 'rotate-slow 30s linear infinite',
              }}
            >
              <div
                className="font-['Cormorant_Garamond'] text-[24px] font-light italic"
                style={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  animation: 'rotate-slow 30s linear infinite reverse',
                }}
              >
                ?
              </div>
            </div>
          </div>

          <h2
            className="font-['Cormorant_Garamond'] text-[22px] font-light italic mb-3"
            style={{ color: 'rgba(255, 255, 255, 0.8)' }}
          >
            Your Next Card
          </h2>

          <p
            className="font-['IBM_Plex_Mono'] text-[10px] font-light tracking-[1px]"
            style={{ color: 'rgba(255, 255, 255, 0.5)' }}
          >
            Something is coming
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse-glow {
          0%, 100% {
            opacity: 0.6;
            transform: scale(1.5);
          }
          50% {
            opacity: 1;
            transform: scale(1.7);
          }
        }
        @keyframes twinkle {
          0% { opacity: 0.6; }
          100% { opacity: 1; }
        }
        @keyframes rotate-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
