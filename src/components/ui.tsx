import type { CSSProperties, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { NAV } from '../lib/nav.tsx';
import type { Confidence } from '../../shared/types.ts';

export function Card({ title, right, children }: { title?: ReactNode; right?: ReactNode; children: ReactNode }) {
  return (
    <section className="card">
      {(title || right) && (
        <header className="card-head">
          <h3>{title}</h3>
          <div>{right}</div>
        </header>
      )}
      {children}
    </section>
  );
}

export function ConfidencePill({ c }: { c: Confidence }) {
  return <span className={`pill pill-${c}`}>{c}</span>;
}

export function Tag({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'bad' | 'good' | 'warn' | 'ai' }) {
  return <span className={`tag tag-${tone}`}>{children}</span>;
}

export function PageHead({ kicker, title, sub }: { kicker: string; title: string; sub: ReactNode }) {
  const { pathname } = useLocation();
  const item = NAV.find((n) => n.to === pathname);
  const Icon = item?.Icon;
  return (
    <>
      <header className="topbar">
        {Icon && <span className="page-icon" style={{ '--hue': item.hue } as CSSProperties}><Icon size={17} strokeWidth={1.75} /></span>}
        <h1>{title}</h1>
        <span className="topbar-kicker">{kicker}</span>
      </header>
      <p className="sub">{sub}</p>
    </>
  );
}

export function JobStatus({ job, elapsed }: { job: { mode: string; status: string; sessionUrl?: string; devinStatus?: string; error?: string } | null; elapsed: number }) {
  if (!job) return null;
  return (
    <div className={`jobbar jobbar-${job.status}`}>
      <Tag tone="ai">{job.mode === 'live' ? 'Devin live' : 'Recorded'}</Tag>
      <span>
        {job.status === 'running' && `Running: ${elapsed}s${job.devinStatus ? ` (${job.devinStatus})` : ''}`}
        {job.status === 'done' && 'Complete'}
        {job.status === 'error' && `Error: ${job.error}`}
      </span>
      {job.sessionUrl && (
        <a href={job.sessionUrl} target="_blank" rel="noreferrer">Open agent run ↗</a>
      )}
    </div>
  );
}
