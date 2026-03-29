'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ProjectStatus } from '@/lib/api/services/projectService';
import { usePublicProjects } from '@/hooks/usePublicProjects';
import ProjectCard from './ProjectCard';

// Social mission type from API
interface SocialMission {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  missionType: string;
  status: string;
  startTime: string | null;
  endTime: string | null;
  postedBy: string;
  totalSubmissions: number;
  rewards: Array<{ name: string; amount: number; icon: string }>;
}

type TabFilter = 'all' | 'projects' | 'quests';

export default function ProjectsList() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState<'all' | ProjectStatus>('all');
  const [activeTab, setActiveTab] = useState<TabFilter>('all');
  const itemsPerPage = 12;
  const router = useRouter();

  // Fetch projects (existing)
  const { data, isLoading: isLoadingProjects, error: projectsError } = usePublicProjects({
    page: currentPage,
    limit: itemsPerPage,
    status: selectedStatus
  });

  // Fetch social missions
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';
  const { data: socialMissionsData, isLoading: isLoadingSocial } = useQuery({
    queryKey: ['socialMissions'],
    queryFn: async () => {
      const res = await fetch(`${apiUrl}/social-missions`);
      if (!res.ok) return { missions: [] };
      const json = await res.json();
      return json as { missions: SocialMission[] };
    },
    staleTime: 5 * 60 * 1000,
  });

  // Only show Bloom official missions — no mock fallback
  const allMissions = socialMissionsData?.missions || [];
  const socialMissions = allMissions.filter(m => m.postedBy === 'Bloom__Protocol');

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStatus, activeTab]);

  // Projects data — only show curated projects
  const CURATED_PROJECT_SLUGS = ['bloom-protocol', 'tripod', 'laguna'];
  const rawProjects = data?.data?.projects || [];
  const allProjects = rawProjects.filter(p => {
    const slug = p.slug || p.name.toLowerCase().replace(/\s+/g, '-');
    return CURATED_PROJECT_SLUGS.some(cs => slug.includes(cs));
  });
  const totalPages = data?.data?.pagination?.totalPages || 1;

  const handleProjectClick = (projectId: string, projectSlug: string) => {
    router.push(`/project/${projectSlug}`);
  };

  const handleQuestClick = (mission: SocialMission) => {
    router.push(`/social-missions/${mission.slug}`);
  };

  const isLoading = isLoadingProjects || isLoadingSocial;
  const questCount = socialMissions.length;
  const projectCount = allProjects.length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8478e0]" />
      </div>
    );
  }

  return (
    <div className="pb-20 desktop:pb-10">
      {/* Sub-tabs */}
      <div className="flex items-center gap-2 mb-8">
        {(['all', 'projects', 'quests'] as TabFilter[]).map((tab) => {
          const count = tab === 'all' ? questCount + projectCount
            : tab === 'quests' ? questCount
            : projectCount;
          const label = tab === 'all' ? 'All'
            : tab === 'projects' ? 'Projects'
            : 'X Quests';

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === tab
                  ? 'bg-[#8478e0] text-white shadow-sm'
                  : 'bg-white/60 text-[#696f8c] border border-gray-200 hover:border-[#8478e0]/30'
              }`}
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              {label}
              {count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === tab ? 'bg-white/20' : 'bg-gray-100'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Projects Section (rendered first) */}
      {(activeTab === 'all' || activeTab === 'projects') && allProjects.length > 0 && (
        <div className="mb-12">
          {activeTab === 'all' && (
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
                Projects
              </span>
            </div>
          )}
          <div className="grid grid-cols-1 desktop:grid-cols-3 gap-6">
            {allProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onClick={() => handleProjectClick(project.id, project.slug || project.name.toLowerCase().replace(/\s+/g, '-'))}
              />
            ))}
          </div>
        </div>
      )}

      {/* X Quests Section (rendered after projects) */}
      {(activeTab === 'all' || activeTab === 'quests') && socialMissions.length > 0 && (
        <div className="mb-12">
          {activeTab === 'all' && (
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#1DA1F2]/10 text-[#1DA1F2] border border-[#1DA1F2]/20">
                X Quests
              </span>
            </div>
          )}
          {/* ListView for X Quests */}
          <div className="flex flex-col gap-3">
            {socialMissions.map((mission) => (
              <div
                key={mission.id}
                className="flex items-center gap-4 p-4 rounded-2xl bg-white/40 backdrop-blur-sm border border-white/60 shadow-[0_0_5px_0_rgba(132,120,224,0.15)] hover:shadow-[0_0_12px_0_rgba(132,120,224,0.3)] hover:border-[#8478e0]/30 cursor-pointer transition-all"
                onClick={() => handleQuestClick(mission)}
              >
                {/* X icon */}
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-black flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-serif font-bold text-[15px] text-[#393f49] leading-tight truncate">
                      {mission.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[#696f8c]" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    <span>@{mission.postedBy}</span>
                    <span>{mission.totalSubmissions} submissions</span>
                    <span className="inline-flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                      {mission.status}
                    </span>
                  </div>
                </div>

                {/* Rewards (right side) */}
                <div className="flex-shrink-0 flex items-center gap-2">
                  {mission.rewards.map((r, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#71ca41]/10 text-[#71ca41] border border-[#71ca41]/20 whitespace-nowrap"
                      style={{ fontFamily: 'Outfit, sans-serif' }}
                    >
                      {r.icon && <span className="mr-1">{r.icon}</span>}
                      {r.amount > 0 ? `${r.amount} ${r.name}` : r.name}
                    </span>
                  ))}
                </div>

                {/* Arrow */}
                <svg className="flex-shrink-0 w-4 h-4 text-[#696f8c]" viewBox="0 0 16 16" fill="none">
                  <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {activeTab === 'quests' && socialMissions.length === 0 && (
        <div className="text-center py-16">
          <div className="common-container-style inline-block px-8 py-6">
            <h3 className="font-serif font-bold text-lg text-[#393f49] mb-2">No X Quests Yet</h3>
            <p className="font-['Outfit'] text-sm text-[#696f8c]">New quests are posted on X — check back soon!</p>
          </div>
        </div>
      )}

      {activeTab === 'projects' && allProjects.length === 0 && (
        <div className="text-center py-16">
          <div className="common-container-style inline-block px-8 py-6">
            <h3 className="font-serif font-bold text-lg text-[#393f49] mb-2">No Projects Yet</h3>
            <p className="font-['Outfit'] text-sm text-[#696f8c]">Check back later for new missions!</p>
          </div>
        </div>
      )}

      {activeTab === 'all' && socialMissions.length === 0 && allProjects.length === 0 && (
        <div className="text-center py-16">
          <div className="common-container-style inline-block px-8 py-6">
            <h3 className="font-serif font-bold text-lg text-[#393f49] mb-2">No Missions Available</h3>
            <p className="font-['Outfit'] text-sm text-[#696f8c]">Check back later for new missions!</p>
          </div>
        </div>
      )}

      {/* Pagination (projects only) */}
      {(activeTab === 'all' || activeTab === 'projects') && totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-8">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="size-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <img
              alt="Previous"
              src="https://statics.bloomprotocol.ai/icon/pagination-left.png"
              className="size-full"
            />
          </button>

          <div className="flex gap-1 items-center">
            {[...Array(totalPages)].map((_, index) => {
              const page = index + 1;
              const isVisible = page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;
              const isEllipsis = Math.abs(page - currentPage) === 2;

              if (isVisible) {
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`size-7 rounded-full font-['Outfit'] text-xs ${
                      page === currentPage
                        ? 'bg-[#8478e0] text-white'
                        : 'text-[#696f8c]'
                    }`}
                  >
                    {page}
                  </button>
                );
              }
              if (isEllipsis) {
                return (
                  <span key={page} className="size-7 flex items-center justify-center font-['Outfit'] text-xs text-[#696f8c]">
                    ...
                  </span>
                );
              }
              return null;
            })}
          </div>

          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="size-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <img
              alt="Next"
              src="https://statics.bloomprotocol.ai/icon/pagination-right.png"
              className="size-full"
            />
          </button>
        </div>
      )}
    </div>
  );
}
