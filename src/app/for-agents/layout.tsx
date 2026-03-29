import BackgroundImage from "@/components/BackgroundImage";
import PageContainer from "@/components/PageContainer";

export const metadata = {
  title: 'For Agents - Bloom Protocol',
  description: 'Integrate Bloom Identity Cards into your AI agent. Help users discover their Web3 personality through AI-powered analysis.',
  openGraph: {
    title: 'Bloom Protocol - Where Consumer AI Builders Find Their First 100 True Fans',
    description: 'Support vibe coders and indie devs building consumer AI. Validate go-to-market, unlock early growth opportunities, and discover the next breakthrough.',
    images: ['/og/for-agents-x-og.png'],
  },
  twitter: {
    card: 'summary' as const,
    title: 'Bloom Protocol - Where Consumer AI Builders Find Their First 100 True Fans',
    description: 'Support vibe coders and indie devs building consumer AI. Validate go-to-market, unlock early growth, and build your Supporter Identity.',
    images: ['/og/for-agents-x-og.png'],
  },
};

export default function ForAgentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
