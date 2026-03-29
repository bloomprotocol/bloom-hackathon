'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/context/AuthContext';
import SampleIdentityCardsCarousel from './sample-identity-cards-carousel';
import { useRouter } from 'next/navigation';

export default function DashboardPreview() {
  const { connectWithEmail } = useAuth();
  const router = useRouter();

  const handleLogin = () => {
    connectWithEmail();
  };

  const handleExploreProjects = () => {
    router.push('/discover');
  };

  return (
    <div className="space-y-12 pb-12">
      {/* Hero Section */}
      <div className="text-center py-16 px-4">
        <h1 className="font-serif text-4xl desktop:text-5xl font-bold text-[#393f49] mb-4 tracking-tight">
          Your Supporter Journey Awaits
        </h1>
        <p className="font-['Outfit'] text-lg text-[#696f8c] mb-8 max-w-2xl mx-auto">
          Build your unique identity by supporting early-stage projects.
          Every pledge shapes who you are.
        </p>
        <button
          onClick={handleLogin}
          className="px-8 py-4 bg-gradient-to-r from-[#a59af3] to-[#eb7cff] text-white font-['Outfit'] font-semibold text-base rounded-xl hover:opacity-90 transition-opacity shadow-lg"
        >
          Start Your Journey
        </button>
      </div>

      {/* Sample Identity Cards */}
      <div className="max-w-[1400px] mx-auto px-4">
        <SampleIdentityCardsCarousel />
      </div>

      {/* How It Works */}
      <div className="max-w-[1200px] mx-auto px-4">
        <h2 className="font-serif text-3xl font-bold text-[#393f49] mb-8 text-center">
          How It Works
        </h2>
        <div className="grid grid-cols-1 desktop:grid-cols-3 gap-6">
          {[
            {
              step: '1',
              title: 'Support Projects',
              desc: 'Use 1,000 free Weekly Power to back early builders. No payment needed.',
              color: 'from-purple-50 to-purple-100',
            },
            {
              step: '2',
              title: 'Build Your Identity',
              desc: 'Your actions shape your unique Supporter card. Share it, show it off.',
              color: 'from-pink-50 to-pink-100',
            },
            {
              step: '3',
              title: 'Earn Rewards',
              desc: 'Get drops and exclusive perks from projects you support. Benefits vary by project.',
              disclaimer: '* Rewards and perks depend on each project\'s individual offerings',
              color: 'from-violet-50 to-violet-100',
            },
          ].map(({ step, title, desc, disclaimer, color }) => (
            <div
              key={step}
              className={`p-6 rounded-xl bg-gradient-to-br ${color} border border-purple-100 relative overflow-hidden`}
            >
              {/* Step Number Badge */}
              <div className="absolute top-4 right-4 size-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center border border-purple-200">
                <span className="font-['Outfit'] font-bold text-lg text-[#a59af3]">{step}</span>
              </div>

              <h3 className="font-['Outfit'] font-semibold text-xl text-[#393f49] mb-3 pr-12">
                {title}
              </h3>
              <p className="font-['Outfit'] text-sm text-[#696f8c] leading-relaxed">
                {desc}
              </p>
              {disclaimer && (
                <p className="font-['Outfit'] text-xs text-[#9ca3af] mt-3 italic">
                  {disclaimer}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Agent + Skills CTA */}
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="grid grid-cols-1 desktop:grid-cols-2 gap-6">
          <Link
            href="/for-agents"
            className="group p-6 rounded-xl bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200 hover:border-purple-300 transition-all"
          >
            <div className="flex items-start gap-4">
              <span className="text-3xl">🎨</span>
              <div>
                <h3 className="font-['Outfit'] font-semibold text-lg text-[#1e1b4b] mb-2">
                  Get Bloom Discovery
                </h3>
                <p className="font-['Outfit'] text-sm text-[#696f8c] leading-relaxed mb-3">
                  Install our AI agent skill — it analyzes your taste, builds your Identity Card, and recommends tools you'll love.
                </p>
                <span className="font-['Outfit'] text-sm font-medium text-purple-600 group-hover:underline">
                  Install now →
                </span>
              </div>
            </div>
          </Link>
          <Link
            href="/skills"
            className="group p-6 rounded-xl bg-gradient-to-br from-fuchsia-50 to-pink-50 border border-purple-200 hover:border-purple-300 transition-all"
          >
            <div className="flex items-start gap-4">
              <span className="text-3xl">🧩</span>
              <div>
                <h3 className="font-['Outfit'] font-semibold text-lg text-[#1e1b4b] mb-2">
                  Back AI Skills
                </h3>
                <p className="font-['Outfit'] text-sm text-[#696f8c] leading-relaxed mb-3">
                  Discover AI agent skills and back the ones you believe in with $1.00 USDC each. Your backing proves real demand to creators.
                </p>
                <span className="font-['Outfit'] text-sm font-medium text-purple-600 group-hover:underline">
                  Explore skills →
                </span>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Social Proof */}
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="p-8 rounded-xl bg-gradient-to-br from-purple-50 via-pink-50 to-violet-50 border border-purple-100 text-center">
          <div className="flex flex-col desktop:flex-row items-center justify-center gap-8 mb-6">
            <div>
              <div className="font-serif text-4xl font-bold text-[#393f49] mb-1">15k+</div>
              <div className="font-['Outfit'] text-sm text-[#696f8c]">Community Members</div>
            </div>
            <div className="w-px h-12 bg-purple-200 hidden desktop:block" />
            <div>
              <div className="font-serif text-4xl font-bold text-[#393f49] mb-1">50+</div>
              <div className="font-['Outfit'] text-sm text-[#696f8c]">Projects Backed</div>
            </div>
            <div className="w-px h-12 bg-purple-200 hidden desktop:block" />
            <div>
              <div className="font-serif text-4xl font-bold text-[#393f49] mb-1">1000+</div>
              <div className="font-['Outfit'] text-sm text-[#696f8c]">Weekly Power Used</div>
            </div>
          </div>
          <p className="font-['Outfit'] text-sm text-[#696f8c] mb-6">
            Join our community shaping the future of innovation
          </p>
          <button
            onClick={handleExploreProjects}
            className="px-6 py-3 bg-white text-[#a59af3] font-['Outfit'] font-semibold text-sm rounded-xl hover:bg-gray-50 transition-colors border border-purple-200"
          >
            Explore Projects
          </button>
        </div>
      </div>

      {/* Final CTA */}
      <div className="max-w-[800px] mx-auto px-4 text-center p-12 rounded-xl bg-gradient-to-r from-violet-100 to-purple-100 border border-purple-200">
        <h3 className="font-serif text-3xl font-bold text-[#393f49] mb-4">
          Ready to Start?
        </h3>
        <p className="font-['Outfit'] text-base text-[#696f8c] mb-6">
          Create your free account and get 1,000 Weekly Power to start supporting projects today.
        </p>
        <button
          onClick={handleLogin}
          className="px-8 py-4 bg-gradient-to-r from-[#a59af3] to-[#eb7cff] text-white font-['Outfit'] font-semibold text-base rounded-xl hover:opacity-90 transition-opacity shadow-lg"
        >
          Login to See Your Dashboard
        </button>
      </div>
    </div>
  );
}
