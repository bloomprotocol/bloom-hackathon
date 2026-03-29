import BackgroundImage from "@/components/BackgroundImage";
import PageContainer from "@/components/PageContainer";
import { metadata } from "./page.meta";
export { metadata };

export default function SkillsPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <BackgroundImage
        src="https://statics.bloomprotocol.ai/images/common-bgi.jpg"
        alt="Skills page background"
      />
      <PageContainer>{children}</PageContainer>
    </>
  );
}
