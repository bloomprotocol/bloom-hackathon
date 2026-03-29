'use client';

import { useParams } from 'next/navigation';
import { BuilderMissionProvider } from './contexts/builder-mission-context';

export default function BuilderSocialMissionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const postId = params?.postId as string;

  // If no postId, render children without provider (for potential future routes)
  if (!postId) {
    return (
      <>
        <div className="fixed inset-0 bg-[url('https://statics.bloomprotocol.ai/images/body-light.jpg')] bg-cover bg-center bg-no-repeat -z-10" />
        <div className="min-h-[calc(100vh-56px)] desktop:min-h-[calc(100vh-84px)] relative">
          {children}
        </div>
      </>
    );
  }

  return (
    <BuilderMissionProvider postId={postId}>
      <>
        {/* Background */}
        <div className="fixed inset-0 bg-[url('https://statics.bloomprotocol.ai/images/body-light.jpg')] bg-cover bg-center bg-no-repeat -z-10" />

        {/* Content */}
        <div className="min-h-[calc(100vh-56px)] desktop:min-h-[calc(100vh-84px)] relative">
          {children}
        </div>
      </>
    </BuilderMissionProvider>
  );
}
