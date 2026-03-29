import BackgroundImage from "@/components/BackgroundImage";
import PageContainer from "@/components/PageContainer";

export default function BuildersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <BackgroundImage
        src="https://statics.bloomprotocol.ai/images/home/openBeta/home_open_beta_bgi_candidate_2.jpg"
        alt="Builder Portal Background"
      />
      <PageContainer>{children}</PageContainer>
    </>
  );
}
