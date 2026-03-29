'use client';

interface SegmentedControlProps {
  segments: string[];
  selectedIndex: number;
  onChange: (index: number) => void;
  className?: string;
}

export function SegmentedControl({ 
  segments, 
  selectedIndex, 
  onChange,
  className = ''
}: SegmentedControlProps) {
  return (
    <div className={`flex bg-gray-100 rounded-lg p-1 ${className}`}>
      {segments.map((segment, index) => (
        <button
          key={segment}
          onClick={() => onChange(index)}
          className={`
            flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all
            ${selectedIndex === index 
              ? 'bg-white text-black shadow-sm' 
              : 'text-gray-600 hover:text-gray-800'
            }
          `}
        >
          {segment}
        </button>
      ))}
      {segments.length > 3 && (
        <button className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-800">
          ▼
        </button>
      )}
    </div>
  );
}