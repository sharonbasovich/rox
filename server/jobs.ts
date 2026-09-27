import { randomUUID } from 'node:crypto';
import { createSession, devinConfigured, getSession } from './devin.ts';

export type JobKind = 'verify_claims' | 'seller_angles';

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

const ANGLES_SCHEMA = {
  type: 'object',
  properties: {
    angles: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          persona: { type: 'string' },
          why: { type: 'string' },
          claimIds: { type: 'array', items: { type: 'string' } },
          capability: { type: 'string' },
          firstLine: { type: 'string' },
        },
        required: ['title', 'persona', 'why', 'claimIds'],
      },
    },
  },
  required: ['angles'],
};

function prompt(kind: JobKind, input: unknown): { title: string; prompt: string; schema: object } {
  const payload = JSON.stringify(input, null, 2);
  if (kind === 'verify_claims') {
    return {
      title: 'Rox prototype: verify account claims',
      schema: VERIFY_SCHEMA,
      prompt: [
        'You are a fact-checking agent for a sales research product. Do NOT write code or open PRs.',
        'For each claim below, search the public web and decide: supported, contradicted, or unverifiable.',
        'Prefer primary sources (company site, SEC filings) and reputable press. If contradicted, give the correction.',
        'Return ONLY via structured output, one verdict per claim id. Be fast: at most ~10 minutes total.',
        '',
        payload,
      ].join('\n'),
    };
  }
  return {
    title: 'Rox prototype: tailored sales angles',
    schema: ANGLES_SCHEMA,
    prompt: [
      'You are a sales strategist. Do NOT write code or open PRs, and do not browse; use only the data given.',
      'Given the SELLER profile and the scored ACCOUNT CLAIMS, propose up to 3 sales angles.',
      'Each angle must cite the claim ids it relies on, and must avoid claims with confidence "low" unless flagged in "why".',
      'Include a one-sentence first line for an email. Return ONLY via structured output.',
      '',
      payload,
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
  const p = prompt(kind, input);
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
