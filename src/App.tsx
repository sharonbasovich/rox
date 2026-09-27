import type { CSSProperties } from 'react';
import { ChevronDown, ChevronUp, Ellipsis, Mic, PanelLeft, Plus, Sparkle } from 'lucide-react';
import { Link, NavLink, Navigate, Route, Routes } from 'react-router-dom';
import { useHealth } from './lib/api.ts';
import { NAV_GROUPS } from './lib/nav.tsx';
import Findings from './pages/Findings.tsx';
import Account from './pages/Account.tsx';
import Ledger from './pages/Ledger.tsx';
import Seller from './pages/Seller.tsx';
import DryRun from './pages/DryRun.tsx';
import Evals from './pages/Evals.tsx';
import Accounts from './pages/Accounts.tsx';

const PROMPTS = [
  { label: 'Verify OpenAI brief', to: '/ledger' },
  { label: 'Reconcile account record', to: '/account' },
  { label: 'Tailor pitch to my product', to: '/seller' },
  { label: 'Preview agent before launch', to: '/dry-run' },
];

const RECENT = [
  { label: 'OpenAI Account Plan Creation', at: '29m ago' },
  { label: 'OpenAI Account Brief for Sales', at: '37m ago' },
];

function RoxMark() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12" r="11" fill="#8d857c" />
      <path d="M12 4.5c.6 4.2 3.3 6.9 7.5 7.5-4.2.6-6.9 3.3-7.5 7.5-.6-4.2-3.3-6.9-7.5-7.5 4.2-.6 6.9-3.3 7.5-7.5z" fill="#fff" />
    </svg>
  );
}

export default function App() {
  const ai = useHealth();
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <RoxMark />
          <span className="wordmark">ROX</span>
          <span className="labs">Labs</span>
          <PanelLeft size={18} className="brand-toggle" />
        </div>
        {NAV_GROUPS.map((group, i) => (
          <nav key={i} className="nav-group">
            {group.map(({ to, label, Icon, hue }) => (
              <NavLink key={to} to={to} className={({ isActive }) => (isActive ? 'nav active' : 'nav')} style={{ '--hue': hue } as CSSProperties}>
                <span className="nav-icon"><Icon size={17} strokeWidth={1.75} /></span>
                {label}
              </NavLink>
            ))}
          </nav>
        ))}
        <div className="side-foot">
          <div className="avatar">S</div>
          <div>
            <div className="who">Sharon</div>
            <div className="org">Acme Test Corp</div>
          </div>
        </div>
      </aside>
      <main className="main">
        <Routes>
          <Route path="/" element={<Navigate to="/findings" replace />} />
          <Route path="/findings" element={<Findings />} />
          <Route path="/account" element={<Account />} />
          <Route path="/ledger" element={<Ledger />} />
          <Route path="/seller" element={<Seller />} />
          <Route path="/dry-run" element={<DryRun />} />
          <Route path="/evals" element={<Evals />} />
          <Route path="/accounts" element={<Accounts />} />
        </Routes>
      </main>
      <aside className="chat-rail">
        <div className="chat-head">
          <span className="chat-title">New chat <ChevronDown size={16} /></span>
          <Ellipsis size={18} className="faint" />
        </div>
        <div className="composer">
          <div className="composer-ph">Ask a question, type @ to add context</div>
          <div className="composer-row">
            <span className="chip-btn"><RoxMark /> All accounts <ChevronDown size={14} /></span>
            <Plus size={18} />
            <span className="grow-x" />
            <Mic size={17} />
          </div>
        </div>
        <div className="rail-sec">
          <div className="rail-h">Saved prompts <ChevronUp size={16} /></div>
          {PROMPTS.map((p) => (
            <Link key={p.to} to={p.to} className="rail-item"><Sparkle size={15} className="faint" />{p.label}</Link>
          ))}
          <div className="rail-item faint"><Ellipsis size={15} />Show all</div>
        </div>
        <div className="rail-sec rail-bottom">
          <div className={`ai-status ai-${ai}`}>
            <span className="ai-dot" />
            Agent backend: {ai === 'devin' ? 'Devin live' : ai === 'recorded' ? 'Recorded outputs' : 'Offline'}
          </div>
          <div className="rail-h">Recent chats <ChevronUp size={16} /></div>
          {RECENT.map((r) => (
            <div key={r.label} className="rail-item recent"><RoxMark /><span className="grow-x">{r.label}</span><span className="faint small">{r.at}</span></div>
          ))}
        </div>
      </aside>
    </div>
  );
}
