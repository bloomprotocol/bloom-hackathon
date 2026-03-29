'use client';

import { SKILL_CATEGORY_DEFINITIONS } from '@/constants/skill-category-definitions';

interface SkillCategorySelectorProps {
  selectedCategory: string | null;
  onCategorySelect: (category: string | null) => void;
}

const TABS = [
  { id: 'all', label: 'All' },
  ...SKILL_CATEGORY_DEFINITIONS.map((cat) => ({
    id: cat.id,
    label: cat.label,
  })),
];

export default function SkillCategorySelector({
  selectedCategory,
  onCategorySelect,
}: SkillCategorySelectorProps) {
  const handleTabClick = (tabId: string) => {
    if (tabId === 'all') {
      onCategorySelect(null);
    } else {
      onCategorySelect(tabId);
    }
  };

  const activeTab = selectedCategory || 'all';

  return (
    <div
      className="flex flex-wrap gap-1.5 p-1.5 rounded-2xl"
      style={{
        background: 'linear-gradient(135deg, rgba(16,185,129,0.06) 0%, rgba(255,255,255,0.15) 40%, rgba(16,185,129,0.08) 70%, rgba(255,255,255,0.12) 100%)',
        border: '1px solid rgba(16,185,129,0.18)',
        boxShadow: `
          0 4px 16px -4px rgba(16,185,129,0.1),
          0 2px 8px -2px rgba(16,185,129,0.06),
          inset 0 1px 2px rgba(255,255,255,0.7),
          inset 0 -1px 2px rgba(16,185,129,0.05)
        `,
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
      }}
    >
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => handleTabClick(tab.id)}
          className={`relative px-3 py-1.5 rounded-xl font-['Outfit'] font-semibold text-[13px] whitespace-nowrap transition-all duration-200 ${
            activeTab === tab.id
              ? 'text-emerald-900 scale-[1.03]'
              : 'text-emerald-700/60 hover:bg-emerald-50/40'
          }`}
          style={activeTab === tab.id ? {
            background: 'linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(255,255,255,0.9) 50%, rgba(16,185,129,0.06) 100%)',
            boxShadow: `
              0 4px 12px -3px rgba(16,185,129,0.22),
              0 2px 6px -2px rgba(16,185,129,0.14),
              inset 0 1px 2px rgba(255,255,255,1),
              inset 0 -1px 1px rgba(16,185,129,0.08)
            `,
          } : undefined}
        >
          {/* Glossy highlight on active tab */}
          {activeTab === tab.id && (
            <div
              className="absolute inset-0 rounded-xl pointer-events-none"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.5) 0%, transparent 50%, rgba(16,185,129,0.04) 100%)',
              }}
            />
          )}
          <span className="relative">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
