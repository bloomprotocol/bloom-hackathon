import PageContainer from "@/components/PageContainer";

export default function ProjectDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="fixed inset-0 bg-white -z-10" />
      <PageContainer>{children}</PageContainer>
    </>
  );
}