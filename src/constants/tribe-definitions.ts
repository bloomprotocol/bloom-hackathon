export interface Tribe {
  id: string;
  name: string;
  tagline: string;
  memberCount: number;
  status: 'active' | 'forming';
  visible: boolean;
  description?: string;
  creed?: string;
  agentCount?: number;
  playbookCount?: number;
  relatedUseCaseIds?: string[];
  rootTensions?: string[];
  disclaimer?: string;
  worldIdRequired?: boolean;
}

export const TRIBE_COLOR = '#c4a46c';

export const tribes: Tribe[] = [
  // --- Primary tribes (visible, lifecycle order) ---
  {
    id: 'launch',
    name: 'Launch',
    tagline: 'Validation. Test your assumptions before you build too far.',
    creed: 'Most ideas deserve honest pressure, not polite encouragement. Your agent applies it — so you build what actually works.',
    memberCount: 0,
    status: 'active',
    visible: true,
    agentCount: 0,
    playbookCount: 3,
    rootTensions: [
      'Belief vs Objectivity',
      'Fuzzy signals vs Strict validation',
      'Bold ideas vs Feasibility',
      'Open participation vs Quality control',
    ],
  },
  {
    id: 'raise',
    name: 'Raise',
    tagline: 'Business. Turn traction into a real business — pricing, pitch, partnerships.',
    creed: 'Traction without a model is a hobby. Your agent pressure-tests your business — so you build something that lasts.',
    memberCount: 0,
    status: 'active',
    visible: false,
    agentCount: 0,
    playbookCount: 3,
    rootTensions: [
      'Growth vs Sustainability',
      'Revenue vs Scale',
      'Fundraising vs Bootstrapping',
      'Speed vs Defensibility',
    ],
    disclaimer: 'Community signal only. Not investment advice or endorsement. Bloom does not facilitate fundraising or capital transactions.',
  },
  {
    id: 'grow',
    name: 'Grow',
    tagline: 'Visibility. Content, SEO, GEO, distribution — being found by humans and agents.',
    creed: 'Visibility without authenticity is noise. Your agent tests what gets discovered, shared, and trusted — so you grow without shouting.',
    memberCount: 49,
    status: 'active',
    visible: false,
    agentCount: 19,
    playbookCount: 3,
    relatedUseCaseIds: ['geo'],
    rootTensions: [
      'Attention vs Trust',
      'Organic vs Engineered',
      'Visibility vs Authenticity',
      'Human vs AI Search',
    ],
  },
  {
    id: 'sanctuary',
    name: 'Sanctuary',
    tagline: 'Clarity. Learn how the best founders think — and discover how you think.',
    creed: 'The best founders aren\'t the smartest — they know themselves. Your agent brings decision patterns from history\'s best, and helps you find your own.',
    memberCount: 0,
    status: 'active',
    visible: true,
    agentCount: 0,
    playbookCount: 2,
    worldIdRequired: true,
    rootTensions: [
      'Ambition vs Wellbeing',
      'Hustle vs Sustainability',
      'Confidence vs Doubt',
      'Alone vs Supported',
    ],
  },
  // --- Legacy tribes (hidden, backend retains config) ---
  {
    id: 'invest',
    name: 'Invest',
    tagline: 'Alpha. Small caps, emerging sectors, pre-IPO analysis — finding what institutions miss.',
    creed: 'Alpha lives in the uncovered. Your agent scans where analysts don\'t — so you see the signal before the crowd.',
    memberCount: 23,
    status: 'active',
    visible: false,
    agentCount: 11,
    playbookCount: 2,
    rootTensions: [
      'Signal vs Noise',
      'Conviction vs Consensus',
      'Speed vs Depth',
      'Public data vs Private edge',
    ],
    disclaimer: 'Community research signal only. Not investment advice. Bloom Protocol does not facilitate trading, provide financial recommendations, or manage assets. Always consult a qualified financial advisor.',
  },
  {
    id: 'build',
    name: 'Build',
    tagline: 'Foundation. From zero to production agent — setup, skills, workflows.',
    creed: 'One person plus agents can outbuild a team. Your agent learns the architecture — so you ship what others only plan.',
    memberCount: 12,
    status: 'active',
    visible: false,
    agentCount: 6,
    playbookCount: 2,
    relatedUseCaseIds: ['find-skills'],
    rootTensions: ['Ship vs Craft', 'Simple vs Complete', 'Solo vs System', 'Tools vs Skills'],
  },
  {
    id: 'create',
    name: 'Create',
    tagline: 'Flow. Design, video, writing — raw creative output.',
    memberCount: 18,
    status: 'active',
    visible: false,
    agentCount: 8,
    playbookCount: 2,
    rootTensions: ['Original vs Effective', 'Volume vs Resonance', 'Voice vs Audience', 'AI vs Human'],
  },
  {
    id: 'connect',
    name: 'Connect',
    tagline: 'Bond. Helping human owners find each other and build together.',
    memberCount: 0,
    status: 'forming',
    visible: false,
    agentCount: 0,
    playbookCount: 0,
    rootTensions: ['Scale vs Intimacy', 'Retention vs Acquisition', 'Community vs Product', 'Listen vs Build'],
  },
  {
    id: 'publish',
    name: 'Publish',
    tagline: 'Voice. Content, distribution, AI discovery — being found without shouting.',
    memberCount: 31,
    status: 'active',
    visible: false,
    agentCount: 11,
    playbookCount: 1,
    relatedUseCaseIds: ['geo'],
    rootTensions: ['Visibility vs Authenticity', 'Evergreen vs Timely', 'Platform vs Owned', 'Human vs AI Search'],
  },
  {
    id: 'analyze',
    name: 'Analyze',
    tagline: 'Insight. Research, data, markets — seeing what others miss.',
    memberCount: 15,
    status: 'active',
    visible: false,
    agentCount: 14,
    playbookCount: 2,
    rootTensions: ['Signal vs Noise', 'Knowing vs Understanding', 'Speed vs Depth', 'Sharing vs Advantage'],
  },
  {
    id: 'think',
    name: 'Think',
    tagline: 'Wisdom. Agent OS, context engineering, workflows — deciding how agents work.',
    memberCount: 0,
    status: 'forming',
    visible: false,
    agentCount: 0,
    playbookCount: 0,
    rootTensions: ['Action vs Reflection', 'Data vs Intuition', 'Focus vs Exploration', 'Short vs Long Term'],
  },
];

export function getTribeById(id: string): Tribe | undefined {
  return tribes.find((t) => t.id === id);
}

export function getVisibleTribes(): Tribe[] {
  return tribes.filter((t) => t.visible);
}
