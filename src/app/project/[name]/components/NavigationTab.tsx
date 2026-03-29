interface NavigationTabProps {
  id: string;
  label: string;
  isActive: boolean;
  onClick: (e: React.MouseEvent) => void;
  variant?: 'mobile' | 'desktop';
}

export function NavigationTab({
  id,
  label,
  isActive,
  onClick,
  variant = 'desktop',
}: NavigationTabProps) {
  const isMobile = variant === 'mobile';

  return (
    <a
      href={`#${id}`}
      onClick={onClick}
      className={
        isMobile
          ? 'flex flex-col gap-2 items-center justify-start shrink-0'
          : 'inline-flex flex-col justify-start items-center gap-2'
      }
    >
      <div
        className={
          isMobile
            ? 'h-5 flex justify-center items-center'
            : 'h-5 inline-flex justify-center items-center gap-1'
        }
      >
        <div
          className={`text-center text-sm font-['Wix_Madefor_Display'] ${
            isActive
              ? 'text-[#8478e0] font-semibold'
              : 'text-[#696f8c] font-normal'
          } ${isMobile ? 'leading-[1.2]' : 'leading-tight'}`}
        >
          {label}
        </div>
      </div>
      <div
        className={`h-0.5 bg-[#8478e0] rounded-lg ${
          isActive ? 'w-6' : 'w-5 opacity-0'
        }`}
      />
    </a>
  );
}
