import { useMemo, useState } from 'react';
import { AGENT_TEMPLATES, WORKSPACE_ACCOUNTS } from '../../shared/data.ts';
import { dryRun } from '../../shared/dryrun.ts';
import { Card, PageHead, Tag } from '../components/ui.tsx';

const EFFECT_LABEL: Record<string, string> = { email_send: 'External emails', crm_write: 'CRM field writes', notification: 'Notifications' };

export default function DryRun() {
  const [templateId, setTemplateId] = useState(AGENT_TEMPLATES[0].id);
  const [quota, setQuota] = useState(1000);
  const [approved, setApproved] = useState(false);
  const template = AGENT_TEMPLATES.find((t) => t.id === templateId) ?? AGENT_TEMPLATES[0];
  const result = useMemo(() => dryRun(template, WORKSPACE_ACCOUNTS, quota), [template, quota]);
  const needsApproval = result.sideEffects.some((e) => e.needsApproval);

  return (
    <>
      <PageHead
        kicker="Prototype 4 · Safe agent activation"
        title="Agent Dry Run"
        sub="Before an agent template goes live, simulate it against the real account list: which accounts it will touch, which tools it calls, what side effects it will cause, and how much of the monthly action budget it uses. Side-effecting steps require explicit approval."
      />
      <Card title="Template" right={
        <label className="row small">Monthly action budget <input className="num" type="number" value={quota} min={0} onChange={(e) => setQuota(Number(e.target.value))} /></label>
      }>
        <div className="row">
          {AGENT_TEMPLATES.map((t) => (
            <button key={t.id} className={`btn ${t.id === templateId ? 'primary' : ''}`} onClick={() => { setTemplateId(t.id); setApproved(false); }}>{t.name}</button>
          ))}
        </div>
        <p className="muted small">{template.description} · runs {template.schedule}</p>
      </Card>
      <div className="grid3">
        <Card><div className="stat">{result.actionsPerRun}</div><div className="stat-l">actions per run</div></Card>
        <Card><div className="stat">{result.actionsPerMonth}</div><div className="stat-l">actions per month</div></Card>
        <Card><div className={`stat ${result.quotaUsedPct > 80 ? 'bad' : ''}`}>{result.quotaUsedPct}%</div><div className="stat-l">of monthly budget</div></Card>
      </div>
      <div className="split">
        <Card title="Plan">
          <ol className="steps">
            {template.steps.map((s) => (
              <li key={s.name}>
                <b>{s.name}</b> <code>{s.tool}</code> {s.sideEffect !== 'none' && <Tag tone="warn">{EFFECT_LABEL[s.sideEffect]}</Tag>}
              </li>
            ))}
          </ol>
          <h4>Side effects per run</h4>
          {result.sideEffects.length === 0 ? <p className="muted small">Read-only.</p> : result.sideEffects.map((e) => (
            <div key={e.kind} className="row small">{EFFECT_LABEL[e.kind]}: <b>{e.perRun}</b> {e.needsApproval && <Tag tone="bad">needs approval</Tag>}</div>
          ))}
          {result.warnings.map((w) => <div key={w} className="warnline">⚠ {w}</div>)}
          <div className="actions">
            {needsApproval && !approved && <button className="btn primary" onClick={() => setApproved(true)}>Approve first run</button>}
            {(!needsApproval || approved) && <Tag tone="good">Ready to activate{approved ? ' · approved by Sharon' : ''}</Tag>}
          </div>
        </Card>
        <Card title="Target accounts">
          <table className="table small">
            <tbody>
              {result.accounts.map((a) => (
                <tr key={a.name}>
                  <td><b>{a.name}</b></td><td><code>{a.domain}</code></td>
                  <td>{a.included ? <Tag tone="good">included</Tag> : <Tag tone="bad">skipped</Tag>}</td>
                  <td className="muted">{a.skipReason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </>
  );
}
