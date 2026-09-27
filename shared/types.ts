export type SourceTier = 'primary' | 'reputable' | 'aggregator' | 'unknown';

export interface Source {
  domain: string;
  title: string;
  publishedAt?: string;
}

export type ClaimKind = 'person' | 'financial' | 'event' | 'metric' | 'recommendation';

export interface Claim {
  id: string;
  text: string;
  kind: ClaimKind;
  /** A claim that a seller is likely to act on (who to email, what number to quote). */
  decisionCritical: boolean;
  sources: Source[];
  /** Which agent runs produced this claim (e.g. chat brief, account plan). */
  seenIn: string[];
  asOf?: string;
}

export type Confidence = 'high' | 'medium' | 'low';

export interface ScoredClaim extends Claim {
  confidence: Confidence;
  score: number;
  reasons: string[];
  tiers: SourceTier[];
}

export interface RecordField {
  key: string;
  label: string;
  value: string;
  source: string;
  lastUpdated?: string;
}

export type FieldIssueKind = 'conflict' | 'format' | 'missing' | 'unverified';

export interface FieldSuggestion {
  fieldKey: string;
  label: string;
  kind: FieldIssueKind;
  current: string;
  suggested: string;
  display: string;
  confidence: Confidence;
  rationale: string;
  evidenceClaimIds: string[];
}
