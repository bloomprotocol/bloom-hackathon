"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import { PublicProfileProvider } from "./contexts/public-profile-context";

export default function ProfilePageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  // Auth guard: redirect to home if not authenticated
  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show nothing while checking auth or redirecting
  if (isLoading || !isAuthenticated) {
    return null;
  }

  // Only auth guard and provider - each sub-route handles its own layout
  return (
    <PublicProfileProvider>
      {children}
    </PublicProfileProvider>
  );
}
