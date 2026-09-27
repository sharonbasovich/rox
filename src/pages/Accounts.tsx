import { useState } from 'react';
import { checkDomain, type DomainVerdict } from '../../shared/domainGuard.ts';
import { WORKSPACE_ACCOUNTS } from '../../shared/data.ts';
import { Card, PageHead, Tag } from '../components/ui.tsx';
import { postJson } from '../lib/api.ts';

function Verdict({ v }: { v: DomainVerdict }) {
  if (v.ok) return <Tag tone="good">valid</Tag>;
  return <><Tag tone={v.severity === 'block' ? 'bad' : 'warn'}>{v.severity === 'block' ? 'blocked' : 'warning'}</Tag> <span className="muted small">{v.reason}</span></>;
}

export default function Accounts() {
  const [domain, setDomain] = useState('169.254.169.254');
  const [result, setResult] = useState<DomainVerdict | null>(null);

  async function check() {
    setResult(await postJson<DomainVerdict>('/api/domain/check', { domain }));
  }

  return (
    <>
      <PageHead
        kicker="Prototype 6 · Input guardrails"
        title="Domain Guardrails"
        sub="Company domains flow straight into enrichment, web search and fetch tools. This test workspace already holds accounts pointing at loopback, the cloud metadata IP and malformed hosts. The same validator runs in the UI, the API and before every agent tool call."
      />
      <Card title="Accounts currently in the workspace">
        <table className="table">
          <thead><tr><th>Account</th><th>Domain</th><th>Guardrail</th></tr></thead>
          <tbody>
            {WORKSPACE_ACCOUNTS.map((a) => (
              <tr key={a.name}><td><b>{a.name}</b></td><td><code>{a.domain}</code></td><td><Verdict v={checkDomain(a.domain)} /></td></tr>
            ))}
          </tbody>
        </table>
      </Card>
      <Card title="Add account">
        <div className="row">
          <input className="grow" value={domain} onChange={(e) => { setDomain(e.target.value); setResult(null); }} placeholder="company.com" />
          <button className="btn primary" onClick={() => void check()}>Validate &amp; add</button>
        </div>
        <div className="row small" style={{ marginTop: 8 }}>
          Live (client-side): <Verdict v={checkDomain(domain)} />
          {result && <>· Server: <Verdict v={result} />{result.ok && <Tag tone="good">would be created as {result.normalized}</Tag>}</>}
        </div>
      </Card>
    </>
  );
}
