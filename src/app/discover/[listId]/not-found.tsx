import Link from 'next/link';

export default function CuratedListNotFound() {
  return (
    <div className="w-full max-w-md mx-auto py-20 px-4 flex flex-col items-center gap-6 text-center">
      <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center">
        <span className="text-2xl">🔗</span>
      </div>
      <div className="flex flex-col gap-2">
        <h1
          className="font-serif text-xl font-bold"
          style={{ color: '#1a1228' }}
        >
          List not found
        </h1>
        <p className="font-['Outfit'] text-sm text-[#696f8c]">
          This curated list may have expired or doesn&apos;t exist.
          Lists are available for 7 days after creation.
        </p>
      </div>
      <Link
        href="/skills"
        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#8b5cf6] text-white font-['Outfit'] font-semibold text-sm hover:opacity-90 transition-opacity shadow-[0px_1px_1px_0.05px_rgba(24,24,27,0.24)]"
      >
        Explore all skills
      </Link>
    </div>
  );
}
