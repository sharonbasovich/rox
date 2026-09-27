import { describe, expect, it } from 'vitest';
import { suggestAngles } from '../shared/angles.ts';
import { AGENT_TEMPLATES, CAPTURED_AT, CLAIMS, DEFAULT_SELLER, RUN_TELEMETRY, WORKSPACE_ACCOUNTS } from '../shared/data.ts';
import { dryRun } from '../shared/dryrun.ts';
import { runEvals } from '../shared/evals.ts';
import { scoreLedger } from '../shared/ledger.ts';

describe('dryRun', () => {
  const outbound = AGENT_TEMPLATES.find((t) => t.id === 'signals_outbound');
  if (!outbound) throw new Error('missing template');
  const r = dryRun(outbound, WORKSPACE_ACCOUNTS, 100);

  it('skips accounts that fail domain guardrails', () => {
    expect(r.accounts.filter((a) => a.included).map((a) => a.name)).toEqual(['OpenAI']);
  });

  it('computes actions and budget', () => {
    expect(r.actionsPerRun).toBe(7);
    expect(r.actionsPerMonth).toBe(7 * 22);
    expect(r.quotaUsedPct).toBe(154);
  });

  it('requires approval for email sends', () => {
    expect(r.sideEffects.find((e) => e.kind === 'email_send')?.needsApproval).toBe(true);
  });
});

describe('angles and evals', () => {
  const scored = scoreLedger(CLAIMS, CAPTURED_AT, 'openai.com');

  it('maps seller capabilities to account signals', () => {
    const angles = suggestAngles(DEFAULT_SELLER, scored);
    expect(angles.length).toBeGreaterThan(0);
    expect(angles.every((a) => a.claimIds.length > 0)).toBe(true);
  });

  it('returns no angles when nothing matches', () => {
    expect(suggestAngles({ ...DEFAULT_SELLER, capabilities: ['office furniture'] }, scored)).toEqual([]);
  });

  it('evals improve with seller context and guard passes', () => {
    const base = runEvals({ claims: scored, telemetry: RUN_TELEMETRY, sellerKnown: false, anglesFound: 0 });
    const next = runEvals({ claims: scored, telemetry: RUN_TELEMETRY, sellerKnown: true, anglesFound: 2 });
    expect(base.find((e) => e.id === 'seller_context')?.pass).toBe(false);
    expect(next.find((e) => e.id === 'seller_context')?.pass).toBe(true);
    expect(base.find((e) => e.id === 'domain_guard')?.pass).toBe(true);
  });
});
