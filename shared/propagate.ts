import type { Confidence, ScoredClaim } from './types.ts';

const RANK: Record<Confidence, number> = { low: 0, medium: 1, high: 2 };

/** A recommendation can be no more confident than the weakest claim it rests on. */
export function propagate(scored: ScoredClaim[], deps: Record<string, string[]>): ScoredClaim[] {
  const byId = new Map(scored.map((c) => [c.id, c]));
  return scored.map((c) => {
    const parents = (deps[c.id] ?? []).map((id) => byId.get(id)).filter((p): p is ScoredClaim => Boolean(p));
    if (parents.length === 0) return c;
    const weakest = parents.reduce((a, b) => (RANK[a.confidence] <= RANK[b.confidence] ? a : b));
    if (RANK[weakest.confidence] >= RANK[c.confidence] && c.sources.length > 0) return c;
    return {
      ...c,
      confidence: weakest.confidence,
      score: Math.min(c.score, weakest.score),
      reasons: [...c.reasons, `Depends on "${weakest.text.slice(0, 48)}…" (${weakest.confidence})`],
    };
  });
}
