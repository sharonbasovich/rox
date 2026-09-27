export interface DevinSession {
  sessionId: string;
  url: string;
}

export interface DevinSessionState {
  status: string;
  structuredOutput: unknown;
}

const BASE = process.env.DEVIN_API_BASE ?? 'https://api.devin.ai/v1';

function headers(): Record<string, string> {
  const key = process.env.DEVIN_API_KEY;
  if (!key) throw new Error('DEVIN_API_KEY is not set');
  return { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' };
}

export function devinConfigured(): boolean {
  return Boolean(process.env.DEVIN_API_KEY);
}

export async function createSession(opts: {
  prompt: string;
  title: string;
  schema: object;
  maxAcu?: number;
}): Promise<DevinSession> {
  const res = await fetch(`${BASE}/sessions`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      prompt: opts.prompt,
      title: opts.title,
      structured_output_schema: opts.schema,
      max_acu_limit: opts.maxAcu ?? 2,
      tags: ['rox-prototype'],
      unlisted: true,
      idempotent: false,
    }),
  });
  if (!res.ok) throw new Error(`Devin create session failed: ${res.status} ${await res.text()}`);
  const body = (await res.json()) as { session_id: string; url: string };
  return { sessionId: body.session_id, url: body.url };
}

export async function getSession(sessionId: string): Promise<DevinSessionState> {
  const res = await fetch(`${BASE}/sessions/${encodeURIComponent(sessionId)}`, { headers: headers() });
  if (!res.ok) throw new Error(`Devin get session failed: ${res.status}`);
  const body = (await res.json()) as { status_enum?: string | null; status: string; structured_output?: unknown };
  return { status: body.status_enum ?? body.status, structuredOutput: body.structured_output ?? null };
}
