import type { AgentTemplate, Claim, RecordField, SellerProfile } from './types.ts';

/** "Now" for the recorded Rox session this prototype replays (captured 2026-09-27). */
export const CAPTURED_AT = '2026-09-27';

export const ACCOUNT = { name: 'OpenAI', domain: 'openai.com' };

/** Field values exactly as shown in Rox's account Overview panel. */
export const RECORD_FIELDS: RecordField[] = [
  { key: 'head_count', label: 'Current Head Count', value: '3200', source: 'Rox enrichment' },
  { key: 'state', label: 'Current State', value: 'AVAILABLE', source: 'Rox' },
  { key: 'domain', label: 'Domain', value: 'openai.com', source: 'User' },
  { key: 'industries', label: 'Industries', value: '["Software", "Engineering Software"]', source: 'Rox enrichment' },
  { key: 'name', label: 'Name', value: 'OpenAI', source: 'User' },
  { key: 'revenue', label: 'Revenue', value: '2000000', source: 'Rox enrichment' },
];

const s = (domain: string, title: string, publishedAt?: string) => ({ domain, title, publishedAt });

/**
 * Atomic claims extracted from two recorded Rox runs on the same account:
 *  - "chat": Chat -> "Give me an account brief on OpenAI ..." (124s)
 *  - "plan": Account -> Account Plan -> "Build my account plan" (94s)
 * Source domains are the citation chips Rox rendered next to each statement.
 */
export const CLAIMS: Claim[] = [
  {
    id: 'valuation',
    text: 'Closed a ~$122B round at an ~$852B post-money valuation (March 2026).',
    kind: 'financial', decisionCritical: false,
    sources: [s('openai.com', 'OpenAI newsroom')], seenIn: ['chat', 'plan'], asOf: '2026-03',
  },
  {
    id: 'revenue_run_rate',
    text: 'Revenue run rate of ~$40B.',
    kind: 'financial', decisionCritical: true,
    sources: [], seenIn: ['plan'],
  },
  {
    id: 'enterprise_share',
    text: 'Enterprise is >40% of revenue, on track for parity with consumer by end of 2026.',
    kind: 'metric', decisionCritical: false,
    sources: [s('openai.com', 'OpenAI newsroom')], seenIn: ['chat'],
  },
  {
    id: 'cro',
    text: 'Dali Rajic is Chief Revenue Officer (joined Aug 2026 from Wiz).',
    kind: 'person', decisionCritical: true,
    sources: [s('derrick-app.com', 'Derrick blog')], seenIn: ['chat'], asOf: '2026-08',
  },
  {
    id: 'cfo',
    text: 'Sarah Friar is CFO and owns the 2026 "practical adoption" enterprise narrative.',
    kind: 'person', decisionCritical: true,
    sources: [s('techcrunch.com', 'TechCrunch', '2026-06-10')], seenIn: ['chat', 'plan'],
  },
  {
    id: 'fidji_leave',
    text: 'Fidji Simo (CEO of Applications) is on medical leave; Greg Brockman is covering product.',
    kind: 'person', decisionCritical: true,
    sources: [s('aimagazine.com', 'AI Magazine')], seenIn: ['chat'],
  },
  {
    id: 'zoph',
    text: 'Barret Zoph leads the enterprise AI sales push (returned Jan 2026).',
    kind: 'person', decisionCritical: true,
    sources: [s('techcrunch.com', 'TechCrunch', '2026-01-20')], seenIn: ['chat'],
  },
  {
    id: 'board',
    text: 'Board added David Vélez (Nubank) and Robin Vince (BNY) in July 2026.',
    kind: 'event', decisionCritical: false,
    sources: [s('cnbc.com', 'CNBC', '2026-07-15')], seenIn: ['chat', 'plan'],
  },
  {
    id: 'departures',
    text: 'COO Brad Lightcap and CRO Denise Dresser departed in 2026.',
    kind: 'person', decisionCritical: false,
    sources: [s('axios.com', 'Axios', '2026-08-02'), s('cnbc.com', 'CNBC', '2026-08-03')], seenIn: ['chat'],
  },
  {
    id: 'gpt6_sol',
    text: 'Released GPT-6 Sol and Luna on Sept 17 and cut token prices ~50%.',
    kind: 'event', decisionCritical: false,
    sources: [s('thenewstack.io', 'The New Stack', '2026-09-17')], seenIn: ['chat', 'plan'],
  },
  {
    id: 'agent_incidents',
    text: 'OpenAI-built agents reached U.S. Commerce, SEC, DoE and an Australian health portal without authorization.',
    kind: 'event', decisionCritical: true,
    sources: [s('shattered.io', 'Shattered', '2026-09-25')], seenIn: ['chat'],
  },
  {
    id: 'chatgpt_work',
    text: 'Launched ChatGPT Work (agentic workplace platform) in July 2026.',
    kind: 'event', decisionCritical: false,
    sources: [s('computerworld.com', 'Computerworld', '2026-07-09')], seenIn: ['chat', 'plan'],
  },
  {
    id: 'seats',
    text: '1M+ business customers, 9M+ paying business users, 7M+ ChatGPT for Work seats.',
    kind: 'metric', decisionCritical: false,
    sources: [s('getpanto.ai', 'Panto blog')], seenIn: ['chat'],
  },
  {
    id: 'primary_target',
    text: 'Primary target: Dali Rajic (CRO), "stand up global revenue ops in 90 days before an IPO".',
    kind: 'recommendation', decisionCritical: true,
    sources: [], seenIn: ['chat'],
  },
];

/** Recommendations depend on claims: if a dependency is low-confidence, so is the advice. */
export const CLAIM_DEPENDENCIES: Record<string, string[]> = {
  primary_target: ['cro'],
};

export const RUN_TELEMETRY = [
  { run: 'chat', label: 'Chat account brief', firstTokenSec: 12, totalSec: 124, toolCalls: 9 },
  { run: 'plan', label: 'Build my account plan', firstTokenSec: 8, totalSec: 94, toolCalls: 11 },
];

/** Test workspace seller (made-up company, per the user). */
export const DEFAULT_SELLER: SellerProfile = {
  company: 'Acme Test Corp',
  website: 'acmetest.example',
  oneLiner: 'Evaluation, guardrails and audit trails for production AI agents.',
  capabilities: [
    'agent evaluation',
    'guardrails',
    'audit logs',
    'revenue analytics',
  ],
  personas: ['CRO', 'CFO', 'Head of Applied AI', 'CISO'],
  proofPoints: ['Cut agent incident rate 63% at a Fortune 100 bank (fictional)'],
};

/** Accounts visible in the test workspace, including the malformed ones that appeared during exploration. */
export const WORKSPACE_ACCOUNTS = [
  { name: 'OpenAI', domain: 'openai.com' },
  { name: 'ssrftest-29757-27044', domain: '127.0.0.1' },
  { name: 'ssrftest-12716-24991', domain: 'normaltest.example' },
  { name: 'm', domain: '169.254.169.254' },
  { name: 'ssrftest-25078-27935', domain: "a'b.example" },
];

export const AGENT_TEMPLATES: AgentTemplate[] = [
  {
    id: 'signals_outbound',
    name: 'Signals Driven Outbound Enrollment',
    description: 'Watch account signals and enroll matching contacts into a sequence.',
    schedule: 'daily',
    steps: [
      { name: 'Scan insights for signals', tool: 'insights.search', sideEffect: 'none', actionsPerAccount: 1 },
      { name: 'Research account', tool: 'web.search', sideEffect: 'none', actionsPerAccount: 3 },
      { name: 'Find matching contacts', tool: 'people.search', sideEffect: 'none', actionsPerAccount: 1 },
      { name: 'Enroll in sequence', tool: 'sequences.enroll', sideEffect: 'email_send', actionsPerAccount: 2 },
    ],
  },
  {
    id: 'pipeline_risk',
    name: 'Pipeline Risk Report',
    description: 'Weekly review of open opportunities with risk flags and next steps.',
    schedule: 'weekly',
    steps: [
      { name: 'Load open opportunities', tool: 'crm.query', sideEffect: 'none', actionsPerAccount: 1 },
      { name: 'Pull recent activity', tool: 'activity.search', sideEffect: 'none', actionsPerAccount: 1 },
      { name: 'Update risk field', tool: 'crm.update', sideEffect: 'crm_write', actionsPerAccount: 1 },
      { name: 'Email report', tool: 'notify.email', sideEffect: 'notification', actionsPerAccount: 0 },
    ],
  },
  {
    id: 'weekly_prioritization',
    name: 'Weekly Account Prioritization',
    description: 'Rank accounts by fit and intent and write a priority tier.',
    schedule: 'weekly',
    steps: [
      { name: 'Enrich firmographics', tool: 'enrich.firmographics', sideEffect: 'none', actionsPerAccount: 1 },
      { name: 'Research news', tool: 'web.search', sideEffect: 'none', actionsPerAccount: 2 },
      { name: 'Write priority tier', tool: 'crm.update', sideEffect: 'crm_write', actionsPerAccount: 1 },
    ],
  },
];
