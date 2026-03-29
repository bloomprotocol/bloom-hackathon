/**
 * Prediction Market Skill Discovery Script
 *
 * Discovers prediction market tools from GitHub search + a curated seed list,
 * deduplicates by repo URL, and POSTs new skills to the backend API.
 *
 * Usage:
 *   npm run discover:prediction-market
 *   npx tsx scripts/discover-prediction-market-skills.ts
 *
 * Cron (weekly Monday 6am):
 *   0 6 * * 1 cd /path/to/bloom-protocol-fe && npm run discover:prediction-market
 */

// ── Types ───────────────────────────────────────────────────────────────────

interface DiscoveredSkill {
  name: string;
  description: string;
  url: string;
  source: string;
  categories: string[];
  stars: number;
  language: string;
}

interface GitHubRepo {
  full_name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  language: string | null;
  pushed_at: string;
  archived: boolean;
  fork: boolean;
}

interface GitHubSearchResponse {
  total_count: number;
  items: GitHubRepo[];
}

// ── Config ──────────────────────────────────────────────────────────────────

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || '';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || ''; // Optional — raises rate limit from 10 to 30 req/min
const MIN_STARS = 5;
const MAX_AGE_MONTHS = 6;

const SEARCH_QUERIES = [
  'prediction market mcp server',
  'polymarket agent tool',
  'forecasting prediction market',
];

// Curated seed list of vetted prediction market repos
const SEED_REPOS: DiscoveredSkill[] = [
  {
    name: 'Predictive Market MCP',
    description: 'Multi-platform prediction market aggregator — Polymarket, Kalshi, PredictIt, Metaculus, Manifold',
    url: 'https://github.com/EricGrill/mcp-predictive-market',
    source: 'Curated',
    categories: ['Prediction Market'],
    stars: 0,
    language: 'TypeScript',
  },
  {
    name: 'Polymarket MCP Server',
    description: 'Enterprise-grade Polymarket integration with 45 tools for market analysis, trading, and portfolio management',
    url: 'https://github.com/caiovicentino/polymarket-mcp-server',
    source: 'Curated',
    categories: ['Prediction Market'],
    stars: 0,
    language: 'Python',
  },
  {
    name: 'Prediction Market MCP',
    description: 'Unified MCP server for Polymarket, Kalshi, and PredictIt prediction markets',
    url: 'https://github.com/JamesANZ/prediction-market-mcp',
    source: 'Curated',
    categories: ['Prediction Market'],
    stars: 0,
    language: 'TypeScript',
  },
  {
    name: 'Manifold Markets MCP',
    description: 'MCP server for Manifold Markets — browse, search, and interact with prediction markets',
    url: 'https://github.com/bartonrhodes/manifold-markets-mcp-server',
    source: 'Curated',
    categories: ['Prediction Market'],
    stars: 0,
    language: 'TypeScript',
  },
  {
    name: 'PMXT',
    description: '"CCXT for prediction markets" — unified SDK for Polymarket, Kalshi, PredictIt, and Manifold',
    url: 'https://github.com/pmxt-dev/pmxt',
    source: 'Curated',
    categories: ['Prediction Market'],
    stars: 0,
    language: 'TypeScript',
  },
  {
    name: 'Dr. Manhattan',
    description: 'Unified prediction market API aggregating Polymarket, Metaculus, and Manifold',
    url: 'https://github.com/guzus/dr-manhattan',
    source: 'Curated',
    categories: ['Prediction Market'],
    stars: 0,
    language: 'TypeScript',
  },
  {
    name: 'Metaculus Forecasting Tools',
    description: 'Official Metaculus forecasting framework with AI forecasting agents and tournament tools',
    url: 'https://github.com/Metaculus/forecasting-tools',
    source: 'Curated',
    categories: ['Prediction Market'],
    stars: 0,
    language: 'Python',
  },
  {
    name: 'Polymarket Agents',
    description: 'Official Polymarket autonomous trading agents framework',
    url: 'https://github.com/Polymarket/agents',
    source: 'Curated',
    categories: ['Prediction Market'],
    stars: 0,
    language: 'Python',
  },
  {
    name: 'Prediction Market Agent Tooling',
    description: 'Gnosis/Omen prediction market agent tooling for autonomous market making and trading',
    url: 'https://github.com/gnosis/prediction-market-agent-tooling',
    source: 'Curated',
    categories: ['Prediction Market'],
    stars: 0,
    language: 'Python',
  },
  {
    name: 'PredictOS',
    description: 'Multi-agent prediction market framework with research, analysis, and execution agents',
    url: 'https://github.com/PredictionXBT/PredictOS',
    source: 'Curated',
    categories: ['Prediction Market'],
    stars: 0,
    language: 'Python',
  },
];

// ── Helpers ─────────────────────────────────────────────────────────────────

function repoNameToTitle(fullName: string): string {
  const name = fullName.split('/')[1] || fullName;
  return name
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/\bMcp\b/g, 'MCP')
    .replace(/\bSdk\b/g, 'SDK')
    .replace(/\bApi\b/g, 'API');
}

function isRecentEnough(pushedAt: string): boolean {
  const pushed = new Date(pushedAt);
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - MAX_AGE_MONTHS);
  return pushed >= cutoff;
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── GitHub Search ───────────────────────────────────────────────────────────

async function searchGitHub(query: string): Promise<DiscoveredSkill[]> {
  const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=30`;

  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'bloom-protocol-skill-discovery',
  };
  if (GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${GITHUB_TOKEN}`;
  }

  const res = await fetch(url, { headers });

  if (!res.ok) {
    const status = res.status;
    if (status === 403) {
      console.warn(`  ⚠ GitHub rate limit hit for query "${query}" — skipping`);
      return [];
    }
    console.warn(`  ⚠ GitHub API ${status} for query "${query}" — skipping`);
    return [];
  }

  const data = (await res.json()) as GitHubSearchResponse;

  return data.items
    .filter(
      (repo) =>
        !repo.archived &&
        !repo.fork &&
        repo.stargazers_count >= MIN_STARS &&
        isRecentEnough(repo.pushed_at),
    )
    .map((repo) => ({
      name: repoNameToTitle(repo.full_name),
      description: repo.description || '',
      url: repo.html_url,
      source: 'GitHub',
      categories: ['Prediction Market'],
      stars: repo.stargazers_count,
      language: repo.language || 'Unknown',
    }));
}

// ── Backend submission ──────────────────────────────────────────────────────

async function submitSkill(skill: DiscoveredSkill): Promise<'created' | 'exists' | 'error'> {
  if (!API_URL) {
    return 'error';
  }

  try {
    const res = await fetch(`${API_URL}/skills/discover`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(skill),
    });

    if (res.status === 201) return 'created';
    if (res.status === 409) return 'exists';
    return 'error';
  } catch {
    return 'error';
  }
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🔮 Prediction Market Skill Discovery');
  console.log('─'.repeat(50));

  // 1. Gather from GitHub search
  const allSkills = new Map<string, DiscoveredSkill>();

  for (const query of SEARCH_QUERIES) {
    console.log(`\n🔍 Searching GitHub: "${query}"`);
    const results = await searchGitHub(query);
    console.log(`   Found ${results.length} repos (≥${MIN_STARS} stars, active)`);

    for (const skill of results) {
      if (!allSkills.has(skill.url)) {
        allSkills.set(skill.url, skill);
      }
    }

    // Respect GitHub rate limits
    await sleep(2000);
  }

  // 2. Add curated seed list
  console.log(`\n📋 Adding ${SEED_REPOS.length} curated seed repos`);
  for (const seed of SEED_REPOS) {
    if (!allSkills.has(seed.url)) {
      allSkills.set(seed.url, seed);
    }
  }

  console.log(`\n📊 Total unique skills: ${allSkills.size}`);
  console.log('─'.repeat(50));

  // 3. Submit to backend or log
  let created = 0;
  let exists = 0;
  let errors = 0;

  if (!API_URL) {
    console.log('\n⚠ No API_URL configured — logging discovered skills instead:\n');
    for (const [url, skill] of allSkills) {
      console.log(`  ${skill.name}`);
      console.log(`    ${url}`);
      console.log(`    ⭐ ${skill.stars} | ${skill.language} | ${skill.source}`);
      console.log(`    ${skill.description.slice(0, 100)}`);
      console.log('');
    }
    console.log('Set NEXT_PUBLIC_API_BASE_URL to submit skills to the backend.');
    return;
  }

  console.log(`\n📡 Submitting to ${API_URL}/skills/discover\n`);

  for (const [, skill] of allSkills) {
    const result = await submitSkill(skill);
    const icon = result === 'created' ? '✅' : result === 'exists' ? '⏭' : '❌';
    console.log(`  ${icon} ${skill.name} (${result})`);

    if (result === 'created') created++;
    else if (result === 'exists') exists++;
    else errors++;

    await sleep(200);
  }

  // 4. Summary
  console.log('\n' + '─'.repeat(50));
  console.log('📊 Summary');
  console.log(`   ✅ New: ${created}`);
  console.log(`   ⏭  Known: ${exists}`);
  console.log(`   ❌ Errors: ${errors}`);
  console.log(`   📦 Total: ${allSkills.size}`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
