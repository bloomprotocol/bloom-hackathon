import { metadata } from './page.meta'
export { metadata }
import OpenBetaMainpage from '@/components/openBetaMainpage/OpenBetaMainpage';
import OpenBeta2ndScreen from '@/components/openBetaMainpage/OpenBeta2ndScreen';
import OpenBeta3rdScreen from '@/components/openBetaMainpage/OpenBeta3rdScreen';
import OpenBetaInfrastructureSection from '@/components/openBetaMainpage/OpenBetaInfrastructureSection';
import DashboardPreviewSection from '@/components/openBetaMainpage/DashboardPreviewSection';
import OpenBetaFooter from '@/components/openBetaMainpage/OpenBetaFooter';
import HomepageStats from '@/components/openBetaMainpage/HomepageStats';
import HomepageFaqSchema from '@/components/openBetaMainpage/HomepageFaqSchema';
import BackgroundVideo from '@/components/BackgroundVideo';

export default async function HomePage() {
  return (
    <>
      {/* Global background layer */}
      <div className="fixed inset-0 bg-[#F5F0EB] -z-20" />

      {/* Hero + 3 cards + CTA */}
      <div className="relative desktop:min-h-[708px]">
        <BackgroundVideo
          src="https://statics.bloomprotocol.ai/images/home/openBeta/home_open_beta_bg_video.mp4"
          poster="https://statics.bloomprotocol.ai/images/home/openBeta/home_open_beta_bgi_candidate_2.jpg"
          customHeight="h-[1080px] desktop:h-[960px]"
        />
        <div className="relative">
          <div className="mx-auto px-4 max-w-[1440px]">
            <OpenBetaMainpage />
          </div>
        </div>
      </div>

      {/* For Humans / For Agents */}
      <OpenBeta2ndScreen />

      {/* Email capture */}
      <DashboardPreviewSection />

      {/* Live stats bar */}
      <HomepageStats />

      {/* What Makes a Tribe — 3 pillars */}
      <OpenBeta3rdScreen />

      {/* Counter-positioning CTA */}
      <OpenBetaInfrastructureSection />

      {/* Footer */}
      <OpenBetaFooter />

      {/* FAQ + SoftwareApplication structured data for GEO */}
      <HomepageFaqSchema />
    </>
  );
}
