import express from 'express';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { checkDomain } from '../shared/domainGuard.ts';
import type { SellerProfile } from '../shared/types.ts';
import { devinConfigured } from './devin.ts';
import { refreshJob, startJob, type JobKind } from './jobs.ts';
import { recordedAngles, recordedVerdicts } from './recorded.ts';

const app = express();
app.use(express.json({ limit: '256kb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, ai: devinConfigured() ? 'devin' : 'recorded' });
});

app.post('/api/domain/check', (req, res) => {
  const domain = typeof req.body?.domain === 'string' ? req.body.domain : '';
  res.json(checkDomain(domain));
});

app.post('/api/jobs', async (req, res) => {
  const kind = req.body?.kind as JobKind;
  if (kind !== 'verify_claims' && kind !== 'seller_angles') {
    res.status(400).json({ error: 'unknown job kind' });
    return;
  }
  const input: unknown = req.body?.input ?? {};
  const recorded = kind === 'verify_claims'
    ? recordedVerdicts()
    : recordedAngles((input as { seller?: SellerProfile }).seller);
  res.json(await startJob(kind, input, recorded));
});

app.get('/api/jobs/:id', async (req, res) => {
  const job = await refreshJob(req.params.id);
  if (!job) {
    res.status(404).json({ error: 'not found' });
    return;
  }
  res.json(job);
});

const dist = path.resolve('dist');
if (existsSync(dist)) {
  app.use(express.static(dist));
  app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')));
}

const port = Number(process.env.PORT ?? 8787);
app.listen(port, () => {
  console.log(`rox prototype api on :${port} (ai: ${devinConfigured() ? 'devin live' : 'recorded'})`);
});
