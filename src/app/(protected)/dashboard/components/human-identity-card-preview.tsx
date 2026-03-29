'use client';

interface CategoryInfo {
  icon: string;
  label: string;
}

interface HumanIdentityCardPreviewProps {
  personalityName: string;
  personalityDescription: string;
  personalityImage: string;
  backgroundImage?: string;
  backgroundColor: string;
  longDescription?: string;
  memberSince?: string;
}

export default function HumanIdentityCardPreview({
  personalityName,
  personalityDescription,
  personalityImage,
  backgroundImage,
  backgroundColor,
  longDescription,
  memberSince = 'January 2026',
}: HumanIdentityCardPreviewProps) {
  return (
    <div className="relative w-full max-w-[372px] mx-auto">
      {/* Card Container - Simplified for carousel */}
      <div
        className={`relative rounded-[20px] p-4 shadow-[0px_6px_10px_-4px_rgba(0,0,0,0.12),0px_0px_0px_1px_rgba(0,0,0,0.05)] backdrop-blur-[10px] bg-gradient-to-br ${backgroundColor}`}
        style={{ height: '520px', overflow: 'hidden' }}
      >
        {/* Background Pattern/Texture */}
        {backgroundImage && (
          <div className="absolute inset-0 rounded-[20px] overflow-hidden pointer-events-none z-0">
            <img
              src={backgroundImage}
              alt=""
              className="w-full h-full object-cover opacity-50 mix-blend-overlay"
            />
          </div>
        )}

        {/* Hero Image */}
        <div className="relative z-10 w-full h-[185px] mb-4 rounded-[20px] overflow-hidden bg-white/30">
          <img
            src={personalityImage}
            alt={personalityName}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="relative z-10">
          {/* Personality Name */}
          <h2 className="font-['DM_Serif_Text'] text-[22px] text-[#121212] mb-2 leading-normal">
            {personalityName}
          </h2>

          {/* Personality Quote */}
          <p className="font-['Hedvig_Letters_Serif'] text-[18px] text-[#121212] opacity-90 mb-4 leading-normal italic">
            "{personalityDescription}"
          </p>

          {/* Long Description */}
          {longDescription && (
            <p className="font-['IBM_Plex_Mono'] font-light text-[14px] text-[#121212] opacity-90 mb-6 leading-relaxed">
              {longDescription}
            </p>
          )}

          {/* Your Discovery Badge */}
          <div className="mb-2 pt-2 border-t border-[#121212]/10">
            <div className="inline-flex items-center gap-1">
              <span>👤</span>
              <span className="text-[10px] text-[#121212] opacity-70 font-medium">Your Discovery</span>
            </div>
          </div>

          {/* Member Since */}
          <div className="mb-4">
            <p className="font-['IBM_Plex_Mono'] text-[11px] text-[#121212] opacity-70">
              Member since {memberSince}
            </p>
          </div>

          {/* Bloom Protocol Logo */}
          <div className="pt-4 flex items-center justify-center">
            <div className="flex items-center gap-2.5 opacity-50">
              <div className="w-6 h-6 flex-shrink-0 relative">
                <img
                  src="/identity/bloom-logo.png"
                  alt="Bloom Protocol"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/identity/bloom-logo.png';
                  }}
                />
              </div>
              <div className="h-4 flex-shrink-0 relative">
                <img
                  src="/identity/bloom-text-logo.png"
                  alt="Bloom Protocol"
                  className="h-full w-auto object-contain"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/identity/bloom-text-logo.png';
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
