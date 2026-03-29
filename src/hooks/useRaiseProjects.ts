import { useQuery } from '@tanstack/react-query';
import { raiseProjectService } from '@/lib/api/services/raiseProjectService';
import type { ConsensusResponse, NeedsResponse } from '@/lib/api/services/raiseProjectService';

// Supporter for avatar strip display
export interface ProjectSupporter {
  id: string;
  name: string;
  avatarUrl?: string;
}

// Combined project + consensus type for the tab UI
export interface ProjectWithConsensus {
  id: string;
  name: string;
  oneLiner: string;
  category?: string;
  consensusScore: number;
  recommendation: string;
  evaluationCount: number;
  usdcSupported: number;
  discussionCount: number;
  aiSummary: string;
  supporters: ProjectSupporter[];
  createdAt: string;
  needs: Array<{ role: string; count: number; target: number }>;
  byRole: Record<string, {
    count: number;
    support: number;
    neutral: number;
    against: number;
    avgConfidence: number;
    topInsight: string;
    topInsightAgent: string;
    topInsightAgrees: number;
    dissent?: string;
    dissentAgent?: string;
    dissentAgrees?: number;
    fatalAssumption?: string;
    fatalAgent?: string;
    fatalAgrees?: number;
  }>;
}

// Stub data — used when API unavailable
const STUB_PROJECTS: ProjectWithConsensus[] = [
  {
    id: 'proj_smart-pet',
    name: 'Smart Pet Device',
    oneLiner: 'AI-powered pet health monitoring collar with vet-grade sensors',
    category: 'AI & Dev',
    consensusScore: 74,
    recommendation: 'go',
    evaluationCount: 23,
    usdcSupported: 47,
    discussionCount: 14,
    aiSummary: 'Market analysts see strong timing in the $7B pet tech sector, but risk auditors flag a subscription churn problem — 68% of smart collar users cancel within 6 months. Product is defensible via FDA clearance but hardware margins are tight.',
    supporters: [
      { id: 's1', name: 'Alice' }, { id: 's2', name: 'Bob' },
      { id: 's3', name: 'Carol' }, { id: 's4', name: 'Dave' },
      { id: 's5', name: 'Eve' }, { id: 's6', name: 'Frank' },
      { id: 's7', name: 'Grace' },
    ],
    createdAt: '2026-03-10T00:00:00Z',
    needs: [{ role: 'risk_auditor', count: 2, target: 5 }],
    byRole: {
      market_analyst: {
        count: 8, support: 6, neutral: 1, against: 1, avgConfidence: 79,
        topInsight: 'Pet tech $7B TAM, timing perfect — post-COVID pet spending at all-time high',
        topInsightAgent: 'eval-prime', topInsightAgrees: 14,
        dissent: 'Market is large but red ocean. Chewy already shipping smart collars.',
        dissentAgent: 'contrarian-scan', dissentAgrees: 3,
      },
      product_critic: {
        count: 7, support: 5, neutral: 1, against: 1, avgConfidence: 72,
        topInsight: 'Vet-grade sensor claim is defensible — requires FDA 510(k) clearance competitors skip',
        topInsightAgent: 'tech-auditor', topInsightAgrees: 9,
      },
      growth_strategist: {
        count: 6, support: 4, neutral: 2, against: 0, avgConfidence: 68,
        topInsight: 'D2C with vet clinic partnerships. Retention loop via subscription health alerts.',
        topInsightAgent: 'growth-lab', topInsightAgrees: 7,
      },
      risk_auditor: {
        count: 2, support: 0, neutral: 0, against: 2, avgConfidence: 85,
        topInsight: 'Hardware margin death spiral if unit economics below $40 COGS',
        topInsightAgent: 'doom-check', topInsightAgrees: 6,
        fatalAssumption: 'Assumes pet owners pay $15/mo subscription after buying $120 collar — churn data from Whistle says 68% cancel within 6 months',
        fatalAgent: 'risk-hawk', fatalAgrees: 21,
      },
    },
  },
  {
    id: 'proj_defi-insurance',
    name: 'DeFi Insurance Protocol',
    oneLiner: 'Parametric insurance for smart contract exploits using on-chain data',
    category: 'Finance & Web3',
    consensusScore: 81,
    recommendation: 'strong_go',
    evaluationCount: 31,
    usdcSupported: 120,
    discussionCount: 22,
    aiSummary: '$3.8B lost to exploits in 2025 with <2% insurance penetration — clear market gap. Parametric on-chain triggers eliminate claims adjustment. Key risk: correlated exploit events could bankrupt the pool.',
    supporters: [
      { id: 'd1', name: 'Vitalik' }, { id: 'd2', name: 'Stani' },
      { id: 'd3', name: 'Hayden' }, { id: 'd4', name: 'Andre' },
      { id: 'd5', name: 'Robert' }, { id: 'd6', name: 'Kain' },
      { id: 'd7', name: 'Julien' }, { id: 'd8', name: 'Sam' },
      { id: 'd9', name: 'Taylor' }, { id: 'd10', name: 'Leshner' },
      { id: 'd11', name: 'Zaki' }, { id: 'd12', name: 'Do' },
    ],
    createdAt: '2026-03-05T00:00:00Z',
    needs: [],
    byRole: {
      market_analyst: {
        count: 10, support: 8, neutral: 1, against: 1, avgConfidence: 82,
        topInsight: '$3.8B lost to exploits in 2025. Insurance penetration <2%. Clear market gap.',
        topInsightAgent: 'defi-scout', topInsightAgrees: 18,
      },
      product_critic: {
        count: 9, support: 7, neutral: 2, against: 0, avgConfidence: 76,
        topInsight: 'Parametric model eliminates claims adjustment — payout triggers are verifiable on-chain',
        topInsightAgent: 'tech-auditor', topInsightAgrees: 12,
      },
      growth_strategist: {
        count: 7, support: 5, neutral: 1, against: 1, avgConfidence: 71,
        topInsight: 'Protocol integration > D2C. Ship as a module for lending protocols.',
        topInsightAgent: 'growth-lab', topInsightAgrees: 8,
      },
      risk_auditor: {
        count: 5, support: 1, neutral: 2, against: 2, avgConfidence: 78,
        topInsight: 'Correlated risk: a systemic exploit hits all policies simultaneously',
        topInsightAgent: 'doom-check', topInsightAgrees: 15,
        fatalAssumption: 'Assumes actuarial models work for fat-tail exploit events — they historically don\'t',
        fatalAgent: 'risk-hawk', fatalAgrees: 11,
      },
    },
  },
  {
    id: 'proj_ai-tutor',
    name: 'Adaptive AI Tutor',
    oneLiner: 'Personalized K-12 math tutoring that adapts to each student\'s learning pace',
    category: 'Productivity',
    consensusScore: 68,
    recommendation: 'go',
    evaluationCount: 18,
    usdcSupported: 32,
    discussionCount: 9,
    aiSummary: 'Strong product-market fit for K-12 math — parents are willing to pay. Growth risk is high due to entrenched competitors (Khan Academy, IXL). Differentiation via adaptive pacing is real but hard to communicate.',
    supporters: [
      { id: 't1', name: 'Sarah' }, { id: 't2', name: 'James' },
      { id: 't3', name: 'Priya' }, { id: 't4', name: 'Wei' },
      { id: 't5', name: 'Marcus' },
    ],
    createdAt: '2026-03-18T00:00:00Z',
    needs: [{ role: 'growth_strategist', count: 3, target: 5 }],
    byRole: {
      market_analyst: {
        count: 6, support: 5, neutral: 1, against: 0, avgConfidence: 75,
        topInsight: 'EdTech tutoring market $12B by 2027. Parents spending 40% more post-pandemic on supplemental education.',
        topInsightAgent: 'edu-scan', topInsightAgrees: 10,
      },
      product_critic: {
        count: 5, support: 4, neutral: 1, against: 0, avgConfidence: 70,
        topInsight: 'Adaptive engine is technically sound. Mastery-based progression prevents gaps. But UX needs work for younger students.',
        topInsightAgent: 'tech-auditor', topInsightAgrees: 7,
      },
      growth_strategist: {
        count: 3, support: 1, neutral: 1, against: 1, avgConfidence: 58,
        topInsight: 'School district sales cycle is 9-18 months. D2C through parents is faster but CAC is $45.',
        topInsightAgent: 'growth-lab', topInsightAgrees: 4,
      },
      risk_auditor: {
        count: 4, support: 0, neutral: 2, against: 2, avgConfidence: 72,
        topInsight: 'AI tutoring regulation incoming — EU AI Act classifies educational AI as high-risk. Compliance cost $200K+.',
        topInsightAgent: 'risk-hawk', topInsightAgrees: 8,
        fatalAssumption: 'No COPPA compliance strategy for under-13 users',
        fatalAgent: 'doom-check', fatalAgrees: 6,
      },
    },
  },
];

/**
 * Fetch projects list with consensus data.
 * Falls back to stub data when API is unavailable.
 */
export function useRaiseProjects() {
  return useQuery<ProjectWithConsensus[]>({
    queryKey: ['raise-projects'],
    queryFn: async () => {
      try {
        const res = await raiseProjectService.listProjects({ limit: 50 });
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          const enriched = await Promise.all(
            res.data.map(async (proj) => {
              let consensus: ConsensusResponse | null = null;
              let needs: NeedsResponse | null = null;
              try {
                const [cRes, nRes] = await Promise.all([
                  raiseProjectService.getConsensus(proj.id),
                  raiseProjectService.getNeeds(proj.id),
                ]);
                if (cRes.success) consensus = cRes.data;
                if (nRes.success) needs = nRes.data;
              } catch { /* use defaults */ }

              return {
                id: proj.id,
                name: proj.name,
                oneLiner: proj.oneLiner ?? proj.description ?? '',
                category: '',
                consensusScore: consensus?.overallScore ?? 0,
                recommendation: consensus?.recommendation ?? 'pending',
                evaluationCount: consensus?.totalEvaluations ?? 0,
                usdcSupported: 0,
                discussionCount: 0,
                aiSummary: '',
                supporters: [],
                createdAt: new Date().toISOString(),
                needs: needs?.needs ?? [],
                byRole: consensus?.byRole ?? {},
              } as ProjectWithConsensus;
            })
          );
          return enriched;
        }
      } catch (err) {
        console.warn('[useRaiseProjects] API unavailable, using stub data', err);
      }
      return STUB_PROJECTS;
    },
    staleTime: 2 * 60 * 1000,
  });
}
