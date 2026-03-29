"use client";

import BackgroundImage from "@/components/BackgroundImage";
import PageContainer from "@/components/PageContainer";
import { X402Provider } from "./contexts/x402-context";

export default function X402LinkPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <X402Provider>
      <>
        <BackgroundImage
          src="https://statics.bloomprotocol.ai/images/common-bgi.jpg"
          alt="X402 payment link page background"
        />
        <PageContainer>{children}</PageContainer>
      </>
    </X402Provider>
  );
}
