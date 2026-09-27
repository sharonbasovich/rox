import { useMemo, useState } from 'react';
import { suggestAngles } from '../../shared/angles.ts';
import { DEFAULT_SELLER } from '../../shared/data.ts';
import type { Angle, SellerProfile } from '../../shared/types.ts';
import { Card, ConfidencePill, JobStatus, PageHead, Tag } from '../components/ui.tsx';
import { useJob } from '../lib/api.ts';
import { SCORED_CLAIMS } from '../lib/claims.ts';

type LiveAngle = Omit<Angle, 'strength'> & { firstLine?: string; strength?: number };

const split = (s: string) => s.split(',').map((x) => x.trim()).filter(Boolean);

export default function Seller() {
  const [seller, setSeller] = useState<SellerProfile>(DEFAULT_SELLER);
  const [caps, setCaps] = useState(DEFAULT_SELLER.capabilities.join(', '));
  const [personas, setPersonas] = useState(DEFAULT_SELLER.personas.join(', '));
  const angles = useMemo(() => suggestAngles(seller, SCORED_CLAIMS), [seller]);
  const claimsById = useMemo(() => new Map(SCORED_CLAIMS.map((c) => [c.id, c])), []);
  const { job, elapsed, start } = useJob<{ angles: LiveAngle[] }>('seller_angles');

  function apply() {
    setSeller((s) => ({ ...s, capabilities: split(caps), personas: split(personas) }));
  }

  function generateLive() {
    const next = { ...seller, capabilities: split(caps), personas: split(personas) };
    setSeller(next);
    void start({
      seller: next,
      claims: SCORED_CLAIMS.map((c) => ({ id: c.id, text: c.text, confidence: c.confidence, decisionCritical: c.decisionCritical })),
    });
  }

  const shown: LiveAngle[] = job?.status === 'done' && job.output ? job.output.angles : angles;

  return (
    <>
      <PageHead
        kicker="Prototype 3 · Seller context graph"
        title="Seller Context"
        sub={<>Rox onboarding only asks for a company name, so the brief said: <i>"I can't tailor the pitch to a specific SKU."</i> A small structured seller profile lets every agent connect <b>what you sell</b> to <b>what is happening at the account</b>, citing the claims it relies on.</>}
      />
      <div className="split">
        <Card title="What does your company sell?" right={<Tag tone="neutral">made-up test company</Tag>}>
          <label className="lbl">Company<input value={seller.company} onChange={(e) => setSeller({ ...seller, company: e.target.value })} /></label>
          <label className="lbl">One-liner<input value={seller.oneLiner} onChange={(e) => setSeller({ ...seller, oneLiner: e.target.value })} /></label>
          <label className="lbl">Capabilities (comma-separated)<input value={caps} onChange={(e) => setCaps(e.target.value)} /></label>
          <label className="lbl">Buyer personas<input value={personas} onChange={(e) => setPersonas(e.target.value)} /></label>
          <div className="actions">
            <button className="btn primary" onClick={apply}>Update angles</button>
            <button className="btn ai" onClick={generateLive} disabled={job?.status === 'running'}>Generate with agent</button>
          </div>
          <JobStatus job={job} elapsed={elapsed} />
        </Card>
        <div className="stack">
          {shown.length === 0 && <Card><p className="muted">No capability matches a current account signal. Try adding "agent evaluation", "audit logs" or "revenue analytics".</p></Card>}
          {shown.map((a) => (
            <Card key={a.title} title={a.title} right={a.strength !== undefined ? <span className="muted small">strength {Math.round(a.strength * 100)}</span> : <Tag tone="ai">agent</Tag>}>
              <div className="row small"><Tag>{a.persona}</Tag>{a.capability && <Tag tone="good">{a.capability}</Tag>}</div>
              <p>{a.why}</p>
              {a.firstLine && <p className="quote">“{a.firstLine}”</p>}
              <div className="small muted">Relies on:</div>
              {a.claimIds.map((id) => {
                const c = claimsById.get(id);
                return c ? <div key={id} className="evidence">{c.text} <ConfidencePill c={c.confidence} /></div> : null;
              })}
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
