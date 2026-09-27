import type { FieldSuggestion, RecordField, ScoredClaim } from './types.ts';

function parseJsonArray(value: string): string[] | null {
  if (!value.trim().startsWith('[')) return null;
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) && parsed.every((x) => typeof x === 'string') ? parsed : null;
  } catch {
    return null;
  }
}

/** Parse "$40B", "~$852B", "$1.2 trillion" into dollars. */
export function parseMoney(text: string): number | null {
  const m = text.match(/\$\s?([\d.,]+)\s*(t|trillion|b|bn|billion|m|mm|million|k)?\b/i);
  if (!m) return null;
  const n = Number(m[1].replace(/,/g, ''));
  if (!Number.isFinite(n)) return null;
  const unit = (m[2] ?? '').toLowerCase();
  const mult = unit.startsWith('t') ? 1e12 : unit.startsWith('b') ? 1e9 : unit.startsWith('m') ? 1e6 : unit === 'k' ? 1e3 : 1;
  return n * mult;
}

export function formatMoney(n: number): string {
  if (n >= 1e12) return `$${+(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${+(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${+(n / 1e6).toFixed(1)}M`;
  return `$${n.toLocaleString('en-US')}`;
}

/**
 * Compare CRM/Rox record fields with what the research agents just said about the same account.
 * Produces reviewable suggestions instead of silently leaving the two out of sync.
 */
export function reconcile(fields: RecordField[], claims: ScoredClaim[]): FieldSuggestion[] {
  const out: FieldSuggestion[] = [];
  const byId = new Map(claims.map((c) => [c.id, c]));

  for (const f of fields) {
    const arr = parseJsonArray(f.value);
    if (arr) {
      out.push({
        fieldKey: f.key, label: f.label, kind: 'format', current: f.value,
        suggested: JSON.stringify(arr), display: arr.join(' · '), confidence: 'high',
        rationale: 'Multi-value field is rendered as a raw JSON string; show as tags and store as a list.',
        evidenceClaimIds: [],
      });
    }
  }

  const revenue = fields.find((f) => f.key === 'revenue');
  const runRate = byId.get('revenue_run_rate');
  if (revenue && runRate) {
    const recorded = Number(revenue.value);
    const researched = parseMoney(runRate.text);
    if (Number.isFinite(recorded) && researched && researched / Math.max(recorded, 1) > 10) {
      out.push({
        fieldKey: 'revenue', label: revenue.label, kind: 'conflict', current: revenue.value,
        suggested: String(researched), display: `${formatMoney(researched)} (run rate)`,
        confidence: runRate.confidence,
        rationale: `Record says ${formatMoney(recorded)} but the account-plan agent used ${formatMoney(researched)}: a ${Math.round(researched / recorded).toLocaleString('en-US')}x gap. One of them is wrong, and today both are shown to the rep.`,
        evidenceClaimIds: [runRate.id],
      });
    }
  }

  const headcount = fields.find((f) => f.key === 'head_count');
  if (headcount && !headcount.lastUpdated) {
    out.push({
      fieldKey: 'head_count', label: headcount.label, kind: 'unverified', current: headcount.value,
      suggested: headcount.value, display: `${headcount.value} (needs re-enrichment)`, confidence: 'low',
      rationale: 'Neither research run corroborated this value and the field has no "as of" date.',
      evidenceClaimIds: [],
    });
  }

  const valuation = byId.get('valuation');
  if (valuation && !fields.some((f) => f.key === 'valuation')) {
    const amount = parseMoney(valuation.text.split(/at an?\s/i)[1] ?? valuation.text);
    if (amount) {
      out.push({
        fieldKey: 'valuation', label: 'Last Valuation', kind: 'missing', current: '',
        suggested: String(amount), display: `${formatMoney(amount)} (${valuation.asOf ?? 'undated'})`,
        confidence: valuation.confidence,
        rationale: 'Both agent runs agree on this figure, but it only lives in chat/plan text and is not on the record.',
        evidenceClaimIds: [valuation.id],
      });
    }
  }
  return out;
}
