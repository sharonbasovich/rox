import type { Source, SourceTier } from './types.ts';

const PRIMARY = ['openai.com', 'sec.gov', 'investor.', 'ir.'];
const REPUTABLE = [
  'cnbc.com', 'techcrunch.com', 'axios.com', 'computerworld.com', 'aljazeera.com',
  'thenewstack.io', 'reuters.com', 'bloomberg.com', 'wsj.com', 'ft.com', 'theinformation.com',
];

export function sourceTier(source: Source, accountDomain?: string): SourceTier {
  const d = source.domain.toLowerCase().replace(/^www\./, '');
  if (accountDomain && (d === accountDomain || d.endsWith(`.${accountDomain}`))) return 'primary';
  if (PRIMARY.some((p) => d === p || d.startsWith(p) || d.endsWith(`.${p}`))) return 'primary';
  if (REPUTABLE.includes(d)) return 'reputable';
  if (d.length > 0) return 'aggregator';
  return 'unknown';
}

export const TIER_WEIGHT: Record<SourceTier, number> = {
  primary: 1,
  reputable: 0.75,
  aggregator: 0.3,
  unknown: 0.1,
};

export const TIER_LABEL: Record<SourceTier, string> = {
  primary: 'Primary',
  reputable: 'Reputable press',
  aggregator: 'Aggregator / blog',
  unknown: 'Unknown',
};
