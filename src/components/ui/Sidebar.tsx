'use client';

import React from 'react';

interface SidebarItem {
  label: string;
  count?: number;
  active?: boolean;
}

interface SidebarProps {
  items: SidebarItem[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  onBookmarkClick?: () => void;
  isBookmarked?: boolean;
  bookmarkCount?: number;
  additionalButton?: React.ReactNode;
  horizontal?: boolean;
}

export function Sidebar({ items, selectedIndex, onSelect, onBookmarkClick, isBookmarked = false, bookmarkCount = 0, additionalButton, horizontal = false }: SidebarProps) {
  if (horizontal) {
    return (
      <div className="w-full bg-white/10 backdrop-blur-sm rounded-lg p-4">
        <div className="flex items-center gap-2">
          {/* Bookmark Button */}
          {onBookmarkClick && (
            <button
              onClick={onBookmarkClick}
              className="px-4 py-2 bg-white/80 hover:bg-white/90 rounded-lg flex items-center gap-2 transition-all group"
            >
              <img 
                src={isBookmarked ? "https://statics.bloomprotocol.ai/icon/yoona-bookmarked.png" : "https://statics.bloomprotocol.ai/icon/yoona-bookmark.png"} 
                alt={isBookmarked ? 'Saved' : 'Save'}
                className={`w-4 h-4 transition-all ${
                  isBookmarked 
                    ? 'text-purple-600' 
                    : 'opacity-60 group-hover:opacity-100'
                }`}
                style={isBookmarked ? { filter: 'brightness(0) saturate(100%) invert(35%) sepia(85%) saturate(4143%) hue-rotate(263deg) brightness(92%) contrast(96%)' } : {}}
              />
              <span className={`font-medium text-sm ${isBookmarked ? 'text-purple-600' : 'text-gray-700'}`}>
                {isBookmarked ? 'Saved' : 'Save'}
                {bookmarkCount > 0 && ` (${bookmarkCount})`}
              </span>
            </button>
          )}
          
          {/* Additional button (e.g., Reviews) */}
          {additionalButton && additionalButton}
          
          {/* Navigation Items */}
          {items.map((item, index) => (
            <button
              key={item.label}
              onClick={() => onSelect(index)}
              className={`
                px-4 py-2 rounded-lg transition-all flex items-center gap-2
                ${selectedIndex === index
                  ? 'bg-blue-500/20 text-blue-900 font-medium'
                  : 'text-gray-700 hover:bg-gray-100/50'
                }
              `}
            >
              <span className="text-sm">▪</span>
              <span className="text-sm">{item.label}</span>
              {item.count !== undefined && (
                <span className="text-sm text-gray-600">({item.count})</span>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Original vertical layout
  return (
    <div className="w-64 bg-white/10 backdrop-blur-sm rounded-lg p-4">
      {/* Bookmark Button */}
      {onBookmarkClick && (
        <button
          onClick={onBookmarkClick}
          className="w-full mb-4 px-4 py-3 bg-white/80 hover:bg-white/90 rounded-lg flex items-center justify-between transition-all group"
        >
          <span className="flex items-center gap-2">
            <img 
              src={isBookmarked ? "https://statics.bloomprotocol.ai/icon/yoona-bookmarked.png" : "https://statics.bloomprotocol.ai/icon/yoona-bookmark.png"} 
              alt={isBookmarked ? 'Saved' : 'Save'}
              className={`w-5 h-5 transition-all ${
                isBookmarked 
                  ? 'text-purple-600' 
                  : 'opacity-60 group-hover:opacity-100'
              }`}
              style={isBookmarked ? { filter: 'brightness(0) saturate(100%) invert(35%) sepia(85%) saturate(4143%) hue-rotate(263deg) brightness(92%) contrast(96%)' } : {}}
            />
            <span className={`font-medium ${isBookmarked ? 'text-purple-600' : 'text-gray-700'}`}>
              {isBookmarked ? 'Saved' : 'Save'}
            </span>
          </span>
          {bookmarkCount > 0 && (
            <span className="text-sm text-gray-600">{bookmarkCount}</span>
          )}
        </button>
      )}
      
      {/* Additional button (e.g., Reviews) */}
      {additionalButton && (
        <div className="mb-4">
          {additionalButton}
        </div>
      )}
      
      <nav className="space-y-1">
        {items.map((item, index) => (
          <button
            key={item.label}
            onClick={() => onSelect(index)}
            className={`
              w-full text-left px-4 py-3 rounded-md transition-all
              flex items-center justify-between
              ${selectedIndex === index
                ? 'bg-blue-500/20 text-blue-900 font-medium'
                : 'text-gray-700 hover:bg-gray-100/50'
              }
            `}
          >
            <span className="flex items-center gap-2">
              <span className="text-sm">▪</span>
              {item.label}
            </span>
            {item.count !== undefined && (
              <span className="text-sm text-gray-600">({item.count})</span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}