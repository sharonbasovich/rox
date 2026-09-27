import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import { useHealth } from './lib/api.ts';
import Findings from './pages/Findings.tsx';
import Account from './pages/Account.tsx';
import Ledger from './pages/Ledger.tsx';
import Seller from './pages/Seller.tsx';
import DryRun from './pages/DryRun.tsx';
import Evals from './pages/Evals.tsx';
import Accounts from './pages/Accounts.tsx';

const NAV = [
  { to: '/findings', label: 'Findings', icon: '◎' },
  { to: '/account', label: 'Record Truth-Check', icon: '⇄' },
  { to: '/ledger', label: 'Evidence Ledger', icon: '❏' },
  { to: '/seller', label: 'Seller Context', icon: '✦' },
  { to: '/dry-run', label: 'Agent Dry Run', icon: '▷' },
  { to: '/evals', label: 'Eval Console', icon: '✓' },
  { to: '/accounts', label: 'Domain Guardrails', icon: '⛨' },
];

export default function App() {
  const ai = useHealth();
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="logo">✺</span> ROX <span className="labs">labs</span>
        </div>
        <nav>
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} className={({ isActive }) => (isActive ? 'nav active' : 'nav')}>
              <span className="nav-icon">{n.icon}</span>
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="side-foot">
          <div className={`ai-dot ai-${ai}`} />
          <div>
            <div className="who">Sharon</div>
            <div className="org">Acme Test Corp · AI: {ai === 'devin' ? 'Devin live' : ai}</div>
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
    </div>
  );
}
