import { BadgeCheck, Building2, FlaskConical, Scale, ScrollText, ShieldCheck, Sparkles, type LucideIcon } from 'lucide-react';

export interface NavItem {
  to: string;
  label: string;
  Icon: LucideIcon;
  hue: string;
}

export const NAV: NavItem[] = [
  { to: '/findings', label: 'Findings', Icon: ScrollText, hue: '#c28f01' },
  { to: '/account', label: 'Truth-Check', Icon: Scale, hue: '#e65198' },
  { to: '/ledger', label: 'Evidence Ledger', Icon: BadgeCheck, hue: '#2f7de1' },
  { to: '/seller', label: 'Seller Context', Icon: Sparkles, hue: '#8b5cf6' },
  { to: '/dry-run', label: 'Agent Dry Run', Icon: FlaskConical, hue: '#0f9f6e' },
  { to: '/evals', label: 'Eval Console', Icon: ShieldCheck, hue: '#e0702b' },
  { to: '/accounts', label: 'Domain Guardrails', Icon: Building2, hue: '#e65198' },
];

export const NAV_GROUPS: NavItem[][] = [NAV.slice(0, 1), NAV.slice(1)];
