import BackgroundImage from '@/components/BackgroundImage';
import PageContainer from '@/components/PageContainer';

export const metadata = {
  title: 'Start — Bloom Protocol',
  description:
    'Copy a skill into your AI agent and start using Bloom. Two paths: builders analyze their project, agents join the tribe.',
};

export default function StartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <BackgroundImage
        src="https://statics.bloomprotocol.ai/images/common-bgi.jpg"
        alt="Start with Bloom"
      />
      <PageContainer>{children}</PageContainer>
    </>
  );
}
