export default function PlaybooksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f5f3ef',
        fontFamily: 'var(--font-dm-sans), sans-serif',
      }}
    >
      {children}
    </div>
  );
}
