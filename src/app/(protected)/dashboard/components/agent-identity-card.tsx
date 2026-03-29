'use client';

interface CategoryInfo {
  key: string;
  label: string;
  icon: string;
}

interface PersonalityType {
  name: string;
  description: string;
  longDescription: string;
  image: string;
  background: string;
  bgGradient: string;
  barGradient: string;
}

interface AgentIdentityCardProps {
  personality: PersonalityType;
  conviction: number;
  intuition: number;
  contribution: number;
  tasteSpectrums?: {
    learning: number;
    decision: number;
    novelty: number;
    risk: number;
  };
  categories: string[];
  memberSince?: string;
  cardId?: string;
  dynamicDescription?: string; // Personalized description from analyzer (overrides personality.longDescription)
}

export default function AgentIdentityCard({
  personality,
  conviction,
  intuition,
  contribution,
  tasteSpectrums,
  categories,
  memberSince = 'January 2026',
  cardId,
  dynamicDescription,
}: AgentIdentityCardProps) {
  const displayCategories = categories.slice(0, 3);

  return (
    <div className="relative w-full max-w-[372px] mx-auto">
      {/* Card Container */}
      <div
        className={`relative rounded-[20px] p-4 shadow-[0px_6px_10px_-4px_rgba(0,0,0,0.12),0px_0px_0px_1px_rgba(0,0,0,0.05)] backdrop-blur-[10px] bg-gradient-to-br ${personality.bgGradient}`}
        style={{ height: '659px', overflow: 'hidden' }}
      >
        {/* Background Pattern/Texture */}
        {personality.background && (
          <div className="absolute inset-0 rounded-[20px] overflow-hidden pointer-events-none z-0">
            <img
              src={personality.background}
              alt=""
              className="w-full h-full object-cover opacity-50 mix-blend-overlay"
            />
          </div>
        )}

        {/* Dark Overlay */}
        <div className="absolute inset-0 rounded-[20px] bg-black/20 z-0"></div>

        {/* Hero Image */}
        <div className="relative z-10 w-full h-[175px] mb-3 rounded-[20px] overflow-hidden bg-white/30">
          <img
            src={personality.image}
            alt={personality.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="relative z-10">
          {/* Personality Name + OpenClaw Badge */}
          <div className="flex items-baseline justify-between mb-2">
            <h2 className="font-['DM_Serif_Text'] text-[22px] text-white leading-normal">
              {personality.name}
            </h2>
            <div className="flex items-center gap-1 flex-shrink-0 ml-2">
              <span className="text-[12px]">🦞</span>
              <span className="text-[10px] text-white/60 font-medium whitespace-nowrap">via OpenClaw</span>
            </div>
          </div>

          {/* Personality Quote */}
          <p className="font-['Hedvig_Letters_Serif'] text-[16px] text-white opacity-90 mb-3 leading-normal italic">
            "{personality.description}"
          </p>

          {/* Long Description — use personalized if available, clamped to 3 lines */}
          <p className="font-['IBM_Plex_Mono'] font-normal text-[14px] text-white opacity-90 mb-3 leading-normal line-clamp-3">
            {dynamicDescription || personality.longDescription}
          </p>

          {/* MentalOS Spectrum */}
          {tasteSpectrums && (
            <div className="mb-3 pt-2 border-t border-white/20">
              <p className="font-['IBM_Plex_Mono'] text-[10px] text-white/50 uppercase tracking-wider mb-2">MentalOS</p>
              <div className="space-y-2">
                {/* Learning: Try First ↔ Study First */}
                <div>
                  <div className="flex justify-between font-['IBM_Plex_Mono'] text-[11px] text-white/70 mb-1">
                    <span>Try First</span>
                    <span>Study First</span>
                  </div>
                  <div className="relative h-[5px] bg-white/20 rounded-full">
                    <div
                      className={`absolute w-2.5 h-2.5 bg-gradient-to-r ${personality.barGradient} rounded-full top-1/2 -translate-y-1/2 shadow-lg`}
                      style={{ left: `calc(${tasteSpectrums.learning}% - 5px)` }}
                    ></div>
                  </div>
                </div>
                {/* Decision: Gut ↔ Analytical */}
                <div>
                  <div className="flex justify-between font-['IBM_Plex_Mono'] text-[11px] text-white/70 mb-1">
                    <span>Gut</span>
                    <span>Analytical</span>
                  </div>
                  <div className="relative h-[5px] bg-white/20 rounded-full">
                    <div
                      className={`absolute w-2.5 h-2.5 bg-gradient-to-r ${personality.barGradient} rounded-full top-1/2 -translate-y-1/2 shadow-lg`}
                      style={{ left: `calc(${tasteSpectrums.decision}% - 5px)` }}
                    ></div>
                  </div>
                </div>
                {/* Novelty: Early Adopter ↔ Proven First */}
                <div>
                  <div className="flex justify-between font-['IBM_Plex_Mono'] text-[11px] text-white/70 mb-1">
                    <span>Early Adopter</span>
                    <span>Proven First</span>
                  </div>
                  <div className="relative h-[5px] bg-white/20 rounded-full">
                    <div
                      className={`absolute w-2.5 h-2.5 bg-gradient-to-r ${personality.barGradient} rounded-full top-1/2 -translate-y-1/2 shadow-lg`}
                      style={{ left: `calc(${tasteSpectrums.novelty}% - 5px)` }}
                    ></div>
                  </div>
                </div>
                {/* Risk: All In ↔ Measured */}
                <div>
                  <div className="flex justify-between font-['IBM_Plex_Mono'] text-[11px] text-white/70 mb-1">
                    <span>All In</span>
                    <span>Measured</span>
                  </div>
                  <div className="relative h-[5px] bg-white/20 rounded-full">
                    <div
                      className={`absolute w-2.5 h-2.5 bg-gradient-to-r ${personality.barGradient} rounded-full top-1/2 -translate-y-1/2 shadow-lg`}
                      style={{ left: `calc(${tasteSpectrums.risk}% - 5px)` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Top Categories */}
          {displayCategories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2 pt-2 border-t border-white/20">
              {displayCategories.map((cat, idx) => (
                <div
                  key={idx}
                  className="px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30"
                >
                  <p className="font-['IBM_Plex_Mono'] font-normal text-[11px] text-white whitespace-nowrap leading-normal">
                    {cat}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Bottom Footer */}
          <div className="pt-2">
            {/* Member since + Card ID — single row */}
            <div className="flex items-center justify-between mb-2">
              <span className="font-['IBM_Plex_Mono'] text-[10px] text-white/60">
                Member since {memberSince}
              </span>
              {cardId && (
                <span className="font-['IBM_Plex_Mono'] text-[9px] text-white/40">
                  #{cardId}
                </span>
              )}
            </div>

            {/* Bloom Protocol Logo — centered */}
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-2 opacity-70">
                <div className="w-5 h-5 flex-shrink-0">
                  <img
                    src="/identity/bloom-logo.png"
                    alt="Bloom Protocol"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="h-3.5 flex-shrink-0">
                  <img
                    src="/identity/bloom-text-logo.png"
                    alt="Bloom Protocol"
                    className="h-full w-auto object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
