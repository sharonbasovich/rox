import { describe, expect, it } from 'vitest';
import { checkDomain } from '../shared/domainGuard.ts';

describe('checkDomain', () => {
  it.each(['openai.com', 'https://www.OpenAI.com/about', 'sub.example.co.uk'])('accepts %s', (d) => {
    expect(checkDomain(d).ok).toBe(true);
  });

  it('normalizes scheme, www, path and port', () => {
    expect(checkDomain('https://www.openai.com:443/x?y').normalized).toBe('openai.com');
  });

  it.each([
    ['127.0.0.1', 'loopback'],
    ['169.254.169.254', 'metadata'],
    ['10.0.0.5', 'private'],
    ["a'b.example", 'Invalid characters'],
    ['localhost', 'Missing TLD'],
    ['2130706433', 'Numeric host'],
    ['[::1]', 'IP literals'],
    ['8.8.8.8', 'IP literals'],
  ])('blocks %s', (d, reason) => {
    const v = checkDomain(d);
    expect(v.ok).toBe(false);
    if (!v.ok) {
      expect(v.severity).toBe('block');
      expect(v.reason).toContain(reason);
    }
  });

  it('warns on reserved test TLDs', () => {
    const v = checkDomain('normaltest.example');
    expect(v.ok).toBe(false);
    if (!v.ok) expect(v.severity).toBe('warn');
  });
});
