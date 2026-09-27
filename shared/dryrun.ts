import { checkDomain } from './domainGuard.ts';
import type { AgentTemplate } from './types.ts';

const RUNS_PER_MONTH: Record<AgentTemplate['schedule'], number> = { daily: 22, weekly: 4, on_signal: 8 };

export interface DryRunAccount {
  name: string;
  domain: string;
  included: boolean;
  skipReason?: string;
}

export interface DryRunResult {
  accounts: DryRunAccount[];
  actionsPerRun: number;
  actionsPerMonth: number;
  quotaUsedPct: number;
  sideEffects: { kind: string; perRun: number; needsApproval: boolean }[];
  warnings: string[];
}

export function dryRun(
  template: AgentTemplate,
  accounts: { name: string; domain: string }[],
  monthlyQuota: number,
): DryRunResult {
  const evaluated: DryRunAccount[] = accounts.map((a) => {
    const v = checkDomain(a.domain);
    return v.ok ? { ...a, included: true } : { ...a, included: false, skipReason: v.reason };
  });
  const n = evaluated.filter((a) => a.included).length;
  const actionsPerRun = template.steps.reduce((sum, s) => sum + s.actionsPerAccount * n, 0);
  const actionsPerMonth = actionsPerRun * RUNS_PER_MONTH[template.schedule];

  const effects = new Map<string, number>();
  for (const step of template.steps) {
    if (step.sideEffect === 'none') continue;
    const per = step.sideEffect === 'notification' ? 1 : step.actionsPerAccount * n;
    effects.set(step.sideEffect, (effects.get(step.sideEffect) ?? 0) + per);
  }
  const sideEffects = [...effects].map(([kind, perRun]) => ({
    kind,
    perRun,
    needsApproval: kind === 'email_send' || kind === 'crm_write',
  }));

  const warnings: string[] = [];
  const skipped = evaluated.length - n;
  if (skipped > 0) warnings.push(`${skipped} account(s) skipped by domain guardrails`);
  const quotaUsedPct = monthlyQuota > 0 ? Math.round((actionsPerMonth / monthlyQuota) * 1000) / 10 : 0;
  if (quotaUsedPct > 80) warnings.push(`Uses ${quotaUsedPct}% of the monthly action budget`);
  if (sideEffects.some((e) => e.kind === 'email_send')) warnings.push('Sends external email: first run requires approval');
  return { accounts: evaluated, actionsPerRun, actionsPerMonth, quotaUsedPct, sideEffects, warnings };
}
