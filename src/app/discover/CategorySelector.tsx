'use client';

interface CategorySelectorProps {
  categories: string[];
  selectedCategories: string[];
  onCategoriesApply: (categories: string[]) => void;
  isFetching?: boolean;
}

import { CATEGORY_DEFINITIONS } from '@/constants/category-definitions';

interface CategoryTab {
  id: string;
  label: string;
}

// Main categories from centralized category definitions
const APP_STORE_TABS: CategoryTab[] = [
  { id: 'all', label: 'All' },
  ...CATEGORY_DEFINITIONS.map((cat) => ({
    id: cat.id,
    label: cat.label,
  })),
];

export default function CategorySelector({
  selectedCategories,
  onCategoriesApply,
  isFetching = false
}: CategorySelectorProps) {
  
  const handleTabClick = (tabId: string) => {
    if (tabId === 'all') {
      onCategoriesApply([]);
    } else {
      // Send single mainCategory to backend
      onCategoriesApply([tabId]);
    }
  };

  // Determine active tab - simplified for mainCategory system
  const getActiveTab = () => {
    if (selectedCategories.length === 0) return 'all';

    // Check if selected category matches any tab id
    const matchedTab = APP_STORE_TABS.find(tab =>
      selectedCategories.includes(tab.id)
    );

    return matchedTab?.id || 'all';
  };

  const activeTab = getActiveTab();

  if (isFetching) {
    return null;
  }

  return (
    <div className="w-full relative">
      {/* Left fade indicator */}
      <div className="absolute left-0 top-0 bottom-0 w-12 pointer-events-none z-10 rounded-l-2xl bg-gradient-to-r from-[rgba(249,250,251,0.95)] to-transparent" />

      {/* Right fade indicator */}
      <div className="absolute right-0 top-0 bottom-0 w-12 pointer-events-none z-10 rounded-r-2xl bg-gradient-to-l from-[rgba(249,250,251,0.95)] to-transparent" />

      <div
        className="flex gap-2 p-1.5 backdrop-blur-[40px] rounded-2xl border-2 relative overflow-x-auto overflow-y-hidden [&::-webkit-scrollbar]:hidden transition-all duration-300 hover:shadow-2xl group"
        style={{
          background: `
            linear-gradient(135deg,
              rgba(255, 255, 255, 0.3) 0%,
              rgba(255, 255, 255, 0.1) 50%,
              rgba(255, 255, 255, 0.3) 100%
            )
          `,
          borderImage: `
            linear-gradient(135deg,
              rgba(255, 255, 255, 0.9) 0%,
              rgba(255, 255, 255, 0.5) 50%,
              rgba(255, 255, 255, 0.9) 100%
            ) 1
          `,
          boxShadow: `
            0 8px 32px -8px rgba(139, 92, 246, 0.15),
            0 4px 16px -4px rgba(139, 92, 246, 0.1),
            0 2px 8px -2px rgba(139, 92, 246, 0.08),
            0 0 0 1px rgba(255, 255, 255, 0.6),
            inset 0 2px 4px rgba(255, 255, 255, 1),
            inset 0 -2px 4px rgba(139, 92, 246, 0.1),
            inset 2px 0 4px rgba(255, 255, 255, 0.5),
            inset -2px 0 4px rgba(139, 92, 246, 0.05)
          `,
          scrollbarWidth: 'none', /* Firefox */
          msOverflowStyle: 'none' /* IE and Edge */
        }}
      >
        {/* Glossy shine overlay */}
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none opacity-60 group-hover:opacity-80 transition-opacity duration-300"
          style={{
            background: `
              linear-gradient(
                135deg,
                rgba(255, 255, 255, 0.4) 0%,
                transparent 30%,
                transparent 70%,
                rgba(255, 255, 255, 0.3) 100%
              )
            `
          }}
        />
        {APP_STORE_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`relative flex-shrink-0 flex items-center justify-center px-4 py-2 rounded-xl text-sm font-semibold font-['Outfit'] whitespace-nowrap transition-all duration-300 ${
              activeTab === tab.id
                ? 'bg-white/95 text-[#393f49] scale-105 shadow-[0_6px_20px_-6px_rgba(139,92,246,0.25),_0_4px_12px_-4px_rgba(139,92,246,0.2),_0_2px_6px_-2px_rgba(139,92,246,0.15),_inset_0_2px_4px_rgba(255,255,255,1),_inset_0_-2px_2px_rgba(139,92,246,0.08),_inset_2px_0_3px_rgba(255,255,255,0.5),_inset_-2px_0_3px_rgba(139,92,246,0.05)]'
                : 'text-[#696f8c] hover:bg-white/50 hover:scale-102 hover:shadow-[0_4px_12px_-4px_rgba(139,92,246,0.15),_0_2px_6px_-2px_rgba(139,92,246,0.1),_inset_0_1px_2px_rgba(255,255,255,0.8),_inset_0_-1px_1px_rgba(139,92,246,0.05)]'
            }`}
          >
            {activeTab === tab.id && (
              <div
                className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{
                  background: `
                    linear-gradient(
                      135deg,
                      rgba(255, 255, 255, 0.6) 0%,
                      transparent 50%,
                      rgba(139, 92, 246, 0.05) 100%
                    )
                  `
                }}
              />
            )}
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
