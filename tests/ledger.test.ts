import { describe, expect, it } from 'vitest';
import { CAPTURED_AT, CLAIM_DEPENDENCIES, CLAIMS, RECORD_FIELDS } from '../shared/data.ts';
import { scoreClaim, scoreLedger } from '../shared/ledger.ts';
import { propagate } from '../shared/propagate.ts';
import { formatMoney, parseMoney, reconcile } from '../shared/reconcile.ts';

const scored = propagate(scoreLedger(CLAIMS, CAPTURED_AT, 'openai.com'), CLAIM_DEPENDENCIES);
const byId = new Map(scored.map((c) => [c.id, c]));

describe('claim scoring', () => {
  it('rates a single-blog decision-critical person claim as low', () => {
    expect(byId.get('cro')?.confidence).toBe('low');
  });

  it('rates primary-source claims repeated across runs as high', () => {
    expect(byId.get('valuation')?.confidence).toBe('high');
  });

  it('flags uncited claims', () => {
    expect(byId.get('revenue_run_rate')?.reasons).toContain('No source cited');
  });

  it('propagates low confidence into dependent recommendations', () => {
    const rec = byId.get('primary_target');
    expect(rec?.confidence).toBe('low');
    expect(rec?.reasons.some((r) => r.startsWith('Depends on'))).toBe(true);
  });

  it('penalizes stale sources', () => {
    const c = scoreClaim(
      { id: 'x', text: 't', kind: 'event', decisionCritical: false, seenIn: ['a'], sources: [{ domain: 'cnbc.com', title: 'c', publishedAt: '2025-01-01' }] },
      CAPTURED_AT,
    );
    expect(c.reasons.some((r) => r.includes('days old'))).toBe(true);
  });
});

describe('reconcile', () => {
  const suggestions = reconcile(RECORD_FIELDS, scored);
  const get = (k: string) => suggestions.find((s) => s.fieldKey === k);

  it('parses money', () => {
    expect(parseMoney('~$40B run rate')).toBe(40e9);
    expect(parseMoney('$852B post-money')).toBe(852e9);
    expect(formatMoney(2_000_000)).toBe('$2M');
  });

  it('detects the revenue conflict between record and agent', () => {
    expect(get('revenue')?.kind).toBe('conflict');
    expect(get('revenue')?.suggested).toBe(String(40e9));
  });

  it('fixes JSON-string multi-value fields', () => {
    expect(get('industries')?.display).toBe('Software · Engineering Software');
  });

  it('proposes the missing valuation field from agreeing runs', () => {
    expect(get('valuation')?.suggested).toBe(String(852e9));
  });
});
