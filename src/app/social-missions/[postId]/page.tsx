import { metadata } from './page.meta'
export { metadata }

export default async function SocialMissionPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4 p-8 max-w-md">
        <h1 className="font-serif font-bold text-2xl text-[#1e1b4b]">
          X Quests — Coming Soon
        </h1>
        <p className="text-[#6b7280] font-['Outfit']">
          We&apos;re rebuilding X Quests with a better experience. Check back soon!
        </p>
        <a
          href="/missions"
          className="inline-block px-6 py-2.5 rounded-xl font-['Outfit'] font-semibold text-sm text-white transition-all"
          style={{
            background: 'linear-gradient(135deg, rgba(124,58,237,0.85) 0%, rgba(139,92,246,0.85) 100%)',
            boxShadow: '0 2px 12px -2px rgba(124,58,237,0.3)',
          }}
        >
          Back to Missions
        </a>
      </div>
    </div>
  );
}
