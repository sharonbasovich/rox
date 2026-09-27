import { suggestAngles } from '../shared/angles.ts';
import { CAPTURED_AT, CLAIMS, DEFAULT_SELLER } from '../shared/data.ts';
import { scoreLedger } from '../shared/ledger.ts';
import type { SellerProfile } from '../shared/types.ts';

/** Deterministic outputs used when no Devin key is configured, so the demo always works offline. */
export function recordedVerdicts() {
  const verdicts = scoreLedger(CLAIMS, CAPTURED_AT, 'openai.com').map((c) => ({
    id: c.id,
    verdict: c.sources.length === 0 || c.confidence === 'low' ? 'unverifiable' : 'supported',
    note: c.reasons.join('; '),
  }));
  return { verdicts };
}

export function recordedAngles(seller: SellerProfile = DEFAULT_SELLER) {
  const angles = suggestAngles(seller, scoreLedger(CLAIMS, CAPTURED_AT, 'openai.com')).map((a) => ({
    ...a,
    firstLine: `Saw the news on ${a.title.toLowerCase()}. ${seller.company} helps ${a.persona}s with ${a.capability}.`,
  }));
  return { angles };
}
