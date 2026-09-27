import { sourceTier, TIER_WEIGHT } from './sources.ts';
import type { Claim, Confidence, ScoredClaim } from './types.ts';

const DAY = 86_400_000;

function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(b) - Date.parse(a)) / DAY);
}

/**
 * Deterministic claim scoring: corroboration by independent, higher-tier sources,
 * cross-run agreement, and freshness. Decision-critical claims need a stricter bar.
 */
export function scoreClaim(claim: Claim, now: string, accountDomain?: string): ScoredClaim {
  const reasons: string[] = [];
  const tiers = claim.sources.map((s) => sourceTier(s, accountDomain));
  const uniqueDomains = new Set(claim.sources.map((s) => s.domain.toLowerCase()));

  let score = 0;
  if (claim.sources.length === 0) {
    reasons.push('No source cited');
  } else {
    const best = Math.max(...tiers.map((t) => TIER_WEIGHT[t]));
    score += best * 0.6;
    if (uniqueDomains.size >= 2) {
      score += 0.2;
      reasons.push(`Corroborated by ${uniqueDomains.size} independent domains`);
    } else {
      reasons.push('Single source');
    }
    if (tiers.every((t) => t === 'aggregator' || t === 'unknown')) {
      reasons.push('Only aggregator/blog sources');
    }
  }

  if (claim.seenIn.length >= 2) {
    score += 0.15;
    reasons.push(`Consistent across ${claim.seenIn.length} agent runs`);
  }

  const dated = claim.sources.map((s) => s.publishedAt).filter((d): d is string => Boolean(d));
  if (dated.length > 0) {
    const newest = dated.sort().at(-1) as string;
    const age = daysBetween(newest, now);
    if (age <= 90) score += 0.05;
    else reasons.push(`Newest source is ${age} days old`);
  } else if (claim.kind !== 'recommendation') {
    reasons.push('Source date unknown');
  }

  score = Math.min(1, Math.round(score * 100) / 100);
  const highBar = claim.decisionCritical ? 0.8 : 0.7;
  const confidence: Confidence = score >= highBar ? 'high' : score >= 0.45 ? 'medium' : 'low';
  if (claim.decisionCritical && confidence !== 'high') {
    reasons.push('Decision-critical: verify before acting');
  }
  return { ...claim, confidence, score, reasons, tiers };
}

export function scoreLedger(claims: Claim[], now: string, accountDomain?: string): ScoredClaim[] {
  return claims.map((c) => scoreClaim(c, now, accountDomain));
}

export interface LedgerSummary {
  total: number;
  cited: number;
  high: number;
  medium: number;
  low: number;
  decisionCriticalAtRisk: number;
  aggregatorOnly: number;
}

export function summarizeLedger(scored: ScoredClaim[]): LedgerSummary {
  return {
    total: scored.length,
    cited: scored.filter((c) => c.sources.length > 0).length,
    high: scored.filter((c) => c.confidence === 'high').length,
    medium: scored.filter((c) => c.confidence === 'medium').length,
    low: scored.filter((c) => c.confidence === 'low').length,
    decisionCriticalAtRisk: scored.filter((c) => c.decisionCritical && c.confidence !== 'high').length,
    aggregatorOnly: scored.filter(
      (c) => c.sources.length > 0 && c.tiers.every((t) => t === 'aggregator' || t === 'unknown'),
    ).length,
  };
}
