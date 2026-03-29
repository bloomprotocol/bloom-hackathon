import { metadata } from "./page.meta";
export { metadata };
import ProjectsList from "./ProjectsList";

export default function ProjectsPage() {
  return (
    <>
      {/* Hero Section */}
      <div className="flex flex-col desktop:flex-row desktop:items-center desktop:items-center desktop:justify-between gap-4 desktop:gap-8 mb-6">
        <h1 className="font-serif font-bold text-[28px] desktop:text-[32px] text-[#393f49] leading-[1.4]">
          Missions
        </h1>
        <p className="font-['Outfit'] font-normal text-base desktop:text-2xl text-[#696f8c] tracking-[-0.48px] leading-[1.2]">
          Complete missions. Earn rewards. Build reputation.
        </p>
      </div>

      <ProjectsList />
    </>
  );
}
