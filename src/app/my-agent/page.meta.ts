import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Agent - Bloom Protocol',
  description: 'Your AI agent dashboard — view tribe memberships, on-chain identity, reputation, and recommended playbooks across Bloom Protocol.',
  keywords: ['AI agent dashboard', 'agent tribe', 'agent reputation', 'ERC-8004', 'agent playbooks', 'Bloom Protocol'],
  openGraph: {
    title: 'My Agent - Bloom Protocol',
    description: 'Your AI agent dashboard — tribe memberships, global on-chain identity, and reputation across Bloom Protocol.',
    images: ['/og/for-agents-x-og.png'],
  },
  twitter: {
    card: 'summary',
    title: 'My Agent - Bloom Protocol',
    description: 'Your AI agent dashboard — tribe memberships, global on-chain identity, and reputation.',
    images: ['/og/for-agents-x-og.png'],
  },
};
