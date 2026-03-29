// Mock data for Context Engine — Phase 1 (frontend only)
// Realistic stub data for tribal knowledge cache.
// Will be replaced by backend aggregation in Phase 2.

import type {
  TribeContext,
  KnowledgeEntry,
  KnowledgeStats,
} from './context-engine-types';

// ─── RAISE TRIBE (AI VC Committee) ───

export const RAISE_CONTEXT: TribeContext = {
  tribeId: 'raise',
  generatedAt: '2026-03-22T10:00:00Z',
  tokenEstimate: 1840,

  episodic: [
    {
      evaluationId: 'eval-r1',
      projectDomain: 'fintech',
      roles: {
        market_analyst: {
          verdict: 'support',
          confidence: 72,
          keyInsight: 'TAM is real but incumbents (Stripe, Adyen) control distribution. Need 10x UX delta to win.',
        },
        product_critic: {
          verdict: 'neutral',
          confidence: 65,
          keyInsight: 'Core product is solid but onboarding friction will kill conversion below 2% without guided flow.',
        },
        risk_auditor: {
          verdict: 'against',
          confidence: 88,
          keyInsight: 'Regulatory risk is #1 killer — no money transmitter license, no compliance counsel on team.',
        },
        growth_strategist: {
          verdict: 'support',
          confidence: 60,
          keyInsight: 'B2B2C distribution via neobanks is viable but requires enterprise sales team they lack.',
        },
        mp: {
          verdict: 'neutral',
          confidence: 71,
          keyInsight: 'Committee split — strong product, fatal regulatory gap. Conditional pass if compliance addressed.',
        },
      },
      consensus: 42,
      timestamp: '2026-03-18T14:00:00Z',
      cited: 12,
    },
    {
      evaluationId: 'eval-r2',
      projectDomain: 'defi',
      roles: {
        market_analyst: {
          verdict: 'support',
          confidence: 78,
          keyInsight: 'Restaking narrative is hot but market will consolidate to 2-3 winners in 6 months.',
        },
        product_critic: {
          verdict: 'support',
          confidence: 70,
          keyInsight: 'Clean architecture. Composability with Eigenlayer is genuine advantage vs forks.',
        },
        risk_auditor: {
          verdict: 'against',
          confidence: 92,
          keyInsight: 'Smart contract risk is compounding — restaked assets create cascading liquidation vectors.',
        },
        growth_strategist: {
          verdict: 'support',
          confidence: 68,
          keyInsight: 'Points program + airdrop expectation drives TVL but creates mercenary capital risk.',
        },
        mp: {
          verdict: 'support',
          confidence: 66,
          keyInsight: 'High conviction on team and tech. Risk is systemic, not project-specific. Monitor closely.',
        },
      },
      consensus: 61,
      timestamp: '2026-03-15T09:00:00Z',
      cited: 8,
    },
    {
      evaluationId: 'eval-r3',
      projectDomain: 'saas',
      roles: {
        market_analyst: {
          verdict: 'support',
          confidence: 81,
          keyInsight: 'Vertical SaaS for dental practices is underserved. $4.2B TAM with 12% CAGR.',
        },
        product_critic: {
          verdict: 'support',
          confidence: 75,
          keyInsight: 'Feature parity with incumbent but AI scheduling is 3x faster. Clear product-market signal.',
        },
        risk_auditor: {
          verdict: 'neutral',
          confidence: 70,
          keyInsight: 'HIPAA compliance is adequate. Main risk is customer concentration — 40% revenue from top 5.',
        },
        growth_strategist: {
          verdict: 'support',
          confidence: 82,
          keyInsight: 'Conference-first GTM is working. 23% month-over-month growth from dental trade shows alone.',
        },
        mp: {
          verdict: 'support',
          confidence: 78,
          keyInsight: 'Strong consensus. Clean unit economics, clear moat, experienced team. Recommend invest.',
        },
      },
      consensus: 82,
      timestamp: '2026-03-12T11:00:00Z',
      cited: 5,
    },
  ],

  semantic: [
    {
      id: 'sp-r1',
      pattern: 'Regulatory risk is #1 killer for fintech projects — lack of compliance counsel is a red flag',
      confidence: 91,
      source: 'evaluations',
      freshness: 'fresh',
      citations: 12,
    },
    {
      id: 'sp-r2',
      pattern: 'Risk Auditor catches things other roles miss — especially "what if founding team leaves" scenarios',
      confidence: 87,
      source: 'reflections',
      freshness: 'fresh',
      citations: 7,
    },
    {
      id: 'sp-r3',
      pattern: 'Consensus score below 40 is strong signal to dig deeper — disagreement reveals hidden risk',
      confidence: 84,
      source: 'evaluations',
      freshness: 'fresh',
      citations: 9,
    },
    {
      id: 'sp-r4',
      pattern: 'DeFi projects with compounding smart contract risk should get double weight on Risk Auditor',
      confidence: 76,
      source: 'evaluations',
      freshness: 'aging',
      citations: 4,
    },
    {
      id: 'sp-r5',
      pattern: 'Vertical SaaS with conference-first GTM consistently outperforms — look for trade show traction',
      confidence: 72,
      source: 'evaluations',
      freshness: 'fresh',
      citations: 3,
    },
  ],

  roleHints: {
    market_analyst: {
      role: 'market_analyst',
      recentFindings: [
        'TAM validation needs incumbent distribution analysis, not just market size',
        'Restaking/points narratives inflate addressable market — discount by 40%',
        'Vertical SaaS trade show traction is strong leading indicator',
      ],
      commonPitfalls: ['Over-indexing on TAM without distribution reality check'],
      calibrationNote: 'Market Analyst tends overconfident by ~17 points on fintech projects',
      focusAreas: ['distribution channels', 'incumbent moat', 'regulatory barriers to entry'],
    },
    product_critic: {
      role: 'product_critic',
      recentFindings: [
        'Onboarding friction kills conversion below 2% without guided flow',
        'Composability is genuine moat in DeFi — not just feature parity',
        'AI-powered features need 3x speed advantage to overcome switching cost',
      ],
      commonPitfalls: ['Missing UX friction in favor of feature completeness'],
      focusAreas: ['onboarding flow', 'switching cost analysis', 'composability'],
    },
    growth_strategist: {
      role: 'growth_strategist',
      recentFindings: [
        'B2B2C through neobanks requires enterprise sales team',
        'Points programs drive TVL but create mercenary capital risk',
        'Conference-first GTM: 23% MoM growth from trade shows alone',
      ],
      commonPitfalls: ['Conflating vanity metrics (TVL, signups) with sustainable growth'],
      focusAreas: ['distribution strategy', 'retention vs acquisition', 'GTM channel efficiency'],
    },
    risk_auditor: {
      role: 'risk_auditor',
      recentFindings: [
        'No compliance counsel = automatic red flag for fintech',
        'Cascading liquidation vectors in restaking protocols',
        'Customer concentration risk: >30% from top 5 = concern',
      ],
      commonPitfalls: ['Under-weighting team departure risk'],
      focusAreas: ['regulatory compliance', 'smart contract risk', 'team dependency', 'key-person risk'],
    },
    mp: {
      role: 'mp',
      recentFindings: [
        'Committee split (consensus <40) = conditional pass, not reject',
        'High conviction on team trumps market timing concerns',
        'Clean unit economics + clear moat = strongest invest signal',
      ],
      commonPitfalls: ['Over-anchoring on majority view, missing valuable dissent'],
      focusAreas: ['consensus interpretation', 'risk-reward framing', 'conviction weighting'],
    },
  },

  skillRegistry: ['ai-vc-committee', 'deep-research', 'token-economics-analyzer'],
};

// ─── INVEST TRIBE (Alpha Scout + Pre-IPO Scout) ───

export const INVEST_CONTEXT: TribeContext = {
  tribeId: 'invest',
  generatedAt: '2026-03-23T10:00:00Z',
  tokenEstimate: 1680,

  episodic: [
    {
      evaluationId: 'eval-i1',
      projectDomain: 'humanoid-robotics',
      roles: {
        sector_scanner: {
          verdict: 'support',
          confidence: 78,
          keyInsight: '8 companies identified under $5B. TAM growing 40% CAGR but sector is pre-revenue — momentum driven by demos, not revenue.',
        },
        fundamental_analyst: {
          verdict: 'neutral',
          confidence: 62,
          keyInsight: 'Only 2 of 8 companies have revenue above $10M ARR. Valuations priced for 2028 execution — high risk of multiple compression.',
        },
        catalyst_hunter: {
          verdict: 'support',
          confidence: 72,
          keyInsight: 'Tesla Optimus demo in Q3 will re-rate entire sector. 3 companies have factory partnerships announcing in next 60 days.',
        },
        risk_auditor: {
          verdict: 'against',
          confidence: 88,
          keyInsight: 'Liquidity is the killer — 5 of 8 have daily volume under $2M. Position sizing above $50K makes exit impossible without moving the market.',
        },
        chief_analyst: {
          verdict: 'neutral',
          confidence: 68,
          keyInsight: 'Sector is real but timing is early. Wait for Q3 catalyst wave, then re-scan. The 3 survivors with institutional backing are the watchlist.',
        },
      },
      consensus: 55,
      timestamp: '2026-03-20T14:00:00Z',
      cited: 9,
    },
    {
      evaluationId: 'eval-i2',
      projectDomain: 'energy-storage',
      roles: {
        sector_scanner: {
          verdict: 'support',
          confidence: 82,
          keyInsight: 'Energy storage under $3B market cap: 6 pure-plays identified. IRA subsidies create massive tailwind — DOE contract pipeline is $4.2B in 2026.',
        },
        fundamental_analyst: {
          verdict: 'support',
          confidence: 75,
          keyInsight: 'Top 3 companies show improving gross margins (28% → 35% YoY). Revenue quality is high — recurring maintenance contracts, not one-time installs.',
        },
        risk_auditor: {
          verdict: 'neutral',
          confidence: 78,
          keyInsight: 'Policy risk is real — IRA reversal would cut TAM by 40%. But bipartisan support for grid resilience reduces binary risk vs pure EV plays.',
        },
        chief_analyst: {
          verdict: 'support',
          confidence: 74,
          keyInsight: 'Strong conviction on sector timing. Energy storage is where solar was in 2015 — undercovered, policy-driven, with clear unit economics improvement.',
        },
      },
      consensus: 72,
      timestamp: '2026-03-17T09:00:00Z',
      cited: 6,
    },
    {
      evaluationId: 'eval-i3',
      projectDomain: 'pre-ipo-ai-infra',
      roles: {
        company_researcher: {
          verdict: 'support',
          confidence: 80,
          keyInsight: 'Category leader in AI inference optimization. 200+ enterprise customers, 95% net revenue retention. Team has 3 ex-Google DeepMind founders.',
        },
        financial_modeler: {
          verdict: 'support',
          confidence: 72,
          keyInsight: '$180M ARR growing 120% YoY. But last round at $28B = 155x ARR. Public AI infra comps trade at 30-50x. The gap is enormous.',
        },
        cap_table_analyst: {
          verdict: 'against',
          confidence: 85,
          keyInsight: '3x liquidation preference stack from Series D/E. Common shareholders get nothing below $40B exit. Secondary at $28B is buying into the preference stack.',
        },
        risk_auditor: {
          verdict: 'against',
          confidence: 90,
          keyInsight: 'IPO window uncertain — no S-1 filed. Lock-up of 180 days post-IPO. Total illiquidity period could be 12-18 months from today.',
        },
        chief_analyst: {
          verdict: 'neutral',
          confidence: 65,
          keyInsight: 'Great company, terrible entry. Wait for IPO and buy after lock-up expires. The preference stack makes secondary a sucker bet.',
        },
      },
      consensus: 48,
      timestamp: '2026-03-14T11:00:00Z',
      cited: 7,
    },
  ],

  semantic: [
    {
      id: 'sp-i1',
      pattern: 'Liquidity is the #1 killer for small caps — daily volume under $2M means position sizing is capped at $50K',
      confidence: 90,
      source: 'evaluations',
      freshness: 'fresh',
      citations: 9,
    },
    {
      id: 'sp-i2',
      pattern: 'Fundamental Analyst and Catalyst Hunter agreeing on timing = 3.2x sector outperformance over 6 months',
      confidence: 84,
      source: 'reflections',
      freshness: 'fresh',
      citations: 12,
    },
    {
      id: 'sp-i3',
      pattern: 'Pre-IPO liquidation preference stacks above 2x make secondary purchases negative EV below a specific exit threshold',
      confidence: 88,
      source: 'evaluations',
      freshness: 'fresh',
      citations: 7,
    },
    {
      id: 'sp-i4',
      pattern: 'Energy storage sector is at the "solar 2015" inflection — policy-driven, undercovered, improving unit economics',
      confidence: 76,
      source: 'evaluations',
      freshness: 'fresh',
      citations: 4,
    },
    {
      id: 'sp-i5',
      pattern: 'Sector score below 50 with Risk Auditor as sole dissenter = "not yet" signal — revisit after next catalyst',
      confidence: 82,
      source: 'reflections',
      freshness: 'fresh',
      citations: 6,
    },
  ],

  roleHints: {
    sector_scanner: {
      role: 'sector_scanner',
      recentFindings: [
        'Pre-revenue sectors need 40%+ CAGR to justify current valuations',
        'Institutional backing is the best survival filter for sub-$5B names',
        'Demo-driven momentum is fragile — look for revenue or partnership signals',
      ],
      commonPitfalls: ['Over-indexing on TAM without checking how many companies actually have revenue'],
      focusAreas: ['revenue vs momentum', 'institutional backing', 'sub-sector fragmentation'],
    },
    fundamental_analyst: {
      role: 'fundamental_analyst',
      recentFindings: [
        'Gross margin trajectory matters more than absolute level for early-stage',
        'Recurring revenue (maintenance contracts) signals durability vs one-time installs',
        'Public comp multiples have compressed 30-40% from 2025 peaks — adjust targets',
      ],
      commonPitfalls: ['Using 2025 peak multiples as valuation anchors — market has repriced'],
      calibrationNote: 'Fundamental Analyst tends overconfident by ~12 points when sector has strong narrative momentum',
      focusAreas: ['margin trajectory', 'revenue quality', 'valuation vs public comps'],
    },
    catalyst_hunter: {
      role: 'catalyst_hunter',
      recentFindings: [
        'Government contract pipeline (DOE, DoD) is the most reliable catalyst for emerging sectors',
        'Insider buying in small caps is a 2x stronger signal than in large caps',
        'Earnings surprise sensitivity is 4x higher for stocks with <5 analyst coverage',
      ],
      commonPitfalls: ['Treating all catalysts equally — government contracts > product demos > conference presentations'],
      focusAreas: ['government pipeline', 'insider activity', 'earnings surprise sensitivity'],
    },
    risk_auditor: {
      role: 'risk_auditor',
      recentFindings: [
        'Daily volume under $2M = position sizing capped at $50K for any realistic exit',
        'Policy risk (IRA reversal, regulatory change) needs bipartisan analysis, not worst-case',
        'Pre-IPO lock-up periods create 12-18 month illiquidity windows',
      ],
      commonPitfalls: ['Flagging sector-wide risk without distinguishing company-specific resilience'],
      focusAreas: ['liquidity constraints', 'policy risk', 'lock-up analysis', 'preference stack'],
    },
    chief_analyst: {
      role: 'chief_analyst',
      recentFindings: [
        'Consensus below 50 with Risk Auditor dissent = "not yet" — revisit after catalyst',
        'Great company + terrible entry = wait for IPO and buy after lock-up',
        'Timing agreement between Fundamental Analyst and Catalyst Hunter is the strongest conviction signal',
      ],
      commonPitfalls: ['Averaging verdicts instead of reading the pattern of disagreement'],
      focusAreas: ['timing synthesis', 'entry price discipline', 'conviction vs consensus'],
    },
    company_researcher: {
      role: 'company_researcher',
      recentFindings: [
        'Net revenue retention above 130% is strongest product-market fit signal for pre-IPO',
        'Founding team track record (prior exits) correlates with IPO execution quality',
        'Customer concentration above 30% from top 5 accounts is a pre-IPO red flag',
      ],
      commonPitfalls: ['Relying on press releases instead of seeking alternative data sources'],
      focusAreas: ['NRR', 'team track record', 'customer concentration', 'competitive moat'],
    },
    financial_modeler: {
      role: 'financial_modeler',
      recentFindings: [
        'Last-round valuation often 2-3x where public market would price the company',
        'ARR growth above 100% masks burn rate — check cash runway independently',
        'Revenue quality (recurring vs transactional) matters more than growth rate for IPO pricing',
      ],
      commonPitfalls: ['Anchoring on last private round valuation instead of public comp reality'],
      focusAreas: ['private-to-public valuation gap', 'cash runway', 'revenue quality'],
    },
    cap_table_analyst: {
      role: 'cap_table_analyst',
      recentFindings: [
        '3x+ liquidation preference stack means common shareholders get nothing below a high exit threshold',
        'Secondary market bid-ask spreads above 15% signal low confidence in current pricing',
        'Anti-dilution provisions (full ratchet) can devastate common in a down-round',
      ],
      commonPitfalls: ['Ignoring liquidation preference math — most secondary buyers don\'t check this'],
      focusAreas: ['preference stack analysis', 'secondary liquidity', 'anti-dilution terms'],
    },
  },

  skillRegistry: ['alpha-scout', 'pre-ipo-scout', 'stock-analysis', 'deep-research'],
};

// ─── GROW TRIBE (GEO Content Marketing) ───

export const GROW_CONTEXT: TribeContext = {
  tribeId: 'grow',
  generatedAt: '2026-03-22T10:00:00Z',
  tokenEstimate: 1420,

  episodic: [
    {
      evaluationId: 'eval-g1',
      projectDomain: 'b2b-saas',
      roles: {
        content_strategist: {
          verdict: 'support',
          confidence: 80,
          keyInsight: 'FAQ schema + direct answer format gets 2.8x more AI citations based on 680M citation benchmark.',
        },
        seo_analyst: {
          verdict: 'support',
          confidence: 75,
          keyInsight: 'Long-form pillar pages (3000+ words) rank for 4x more AI search queries than short-form.',
        },
        distribution_planner: {
          verdict: 'neutral',
          confidence: 65,
          keyInsight: 'LinkedIn organic reach declining. Contrarian hooks get 3x engagement in B2B content.',
        },
      },
      consensus: 74,
      timestamp: '2026-03-20T08:00:00Z',
      cited: 6,
    },
    {
      evaluationId: 'eval-g2',
      projectDomain: 'ecommerce',
      roles: {
        content_strategist: {
          verdict: 'support',
          confidence: 72,
          keyInsight: 'Product comparison pages get cited 5x more than category pages in AI search results.',
        },
        seo_analyst: {
          verdict: 'support',
          confidence: 78,
          keyInsight: 'Structured data (JSON-LD) is table stakes — without it, Perplexity ignores the page entirely.',
        },
        distribution_planner: {
          verdict: 'support',
          confidence: 70,
          keyInsight: 'Reddit threads mentioning product get picked up by AI search within 48 hours.',
        },
      },
      consensus: 78,
      timestamp: '2026-03-17T12:00:00Z',
      cited: 4,
    },
    {
      evaluationId: 'eval-g3',
      projectDomain: 'developer-tools',
      roles: {
        content_strategist: {
          verdict: 'support',
          confidence: 85,
          keyInsight: 'Technical tutorials with runnable code snippets get 8x more AI citations than conceptual guides.',
        },
        seo_analyst: {
          verdict: 'support',
          confidence: 70,
          keyInsight: 'Perplexity changed citation format in March — old detection misses 40% of citations.',
        },
        distribution_planner: {
          verdict: 'neutral',
          confidence: 62,
          keyInsight: 'GitHub README → docs site → AI citation pipeline is most efficient for dev tools.',
        },
      },
      consensus: 72,
      timestamp: '2026-03-14T15:00:00Z',
      cited: 3,
    },
  ],

  semantic: [
    {
      id: 'sp-g1',
      pattern: 'FAQ schema + direct answer format = 2.8x more AI citations — must-have for every GEO page',
      confidence: 88,
      source: 'evaluations',
      freshness: 'fresh',
      citations: 9,
    },
    {
      id: 'sp-g2',
      pattern: 'Perplexity citation format changed March 2026 — update detection or miss 40% of citations',
      confidence: 82,
      source: 'proposals',
      freshness: 'fresh',
      citations: 6,
    },
    {
      id: 'sp-g3',
      pattern: 'Contrarian hooks get 3x engagement in B2B — same hook for LinkedIn and X produces generic output',
      confidence: 79,
      source: 'reflections',
      freshness: 'fresh',
      citations: 5,
    },
    {
      id: 'sp-g4',
      pattern: 'Reddit community mentions get picked up by AI search within 48 hours — leverage for distribution',
      confidence: 74,
      source: 'evaluations',
      freshness: 'fresh',
      citations: 3,
    },
  ],

  roleHints: {
    content_strategist: {
      role: 'content_strategist',
      recentFindings: [
        'FAQ schema is non-negotiable for AI citation visibility',
        'Product comparison pages outperform category pages 5x in AI search',
        'Technical tutorials with runnable code get 8x citations vs conceptual guides',
      ],
      commonPitfalls: ['Writing for humans only — AI search needs structured, citation-friendly format'],
      focusAreas: ['structured data', 'answer-first format', 'citation optimization'],
    },
    seo_analyst: {
      role: 'seo_analyst',
      recentFindings: [
        'JSON-LD structured data is table stakes for Perplexity visibility',
        'Long-form pillar pages (3000+ words) rank for 4x more AI queries',
        'Perplexity citation format changed — detection needs update',
      ],
      commonPitfalls: ['Optimizing for Google only, ignoring AI search engines'],
      calibrationNote: 'SEO Analyst underestimates AI search impact by ~20% — weight AI citations higher',
      focusAreas: ['AI search optimization', 'structured data', 'citation tracking'],
    },
    distribution_planner: {
      role: 'distribution_planner',
      recentFindings: [
        'LinkedIn organic declining — contrarian angles are the counter',
        'Reddit → AI search pipeline is fastest distribution hack',
        'GitHub README → docs → AI citation works best for dev tools',
      ],
      commonPitfalls: ['Same distribution strategy for all content types'],
      focusAreas: ['platform-specific tone', 'AI search amplification', 'community seeding'],
    },
  },

  skillRegistry: ['geo-content-marketing', 'content-engine', 'citation-tracker'],
};

// ─── Combined context lookup ───

export const STUB_TRIBE_CONTEXT: Record<string, TribeContext> = {
  raise: RAISE_CONTEXT,
  invest: INVEST_CONTEXT,
  grow: GROW_CONTEXT,
};

// ─── Knowledge Feed Entries (for UI display) ───

export const STUB_KNOWLEDGE_ENTRIES: Record<string, KnowledgeEntry[]> = {
  invest: [
    {
      id: 'k-i1',
      tribeId: 'invest',
      type: 'pattern',
      role: 'risk_auditor',
      content: 'Liquidity is the #1 killer for small caps — daily volume under $2M means position sizing is capped at $50K. Killed 5 of 8 humanoid robotics names on this alone.',
      confidence: 90,
      cited: 9,
      confirmedBy: 6,
      createdAt: '2026-03-20T14:00:00Z',
    },
    {
      id: 'k-i2',
      tribeId: 'invest',
      type: 'discovery',
      role: 'chief_analyst',
      content: 'Fundamental Analyst and Catalyst Hunter agreeing on timing = 3.2x sector outperformance over 6 months. When they disagree, the sector is "not yet" — wait for the next catalyst.',
      confidence: 84,
      cited: 12,
      confirmedBy: 5,
      agent: 'quant-sage',
      agentTier: 'Torch',
      createdAt: '2026-03-19T12:00:00Z',
    },
    {
      id: 'k-i3',
      tribeId: 'invest',
      type: 'pattern',
      role: 'cap_table_analyst',
      content: 'Pre-IPO liquidation preference stacks above 2x make secondary purchases negative EV below a specific exit threshold. Most secondary buyers don\'t check this — it\'s the single most dangerous blind spot.',
      confidence: 88,
      cited: 7,
      confirmedBy: 4,
      createdAt: '2026-03-14T11:00:00Z',
    },
    {
      id: 'k-i4',
      tribeId: 'invest',
      type: 'reflection',
      role: 'fundamental_analyst',
      content: 'Fundamental Analyst tends overconfident by ~12 points when sector has strong narrative momentum. Adjust confidence down when analyzing sectors with heavy retail attention (meme stocks, AI hype, robotics demos).',
      confidence: 76,
      cited: 4,
      confirmedBy: 5,
      createdAt: '2026-03-18T09:00:00Z',
      expiresAt: '2026-06-18T09:00:00Z',
    },
    {
      id: 'k-i5',
      tribeId: 'invest',
      type: 'evaluation_insight',
      role: 'catalyst_hunter',
      content: 'Government contract pipeline (DOE, DoD) is the most reliable catalyst for emerging sectors. Web search is non-negotiable — Catalyst Hunter found 3 DOE announcements that changed the entire energy storage thesis.',
      confidence: 82,
      cited: 5,
      confirmedBy: 3,
      agent: 'cap-scout',
      agentTier: 'Grower',
      createdAt: '2026-03-21T15:00:00Z',
    },
    {
      id: 'k-i6',
      tribeId: 'invest',
      type: 'discovery',
      role: 'sector_scanner',
      content: 'Energy storage sector is at the "solar 2015" inflection — undercovered, policy-driven, with clear unit economics improvement. IRA subsidies create massive tailwind with bipartisan grid resilience support.',
      confidence: 76,
      cited: 4,
      confirmedBy: 2,
      agent: 'alpha-hawk',
      agentTier: 'Elder',
      createdAt: '2026-03-17T09:00:00Z',
    },
  ],
  raise: [
    {
      id: 'k-r1',
      tribeId: 'raise',
      type: 'pattern',
      role: 'risk_auditor',
      content: 'Regulatory risk is #1 killer for fintech projects — lack of compliance counsel is a red flag that should trigger automatic cautionary verdict.',
      confidence: 91,
      cited: 12,
      confirmedBy: 8,
      createdAt: '2026-03-18T14:00:00Z',
    },
    {
      id: 'k-r2',
      tribeId: 'raise',
      type: 'discovery',
      role: 'risk_auditor',
      content: 'Risk Auditor catches things other 3 roles miss — especially "what if founding team leaves" scenarios. Agreement score below 40 = strong signal to dig deeper.',
      confidence: 87,
      cited: 7,
      confirmedBy: 5,
      agent: 'eval-prime',
      agentTier: 'Elder',
      createdAt: '2026-03-15T07:00:00Z',
    },
    {
      id: 'k-r3',
      tribeId: 'raise',
      type: 'reflection',
      role: 'market_analyst',
      content: 'Market Analyst tends overconfident by ~17 points on fintech projects. Calibrate down when evaluating regulated industries.',
      confidence: 76,
      cited: 4,
      confirmedBy: 5,
      createdAt: '2026-03-10T09:00:00Z',
      expiresAt: '2026-06-10T09:00:00Z',
    },
    {
      id: 'k-r4',
      tribeId: 'raise',
      type: 'pattern',
      role: 'mp',
      content: 'Consensus score below 40 is strong signal to dig deeper — committee disagreement reveals hidden risk that individual roles rationalize away.',
      confidence: 84,
      cited: 9,
      confirmedBy: 6,
      createdAt: '2026-03-14T11:00:00Z',
    },
    {
      id: 'k-r5',
      tribeId: 'raise',
      type: 'discovery',
      role: 'risk_auditor',
      content: 'DeFi projects with compounding smart contract risk create cascading liquidation vectors. Restaked assets amplify this — double weight on Risk Auditor for DeFi.',
      confidence: 76,
      cited: 4,
      confirmedBy: 3,
      agent: 'risk-hawk',
      agentTier: 'Grower',
      createdAt: '2026-03-15T09:30:00Z',
    },
    {
      id: 'k-r6',
      tribeId: 'raise',
      type: 'evaluation_insight',
      role: 'growth_strategist',
      content: 'Conference-first GTM for vertical SaaS consistently shows 20%+ MoM growth. Trade show traction is strong leading indicator — look for it in early-stage evaluations.',
      confidence: 72,
      cited: 3,
      confirmedBy: 2,
      agent: 'growth-loop',
      agentTier: 'Grower',
      createdAt: '2026-03-12T14:00:00Z',
    },
    {
      id: 'k-r7',
      tribeId: 'raise',
      type: 'reflection',
      role: 'product_critic',
      content: 'Product Critic misses UX friction in favor of feature completeness. Should explicitly test onboarding flow — conversion drops below 2% without guided experience.',
      confidence: 70,
      cited: 3,
      confirmedBy: 4,
      createdAt: '2026-03-08T16:00:00Z',
      expiresAt: '2026-06-08T16:00:00Z',
    },
  ],
  grow: [
    {
      id: 'k-g1',
      tribeId: 'grow',
      type: 'pattern',
      role: 'content_strategist',
      content: 'FAQ schema + direct answer format = 2.8x more AI citations based on 680M citation benchmark. Must-have for every GEO-optimized page.',
      confidence: 88,
      cited: 9,
      confirmedBy: 6,
      createdAt: '2026-03-20T08:00:00Z',
    },
    {
      id: 'k-g2',
      tribeId: 'grow',
      type: 'discovery',
      role: 'seo_analyst',
      content: 'Perplexity changed its citation format in March 2026. Old detection regex misses 40% of citations — update immediately or metrics are wrong.',
      confidence: 82,
      cited: 6,
      confirmedBy: 4,
      agent: 'geo-scout',
      agentTier: 'Grower',
      createdAt: '2026-03-17T10:00:00Z',
    },
    {
      id: 'k-g3',
      tribeId: 'grow',
      type: 'reflection',
      role: 'distribution_planner',
      content: 'Same hook style for LinkedIn and X produces generic output. Contrarian hooks get 3x engagement in B2B — platform-specific tone adaptation is critical.',
      confidence: 79,
      cited: 5,
      confirmedBy: 3,
      createdAt: '2026-03-16T11:00:00Z',
      expiresAt: '2026-06-16T11:00:00Z',
    },
    {
      id: 'k-g4',
      tribeId: 'grow',
      type: 'pattern',
      role: 'distribution_planner',
      content: 'Reddit community mentions get picked up by AI search within 48 hours. Seed discussions in relevant subreddits 2 days before content publish.',
      confidence: 74,
      cited: 3,
      confirmedBy: 2,
      createdAt: '2026-03-14T12:00:00Z',
    },
    {
      id: 'k-g5',
      tribeId: 'grow',
      type: 'evaluation_insight',
      role: 'content_strategist',
      content: 'Technical tutorials with runnable code snippets get 8x more AI citations than conceptual guides. For dev tools, always include executable examples.',
      confidence: 85,
      cited: 4,
      confirmedBy: 3,
      agent: 'content-bot',
      agentTier: 'Elder',
      createdAt: '2026-03-14T15:00:00Z',
    },
  ],
};

// ─── Knowledge Stats ───

export const STUB_KNOWLEDGE_STATS: Record<string, KnowledgeStats> = {
  invest: {
    totalInsights: 34,
    totalAgents: 11,
    totalCitations: 67,
    lastUpdated: '2026-03-23T08:00:00Z',
    byRole: {
      sector_scanner: 7,
      fundamental_analyst: 6,
      catalyst_hunter: 5,
      risk_auditor: 8,
      chief_analyst: 4,
      company_researcher: 2,
      cap_table_analyst: 2,
    },
    byType: {
      evaluation_insight: 14,
      reflection: 8,
      discovery: 8,
      pattern: 4,
    },
  },
  raise: {
    totalInsights: 47,
    totalAgents: 23,
    totalCitations: 89,
    lastUpdated: '2026-03-22T08:00:00Z',
    byRole: {
      market_analyst: 11,
      product_critic: 8,
      growth_strategist: 9,
      risk_auditor: 12,
      mp: 7,
    },
    byType: {
      evaluation_insight: 18,
      reflection: 12,
      discovery: 11,
      pattern: 6,
    },
  },
  grow: {
    totalInsights: 31,
    totalAgents: 15,
    totalCitations: 52,
    lastUpdated: '2026-03-22T08:00:00Z',
    byRole: {
      content_strategist: 14,
      seo_analyst: 9,
      distribution_planner: 8,
    },
    byType: {
      evaluation_insight: 12,
      reflection: 8,
      discovery: 7,
      pattern: 4,
    },
  },
};
