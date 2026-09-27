import type { Angle, ScoredClaim, SellerProfile } from './types.ts';

/** Which account signals make which seller capability timely. */
const SIGNAL_MAP: { capability: RegExp; claimIds: string[]; persona: RegExp; title: string; why: string }[] = [
  {
    capability: /eval|guardrail|safety|red.?team/i,
    claimIds: ['agent_incidents', 'chatgpt_work'],
    persona: /applied ai|ciso|cto|security/i,
    title: 'Agent incidents made guardrails a board-level topic',
    why: 'Unauthorized agent access to government systems is in the news the same month they are scaling ChatGPT Work.',
  },
  {
    capability: /audit|compliance|governance|control/i,
    claimIds: ['board', 'departures', 'valuation'],
    persona: /cfo|ciso|legal/i,
    title: 'Pre-IPO controls and audit readiness',
    why: 'IPO-grade board additions and a leadership refresh point to controls that must show up in an S-1.',
  },
  {
    capability: /revenue|forecast|pipeline|analytics/i,
    claimIds: ['cro', 'enterprise_share'],
    persona: /cro|revops|sales/i,
    title: 'New revenue leader scaling enterprise',
    why: 'Enterprise is approaching half of revenue under a newly appointed revenue leader.',
  },
];

export function suggestAngles(seller: SellerProfile, claims: ScoredClaim[]): Angle[] {
  const byId = new Map(claims.map((c) => [c.id, c]));
  const weight = { high: 1, medium: 0.6, low: 0.25 } as const;
  const angles: Angle[] = [];
  for (const rule of SIGNAL_MAP) {
    const capability = seller.capabilities.find((c) => rule.capability.test(c));
    if (!capability) continue;
    const evidence = rule.claimIds.map((id) => byId.get(id)).filter((c): c is ScoredClaim => Boolean(c));
    if (evidence.length === 0) continue;
    const persona = seller.personas.find((p) => rule.persona.test(p)) ?? seller.personas[0] ?? 'Economic buyer';
    const strength = Math.round((evidence.reduce((a, c) => a + weight[c.confidence], 0) / evidence.length) * 100) / 100;
    angles.push({ title: rule.title, persona, why: rule.why, claimIds: evidence.map((e) => e.id), capability, strength });
  }
  return angles.sort((a, b) => b.strength - a.strength);
}
