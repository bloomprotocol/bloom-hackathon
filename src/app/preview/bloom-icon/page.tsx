import { BloomIcon } from '@/app/discover/icons';

export default function BloomIconPreview() {
  return (
    <div className="min-h-screen bg-[#F5F0EB] p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Bloom Icon Preview</h1>

        <div className="bg-white p-8 rounded-lg shadow-lg space-y-8">
          {/* Different sizes */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Different Sizes</h2>
            <div className="flex items-end gap-4">
              <div className="flex flex-col items-center gap-2">
                <BloomIcon size={16} />
                <span className="text-xs text-gray-500">16px</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <BloomIcon size={24} />
                <span className="text-xs text-gray-500">24px</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <BloomIcon size={32} />
                <span className="text-xs text-gray-500">32px</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <BloomIcon size={48} />
                <span className="text-xs text-gray-500">48px</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <BloomIcon size={64} />
                <span className="text-xs text-gray-500">64px</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <BloomIcon size={96} />
                <span className="text-xs text-gray-500">96px</span>
              </div>
            </div>
          </div>

          {/* On different backgrounds */}
          <div>
            <h2 className="text-xl font-semibold mb-4">On Different Backgrounds</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded flex flex-col items-center gap-2">
                <BloomIcon size={48} />
                <span className="text-xs text-gray-500">White</span>
              </div>
              <div className="bg-gray-100 p-4 rounded flex flex-col items-center gap-2">
                <BloomIcon size={48} />
                <span className="text-xs text-gray-500">Gray</span>
              </div>
              <div className="bg-[#F5F0EB] p-4 rounded flex flex-col items-center gap-2">
                <BloomIcon size={48} />
                <span className="text-xs text-gray-500">Beige</span>
              </div>
            </div>
          </div>

          {/* As used in Discover page */}
          <div>
            <h2 className="text-xl font-semibold mb-4">As Used in Discover (16px)</h2>
            <div className="flex items-center gap-2 bg-gray-50 p-4 rounded">
              <BloomIcon size={16} />
              <span className="text-sm font-medium">1,234</span>
              <span className="text-xs text-gray-500">Bloom Score</span>
            </div>
          </div>

          {/* Color Info */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Colors</h2>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded" style={{ backgroundColor: '#71ca41' }}></div>
                <span className="font-mono">#71ca41</span>
                <span className="text-gray-500">- Green leaves</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded" style={{ backgroundColor: '#a855f7' }}></div>
                <span className="font-mono">#a855f7</span>
                <span className="text-gray-500">- Purple flower</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
