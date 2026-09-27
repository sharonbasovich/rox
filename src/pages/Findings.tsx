import { Link } from 'react-router-dom';
import { Card, PageHead, Tag } from '../components/ui.tsx';

interface Finding {
  area: string;
  observed: string;
  impact: string;
  proto?: { to: string; label: string };
  severity: 'high' | 'medium' | 'low';
}

const FINDINGS: Finding[] = [
  {
    area: 'Research quality', severity: 'high',
    observed: 'The OpenAI brief named a "new CRO" from a single blog source (derrick-app.com), then made that person the primary outreach target.',
    impact: 'Reps act on the least-verified claim. No claim-level confidence or dependency tracking.',
    proto: { to: '/ledger', label: 'Evidence Ledger' },
  },
  {
    area: 'Data consistency', severity: 'high',
    observed: 'Account record shows Revenue = 2000000; the Account Plan agent wrote "$40B run rate" for the same account minutes later.',
    impact: 'The CRM and the agents disagree, and nothing reconciles them. The rep sees both.',
    proto: { to: '/account', label: 'Record Truth-Check' },
  },
  {
    area: 'Security / data hygiene', severity: 'high',
    observed: 'Accounts with domains 127.0.0.1, 169.254.169.254 (cloud metadata) and a\'b.example exist in the workspace.',
    impact: 'Domains feed enrichment and web-fetch tools, so they need validation at write time (SSRF surface).',
    proto: { to: '/accounts', label: 'Domain Guardrails' },
  },
  {
    area: 'Personalization', severity: 'high',
    observed: 'Chat: "I can\'t tailor the pitch to a specific SKU" because onboarding only captures a company name.',
    impact: 'The same generic angles for every seller. A structured seller profile would make every agent output specific.',
    proto: { to: '/seller', label: 'Seller Context' },
  },
  {
    area: 'Latency', severity: 'medium',
    observed: 'Brief took 124s total (first text at ~12s); account plan took 94s. No ETA, partial-answer, or cancel affordance.',
    impact: 'Answer-first streaming (TL;DR in <5s, then deepen) would change how fast it feels.',
    proto: { to: '/evals', label: 'Eval Console' },
  },
  {
    area: 'Agent safety', severity: 'medium',
    observed: 'Agent templates (e.g. Signals Driven Outbound) go live with no preview of target accounts, side effects or action budget.',
    impact: 'A dry run with side-effect and quota preview builds trust before an agent sends email or writes to the CRM.',
    proto: { to: '/dry-run', label: 'Agent Dry Run' },
  },
  {
    area: 'Rendering', severity: 'low',
    observed: 'Multi-value fields render as raw JSON: Industries = ["Software", "Engineering Software"].',
    impact: 'Small, but it is the first thing you see on every account.',
    proto: { to: '/account', label: 'Record Truth-Check' },
  },
  {
    area: 'Activation', severity: 'medium',
    observed: 'Meetings, Opportunities, Apps and many agent templates are empty or gated (calendar integration, Teams plan, Enterprise plan), and each page explains its gate differently.',
    impact: 'A single "what unlocks what" readiness view would show users the next best integration to connect.',
  },
  {
    area: 'Sequences', severity: 'low',
    observed: 'Clicking "New sequence" immediately creates "Sequence - <date>" before any step is added.',
    impact: 'Abandoned drafts pile up. Create the sequence on the first save instead.',
  },
  {
    area: 'People search', severity: 'low',
    observed: 'Default prospecting results are not ranked against the workspace ICP.',
    impact: 'Rank by fit, with the reasons shown, using the seller profile.',
  },
];

export default function Findings() {
  return (
    <>
      <PageHead
        kicker="Rox product review · Sept 2026"
        title="Making agent output trustworthy enough to act on"
        sub="I explored every Rox surface (Home, Chat, Agents, Accounts, People, Sequences, Meetings, Opportunities, Apps, all 20 settings tabs) with a test workspace and ran real research jobs on OpenAI. Most gaps come down to one theme: agents produce claims, but the product doesn't track how confident each claim is, where it came from, or whether it agrees with the CRM."
      />
      <div className="grid3">
        <Card><div className="stat">124s</div><div className="stat-l">to finish an account brief</div></Card>
        <Card><div className="stat">20,000x</div><div className="stat-l">gap between the record's revenue and the agent's figure</div></Card>
        <Card><div className="stat">4</div><div className="stat-l">accounts with loopback / metadata / malformed domains</div></Card>
      </div>
      <Card title="Findings, in priority order">
        <table className="table">
          <thead>
            <tr><th>Area</th><th>What I observed in Rox</th><th>Why it matters</th><th>Prototype</th></tr>
          </thead>
          <tbody>
            {FINDINGS.map((f) => (
              <tr key={f.observed}>
                <td><Tag tone={f.severity === 'high' ? 'bad' : f.severity === 'medium' ? 'warn' : 'neutral'}>{f.severity}</Tag> <b>{f.area}</b></td>
                <td>{f.observed}</td>
                <td className="muted">{f.impact}</td>
                <td>{f.proto ? <Link to={f.proto.to}>{f.proto.label} →</Link> : <span className="muted">Brief only</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}
