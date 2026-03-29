'use client';

import { useState } from 'react';
import IdentityCard from '@/components/identity/IdentityCard';
import { PERSONALITY_CONFIGS } from '@/components/identity/personalityConfig';

// All available categories
const ALL_CATEGORIES = [
  { key: 'ai', label: 'AI Tools', icon: '🤖' },
  { key: 'productivity', label: 'Productivity', icon: '⚡' },
  { key: 'wellness', label: 'Wellness', icon: '🧘' },
  { key: 'crypto', label: 'Crypto', icon: '💎' },
  { key: 'lifestyle', label: 'Lifestyle', icon: '🌟' },
  { key: 'education', label: 'Education', icon: '📚' },
  { key: 'dev-tools', label: 'Dev Tools', icon: '🛠️' },
  { key: 'design', label: 'Design', icon: '🎨' },
];

export default function IdentityCardsPreview() {
  const [selectedPersonality, setSelectedPersonality] = useState('The Explorer');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['ai', 'productivity', 'crypto']);

  const config = PERSONALITY_CONFIGS[selectedPersonality];

  const displayCategories = ALL_CATEGORIES.filter((cat) =>
    selectedCategories.includes(cat.key)
  );

  const toggleCategory = (key: string) => {
    if (selectedCategories.includes(key)) {
      setSelectedCategories(selectedCategories.filter((k) => k !== key));
    } else {
      if (selectedCategories.length < 3) {
        setSelectedCategories([...selectedCategories, key]);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Identity Cards Preview
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Controls */}
          <div className="space-y-6">
            {/* Personality Selector */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Select Personality
              </h2>
              <div className="space-y-2">
                {Object.keys(PERSONALITY_CONFIGS).map((name) => (
                  <button
                    key={name}
                    onClick={() => setSelectedPersonality(name)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      selectedPersonality === name
                        ? 'bg-purple-100 border-2 border-purple-500 text-purple-900'
                        : 'bg-gray-50 border-2 border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="font-semibold">{name}</div>
                    <div className="text-sm opacity-70">
                      {PERSONALITY_CONFIGS[name].description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Category Selector */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Select Top Categories
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Select up to 3 categories (currently: {selectedCategories.length}/3)
              </p>
              <div className="flex flex-wrap gap-2">
                {ALL_CATEGORIES.map((category) => {
                  const isSelected = selectedCategories.includes(category.key);
                  const canSelect = selectedCategories.length < 3 || isSelected;

                  return (
                    <button
                      key={category.key}
                      onClick={() => toggleCategory(category.key)}
                      disabled={!canSelect}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        isSelected
                          ? 'bg-purple-500 text-white border-2 border-purple-600'
                          : canSelect
                          ? 'bg-gray-100 text-gray-700 border-2 border-gray-200 hover:bg-gray-200'
                          : 'bg-gray-50 text-gray-400 border-2 border-gray-100 cursor-not-allowed opacity-50'
                      }`}
                    >
                      {category.icon} {category.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Info */}
            <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">
                ℹ️ How it works
              </h3>
              <p className="text-sm text-blue-800">
                The identity card dynamically shows only the user's <strong>top 3 categories</strong> based on their pledge history.
                Use the controls above to preview different personalities and category combinations.
              </p>
            </div>
          </div>

          {/* Right: Preview */}
          <div className="flex items-start justify-center">
            <div className="sticky top-8">
              <IdentityCard
                personalityName={config.name}
                personalityDescription={config.description}
                personalityImage={config.imageUrl}
                backgroundImage={config.backgroundImageUrl}
                topCategories={displayCategories}
                backgroundColor={config.backgroundColor}
                longDescription={config.longDescription}
                memberSince="January 2026"
                weekNumber={12}
                projectsSupported={15}
                cardId="E-3482"
                tier="Sprout"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
