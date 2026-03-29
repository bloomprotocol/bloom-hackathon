"use client";

import BackgroundImage from "@/components/BackgroundImage";
import PageContainer from "@/components/PageContainer";
import { UserInfoProvider } from "@/app/(protected)/dashboard/contexts/user-info-context";
import { useAuth } from "@/lib/context/AuthContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading } = useAuth();

  // Show nothing while auth is still loading
  if (isLoading) {
    return null;
  }

  return (
    <UserInfoProvider>
      <>
        <BackgroundImage
          src="https://statics.bloomprotocol.ai/images/common-bgi.jpg"
          alt="Dashboard page background"
        />
        <PageContainer>{children}</PageContainer>
      </>
    </UserInfoProvider>
  );
}
