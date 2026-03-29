import { useQuery } from '@tanstack/react-query';
import { projectService, ProjectListItem } from '@/lib/api/services/projectService';

export const useRandomProject = () => {
  return useQuery({
    queryKey: ['randomProject'],
    queryFn: async () => {
      const response = await projectService.getProjectList({ 
        limit: 100
      });
      
      if (response.projects.length === 0) {
        return null;
      }
      
      // Get a random project from the list
      const randomIndex = Math.floor(Math.random() * response.projects.length);
      return response.projects[randomIndex];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });
};