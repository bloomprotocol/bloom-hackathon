'use client';

interface WeeklyCardProps {
  weekNumber: number;
  date: string;
  discoveries: number;
  categories: Array<{ icon: string; label: string }>;
}

export default function WeeklyCard({ weekNumber, date, discoveries, categories }: WeeklyCardProps) {
  return (
    <div
      className="relative p-6 rounded-2xl overflow-hidden border border-white/50 h-full"
      style={{
        background: 'rgba(255, 255, 255, 0.6)',
        boxShadow: '0 25px 50px -12px rgba(147, 51, 234, 0.15), 0 12px 24px -8px rgba(147, 51, 234, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.8)',
      }}
    >
      {/* Holographic gradient background */}
      <div
        className="absolute inset-0 opacity-80"
        style={{
          background: `linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.9) 0%,
            rgba(180, 200, 255, 0.6) 15%,
            rgba(160, 180, 255, 0.5) 30%,
            rgba(180, 220, 255, 0.4) 45%,
            rgba(170, 200, 255, 0.3) 55%,
            rgba(160, 170, 255, 0.4) 70%,
            rgba(180, 190, 255, 0.5) 85%,
            rgba(255, 255, 255, 0.8) 100%
          )`
        }}
      />
      {/* Grain overlay */}
      <div
        className="absolute inset-0 opacity-[0.35] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Weekly Card
          </h3>
          <span className="text-2xl">📅</span>
        </div>

        {/* Week Badge */}
        <div className="mb-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-400 to-cyan-500 text-white font-bold text-lg shadow-lg">
            Week {weekNumber}
          </div>
        </div>

        {/* Date */}
        <div className="mb-4">
          <p className="text-sm text-gray-500">{date}</p>
        </div>

        {/* Discoveries */}
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-blue-600">{discoveries}</span>
            <span className="text-sm text-gray-500">discoveries</span>
          </div>
        </div>

        {/* Top Categories */}
        {categories && categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {categories.map((category, idx) => (
              <div
                key={idx}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/50 border border-white/60 text-sm"
              >
                <span>{category.icon}</span>
                <span className="text-gray-700 font-medium">{category.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
