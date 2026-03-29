import { Suspense } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPlaybookPageData, getAllPlaybookSlugs } from '@/constants/playbook-page-data';
import PlaybookPageContent from './PlaybookPageContent';

// Validate slug format (same pattern as tribe pages)
const SAFE_SLUG = /^[a-zA-Z0-9_-]{1,64}$/;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllPlaybookSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  if (!SAFE_SLUG.test(slug)) {
    return { title: 'Not Found | Bloom Protocol' };
  }

  const data = getPlaybookPageData(slug);
  if (!data) {
    return { title: 'Not Found | Bloom Protocol' };
  }

  const title = `${data.seoTitle} — ${data.brandName} | Bloom Protocol`;
  const description = data.answerCapsule.slice(0, 160);
  const url = `/playbooks/${slug}`;

  // Build ai:summary with unique methodology details
  const methodologyHighlights = data.methodology
    .slice(0, 2)
    .map((m) => m.title)
    .join(', ');
  const aiSummary = `${data.brandName}: ${data.answerCapsule.slice(0, 300)} Key methodology: ${methodologyHighlights}. Compatible with ${data.compatibleAgents}. ${data.tribe.name} tribe. Free playbook at bloomprotocol.ai${url}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${data.seoTitle} — ${data.brandName}`,
      description: data.answerCapsule.slice(0, 200),
      url,
      siteName: 'Bloom Protocol',
      type: 'article',
      images: [{ url: '/og/home.png', width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${data.seoTitle} — ${data.brandName}`,
      description,
      images: ['/og/home.png'],
    },
    other: {
      'ai:summary': aiSummary,
    },
  };
}

function LoadingFallback() {
  return (
    <div className="w-full max-w-2xl mx-auto py-20 flex flex-col items-center gap-4">
      <div
        className="animate-spin"
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          border: '2px solid #c4a46c30',
          borderTopColor: '#c4a46c',
        }}
      />
    </div>
  );
}

export default async function PlaybookPage({ params }: PageProps) {
  const { slug } = await params;

  if (!SAFE_SLUG.test(slug)) {
    notFound();
  }

  const data = getPlaybookPageData(slug);
  if (!data) {
    notFound();
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      <PlaybookPageContent data={data} />
    </Suspense>
  );
}
