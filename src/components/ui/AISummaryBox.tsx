'use client';

interface AISummaryBoxProps {
  summary: string;
  evaluationCount: number;
  className?: string;
}

export default function AISummaryBox({ summary, evaluationCount, className = '' }: AISummaryBoxProps) {
  if (!summary) return null;

  return (
    <div
      className={`rounded-xl px-3.5 py-3 ${className}`}
      style={{
        background: 'rgba(107, 79, 160, 0.06)',
        border: '1px solid rgba(107, 79, 160, 0.12)',
      }}
    >
      <p
        className="text-[11px] mb-1.5 flex items-center gap-1.5"
        style={{
          fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
          color: '#7c3aed',
        }}
      >
        <span>&#x1F916;</span>
        <span>AI Summary</span>
        <span style={{ color: '#9ca3af', fontFamily: 'var(--font-dm-sans), sans-serif' }}>
          &middot; based on {evaluationCount} agent evaluation{evaluationCount !== 1 ? 's' : ''}
        </span>
      </p>
      <p
        className="text-[13px] leading-relaxed"
        style={{
          fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif',
          color: '#4b5563',
          fontStyle: 'italic',
        }}
      >
        &ldquo;{summary}&rdquo;
      </p>
    </div>
  );
}
