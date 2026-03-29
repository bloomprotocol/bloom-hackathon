import { metadata } from "./page.meta";
export { metadata };

export default function DiscoverPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        minHeight: '100vh',
        fontFamily: 'var(--font-dm-sans), sans-serif',
      }}
    >
      {children}
    </div>
  );
}
