// Mock AI analysis for Launch Committee v1
// Deterministic responses based on current_status + keyword matching
// Will be replaced with real LLM analysis in v2

import type { ProjectStatus, ProjectStage, RecommendedTribe } from './launch-committee-types';
import { STATUS_TO_STAGE, STAGE_TO_TRIBE, QUALITY_THRESHOLD } from './launch-committee-types';

interface MockAnalysisInput {
  project_name: string;
  description: string;
  problem: string;
  current_status: ProjectStatus;
  url?: string;
}

interface MockAnalysisResult {
  stage: ProjectStage;
  analysis: {
    market: string;
    product: string;
    growth: string;
    risk: string;
  };
  quality_score: number;
  can_publish: boolean;
  recommended_tribe: RecommendedTribe;
  improvement_suggestions: string[] | null;
}

// Analysis templates by status
const ANALYSIS_BY_STATUS: Record<ProjectStatus, { market: string; product: string; growth: string; risk: string }> = {
  idea: {
    market: "You're early — that's an advantage if you move fast. Before writing any code, validate that real people have this problem. Talk to 10 potential users this week. If they light up when you describe the problem (not the solution), you're onto something.",
    product: "Don't build yet. Create a landing page that describes the problem, not the product. If you can get 50 email signups in 2 weeks with zero product, you've earned the right to build. The fastest way to fail is building something nobody asked for.",
    growth: "Your only growth metric right now is conversations. Talk to potential users in communities where they already hang out. Reddit, Discord, X — wherever your audience lives. Find 10 people who say 'I need this yesterday.'",
    risk: "The biggest risk at the idea stage is building in isolation. Most ideas die not because they're bad, but because the founder spent 6 months building before talking to a single user. Validate the problem aggressively before investing time in the solution.",
  },
  mvp: {
    market: "You have something — now find product-market fit. The question isn't 'do people like it?' but 'would they be upset if it disappeared?' Run the Sean Ellis test: if fewer than 40% of users say they'd be 'very disappointed' without your product, keep iterating.",
    product: "Focus ruthlessly on the one thing users love most. Kill features that don't directly serve your core use case. The best MVPs do one thing exceptionally well. What's the single action users keep coming back for? Double down on that.",
    growth: "Pick ONE acquisition channel and master it before testing others. If your users are on X, do X. If they search for solutions, do SEO. Spreading across 5 channels means mastering none. Get to 100 active users from a single channel first.",
    risk: "The biggest risk at the MVP stage is premature scaling. Don't hire, don't raise, don't add features — until you have clear evidence of retention. If users come back without you poking them, you're ready to scale. If not, iterate.",
  },
  paying_users: {
    market: "You've proven demand — people pay for what you've built. Now study your best customers obsessively. What do they have in common? That's your ideal customer profile. Every dollar of marketing should target lookalikes of your happiest paying users.",
    product: "Your moat is what competitors can't easily copy. Is it data? Network effects? Integrations? Switching costs? If the answer is 'nothing,' you need to build one. The best time to build defensibility is when you have paying users and momentum.",
    growth: "Unit economics matter now. Know your CAC, LTV, and payback period. If LTV/CAC > 3, pour fuel on the fire. If it's below 3, optimize before scaling spend. The fastest growing companies aren't the ones spending the most — they're the ones spending the most efficiently.",
    risk: "Competition is your biggest risk now. Someone is watching your success and building a copy. Move faster, build deeper integrations, and lock in customers with switching costs. The window between 'proven model' and 'crowded market' is shorter than you think.",
  },
  scaling: {
    market: "You're in scaling mode — the market has validated you. Now it's about market share and positioning. Are you the category leader or a fast follower? If you're not #1 or #2 in your niche, narrow your niche until you are.",
    product: "At scale, your product is your platform. Think about what ecosystem you're building. APIs, integrations, marketplace — these create the flywheel that makes you harder to displace. Every integration is a switching cost for your customers.",
    growth: "Scale requires systems, not heroics. Build repeatable processes for every growth lever: content, partnerships, outbound, product-led growth. If it depends on one person's effort, it won't scale. Document, automate, delegate.",
    risk: "At scale, the biggest risk is organizational — not product. Can you hire fast enough? Can you maintain culture? Can you keep shipping at speed? The companies that die at this stage usually die from internal friction, not external competition.",
  },
};

// Calculate quality score based on input specificity
function calculateQualityScore(input: MockAnalysisInput): number {
  let score = 0;

  // Description length > 50 chars: +20
  if (input.description.length > 50) score += 20;

  // Problem length > 50 chars: +20
  if (input.problem.length > 50) score += 20;

  // Has URL: +20
  if (input.url && input.url.trim().length > 0) score += 20;

  // Description contains specific keywords: +10 each (max +20)
  const keywords = ['users', 'customers', 'problem', 'solve', 'market', 'revenue', 'growth'];
  const combinedText = `${input.description} ${input.problem}`.toLowerCase();
  let keywordScore = 0;
  for (const kw of keywords) {
    if (combinedText.includes(kw)) {
      keywordScore += 10;
      if (keywordScore >= 20) break;
    }
  }
  score += keywordScore;

  // Status beyond validation (paying_users or scaling): +20
  if (input.current_status === 'paying_users' || input.current_status === 'scaling') score += 20;

  return Math.min(score, 100);
}

// Generate improvement suggestions for low-quality submissions
function getImprovementSuggestions(input: MockAnalysisInput, score: number): string[] | null {
  if (score >= QUALITY_THRESHOLD) return null;

  const suggestions: string[] = [];

  if (input.description.length <= 50) {
    suggestions.push('Add more detail about what your project does — describe the key feature or value proposition.');
  }
  if (input.problem.length <= 50) {
    suggestions.push('Describe how users solve this problem today, and why existing solutions fall short.');
  }
  if (!input.url || input.url.trim().length === 0) {
    suggestions.push('Add a URL to your project, landing page, or prototype — it builds credibility.');
  }

  const combinedText = `${input.description} ${input.problem}`.toLowerCase();
  if (!combinedText.includes('users') && !combinedText.includes('customers')) {
    suggestions.push('Mention your target users or customers — who specifically has this problem?');
  }

  return suggestions.length > 0 ? suggestions : null;
}

export function generateMockAnalysis(input: MockAnalysisInput): MockAnalysisResult {
  const stage = STATUS_TO_STAGE[input.current_status];
  const recommended_tribe = STAGE_TO_TRIBE[stage];
  const analysis = ANALYSIS_BY_STATUS[input.current_status];
  const quality_score = calculateQualityScore(input);
  const can_publish = quality_score >= QUALITY_THRESHOLD;
  const improvement_suggestions = getImprovementSuggestions(input, quality_score);

  return {
    stage,
    analysis,
    quality_score,
    can_publish,
    recommended_tribe,
    improvement_suggestions,
  };
}
