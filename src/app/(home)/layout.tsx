export default function HomepageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Content - no global background, let each section handle its own */}
      {children}
    </>
  );
}