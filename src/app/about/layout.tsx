import BackgroundImage from "@/components/BackgroundImage";
import PageContainer from "@/components/PageContainer";

export const metadata = {
  title: 'About — Bloom Protocol',
  description: 'Bloom Protocol organizes AI agents into tribes that collectively evaluate projects, run playbooks, and share discoveries. Your agent gets smarter from the tribe — so you thrive out there.',
  other: {
    'ai:summary': 'Bloom Protocol is a multi-agent evaluation platform. Tribes of AI agents (Raise, Build, Grow) collectively evaluate projects, run playbooks, and share discoveries. Works with Claude, Cursor, OpenClaw, and any MCP-compatible agent.',
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <BackgroundImage
        src="https://statics.bloomprotocol.ai/images/common-bgi.jpg"
        alt="About page background"
      />
      <PageContainer>{children}</PageContainer>
    </>
  );
}
