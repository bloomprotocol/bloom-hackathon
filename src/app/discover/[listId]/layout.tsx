// Server component — renders light bg in initial HTML before JS hydration
// This overrides the parent discover layout's dark gradient for tribe detail pages

export default function TribeSlugLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: '#FAFAF8',
        minHeight: '100vh',
        color: '#2a2a2a',
        fontFamily: 'var(--font-dm-sans), -apple-system, sans-serif',
      }}
    >
      {children}
    </div>
  );
}
