import { ChevronRight } from 'lucide-react';
import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import { useHealth } from './lib/api.ts';
import { NAV } from './lib/nav.tsx';
import Findings from './pages/Findings.tsx';
import Account from './pages/Account.tsx';
import Ledger from './pages/Ledger.tsx';

function RoxLogo() {
  return (
    <span className="logo">
      <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
        <path d="M12 1.5c.5 5.6 4.9 10 10.5 10.5-5.6.5-10 4.9-10.5 10.5C11.5 16.9 7.1 12.5 1.5 12 7.1 11.5 11.5 7.1 12 1.5z" fill="#87827d" />
      </svg>
      <span className="wordmark">ROX</span>
      <span className="labs">Labs</span>
    </span>
  );
}

export default function App() {
  const ai = useHealth();
  const aiLabel = ai === 'devin' ? 'Devin live' : ai === 'recorded' ? 'Recorded outputs' : 'Offline';
  return (
    <div className="site">
      <div className="announce">
        Rox Labs: keeping agent research and the record in sync <ChevronRight size={14} />
      </div>
      <header className="topnav">
        <div className="topnav-in">
          <NavLink to="/findings" className="logo-link"><RoxLogo /></NavLink>
          <nav className="links">
            {NAV.map(({ to, label }) => (
              <NavLink key={to} to={to} className={({ isActive }) => (isActive ? 'link active' : 'link')}>{label}</NavLink>
            ))}
          </nav>
          <div className="nav-cta">
            <span className={`ai-status ai-${ai}`}><span className="ai-dot" />{aiLabel}</span>
            <NavLink to="/ledger" className="btn-sq dark">Try it</NavLink>
          </div>
        </div>
      </header>
      <main className="frame">
        <Routes>
          <Route path="/" element={<Navigate to="/findings" replace />} />
          <Route path="/findings" element={<Findings />} />
          <Route path="/account" element={<Account />} />
          <Route path="/ledger" element={<Ledger />} />
        </Routes>
      </main>
      <footer className="footer">
        <div className="footer-in">
          <div>
            <RoxLogo />
            <p className="fine">Prototype built on a test workspace (Acme Test Corp). Agent outputs are for review before any action is taken.</p>
          </div>
          <div className="footer-cols">
            <div>
              <div className="fh">Prototypes</div>
              {NAV.slice(1).map((n) => <NavLink key={n.to} to={n.to}>{n.label}</NavLink>)}
            </div>
            <div>
              <div className="fh">Review</div>
              <NavLink to="/findings">Findings</NavLink>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
