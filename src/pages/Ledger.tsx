import { useMemo, useState } from 'react';
import { CLAIM_DEPENDENCIES, RUN_TELEMETRY } from '../../shared/data.ts';
import { summarizeLedger } from '../../shared/ledger.ts';
import { TIER_LABEL } from '../../shared/sources.ts';
import { Card, ConfidencePill, JobStatus, PageHead, Tag } from '../components/ui.tsx';
import { useJob } from '../lib/api.ts';
import { SCORED_CLAIMS } from '../lib/claims.ts';

interface Verdict { id: string; verdict: 'supported' | 'contradicted' | 'unverifiable'; correction?: string; sourceUrl?: string; note?: string }

export default function Ledger() {
  const [filter, setFilter] = useState<'all' | 'critical' | 'low'>('all');
  const summary = useMemo(() => summarizeLedger(SCORED_CLAIMS), []);
  const { job, elapsed, start } = useJob<{ verdicts: Verdict[] }>('verify_claims');
  const verdicts = new Map((job?.output?.verdicts ?? []).map((v) => [v.id, v]));

  const rows = SCORED_CLAIMS.filter((c) =>
    filter === 'all' ? true : filter === 'critical' ? c.decisionCritical : c.confidence === 'low');
  const tldr = SCORED_CLAIMS.filter((c) => c.confidence === 'high').slice(0, 3);

  function verify() {
    const targets = SCORED_CLAIMS.filter((c) => c.confidence !== 'high')
      .map((c) => ({ id: c.id, claim: c.text, currentSources: c.sources.map((s) => s.domain), account: 'OpenAI (openai.com)' }));
    void start({ claims: targets, asOf: '2026-09-27' });
  }

  return (
    <>
      <PageHead
        kicker="Prototype 2 · Claim-level provenance"
        title="Evidence Ledger"
        sub="The same OpenAI brief Rox produced, split into atomic claims. Each claim is scored on source tier, independent corroboration, cross-run agreement and freshness. Recommendations inherit the confidence of the claims they depend on."
      />
      <div className="grid4">
        <Card><div className="stat">{summary.total}</div><div className="stat-l">claims extracted</div></Card>
        <Card><div className="stat good">{summary.high}</div><div className="stat-l">high confidence</div></Card>
        <Card><div className="stat bad">{summary.decisionCriticalAtRisk}</div><div className="stat-l">decision-critical &amp; not verified</div></Card>
        <Card><div className="stat warn">{summary.aggregatorOnly}</div><div className="stat-l">rest only on blogs / aggregators</div></Card>
      </div>

      <Card title="Answer-first TL;DR" right={<span className="muted small">Could stream at ~2s from cached, high-confidence claims. Rox's first text arrived at {RUN_TELEMETRY[0].firstTokenSec}s and the full brief at {RUN_TELEMETRY[0].totalSec}s.</span>}>
        <ul className="tldr">{tldr.map((c) => <li key={c.id}>{c.text} <ConfidencePill c={c.confidence} /></li>)}</ul>
      </Card>

      <Card
        title="Claims"
        right={
          <div className="row">
            {(['all', 'critical', 'low'] as const).map((f) => (
              <button key={f} className={`btn ${filter === f ? 'primary' : ''}`} onClick={() => setFilter(f)}>
                {f === 'all' ? 'All' : f === 'critical' ? 'Decision-critical' : 'Low confidence'}
              </button>
            ))}
            <button className="btn ai" onClick={verify} disabled={job?.status === 'running'}>Verify weak claims with agent</button>
          </div>
        }
      >
        <JobStatus job={job} elapsed={elapsed} />
        <table className="table">
          <thead><tr><th>Claim</th><th>Sources</th><th>Runs</th><th>Confidence</th><th>Why</th>{job && <th>Verifier</th>}</tr></thead>
          <tbody>
            {rows.map((c) => {
              const v = verdicts.get(c.id);
              return (
                <tr key={c.id} className={c.decisionCritical && c.confidence !== 'high' ? 'row-risk' : ''}>
                  <td>
                    {c.decisionCritical && <Tag tone="bad">acts on this</Tag>} {c.text}
                    {CLAIM_DEPENDENCIES[c.id] && <div className="muted small">depends on: {CLAIM_DEPENDENCIES[c.id].join(', ')}</div>}
                  </td>
                  <td>{c.sources.length === 0 ? <Tag tone="bad">none</Tag> : c.sources.map((s, i) => (
                    <div key={s.domain} className="small">{s.domain} <span className="muted">· {TIER_LABEL[c.tiers[i]]}{s.publishedAt ? ` · ${s.publishedAt}` : ''}</span></div>
                  ))}</td>
                  <td className="small">{c.seenIn.join(' + ')}</td>
                  <td><ConfidencePill c={c.confidence} /> <span className="muted small">{Math.round(c.score * 100)}</span></td>
                  <td className="small muted">{c.reasons.join(' · ')}</td>
                  {job && (
                    <td className="small">
                      {v ? <><Tag tone={v.verdict === 'supported' ? 'good' : v.verdict === 'contradicted' ? 'bad' : 'warn'}>{v.verdict}</Tag>
                        {v.correction && <div>{v.correction}</div>}
                        {v.sourceUrl && <div><a href={v.sourceUrl} target="_blank" rel="noreferrer">source ↗</a></div>}
                        {v.note && <div className="muted">{v.note}</div>}</> : c.confidence === 'high' ? <span className="muted">skipped (high)</span> : job.status === 'running' ? '…' : '—'}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </>
  );
}
