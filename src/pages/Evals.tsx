import { useMemo } from 'react';
import { suggestAngles } from '../../shared/angles.ts';
import { DEFAULT_SELLER, RUN_TELEMETRY } from '../../shared/data.ts';
import { runEvals, type EvalResult } from '../../shared/evals.ts';
import { Card, PageHead, Tag } from '../components/ui.tsx';
import { SCORED_CLAIMS } from '../lib/claims.ts';

const SUITES: EvalResult['suite'][] = ['grounding', 'safety', 'latency', 'personalization'];

export default function Evals() {
  const baseline = useMemo(() => runEvals({ claims: SCORED_CLAIMS, telemetry: RUN_TELEMETRY, sellerKnown: false, anglesFound: 0 }), []);
  const withSeller = useMemo(() => runEvals({
    claims: SCORED_CLAIMS, telemetry: RUN_TELEMETRY, sellerKnown: true,
    anglesFound: suggestAngles(DEFAULT_SELLER, SCORED_CLAIMS).length,
  }), []);
  const pass = (r: EvalResult[]) => r.filter((x) => x.pass).length;

  return (
    <>
      <PageHead
        kicker="Prototype 5 · Product-level evals"
        title="Eval Console"
        sub="Rox's docs describe roughly 200 sandboxed queries scored by an LLM judge. These are complementary checks at the product level, run on the recorded OpenAI outputs. They are deterministic, cheap enough to run on every output, and each maps to a user-visible failure I hit during exploration."
      />
      <div className="grid3">
        <Card><div className="stat">{pass(baseline)}/{baseline.length}</div><div className="stat-l">passing today (recorded Rox run)</div></Card>
        <Card><div className="stat good">{pass(withSeller)}/{withSeller.length}</div><div className="stat-l">with the Seller Context prototype</div></Card>
        <Card><div className="stat">{RUN_TELEMETRY.map((t) => `${t.totalSec}s`).join(' / ')}</div><div className="stat-l">brief / plan end-to-end latency</div></Card>
      </div>
      {SUITES.map((suite) => (
        <Card key={suite} title={suite[0].toUpperCase() + suite.slice(1)}>
          <table className="table">
            <tbody>
              {withSeller.filter((r) => r.suite === suite).map((r) => {
                const before = baseline.find((b) => b.id === r.id);
                return (
                  <tr key={r.id}>
                    <td style={{ width: 90 }}><Tag tone={r.pass ? 'good' : 'bad'}>{r.pass ? 'pass' : 'fail'}</Tag></td>
                    <td><b>{r.name}</b><div className="muted small">{r.detail}</div></td>
                    <td className="mono">{r.metric}</td>
                    <td className="small muted">{before && before.pass !== r.pass ? `baseline: ${before.metric}` : ''}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      ))}
    </>
  );
}
