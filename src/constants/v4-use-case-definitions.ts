// V18/V5 Use Case definitions — Tribe-based agent use case discovery
// Live use cases with research-backed paste blocks (AGENTS.md) + Coming Soon placeholders

export interface SkillDefinition {
  name: string;
  description: string;
  required: boolean;
}

export interface Web2Comparison {
  before: string;
  after: string;
}

export interface Methodology {
  sources: string[];
  keyStats: string[];
}

export interface TribeInfo {
  name: string;
  claimTarget: number; // 200
}

export type TribeStatus = 'accumulating' | 'open';
export type VerifiedStatus = 'bloom-verified' | 'community' | 'unverified';
export type UseCaseCategory = 'marketing' | 'productivity' | 'creativity' | 'building';
export type UseCaseStatus = 'live' | 'soon';

export interface UseCase {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: 'purple' | 'amber';
  category: UseCaseCategory;
  status: UseCaseStatus;
  skills: SkillDefinition[];
  web2Comparison: Web2Comparison[];
  pasteConfig: string; // full AGENTS.md text
  methodology: Methodology;
  tribe: TribeInfo;
  verifiedStatus: VerifiedStatus;
  claimCount: number;
  tribeStatus: TribeStatus;
  tribeLink?: string;
  enabledChains: string[];
  createdAt: string;
}

// ---------- Static use cases ----------

export const USE_CASES: UseCase[] = [
  {
    id: 'geo',
    title: 'GEO Content Marketing',
    description:
      'Optimize your content to appear in AI-generated answers. Your agent monitors how LLMs cite your brand and adjusts your publishing strategy to maximize visibility in ChatGPT, Perplexity, and Gemini results.',
    icon: '🌐',
    color: 'purple',
    category: 'marketing',
    status: 'live',
    skills: [
      {
        name: 'GEO Monitor',
        description: 'Track how AI models reference your brand across ChatGPT, Perplexity, and Gemini',
        required: true,
      },
      {
        name: 'Content Optimizer',
        description: 'Rewrite and structure content for maximum AI citation probability',
        required: true,
      },
      {
        name: 'Distribution Scheduler',
        description: 'Auto-publish optimized content across platforms on a schedule',
        required: false,
      },
    ],
    web2Comparison: [
      {
        before: 'You manually Googled your brand to check rankings',
        after: 'Your agent tracks AI citations across 5 LLMs in real time',
      },
      {
        before: 'You hired a content writer and hoped for SEO results',
        after: 'Your agent rewrites content specifically for AI answer inclusion',
      },
      {
        before: 'You posted on social media and checked analytics weekly',
        after: 'Your agent distributes content at optimal times and adapts based on AI pickup',
      },
    ],
    pasteConfig: `# AGENTS.md — GEO Content Marketing Configuration
# Bloom Protocol | Verified Use Case

## Skills Required

### 1. GEO Monitor (Required)
Monitor how AI language models reference, cite, and rank your brand.
- Track mentions across ChatGPT, Perplexity, Gemini, Claude, and Copilot
- Alert when citation frequency changes by >10%
- Weekly reports on AI visibility score

GitHub: https://github.com/bloom-protocol/geo-monitor-skill

### 2. Content Optimizer (Required)
Restructure existing content to maximize inclusion in AI-generated answers.
- Apply Generative Engine Optimization techniques
- Add structured data, citations, and authoritative formatting
- A/B test content variants for AI pickup rate

GitHub: https://github.com/bloom-protocol/content-optimizer-skill

### 3. Distribution Scheduler (Optional)
Automate content publishing across platforms.
- Schedule posts to blogs, social media, and newsletters
- Optimize posting times based on AI crawl patterns
- Track which published pieces get picked up by AI models

GitHub: https://github.com/bloom-protocol/distribution-scheduler-skill

## Research Basis
- 40% of Google searches now trigger AI Overviews (SEL, 2025)
- GEO-optimized content sees 30-115% more AI citations (Georgia Tech, 2024)
- Brands not optimizing for AI answers lose an estimated 25% organic traffic by 2026
`,
    methodology: {
      sources: [
        'Search Engine Land — "AI Overviews" study, 2025',
        'Georgia Tech — Generative Engine Optimization research, 2024',
        'Gartner — Organic traffic forecast, 2025',
      ],
      keyStats: [
        '40% of Google searches now trigger AI Overviews',
        'GEO-optimized content sees 30-115% more AI citations',
        '25% organic traffic loss projected for non-optimized brands by 2026',
      ],
    },
    tribe: {
      name: 'GEO Pioneers',
      claimTarget: 200,
    },
    verifiedStatus: 'bloom-verified',
    claimCount: 47,
    tribeStatus: 'accumulating',
    enabledChains: ['base'],
    createdAt: '2026-03-01T00:00:00Z',
  },
  {
    id: 'find-skills',
    title: 'Find Skills',
    description:
      'Your agent searches 10,000+ MCP servers and 7,800+ skills across security-scanned registries, curated awesome lists, and GitHub — then recommends safe, compatible matches for your stack. 36.8% of skills have security flaws. Your agent filters them out so you don\'t have to.',
    icon: '🔍',
    color: 'purple',
    category: 'building',
    status: 'live',
    skills: [
      {
        name: 'Smithery Registry',
        description: 'Semantic search across 7,300+ MCP servers with Invariant mcp-scan security scanning, verified badges, and deployment status',
        required: true,
      },
      {
        name: 'Bloom Discovery',
        description: 'Personality-aware skill recommendations — matches tools to your agent profile and working style',
        required: true,
      },
      {
        name: 'GitHub MCP Server',
        description: 'Search GitHub repos by topic, stars, and language to discover emerging tools before they hit registries',
        required: false,
      },
      {
        name: 'Awesome List Scanner',
        description: 'Crawl curated GitHub awesome lists (MCP servers, OpenClaw skills, Claude Code resources) as seed data for discovery',
        required: false,
      },
      {
        name: 'Glama Security Scanner',
        description: 'Cross-reference results with Glama\'s A-F security grades and automated codebase scanning for a second safety opinion',
        required: false,
      },
    ],
    web2Comparison: [
      {
        before: 'You scrolled through awesome-mcp-servers README looking for the right tool',
        after: 'Your agent searches 10K+ skills across 5 registries and returns the top 3 matches in seconds',
      },
      {
        before: 'You compared GitHub stars and README quality to guess which tool was better',
        after: 'Your agent cross-references download stats, compatibility, and community ratings automatically',
      },
      {
        before: 'You discovered a new tool months after it launched because no one told you',
        after: 'Your agent monitors GitHub trending and new registry entries daily and alerts you to relevant releases',
      },
    ],
    pasteConfig: `# AGENTS.md — Find Skills Configuration
# Bloom Protocol | Verified Use Case | Build Tribe

## Skills Required

### 1. Smithery Registry (Required) — Primary Search + Security Gate
Semantic search with built-in security scanning via Invariant mcp-scan.
- API: \`GET https://registry.smithery.ai/servers?q=<query>\`
- Filters: \`owner:\`, \`repo:\`, \`is:deployed\`, \`is:verified\`
- 7,300+ servers with deployment status + scan results
- Scans for: tool poisoning, rug pulls (malicious updates), prompt injection
- Requires: Bearer token (free tier available)
- Get free API key: https://smithery.ai/account/api-keys
- Example: \`curl -H "Authorization: Bearer $SMITHERY_TOKEN" "https://registry.smithery.ai/servers?q=database+migration&pageSize=5"\`

Docs: https://smithery.ai/docs/use/registry

### 2. Bloom Discovery (Required) — Personalization Layer
Personality-aware skill recommendations from the Bloom catalog.
- Install: \`clawhub install bloom-discovery\`
- Matches skills to your agent profile (personality type, taste spectrums)
- Scores: matchScore (0-100) based on category affinity + usage patterns
- Pipeline: catalog fetch → personality boost → dedup → category grouping

GitHub: https://github.com/bloomprotocol/bloom-discovery-skill

### 3. GitHub MCP Server (Optional) — Emerging Tools
Search GitHub directly for new repos before they hit registries.
- Install: \`npx @modelcontextprotocol/server-github\`
- Search by topic, stars, language, and trending period
- Requires: GITHUB_TOKEN env var

GitHub: https://github.com/github/github-mcp-server

### 4. Awesome List Scanner (Optional) — Curated Seed Data
Crawl community-maintained awesome lists as data sources.
- Fetch raw markdown from GitHub and parse entries
- Cross-reference with Smithery results for dedup
- Use as fallback when registries miss niche tools

### 5. Glama Security Scanner (Optional) — Second Safety Opinion
Cross-reference discovery results with Glama's independent security grading.
- API: \`GET https://glama.ai/api/mcp/v1/servers/{owner}/{name}\`
- No auth required for public reads
- Example: \`curl "https://glama.ai/api/mcp/v1/servers/modelcontextprotocol/server-postgres"\`
- Provides A-F grades for security, quality, and license compliance
- Automated codebase + dependency scanning
- 9,000+ servers indexed

## Safety Rules

An agent MUST follow these rules before recommending any skill:

1. **Never auto-install** — always present results for human approval
2. **Check Smithery scan results** — skip any server flagged for tool poisoning or prompt injection
3. **Cross-reference Glama grade** — warn user if security grade is C or below
4. **Credential handling check** — reject skills that pass API keys through LLM context in plaintext
5. **Provenance check** — flag repos from accounts created <30 days ago or with 0 history
6. **Permission scope** — warn if a skill requests filesystem, SSH, or env variable access without clear justification
7. **Rug pull protection** — prefer pinned versions over \`latest\`; flag repos with recent ownership transfers

## Data Sources — Awesome Lists

Community-maintained lists that feed the discovery pipeline.
Agent fetches raw markdown from these repos and parses entries.

### MCP Servers
| Repo | Stars | Entries | Notes |
|------|-------|---------|-------|
| \`punkpeye/awesome-mcp-servers\` | 83K | ~700 | #1 MCP directory. Badge format, easy to parse |
| \`modelcontextprotocol/servers\` | 81K | ~50 | Official Anthropic reference implementations |
| \`punkpeye/awesome-mcp-clients\` | 6K | ~100 | MCP client ecosystem |

### Agent Skills
| Repo | Stars | Entries | Notes |
|------|-------|---------|-------|
| \`VoltAgent/awesome-openclaw-skills\` | 37K | 5,366 | OpenClaw registry mirror, 24 categories |
| \`hesreallyhim/awesome-claude-code\` | 28K | ~300 | Claude Code skills, hooks, slash-commands |
| \`sickn33/antigravity-awesome-skills\` | 24K | 1,259 | Has \`skills_index.json\` for programmatic use |
| \`github/awesome-copilot\` | 25K | Varied | Official Copilot skills and agents |

### Agent Frameworks & Apps
| Repo | Stars | Entries | Notes |
|------|-------|---------|-------|
| \`Shubhamsaboo/awesome-llm-apps\` | 102K | ~100 | Complete agent apps with code examples |
| \`e2b-dev/awesome-ai-agents\` | 26K | ~140 | Open-source + closed-source agents |
| \`kyrolabs/awesome-agents\` | 1.9K | ~130 | Framework-focused, updated daily |

### Parse Priority
1. \`sickn33/antigravity-awesome-skills\` — has JSON index, zero parsing needed
2. \`punkpeye/awesome-mcp-servers\` — consistent badge format, regex-friendly
3. \`VoltAgent/awesome-openclaw-skills\` — consistent \`[name](url) - desc\` format
4. \`hesreallyhim/awesome-claude-code\` — consistent entry format

## Recommended Workflow

1. **Intent** — User describes what they need ("I need a skill for database migrations")
2. **Search** — Agent queries Smithery (primary, with scan results) + awesome lists (supplementary)
3. **Security Gate** — Filter out any flagged results (tool poisoning, prompt injection, credential leaks)
4. **Augment** — Cross-reference with Glama grades for a second safety opinion
5. **Personalize** — Bloom Discovery ranks safe results by agent profile compatibility
6. **Validate** — GitHub MCP checks repo health (stars, last commit, open issues, account age)
7. **Recommend** — Agent presents top 3 with install commands, safety status, and reasoning
8. **Human Approval** — User reviews and confirms before any installation

## Research Basis
- MCP ecosystem grew from 100 to 10,000+ servers in 12 months (MCP Steering Committee, 2026)
- 36.8% of skills have at least one security flaw; 13.4% are critical (Snyk ToxicSkills, 2026)
- 7.1% of skills leak credentials through LLM context in plaintext (Snyk, 2026)
- ClawHavoc attack: 1,184+ malicious skills deployed Atomic macOS Stealer (SecureBlink, 2026)
- Average developer spends 3.2 hours/week evaluating new tools (GitHub Octoverse, 2025)
- Agent-assisted discovery reduces tool evaluation time by 80% (Bloom Protocol internal, 2026)
- Top 6 awesome lists collectively index 7,800+ unique skills and servers
`,
    methodology: {
      sources: [
        'Snyk — ToxicSkills: malicious AI agent skills on ClawHub, 2026',
        'Snyk — OpenClaw skills credential leaks research (7.1%), 2026',
        'SecureBlink — ClawHavoc supply chain attack analysis, 2026',
        'Invariant Labs — mcp-scan: tool poisoning & rug pull detection, 2025',
        'OWASP — MCP Top 10 v0.1 Beta, 2026',
        'GitHub Octoverse — Developer tool evaluation time, 2025',
        'Bloom Protocol — Agent-assisted discovery benchmarks, 2026',
      ],
      keyStats: [
        '36.8% of skills have at least one security flaw (Snyk, 2026)',
        '7.1% of skills leak credentials through LLM context (Snyk, 2026)',
        '1,184+ malicious skills found in ClawHavoc supply chain attack',
        'MCP ecosystem: 100 → 10,000+ servers in 12 months',
        'Top 6 awesome lists collectively index 7,800+ unique skills and servers',
        'Developers spend 3.2 hours/week evaluating new tools',
      ],
    },
    tribe: {
      name: 'Build',
      claimTarget: 200,
    },
    verifiedStatus: 'bloom-verified',
    claimCount: 12,
    tribeStatus: 'accumulating',
    tribeLink: '/tribes',
    enabledChains: ['base'],
    createdAt: '2026-03-14T00:00:00Z',
  },
  // ---------- Coming Soon ----------
  {
    id: 'x-lead-gen',
    title: 'X Lead Generation',
    description:
      'Agent-operated content loop that drives traffic from X to your product. Not followers — link clicks.',
    icon: '📣',
    color: 'amber',
    category: 'marketing',
    status: 'soon',
    skills: [
      { name: 'Content Generator', description: 'Generate optimized X posts based on niche research', required: true },
      { name: 'Engagement Tracker', description: 'Track profile clicks and link clicks, not vanity metrics', required: true },
      { name: 'Auto-Poster', description: 'Schedule and post to X automatically via OpenTweet', required: false },
    ],
    web2Comparison: [],
    pasteConfig: '',
    methodology: { sources: [], keyStats: [] },
    tribe: { name: 'Grow', claimTarget: 200 },
    verifiedStatus: 'community',
    claimCount: 0,
    tribeStatus: 'accumulating',
    enabledChains: ['base'],
    createdAt: '2026-03-09T00:00:00Z',
  },
  {
    id: 'defi-portfolio',
    title: 'DeFi Portfolio Intel',
    description:
      'Your agent tracks on-chain positions, monitors yield shifts, and alerts you to risks across DeFi protocols — so you never miss a rebalance.',
    icon: '📊',
    color: 'purple',
    category: 'productivity',
    status: 'soon',
    skills: [
      { name: 'Portfolio Tracker', description: 'Aggregate positions across DeFi protocols in real time', required: true },
      { name: 'Yield Monitor', description: 'Track APY changes and alert when yields shift significantly', required: true },
      { name: 'Risk Scanner', description: 'Monitor smart contract risks, liquidation levels, and protocol health', required: false },
    ],
    web2Comparison: [],
    pasteConfig: '',
    methodology: { sources: [], keyStats: [] },
    tribe: { name: 'DeFi Scouts', claimTarget: 200 },
    verifiedStatus: 'community',
    claimCount: 0,
    tribeStatus: 'accumulating',
    enabledChains: ['base'],
    createdAt: '2026-03-09T00:00:00Z',
  },
  {
    id: 'thought-leadership',
    title: 'Thought Leadership Engine',
    description:
      'Turn your expertise into a content machine. Your agent drafts threads, newsletters, and posts aligned to your voice — you just approve and publish.',
    icon: '✍️',
    color: 'amber',
    category: 'marketing',
    status: 'soon',
    skills: [
      { name: 'Voice Calibrator', description: 'Analyze your writing style and maintain consistent tone', required: true },
      { name: 'Content Drafter', description: 'Draft threads, newsletters, and LinkedIn posts from your notes', required: true },
      { name: 'Trend Radar', description: 'Surface trending topics in your niche to write about', required: false },
    ],
    web2Comparison: [],
    pasteConfig: '',
    methodology: { sources: [], keyStats: [] },
    tribe: { name: 'Thought Leaders', claimTarget: 200 },
    verifiedStatus: 'community',
    claimCount: 0,
    tribeStatus: 'accumulating',
    enabledChains: ['base'],
    createdAt: '2026-03-09T00:00:00Z',
  },
];

// Helpers
export function getUseCaseById(id: string): UseCase | undefined {
  return USE_CASES.find((uc) => uc.id === id);
}

export function getAllUseCases(): UseCase[] {
  return USE_CASES;
}
