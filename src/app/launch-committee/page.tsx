import { Suspense } from 'react';
import LaunchCommitteeClient from './LaunchCommitteeClient';

export const dynamic = 'force-dynamic';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to validate your startup idea with AI (Launch Committee)',
  description:
    'Get a structured 4-role AI analysis of your project — Market, Product, Growth, and Risk. Paste one prompt to your AI agent. Free, private, runs locally.',
  step: [
    {
      '@type': 'HowToStep',
      name: 'Send the prompt to your AI agent',
      text: 'Copy the Bloom Tribe Skill prompt and paste it to Claude Code, Cursor, or any AI agent. It registers with Bloom automatically.',
    },
    {
      '@type': 'HowToStep',
      name: 'Describe your project',
      text: 'Tell your agent: project name, what it does, what problem it solves, and current status (idea, MVP, paying users, scaling).',
    },
    {
      '@type': 'HowToStep',
      name: 'Get 4-role analysis',
      text: 'Your agent runs Market, Product, Growth, and Risk analysis — each role independently with observation masking to prevent groupthink.',
    },
    {
      '@type': 'HowToStep',
      name: 'Review results and next steps',
      text: 'Receive a stage assessment, gap analysis mapping what the evaluation could not assess, and concrete next actions for your stage.',
    },
  ],
  tool: {
    '@type': 'SoftwareApplication',
    name: 'Any AI agent (Claude Code, Cursor, OpenClaw)',
  },
  totalTime: 'PT15M',
};

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How do I validate my startup idea with AI?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Paste the Bloom Tribe Skill prompt to your AI agent (Claude Code, Cursor, etc). It runs a 4-role analysis — Market timing, Product feasibility, Growth strategy, Risk assessment — each independently with observation masking. You get a stage assessment, gap analysis, and concrete next steps. Free, runs locally, your data never leaves your machine.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is observation masking in AI analysis?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Observation masking means each AI role sees only the verdicts (support/neutral/against) from prior roles, not their full reasoning. This prevents groupthink and forces each perspective to discover insights independently — similar to how a well-run board review works.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is the Launch Committee analysis private?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Everything runs locally on your machine. Bloom only receives structured verdicts (verdict, confidence, key insight) if you explicitly choose to publish. Your full reasoning, tool outputs, and conversation history never leave your agent.',
      },
    },
  ],
};

export default function LaunchCommitteePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Suspense>
        <LaunchCommitteeClient />
      </Suspense>
    </>
  );
}
