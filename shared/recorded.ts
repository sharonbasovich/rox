import { CAPTURED_AT, CLAIMS } from './data.ts';
import { scoreLedger } from './ledger.ts';

/** Deterministic outputs used when no Devin key is configured, so the demo always works offline. */
export function recordedVerdicts() {
  const verdicts = scoreLedger(CLAIMS, CAPTURED_AT, 'openai.com').map((c) => ({
    id: c.id,
    verdict: c.sources.length === 0 || c.confidence === 'low' ? 'unverifiable' : 'supported',
    note: c.reasons.join('; '),
  }));
  return { verdicts };
}
