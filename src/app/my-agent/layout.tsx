import BackgroundImage from "@/components/BackgroundImage";
import PageContainer from "@/components/PageContainer";
import { metadata } from "./page.meta";
export { metadata };

export default function MyAgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <BackgroundImage
        src="https://statics.bloomprotocol.ai/images/common-bgi.jpg"
        alt="My Agent page background"
      />
      <PageContainer>{children}</PageContainer>
    </>
  );
}
