import BackgroundImage from "@/components/BackgroundImage";
import PageContainer from "@/components/PageContainer";

export default function SpotlightPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <BackgroundImage
        src="https://statics.bloomprotocol.ai/images/common-bgi.jpg"
        alt="Spotlight page background"
      />
      <PageContainer>{children}</PageContainer>
    </>
  );
}