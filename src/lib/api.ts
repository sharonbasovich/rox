import { useCallback, useEffect, useRef, useState } from 'react';
import { recordedVerdicts } from '../../shared/recorded.ts';

export interface Job<T> {
  id: string;
  mode: 'live' | 'recorded';
  status: 'running' | 'done' | 'error';
  createdAt: number;
  sessionUrl?: string;
  devinStatus?: string;
  output?: T;
  error?: string;
}

/** Static builds have no API; jobs resolve to the recorded outputs in the browser. */
const STATIC = import.meta.env.VITE_STATIC === '1';

export async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return (await res.json()) as T;
}

export function useHealth(): 'devin' | 'recorded' | 'offline' | 'loading' {
  const [ai, setAi] = useState<'devin' | 'recorded' | 'offline' | 'loading'>('loading');
  useEffect(() => {
    if (STATIC) {
      setAi('recorded');
      return;
    }
    fetch('/api/health')
      .then((r) => r.json() as Promise<{ ai: 'devin' | 'recorded' }>)
      .then((b) => setAi(b.ai))
      .catch(() => setAi(STATIC ? 'recorded' : 'offline'));
  }, []);
  return ai;
}

/** Start an AI job and poll it until it finishes. */
export function useJob<T>(kind: 'verify_claims') {
  const [job, setJob] = useState<Job<T> | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const timer = useRef<number | null>(null);

  const stop = () => {
    if (timer.current !== null) window.clearInterval(timer.current);
    timer.current = null;
  };
  useEffect(() => stop, []);

  const start = useCallback(async (input: unknown) => {
    stop();
    setElapsed(0);
    if (STATIC) {
      setJob({ id: 'recorded', mode: 'recorded', status: 'done', createdAt: Date.now(), output: recordedVerdicts() as T });
      return;
    }
    const started = await postJson<Job<T>>('/api/jobs', { kind, input });
    setJob(started);
    if (started.status !== 'running') return;
    const t0 = Date.now();
    let ticks = 0;
    timer.current = window.setInterval(async () => {
      ticks += 1;
      setElapsed(Math.round((Date.now() - t0) / 1000));
      if (ticks % 5 !== 0) return;
      const next = (await fetch(`/api/jobs/${started.id}`).then((r) => r.json())) as Job<T>;
      setJob(next);
      if (next.status !== 'running') stop();
    }, 1000);
  }, [kind]);

  return { job, elapsed, start };
}
