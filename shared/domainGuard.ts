export type DomainVerdict =
  | { ok: true; normalized: string }
  | { ok: false; normalized: string; reason: string; severity: 'block' | 'warn' };

const LABEL = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;
const TEST_TLDS = ['test', 'example', 'invalid', 'localhost', 'local', 'internal'];

function parseIPv4(host: string): number[] | null {
  const parts = host.split('.');
  if (parts.length !== 4 || !parts.every((p) => /^\d{1,3}$/.test(p))) return null;
  const nums = parts.map(Number);
  return nums.every((n) => n <= 255) ? nums : null;
}

function isPrivateIPv4([a, b]: number[]): string | null {
  if (a === 127) return 'loopback address';
  if (a === 10 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168)) return 'private network address';
  if (a === 169 && b === 254) return 'link-local / cloud metadata address';
  if (a === 0) return 'unspecified address';
  if (a === 100 && b >= 64 && b <= 127) return 'carrier-grade NAT address';
  return null;
}

/**
 * Validate a company domain before it is stored or handed to enrichment / web-fetch tools.
 * Anything that is not a public DNS name is rejected, so it can never become a fetch target.
 */
export function checkDomain(input: string): DomainVerdict {
  const raw = input.trim().toLowerCase();
  const normalized = raw
    .replace(/^[a-z]+:\/\//, '')
    .replace(/[/?#].*$/, '')
    .replace(/:\d+$/, '')
    .replace(/^www\./, '')
    .replace(/\.$/, '');

  if (!normalized) return { ok: false, normalized, reason: 'Empty domain', severity: 'block' };
  if (/^\[.*\]$/.test(normalized) || normalized.includes(':')) {
    return { ok: false, normalized, reason: 'IP literals are not company domains', severity: 'block' };
  }
  const ip = parseIPv4(normalized);
  if (ip) {
    const priv = isPrivateIPv4(ip);
    return {
      ok: false,
      normalized,
      reason: priv ? `Blocked ${priv}` : 'IP literals are not company domains',
      severity: 'block',
    };
  }
  if (/^\d+$/.test(normalized)) {
    return { ok: false, normalized, reason: 'Numeric host (possible encoded IP)', severity: 'block' };
  }
  const labels = normalized.split('.');
  if (labels.length < 2) return { ok: false, normalized, reason: 'Missing TLD', severity: 'block' };
  const bad = labels.find((l) => !LABEL.test(l));
  if (bad !== undefined) {
    return { ok: false, normalized, reason: `Invalid characters in "${bad}"`, severity: 'block' };
  }
  const tld = labels.at(-1) as string;
  if (/^\d+$/.test(tld)) return { ok: false, normalized, reason: 'Numeric TLD', severity: 'block' };
  if (TEST_TLDS.includes(tld)) {
    return { ok: false, normalized, reason: `Reserved TLD ".${tld}"`, severity: 'warn' };
  }
  return { ok: true, normalized };
}
