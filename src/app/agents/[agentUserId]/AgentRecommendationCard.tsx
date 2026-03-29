'use client';

interface Recommendation {
  skillName: string;
  skillId?: string;
  matchScore: number;
  description: string;
  url: string;
  source?: 'ClaudeCode' | 'ClawHub' | 'GitHub';
  stars?: number;
  downloads?: number;
  language?: string;
  reason?: string;
}

interface AgentRecommendationCardProps {
  recommendation: Recommendation;
}

export default function AgentRecommendationCard({
  recommendation: rec,
}: AgentRecommendationCardProps) {
  return (
    <div
      className="flex flex-col gap-2 p-4 rounded-[20px] transition-all duration-200"
      style={{
        background: 'linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(245,240,255,0.35) 100%)',
        border: '1px solid rgba(255,255,255,0.6)',
        boxShadow: '0 2px 12px rgba(100,80,150,0.06), inset 0 1px 0 rgba(255,255,255,0.7)',
        backdropFilter: 'blur(24px) saturate(1.2)',
        WebkitBackdropFilter: 'blur(24px) saturate(1.2)',
      }}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          {/* Skill name + source badge + stats */}
          <h4 className="font-medium text-gray-900 mb-1 flex flex-wrap items-center gap-2">
            <span>{rec.skillName}</span>
            {rec.source === 'ClawHub' && (
              <span className="inline-flex items-center px-2 py-0.5 bg-teal-600 text-white text-xs rounded-full font-medium">
                ClawHub
              </span>
            )}
            {rec.source === 'ClaudeCode' && (
              <span className="inline-flex items-center px-2 py-0.5 bg-orange-500 text-white text-xs rounded-full font-medium">
                Claude Code
              </span>
            )}
            {rec.source === 'GitHub' && (
              <span className="inline-flex items-center px-2 py-0.5 bg-gray-700 text-white text-xs rounded-full font-medium">
                GitHub
              </span>
            )}
            {rec.source === 'ClawHub' && rec.downloads != null && rec.downloads > 0 && (
              <span className="inline-flex items-center gap-1 text-sm text-teal-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                {rec.downloads >= 1000 ? `${(rec.downloads / 1000).toFixed(1)}k` : rec.downloads}
              </span>
            )}
            {rec.source === 'GitHub' && rec.stars != null && rec.stars > 0 && (
              <span className="inline-flex items-center gap-1 text-sm text-yellow-600">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {rec.stars >= 1000 ? `${(rec.stars / 1000).toFixed(1)}k` : rec.stars}
              </span>
            )}
            {rec.source === 'GitHub' && rec.language && (
              <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded">
                {rec.language}
              </span>
            )}
          </h4>
          {rec.reason && (
            <p className="text-sm text-gray-500 italic mb-1">{rec.reason}</p>
          )}
          <p className="text-sm text-gray-600">{rec.description}</p>
        </div>

        {/* View button */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <a
            href={rec.url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-teal-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition-colors whitespace-nowrap"
          >
            View
          </a>
        </div>
      </div>
    </div>
  );
}
