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
    area: 'Record vs. agent output',
    observed: 'On the OpenAI account, the Rox-enriched Revenue field reads 2000000. On the same account, the Account Plan agent wrote "$40B revenue run rate". Nothing flagged the conflict or offered to update the field.',
    impact: 'Reps and downstream agents read the record, not the plan. Research that never reaches the record, or contradicts it silently, erodes trust in both.',
    proto: { to: '/account', label: 'Record Truth-Check' },
    severity: 'high',
  },
  {
    area: 'Source strength',
    observed: 'Rox cites every statement, which is a strong base. In the OpenAI brief the new CRO was cited only to derrick-app.com (a sales-tool blog), and the brief then made that person the primary outreach target. The citation chip looks the same as one to CNBC or openai.com.',
    impact: 'A single weak citation on a decision-critical fact (who to email) carries the same visual weight as a primary source. Surfacing tier, corroboration and freshness shows the rep which claims to double-check.',
    proto: { to: '/ledger', label: 'Evidence Ledger' },
    severity: 'medium',
  },
  {
    area: 'Rendering',
    observed: 'The enriched Industries field renders as a raw JSON string: ["Software", "Engineering Software"].',
    impact: 'Small, but it is on the account header of every enriched account.',
    proto: { to: '/account', label: 'Record Truth-Check' },
    severity: 'low',
  },
  {
    area: 'Sequences',
    observed: 'Clicking "New sequence" immediately creates "Sequence - <date>" before a step is added or anything is saved.',
    impact: 'Abandoned attempts leave empty sequences in the list. Creating on first save avoids that.',
    severity: 'low',
  },
];

const EXCLUDED = [
  'Seller-specific pitches: the test company was fictional, so Rox correctly declined to tailor a pitch.',
  'Empty states, integrations and People ranking: no integrations or real ICP were configured.',
  'Agent previews and limits: templates were Enterprise-gated, and Rox documents previews, sandboxes and action limits.',
  'Latency: one run each, not a benchmark.',
  'Unusual test accounts in the workspace were not created by Rox and are not treated as a product issue.',
];

export default function Findings() {
  return (
    <>
      <PageHead
        kicker="Rox product review · Sept 2026"
        title="From cited research to a record you can act on"
        sub="I explored every Rox surface with a test workspace and ran a real account brief and account plan on OpenAI. The list is short on purpose: it only includes behavior I saw directly and could not have caused through my own test setup. The main theme is keeping what agents research in sync with the record, and showing how strong each citation is."
      />
      <div className="grid3">
        <Card><div className="stat">20,000x</div><div className="stat-l">gap between the record's revenue and the agent's figure</div></Card>
        <Card><div className="stat">0</div><div className="stat-l">conflicts flagged between the plan and the record</div></Card>
        <Card><div className="stat">1</div><div className="stat-l">blog citation behind the recommended primary contact</div></Card>
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
      <Card title="Deliberately left out">
        <ul className="tldr">{EXCLUDED.map((e) => <li key={e} className="muted">{e}</li>)}</ul>
      </Card>
    </>
  );
}
