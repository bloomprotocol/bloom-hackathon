/**
 * Standard page container with consistent padding and max-width
 * Used across all pages (except homepage)
 *
 * Padding:
 * - Horizontal: px-4 (16px mobile) / desktop:px-40 (160px desktop)
 * - Vertical: py-8 (32px mobile) / desktop:py-10 (40px desktop)
 * - Max width: 1440px
 */
export default function PageContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto max-w-[1440px] w-full">
      <div className="px-4 desktop:px-40 py-8 desktop:py-10">
        {children}
      </div>
    </div>
  );
}
