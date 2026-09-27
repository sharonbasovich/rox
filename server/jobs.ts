import { randomUUID } from 'node:crypto';
import { createSession, devinConfigured, getSession } from './devin.ts';

export type JobKind = 'verify_claims';

export interface Job {
  id: string;
  kind: JobKind;
  mode: 'live' | 'recorded';
  status: 'running' | 'done' | 'error';
  createdAt: number;
  sessionId?: string;
  sessionUrl?: string;
  devinStatus?: string;
  output?: unknown;
  error?: string;
}

const VERIFY_SCHEMA = {
  type: 'object',
  properties: {
    verdicts: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          verdict: { type: 'string', enum: ['supported', 'contradicted', 'unverifiable'] },
          correction: { type: 'string' },
          sourceUrl: { type: 'string' },
          note: { type: 'string' },
        },
        required: ['id', 'verdict'],
      },
    },
  },
  required: ['verdicts'],
};

function prompt(input: unknown): { title: string; prompt: string; schema: object } {
  return {
    title: 'Rox prototype: verify account claims',
    schema: VERIFY_SCHEMA,
    prompt: [
      'You are a fact-checking agent for a sales research product. Do NOT write code or open PRs.',
      'For each claim below, search the public web and decide: supported, contradicted, or unverifiable.',
      'Prefer primary sources (company site, SEC filings) and reputable press. If contradicted, give the correction.',
      'Return ONLY via structured output, one verdict per claim id. Be fast: at most ~10 minutes total.',
      '',
      JSON.stringify(input, null, 2),
    ].join('\n'),
  };
}

const jobs = new Map<string, Job>();

export async function startJob(kind: JobKind, input: unknown, recorded: unknown): Promise<Job> {
  const id = randomUUID();
  if (!devinConfigured()) {
    const job: Job = { id, kind, mode: 'recorded', status: 'done', createdAt: Date.now(), output: recorded };
    jobs.set(id, job);
    return job;
  }
  const p = prompt(input);
  const job: Job = { id, kind, mode: 'live', status: 'running', createdAt: Date.now() };
  jobs.set(id, job);
  try {
    const session = await createSession(p);
    job.sessionId = session.sessionId;
    job.sessionUrl = session.url;
  } catch (e) {
    job.status = 'error';
    job.error = e instanceof Error ? e.message : String(e);
  }
  return job;
}

export async function refreshJob(id: string): Promise<Job | undefined> {
  const job = jobs.get(id);
  if (!job || job.status !== 'running' || !job.sessionId) return job;
  try {
    const state = await getSession(job.sessionId);
    job.devinStatus = state.status;
    if (state.structuredOutput) {
      job.output = state.structuredOutput;
      job.status = 'done';
    } else if (['finished', 'expired', 'exit', 'error'].includes(state.status)) {
      job.status = 'error';
      job.error = `Session ended (${state.status}) without structured output`;
    }
  } catch (e) {
    job.devinStatus = e instanceof Error ? e.message : String(e);
  }
  return job;
}
