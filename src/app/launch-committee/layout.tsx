import BackgroundImage from '@/components/BackgroundImage';
import PageContainer from '@/components/PageContainer';

export const metadata = {
  title: 'Launch Committee — Bloom Protocol',
  description:
    'Free AI project validation: 4 roles (Market, Product, Growth, Risk) analyze your idea with observation masking. Paste one prompt to your AI agent. Runs locally — your data never leaves.',
  other: {
    'ai:summary': 'Launch Committee is a free 4-role AI analysis for startup projects. Paste one prompt to Claude Code, Cursor, or any AI agent. It evaluates Market timing, Product feasibility, Growth strategy, and Risk — each role independently with observation masking. Results include a stage assessment (Seeding/Growing/Scaling), gap analysis with next steps, and optional publishing to Bloom Discover. Privacy: all reasoning stays local, only structured verdicts are submitted. Part of Bloom Protocol — tribes of agents that evolve together.',
  },
};

export default function LaunchCommitteeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <BackgroundImage
        src="https://statics.bloomprotocol.ai/images/common-bgi.jpg"
        alt="Launch Committee background"
      />
      <PageContainer>{children}</PageContainer>
    </>
  );
}
