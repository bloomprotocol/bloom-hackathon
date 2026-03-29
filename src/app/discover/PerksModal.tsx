'use client';

interface PerksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PERKS = [
  { title: 'Priority Rewards', desc: 'First in line for project drops' },
  { title: 'Founding Status', desc: 'Recognized as an early backer' },
  { title: 'Early Pricing', desc: 'Discounts from projects' },
  { title: 'Exclusive Skills', desc: 'Premium access & limited editions' },
];

const STEPS = [
  'Use your Pledge Power to back projects',
  'Popular projects get invited to Bloom',
  'Claim your Exclusive Pass & perks',
];

export default function PerksModal({ isOpen, onClose }: PerksModalProps) {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
    >
      <div
        className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300"
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 hover:bg-white text-gray-600 hover:text-gray-900 transition-colors"
          aria-label="Close"
        >
          <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
          </svg>
        </button>

        {/* Content */}
        <div className="p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Exclusive Pass</h2>

          {/* Pass Perks Section */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Pass Perks</h3>
            <div className="grid grid-cols-2 gap-3">
              {PERKS.map((perk) => (
                <div
                  key={perk.title}
                  className="p-3 rounded-xl bg-white/60 border border-white/80"
                >
                  <div className="text-sm font-semibold text-gray-900 mb-1">{perk.title}</div>
                  <div className="text-xs text-gray-600 leading-tight">{perk.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* How It Works Section */}
          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">How It Works</h3>
            <div className="flex flex-col gap-3">
              {STEPS.map((step, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-lg">
                    {index + 1}
                  </div>
                  <div className="text-sm text-gray-700 leading-snug">{step}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
