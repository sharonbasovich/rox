import { CAPTURED_AT, CLAIM_DEPENDENCIES, CLAIMS } from '../../shared/data.ts';
import { scoreLedger } from '../../shared/ledger.ts';
import { propagate } from '../../shared/propagate.ts';

export const SCORED_CLAIMS = propagate(scoreLedger(CLAIMS, CAPTURED_AT, 'openai.com'), CLAIM_DEPENDENCIES);
