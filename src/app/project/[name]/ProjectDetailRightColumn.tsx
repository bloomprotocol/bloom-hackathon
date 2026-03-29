import { ProjectPledge } from './components/ProjectPledge';
import { ProjectMissions } from './components/ProjectMissions';
import type { Mission } from './types';

interface ProjectDetailRightColumnProps {
  project?: {
    id: string;
    name: string;
    status: string;
  };
  missions?: Mission[];
}

export function ProjectDetailRightColumn({ project, missions }: ProjectDetailRightColumnProps) {
  return (
    <div className="w-full">
      <div className="flex flex-col gap-6">
        {/* Pledge Section - Only show when status is pre_sale */}
        {project?.status === 'pre_sale' && (
          <ProjectPledge />
        )}
        
        {/* Missions Section - Only show if there are missions */}
        {missions && missions.length > 0 && (
          <ProjectMissions missions={missions} />
        )}
      </div>
    </div>
  );
}