'use client';

import type { ProjectWithConsensus } from '@/hooks/useRaiseProjects';
import AvatarStrip from '@/components/ui/AvatarStrip';

interface DiscoveryProjectCardProps {
  project: ProjectWithConsensus;
}

export default function DiscoveryProjectCard({ project }: DiscoveryProjectCardProps) {
  return (
    <div
      className="rounded-[16px] p-4 transition-all duration-200"
      style={{
        background: 'linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(245,240,255,0.35) 100%)',
        border: '1px solid rgba(255,255,255,0.6)',
        boxShadow: '0 2px 12px rgba(100,80,150,0.06), inset 0 1px 0 rgba(255,255,255,0.7)',
        backdropFilter: 'blur(24px) saturate(1.2)',
        WebkitBackdropFilter: 'blur(24px) saturate(1.2)',
      }}
    >
      {/* Row 1: Name + Category */}
      <div className="flex items-center gap-2 mb-1">
        <h3
          className="font-bold text-[15px] text-[#393f49] leading-tight truncate"
          style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}
        >
          {project.name}
        </h3>
        {project.category && (
          <span
            className="ml-auto text-[10px] px-2 py-0.5 rounded-full shrink-0"
            style={{
              fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
              color: '#7c3aed',
              background: 'rgba(124,58,237,0.06)',
              border: '1px solid rgba(124,58,237,0.12)',
            }}
          >
            {project.category}
          </span>
        )}
      </div>

      {/* Row 2: One-liner */}
      <p
        className="text-[13px] text-[#6b7280] mb-3 leading-relaxed"
        style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}
      >
        {project.oneLiner}
      </p>

      {/* Row 3: Traction signals */}
      <div className="flex items-center gap-3 flex-wrap">
        {project.supporters.length > 0 && (
          <AvatarStrip supporters={project.supporters} maxVisible={5} size={22} />
        )}
        {project.evaluationCount > 0 && (
          <span
            className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full"
            style={{
              fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
              color: '#7c3aed',
              background: 'rgba(124,58,237,0.06)',
            }}
          >
            {project.evaluationCount} evaluations
          </span>
        )}
        {project.supporters.length > 0 && (
          <span
            className="text-[11px] text-[#9ca3af]"
            style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}
          >
            {project.supporters.length} supporter{project.supporters.length !== 1 ? 's' : ''}
          </span>
        )}
        {project.needs.length > 0 && (
          <span
            className="ml-auto text-[10px] px-2 py-0.5 rounded-full font-medium"
            style={{
              fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
              color: '#d97706',
              background: 'rgba(217,119,6,0.08)',
              border: '1px solid rgba(217,119,6,0.15)',
            }}
          >
            Looking for evaluators
          </span>
        )}
      </div>
    </div>
  );
}
