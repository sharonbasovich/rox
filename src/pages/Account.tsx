import { useMemo, useState } from 'react';
import { ACCOUNT, RECORD_FIELDS } from '../../shared/data.ts';
import { reconcile } from '../../shared/reconcile.ts';
import type { FieldSuggestion } from '../../shared/types.ts';
import { Card, ConfidencePill, PageHead, Tag } from '../components/ui.tsx';
import { SCORED_CLAIMS } from '../lib/claims.ts';

type Decision = 'accepted' | 'rejected' | 'queued';

interface AuditEntry {
  at: string;
  field: string;
  from: string;
  to: string;
  decision: Decision;
  evidence: string[];
}

const KIND_LABEL: Record<FieldSuggestion['kind'], string> = {
  conflict: 'Conflicts with research',
  format: 'Formatting',
  missing: 'Missing from record',
  unverified: 'Unverified',
};

export default function Account() {
  const suggestions = useMemo(() => reconcile(RECORD_FIELDS, SCORED_CLAIMS), []);
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const claimsById = useMemo(() => new Map(SCORED_CLAIMS.map((c) => [c.id, c])), []);

  const fields = RECORD_FIELDS.map((f) => {
    const s = suggestions.find((x) => x.fieldKey === f.key);
    const accepted = s && decisions[s.fieldKey] === 'accepted';
    return { ...f, display: accepted ? s.display : f.value, suggestion: s, accepted };
  });
  const extra = suggestions.filter((s) => !RECORD_FIELDS.some((f) => f.key === s.fieldKey) && decisions[s.fieldKey] === 'accepted');

  function decide(s: FieldSuggestion, d: Decision) {
    setDecisions((prev) => ({ ...prev, [s.fieldKey]: d }));
    setAudit((prev) => [
      { at: new Date().toLocaleTimeString(), field: s.label, from: s.current || '∅', to: d === 'accepted' ? s.display : d === 'queued' ? 're-enrichment queued' : s.current || '∅', decision: d, evidence: s.evidenceClaimIds },
      ...prev,
    ]);
  }

  const open = suggestions.filter((s) => !decisions[s.fieldKey]);

  return (
    <>
      <PageHead
        kicker="Prototype 1 · Research → Record reconciliation"
        title="Record Truth-Check"
        sub="After every research or plan run, compare what the agent said with what the record says, then let the rep accept or reject each fix. Every change keeps its evidence and lands in an audit log."
      />
      <div className="split">
        <Card title={<><span className="acct-logo">◍</span> {ACCOUNT.name} <span className="muted small">{ACCOUNT.domain}</span></>} right={<Tag tone={open.length ? 'warn' : 'good'}>{open.length ? `${open.length} to review` : 'In sync'}</Tag>}>
          <div className="fields">
            {fields.map((f) => (
              <div key={f.key} className={`field ${f.suggestion && !decisions[f.key] ? 'field-flag' : ''}`}>
                <div className="field-l">{f.label} <span className="muted small">· {f.source}</span></div>
                <div className="field-v">
                  {f.key === 'industries' && f.accepted
                    ? (JSON.parse(f.suggestion?.suggested ?? '[]') as string[]).map((x) => <Tag key={x}>{x}</Tag>)
                    : f.display}
                  {f.accepted && <Tag tone="good">updated</Tag>}
                </div>
              </div>
            ))}
            {extra.map((s) => (
              <div key={s.fieldKey} className="field">
                <div className="field-l">{s.label} <span className="muted small">· Truth-Check</span></div>
                <div className="field-v">{s.display} <Tag tone="good">added</Tag></div>
              </div>
            ))}
          </div>
        </Card>
        <div className="stack">
          {suggestions.map((s) => (
            <Card key={s.fieldKey} title={<>{s.label} <Tag tone={s.kind === 'conflict' ? 'bad' : s.kind === 'unverified' ? 'warn' : 'neutral'}>{KIND_LABEL[s.kind]}</Tag></>} right={<ConfidencePill c={s.confidence} />}>
              <div className="diff">
                <div><div className="muted small">Record</div><code>{s.current || '∅'}</code></div>
                <div className="arrow">→</div>
                <div><div className="muted small">Suggested</div><code>{s.display}</code></div>
              </div>
              <p className="small">{s.rationale}</p>
              {s.evidenceClaimIds.map((id) => {
                const c = claimsById.get(id);
                return c ? (
                  <div key={id} className="evidence">
                    “{c.text}” <span className="muted">· seen in {c.seenIn.join(' + ')} · {c.sources.length ? c.sources.map((x) => x.domain).join(', ') : 'no citation'}</span>
                  </div>
                ) : null;
              })}
              <div className="actions">
                {decisions[s.fieldKey] ? (
                  <Tag tone={decisions[s.fieldKey] === 'accepted' ? 'good' : decisions[s.fieldKey] === 'queued' ? 'ai' : 'neutral'}>{decisions[s.fieldKey] === 'queued' ? 're-enrichment queued' : decisions[s.fieldKey]}</Tag>
                ) : (
                  <>
                    <button className="btn primary" onClick={() => decide(s, 'accepted')} disabled={s.kind === 'unverified'}>Accept</button>
                    <button className="btn" onClick={() => decide(s, 'rejected')}>Reject</button>
                    {s.kind === 'unverified' && <button className="btn" onClick={() => decide(s, 'queued')}>Queue re-enrichment</button>}
                    {s.confidence === 'low' && s.kind === 'conflict' && <span className="muted small">Low confidence: the agent's figure has no citation</span>}
                  </>
                )}
              </div>
            </Card>
          ))}
          <Card title="Audit log">
            {audit.length === 0 ? <p className="muted small">No changes yet.</p> : (
              <table className="table small">
                <tbody>
                  {audit.map((a, i) => (
                    <tr key={i}><td>{a.at}</td><td><b>{a.field}</b></td><td>{a.from} → {a.to}</td><td><Tag tone={a.decision === 'accepted' ? 'good' : a.decision === 'queued' ? 'ai' : 'neutral'}>{a.decision}</Tag></td><td className="muted">{a.evidence.join(', ') || 'rule'}</td></tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
