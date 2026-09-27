import { checkDomain } from './domainGuard.ts';
import { summarizeLedger } from './ledger.ts';
import type { ScoredClaim } from './types.ts';

export interface EvalResult {
  id: string;
  suite: 'grounding' | 'safety' | 'latency' | 'personalization';
  name: string;
  pass: boolean;
  metric: string;
  detail: string;
}

export interface EvalInputs {
  claims: ScoredClaim[];
  telemetry: { run: string; label: string; firstTokenSec: number; totalSec: number }[];
  sellerKnown: boolean;
  anglesFound: number;
}

const SSRF_CASES = ['127.0.0.1', '169.254.169.254', "a'b.example", 'localhost', '0x7f000001', '2130706433', '[::1]', 'normaltest.example'];

export function runEvals(input: EvalInputs): EvalResult[] {
  const s = summarizeLedger(input.claims);
  const results: EvalResult[] = [];
  const pct = (a: number, b: number) => (b === 0 ? 0 : Math.round((a / b) * 100));

  results.push({
    id: 'citation_coverage', suite: 'grounding', name: 'Every factual claim has a citation',
    pass: s.cited === s.total, metric: `${pct(s.cited, s.total)}%`,
    detail: `${s.total - s.cited} of ${s.total} claims have no source`,
  });
  results.push({
    id: 'decision_critical', suite: 'grounding', name: 'Decision-critical claims are high confidence',
    pass: s.decisionCriticalAtRisk === 0, metric: `${s.decisionCriticalAtRisk} at risk`,
    detail: 'Who to contact and which numbers to quote need 2+ independent or primary sources',
  });
  results.push({
    id: 'aggregator_share', suite: 'grounding', name: 'Aggregator-only claims are 10% or less',
    pass: pct(s.aggregatorOnly, s.total) <= 10, metric: `${pct(s.aggregatorOnly, s.total)}%`,
    detail: `${s.aggregatorOnly} claims rest only on blogs/aggregators`,
  });
  const crossRun = input.claims.filter((c) => c.seenIn.length >= 2).length;
  results.push({
    id: 'cross_run', suite: 'grounding', name: 'Runs on the same account agree (30% or more overlap)',
    pass: pct(crossRun, s.total) >= 30, metric: `${pct(crossRun, s.total)}%`,
    detail: `${crossRun} claims reproduced by both the chat brief and the account plan`,
  });

  const blocked = SSRF_CASES.filter((d) => !checkDomain(d).ok);
  results.push({
    id: 'domain_guard', suite: 'safety', name: 'Internal / malformed domains never reach fetch tools',
    pass: blocked.length === SSRF_CASES.length, metric: `${blocked.length}/${SSRF_CASES.length}`,
    detail: SSRF_CASES.map((d) => `${d}: ${checkDomain(d).ok ? 'ALLOWED' : 'blocked'}`).join(', '),
  });

  for (const t of input.telemetry) {
    results.push({
      id: `ttfa_${t.run}`, suite: 'latency', name: `${t.label}: first useful answer in 5s or less`,
      pass: t.firstTokenSec <= 5, metric: `${t.firstTokenSec}s`, detail: `Complete after ${t.totalSec}s`,
    });
  }

  results.push({
    id: 'seller_context', suite: 'personalization', name: 'Pitch is tailored to what the seller sells',
    pass: input.sellerKnown && input.anglesFound > 0, metric: input.sellerKnown ? `${input.anglesFound} angles` : 'generic',
    detail: input.sellerKnown ? 'Angles map seller capabilities to account signals' : 'Rox answered: "I can\'t tailor the pitch to a specific SKU"',
  });
  return results;
}
