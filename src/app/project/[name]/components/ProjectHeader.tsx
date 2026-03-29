import { Fragment } from 'react';
import type { Project, ProjectLinks } from '../types';

interface ProjectHeaderProps {
  project: Project;
  links: ProjectLinks | null;
  isBookmarked?: boolean;
  onBookmarkClick?: () => void;
}

export function ProjectHeader({ project, links, isBookmarked, onBookmarkClick }: ProjectHeaderProps) {
  const linkIcons: Record<string, string> = {
    website: 'https://statics.bloomprotocol.ai/icon/hi-globe-alt.svg',
    twitter: 'https://statics.bloomprotocol.ai/icon/remix-twitter-x-line.svg',
    telegram: 'https://statics.bloomprotocol.ai/icon/remix-telegram.svg',
    github: 'https://statics.bloomprotocol.ai/icon/remix-github-fill.svg',
    discord: 'https://statics.bloomprotocol.ai/icon/remix-discord-line.svg',
  };

  return (
    <div className="box-border content-stretch flex flex-col gap-4 desktop:gap-5 items-start justify-start p-0 relative w-full">
      {/* Mobile Layout - Two Column */}
      <div className="flex flex-row gap-4 desktop:hidden w-full">
        {/* Left Column: Logo */}
        {project.avatarUrl ? (
          <img 
            src={project.avatarUrl}
            alt={project.name}
            className="w-14 h-14 rounded-full object-cover shrink-0"
          />
        ) : (
          <div className="size-14 bg-purple-100 rounded-full flex items-center justify-center shrink-0">
            <span className="text-xl text-purple-600 font-semibold">
              {project.name?.charAt(0) || '?'}
            </span>
          </div>
        )}
        
        {/* Right Column: Name, Categories, Links */}
        <div className="flex flex-col gap-5 flex-1">
          {/* Name with Bookmark */}
          <div className="flex gap-3 items-center">
            <div className="font-['Times'] font-bold text-[#393f49] text-[24px] text-left">
              {project.name}
            </div>
            {onBookmarkClick && (
              <button
                onClick={onBookmarkClick}
                className="relative rounded-[30px] shrink-0 w-10 h-10 cursor-pointer hover:opacity-90 transition-opacity"
              >
                <div className="absolute border border-[#ffffff] border-solid inset-0 pointer-events-none rounded-[30px]" />
                <div className="flex flex-row items-center justify-center relative size-full">
                  <div className="box-border content-stretch flex flex-row gap-1 items-center justify-center p-[10px] relative w-10">
                    <div className="overflow-clip relative shrink-0 size-5">
                      <img
                        src={
                          isBookmarked
                            ? "https://statics.bloomprotocol.ai/icon/favorite_solid.png"
                            : "https://statics.bloomprotocol.ai/icon/favorite_stroke.png"
                        }
                        alt="Bookmark"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                </div>
              </button>
            )}
          </div>
          
          {/* Categories */}
          {project.categories && project.categories.length > 0 && (
            <div className="flex flex-row gap-3 items-center justify-start">
              {project.categories.map((cat: string, idx: number) => (
                <Fragment key={idx}>
                  {idx > 0 && (
                    <div className="flex h-[16px] items-center justify-center relative shrink-0 w-[0px]">
                      <div className="flex-none rotate-[90deg]">
                        <div className="h-0 relative w-4">
                          <div className="absolute bottom-0 left-0 right-0 top-[-1px]">
                            <div className="w-full h-[1px] bg-[#dad9e5]"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="font-['Outfit'] font-normal text-[#696f8c] text-[14px] text-left">
                    <p className="block leading-[1.4]">{cat}</p>
                  </div>
                </Fragment>
              ))}
            </div>
          )}
          
          {/* Links */}
          <div className="flex flex-row gap-3 items-center justify-start">
            {links && Object.entries(links).map(([key, url]) => (
              <a 
                key={key}
                href={url as string} 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-[#f6f6f6] relative rounded-[30px] shrink-0 w-10 h-10 flex items-center justify-center hover:opacity-90 transition-opacity"
              >
                <div className="absolute border border-[#ffffff] border-solid inset-0 pointer-events-none rounded-[30px]" />
                {linkIcons[key] && (
                  <img src={linkIcons[key]} alt={key} className="w-4 h-4 relative" />
                )}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Desktop Layout - Figma Horizontal Layout */}
      <div className="hidden desktop:flex flex-row items-center justify-between w-full">
        {/* Left Section - Logo, Name and Categories */}
        <div className="content-stretch flex gap-5 items-center justify-start relative shrink-0">
          {/* Logo */}
          {project.avatarUrl ? (
            <img 
              src={project.avatarUrl}
              alt={project.name}
              className="w-16 h-16 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="size-16 bg-purple-100 rounded-full flex items-center justify-center shrink-0">
              <span className="text-2xl text-purple-600 font-semibold">
                {project.name?.charAt(0) || '?'}
              </span>
            </div>
          )}
          
          {/* Name and Categories Container */}
          <div className="content-stretch flex flex-col gap-2 items-start justify-center relative shrink-0">
            {/* Project Name with Bookmark */}
            <div className="flex gap-3 items-center">
              <div className="font-['Times'] font-bold leading-[0] relative shrink-0 text-[#393f49] text-[24px] text-nowrap">
                <p className="leading-[1.2] whitespace-pre">
                  {project.name}
                </p>
              </div>
              {onBookmarkClick && (
                <button
                  onClick={onBookmarkClick}
                  className="relative rounded-[30px] shrink-0 w-10 h-10 cursor-pointer hover:opacity-90 transition-opacity"
                >
                  <div className="absolute border border-[#ffffff] border-solid inset-0 pointer-events-none rounded-[30px]" />
                  <div className="flex flex-row items-center justify-center relative size-full">
                    <div className="box-border content-stretch flex flex-row gap-1 items-center justify-center p-[10px] relative w-10">
                      <div className="overflow-clip relative shrink-0 size-5">
                        <img
                          src={
                            isBookmarked
                              ? "https://statics.bloomprotocol.ai/icon/favorite_solid.png"
                              : "https://statics.bloomprotocol.ai/icon/favorite_stroke.png"
                          }
                          alt="Bookmark"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                  </div>
                </button>
              )}
            </div>
            
            {/* Categories Row */}
            {project.categories && project.categories.length > 0 && (
              <div className="content-stretch flex gap-3 items-center justify-start relative shrink-0">
                {project.categories.map((cat: string, idx: number) => (
                  <Fragment key={idx}>
                    {idx > 0 && (
                      <div className="flex h-[16px] items-center justify-center relative shrink-0 w-[0px]">
                        <div className="flex-none rotate-[90deg]">
                          <div className="h-0 relative w-4">
                            <div className="absolute bottom-0 left-0 right-0 top-[-1px]">
                              <div className="w-full h-[1px] bg-[#dad9e5]"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div key={cat} className="flex flex-col font-['Outfit'] font-normal justify-center leading-[0] overflow-ellipsis overflow-hidden relative shrink-0 text-[#696f8c] text-[14px] text-nowrap">
                      <p className="[text-overflow:inherit] leading-[1.4] overflow-inherit whitespace-pre">
                        {cat}
                      </p>
                    </div>
                  </Fragment>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Section - Links */}
        <div className="content-stretch flex flex-row gap-3 items-center justify-start relative shrink-0">
          {links && Object.keys(links).length > 0 && (
            Object.entries(links).map(([key, url]) => (
              <a 
                key={key}
                href={url as string} 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-[#f6f6f6] relative rounded-[30px] shrink-0 w-10 h-10 flex items-center justify-center hover:opacity-90 transition-opacity"
              >
                <div className="absolute border border-[#ffffff] border-solid inset-0 pointer-events-none rounded-[30px]" />
                {linkIcons[key] && (
                  <img src={linkIcons[key]} alt={key} className="w-4 h-4 relative" />
                )}
              </a>
            ))
          )}
        </div>
      </div>

      {/* Quote/Caption Section */}
      {project.caption && (
        <div className="bg-[url('https://statics.bloomprotocol.ai/caption-bgi.jpg')] bg-cover bg-center bg-no-repeat relative rounded-xl shrink-0 w-full">
          <div className="flex flex-row items-center relative size-full">
            <div className="box-border content-stretch flex flex-row gap-2 desktop:gap-4 items-center justify-start p-3 desktop:p-[20px] relative w-full">
              {/* Left Quote */}
              <div className="overflow-clip relative shrink-0 size-4 desktop:size-8">
                <img 
                  src="https://statics.bloomprotocol.ai/icon/yoona_left-quotation.png"
                  alt="Left quotation" 
                  className="w-full h-full object-contain"
                />
              </div>
              
              {/* Quote Text */}
              <div className="basis-0 flex flex-col font-['Times'] font-bold grow justify-center leading-[0] min-h-px min-w-px relative shrink-0 text-[#000000] text-[20px] text-center">
                <p className="block leading-[1.2]">
                  {project.caption}
                </p>
              </div>
              
              {/* Right Quote */}
              <div className="overflow-clip relative shrink-0 size-4 desktop:size-8">
                <img 
                  src="https://statics.bloomprotocol.ai/icon/yoona_right-quotation.png"
                  alt="Right quotation" 
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}