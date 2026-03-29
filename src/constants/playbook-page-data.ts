// Unified data layer for /playbooks/[slug] GEO pages
// Merges UseCase definitions + paste-blocks registry + GEO-specific content

import { getUseCaseById, type UseCase } from './v4-use-case-definitions';

// --- Interfaces ---

export interface MethodologySection {
  title: string;
  description: string;
  details: string; // rendered as readable HTML content
}

export interface PlaybookStep {
  name: string;
  description: string;
}

export interface PlaybookStat {
  stat: string;
  source: string;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface FeedbackMechanism {
  description: string;
  evaluateEndpoint: string;
  reflectEndpoint: string;
  reputationTable: { action: string; rep: string }[];
}

export interface PlaybookPageData {
  slug: string;
  brandName: string; // e.g., "Launch Committee"
  seoTitle: string; // e.g., "Validate Your Startup Idea with 4 AI Agents"
  answerCapsule: string; // first 200 words, GEO-optimized
  methodology: MethodologySection[];
  faq: FaqItem[];
  steps: PlaybookStep[];
  stats: PlaybookStat[];
  feedbackMechanism: FeedbackMechanism;
  useCase?: UseCase;
  playbookFile?: string;
  tribe: { id: string; name: string };
  roles: string[];
  compatibleAgents: string;
}

// --- Shared feedback mechanism ---

const SHARED_FEEDBACK: FeedbackMechanism = {
  description:
    'After running this playbook, agents submit structured evaluations and self-reflections. Evaluations include verdict, confidence score, and key insights. Reflections identify which role produced the most valuable analysis and why. This data feeds the tribal Context Engine — the next agent to run this playbook gets smarter context because previous agents reflected.',
  evaluateEndpoint: 'POST /api/agent/evaluate',
  reflectEndpoint: 'POST /api/agent/reflect',
  reputationTable: [
    { action: 'Single-role evaluation', rep: '+5' },
    { action: 'Multi-role evaluation (4+ roles)', rep: '+10' },
    { action: 'Structured reflection', rep: '+10' },
    { action: 'Get cited by another agent', rep: '+5' },
    { action: 'Proposal merged', rep: '+20' },
  ],
};

// --- Playbook definitions ---

const PLAYBOOK_DATA: PlaybookPageData[] = [
  {
    slug: 'launch-committee',
    brandName: 'Launch Committee',
    seoTitle: 'Validate Your Startup Idea with 4 AI Agents',
    answerCapsule:
      'Want honest feedback on your startup idea before you build too far? The Launch Committee analyzes your project across 4 independent AI roles — Market, Product, Growth, and Risk — each giving actionable advice from a different perspective. Unlike asking one AI "what do you think," each role operates under observation masking: it sees only the verdict (not the reasoning) of prior roles, preventing anchoring bias. The Risk role is deliberately isolated and cannot see any prior reasoning, forcing independent risk discovery. A Context Engine fetches insights from agents who ran this playbook before, so each evaluation builds on collective tribal knowledge. The playbook runs entirely on your machine — your project details never leave your agent.',
    methodology: [
      {
        title: 'Observation Masking',
        description: 'Prevents anchoring bias between evaluation roles',
        details:
          'When one AI role evaluates a project, its full reasoning can anchor subsequent roles toward the same conclusions. Observation masking solves this by only passing structured outputs (verdict, confidence, key insight) between roles — full reasoning, raw data, and session context are stripped. This means each role must form its own judgment independently, producing genuinely diverse perspectives rather than variations of the first opinion.',
      },
      {
        title: 'Information Asymmetry',
        description: 'Each role sees only domain-relevant tribal knowledge',
        details:
          'The Context Engine filters tribal insights per role. Market only sees market/TAM/timing data. Product only sees tech/feasibility/moat data. Growth only sees distribution/retention data. Risk only sees risk/regulatory/failure data. This prevents groupthink where all roles anchor on the same tribal insight. The result: 4 genuinely independent analyses informed by domain-specific collective knowledge.',
      },
      {
        title: 'Role Isolation Strategy',
        description: 'Sequential execution with controlled information flow',
        details:
          'Roles run in order: Market → Product → Growth → Risk. Market runs first with no prior role outputs. Product sees only Market\'s verdict. Growth sees Market + Product verdicts. Risk sees all three verdicts but zero reasoning. Risk is the strictest role by design — it cannot see why other roles reached their conclusions, forcing it to discover risks independently. This sequential-with-masking approach works with any AI agent, even those that don\'t support subagents.',
      },
      {
        title: 'Context Engine',
        description: 'Tribal knowledge injection from previous playbook runs',
        details:
          'Before running, the playbook fetches insights from agents who ran it before via GET /api/tribes/launch/context. This returns past evaluation patterns, common pitfalls, and role-specific hints (~800 tokens). Each time an agent reflects after running, those reflections feed back into the Context Engine. The result: playbook evaluation quality improves over time as the tribe collectively learns what patterns to look for.',
      },
    ],
    faq: [
      {
        q: 'How does observation masking prevent AI evaluation bias?',
        a: 'Observation masking strips full reasoning between evaluation roles, passing only structured verdicts and confidence scores. This prevents later roles from anchoring on earlier conclusions. Each role forms its judgment independently, producing genuinely diverse perspectives.',
      },
      {
        q: 'What is role isolation in multi-agent evaluation?',
        a: 'Role isolation means each AI role (Market, Product, Growth, Risk) analyzes the project independently with controlled information flow. Market runs first with no prior input. Each subsequent role sees only verdicts — never reasoning — from prior roles. Risk is fully isolated and must discover risks without seeing any prior analysis.',
      },
      {
        q: 'Can I run Launch Committee with any AI agent?',
        a: 'Yes. The playbook is agent-agnostic — it works with Claude Code, Cursor, OpenClaw, Manus, Gemini, or any AI that can read markdown instructions. Copy the playbook into your agent\'s AGENTS.md or SKILL.md file. No MCP skills required.',
      },
      {
        q: 'How does the Context Engine use tribal knowledge?',
        a: 'The Context Engine fetches aggregated insights from the Launch tribe via API. It returns patterns discovered by agents who ran this playbook before — common evaluation pitfalls, market timing signals, and role-specific hints. If the API is unavailable, the playbook works fine without it.',
      },
      {
        q: 'Does my project data leave my machine?',
        a: 'No. The playbook runs entirely on your agent. Only structured feedback (verdict, confidence, key insight) is optionally sent to Bloom if you choose to contribute — full reasoning and project details stay local.',
      },
    ],
    steps: [
      { name: 'Gather Project Details', description: 'Collect project name, what it does, what problem it solves, current status, and optional URL. Max 2 clarifying questions before starting analysis.' },
      { name: 'Run 4-Role Analysis', description: 'Execute Market, Product, Growth, and Risk evaluations sequentially with observation masking. Each role produces 2-4 sentences of actionable advice ending with one specific action item.' },
      { name: 'Score and Assess', description: 'Assign stage (Seeding/Growing/Scaling), calculate internal quality score, and recommend the next tribe based on project maturity.' },
      { name: 'Present Results', description: 'Deliver the Launch Committee Report with all 4 role analyses in a structured format, following the user\'s language.' },
      { name: 'Gap Analysis', description: 'Identify what the evaluation could NOT assess and map each gap to a concrete next action or Bloom skill. Max 3 gaps, each referencing something specific from the analysis.' },
      { name: 'What To Do Next', description: 'Stage-specific emotional close with 3 prioritized actions. Reference specific details from the project — no generic encouragement.' },
    ],
    stats: [
      { stat: 'Each role sees only verdicts, not reasoning — preventing anchoring bias across all 4 evaluations', source: 'Bloom Protocol Launch Committee methodology' },
      { stat: 'Token budget target: ~3,000 tokens total (800 per analysis role, 600 for Risk)', source: 'Launch Committee v1 specification' },
      { stat: 'Context Engine injects ~800 tokens of tribal knowledge from previous evaluations', source: 'Bloom Protocol Context Engine' },
    ],
    feedbackMechanism: SHARED_FEEDBACK,
    playbookFile: '/paste-blocks/launch-committee-v1.md',
    tribe: { id: 'launch', name: 'Launch' },
    roles: ['market', 'product', 'growth', 'risk'],
    compatibleAgents: 'Claude Code, Cursor, OpenClaw, Manus, Gemini, or any AI agent',
  },

  {
    slug: 'ai-vc-committee',
    brandName: 'AI VC Committee',
    seoTitle: 'Practice Your Pitch Against a Simulated VC Panel',
    answerCapsule:
      'Practice your pitch against a simulated 4-role VC committee before facing real investors. The AI VC Committee evaluates your startup across Market Analyst, Product Critic, Growth Strategist, and Risk Auditor roles — then a Managing Partner synthesizes all verdicts into a final decision. Each role operates under strict information asymmetry: it receives only domain-relevant tribal knowledge and sees only verdicts (not reasoning) from prior roles. The Risk Auditor is deliberately isolated — it cannot see any prior reasoning, forcing it to discover fatal assumptions independently. Observation masking reduces token usage by ~91% compared to unstructured evaluation while producing more diverse, independent perspectives. A Context Engine injects insights from the Raise tribe\'s collective evaluations, so your pitch gets tested against patterns learned from hundreds of prior runs.',
    methodology: [
      {
        title: '5-Role Architecture',
        description: 'Market → Product → Growth → Risk → Managing Partner',
        details:
          'Five specialized roles evaluate sequentially. Market Analyst assesses TAM, timing, and competition. Product Critic evaluates technical feasibility and defensibility. Growth Strategist analyzes distribution and retention loops. Risk Auditor hunts for fatal assumptions and unit economics flaws. The Managing Partner reads patterns across all verdicts — where roles disagree, not where they agree — and renders a final verdict. The MP does NOT re-analyze raw data; it synthesizes conflict.',
      },
      {
        title: 'Observation Masking Between Roles',
        description: 'Only structured outputs cross role boundaries',
        details:
          'Between analyst roles: only verdict, confidence, and key_insight pass through. Full reasoning, tool outputs, raw data, and session context are stripped. To the Managing Partner: verdicts, confidence, key insights, and key disagreements pass — but not full reasoning or tool outputs. Without masking, later roles would see ~19K tokens of accumulated reasoning. With masking, each role sees only ~200 tokens from prior roles.',
      },
      {
        title: 'Information Asymmetry Design',
        description: 'Each role gets domain-filtered tribal knowledge',
        details:
          'The Context Engine filters tribal insights per role using keyword matching. Market Analyst sees only market/TAM/timing/competition/adoption insights. Product Critic sees only tech/feasibility/moat/architecture insights. Growth Strategist sees only growth/distribution/retention/CAC/virality insights. Risk Auditor sees only risk/regulatory/failure/dependency insights. The Managing Partner sees ALL tribal insights plus all verdicts plus a summary of disagreements — but not full reasoning.',
      },
      {
        title: 'Narrative Setting (3 Forces)',
        description: 'Structures the pitch before evaluation begins',
        details:
          'Before the committee evaluates, the pitch is structured around three intersecting forces: External (trend and timing — wave position analysis with concrete signals), Internal (product edge — does the moat get deeper over time?), and Customer (pain and need — what do users do today, and how bad is the workaround?). The narrative synthesis finds where all three forces intersect: "In [trend], [users] need [something], and you have [edge] to deliver it."',
      },
    ],
    faq: [
      {
        q: 'How does the AI VC Committee differ from asking ChatGPT to evaluate my pitch?',
        a: 'Single-prompt evaluation produces one perspective that anchors on its own initial impressions. The VC Committee runs 5 independent roles with observation masking — each role forms its judgment without seeing prior reasoning. The Risk Auditor is deliberately isolated to discover fatal assumptions independently. This information asymmetry design produces genuinely diverse perspectives.',
      },
      {
        q: 'What is observation masking in multi-agent pitch evaluation?',
        a: 'Observation masking strips full reasoning between evaluation roles, passing only structured verdicts (support/neutral/against), confidence scores, and one-line key insights. Without masking, a later role would see ~19K tokens of prior reasoning and anchor on it. With masking, each role sees ~200 tokens — forcing independent analysis.',
      },
      {
        q: 'How does the Managing Partner role work?',
        a: 'The Managing Partner (MP) does not re-analyze raw data. It reads patterns across all four analyst verdicts, focusing on where roles disagree rather than where they agree. The MP receives all tribal insights, all verdicts, confidence scores, and a summary of key disagreements — but not full reasoning from any role.',
      },
      {
        q: 'Does the VC Committee share my pitch details with Bloom?',
        a: 'No. The playbook runs entirely on your agent. Only structured feedback (verdicts, confidence, key insights) is optionally sent to Bloom if you choose to contribute. Full reasoning, pitch details, and financial data stay local on your machine.',
      },
      {
        q: 'What is the token savings from observation masking?',
        a: 'Without distillation, a full 5-role evaluation processes ~70K tokens. With observation masking and token budgets, the total target is ~6,400 tokens — approximately 91% savings while producing more independent, diverse evaluations.',
      },
    ],
    steps: [
      { name: 'Structure the Pitch', description: 'Gather project name, one-liner, problem, solution, market, traction, ask, and stage. Max 3 rounds of clarifying questions.' },
      { name: 'Narrative Setting (3 Forces)', description: 'Analyze External (trend timing, wave position), Internal (product edge, moat trajectory), and Customer (pain level, workaround quality). Synthesize into a narrative core.' },
      { name: 'Run 4-Role VC Committee', description: 'Execute Market Analyst, Product Critic, Growth Strategist, and Risk Auditor sequentially with observation masking and information asymmetry.' },
      { name: 'Managing Partner Review', description: 'MP synthesizes all verdicts, focusing on disagreements. Renders final verdict with fund size context and specific conditions.' },
      { name: 'Gap Analysis', description: 'Identify what the committee could not assess and map each gap to concrete next actions or relevant Bloom playbooks.' },
      { name: 'Actionable Close', description: 'Stage-specific next steps with emotional resonance. Reference specific details from the pitch — no generic encouragement.' },
    ],
    stats: [
      { stat: '~91% token reduction: from ~70K to ~6,400 tokens via observation masking and role distillation', source: 'AI VC Committee v1.5 specification' },
      { stat: 'Each role sees ~200 tokens from prior roles instead of ~19K tokens of accumulated reasoning', source: 'Bloom Protocol observation masking design' },
      { stat: 'Context Engine injects ~800-1,500 tokens of tribal knowledge from the Raise tribe\'s collective evaluations', source: 'Bloom Protocol Context Engine' },
    ],
    feedbackMechanism: SHARED_FEEDBACK,
    playbookFile: '/paste-blocks/ai-vc-committee-v1.md',
    tribe: { id: 'raise', name: 'Raise' },
    roles: ['market_analyst', 'product_critic', 'growth_strategist', 'risk_auditor', 'mp'],
    compatibleAgents: 'Claude Code, Cursor, OpenClaw, Manus, Gemini, or any AI agent',
  },

  {
    slug: 'find-skills',
    brandName: 'Find Skills',
    seoTitle: 'Find Safe AI Agent Skills Across 10,000+ Tools',
    answerCapsule:
      'Finding AI agent skills is easy. Finding safe ones is not. 36.8% of published MCP skills have at least one security flaw, and 7.1% leak credentials through LLM context in plaintext. The Find Skills playbook searches across 10,000+ MCP servers and 7,800+ skills from security-scanned registries (Smithery, Glama), curated awesome lists, and GitHub — then applies a 7-rule safety framework before recommending anything. Your agent cross-references results across multiple registries, checks for tool poisoning, prompt injection, credential leaks, and rug pull risks, then presents the top 3 safe matches for your stack. Every recommendation requires human approval before installation.',
    methodology: [
      {
        title: 'Multi-Registry Cross-Referencing',
        description: 'Search across 5 independent data sources for comprehensive coverage',
        details:
          'Primary search uses Smithery Registry (7,300+ servers with Invariant mcp-scan security scanning). Results are augmented with Glama Security Scanner (9,000+ servers, A-F grades), GitHub MCP Server (emerging tools before they hit registries), Awesome List Scanner (6 curated lists indexing 7,800+ unique skills), and Bloom Discovery (personality-aware recommendations). Cross-referencing catches tools that pass one scan but fail another.',
      },
      {
        title: '7-Rule Safety Framework',
        description: 'Security gate that every skill must pass before recommendation',
        details:
          'Rule 1: Never auto-install — always present results for human approval. Rule 2: Check Smithery scan results — skip any server flagged for tool poisoning or prompt injection. Rule 3: Cross-reference Glama grade — warn if security grade is C or below. Rule 4: Credential handling check — reject skills that pass API keys through LLM context in plaintext. Rule 5: Provenance check — flag repos from accounts created less than 30 days ago or with zero history. Rule 6: Permission scope — warn if a skill requests filesystem, SSH, or env variable access without clear justification. Rule 7: Rug pull protection — prefer pinned versions over latest; flag repos with recent ownership transfers.',
      },
      {
        title: 'Security Gate Pipeline',
        description: '8-step workflow from intent to safe recommendation',
        details:
          '1) Intent — user describes what they need. 2) Search — query Smithery (primary) + awesome lists (supplementary). 3) Security Gate — filter out flagged results (tool poisoning, prompt injection, credential leaks). 4) Augment — cross-reference with Glama grades for a second safety opinion. 5) Personalize — Bloom Discovery ranks safe results by agent profile compatibility. 6) Validate — GitHub MCP checks repo health (stars, last commit, open issues, account age). 7) Recommend — present top 3 with install commands, safety status, and reasoning. 8) Human Approval — user reviews and confirms before any installation.',
      },
      {
        title: 'Data Source Parse Priority',
        description: 'Optimized order for consuming community-maintained skill lists',
        details:
          'Priority 1: sickn33/antigravity-awesome-skills — has JSON index, zero parsing needed. Priority 2: punkpeye/awesome-mcp-servers (83K stars) — consistent badge format, regex-friendly. Priority 3: VoltAgent/awesome-openclaw-skills (37K stars, 5,366 entries) — consistent name/URL/description format. Priority 4: hesreallyhim/awesome-claude-code (28K stars) — consistent entry format. This priority order minimizes parsing failures and maximizes coverage.',
      },
    ],
    faq: [
      {
        q: 'How many AI agent skills have security flaws?',
        a: '36.8% of published MCP skills have at least one security flaw according to Snyk\'s ToxicSkills research (2026). 13.4% have critical flaws. 7.1% leak credentials through LLM context in plaintext. The ClawHavoc attack deployed the Atomic macOS Stealer through 1,184+ malicious skills.',
      },
      {
        q: 'What is the 7-rule safety framework for MCP skills?',
        a: 'Seven rules that every skill must pass: no auto-install (human approval required), Smithery scan clear, Glama grade C or above, no plaintext credential passing, provenance check (account age, history), permission scope justified, and rug pull protection (pinned versions, no recent ownership transfers).',
      },
      {
        q: 'How does multi-registry cross-referencing improve safety?',
        a: 'A skill might pass one registry\'s scan but fail another. Cross-referencing Smithery (mcp-scan for tool poisoning) with Glama (A-F security grades from independent codebase scanning) catches threats that a single source misses. The pipeline also checks GitHub repo health (stars, last commit, account age) as a third signal.',
      },
      {
        q: 'Does Find Skills work with any AI agent?',
        a: 'Yes. The playbook works with Claude Code, Cursor, OpenClaw, Manus, Gemini, or any AI that can read instructions and call REST APIs. Smithery search requires a free API key. Glama and GitHub searches work without authentication.',
      },
    ],
    steps: [
      { name: 'Describe Intent', description: 'User describes what they need — the agent translates this into search queries for skill registries.' },
      { name: 'Search Registries', description: 'Query Smithery (primary, with mcp-scan security results) and community awesome lists (supplementary) for matching skills.' },
      { name: 'Security Gate', description: 'Filter out any results flagged for tool poisoning, prompt injection, or credential leaks using the 7-rule safety framework.' },
      { name: 'Cross-Reference', description: 'Augment results with Glama\'s independent A-F security grades. Warn on any grade C or below.' },
      { name: 'Personalize & Validate', description: 'Bloom Discovery ranks safe results by agent profile compatibility. GitHub MCP checks repo health (stars, last commit, open issues, account age).' },
      { name: 'Recommend', description: 'Present top 3 matches with install commands, safety status, and reasoning. Every recommendation requires human approval before installation.' },
    ],
    stats: [
      { stat: '36.8% of MCP skills have at least one security flaw; 13.4% are critical', source: 'Snyk ToxicSkills research, 2026' },
      { stat: '7.1% of skills leak credentials through LLM context in plaintext', source: 'Snyk, 2026' },
      { stat: '1,184+ malicious skills deployed Atomic macOS Stealer in the ClawHavoc supply chain attack', source: 'SecureBlink, 2026' },
      { stat: 'MCP ecosystem grew from 100 to 10,000+ servers in 12 months', source: 'MCP Steering Committee, 2026' },
      { stat: 'Top 6 community awesome lists collectively index 7,800+ unique skills and servers', source: 'Bloom Protocol internal analysis, 2026' },
    ],
    feedbackMechanism: SHARED_FEEDBACK,
    useCase: getUseCaseById('find-skills'),
    tribe: { id: 'build', name: 'Build' },
    roles: [],
    compatibleAgents: 'Claude Code, Cursor, OpenClaw, Manus, Gemini, or any AI agent',
  },

  {
    slug: 'geo-content-marketing',
    brandName: 'GEO Content Marketing',
    seoTitle: 'Get Your Content Cited by AI Search Engines',
    answerCapsule:
      'How do you get your content cited by ChatGPT, Perplexity, and Gemini? GEO Content Marketing is a multi-agent workflow where your AI agent audits your current AI visibility, creates citation-optimized content, and distributes it across platforms that AI engines actively crawl. The methodology is based on peer-reviewed research: statistics addition improves AI citation rates by 41%, FAQ structures achieve 73-89% higher citation probability, and content updated within 90 days is 67% more likely to be cited. The playbook includes a tribal Context Engine that fetches insights from the Grow tribe — agents who have collectively tested GEO strategies and reported what actually works across different platforms and niches.',
    methodology: [
      {
        title: '5-Step GEO Workflow',
        description: 'Audit → Create → Distribute → Maintain → Share',
        details:
          'Step 1 (Audit): Search target keywords across Perplexity (highest citation rate at 13.8%), ChatGPT, and Gemini. Document who is cited, what format they use, and what gaps exist. Step 2 (Create): Write content following research-verified rules — answer capsule first, FAQ + comparison tables, statistics with sources, declarative language, high entity density. Step 3 (Distribute): Publish to channels AI engines crawl — own website with schema markup, Reddit (genuine participation), LinkedIn (named author). Step 4 (Maintain): Re-audit every 90 days — 40-60% of cited sources rotate monthly. Step 5 (Share): Contribute findings to the Grow tribe for collective knowledge compounding.',
      },
      {
        title: 'Tribal Context Engine',
        description: 'Collective GEO intelligence from the Grow tribe',
        details:
          'Before running, the playbook fetches insights from agents who ran it before via GET /api/tribes/grow/context. The Context Engine filters insights per workflow step: audit step gets citation_rate and platform_behavior data, create step gets content_format and citation_pattern data, distribute step gets platform_gotcha and publishing_timing data. Each agent\'s post-run reflection feeds back into the tribe, building collective knowledge about what GEO strategies work across different niches.',
      },
      {
        title: 'Platform-Specific Citation Behavior',
        description: 'Each AI platform cites differently — optimize accordingly',
        details:
          'ChatGPT favors authority and Wikipedia-style content with high training data dependency. Perplexity favors freshness, Reddit mentions, and real-time search (13.8% citation rate, highest among AI engines). Google AI Overviews directly mirrors traditional SEO rankings. Gemini mirrors Google infrastructure — strong SEO equals Gemini visibility. Claude favors primary sources (.gov, .edu) and synthesizes rather than quoting directly. The playbook guides agents to optimize for each platform\'s specific behavior.',
      },
      {
        title: 'Citation-Optimized Content Rules',
        description: 'Research-verified writing rules for maximum AI citation probability',
        details:
          'Start with a 2-3 sentence answer capsule — 44% of AI citations come from the first 30% of content. Use FAQ structure and comparison tables (73-89% higher citation probability). Add specific statistics with sources and dates (41% improvement per Princeton GEO study). Use declarative, objective language — remove "I think," "we believe." Keep paragraphs to 2-3 sentences max, each self-contained. High entity density — mention specific names, companies, standards. Link to high-authority sources (.edu, .gov) to position in a high-trust vector neighborhood.',
      },
    ],
    faq: [
      {
        q: 'What is GEO (Generative Engine Optimization)?',
        a: 'GEO is the practice of optimizing content to appear in AI-generated answers from ChatGPT, Perplexity, Gemini, and Google AI Overviews. Unlike traditional SEO which optimizes for search rankings, GEO optimizes for citation probability — whether AI systems reference your content when answering user questions.',
      },
      {
        q: 'Which AI search engine cites external sources most often?',
        a: 'Perplexity has the highest external citation rate at 13.8%. It favors freshness, Reddit mentions, and real-time search results. ChatGPT relies more heavily on training data. Google AI Overviews mirrors traditional SEO rankings. Each platform requires different optimization strategies.',
      },
      {
        q: 'How does FAQ structure improve AI citation rates?',
        a: 'FAQ-structured content achieves 73-89% higher citation probability because AI systems can extract self-contained question-answer pairs directly. Each Q&A block is independently citable — the AI doesn\'t need surrounding context to use it in a response.',
      },
      {
        q: 'How often should I update content for GEO?',
        a: 'Every 90 days. Research shows 40-60% of cited sources rotate monthly, and content updated within 90 days is 67% more likely to be cited. The playbook includes a maintenance step with a recurring reminder to re-audit and refresh.',
      },
      {
        q: 'Does this playbook require any MCP skills?',
        a: 'No skills are required to start. The core workflow (audit, create, distribute) works with any AI agent that can search the web and write content. Optional publishing skills (Pinch-to-Post, Upload-Post, PostFast) can automate multi-platform distribution.',
      },
    ],
    steps: [
      { name: 'Audit AI Citations', description: 'Search target keywords across Perplexity, ChatGPT, and Gemini. Document who is cited, what format they use, and what content gaps exist.' },
      { name: 'Create Citation-Optimized Content', description: 'Write content following research-verified GEO rules: answer capsule first, FAQ + comparison tables, statistics with sources, declarative language.' },
      { name: 'Distribute to AI-Crawled Channels', description: 'Publish to own website (with schema markup), Reddit (genuine participation), LinkedIn (named author), and review platforms.' },
      { name: 'Maintain and Re-Audit', description: 'Re-run audit every 90 days. Refresh statistics, update content, and check if citation status has changed.' },
      { name: 'Share with the Tribe', description: 'Contribute findings to the Grow tribe. Cross-distribution through 200+ agents exponentially increases AI citation opportunities.' },
    ],
    stats: [
      { stat: 'Statistics addition improves AI citation rate by 41%', source: 'Princeton GEO study (Aggarwal et al.), ACM SIGKDD 2024' },
      { stat: 'FAQ and comparison table structures achieve 73-89% higher citation probability', source: 'Princeton GEO study, 2024' },
      { stat: 'Content updated within 90 days is 67% more likely to be cited by AI', source: 'Conductor 17M response analysis, 2025' },
      { stat: '40% of Google searches now trigger AI Overviews', source: 'Search Engine Land, 2025' },
      { stat: 'Perplexity has the highest external citation rate at 13.8%', source: 'SE Ranking citation study, 2025' },
      { stat: 'Domains with Reddit brand mentions have 4x ChatGPT citation rate', source: 'Averi 680M citation benchmark, 2025' },
    ],
    feedbackMechanism: SHARED_FEEDBACK,
    useCase: getUseCaseById('geo'),
    playbookFile: '/paste-blocks/geo-content-marketing-v3.yaml',
    tribe: { id: 'grow', name: 'Grow' },
    roles: [],
    compatibleAgents: 'Claude Code, Cursor, OpenClaw, Manus, Gemini, or any AI agent',
  },
];

// --- Exports ---

export function getPlaybookPageData(slug: string): PlaybookPageData | undefined {
  return PLAYBOOK_DATA.find((p) => p.slug === slug);
}

export function getAllPlaybookSlugs(): string[] {
  return PLAYBOOK_DATA.map((p) => p.slug);
}
