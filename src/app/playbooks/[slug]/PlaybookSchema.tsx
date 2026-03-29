'use client';

import type { PlaybookPageData } from '@/constants/playbook-page-data';

interface Props {
  data: PlaybookPageData;
}

export default function PlaybookSchema({ data }: Props) {
  // 1. HowTo schema
  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: `${data.seoTitle} — ${data.brandName}`,
    description: data.answerCapsule.slice(0, 300),
    step: data.steps.map((step, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: step.name,
      text: step.description,
    })),
    tool: data.useCase?.skills
      ?.filter((s) => s.required)
      .map((s) => ({
        '@type': 'HowToTool',
        name: s.name,
      })) ?? [],
    author: {
      '@type': 'Organization',
      name: 'Bloom Protocol',
      url: 'https://bloomprotocol.ai',
    },
  };

  // 2. FAQPage schema
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: data.faq.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };

  // 3. CreativeWork schema
  const creativeWorkSchema = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: `${data.brandName} Playbook`,
    description: data.answerCapsule.slice(0, 200),
    author: {
      '@type': 'Organization',
      name: 'Bloom Protocol',
      url: 'https://bloomprotocol.ai',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Bloom Protocol',
    },
    url: `https://bloomprotocol.ai/playbooks/${data.slug}`,
    isAccessibleForFree: true,
    inLanguage: 'en',
    keywords: [
      data.brandName,
      'AI agent playbook',
      'multi-agent evaluation',
      ...(data.roles.length > 0 ? ['role isolation', 'observation masking'] : []),
      data.tribe.name + ' tribe',
    ].join(', '),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(creativeWorkSchema) }}
      />
    </>
  );
}
