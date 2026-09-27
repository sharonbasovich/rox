import express from 'express';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { devinConfigured } from './devin.ts';
import { refreshJob, startJob, type JobKind } from './jobs.ts';
import { recordedVerdicts } from './recorded.ts';

const app = express();
app.use(express.json({ limit: '256kb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, ai: devinConfigured() ? 'devin' : 'recorded' });
});

app.post('/api/jobs', async (req, res) => {
  const kind = req.body?.kind as JobKind;
  if (kind !== 'verify_claims') {
    res.status(400).json({ error: 'unknown job kind' });
    return;
  }
  const input: unknown = req.body?.input ?? {};
  res.json(await startJob(kind, input, recordedVerdicts()));
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
