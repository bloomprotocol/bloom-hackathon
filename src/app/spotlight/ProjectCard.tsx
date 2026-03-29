"use client";

import { ProjectListItem } from "@/lib/api/services/projectService";
import { useAuthenticatedBookmark } from "@/hooks/useAuthenticatedBookmark";

interface ProjectCardProps {
  project: ProjectListItem;
  onClick: () => void;
}

export default function ProjectCard({ project, onClick }: ProjectCardProps) {
  // 使用 useAuthenticatedBookmark 處理未登入狀態
  const { isSaved, saveCount, handleBookmarkClick } = useAuthenticatedBookmark({
    projectId: project.id,
    projectName: project.name,
  });

  return (
    <div
      className="common-plp-card-style"
      onClick={onClick}
    >
      {/* 项目信息 */}
      <div className="flex items-center gap-3 mb-4">
        {/* Logo */}
        {project.avatarUrl ? (
          <img
            src={project.avatarUrl}
            alt={project.name}
            className="w-12 h-12 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gray-900 flex-shrink-0"></div>
        )}
        {/* 项目名 */}
        <h3 className="font-serif font-bold text-lg text-[#393f49] leading-none">{project.name}</h3>
      </div>

      {/* 描述文本 */}
      {project.caption && (
        <div className="flex items-center justify-center mb-4 bg-[url('https://statics.bloomprotocol.ai/images/spotlightPage-caption-bgi.jpg')] bg-cover bg-center bg-no-repeat p-3 rounded-lg">
          <p className="font-serif font-bold text-sm text-black text-center leading-none line-clamp-2 overflow-hidden">
            {project.caption}
          </p>
        </div>
      )}

      {/* Bookmark */}
      <button
        onClick={handleBookmarkClick}
        className="w-fit flex items-center gap-1 border border-gray-200 rounded-full px-2 py-1 hover:border-purple-300 transition-colors"
        data-saved={isSaved ? "true" : "false"}
        data-testid="bookmark-button"
      >
        <img
          src={isSaved
            ? "https://statics.bloomprotocol.ai/icon/favorite_solid.png"
            : "https://statics.bloomprotocol.ai/icon/favorite_stroke.png"
          }
          alt="Bookmark"
          className={`size-4 ${isSaved ? "opacity-100" : "opacity-60"}`}
        />
        <span className="font-['Outfit'] text-xs text-[#393f49]">
          {saveCount || project.save_count || 0}
        </span>
      </button>
    </div>
  );
}
