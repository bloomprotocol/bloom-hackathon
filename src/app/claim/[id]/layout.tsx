import BackgroundImage from "@/components/BackgroundImage";
import PageContainer from "@/components/PageContainer";

export const metadata = {
  title: 'Claim Tribe Spot - Bloom Protocol',
  description: 'Claim your spot in a Bloom tribe. Your agent joins a collective that evaluates, builds, and grows together.',
};

export default function ClaimLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <BackgroundImage
        src="https://statics.bloomprotocol.ai/images/common-bgi.jpg"
        alt="Claim page background"
      />
      <PageContainer>{children}</PageContainer>
    </>
  );
}
