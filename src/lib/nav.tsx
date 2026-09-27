import { BadgeCheck, Scale, ScrollText, type LucideIcon } from 'lucide-react';

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
];

export const NAV_GROUPS: NavItem[][] = [NAV.slice(0, 1), NAV.slice(1)];
